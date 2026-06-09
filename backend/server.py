from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, BackgroundTasks
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import httpx
import random
import string
import bcrypt
import jwt as pyjwt
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
import stripe
stripe_api_key = os.environ.get('STRIPE_API_KEY')
stripe.api_key = stripe_api_key

# SendGrid (optional - works without key)
sendgrid_api_key = os.environ.get('SENDGRID_API_KEY')
sender_email = os.environ.get('SENDER_EMAIL', 'noreply@petalandpaw.com')

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
    meta_description: str = ""
    meta_keywords: str = ""

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
    delivery_date: str = ""
    referral_code: str = ""
    pet_notes: str = ""
    personalized_message: str = ""

class SubscriptionCheckoutRequest(BaseModel):
    plan_id: str
    origin_url: str
    customer_email: str = ""
    add_pet_toy: bool = False
    checkout_mode: str = "subscription"
    personalized_message: str = ""
    pet_type: str = ""
    pet_type_other: str = ""
    delivery_date: str = ""

class StepBouquetRequest(BaseModel):
    size: str  # small, medium, large
    flowers: List[Dict]  # [{id, name, quantity}]
    pet_type: str  # dog, cat, rabbit, other
    pet_type_other: str = ""
    add_pet_toy: bool = False

class ReferralApplyRequest(BaseModel):
    code: str

class ContactFormRequest(BaseModel):
    name: str
    email: str
    subject: str = ""
    message: str

class WorkshopCheckoutRequest(BaseModel):
    workshop_id: str
    workshop_name: str
    workshop_location: str
    workshop_address: str = ""
    workshop_date: str
    workshop_time: str
    price: float
    quantity: int = 1
    full_name: str
    customer_email: str
    notes: str = ""
    origin_url: str
    customer_id: str = ""

class RaffleCheckoutRequest(BaseModel):
    full_name: str
    email: str
    quantity: int = 1
    origin_url: str
    customer_id: str = ""

class VoucherCheckoutRequest(BaseModel):
    amount: float
    purchaser_name: str
    purchaser_email: str
    recipient_name: str = ""
    recipient_email: str = ""
    personal_message: str = ""
    origin_url: str

class VoucherRedeemItem(BaseModel):
    workshop_id: str
    workshop_name: str
    workshop_location: str
    workshop_address: str = ""
    workshop_date: str
    workshop_time: str
    price: float
    quantity: int = 1

class VoucherRedeemRequest(BaseModel):
    code: str
    items: List[VoucherRedeemItem]
    full_name: str
    customer_email: str
    notes: str = ""
    origin_url: str
    customer_id: str = ""

# ============================================================
# EMAIL HELPER (Resend)
# ============================================================

resend_api_key = os.environ.get('RESEND_API_KEY', '')

def _send_email(to_email: str, subject: str, html_content: str, reply_to: str = "", from_email: str = ""):
    if not resend_api_key:
        logger.info(f"[EMAIL NOT CONFIGURED] Would send to {to_email}: {subject}")
        return False
    try:
        import resend
        resend.api_key = resend_api_key
        params = {
            "from": from_email or "Petal & Paw <noreply@petalandpaw.co.uk>",
            "to": [to_email],
            "subject": subject,
            "html": html_content,
        }
        if reply_to:
            params["reply_to"] = reply_to
        resend.Emails.send(params)
        logger.info(f"Email sent to {to_email}: {subject}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email: {e}")
        return False

async def send_order_confirmation_email(to_email: str, order_data: dict):
    items_html = ""
    for item in order_data.get("items", []):
        items_html += f"<li>{item['name']} x{item['quantity']} - £{item['price'] * item['quantity']:.2f}</li>"
    html_content = f"""
    <div style="font-family: 'Helvetica', sans-serif; max-width: 600px; margin: 0 auto; background: #FAF9F6; padding: 40px;">
        <h1 style="font-family: serif; color: #2C2C2C; font-weight: 400;">Thank you for your order!</h1>
        <p style="color: #6B7280;">Your order has been confirmed and is being prepared with care.</p>
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #2C2C2C; font-weight: 500;">Order Summary</h3>
            <ul style="color: #4B5563; padding-left: 20px;">{items_html}</ul>
            <p style="font-size: 18px; color: #2C2C2C; border-top: 1px solid #E5E0D6; padding-top: 12px;">
                <strong>Total: £{order_data.get('total', 0):.2f}</strong>
            </p>
            {f'<p style="color: #8DA399;">Delivery date: {order_data.get("delivery_date", "")}</p>' if order_data.get("delivery_date") else ""}
        </div>
        <p style="color: #8DA399; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Petal & Paw - Pet-Safe Florals</p>
    </div>
    """
    return _send_email(to_email, "Your Petal & Paw Order Confirmation", html_content)

async def send_contact_form_email(name: str, email: str, subject: str, message: str, to_email: str = ""):
    contact_email = to_email or "contact@petalandpaw.co.uk"
    html_content = f"""
    <div style="font-family: 'Helvetica', sans-serif; max-width: 600px; margin: 0 auto; background: #FAF9F6; padding: 40px;">
        <h1 style="font-family: serif; color: #2C2C2C; font-weight: 400;">New Contact Form Message</h1>
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #6B7280; margin: 0 0 8px;"><strong>From:</strong> {name}</p>
            <p style="color: #6B7280; margin: 0 0 8px;"><strong>Email:</strong> <a href="mailto:{email}">{email}</a></p>
            <p style="color: #6B7280; margin: 0 0 8px;"><strong>Subject:</strong> {subject or 'No subject'}</p>
            <hr style="border: none; border-top: 1px solid #E5E0D6; margin: 16px 0;" />
            <p style="color: #4B5563; white-space: pre-wrap;">{message}</p>
        </div>
        <p style="color: #8DA399; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Petal & Paw - Contact Form</p>
    </div>
    """
    return _send_email(contact_email, f"[Petal & Paw] {subject or 'Contact Form Message'}", html_content, reply_to=email)

async def send_workshop_booking_emails(booking: dict):
    """Send confirmation to customer + notification to events@"""
    customer_email = booking.get("customer_email", "")
    full_name = booking.get("full_name", "")
    workshop_name = booking.get("workshop_name", "")
    workshop_location = booking.get("workshop_location", "")
    workshop_address = booking.get("workshop_address", "")
    workshop_date = booking.get("workshop_date", "")
    workshop_time = booking.get("workshop_time", "")
    price = booking.get("price", 0)
    notes = booking.get("notes", "")

    # Customer confirmation
    customer_html = f"""
    <div style="font-family: 'Helvetica', sans-serif; max-width: 600px; margin: 0 auto; background: #FAF9F6; padding: 40px;">
        <h1 style="font-family: serif; color: #2C2C2C; font-weight: 400;">Your Workshop Booking is Confirmed</h1>
        <p style="color: #6B7280;">Hi {full_name}, thank you for booking with Petal & Paw. We can't wait to see you!</p>
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #2C2C2C; font-weight: 500; margin-top: 0;">{workshop_name}</h3>
            <p style="color: #4B5563; margin: 4px 0;"><strong>Location:</strong> {workshop_location}</p>
            {f'<p style="color: #4B5563; margin: 4px 0;">{workshop_address}</p>' if workshop_address else ''}
            <p style="color: #4B5563; margin: 4px 0;"><strong>Date:</strong> {workshop_date}</p>
            <p style="color: #4B5563; margin: 4px 0;"><strong>Time:</strong> {workshop_time}</p>
            <p style="color: #4B5563; margin: 4px 0;"><strong>Amount Paid:</strong> £{price:.2f}</p>
            {f'<hr style="border: none; border-top: 1px solid #E5E0D6; margin: 16px 0;" /><p style="color: #6B7280; margin: 0;"><strong>Your notes:</strong></p><p style="color: #4B5563; white-space: pre-wrap;">{notes}</p>' if notes else ''}
        </div>
        <p style="color: #6B7280;">If you need to make any changes or have any questions, just reply to this email.</p>
        <p style="color: #8DA399; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Petal & Paw - Pet-Safe Florals</p>
    </div>
    """
    if customer_email:
        _send_email(customer_email, f"Workshop Booking Confirmed - {workshop_name}", customer_html, reply_to="events@petalandpaw.co.uk")

    # Internal events@ notification
    events_html = f"""
    <div style="font-family: 'Helvetica', sans-serif; max-width: 600px; margin: 0 auto; background: #FAF9F6; padding: 40px;">
        <h1 style="font-family: serif; color: #2C2C2C; font-weight: 400;">New Workshop Booking</h1>
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #6B7280; margin: 0 0 8px;"><strong>Workshop:</strong> {workshop_name}</p>
            <p style="color: #6B7280; margin: 0 0 8px;"><strong>Location:</strong> {workshop_location}</p>
            {f'<p style="color: #6B7280; margin: 0 0 8px;">{workshop_address}</p>' if workshop_address else ''}
            <p style="color: #6B7280; margin: 0 0 8px;"><strong>Date / Time:</strong> {workshop_date} at {workshop_time}</p>
            <p style="color: #6B7280; margin: 0 0 8px;"><strong>Amount Paid:</strong> £{price:.2f}</p>
            <hr style="border: none; border-top: 1px solid #E5E0D6; margin: 16px 0;" />
            <p style="color: #6B7280; margin: 0 0 8px;"><strong>Customer:</strong> {full_name}</p>
            <p style="color: #6B7280; margin: 0 0 8px;"><strong>Email:</strong> <a href="mailto:{customer_email}">{customer_email}</a></p>
            {f'<p style="color: #6B7280; margin: 0 0 8px;"><strong>Notes (dietary / access):</strong></p><p style="color: #4B5563; white-space: pre-wrap;">{notes}</p>' if notes else ''}
        </div>
        <p style="color: #8DA399; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Petal & Paw - Workshop Booking</p>
    </div>
    """
    _send_email("events@petalandpaw.co.uk", f"[Workshop Booking] {workshop_name} - {full_name}", events_html, reply_to=customer_email)

# ============================================================
# AUTH HELPERS
# ============================================================

JWT_SECRET = os.environ.get('JWT_SECRET', uuid.uuid4().hex + uuid.uuid4().hex)
JWT_ALGORITHM = "HS256"

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

