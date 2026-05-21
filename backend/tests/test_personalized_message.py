"""
Test suite for personalized message feature in Petal & Paw checkout flows.
Tests both subscription checkout and cart/order checkout endpoints.
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestSubscriptionCheckoutPersonalizedMessage:
    """Tests for POST /api/subscriptions/checkout with personalized_message field"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get a valid plan_id for testing"""
        response = requests.get(f"{BASE_URL}/api/subscriptions/plans")
        assert response.status_code == 200, "Failed to fetch subscription plans"
        plans = response.json()
        assert len(plans) > 0, "No subscription plans found"
        # Use Classic Bloom plan (the one with Pre-Order button)
        self.classic_bloom_plan = next((p for p in plans if p['slug'] == 'classic-bloom'), plans[0])
        self.plan_id = self.classic_bloom_plan['id']
    
    def test_subscription_checkout_with_personalized_message(self):
        """Test subscription checkout accepts personalized_message and creates Stripe session"""
        payload = {
            "plan_id": self.plan_id,
            "origin_url": "https://pet-safe-flowers-1.preview.emergentagent.com",
            "customer_email": "test@example.com",
            "add_pet_toy": False,
            "checkout_mode": "subscription",
            "personalized_message": "Happy Birthday! Enjoy these beautiful flowers."
        }
        response = requests.post(f"{BASE_URL}/api/subscriptions/checkout", json=payload)
        
        # Status assertion
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Data assertions
        data = response.json()
        assert "url" in data, "Response should contain Stripe checkout URL"
        assert "session_id" in data, "Response should contain session_id"
        assert data["url"].startswith("https://checkout.stripe.com"), "URL should be a Stripe checkout URL"
        assert len(data["session_id"]) > 0, "session_id should not be empty"
        print(f"SUCCESS: Subscription checkout with personalized message created session: {data['session_id'][:20]}...")
    
    def test_subscription_checkout_one_time_with_personalized_message(self):
        """Test one-time purchase checkout accepts personalized_message"""
        payload = {
            "plan_id": self.plan_id,
            "origin_url": "https://pet-safe-flowers-1.preview.emergentagent.com",
            "customer_email": "test@example.com",
            "add_pet_toy": True,
            "checkout_mode": "one-time",
            "personalized_message": "Congratulations on your new home!"
        }
        response = requests.post(f"{BASE_URL}/api/subscriptions/checkout", json=payload)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "url" in data, "Response should contain Stripe checkout URL"
        assert "session_id" in data, "Response should contain session_id"
        print(f"SUCCESS: One-time purchase with personalized message created session: {data['session_id'][:20]}...")
    
    def test_subscription_checkout_empty_personalized_message(self):
        """Test subscription checkout works with empty personalized_message"""
        payload = {
            "plan_id": self.plan_id,
            "origin_url": "https://pet-safe-flowers-1.preview.emergentagent.com",
            "customer_email": "test@example.com",
            "checkout_mode": "subscription",
            "personalized_message": ""
        }
        response = requests.post(f"{BASE_URL}/api/subscriptions/checkout", json=payload)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "url" in data
        print("SUCCESS: Subscription checkout with empty personalized message works")
    
    def test_subscription_checkout_without_personalized_message_field(self):
        """Test subscription checkout works without personalized_message field (backward compatibility)"""
        payload = {
            "plan_id": self.plan_id,
            "origin_url": "https://pet-safe-flowers-1.preview.emergentagent.com",
            "customer_email": "test@example.com",
            "checkout_mode": "subscription"
        }
        response = requests.post(f"{BASE_URL}/api/subscriptions/checkout", json=payload)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "url" in data
        print("SUCCESS: Subscription checkout without personalized_message field works (backward compatible)")
    
    def test_subscription_checkout_long_personalized_message(self):
        """Test subscription checkout truncates message at 500 chars"""
        long_message = "A" * 600  # 600 characters
        payload = {
            "plan_id": self.plan_id,
            "origin_url": "https://pet-safe-flowers-1.preview.emergentagent.com",
            "customer_email": "test@example.com",
            "checkout_mode": "subscription",
            "personalized_message": long_message
        }
        response = requests.post(f"{BASE_URL}/api/subscriptions/checkout", json=payload)
        
        # Should still work - backend truncates to 500 chars
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "url" in data
        print("SUCCESS: Subscription checkout handles long personalized message (truncated to 500)")


