"""Tests for Workshop Checkout flow and regressions."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://pet-safe-flowers-1.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---------- Workshops checkout ----------
class TestWorkshopCheckout:
    valid_payload = {
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

    def test_workshop_checkout_success(self, session):
        resp = session.post(f"{API}/workshops/checkout", json=self.valid_payload)
        assert resp.status_code == 200, f"unexpected: {resp.status_code} {resp.text}"
        data = resp.json()
        assert "url" in data and "session_id" in data and "booking_id" in data
        assert "checkout.stripe.com" in data["url"]
        assert data["session_id"].startswith("cs_")
        # store for next test
        pytest.workshop_session_id = data["session_id"]
        pytest.workshop_booking_id = data["booking_id"]

    def test_workshop_booking_persisted(self, session):
        # Use the status endpoint to verify (we can't query mongo directly)
        # Stripe session unpaid -> should not crash
        sid = getattr(pytest, "workshop_session_id", None)
        if not sid:
            pytest.skip("No session id from prior test")
        resp = session.get(f"{API}/orders/status/{sid}")
        assert resp.status_code == 200, f"{resp.status_code} {resp.text}"
        data = resp.json()
        assert "payment_status" in data
        # Should be unpaid since we didn't actually pay
        assert data["payment_status"] in ("unpaid", "no_payment_required")

    def test_workshop_checkout_empty_name(self, session):
        payload = {**self.valid_payload, "full_name": "  "}
        resp = session.post(f"{API}/workshops/checkout", json=payload)
        assert resp.status_code == 400

    def test_workshop_checkout_empty_email(self, session):
        payload = {**self.valid_payload, "customer_email": ""}
        resp = session.post(f"{API}/workshops/checkout", json=payload)
        assert resp.status_code == 400

    def test_workshop_checkout_zero_price(self, session):
        payload = {**self.valid_payload, "price": 0}
        resp = session.post(f"{API}/workshops/checkout", json=payload)
        assert resp.status_code == 400

    def test_workshop_checkout_negative_price(self, session):
        payload = {**self.valid_payload, "price": -5}
        resp = session.post(f"{API}/workshops/checkout", json=payload)
        assert resp.status_code == 400


# ---------- Regression: order status with invalid session ----------
class TestOrderStatusRegression:
    def test_invalid_session_id(self, session):
        resp = session.get(f"{API}/orders/status/cs_invalid_xxx")
        assert resp.status_code == 404


# ---------- Regression: existing subscription/cart checkout ----------
class TestRegressionCheckouts:
    def test_subscriptions_checkout(self, session):
        # The subscription endpoint - we just verify it does not 5xx broken
        payload = {
            "plan_id": "monthly",
            "customer_email": "test+sub@petalandpaw.com",
            "origin_url": BASE_URL,
        }
        resp = session.post(f"{API}/subscriptions/checkout", json=payload)
        # Either it's valid (200) or 4xx for known input mismatches; never 500
        assert resp.status_code < 500, f"subscriptions/checkout broken: {resp.status_code} {resp.text}"

    def test_orders_checkout(self, session):
        payload = {
            "items": [{"product_id": "blooms-001", "quantity": 1}],
            "order_type": "one_time",
            "customer_email": "test+order@petalandpaw.com",
            "origin_url": BASE_URL,
        }
        resp = session.post(f"{API}/orders/checkout", json=payload)
        assert resp.status_code < 500, f"orders/checkout broken: {resp.status_code} {resp.text}"

    def test_customer_login(self, session):
        payload = {"email": "test@petalandpaw.com", "password": "test123"}
        resp = session.post(f"{API}/customer/login", json=payload)
        assert resp.status_code < 500, f"customer/login broken: {resp.status_code} {resp.text}"
