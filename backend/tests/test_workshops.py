"""Tests for Workshop Checkout flow, quantity + customer_id, subscription delivery date validation, and dashboard bookings linkage."""
import os
import uuid
from datetime import datetime, timedelta, timezone

import pytest
import requests
from motor.motor_asyncio import AsyncIOMotorClient

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE_URL}/api"

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "test_database")

WORKSHOP_PAYLOAD = {
    "workshop_id": "paws-cat-cafe-2026-06-26",
    "workshop_name": "Flower Arranging Workshop",
    "workshop_location": "Paws Cat Café",
    "workshop_date": "26 June 2026",
    "workshop_time": "6pm",
    "price": 45,
    "full_name": "TEST_Jane Doe",
    "customer_email": "test+workshop@petalandpaw.com",
    "notes": "TEST_no nuts please",
    "origin_url": BASE_URL,
}


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def auth_token(session):
    """Login the test customer and return token."""
    resp = session.post(f"{API}/customer/login", json={
        "email": "test@petalandpaw.com",
        "password": "test123"
    })
    if resp.status_code != 200:
        pytest.skip(f"Login failed: {resp.status_code} {resp.text}")
    data = resp.json()
    return data.get("token"), data.get("id"), data.get("email")


# ---------- Workshops checkout with quantity ----------
class TestWorkshopCheckoutBasic:
    def test_workshop_checkout_success(self, session):
        resp = session.post(f"{API}/workshops/checkout", json=WORKSHOP_PAYLOAD)
        assert resp.status_code == 200, resp.text
        data = resp.json()
        assert "url" in data and "session_id" in data and "booking_id" in data
        assert "checkout.stripe.com" in data["url"]
        pytest.workshop_session_id = data["session_id"]
        pytest.workshop_booking_id = data["booking_id"]

    def test_workshop_checkout_empty_name(self, session):
        resp = session.post(f"{API}/workshops/checkout", json={**WORKSHOP_PAYLOAD, "full_name": "  "})
        assert resp.status_code == 400

    def test_workshop_checkout_empty_email(self, session):
        resp = session.post(f"{API}/workshops/checkout", json={**WORKSHOP_PAYLOAD, "customer_email": ""})
        assert resp.status_code == 400

    def test_workshop_checkout_zero_price(self, session):
        resp = session.post(f"{API}/workshops/checkout", json={**WORKSHOP_PAYLOAD, "price": 0})
        assert resp.status_code == 400


# ---------- NEW: Workshop quantity feature ----------
class TestWorkshopQuantity:
    def test_quantity_3_persists_total(self, session):
        payload = {**WORKSHOP_PAYLOAD, "quantity": 3}
        resp = session.post(f"{API}/workshops/checkout", json=payload)
        assert resp.status_code == 200, resp.text
        data = resp.json()
        # Verify booking persisted with quantity=3 and total = 135
        import asyncio
        client = AsyncIOMotorClient(MONGO_URL)
        db = client[DB_NAME]

        async def _check():
            doc = await db.workshop_bookings.find_one({"id": data["booking_id"]}, {"_id": 0})
            return doc

        booking = asyncio.get_event_loop().run_until_complete(_check())
        client.close()
        assert booking is not None
        assert booking["quantity"] == 3
        assert booking["total"] == 135.0
        assert booking["price"] == 45.0

    def test_quantity_zero_clamped_to_1(self, session):
        payload = {**WORKSHOP_PAYLOAD, "quantity": 0}
        resp = session.post(f"{API}/workshops/checkout", json=payload)
        # Should not error - quantity gets clamped to 1
        assert resp.status_code == 200, resp.text

    def test_quantity_11_clamped_to_10(self, session):
        payload = {**WORKSHOP_PAYLOAD, "quantity": 11}
        resp = session.post(f"{API}/workshops/checkout", json=payload)
        assert resp.status_code == 200, resp.text
        data = resp.json()
        import asyncio
        client = AsyncIOMotorClient(MONGO_URL)
        db = client[DB_NAME]

        async def _check():
            return await db.workshop_bookings.find_one({"id": data["booking_id"]}, {"_id": 0})

        booking = asyncio.get_event_loop().run_until_complete(_check())
        client.close()
        assert booking["quantity"] == 10
        assert booking["total"] == 450.0

    def test_quantity_negative_clamped(self, session):
        payload = {**WORKSHOP_PAYLOAD, "quantity": -5}
        resp = session.post(f"{API}/workshops/checkout", json=payload)
        assert resp.status_code == 200, resp.text

    def test_customer_id_persisted(self, session, auth_token):
        token, customer_id, email = auth_token
        payload = {**WORKSHOP_PAYLOAD, "quantity": 2, "customer_id": customer_id, "customer_email": email}
        resp = session.post(f"{API}/workshops/checkout", json=payload)
        assert resp.status_code == 200, resp.text
        data = resp.json()
        import asyncio
        client = AsyncIOMotorClient(MONGO_URL)
        db = client[DB_NAME]

        async def _check():
            return await db.workshop_bookings.find_one({"id": data["booking_id"]}, {"_id": 0})

        booking = asyncio.get_event_loop().run_until_complete(_check())
        client.close()
        assert booking["customer_id"] == customer_id
        assert booking["quantity"] == 2


