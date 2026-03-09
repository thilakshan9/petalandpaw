from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import httpx
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Stripe
from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest
)
stripe_api_key = os.environ.get('STRIPE_API_KEY')

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ============================================================
# MODELS
# ============================================================

class ProductCreate(BaseModel):
    name: str
    slug: str
    description: str
    price: float
    category: str
    image_url: str
    images: List[str] = []
    pet_safe: bool = True
    pet_safe_details: str = ""
    in_stock: bool = True
    featured: bool = False

class BlogPostCreate(BaseModel):
    title: str
    slug: str
    excerpt: str
    content: str
    image_url: str
    author: str = "Petal & Paw"
    published: bool = True

class OrderItem(BaseModel):
    product_id: str
    name: str
    price: float
    quantity: int
    image_url: str = ""

class CheckoutRequest(BaseModel):
    items: List[OrderItem]
    origin_url: str
    customer_email: str = ""
    order_type: str = "regular"

class SubscriptionCheckoutRequest(BaseModel):
    plan_id: str
    origin_url: str
    customer_email: str = ""

class BouquetSaveRequest(BaseModel):
    flowers: List[Dict]
    origin_url: str = ""

# ============================================================
# AUTH HELPERS
# ============================================================

async def get_current_user(request: Request):
    session_token = request.cookies.get("session_token")
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ")[1]
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    session_doc = await db.user_sessions.find_one(
        {"session_token": session_token}, {"_id": 0}
    )
    if not session_doc:
        raise HTTPException(status_code=401, detail="Invalid session")

    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")

    user_doc = await db.users.find_one(
        {"user_id": session_doc["user_id"]}, {"_id": 0}
    )
    if not user_doc:
        raise HTTPException(status_code=401, detail="User not found")
    return user_doc

# ============================================================
# AUTH ROUTES
# ============================================================

@api_router.post("/auth/session")
async def exchange_session(request: Request, response: Response):
    body = await request.json()
    session_id = body.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")

    async with httpx.AsyncClient() as http_client:
        resp = await http_client.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id}
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid session")
        user_data = resp.json()

    user_id = f"user_{uuid.uuid4().hex[:12]}"
    existing_user = await db.users.find_one({"email": user_data["email"]}, {"_id": 0})

    if existing_user:
        user_id = existing_user["user_id"]
        await db.users.update_one(
            {"email": user_data["email"]},
            {"$set": {"name": user_data["name"], "picture": user_data["picture"],
                      "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
    else:
        await db.users.insert_one({
            "user_id": user_id,
            "email": user_data["email"],
            "name": user_data["name"],
            "picture": user_data["picture"],
            "is_admin": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        })

    session_token = user_data.get("session_token", f"session_{uuid.uuid4().hex}")
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)

    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })

    response.set_cookie(
        key="session_token", value=session_token,
        httponly=True, secure=True, samesite="none", path="/",
        max_age=7 * 24 * 60 * 60
    )

    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    return user_doc

@api_router.get("/auth/me")
async def get_me(user=Depends(get_current_user)):
    return user

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    response.delete_cookie(key="session_token", path="/", secure=True, samesite="none")
    return {"message": "Logged out"}

# ============================================================
# PRODUCT ROUTES
# ============================================================

@api_router.get("/products")
async def get_products(category: Optional[str] = None, featured: Optional[bool] = None):
    query = {}
    if category:
        query["category"] = category
    if featured is not None:
        query["featured"] = featured
    products = await db.products.find(query, {"_id": 0}).to_list(100)
    return products