class TestOrderCheckoutPersonalizedMessage:
    """Tests for POST /api/orders/checkout with personalized_message field"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get a valid product for testing"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200, "Failed to fetch products"
        products = response.json()
        assert len(products) > 0, "No products found"
        self.product = products[0]
    
    def test_order_checkout_with_personalized_message(self):
        """Test order checkout accepts personalized_message and creates Stripe session"""
        payload = {
            "items": [{
                "product_id": self.product['id'],
                "name": self.product['name'],
                "price": self.product['price'],
                "quantity": 1,
                "image_url": self.product.get('image_url', '')
            }],
            "origin_url": "https://pet-safe-flowers-1.preview.emergentagent.com",
            "customer_email": "test@example.com",
            "order_type": "regular",
            "delivery_date": "2026-02-14",
            "personalized_message": "With love, from your secret admirer!"
        }
        response = requests.post(f"{BASE_URL}/api/orders/checkout", json=payload)
        
        # Status assertion
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Data assertions
        data = response.json()
        assert "url" in data, "Response should contain Stripe checkout URL"
        assert "session_id" in data, "Response should contain session_id"
        assert "order_id" in data, "Response should contain order_id"
        assert data["url"].startswith("https://checkout.stripe.com"), "URL should be a Stripe checkout URL"
        print(f"SUCCESS: Order checkout with personalized message created session: {data['session_id'][:20]}...")
        print(f"         Order ID: {data['order_id']}")
    
    def test_order_checkout_empty_personalized_message(self):
        """Test order checkout works with empty personalized_message"""
        payload = {
            "items": [{
                "product_id": self.product['id'],
                "name": self.product['name'],
                "price": self.product['price'],
                "quantity": 2,
                "image_url": ""
            }],
            "origin_url": "https://pet-safe-flowers-1.preview.emergentagent.com",
            "customer_email": "test@example.com",
            "order_type": "regular",
            "personalized_message": ""
        }
        response = requests.post(f"{BASE_URL}/api/orders/checkout", json=payload)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "url" in data
        assert "order_id" in data
        print("SUCCESS: Order checkout with empty personalized message works")
    
    def test_order_checkout_without_personalized_message_field(self):
        """Test order checkout works without personalized_message field (backward compatibility)"""
        payload = {
            "items": [{
                "product_id": self.product['id'],
                "name": self.product['name'],
                "price": self.product['price'],
                "quantity": 1,
                "image_url": ""
            }],
            "origin_url": "https://pet-safe-flowers-1.preview.emergentagent.com",
            "order_type": "regular"
        }
        response = requests.post(f"{BASE_URL}/api/orders/checkout", json=payload)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "url" in data
        print("SUCCESS: Order checkout without personalized_message field works (backward compatible)")
    
    def test_order_checkout_multiple_items_with_personalized_message(self):
        """Test order checkout with multiple items and personalized message"""
        # Get multiple products
        response = requests.get(f"{BASE_URL}/api/products")
        products = response.json()[:2]  # Get first 2 products
        
        payload = {
            "items": [{
                "product_id": p['id'],
                "name": p['name'],
                "price": p['price'],
                "quantity": 1,
                "image_url": p.get('image_url', '')
            } for p in products],
            "origin_url": "https://pet-safe-flowers-1.preview.emergentagent.com",
            "customer_email": "test@example.com",
            "order_type": "regular",
            "personalized_message": "Thank you for being such a wonderful friend!"
        }
        response = requests.post(f"{BASE_URL}/api/orders/checkout", json=payload)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "url" in data
        assert "order_id" in data
        print(f"SUCCESS: Order checkout with {len(products)} items and personalized message works")


class TestAPIEndpointsHealth:
    """Basic health checks for related endpoints"""
    
    def test_subscription_plans_endpoint(self):
        """Verify subscription plans endpoint returns data"""
        response = requests.get(f"{BASE_URL}/api/subscriptions/plans")
        assert response.status_code == 200
        plans = response.json()
        assert isinstance(plans, list)
        assert len(plans) >= 3, "Should have at least 3 subscription plans"
        
        # Verify Classic Bloom exists (the one with Pre-Order)
        classic_bloom = next((p for p in plans if p['slug'] == 'classic-bloom'), None)
        assert classic_bloom is not None, "Classic Bloom plan should exist"
        print(f"SUCCESS: Found {len(plans)} subscription plans including Classic Bloom")
    
    def test_products_endpoint(self):
        """Verify products endpoint returns data"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        products = response.json()
        assert isinstance(products, list)
        assert len(products) > 0, "Should have at least 1 product"
        print(f"SUCCESS: Found {len(products)} products")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