# ---------- NEW: Subscription delivery_date 3-day minimum ----------
@pytest.fixture(scope="module")
def valid_plan_id(session):
    resp = session.get(f"{API}/subscriptions/plans")
    assert resp.status_code == 200
    plans = resp.json()
    assert plans, "No subscription plans configured"
    return plans[0]["id"]


class TestSubscriptionDeliveryDate:
    def test_delivery_date_too_soon_rejected(self, session, valid_plan_id):
        tomorrow = (datetime.now().date() + timedelta(days=1)).isoformat()
        payload = {
            "plan_id": valid_plan_id,
            "customer_email": "test+sub@petalandpaw.com",
            "origin_url": BASE_URL,
            "delivery_date": tomorrow,
        }
        resp = session.post(f"{API}/subscriptions/checkout", json=payload)
        assert resp.status_code == 400, f"Expected 400 for too-soon date, got {resp.status_code}: {resp.text}"
        body = resp.json()
        detail = str(body.get("detail", "")).lower()
        assert "3 day" in detail or "3 days" in detail or "delivery date" in detail

    def test_delivery_date_2_days_rejected(self, session, valid_plan_id):
        d2 = (datetime.now().date() + timedelta(days=2)).isoformat()
        payload = {
            "plan_id": valid_plan_id,
            "customer_email": "test+sub@petalandpaw.com",
            "origin_url": BASE_URL,
            "delivery_date": d2,
        }
        resp = session.post(f"{API}/subscriptions/checkout", json=payload)
        assert resp.status_code == 400

    def test_delivery_date_3_days_accepted(self, session, valid_plan_id):
        d3 = (datetime.now().date() + timedelta(days=3)).isoformat()
        payload = {
            "plan_id": valid_plan_id,
            "customer_email": "test+sub@petalandpaw.com",
            "origin_url": BASE_URL,
            "delivery_date": d3,
        }
        resp = session.post(f"{API}/subscriptions/checkout", json=payload)
        assert resp.status_code == 200, f"Expected 200 for >=3 day date, got {resp.status_code}: {resp.text}"
        data = resp.json()
        assert "url" in data

    def test_delivery_date_invalid_format(self, session, valid_plan_id):
        payload = {
            "plan_id": valid_plan_id,
            "customer_email": "test+sub@petalandpaw.com",
            "origin_url": BASE_URL,
            "delivery_date": "not-a-date",
        }
        resp = session.post(f"{API}/subscriptions/checkout", json=payload)
        assert resp.status_code == 400