@api_router.get("/products/{slug}")
async def get_product(slug: str):
    product = await db.products.find_one({"slug": slug}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@api_router.post("/products")
async def create_product(product_data: ProductCreate, user=Depends(get_current_user)):
    doc = product_data.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.products.insert_one(doc)
    return await db.products.find_one({"id": doc["id"]}, {"_id": 0})

@api_router.put("/products/{product_id}")
async def update_product(product_id: str, product_data: dict, user=Depends(get_current_user)):
    product_data.pop("_id", None)
    product_data.pop("id", None)
    product_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.products.update_one({"id": product_id}, {"$set": product_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return await db.products.find_one({"id": product_id}, {"_id": 0})

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, user=Depends(get_current_user)):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted"}

# ============================================================
# BLOG ROUTES
# ============================================================

@api_router.get("/blog")
async def get_blog_posts(published: Optional[bool] = None):
    query = {}
    if published is not None:
        query["published"] = published
    posts = await db.blog_posts.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return posts

@api_router.get("/blog/{slug}")
async def get_blog_post(slug: str):
    post = await db.blog_posts.find_one({"slug": slug}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post

@api_router.post("/blog")
async def create_blog_post(post_data: BlogPostCreate, user=Depends(get_current_user)):
    doc = post_data.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    doc["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.blog_posts.insert_one(doc)
    return await db.blog_posts.find_one({"id": doc["id"]}, {"_id": 0})

@api_router.put("/blog/{post_id}")
async def update_blog_post(post_id: str, post_data: dict, user=Depends(get_current_user)):
    post_data.pop("_id", None)
    post_data.pop("id", None)
    post_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.blog_posts.update_one({"id": post_id}, {"$set": post_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    return await db.blog_posts.find_one({"id": post_id}, {"_id": 0})

@api_router.delete("/blog/{post_id}")
async def delete_blog_post(post_id: str, user=Depends(get_current_user)):
    result = await db.blog_posts.delete_one({"id": post_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"message": "Post deleted"}

# ============================================================
# SUBSCRIPTION ROUTES
# ============================================================

@api_router.get("/subscriptions/plans")
async def get_subscription_plans():
    plans = await db.subscription_plans.find({}, {"_id": 0}).to_list(10)
    return plans

@api_router.post("/subscriptions/checkout")
async def subscription_checkout(req: SubscriptionCheckoutRequest, request: Request):
    plan = await db.subscription_plans.find_one({"id": req.plan_id}, {"_id": 0})
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    host_url = str(request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)

    success_url = f"{req.origin_url}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{req.origin_url}/subscriptions"

    checkout_req = CheckoutSessionRequest(
        amount=float(plan["price"]),
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={"type": "subscription", "plan_id": plan["id"], "plan_name": plan["name"], "frequency": plan["frequency"]}
    )

    session = await stripe_checkout.create_checkout_session(checkout_req)

    await db.payment_transactions.insert_one({
        "id": str(uuid.uuid4()), "session_id": session.session_id,
        "amount": float(plan["price"]), "currency": "usd",
        "status": "initiated", "payment_status": "pending",
        "metadata": {"type": "subscription", "plan_id": plan["id"], "plan_name": plan["name"]},
        "created_at": datetime.now(timezone.utc).isoformat()
    })

    return {"url": session.url, "session_id": session.session_id}

# ============================================================
# BOUQUET BUILDER ROUTES
# ============================================================

@api_router.get("/bouquet/flowers")
async def get_bouquet_flowers():
    flowers = await db.bouquet_flowers.find({}, {"_id": 0}).to_list(50)
    return flowers

@api_router.post("/bouquet/save")
async def save_bouquet(req: BouquetSaveRequest):
    total_price = sum(f.get("price", 0) * f.get("quantity", 1) for f in req.flowers)
    bouquet_id = str(uuid.uuid4())
    bouquet = {
        "id": bouquet_id, "flowers": req.flowers,
        "total_price": round(total_price, 2),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.saved_bouquets.insert_one(bouquet)
    return {"id": bouquet_id, "flowers": req.flowers, "total_price": round(total_price, 2), "name": "Custom Bouquet"}

# ============================================================
# CHECKOUT / ORDER ROUTES
# ============================================================

@api_router.post("/orders/checkout")
async def create_checkout(req: CheckoutRequest, request: Request):
    total = 0.0
    validated_items = []

    for item in req.items:
        if item.product_id.startswith("bouquet_"):
            bouquet = await db.saved_bouquets.find_one({"id": item.product_id.replace("bouquet_", "")}, {"_id": 0})
            if bouquet:
                validated_items.append({"product_id": item.product_id, "name": "Custom Bouquet",
                    "price": float(bouquet["total_price"]), "quantity": item.quantity, "image_url": ""})
                total += float(bouquet["total_price"]) * item.quantity
        else:
            product = await db.products.find_one({"id": item.product_id}, {"_id": 0})
            if product:
                validated_items.append({"product_id": product["id"], "name": product["name"],
                    "price": float(product["price"]), "quantity": item.quantity, "image_url": product.get("image_url", "")})
                total += float(product["price"]) * item.quantity
            else:
                plan = await db.subscription_plans.find_one({"id": item.product_id}, {"_id": 0})
                if plan:
                    validated_items.append({"product_id": plan["id"], "name": plan["name"],
                        "price": float(plan["price"]), "quantity": item.quantity, "image_url": plan.get("image_url", "")})
                    total += float(plan["price"]) * item.quantity

    if not validated_items:
        raise HTTPException(status_code=400, detail="No valid items in cart")

    host_url = str(request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)

    success_url = f"{req.origin_url}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{req.origin_url}/cart"

    order_id = str(uuid.uuid4())
    checkout_req = CheckoutSessionRequest(
        amount=float(total), currency="usd",
        success_url=success_url, cancel_url=cancel_url,
        metadata={"order_id": order_id, "order_type": req.order_type, "item_count": str(len(validated_items))}
    )

    session = await stripe_checkout.create_checkout_session(checkout_req)

    await db.orders.insert_one({
        "id": order_id, "items": validated_items, "total": float(total),
        "status": "pending", "stripe_session_id": session.session_id,
        "customer_email": req.customer_email, "order_type": req.order_type,
        "created_at": datetime.now(timezone.utc).isoformat()
    })

    await db.payment_transactions.insert_one({
        "id": str(uuid.uuid4()), "session_id": session.session_id,
        "amount": float(total), "currency": "usd",
        "status": "initiated", "payment_status": "pending", "order_id": order_id,
        "metadata": {"order_type": req.order_type, "item_count": str(len(validated_items))},
        "created_at": datetime.now(timezone.utc).isoformat()
    })

    return {"url": session.url, "session_id": session.session_id, "order_id": order_id}

@api_router.get("/orders/status/{session_id}")
async def get_order_status(session_id: str, request: Request):
    host_url = str(request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)

    status = await stripe_checkout.get_checkout_status(session_id)

    update_data = {"status": status.status, "payment_status": status.payment_status,
                   "updated_at": datetime.now(timezone.utc).isoformat()}

    if status.payment_status == "paid":
        tx = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
        if tx and tx.get("payment_status") != "paid":
            await db.orders.update_one(
                {"stripe_session_id": session_id},
                {"$set": {"status": "confirmed", "updated_at": datetime.now(timezone.utc).isoformat()}}
            )

    await db.payment_transactions.update_one({"session_id": session_id}, {"$set": update_data})

    return {"status": status.status, "payment_status": status.payment_status,
            "amount_total": status.amount_total, "currency": status.currency}

@api_router.get("/orders")
async def get_orders(user=Depends(get_current_user)):
    orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return orders

# ============================================================
# STRIPE WEBHOOK
# ============================================================

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    try:
        host_url = str(request.base_url).rstrip("/")
        webhook_url = f"{host_url}/api/webhook/stripe"
        stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)
        webhook_response = await stripe_checkout.handle_webhook(body, signature)

        if webhook_response.payment_status == "paid":
            await db.payment_transactions.update_one(
                {"session_id": webhook_response.session_id},
                {"$set": {"status": "complete", "payment_status": "paid",
                          "updated_at": datetime.now(timezone.utc).isoformat()}}
            )
            await db.orders.update_one(
                {"stripe_session_id": webhook_response.session_id},
                {"$set": {"status": "confirmed", "updated_at": datetime.now(timezone.utc).isoformat()}}
            )
        return {"status": "ok"}
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        return {"status": "error"}

# ============================================================
# ADMIN ROUTES
# ============================================================

@api_router.get("/admin/stats")
async def get_admin_stats(user=Depends(get_current_user)):
    product_count = await db.products.count_documents({})
    order_count = await db.orders.count_documents({})
    blog_count = await db.blog_posts.count_documents({})
    paid_orders = await db.orders.find({"status": "confirmed"}, {"_id": 0, "total": 1}).to_list(1000)
    total_revenue = sum(o.get("total", 0) for o in paid_orders)
    return {"products": product_count, "orders": order_count, "blog_posts": blog_count, "revenue": round(total_revenue, 2)}

# ============================================================
# SEED DATA
# ============================================================

async def seed_data():
    if await db.products.count_documents({}) == 0:
        products = [
            {"id": str(uuid.uuid4()), "name": "Sunset Rose Bouquet", "slug": "sunset-rose-bouquet",
             "description": "A warm, hand-tied bouquet of pet-safe garden roses in soft peach and blush tones. Perfect for brightening any room while keeping your furry friends safe.",
             "price": 45.00, "category": "bouquet",
             "image_url": "https://images.unsplash.com/photo-1590419529505-dfa62e8263d1?w=800",
             "images": [], "pet_safe": True, "pet_safe_details": "All roses used are non-toxic to cats and dogs.",
             "in_stock": True, "featured": True, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Sunflower Meadow", "slug": "sunflower-meadow",
             "description": "Bright and cheerful sunflowers paired with pet-safe greenery. Brings the warmth of a summer meadow into your home.",
             "price": 38.00, "category": "bouquet",
             "image_url": "https://images.unsplash.com/photo-1709235555476-1f9aa04ec21c?w=800",
             "images": [], "pet_safe": True, "pet_safe_details": "Sunflowers are completely safe for all pets.",
             "in_stock": True, "featured": True, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Nordic Snapdragon Stems", "slug": "nordic-snapdragon-stems",
             "description": "Elegant snapdragon stems in muted pastels, arranged in our signature Scandinavian style.",
             "price": 32.00, "category": "single-stem",
             "image_url": "https://images.unsplash.com/photo-1661606247607-6fad2073a9ca?w=800",
             "images": [], "pet_safe": True, "pet_safe_details": "Snapdragons are non-toxic and safe for curious pets.",
             "in_stock": True, "featured": False, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Hygge Garden Arrangement", "slug": "hygge-garden-arrangement",
             "description": "A cozy table arrangement featuring pet-safe roses, gerbera daisies, and lush greenery.",
             "price": 58.00, "category": "arrangement",
             "image_url": "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=800",
             "images": [], "pet_safe": True, "pet_safe_details": "Every stem verified pet-safe.",
             "in_stock": True, "featured": True, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Spring Zinnia Mix", "slug": "spring-zinnia-mix",
             "description": "Vibrant zinnias in a rainbow of colors. Hardy, pet-safe blooms that last beautifully.",
             "price": 28.00, "category": "bouquet",
             "image_url": "https://images.unsplash.com/photo-1707566416738-97f0e0d9300b?w=800",
             "images": [], "pet_safe": True, "pet_safe_details": "Zinnias are completely non-toxic to cats, dogs, and horses.",
             "in_stock": True, "featured": False, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Gerbera Daisy Collection", "slug": "gerbera-daisy-collection",
             "description": "Bold and beautiful gerbera daisies in warm tones. A cheerful, pet-friendly addition.",
             "price": 35.00, "category": "single-stem",
             "image_url": "https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=800",
             "images": [], "pet_safe": True, "pet_safe_details": "Gerbera daisies are safe for all household pets.",
             "in_stock": True, "featured": False, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Petunia Pastel Pot", "slug": "petunia-pastel-pot",
             "description": "Soft pastel petunias in a handcrafted ceramic pot. Safe for your entire family, pets included.",
             "price": 42.00, "category": "arrangement",
             "image_url": "https://images.unsplash.com/photo-1595517710498-0ff10ea35854?w=800",
             "images": [], "pet_safe": True, "pet_safe_details": "Petunias are non-toxic to dogs and cats.",
             "in_stock": True, "featured": True, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Orchid Elegance", "slug": "orchid-elegance",
             "description": "A single statement orchid in a minimalist pot. Pet-safe luxury for the modern home.",
             "price": 55.00, "category": "single-stem",
             "image_url": "https://images.unsplash.com/photo-1567748534269-7baa4e2f8640?w=800",
             "images": [], "pet_safe": True, "pet_safe_details": "Phalaenopsis orchids are safe for cats and dogs.",
             "in_stock": True, "featured": False, "created_at": datetime.now(timezone.utc).isoformat()},
        ]
        await db.products.insert_many(products)
        logger.info("Seeded products")

    if await db.subscription_plans.count_documents({}) == 0:
        plans = [
            {"id": str(uuid.uuid4()), "name": "Weekly Blooms", "slug": "weekly-blooms",
             "description": "Fresh, pet-safe seasonal flowers delivered every week.",
             "price": 34.99, "frequency": "weekly",
             "image_url": "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=800",
             "features": ["Fresh seasonal arrangement weekly", "100% pet-safe guaranteed", "Free delivery", "Biodegradable packaging", "Care guide included"]},
            {"id": str(uuid.uuid4()), "name": "Bi-Weekly Bouquet", "slug": "bi-weekly-bouquet",
             "description": "A curated premium bouquet every two weeks.",
             "price": 44.99, "frequency": "biweekly",
             "image_url": "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=800",
             "features": ["Premium curated bouquet bi-weekly", "100% pet-safe guaranteed", "Free delivery", "Seasonal variety", "Complimentary vase on first order", "Care guide included"]},
            {"id": str(uuid.uuid4()), "name": "Monthly Arrangement", "slug": "monthly-arrangement",
             "description": "Our most luxurious option with a stunning large arrangement monthly.",
             "price": 59.99, "frequency": "monthly",
             "image_url": "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=800",
             "features": ["Luxury designer arrangement monthly", "100% pet-safe guaranteed", "Free priority delivery", "Premium ceramic vase included", "Seasonal exclusive flowers", "Personalized care guide", "10% discount on shop purchases"]},
        ]
        await db.subscription_plans.insert_many(plans)
        logger.info("Seeded subscription plans")

    if await db.blog_posts.count_documents({}) == 0:
        posts = [
            {"id": str(uuid.uuid4()), "title": "Pet-Safe Flowers: The Complete Guide", "slug": "pet-safe-flowers-complete-guide",
             "excerpt": "Not all flowers are safe for your furry friends. Here's everything you need to know about choosing pet-friendly blooms.",
             "content": "<h2>Why Pet-Safe Flowers Matter</h2><p>As pet owners, we want our homes to be beautiful and safe. Many popular flowers like lilies, tulips, and daffodils can be toxic to cats and dogs. At Petal & Paw, we've curated only the safest, most beautiful flowers for homes with pets.</p><h2>Safe Flowers for Your Home</h2><ul><li><strong>Roses</strong> - Classic beauty without the danger.</li><li><strong>Sunflowers</strong> - Bright, cheerful, and completely safe.</li><li><strong>Gerbera Daisies</strong> - Colorful and non-toxic.</li><li><strong>Snapdragons</strong> - Elegant and completely pet-safe.</li><li><strong>Zinnias</strong> - Hardy, colorful, and safe for curious noses.</li><li><strong>Orchids</strong> - Luxurious and safe for cats and dogs.</li></ul><h2>Flowers to Avoid</h2><p>Some common toxic flowers include lilies (especially dangerous for cats), tulips, daffodils, azaleas, and chrysanthemums. Always check before bringing new flowers home.</p>",
             "image_url": "https://images.unsplash.com/photo-1548724582-1216ec5351ce?w=800",
             "author": "Dr. Sarah Chen", "published": True,
             "created_at": datetime.now(timezone.utc).isoformat(), "updated_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "title": "Scandinavian Flower Arranging for Beginners", "slug": "scandinavian-flower-arranging-beginners",
             "excerpt": "Learn the art of minimal, elegant flower arrangement inspired by Scandinavian design principles.",
             "content": "<h2>The Art of Nordic Simplicity</h2><p>Scandinavian design is about simplicity, functionality, and connection with nature. A single stem in a beautiful vase can be more impactful than a dozen flowers.</p><h2>Key Principles</h2><ul><li><strong>Less is more</strong> - Let each bloom speak for itself.</li><li><strong>Natural materials</strong> - Choose ceramic, glass, or wooden vessels.</li><li><strong>Muted tones</strong> - Favor soft pastels, whites, and greens.</li><li><strong>Asymmetry</strong> - Embrace natural growth patterns.</li></ul><h2>Getting Started</h2><p>Start with a single type of flower in an odd number. Choose a simple vessel. Place where natural light plays with the petals.</p>",
             "image_url": "https://images.unsplash.com/photo-1738748986758-ed7bb4c47793?w=800",
             "author": "Emma Lindstrom", "published": True,
             "created_at": datetime.now(timezone.utc).isoformat(), "updated_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "title": "Why Sustainable Packaging Matters", "slug": "sustainable-packaging-matters",
             "excerpt": "Our commitment to the planet goes beyond pet-safe flowers. Learn about our eco-friendly practices.",
             "content": "<h2>Our Packaging Promise</h2><p>At Petal & Paw, sustainability is woven into everything we do. From sourcing to delivery, we minimize our environmental impact.</p><h2>What We Use</h2><ul><li><strong>Recycled cardboard boxes</strong> - 100% recycled and fully recyclable.</li><li><strong>Biodegradable wrapping</strong> - Plant-based cellophane that composts naturally.</li><li><strong>Water tubes</strong> - Keep stems fresh without wasteful foam.</li><li><strong>Soy-based inks</strong> - Eco-friendly printed materials.</li></ul><h2>Join the Movement</h2><p>By choosing Petal & Paw, you're supporting sustainable practices and protecting our planet.</p>",
             "image_url": "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800",
             "author": "Petal & Paw Team", "published": True,
             "created_at": datetime.now(timezone.utc).isoformat(), "updated_at": datetime.now(timezone.utc).isoformat()},
        ]
        await db.blog_posts.insert_many(posts)
        logger.info("Seeded blog posts")

    if await db.bouquet_flowers.count_documents({}) == 0:
        flowers = [
            {"id": str(uuid.uuid4()), "name": "Garden Rose", "color": "#F4C2C2", "price": 5.50, "image_url": "https://images.unsplash.com/photo-1590419529505-dfa62e8263d1?w=400", "category": "flower"},
            {"id": str(uuid.uuid4()), "name": "Sunflower", "color": "#FFD700", "price": 4.00, "image_url": "https://images.unsplash.com/photo-1709235555476-1f9aa04ec21c?w=400", "category": "flower"},
            {"id": str(uuid.uuid4()), "name": "Snapdragon", "color": "#DDA0DD", "price": 3.50, "image_url": "https://images.unsplash.com/photo-1661606247607-6fad2073a9ca?w=400", "category": "flower"},
            {"id": str(uuid.uuid4()), "name": "Gerbera Daisy", "color": "#FF6347", "price": 4.50, "image_url": "https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=400", "category": "flower"},
            {"id": str(uuid.uuid4()), "name": "Petunia", "color": "#C8A2C8", "price": 3.00, "image_url": "https://images.unsplash.com/photo-1595517710498-0ff10ea35854?w=400", "category": "flower"},
            {"id": str(uuid.uuid4()), "name": "Orchid", "color": "#F5F5F5", "price": 7.00, "image_url": "https://images.unsplash.com/photo-1567748534269-7baa4e2f8640?w=400", "category": "flower"},
            {"id": str(uuid.uuid4()), "name": "Zinnia", "color": "#FF4500", "price": 3.50, "image_url": "https://images.unsplash.com/photo-1536091622320-a47da6e8c274?w=400", "category": "flower"},
            {"id": str(uuid.uuid4()), "name": "Marigold", "color": "#FF8C00", "price": 2.50, "image_url": "https://images.unsplash.com/photo-1580915411954-282cb1b0d780?w=400", "category": "flower"},
            {"id": str(uuid.uuid4()), "name": "Eucalyptus", "color": "#8DA399", "price": 3.00, "image_url": "https://images.unsplash.com/photo-1585160263924-46f1ac5a6aab?w=400", "category": "greenery"},
            {"id": str(uuid.uuid4()), "name": "Fern Leaf", "color": "#2E8B57", "price": 2.00, "image_url": "https://images.unsplash.com/photo-1525498128493-380d1990a112?w=400", "category": "greenery"},
            {"id": str(uuid.uuid4()), "name": "Baby's Breath", "color": "#FFFAF0", "price": 2.50, "image_url": "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=400", "category": "filler"},
        ]
        await db.bouquet_flowers.insert_many(flowers)
        logger.info("Seeded bouquet flowers")

# ============================================================
# APP SETUP
# ============================================================

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await seed_data()
    logger.info("Petal & Paw backend started")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