def create_access_token(user_id: str, email: str) -> str:
    return pyjwt.encode({"sub": user_id, "email": email, "exp": datetime.now(timezone.utc) + timedelta(minutes=60), "type": "access"}, JWT_SECRET, algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    return pyjwt.encode({"sub": user_id, "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "refresh"}, JWT_SECRET, algorithm=JWT_ALGORITHM)

def generate_referral_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))

async def get_current_user(request: Request):
    session_token = request.cookies.get("session_token")
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ")[1]
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    session_doc = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
    if not session_doc:
        raise HTTPException(status_code=401, detail="Invalid session")
    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    user_doc = await db.users.find_one({"user_id": session_doc["user_id"]}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="User not found")
    return user_doc

async def get_optional_user(request: Request):
    try:
        return await get_current_user(request)
    except HTTPException:
        return None

async def get_customer(request: Request):
    """Get customer from JWT token (Authorization header)"""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = auth_header[7:]
    try:
        payload = pyjwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        customer = await db.customers.find_one({"id": payload["sub"]}, {"_id": 0})
        if not customer:
            raise HTTPException(status_code=401, detail="Customer not found")
        customer.pop("password_hash", None)
        return customer
    except pyjwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except pyjwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ============================================================
# AUTH ROUTES
# ============================================================

@api_router.post("/auth/session")
async def exchange_session(request: Request, response: Response):
    body = await request.json()
    session_id = body.get("session_id")
    login_type = body.get("login_type", "admin")  # "admin" or "customer"
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
            "user_id": user_id, "email": user_data["email"],
            "name": user_data["name"], "picture": user_data["picture"],
            "is_admin": login_type == "admin",
            "referral_code": generate_referral_code(),
            "credits": 0.0,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    session_token = user_data.get("session_token", f"session_{uuid.uuid4().hex}")
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    await db.user_sessions.insert_one({
        "user_id": user_id, "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    response.set_cookie(key="session_token", value=session_token,
        httponly=True, secure=True, samesite="none", path="/", max_age=7*24*60*60)
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
# CUSTOMER AUTH ROUTES
# ============================================================

class CustomerRegister(BaseModel):
    name: str
    email: str
    password: str

class CustomerLogin(BaseModel):
    email: str
    password: str

@api_router.post("/customer/register")
async def customer_register(req: CustomerRegister, response: Response):
    email = req.email.strip().lower()
    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="Invalid email address")
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    existing = await db.customers.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists")
    customer_id = str(uuid.uuid4())
    await db.customers.insert_one({
        "id": customer_id, "name": req.name.strip(), "email": email,
        "password_hash": hash_password(req.password),
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    token = create_access_token(customer_id, email)
    return {"id": customer_id, "name": req.name.strip(), "email": email, "token": token}

@api_router.post("/customer/login")
async def customer_login(req: CustomerLogin, response: Response):
    email = req.email.strip().lower()
    customer = await db.customers.find_one({"email": email}, {"_id": 0})
    if not customer or not verify_password(req.password, customer["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(customer["id"], email)
    return {"id": customer["id"], "name": customer["name"], "email": customer["email"], "token": token}

@api_router.get("/customer/me")
async def customer_me(customer=Depends(get_customer)):
    return customer

@api_router.post("/customer/logout")
async def customer_logout():
    return {"message": "Logged out"}

class ForgotPasswordRequest(BaseModel):
    email: str
    origin_url: str = ""

@api_router.post("/customer/forgot-password")
async def customer_forgot_password(req: ForgotPasswordRequest):
    """Send password reset link via email"""
    email = req.email.strip().lower()
    customer = await db.customers.find_one({"email": email}, {"_id": 0})
    if not customer:
        return {"message": "If an account exists with that email, you will receive a reset link."}
    reset_token = str(uuid.uuid4())
    await db.password_resets.insert_one({
        "token": reset_token, "customer_id": customer["id"], "email": email,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "used": False
    })
    reset_url = f"{req.origin_url}/reset-password?token={reset_token}"
    html_content = f"""
    <div style="font-family: 'Helvetica', sans-serif; max-width: 600px; margin: 0 auto; background: #FAF9F6; padding: 40px;">
        <h1 style="font-family: serif; color: #2C2C2C; font-weight: 400;">Reset Your Password</h1>
        <p style="color: #6B7280;">Click the link below to reset your password. This link expires in 1 hour.</p>
        <div style="margin: 24px 0;">
            <a href="{reset_url}" style="display: inline-block; background: #8DA399; color: white; text-decoration: none; padding: 14px 28px; border-radius: 50px; font-size: 13px; text-transform: uppercase; letter-spacing: 2px;">Reset Password</a>
        </div>
        <p style="color: #9CA3AF; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
        <p style="color: #8DA399; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-top: 24px;">Petal & Paw</p>
    </div>
    """
    _send_email(email, "Reset Your Petal & Paw Password", html_content)
    return {"message": "If an account exists with that email, you will receive a reset link."}

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

@api_router.post("/customer/reset-password")
async def customer_reset_password(req: ResetPasswordRequest):
    if len(req.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    reset = await db.password_resets.find_one({"token": req.token, "used": False}, {"_id": 0})
    if not reset:
        raise HTTPException(status_code=400, detail="Invalid or expired reset link")
    # Check if token is less than 1 hour old
    created = datetime.fromisoformat(reset["created_at"])
    if datetime.now(timezone.utc) - created > timedelta(hours=1):
        raise HTTPException(status_code=400, detail="Reset link has expired")
    await db.customers.update_one(
        {"id": reset["customer_id"]},
        {"$set": {"password_hash": hash_password(req.new_password)}}
    )
    await db.password_resets.update_one({"token": req.token}, {"$set": {"used": True}})
    return {"message": "Password reset successfully"}

@api_router.get("/customer/orders")
async def customer_orders(customer=Depends(get_customer)):
    """Get customer's past purchases and subscriptions from Stripe"""
    email = customer["email"]

    # Get payment transactions ONLY for this customer's email
    txs = await db.payment_transactions.find(
        {"customer_email": email}, {"_id": 0}
    ).sort("created_at", -1).to_list(100)

    # Update pending transactions by checking their Stripe session status
    updated_txs = []
    for tx in txs:
        if tx.get("payment_status") == "pending" and tx.get("session_id"):
            try:
                session = stripe.checkout.Session.retrieve(tx["session_id"])
                if session.payment_status == "paid" or session.status == "complete":
                    await db.payment_transactions.update_one(
                        {"session_id": tx["session_id"]},
                        {"$set": {"payment_status": "paid", "status": "complete"}}
                    )
                    tx["payment_status"] = "paid"
                    tx["status"] = "complete"
            except Exception:
                pass
        # Only include paid/completed transactions, exclude workshop bookings (shown separately)
        if tx.get("payment_status") == "paid" and tx.get("metadata", {}).get("type") != "workshop":
            updated_txs.append(tx)

    # Search Stripe for subscriptions - try multiple methods
    subscriptions = []
    found_sub_ids = set()
    try:
        # Method 1: Search by Stripe Customer object
        customers_list = stripe.Customer.list(email=email, limit=5)
        for stripe_cust in customers_list.data:
            subs = stripe.Subscription.list(customer=stripe_cust.id, limit=10)
            for sub in subs.data:
                if sub.id not in found_sub_ids:
                    found_sub_ids.add(sub.id)
                    subscriptions.append({
                        "id": sub.id,
                        "status": sub.status,
                        "current_period_end": sub.current_period_end,
                        "cancel_at_period_end": sub.cancel_at_period_end,
                        "plan_name": sub.metadata.get("plan_name", "Subscription"),
                        "amount": sub.items.data[0].price.unit_amount / 100 if sub.items.data else 0,
                        "currency": sub.items.data[0].price.currency if sub.items.data else "gbp",
                    })

        # Method 2: Check subscription-type transactions in our DB and look up their Stripe sessions
        if not subscriptions:
            sub_txs = await db.payment_transactions.find(
                {"metadata.type": "subscription", "customer_email": email}, {"_id": 0}
            ).to_list(20)
            for stx in sub_txs:
                try:
                    session = stripe.checkout.Session.retrieve(stx["session_id"])
                    if session.subscription:
                        sub = stripe.Subscription.retrieve(session.subscription)
                        if sub.id not in found_sub_ids:
                            found_sub_ids.add(sub.id)
                            subscriptions.append({
                                "id": sub.id,
                                "status": sub.status,
                                "current_period_end": sub.current_period_end,
                                "cancel_at_period_end": sub.cancel_at_period_end,
                                "plan_name": sub.metadata.get("plan_name", stx.get("metadata", {}).get("plan_name", "Subscription")),
                                "amount": sub.items.data[0].price.unit_amount / 100 if sub.items.data else 0,
                                "currency": sub.items.data[0].price.currency if sub.items.data else "gbp",
                            })
                except Exception:
                    pass
    except Exception as e:
        logger.error(f"Stripe subscription fetch error: {e}")

    # Workshop bookings (paid only) — surfaced separately in dashboard
    bookings = []
    try:
        booking_docs = await db.workshop_bookings.find(
            {"customer_email": email, "status": "paid"}, {"_id": 0}
        ).sort("created_at", -1).to_list(50)
        for b in booking_docs:
            bookings.append({
                "id": b.get("id"),
                "workshop_name": b.get("workshop_name", ""),
                "workshop_location": b.get("workshop_location", ""),
                "workshop_date": b.get("workshop_date", ""),
                "workshop_time": b.get("workshop_time", ""),
                "quantity": b.get("quantity", 1),
                "total": b.get("total", b.get("price", 0)),
                "status": b.get("status", "paid"),
                "created_at": b.get("created_at", ""),
            })
    except Exception as e:
        logger.error(f"Workshop bookings fetch error: {e}")

    return {"transactions": updated_txs, "subscriptions": subscriptions, "bookings": bookings}

@api_router.post("/customer/cancel-subscription/{sub_id}")
async def cancel_subscription(sub_id: str, customer=Depends(get_customer)):
    """Cancel a Stripe subscription at period end"""
    try:
        sub = stripe.Subscription.modify(sub_id, cancel_at_period_end=True)
        return {"status": "cancelled", "cancel_at_period_end": True, "current_period_end": sub.current_period_end}
    except Exception as e:
        logger.error(f"Subscription cancel error: {e}")
        raise HTTPException(status_code=500, detail="Could not cancel subscription")

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

@api_router.get("/products/search")
async def search_products(q: str = ""):
    if not q or len(q) < 2:
        return await db.products.find({}, {"_id": 0}).to_list(100)
    regex = {"$regex": q, "$options": "i"}
    query = {"$or": [{"name": regex}, {"description": regex}, {"category": regex}]}
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
# SUBSCRIPTION ROUTES (Monthly only with pet toy option)
# ============================================================

@api_router.get("/subscriptions/plans")
async def get_subscription_plans():
    plans = await db.subscription_plans.find({}, {"_id": 0}).to_list(10)
    order = {"petite-paws": 0, "classic-bloom": 1, "grand-garden": 2}
    plans.sort(key=lambda p: order.get(p.get("slug", ""), 99))
    return plans

@api_router.get("/subscriptions/debug")
async def debug_subscription_plans():
    """Debug endpoint to check plan data in the database"""
    plans = await db.subscription_plans.find({}, {"_id": 0}).to_list(10)
    return {"plan_count": len(plans), "plans": [{"name": p.get("name"), "slug": p.get("slug"), "price": p.get("price"), "pet_toy_price": p.get("pet_toy_price"), "features": p.get("features")} for p in plans]}

@api_router.get("/subscriptions/order-count/{plan_slug}")
async def get_subscription_order_count(plan_slug: str):
    if plan_slug == "all":
        count = await db.payment_transactions.count_documents({"payment_status": "paid"})
        return {"count": count, "limit": 60}
    plan = await db.subscription_plans.find_one({"slug": plan_slug}, {"_id": 0})
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    count = await db.payment_transactions.count_documents({
        "metadata.plan_id": plan["id"],
        "payment_status": "paid"
    })
    stock_limit = plan.get("stock_limit", 0)
    return {"count": count, "limit": stock_limit}

@api_router.post("/subscriptions/checkout")
async def subscription_checkout(req: SubscriptionCheckoutRequest, request: Request):
    plan = await db.subscription_plans.find_one({"id": req.plan_id}, {"_id": 0})
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    # Validate delivery date (must be at least 3 days from today) — server-side safeguard
    if req.delivery_date:
        try:
            from datetime import date
            picked = datetime.strptime(req.delivery_date, "%Y-%m-%d").date()
            min_date = date.today() + timedelta(days=3)
            if picked < min_date:
                raise HTTPException(status_code=400, detail=f"Delivery date must be on or after {min_date.isoformat()} (3 days from today).")
        except HTTPException:
            raise
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid delivery date format")
    total = float(plan.get("price", 0))
    if total < 0.30:
        logger.error(f"Plan price too low: {plan.get('name')} = £{total}. Plan data: {plan}")
        raise HTTPException(status_code=400, detail=f"Plan price (£{total:.2f}) is below Stripe minimum (£0.30). Please check plan configuration.")
    pet_toy_price = float(plan.get("pet_toy_price", 8.99))
    if req.add_pet_toy:
        total += pet_toy_price
    host_url = str(request.base_url).rstrip("/")
    success_url = f"{req.origin_url}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{req.origin_url}/subscriptions"
    try:
        is_recurring = req.checkout_mode == "subscription"
        price_data = {
            "currency": "gbp",
            "unit_amount": int(total * 100),
            "product_data": {"name": plan["name"]},
        }
        if is_recurring:
            price_data["recurring"] = {"interval": "month"}

        order_metadata = {
            "type": req.checkout_mode, "plan_id": plan["id"], "plan_name": plan["name"],
            "add_pet_toy": str(req.add_pet_toy),
            "personalized_message": req.personalized_message[:500] if req.personalized_message else "",
            "pet_type": req.pet_type_other if req.pet_type == "other" else req.pet_type,
            "preferred_delivery_date": req.delivery_date or "",
        }

        checkout_params = {
            "payment_method_types": ["card"],
            "line_items": [{"price_data": price_data, "quantity": 1}],
            "mode": "subscription" if is_recurring else "payment",
            "success_url": success_url,
            "cancel_url": cancel_url,
            "shipping_address_collection": {"allowed_countries": ["GB"]},
            "metadata": order_metadata,
        }
        if is_recurring:
            checkout_params["subscription_data"] = {"metadata": order_metadata}
        else:
            pid = {"metadata": order_metadata}
            if req.customer_email:
                pid["receipt_email"] = req.customer_email
            checkout_params["payment_intent_data"] = pid
        if req.customer_email:
            try:
                existing = stripe.Customer.list(email=req.customer_email, limit=1)
                if existing.data:
                    checkout_params["customer"] = existing.data[0].id
                else:
                    db_cust = await db.customers.find_one({"email": req.customer_email.strip().lower()}, {"_id": 0})
                    sc = stripe.Customer.create(email=req.customer_email, name=db_cust["name"] if db_cust else "")
                    checkout_params["customer"] = sc.id
            except Exception:
                checkout_params["customer_email"] = req.customer_email
        session = stripe.checkout.Session.create(**checkout_params)
    except stripe._error.AuthenticationError:
        raise HTTPException(status_code=503, detail="Payment service is not configured. Please contact support.")
    except Exception as e:
        logger.error(f"Stripe checkout error (mode={req.checkout_mode}): {type(e).__name__}: {e}")
        raise HTTPException(status_code=500, detail=f"Payment error: {str(e)}")
    await db.payment_transactions.insert_one({
        "id": str(uuid.uuid4()), "session_id": session.id,
        "amount": float(total), "currency": "gbp",
        "status": "initiated", "payment_status": "pending",
        "customer_email": req.customer_email,
        "metadata": {"type": req.checkout_mode, "plan_id": plan["id"],
                     "plan_name": plan["name"], "add_pet_toy": str(req.add_pet_toy),
                     "personalized_message": req.personalized_message[:500] if req.personalized_message else "",
                     "pet_type": req.pet_type_other if req.pet_type == "other" else req.pet_type,
                     "preferred_delivery_date": req.delivery_date or ""},
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    return {"url": session.url, "session_id": session.id}

# ============================================================
# BOUQUET BUILDER ROUTES (Step-based)
# ============================================================

@api_router.get("/bouquet/flowers")
async def get_bouquet_flowers():
    flowers = await db.bouquet_flowers.find({}, {"_id": 0}).to_list(50)
    return flowers

@api_router.get("/bouquet/sizes")
async def get_bouquet_sizes():
    return [
        {"id": "small", "name": "Petite Posy", "stems": "5-7 stems", "price": 25.00},
        {"id": "medium", "name": "Classic Bunch", "stems": "10-12 stems", "price": 38.00},
        {"id": "large", "name": "Grand Bouquet", "stems": "15-20 stems", "price": 52.00},
    ]

@api_router.post("/bouquet/save")
async def save_bouquet(req: StepBouquetRequest):
    sizes = {"small": 25.00, "medium": 38.00, "large": 52.00}
    base_price = sizes.get(req.size, 38.00)
    flower_cost = sum(f.get("price", 0) * f.get("quantity", 1) for f in req.flowers)
    pet_toy_cost = 8.99 if req.add_pet_toy else 0
    total_price = base_price + flower_cost + pet_toy_cost
    bouquet_id = str(uuid.uuid4())
    bouquet = {
        "id": bouquet_id, "size": req.size, "flowers": req.flowers,
        "pet_type": req.pet_type, "pet_type_other": req.pet_type_other,
        "add_pet_toy": req.add_pet_toy, "total_price": round(total_price, 2),
        "base_price": base_price, "flower_cost": round(flower_cost, 2),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.saved_bouquets.insert_one(bouquet)
    return {
        "id": bouquet_id, "size": req.size, "flowers": req.flowers,
        "pet_type": req.pet_type, "add_pet_toy": req.add_pet_toy,
        "total_price": round(total_price, 2), "name": "Custom Bouquet"
    }

# ============================================================
# CHECKOUT / ORDER ROUTES
# ============================================================

@api_router.post("/orders/checkout")
async def create_checkout(req: CheckoutRequest, request: Request, background_tasks: BackgroundTasks):
    total = 0.0
    validated_items = []
    for item in req.items:
        if item.product_id.startswith("bouquet_"):
            bouquet = await db.saved_bouquets.find_one(
                {"id": item.product_id.replace("bouquet_", "")}, {"_id": 0})
            if bouquet:
                validated_items.append({"product_id": item.product_id, "name": "Custom Bouquet",
                    "price": float(bouquet["total_price"]), "quantity": item.quantity, "image_url": ""})
                total += float(bouquet["total_price"]) * item.quantity
        else:
            product = await db.products.find_one({"id": item.product_id}, {"_id": 0})
            if product:
                validated_items.append({"product_id": product["id"], "name": product["name"],
                    "price": float(product["price"]), "quantity": item.quantity,
                    "image_url": product.get("image_url", "")})
                total += float(product["price"]) * item.quantity
            else:
                plan = await db.subscription_plans.find_one({"id": item.product_id}, {"_id": 0})
                if plan:
                    validated_items.append({"product_id": plan["id"], "name": plan["name"],
                        "price": float(plan["price"]), "quantity": item.quantity,
                        "image_url": plan.get("image_url", "")})
                    total += float(plan["price"]) * item.quantity
    if not validated_items:
        raise HTTPException(status_code=400, detail="No valid items in cart")

    # Apply referral credit
    credit_applied = 0.0
    if req.referral_code:
        referrer = await db.users.find_one({"referral_code": req.referral_code}, {"_id": 0})
        if referrer:
            credit_applied = min(10.0, total)
            total = max(0.01, total - credit_applied)

    host_url = str(request.base_url).rstrip("/")
    success_url = f"{req.origin_url}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{req.origin_url}/cart"
    order_id = str(uuid.uuid4())
    try:
        cart_metadata = {"order_id": order_id, "order_type": req.order_type,
                          "item_count": str(len(validated_items)),
                          "personalized_message": req.personalized_message[:500] if req.personalized_message else ""}
        pid = {"metadata": cart_metadata}
        if req.customer_email:
            pid["receipt_email"] = req.customer_email
        checkout_params = {
            "payment_method_types": ["card"],
            "line_items": [{"price_data": {"currency": "gbp", "unit_amount": int(total * 100),
                "product_data": {"name": f"Order {order_id[:8]}"}}, "quantity": 1}],
            "mode": "payment",
            "success_url": success_url,
            "cancel_url": cancel_url,
            "shipping_address_collection": {"allowed_countries": ["GB"]},
            "metadata": cart_metadata,
            "payment_intent_data": pid,
        }
        if req.customer_email:
            try:
                existing = stripe.Customer.list(email=req.customer_email, limit=1)
                if existing.data:
                    checkout_params["customer"] = existing.data[0].id
                else:
                    db_cust = await db.customers.find_one({"email": req.customer_email.strip().lower()}, {"_id": 0})
                    sc = stripe.Customer.create(email=req.customer_email, name=db_cust["name"] if db_cust else "")
                    checkout_params["customer"] = sc.id
            except Exception:
                checkout_params["customer_email"] = req.customer_email
        session = stripe.checkout.Session.create(**checkout_params)
    except stripe._error.AuthenticationError:
        raise HTTPException(status_code=503, detail="Payment service is not configured. Please contact support.")
    except Exception as e:
        logger.error(f"Stripe order checkout error: {type(e).__name__}: {e}")
        raise HTTPException(status_code=500, detail=f"Payment error: {str(e)}")
    order_doc = {
        "id": order_id, "items": validated_items, "total": float(total),
        "status": "todo", "stripe_session_id": session.id,
        "customer_email": req.customer_email, "order_type": req.order_type,
        "delivery_date": req.delivery_date, "pet_notes": req.pet_notes,
        "personalized_message": req.personalized_message,
        "referral_code": req.referral_code, "credit_applied": credit_applied,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.orders.insert_one(order_doc)
    await db.payment_transactions.insert_one({
        "id": str(uuid.uuid4()), "session_id": session.id,
        "amount": float(total), "currency": "gbp",
        "status": "initiated", "payment_status": "pending", "order_id": order_id,
        "metadata": {"order_type": req.order_type, "item_count": str(len(validated_items))},
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    return {"url": session.url, "session_id": session.id, "order_id": order_id}

@api_router.post("/workshops/checkout")
async def create_workshop_checkout(req: WorkshopCheckoutRequest, request: Request):
    if not req.full_name.strip() or not req.customer_email.strip():
        raise HTTPException(status_code=400, detail="Full name and email are required")
    if req.price <= 0:
        raise HTTPException(status_code=400, detail="Invalid workshop price")
    qty = max(1, min(10, int(req.quantity or 1)))
    total = float(req.price) * qty

    booking_id = str(uuid.uuid4())
    success_url = f"{req.origin_url}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{req.origin_url}/workshops"

    booking_metadata = {
        "type": "workshop",
        "booking_id": booking_id,
        "workshop_id": req.workshop_id,
        "workshop_name": req.workshop_name[:480],
        "workshop_location": req.workshop_location[:480],
        "workshop_date": req.workshop_date[:480],
        "workshop_time": req.workshop_time[:480],
        "full_name": req.full_name[:480],
        "customer_email": req.customer_email[:480],
        "notes": (req.notes or "")[:480],
        "quantity": str(qty),
        "amount_paid": f"{total:.2f}",
        "plan_name": req.workshop_name[:480],  # so dashboard "Past Purchases" shows nicely
    }
    if req.customer_id:
        booking_metadata["customer_id"] = req.customer_id[:480]

    try:
        pid = {"metadata": booking_metadata, "receipt_email": req.customer_email}
        checkout_params = {
            "payment_method_types": ["card"],
            "line_items": [{
                "price_data": {
                    "currency": "gbp",
                    "unit_amount": int(req.price * 100),
                    "product_data": {
                        "name": f"{req.workshop_name} - {req.workshop_location}",
                        "description": f"{req.workshop_date} at {req.workshop_time}",
                    },
                },
                "quantity": qty,
            }],
            "mode": "payment",
            "success_url": success_url,
            "cancel_url": cancel_url,
            "metadata": booking_metadata,
            "payment_intent_data": pid,
            "customer_email": req.customer_email,
        }
        session = stripe.checkout.Session.create(**checkout_params)
    except stripe._error.AuthenticationError:
        raise HTTPException(status_code=503, detail="Payment service is not configured. Please contact support.")
    except Exception as e:
        logger.error(f"Stripe workshop checkout error: {type(e).__name__}: {e}")
        raise HTTPException(status_code=500, detail=f"Payment error: {str(e)}")

    await db.workshop_bookings.insert_one({
        "id": booking_id,
        "workshop_id": req.workshop_id,
        "workshop_name": req.workshop_name,
        "workshop_location": req.workshop_location,
        "workshop_address": req.workshop_address,
        "workshop_date": req.workshop_date,
        "workshop_time": req.workshop_time,
        "price": float(req.price),
        "quantity": qty,
        "total": total,
        "full_name": req.full_name,
        "customer_email": req.customer_email,
        "customer_id": req.customer_id or None,
        "notes": req.notes,
        "stripe_session_id": session.id,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    await db.payment_transactions.insert_one({
        "id": str(uuid.uuid4()),
        "session_id": session.id,
        "amount": total,
        "currency": "gbp",
        "status": "initiated",
        "payment_status": "pending",
        "customer_email": req.customer_email,
        "metadata": booking_metadata,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return {"url": session.url, "session_id": session.id, "booking_id": booking_id}


# ============================================================
# RAFFLE - Camp Beagle
# ============================================================

async def send_raffle_confirmation_email(raffle_data: dict):
    customer_email = raffle_data.get("email", "")
    full_name = raffle_data.get("full_name", "")
    ticket_numbers = raffle_data.get("ticket_numbers", [])
    quantity = raffle_data.get("quantity", 1)
    total = raffle_data.get("total", 0)
    first_name = full_name.split(" ")[0] if full_name else "there"

    tickets_html = "".join([
        f'<div style="display:inline-block;background:#F2F0EB;border:1px solid #E5E0D6;border-radius:8px;padding:12px 20px;margin:5px;font-family:monospace;font-size:18px;letter-spacing:2px;color:#2C2C2C;font-weight:600;">{t}</div>'
        for t in ticket_numbers
    ])

    html_content = f"""
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FAF9F6;">
        <div style="background: linear-gradient(135deg, #B8926A 0%, #D4A574 100%); padding: 48px 32px; text-align: center; border-radius: 0 0 24px 24px;">
            <h1 style="font-family: Georgia, serif; color: #FFFFFF; font-weight: 400; font-size: 32px; margin: 0 0 8px;">Congratulations!</h1>
            <p style="color: rgba(255,255,255,0.9); font-size: 15px; margin: 0; font-weight: 300;">You've entered the Camp Beagle Raffle</p>
        </div>

        <div style="padding: 40px 32px;">
            <p style="color: #4B5563; font-size: 15px; line-height: 1.8; margin: 0 0 28px;">
                Hi {first_name}, thank you so much for supporting Camp Beagle! Your raffle {'tickets are' if quantity > 1 else 'ticket is'} confirmed.
            </p>

            <div style="background: #FFFFFF; border: 1px solid #E5E0D6; border-radius: 16px; padding: 28px; text-align: center; margin: 0 0 28px;">
                <p style="color: #6B7280; font-size: 11px; text-transform: uppercase; letter-spacing: 3px; margin: 0 0 16px; font-weight: 600;">Your Raffle Ticket{'s' if quantity > 1 else ''}</p>
                {tickets_html}
            </div>

            <div style="background: #F2F0EB; border-radius: 12px; padding: 20px 24px; margin: 0 0 28px;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="color: #6B7280; font-size: 13px; padding: 6px 0;">Tickets purchased</td>
                        <td style="color: #2C2C2C; font-size: 13px; padding: 6px 0; text-align: right;">{quantity}</td>
                    </tr>
                    <tr>
                        <td style="color: #6B7280; font-size: 13px; padding: 6px 0;">Price per ticket</td>
                        <td style="color: #2C2C2C; font-size: 13px; padding: 6px 0; text-align: right;">&pound;2.00</td>
                    </tr>
                    <tr style="border-top: 1px solid #E5E0D6;">
                        <td style="color: #2C2C2C; font-size: 15px; padding: 10px 0 0; font-weight: 600;">Total paid</td>
                        <td style="color: #2C2C2C; font-size: 15px; padding: 10px 0 0; text-align: right; font-weight: 600;">&pound;{total:.2f}</td>
                    </tr>
                </table>
            </div>

            <div style="border-left: 3px solid #B8926A; padding-left: 18px; margin: 0 0 28px;">
                <p style="color: #4B5563; font-size: 13px; line-height: 1.8; margin: 0;">
                    <strong style="color: #2C2C2C;">About Camp Beagle</strong><br>
                    Camp Beagle is the longest-running animal rights camp in the UK, campaigning peacefully outside MBR Acres since 2021 to save beagles bred for experimentation. 100% of your raffle contribution goes towards sustaining this vital campaign.
                </p>
            </div>

            <p style="color: #6B7280; font-size: 13px; line-height: 1.7; margin: 0;">
                Keep hold of your ticket number{'s' if quantity > 1 else ''} &mdash; we'll announce the winner soon. Good luck!
            </p>
        </div>

        <div style="text-align: center; padding: 24px 32px 40px; border-top: 1px solid #E5E0D6;">
            <p style="color: #8DA399; font-size: 10px; text-transform: uppercase; letter-spacing: 3px; margin: 0;">Petal & Paw &bull; Pet-Safe Florals</p>
        </div>
    </div>
    """
    _send_email(
        customer_email,
        f"Your Camp Beagle Raffle Ticket{'s' if quantity > 1 else ''} - Good Luck!",
        html_content,
        from_email="Petal & Paw <info@petalandpaw.co.uk>"
    )


@api_router.post("/raffle/checkout")
async def create_raffle_checkout(req: RaffleCheckoutRequest, request: Request):
    if not req.full_name.strip() or not req.email.strip():
        raise HTTPException(status_code=400, detail="Full name and email are required")
    qty = max(1, min(20, int(req.quantity or 1)))
    unit_price = 2.00
    total = unit_price * qty

    ticket_numbers = []
    for _ in range(qty):
        ticket_num = "CB-" + "".join(random.choices(string.ascii_uppercase + string.digits, k=8))
        ticket_numbers.append(ticket_num)

    raffle_metadata = {
        "type": "raffle",
        "cause": "Camp Beagle",
        "ticket_numbers": ", ".join(ticket_numbers),
        "full_name": req.full_name[:480],
        "email": req.email[:480],
        "quantity": str(qty),
        "amount_paid": f"{total:.2f}",
    }
    if req.customer_id:
        raffle_metadata["customer_id"] = req.customer_id[:480]

    success_url = f"{req.origin_url}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{req.origin_url}/raffle"

    try:
        checkout_params = {
            "payment_method_types": ["card"],
            "line_items": [{
                "price_data": {
                    "currency": "gbp",
                    "unit_amount": int(unit_price * 100),
                    "product_data": {
                        "name": "Camp Beagle Raffle Ticket",
                        "description": f"Raffle ticket(s): {', '.join(ticket_numbers)}",
                    },
                },
                "quantity": qty,
            }],
            "mode": "payment",
            "success_url": success_url,
            "cancel_url": cancel_url,
            "metadata": raffle_metadata,
            "payment_intent_data": {
                "metadata": raffle_metadata,
                "receipt_email": req.email,
            },
            "customer_email": req.email,
        }
        session = stripe.checkout.Session.create(**checkout_params)
    except stripe._error.AuthenticationError:
        raise HTTPException(status_code=503, detail="Payment service is not configured. Please contact support.")
    except Exception as e:
        logger.error(f"Stripe raffle checkout error: {type(e).__name__}: {e}")
        raise HTTPException(status_code=500, detail=f"Payment error: {str(e)}")

    await db.raffle_entries.insert_one({
        "id": str(uuid.uuid4()),
        "ticket_numbers": ticket_numbers,
        "quantity": qty,
        "total": total,
        "full_name": req.full_name,
        "email": req.email,
        "customer_id": req.customer_id or None,
        "stripe_session_id": session.id,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    await db.payment_transactions.insert_one({
        "id": str(uuid.uuid4()),
        "session_id": session.id,
        "amount": total,
        "currency": "gbp",
        "status": "initiated",
        "payment_status": "pending",
        "customer_email": req.email,
        "metadata": raffle_metadata,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return {"url": session.url, "session_id": session.id, "ticket_numbers": ticket_numbers}


# ============================================================
# VOUCHERS
# ============================================================

VOUCHER_MAX_AMOUNT = 250.0
VOUCHER_MIN_AMOUNT = 10.0

def _generate_voucher_code() -> str:
    """Format: PP-XXXX-XXXX-XXXX (alphanumeric, no ambiguous chars)."""
    alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    parts = ["".join(random.choices(alphabet, k=4)) for _ in range(3)]
    return "PP-" + "-".join(parts)

async def _allocate_unique_voucher_code() -> str:
    for _ in range(10):
        code = _generate_voucher_code()
        existing = await db.vouchers.find_one({"code": code}, {"_id": 0})
        if not existing:
            return code
    raise HTTPException(status_code=500, detail="Could not allocate voucher code, please retry.")

async def send_voucher_purchase_email(voucher: dict):
    purchaser_email = voucher.get("purchaser_email", "")
    purchaser_name = voucher.get("purchaser_name", "")
    recipient_name = voucher.get("recipient_name", "")
    recipient_email = voucher.get("recipient_email", "")
    code = voucher.get("code", "")
    amount = voucher.get("original_amount", 0)
    personal_message = voucher.get("personal_message", "")

    voucher_card_html = f"""
    <div style="background: linear-gradient(135deg, #FAF9F6 0%, #F2F0EB 100%); border: 1px solid #E5E0D6; padding: 32px; border-radius: 16px; text-align: center; margin: 20px 0;">
        <p style="color: #8DA399; font-size: 11px; text-transform: uppercase; letter-spacing: 3px; margin: 0 0 8px;">Petal & Paw Voucher</p>
        <h2 style="font-family: serif; color: #2C2C2C; font-weight: 400; font-size: 32px; margin: 0 0 16px;">£{amount:.2f}</h2>
        <p style="color: #6B7280; font-size: 12px; margin: 0 0 6px;">Voucher Code</p>
        <p style="font-family: monospace; font-size: 22px; letter-spacing: 4px; color: #2C2C2C; margin: 0; font-weight: 500;">{code}</p>
    </div>
    """

    if purchaser_email:
        purchaser_html = f"""
        <div style="font-family: 'Helvetica', sans-serif; max-width: 600px; margin: 0 auto; background: #FAF9F6; padding: 40px;">
            <h1 style="font-family: serif; color: #2C2C2C; font-weight: 400;">Thank you for your voucher purchase</h1>
            <p style="color: #6B7280;">Hi {purchaser_name or 'there'}, your Petal &amp; Paw voucher is ready to use.</p>
            {voucher_card_html}
            <p style="color: #6B7280;">Use this code at checkout on our workshops page to redeem your balance. Any unused balance stays on the voucher for next time.</p>
            <p style="color: #8DA399; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Petal & Paw - Pet-Safe Florals</p>
        </div>
        """
        _send_email(purchaser_email, f"Your Petal & Paw Voucher - £{amount:.2f}", purchaser_html, reply_to="info@petalandpaw.co.uk")

    if recipient_email and recipient_email.lower() != purchaser_email.lower():
        gift_html = f"""
        <div style="font-family: 'Helvetica', sans-serif; max-width: 600px; margin: 0 auto; background: #FAF9F6; padding: 40px;">
            <h1 style="font-family: serif; color: #2C2C2C; font-weight: 400;">You've been gifted a Petal &amp; Paw voucher</h1>
            <p style="color: #6B7280;">Hi {recipient_name or 'there'}, {purchaser_name or 'someone wonderful'} has sent you a voucher to use on our flower arranging workshops.</p>
            {voucher_card_html}
            {f'<div style="background: white; border-left: 3px solid #C4A2B0; padding: 16px 20px; margin: 20px 0; border-radius: 4px;"><p style="color: #6B7280; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 6px;">Personal Message</p><p style="color: #2C2C2C; margin: 0; white-space: pre-wrap; font-style: italic;">{personal_message}</p></div>' if personal_message else ''}
            <p style="color: #6B7280;">Head to our website, browse the workshops, and enter the code at checkout. Any unused balance stays on the voucher for next time.</p>
            <p style="color: #8DA399; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Petal & Paw - Pet-Safe Florals</p>
        </div>
        """
        _send_email(recipient_email, f"You've received a Petal & Paw Voucher", gift_html, reply_to=purchaser_email or "info@petalandpaw.co.uk")


async def send_voucher_redemption_admin_email(redemption: dict):
    """Notify info@ when a voucher is redeemed for workshops."""
    full_name = redemption.get("full_name", "")
    customer_email = redemption.get("customer_email", "")
    voucher_code = redemption.get("voucher_code", "")
    voucher_applied = float(redemption.get("voucher_applied", 0) or 0)
    excess = float(redemption.get("excess", 0) or 0)
    cart_total = float(redemption.get("cart_total", 0) or 0)
    items = redemption.get("items", []) or []
    purchased_at = redemption.get("paid_at") or redemption.get("created_at") or datetime.now(timezone.utc).isoformat()
    notes = redemption.get("notes", "")

    try:
        ts = datetime.fromisoformat(purchased_at.replace("Z", "+00:00"))
        purchased_display = ts.strftime("%d %b %Y, %H:%M UTC")
    except Exception:
        purchased_display = purchased_at

    rows_html = ""
    for it in items:
        qty = int(it.get("quantity", 1) or 1)
        line_total = float(it.get("line_total", 0) or 0)
        rows_html += f"""
        <tr>
            <td style="padding: 10px 12px; border-bottom: 1px solid #E5E0D6; color: #2C2C2C;">{it.get('workshop_name','')}</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #E5E0D6; color: #6B7280;">{it.get('workshop_location','')}</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #E5E0D6; color: #6B7280;">{it.get('workshop_date','')}<br/>{it.get('workshop_time','')}</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #E5E0D6; color: #6B7280; text-align: center;">{qty}</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #E5E0D6; color: #2C2C2C; text-align: right;">£{line_total:.2f}</td>
        </tr>
        """

    admin_html = f"""
    <div style="font-family: 'Helvetica', sans-serif; max-width: 640px; margin: 0 auto; background: #FAF9F6; padding: 40px;">
        <p style="color: #8DA399; font-size: 11px; text-transform: uppercase; letter-spacing: 3px; margin: 0 0 6px;">Voucher Redemption</p>
        <h1 style="font-family: serif; color: #2C2C2C; font-weight: 400; margin: 0 0 24px;">Workshops booked using a voucher</h1>

        <div style="background: white; padding: 20px 24px; border-radius: 8px; margin: 0 0 20px;">
            <p style="color: #6B7280; margin: 0 0 6px;"><strong style="color:#2C2C2C;">Customer:</strong> {full_name}</p>
            <p style="color: #6B7280; margin: 0 0 6px;"><strong style="color:#2C2C2C;">Email:</strong> <a href="mailto:{customer_email}" style="color:#8DA399;">{customer_email}</a></p>
            <p style="color: #6B7280; margin: 0 0 6px;"><strong style="color:#2C2C2C;">Time of purchase:</strong> {purchased_display}</p>
            <p style="color: #6B7280; margin: 0;"><strong style="color:#2C2C2C;">Voucher code:</strong> <span style="font-family: monospace; letter-spacing: 2px;">{voucher_code}</span></p>
        </div>

        <table style="width:100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; margin: 0 0 20px;">
            <thead>
                <tr style="background: #F2F0EB;">
                    <th style="padding: 10px 12px; text-align:left; color:#6B7280; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Workshop</th>
                    <th style="padding: 10px 12px; text-align:left; color:#6B7280; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Location</th>
                    <th style="padding: 10px 12px; text-align:left; color:#6B7280; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Date / Time</th>
                    <th style="padding: 10px 12px; text-align:center; color:#6B7280; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Qty</th>
                    <th style="padding: 10px 12px; text-align:right; color:#6B7280; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Total</th>
                </tr>
            </thead>
            <tbody>{rows_html}</tbody>
        </table>

        <div style="background: white; padding: 16px 24px; border-radius: 8px; margin: 0 0 20px;">
            <p style="color: #6B7280; margin: 0 0 6px; display:flex; justify-content: space-between;"><span>Cart total</span><strong style="color:#2C2C2C;">£{cart_total:.2f}</strong></p>
            <p style="color: #6B7280; margin: 0 0 6px; display:flex; justify-content: space-between;"><span>Voucher applied</span><strong style="color:#8DA399;">- £{voucher_applied:.2f}</strong></p>
            <p style="color: #2C2C2C; margin: 8px 0 0; display:flex; justify-content: space-between; border-top: 1px solid #E5E0D6; padding-top: 10px;"><span><strong>Excess paid by card</strong></span><strong>£{excess:.2f}</strong></p>
        </div>

        {f'<div style="background: white; padding: 16px 24px; border-radius: 8px; margin: 0 0 20px;"><p style="color: #6B7280; margin: 0 0 6px; font-size: 11px; text-transform: uppercase; letter-spacing: 2px;">Customer notes</p><p style="color: #2C2C2C; margin: 0; white-space: pre-wrap;">{notes}</p></div>' if notes else ''}

        <p style="color: #8DA399; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Petal & Paw - Voucher Redemption</p>
    </div>
    """

    workshop_summary = ", ".join([it.get("workshop_name", "") for it in items[:3]])
    if len(items) > 3:
        workshop_summary += f" +{len(items) - 3} more"
    subject = f"[Voucher Redeemed] {full_name} - {workshop_summary or voucher_code}"
    _send_email("info@petalandpaw.co.uk", subject, admin_html, reply_to=customer_email or "")


@api_router.post("/vouchers/checkout")
async def create_voucher_checkout(req: VoucherCheckoutRequest, request: Request):
    if not req.purchaser_name.strip() or not req.purchaser_email.strip():
        raise HTTPException(status_code=400, detail="Your name and email are required")
    try:
        amount = float(req.amount)
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail="Invalid voucher amount")
    if amount < VOUCHER_MIN_AMOUNT:
        raise HTTPException(status_code=400, detail=f"Minimum voucher amount is £{VOUCHER_MIN_AMOUNT:.0f}.")
    if amount > VOUCHER_MAX_AMOUNT:
        raise HTTPException(status_code=400, detail=f"Maximum voucher amount is £{VOUCHER_MAX_AMOUNT:.0f}.")

    voucher_id = str(uuid.uuid4())
    code = await _allocate_unique_voucher_code()
    success_url = f"{req.origin_url}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{req.origin_url}/vouchers"

    voucher_metadata = {
        "type": "voucher",
        "voucher_id": voucher_id,
        "voucher_code": code,
        "purchaser_name": req.purchaser_name[:480],
        "purchaser_email": req.purchaser_email[:480],
        "recipient_name": (req.recipient_name or "")[:480],
        "recipient_email": (req.recipient_email or "")[:480],
        "amount": f"{amount:.2f}",
        "plan_name": f"Voucher £{amount:.2f}",
    }

    try:
        checkout_params = {
            "payment_method_types": ["card"],
            "line_items": [{
                "price_data": {
                    "currency": "gbp",
                    "unit_amount": int(amount * 100),
                    "product_data": {
                        "name": f"Petal & Paw Voucher - £{amount:.2f}",
                        "description": "Redeemable against any flower arranging workshop.",
                    },
                },
                "quantity": 1,
            }],
            "mode": "payment",
            "success_url": success_url,
            "cancel_url": cancel_url,
            "metadata": voucher_metadata,
            "payment_intent_data": {"metadata": voucher_metadata, "receipt_email": req.purchaser_email},
            "customer_email": req.purchaser_email,
        }
        session = stripe.checkout.Session.create(**checkout_params)
    except stripe._error.AuthenticationError:
        raise HTTPException(status_code=503, detail="Payment service is not configured. Please contact support.")
    except Exception as e:
        logger.error(f"Stripe voucher checkout error: {type(e).__name__}: {e}")
        raise HTTPException(status_code=500, detail=f"Payment error: {str(e)}")

    await db.vouchers.insert_one({
        "id": voucher_id,
        "code": code,
        "original_amount": amount,
        "remaining_balance": amount,
        "purchaser_name": req.purchaser_name,
        "purchaser_email": req.purchaser_email,
        "recipient_name": req.recipient_name or "",
        "recipient_email": req.recipient_email or "",
        "personal_message": (req.personal_message or "")[:500],
        "stripe_session_id": session.id,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    await db.payment_transactions.insert_one({
        "id": str(uuid.uuid4()),
        "session_id": session.id,
        "amount": amount,
        "currency": "gbp",
        "status": "initiated",
        "payment_status": "pending",
        "customer_email": req.purchaser_email,
        "metadata": voucher_metadata,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return {"url": session.url, "session_id": session.id, "voucher_id": voucher_id}


@api_router.get("/vouchers/validate/{code}")
async def validate_voucher(code: str):
    code = (code or "").strip().upper()
    if not code:
        raise HTTPException(status_code=400, detail="Voucher code is required")
    v = await db.vouchers.find_one({"code": code}, {"_id": 0})
    if not v:
        raise HTTPException(status_code=404, detail="Voucher not found")
    if v.get("status") == "pending":
        raise HTTPException(status_code=400, detail="This voucher hasn't been activated yet. Please check your email after payment confirms.")
    remaining = float(v.get("remaining_balance", 0))
    if remaining <= 0 or v.get("status") == "depleted":
        raise HTTPException(status_code=400, detail="This voucher has no balance remaining.")
    return {
        "code": v["code"],
        "remaining_balance": round(remaining, 2),
        "original_amount": round(float(v.get("original_amount", 0)), 2),
        "status": v.get("status", "active"),
    }


@api_router.post("/vouchers/redeem")
async def redeem_voucher(req: VoucherRedeemRequest, request: Request, background_tasks: BackgroundTasks):
    code = (req.code or "").strip().upper()
    if not code:
        raise HTTPException(status_code=400, detail="Voucher code is required")
    if not req.full_name.strip() or not req.customer_email.strip():
        raise HTTPException(status_code=400, detail="Your name and email are required")
    if not req.items:
        raise HTTPException(status_code=400, detail="Select at least one workshop")

    v = await db.vouchers.find_one({"code": code}, {"_id": 0})
    if not v:
        raise HTTPException(status_code=404, detail="Voucher not found")
    if v.get("status") == "pending":
        raise HTTPException(status_code=400, detail="This voucher hasn't been activated yet.")
    remaining = float(v.get("remaining_balance", 0))
    if remaining <= 0:
        raise HTTPException(status_code=400, detail="This voucher has no balance remaining.")

    items = []
    cart_total = 0.0
    for it in req.items:
        qty = max(1, min(10, int(it.quantity or 1)))
        line_total = round(float(it.price) * qty, 2)
        cart_total += line_total
        items.append({
            "workshop_id": it.workshop_id,
            "workshop_name": it.workshop_name,
            "workshop_location": it.workshop_location,
            "workshop_address": it.workshop_address or "",
            "workshop_date": it.workshop_date,
            "workshop_time": it.workshop_time,
            "price": float(it.price),
            "quantity": qty,
            "line_total": line_total,
        })
    cart_total = round(cart_total, 2)
    voucher_applied = round(min(remaining, cart_total), 2)
    excess = round(cart_total - voucher_applied, 2)

    redemption_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    if excess <= 0.01:
        # Voucher fully covers - confirm bookings, deduct balance
        new_balance = round(remaining - voucher_applied, 2)
        new_status = "depleted" if new_balance <= 0.01 else "active"
        await db.vouchers.update_one(
            {"code": code},
            {"$set": {
                "remaining_balance": new_balance,
                "status": new_status,
                "last_used_at": now,
            }}
        )
        # Insert workshop bookings (paid via voucher)
        for it in items:
            booking_id = str(uuid.uuid4())
            booking_doc = {
                "id": booking_id,
                "workshop_id": it["workshop_id"],
                "workshop_name": it["workshop_name"],
                "workshop_location": it["workshop_location"],
                "workshop_address": it["workshop_address"],
                "workshop_date": it["workshop_date"],
                "workshop_time": it["workshop_time"],
                "price": it["price"],
                "quantity": it["quantity"],
                "total": it["line_total"],
                "full_name": req.full_name,
                "customer_email": req.customer_email,
                "customer_id": req.customer_id or None,
                "notes": req.notes or "",
                "voucher_code": code,
                "voucher_applied": it["line_total"],
                "status": "paid",
                "paid_at": now,
                "paid_via": "voucher",
                "redemption_id": redemption_id,
                "created_at": now,
            }
            await db.workshop_bookings.insert_one(booking_doc)
            background_tasks.add_task(send_workshop_booking_emails, booking_doc)
        redemption_doc = {
            "id": redemption_id,
            "voucher_code": code,
            "items": items,
            "cart_total": cart_total,
            "voucher_applied": voucher_applied,
            "excess": 0.0,
            "status": "complete",
            "full_name": req.full_name,
            "customer_email": req.customer_email,
            "customer_id": req.customer_id or None,
            "notes": req.notes or "",
            "created_at": now,
            "paid_at": now,
        }
        await db.voucher_redemptions.insert_one(redemption_doc)
        background_tasks.add_task(send_voucher_redemption_admin_email, redemption_doc)
        return {
            "covered": True,
            "voucher_applied": voucher_applied,
            "excess": 0.0,
            "remaining_balance": new_balance,
            "redemption_id": redemption_id,
        }

    # Excess - create Stripe checkout for the difference; only finalise on success
    success_url = f"{req.origin_url}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{req.origin_url}/vouchers"
    redemption_metadata = {
        "type": "voucher_redemption",
        "redemption_id": redemption_id,
        "voucher_code": code,
        "voucher_applied": f"{voucher_applied:.2f}",
        "excess": f"{excess:.2f}",
        "cart_total": f"{cart_total:.2f}",
        "full_name": req.full_name[:480],
        "customer_email": req.customer_email[:480],
        "plan_name": "Workshop bookings (voucher + top-up)",
    }
    try:
        line_items = [{
            "price_data": {
                "currency": "gbp",
                "unit_amount": int(round(it["price"] * 100)),
                "product_data": {
                    "name": f"{it['workshop_name']} - {it['workshop_location']}",
                    "description": f"{it['workshop_date']} at {it['workshop_time']}",
                },
            },
            "quantity": it["quantity"],
        } for it in items]
        # Apply voucher as a discount via coupon
        coupon = stripe.Coupon.create(
            amount_off=int(round(voucher_applied * 100)),
            currency="gbp",
            duration="once",
            name=f"Voucher {code}",
        )
        checkout_params = {
            "payment_method_types": ["card"],
            "line_items": line_items,
            "mode": "payment",
            "success_url": success_url,
            "cancel_url": cancel_url,
            "metadata": redemption_metadata,
            "payment_intent_data": {"metadata": redemption_metadata, "receipt_email": req.customer_email},
            "customer_email": req.customer_email,
            "discounts": [{"coupon": coupon.id}],
        }
        session = stripe.checkout.Session.create(**checkout_params)
    except stripe._error.AuthenticationError:
        raise HTTPException(status_code=503, detail="Payment service is not configured. Please contact support.")
    except Exception as e:
        logger.error(f"Stripe voucher redemption error: {type(e).__name__}: {e}")
        raise HTTPException(status_code=500, detail=f"Payment error: {str(e)}")

    await db.voucher_redemptions.insert_one({
        "id": redemption_id,
        "voucher_code": code,
        "items": items,
        "cart_total": cart_total,
        "voucher_applied": voucher_applied,
        "excess": excess,
        "status": "pending",
        "stripe_session_id": session.id,
        "full_name": req.full_name,
        "customer_email": req.customer_email,
        "customer_id": req.customer_id or None,
        "notes": req.notes or "",
        "created_at": now,
    })
    await db.payment_transactions.insert_one({
        "id": str(uuid.uuid4()),
        "session_id": session.id,
        "amount": excess,
        "currency": "gbp",
        "status": "initiated",
        "payment_status": "pending",
        "customer_email": req.customer_email,
        "metadata": redemption_metadata,
        "created_at": now,
    })
    return {
        "covered": False,
        "voucher_applied": voucher_applied,
        "excess": excess,
        "url": session.url,
        "session_id": session.id,
        "redemption_id": redemption_id,
    }


@api_router.get("/orders/status/{session_id}")
async def get_order_status(session_id: str, request: Request, background_tasks: BackgroundTasks):
    try:
        session = stripe.checkout.Session.retrieve(session_id)
    except Exception as e:
        logger.error(f"Stripe session retrieve error: {e}")
        raise HTTPException(status_code=404, detail="Payment session not found")
    payment_status = session.payment_status or "unpaid"
    status = session.status or "open"
    # For subscriptions, payment_status is "paid" once the first invoice is paid
    # For one-time, it's "paid" after charge succeeds
    update_data = {"status": status, "payment_status": payment_status,
                   "updated_at": datetime.now(timezone.utc).isoformat()}
    # Extract shipping address if collected
    shipping = None
    shipping_details = getattr(session, 'shipping_details', None)
    if shipping_details:
        shipping = {
            "name": getattr(shipping_details, 'name', ''),
            "address": dict(getattr(shipping_details, 'address', {}) or {})
        }
        update_data["shipping"] = shipping
    # Extract customer email
    customer_details = getattr(session, 'customer_details', None)
    customer_email = getattr(customer_details, 'email', None) if customer_details else getattr(session, 'customer_email', None)
    if payment_status == "paid":
        tx = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
        if tx and tx.get("payment_status") != "paid":
            # Update transaction
            if shipping:
                update_data["shipping"] = shipping
            if customer_email:
                update_data["customer_email"] = customer_email
            # Check for workshop booking
            booking = await db.workshop_bookings.find_one({"stripe_session_id": session_id}, {"_id": 0})
            if booking and booking.get("status") != "paid":
                await db.workshop_bookings.update_one(
                    {"stripe_session_id": session_id},
                    {"$set": {"status": "paid", "paid_at": datetime.now(timezone.utc).isoformat()}}
                )
                background_tasks.add_task(send_workshop_booking_emails, booking)
            # Check for voucher purchase activation
            voucher_record = await db.vouchers.find_one({"stripe_session_id": session_id}, {"_id": 0})
            if voucher_record and voucher_record.get("status") == "pending":
                await db.vouchers.update_one(
                    {"stripe_session_id": session_id},
                    {"$set": {"status": "active", "paid_at": datetime.now(timezone.utc).isoformat()}}
                )
                voucher_record["status"] = "active"
                background_tasks.add_task(send_voucher_purchase_email, voucher_record)
            # Check for voucher redemption with top-up
            redemption = await db.voucher_redemptions.find_one({"stripe_session_id": session_id}, {"_id": 0})
            if redemption and redemption.get("status") == "pending":
                voucher_applied = float(redemption.get("voucher_applied", 0))
                v = await db.vouchers.find_one({"code": redemption.get("voucher_code", "")}, {"_id": 0})
                now_iso = datetime.now(timezone.utc).isoformat()
                if v:
                    new_balance = round(max(0.0, float(v.get("remaining_balance", 0)) - voucher_applied), 2)
                    new_status = "depleted" if new_balance <= 0.01 else "active"
                    await db.vouchers.update_one(
                        {"code": v["code"]},
                        {"$set": {"remaining_balance": new_balance, "status": new_status, "last_used_at": now_iso}}
                    )
                # Insert workshop bookings for each item (paid via voucher + top-up)
                for it in redemption.get("items", []):
                    booking_id = str(uuid.uuid4())
                    booking_doc = {
                        "id": booking_id,
                        "workshop_id": it.get("workshop_id", ""),
                        "workshop_name": it.get("workshop_name", ""),
                        "workshop_location": it.get("workshop_location", ""),
                        "workshop_address": it.get("workshop_address", ""),
                        "workshop_date": it.get("workshop_date", ""),
                        "workshop_time": it.get("workshop_time", ""),
                        "price": float(it.get("price", 0)),
                        "quantity": int(it.get("quantity", 1)),
                        "total": float(it.get("line_total", 0)),
                        "full_name": redemption.get("full_name", ""),
                        "customer_email": redemption.get("customer_email", ""),
                        "customer_id": redemption.get("customer_id"),
                        "notes": redemption.get("notes", ""),
                        "voucher_code": redemption.get("voucher_code", ""),
                        "stripe_session_id": session_id,
                        "status": "paid",
                        "paid_at": now_iso,
                        "paid_via": "voucher_plus_card",
                        "redemption_id": redemption.get("id"),
                        "created_at": now_iso,
                    }
                    await db.workshop_bookings.insert_one(booking_doc)
                    background_tasks.add_task(send_workshop_booking_emails, booking_doc)
                await db.voucher_redemptions.update_one(
                    {"id": redemption["id"]},
                    {"$set": {"status": "complete", "paid_at": now_iso}}
                )
                redemption["status"] = "complete"
                redemption["paid_at"] = now_iso
                background_tasks.add_task(send_voucher_redemption_admin_email, redemption)
            # Check for raffle entry
            raffle_entry = await db.raffle_entries.find_one({"stripe_session_id": session_id}, {"_id": 0})
            if raffle_entry and raffle_entry.get("status") != "paid":
                await db.raffle_entries.update_one(
                    {"stripe_session_id": session_id},
                    {"$set": {"status": "paid", "paid_at": datetime.now(timezone.utc).isoformat()}}
                )
                background_tasks.add_task(send_raffle_confirmation_email, raffle_entry)
            # Check for order (cart checkout) or subscription checkout — skip if this was a workshop booking, voucher, or redemption
            if booking or voucher_record or redemption or raffle_entry:
                order = None
            else:
                order = await db.orders.find_one({"stripe_session_id": session_id}, {"_id": 0})
            if order:
                order_update = {"status": "todo", "updated_at": datetime.now(timezone.utc).isoformat()}
                if shipping:
                    order_update["shipping"] = shipping
                await db.orders.update_one(
                    {"stripe_session_id": session_id}, {"$set": order_update}
                )
                if order.get("referral_code"):
                    referrer = await db.users.find_one({"referral_code": order["referral_code"]}, {"_id": 0})
                    if referrer:
                        await db.users.update_one({"referral_code": order["referral_code"]},
                            {"$inc": {"credits": 10.0}})
                if order.get("customer_email"):
                    background_tasks.add_task(send_order_confirmation_email, order["customer_email"], order)
            elif customer_email and not raffle_entry:
                background_tasks.add_task(send_order_confirmation_email, customer_email, {
                    "items": [{"name": tx.get("metadata", {}).get("plan_name", "Subscription"), "quantity": 1, "price": tx.get("amount", 0)}],
                    "total": tx.get("amount", 0),
                })
    await db.payment_transactions.update_one({"session_id": session_id}, {"$set": update_data}, upsert=True)
    result = {"status": status, "payment_status": payment_status,
            "amount_total": session.amount_total, "currency": session.currency}
    if shipping:
        result["shipping"] = shipping
    if session.mode:
        result["mode"] = session.mode
    # Surface metadata for success page (workshop bookings, plan name, etc.)
    session_metadata = dict(getattr(session, 'metadata', {}) or {})
    if session_metadata:
        result["metadata"] = session_metadata
    booking = await db.workshop_bookings.find_one({"stripe_session_id": session_id}, {"_id": 0})
    if booking:
        result["booking"] = {
            "workshop_name": booking.get("workshop_name", ""),
            "workshop_location": booking.get("workshop_location", ""),
            "workshop_date": booking.get("workshop_date", ""),
            "workshop_time": booking.get("workshop_time", ""),
            "full_name": booking.get("full_name", ""),
            "customer_email": booking.get("customer_email", ""),
        }
    voucher_record = await db.vouchers.find_one({"stripe_session_id": session_id}, {"_id": 0})
    if voucher_record:
        result["voucher"] = {
            "code": voucher_record.get("code", ""),
            "original_amount": voucher_record.get("original_amount", 0),
            "remaining_balance": voucher_record.get("remaining_balance", 0),
            "recipient_name": voucher_record.get("recipient_name", ""),
            "recipient_email": voucher_record.get("recipient_email", ""),
        }
    redemption = await db.voucher_redemptions.find_one({"stripe_session_id": session_id}, {"_id": 0})
    if redemption:
        result["redemption"] = {
            "voucher_code": redemption.get("voucher_code", ""),
            "voucher_applied": redemption.get("voucher_applied", 0),
            "excess": redemption.get("excess", 0),
            "cart_total": redemption.get("cart_total", 0),
            "items": [{
                "workshop_name": it.get("workshop_name", ""),
                "workshop_location": it.get("workshop_location", ""),
                "workshop_date": it.get("workshop_date", ""),
                "workshop_time": it.get("workshop_time", ""),
                "quantity": it.get("quantity", 1),
                "line_total": it.get("line_total", 0),
            } for it in redemption.get("items", [])],
        }
    raffle_entry = await db.raffle_entries.find_one({"stripe_session_id": session_id}, {"_id": 0})
    if raffle_entry:
        result["raffle"] = {
            "ticket_numbers": raffle_entry.get("ticket_numbers", []),
            "quantity": raffle_entry.get("quantity", 1),
            "total": raffle_entry.get("total", 0),
            "full_name": raffle_entry.get("full_name", ""),
            "email": raffle_entry.get("email", ""),
            "cause": "Camp Beagle",
        }
    return result

@api_router.get("/orders")
async def get_orders(user=Depends(get_current_user)):
    orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return orders


# ============================================================
# CONTACT FORM
# ============================================================

@api_router.post("/contact")
async def submit_contact_form(req: ContactFormRequest, background_tasks: BackgroundTasks):
    if not req.name or not req.email or not req.message:
        raise HTTPException(status_code=400, detail="Name, email, and message are required")
    await db.contact_messages.insert_one({
        "id": str(uuid.uuid4()),
        "name": req.name, "email": req.email,
        "subject": req.subject, "message": req.message,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    subject_lower = (req.subject or "").lower()
    if "workshop request" in subject_lower:
        to_email = "info@petalandpaw.co.uk"
    elif "event enquiry" in subject_lower:
        to_email = "events@petalandpaw.co.uk"
    else:
        to_email = "contact@petalandpaw.co.uk"
    background_tasks.add_task(send_contact_form_email, req.name, req.email, req.subject, req.message, to_email)
    return {"success": True, "message": "Message received. We'll get back to you soon."}

# ============================================================
# STRIPE WEBHOOK
# ============================================================

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    try:
        event = stripe.Webhook.construct_event(body, signature, os.environ.get("STRIPE_WEBHOOK_SECRET", ""))
        if event["type"] == "checkout.session.completed":
            session = event["data"]["object"]
            session_id = session["id"]
            payment_status = session.get("payment_status", "unpaid")
            if payment_status == "paid":
                await db.payment_transactions.update_one(
                    {"session_id": session_id},
                    {"$set": {"status": "complete", "payment_status": "paid",
                              "updated_at": datetime.now(timezone.utc).isoformat()}}
                )
                await db.orders.update_one(
                    {"stripe_session_id": session_id},
                    {"$set": {"status": "todo", "updated_at": datetime.now(timezone.utc).isoformat()}}
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
    sub_order_count = await db.orders.count_documents({"order_type": "subscription"})
    paid_orders = await db.orders.find({"status": {"$in": ["todo", "complete"]}}, {"_id": 0, "total": 1}).to_list(1000)
    total_revenue = sum(o.get("total", 0) for o in paid_orders)
    todo_count = await db.orders.count_documents({"status": "todo"})
    return {"products": product_count, "orders": order_count, "blog_posts": blog_count,
            "revenue": round(total_revenue, 2), "subscription_orders": sub_order_count,
            "todo_orders": todo_count}

@api_router.put("/admin/orders/{order_id}/status")
async def update_order_status(order_id: str, request: Request, user=Depends(get_current_user)):
    body = await request.json()
    new_status = body.get("status", "todo")
    if new_status not in ["todo", "complete"]:
        raise HTTPException(status_code=400, detail="Status must be 'todo' or 'complete'")
    result = await db.orders.update_one(
        {"id": order_id},
        {"$set": {"status": new_status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": f"Order status updated to {new_status}"}

@api_router.get("/admin/orders/subscriptions")
async def get_subscription_orders(user=Depends(get_current_user)):
    orders = await db.orders.find({"order_type": "subscription"}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return orders

@api_router.get("/admin/transactions")
async def get_transactions(user=Depends(get_current_user)):
    txs = await db.payment_transactions.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return txs

# ============================================================
# CUSTOMER ACCOUNT ROUTES
# ============================================================

@api_router.get("/account/profile")
async def get_account_profile(user=Depends(get_current_user)):
    return user

@api_router.get("/account/orders")
async def get_account_orders(user=Depends(get_current_user)):
    orders = await db.orders.find(
        {"customer_email": user.get("email", "")}, {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return orders

# ============================================================
# REFERRAL ROUTES
# ============================================================

@api_router.get("/referral/code")
async def get_referral_code(user=Depends(get_current_user)):
    if not user.get("referral_code"):
        code = generate_referral_code()
        await db.users.update_one({"user_id": user["user_id"]}, {"$set": {"referral_code": code}})
        return {"code": code, "credits": user.get("credits", 0)}
    return {"code": user["referral_code"], "credits": user.get("credits", 0)}

@api_router.post("/referral/validate")
async def validate_referral_code(req: ReferralApplyRequest):
    referrer = await db.users.find_one({"referral_code": req.code}, {"_id": 0})
    if not referrer:
        raise HTTPException(status_code=404, detail="Invalid referral code")
    return {"valid": True, "referrer_name": referrer.get("name", "A friend"), "discount": 10.0}

# ============================================================
# SEED DATA
# ============================================================

async def seed_data():
    if await db.products.count_documents({}) == 0:
        products = [
            {"id": str(uuid.uuid4()), "name": "Sunset Rose Bouquet", "slug": "sunset-rose-bouquet",
             "description": "A warm, hand-tied bouquet of pet-safe garden roses in soft peach and blush tones.",
             "price": 45.00, "category": "bouquet",
             "image_url": "https://images.unsplash.com/photo-1590419529505-dfa62e8263d1?w=800",
             "images": [], "pet_safe": True, "pet_safe_details": "All roses used are non-toxic to cats and dogs.",
             "in_stock": True, "featured": True, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Sunflower Meadow", "slug": "sunflower-meadow",
             "description": "Bright and cheerful sunflowers paired with pet-safe greenery.",
             "price": 38.00, "category": "bouquet",
             "image_url": "https://images.unsplash.com/photo-1709235555476-1f9aa04ec21c?w=800",
             "images": [], "pet_safe": True, "pet_safe_details": "Sunflowers are completely safe for all pets.",
             "in_stock": True, "featured": True, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Nordic Snapdragon Stems", "slug": "nordic-snapdragon-stems",
             "description": "Elegant snapdragon stems in muted pastels, arranged in our signature minimal style.",
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
             "images": [], "pet_safe": True, "pet_safe_details": "Zinnias are non-toxic to cats, dogs, and horses.",
             "in_stock": True, "featured": False, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Orchid Elegance", "slug": "orchid-elegance",
             "description": "A single statement orchid in a minimalist pot. Pet-safe luxury for the modern home.",
             "price": 55.00, "category": "single-stem",
             "image_url": "https://images.unsplash.com/photo-1567748534269-7baa4e2f8640?w=800",
             "images": [], "pet_safe": True, "pet_safe_details": "Phalaenopsis orchids are safe for cats and dogs.",
             "in_stock": True, "featured": False, "created_at": datetime.now(timezone.utc).isoformat()},
            # Letterbox flowers
            {"id": str(uuid.uuid4()), "name": "Letterbox Sunshine", "slug": "letterbox-sunshine",
             "description": "A compact arrangement of sunflowers and daisies, designed to fit perfectly through your letterbox. Pet-safe and ready to bloom.",
             "price": 24.99, "category": "letterbox",
             "image_url": "https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=800",
             "images": [], "pet_safe": True, "pet_safe_details": "All letterbox flowers are verified pet-safe.",
             "in_stock": True, "featured": True, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Letterbox Bloom Box", "slug": "letterbox-bloom-box",
             "description": "Mixed seasonal pet-safe stems in our signature letterbox packaging. A delightful surprise through the post.",
             "price": 28.99, "category": "letterbox",
             "image_url": "https://images.unsplash.com/photo-1595517710498-0ff10ea35854?w=800",
             "images": [], "pet_safe": True, "pet_safe_details": "Curated for pet safety in every delivery.",
             "in_stock": True, "featured": False, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Letterbox Seasonal", "slug": "letterbox-seasonal",
             "description": "The best of the season in a letterbox-friendly format. Changes monthly with the freshest pet-safe blooms.",
             "price": 26.99, "category": "letterbox",
             "image_url": "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=800",
             "images": [], "pet_safe": True, "pet_safe_details": "Seasonally selected safe flowers.",
             "in_stock": True, "featured": False, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Petunia Pastel Pot", "slug": "petunia-pastel-pot",
             "description": "Soft pastel petunias in a handcrafted ceramic pot. Safe for your entire family, pets included.",
             "price": 42.00, "category": "arrangement",
             "image_url": "https://images.unsplash.com/photo-1536091622320-a47da6e8c274?w=800",
             "images": [], "pet_safe": True, "pet_safe_details": "Petunias are non-toxic to dogs and cats.",
             "in_stock": True, "featured": False, "created_at": datetime.now(timezone.utc).isoformat()},
        ]
        await db.products.insert_many(products)
        logger.info("Seeded products")

    if await db.subscription_plans.count_documents({}) == 0:
        plans = [
            {"id": str(uuid.uuid4()), "name": "Petite Paws", "slug": "petite-paws",
             "description": "A compact, letterbox-friendly arrangement of pet-safe blooms delivered monthly.",
             "price": 29.99, "frequency": "monthly",
             "image_url": "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=800",
             "features": ["Letterbox friendly", "Free delivery", "Biodegradable packaging", "Care guide included"], "pet_toy_price": 8.99},
            {"id": str(uuid.uuid4()), "name": "Classic Bloom", "slug": "classic-bloom",
             "description": "A large, hand-tied monthly bouquet of curated pet-safe flowers, delivered to your door.",
             "price": 54.99, "frequency": "monthly", "stock_limit": 60, "pet_toy_price": 8.99,
             "image_url": "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=800",
             "features": ["Biodegradable packaging", "Free delivery", "Seasonal variety", "Care guide included"]},
            {"id": str(uuid.uuid4()), "name": "Grand Garden", "slug": "grand-garden",
             "description": "Our extra large monthly arrangement with premium pet-safe flowers.",
             "price": 74.99, "frequency": "monthly",
             "image_url": "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=800",
             "features": ["Biodegradable packaging", "Free delivery", "More variety and volume", "Signature wrapping upgrade", "Care guide included"], "pet_toy_price": 8.99},
        ]
        await db.subscription_plans.insert_many(plans)
        logger.info("Seeded subscription plans")

    # Migrate existing subscription plan features
    await db.subscription_plans.update_one(
        {"slug": "petite-paws"},
        {"$set": {"features": ["Letterbox friendly", "Free delivery", "Biodegradable packaging", "Care guide included"], "pet_toy_price": 8.99,
                  "price": 29.99,
                  "image_url": "https://lh3.googleusercontent.com/d/1HbO-wFPT2jwbASvDONkA_aJr_ZQXdKXc=w800"}}
    )
    await db.subscription_plans.update_one(
        {"slug": "classic-bloom"},
        {"$set": {"features": ["Biodegradable packaging", "Free delivery", "Seasonal variety", "Care guide included"], "stock_limit": 60, "pet_toy_price": 8.99,
                  "price": 54.99,
                  "description": "A large, hand-tied monthly bouquet of curated pet-safe flowers, delivered to your door.",
                  "image_url": "https://lh3.googleusercontent.com/d/10eVZW0mATKtuTyfynNGdbw7e1j_oGM79=w800"}}
    )
    await db.subscription_plans.update_one(
        {"slug": "grand-garden"},
        {"$set": {"features": ["Biodegradable packaging", "Free delivery", "More variety and volume", "Signature wrapping upgrade", "Care guide included"], "pet_toy_price": 8.99,
                  "price": 74.99,
                  "description": "Our extra large monthly arrangement with premium pet-safe flowers.",
                  "image_url": "https://lh3.googleusercontent.com/d/1g8jlbTn25IryebH-HgP_dcqVVedy1h8B=w800"}}
    )

    if await db.blog_posts.count_documents({}) == 0:
        posts = [
            {"id": str(uuid.uuid4()), "title": "Pet-Safe Flowers: The Complete Guide", "slug": "pet-safe-flowers-complete-guide",
             "excerpt": "Not all flowers are safe for your furry friends. Here's everything you need to know.",
             "content": "<h2>Why Pet-Safe Flowers Matter</h2><p>As pet owners, we want our homes to be beautiful and safe. Many popular flowers like lilies, tulips, and daffodils can be toxic to cats and dogs.</p><h2>Safe Flowers for Your Home</h2><ul><li><strong>Roses</strong> - Classic beauty without the danger.</li><li><strong>Sunflowers</strong> - Bright, cheerful, and completely safe.</li><li><strong>Gerbera Daisies</strong> - Colorful and non-toxic.</li><li><strong>Snapdragons</strong> - Elegant and completely pet-safe.</li><li><strong>Zinnias</strong> - Hardy, colorful, and safe for curious noses.</li><li><strong>Orchids</strong> - Luxurious and safe for cats and dogs.</li></ul><h2>Flowers to Avoid</h2><p>Some common toxic flowers include lilies, tulips, daffodils, azaleas, and chrysanthemums.</p>",
             "image_url": "https://images.unsplash.com/photo-1548724582-1216ec5351ce?w=800",
             "author": "Dr. Sarah Chen", "published": True, "meta_description": "Complete guide to pet-safe flowers. Learn which flowers are safe for cats and dogs.", "meta_keywords": "pet safe flowers, dog safe flowers, cat safe flowers",
             "created_at": datetime.now(timezone.utc).isoformat(), "updated_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "title": "Minimal Flower Arranging for Beginners", "slug": "minimal-flower-arranging-beginners",
             "excerpt": "Learn the art of minimal, elegant flower arrangement for the modern home.",
             "content": "<h2>The Art of Simplicity</h2><p>Great design is about simplicity, functionality, and connection with nature. A single stem in a beautiful vase can be more impactful than a dozen flowers.</p><h2>Key Principles</h2><ul><li><strong>Less is more</strong> - Let each bloom speak for itself.</li><li><strong>Natural materials</strong> - Choose ceramic, glass, or wooden vessels.</li><li><strong>Muted tones</strong> - Favor soft pastels, whites, and greens.</li></ul>",
             "image_url": "https://images.unsplash.com/photo-1738748986758-ed7bb4c47793?w=800",
             "author": "Emma Lindstrom", "published": True, "meta_description": "Learn minimal flower arranging techniques for an elegant home.", "meta_keywords": "flower arranging, minimal florals, modern design",
             "created_at": datetime.now(timezone.utc).isoformat(), "updated_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "title": "Why Sustainable Packaging Matters", "slug": "sustainable-packaging-matters",
             "excerpt": "Our commitment to the planet goes beyond pet-safe flowers.",
             "content": "<h2>Our Packaging Promise</h2><p>At Petal & Paw, sustainability is woven into everything we do.</p><h2>What We Use</h2><ul><li><strong>Recycled cardboard boxes</strong> - 100% recycled and fully recyclable.</li><li><strong>Biodegradable wrapping</strong> - Plant-based cellophane that composts naturally.</li><li><strong>Water tubes</strong> - Keep stems fresh without wasteful foam.</li></ul>",
             "image_url": "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800",
             "author": "Petal & Paw Team", "published": True, "meta_description": "Learn about Petal & Paw sustainable packaging and eco-friendly delivery.", "meta_keywords": "sustainable flowers, eco friendly packaging, green delivery",
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

    # Enforce unique voucher codes at the DB level
    try:
        await db.vouchers.create_index("code", unique=True)
    except Exception as e:
        logger.warning(f"Could not ensure voucher code index: {e}")

    # Seed a single £35 test voucher for manual QA / demos (idempotent)
    test_code = "PP-TEST-PAWS-3535"
    if await db.vouchers.find_one({"code": test_code}, {"_id": 0}) is None:
        now_iso = datetime.now(timezone.utc).isoformat()
        await db.vouchers.insert_one({
            "id": str(uuid.uuid4()),
            "code": test_code,
            "original_amount": 35.00,
            "remaining_balance": 35.00,
            "purchaser_name": "Petal & Paw (test seed)",
            "purchaser_email": "info@petalandpaw.co.uk",
            "recipient_name": "",
            "recipient_email": "",
            "personal_message": "Internal test voucher - not from a real purchase.",
            "stripe_session_id": "",
            "status": "active",
            "created_at": now_iso,
            "paid_at": now_iso,
        })
        logger.info(f"Seeded test voucher {test_code} (£35)")

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