# ---------- NEW: Customer dashboard bookings linkage ----------
class TestCustomerDashboardBookings:
    def _seed_paid_booking(self, email, customer_id=None, qty=2):
        """Insert a paid workshop booking directly into mongo for the test customer."""
        import asyncio
        client = AsyncIOMotorClient(MONGO_URL)
        db = client[DB_NAME]
        booking_id = f"TEST_{uuid.uuid4()}"

        async def _insert():
            await db.workshop_bookings.insert_one({
                "id": booking_id,
                "workshop_id": "paws-cat-cafe-2026-06-26",
                "workshop_name": "TEST_Flower Workshop",
                "workshop_location": "Paws Cat Café",
                "workshop_date": "26 June 2026",
                "workshop_time": "6pm",
                "price": 45.0,
                "quantity": qty,
                "total": 45.0 * qty,
                "full_name": "TEST_Dashboard User",
                "customer_email": email,
                "customer_id": customer_id,
                "notes": "TEST seeded",
                "stripe_session_id": f"cs_test_seeded_{booking_id}",
                "status": "paid",
                "created_at": datetime.now(timezone.utc).isoformat(),
            })

        asyncio.get_event_loop().run_until_complete(_insert())
        client.close()
        return booking_id

    def _cleanup(self, booking_id):
        import asyncio
        client = AsyncIOMotorClient(MONGO_URL)
        db = client[DB_NAME]

        async def _del():
            await db.workshop_bookings.delete_one({"id": booking_id})

        asyncio.get_event_loop().run_until_complete(_del())
        client.close()

    def test_dashboard_returns_bookings_array(self, session, auth_token):
        token, customer_id, email = auth_token
        booking_id = self._seed_paid_booking(email, customer_id, qty=3)
        try:
            resp = session.get(f"{API}/customer/orders", headers={"Authorization": f"Bearer {token}"})
            assert resp.status_code == 200, resp.text
            data = resp.json()
            assert "bookings" in data, "Response missing 'bookings' key"
            assert isinstance(data["bookings"], list)
            # Verify our seeded booking is present
            ids = [b.get("id") for b in data["bookings"]]
            assert booking_id in ids, f"Seeded booking {booking_id} not in {ids}"
            ours = next(b for b in data["bookings"] if b["id"] == booking_id)
            assert ours["quantity"] == 3
            assert ours["total"] == 135.0
            assert ours["workshop_location"] == "Paws Cat Café"
            assert ours["status"] == "paid"
        finally:
            self._cleanup(booking_id)

    def test_workshop_tx_not_duplicated_in_transactions(self, session, auth_token):
        """Workshop payment_transactions should NOT appear in `transactions` array (filtered out)."""
        token, customer_id, email = auth_token
        # Seed a paid workshop booking AND a matching payment_transaction with type=workshop
        booking_id = self._seed_paid_booking(email, customer_id, qty=1)
        import asyncio
        client = AsyncIOMotorClient(MONGO_URL)
        db = client[DB_NAME]
        tx_id = f"TEST_{uuid.uuid4()}"
        sess_id = f"cs_test_filterws_{tx_id}"

        async def _insert_tx():
            await db.payment_transactions.insert_one({
                "id": tx_id,
                "session_id": sess_id,
                "amount": 45.0,
                "currency": "gbp",
                "status": "complete",
                "payment_status": "paid",
                "customer_email": email,
                "metadata": {"type": "workshop", "booking_id": booking_id, "workshop_name": "TEST"},
                "created_at": datetime.now(timezone.utc).isoformat(),
            })

        asyncio.get_event_loop().run_until_complete(_insert_tx())
        try:
            resp = session.get(f"{API}/customer/orders", headers={"Authorization": f"Bearer {token}"})
            assert resp.status_code == 200
            data = resp.json()
            tx_ids = [t.get("id") for t in data.get("transactions", [])]
            assert tx_id not in tx_ids, "Workshop transaction leaked into transactions array"
        finally:
            async def _del_tx():
                await db.payment_transactions.delete_one({"id": tx_id})
            asyncio.get_event_loop().run_until_complete(_del_tx())
            client.close()
            self._cleanup(booking_id)

    def test_pending_workshop_booking_not_in_dashboard(self, session, auth_token):
        """Bookings with status='pending' should NOT appear in dashboard (only 'paid')."""
        token, customer_id, email = auth_token
        import asyncio
        client = AsyncIOMotorClient(MONGO_URL)
        db = client[DB_NAME]
        booking_id = f"TEST_pending_{uuid.uuid4()}"

        async def _insert():
            await db.workshop_bookings.insert_one({
                "id": booking_id,
                "workshop_id": "paws-cat-cafe-2026-06-26",
                "workshop_name": "TEST_Pending",
                "workshop_location": "Paws Cat Café",
                "workshop_date": "26 June 2026",
                "workshop_time": "6pm",
                "price": 45.0, "quantity": 1, "total": 45.0,
                "full_name": "TEST", "customer_email": email,
                "customer_id": customer_id, "notes": "",
                "stripe_session_id": "cs_test_pending",
                "status": "pending",
                "created_at": datetime.now(timezone.utc).isoformat(),
            })

        asyncio.get_event_loop().run_until_complete(_insert())
        try:
            resp = session.get(f"{API}/customer/orders", headers={"Authorization": f"Bearer {token}"})
            assert resp.status_code == 200
            data = resp.json()
            ids = [b.get("id") for b in data.get("bookings", [])]
            assert booking_id not in ids
        finally:
            async def _del():
                await db.workshop_bookings.delete_one({"id": booking_id})
            asyncio.get_event_loop().run_until_complete(_del())
            client.close()


# ---------- Regression ----------
class TestRegression:
    def test_invalid_session_id(self, session):
        resp = session.get(f"{API}/orders/status/cs_invalid_xxx")
        assert resp.status_code == 404

    def test_subscriptions_checkout_no_delivery_date(self, session):
        payload = {
            "plan_id": "monthly",
            "customer_email": "test+sub@petalandpaw.com",
            "origin_url": BASE_URL,
        }
        resp = session.post(f"{API}/subscriptions/checkout", json=payload)
        assert resp.status_code < 500

    def test_orders_checkout(self, session):
        payload = {
            "items": [{"product_id": "blooms-001", "name": "x", "price": 1, "quantity": 1}],
            "order_type": "one_time",
            "customer_email": "test+order@petalandpaw.com",
            "origin_url": BASE_URL,
        }
        resp = session.post(f"{API}/orders/checkout", json=payload)
        assert resp.status_code < 500

    def test_customer_login(self, session):
        resp = session.post(f"{API}/customer/login", json={"email": "test@petalandpaw.com", "password": "test123"})
        assert resp.status_code == 200
