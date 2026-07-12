#!/usr/bin/env python3

import requests
import sys
from datetime import datetime
import json

class PetalPawTester:
    def __init__(self, base_url="https://event-time-format.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {method} {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            else:
                raise ValueError(f"Unsupported method: {method}")

            print(f"   Response Status: {response.status_code}")
            
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ {name} - Status: {response.status_code}")
                
                # Return response data if successful
                try:
                    response_data = response.json()
                    print(f"   Response data keys: {list(response_data.keys()) if isinstance(response_data, dict) else 'Array with length: ' + str(len(response_data)) if isinstance(response_data, list) else 'Not a dict/array'}")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ {name} - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                self.failed_tests.append(f"{name}: Expected {expected_status}, got {response.status_code}")
                return False, {}

        except Exception as e:
            print(f"❌ {name} - Error: {str(e)}")
            self.failed_tests.append(f"{name}: {str(e)}")
            return False, {}

    def test_products(self):
        """Test product endpoints"""
        print("\n" + "="*60)
        print("TESTING PRODUCT ENDPOINTS")
        print("="*60)
        
        # Test get all products
        success, products = self.run_test(
            "GET /api/products - All products",
            "GET", "/products", 200
        )
        
        if success:
            print(f"   📊 Found {len(products)} products")
            if len(products) != 10:
                print(f"   ⚠️  Expected 10 products, got {len(products)}")
                
            # Check for letterbox category products
            letterbox_count = sum(1 for p in products if p.get('category') == 'letterbox')
            print(f"   📊 Letterbox products: {letterbox_count}")
        
        # Test letterbox category filter
        success, letterbox = self.run_test(
            "GET /api/products?category=letterbox - Letterbox category",
            "GET", "/products?category=letterbox", 200
        )
        
        if success:
            print(f"   📊 Found {len(letterbox)} letterbox products")
            if len(letterbox) != 3:
                print(f"   ⚠️  Expected 3 letterbox products, got {len(letterbox)}")
        
        # Test product search
        success, rose_results = self.run_test(
            "GET /api/products/search?q=rose - Search for 'rose'",
            "GET", "/products/search?q=rose", 200
        )
        
        if success:
            print(f"   📊 Found {len(rose_results)} products matching 'rose'")
        
        # Test letterbox search
        success, letterbox_search = self.run_test(
            "GET /api/products/search?q=letterbox - Search for 'letterbox'",
            "GET", "/products/search?q=letterbox", 200
        )
        
        if success:
            print(f"   📊 Found {len(letterbox_search)} products matching 'letterbox'")
            if len(letterbox_search) != 3:
                print(f"   ⚠️  Expected 3 letterbox search results, got {len(letterbox_search)}")
        
        # Test featured products
        success, featured = self.run_test(
            "GET /api/products?featured=true - Featured products",
            "GET", "/products?featured=true", 200
        )
        
        if success:
            print(f"   📊 Found {len(featured)} featured products")
            featured_count = sum(1 for p in featured if p.get('featured', False))
            print(f"   📊 Actually featured: {featured_count}")
        
        # Test category filter
        success, bouquets = self.run_test(
            "GET /api/products?category=bouquet - Bouquet category",
            "GET", "/products?category=bouquet", 200
        )
        
        if success:
            print(f"   📊 Found {len(bouquets)} bouquets")
        
        # Test single product by slug
        success, product = self.run_test(
            "GET /api/products/sunset-rose-bouquet - Single product",
            "GET", "/products/sunset-rose-bouquet", 200
        )
        
        if success:
            print(f"   📊 Product: {product.get('name', 'No name')} - ${product.get('price', 0)}")

    def test_subscriptions(self):
        """Test subscription endpoints"""
        print("\n" + "="*60)
        print("TESTING SUBSCRIPTION ENDPOINTS")
        print("="*60)
        
        success, plans = self.run_test(
            "GET /api/subscriptions/plans - Subscription plans",
            "GET", "/subscriptions/plans", 200
        )
        
        if success:
            print(f"   📊 Found {len(plans)} subscription plans")
            if len(plans) != 3:
                print(f"   ⚠️  Expected 3 plans, got {len(plans)}")
            
            # Check if all plans are monthly-only
            monthly_count = sum(1 for plan in plans if plan.get('frequency') == 'monthly')
            print(f"   📊 Monthly-only plans: {monthly_count}/{len(plans)}")
            
            for plan in plans:
                print(f"   📦 {plan.get('name', 'No name')} - ${plan.get('price', 0)}/{plan.get('frequency', 'unknown')}")
    
    def test_bouquet_builder(self):
        """Test bouquet builder endpoints"""
        print("\n" + "="*60)
        print("TESTING BOUQUET BUILDER ENDPOINTS")
        print("="*60)
        
        # Test bouquet sizes
        success, sizes = self.run_test(
            "GET /api/bouquet/sizes - Bouquet sizes",
            "GET", "/bouquet/sizes", 200
        )
        
        if success:
            print(f"   📊 Found {len(sizes)} bouquet sizes")
            if len(sizes) != 3:
                print(f"   ⚠️  Expected 3 sizes, got {len(sizes)}")
            for size in sizes:
                print(f"   📐 {size.get('name', 'No name')} - {size.get('stems', 'No stem info')} - ${size.get('price', 0)}")
        
        success, flowers = self.run_test(
            "GET /api/bouquet/flowers - Bouquet flowers",
            "GET", "/bouquet/flowers", 200
        )
        
        if success:
            print(f"   📊 Found {len(flowers)} bouquet flowers")
            if len(flowers) != 11:
                print(f"   ⚠️  Expected 11 flowers, got {len(flowers)}")
        
        # Test save bouquet with step-based data
        test_bouquet_data = {
            "size": "medium",
            "flowers": [
                {"id": "flower1", "name": "Test Rose", "price": 5.50, "quantity": 3},
                {"id": "flower2", "name": "Test Sunflower", "price": 4.00, "quantity": 2}
            ],
            "pet_type": "dog",
            "add_pet_toy": True
        }
        
        success, saved_bouquet = self.run_test(
            "POST /api/bouquet/save - Save custom bouquet with step-based data",
            "POST", "/bouquet/save", 200,
            data=test_bouquet_data
        )
        
        if success:
            print(f"   📊 Saved bouquet: ID={saved_bouquet.get('id', 'No ID')}, Total=${saved_bouquet.get('total_price', 0)}")
            # Expected: medium size (38) + flowers (5.50*3 + 4.00*2) + pet toy (8.99) = 38 + 24.5 + 8.99 = 71.49
            expected_total = 38 + (5.50 * 3) + (4.00 * 2) + 8.99
            actual_total = saved_bouquet.get('total_price', 0)
            if abs(actual_total - expected_total) < 0.01:
                print(f"   ✅ Price calculation correct: ${actual_total}")
            else:
                print(f"   ❌ Price calculation wrong: Expected ${expected_total}, got ${actual_total}")

    def test_referral_system(self):
        """Test referral system endpoints"""
        print("\n" + "="*60)
        print("TESTING REFERRAL SYSTEM ENDPOINTS")
        print("="*60)
        
        # Test referral code validation with a fake code
        success, _ = self.run_test(
            "POST /api/referral/validate - Invalid referral code",
            "POST", "/referral/validate", 404,
            data={"code": "INVALID123"}
        )
        
        if success:
            print("   ✅ Invalid referral code correctly returns 404")

    def test_admin_endpoints(self):
        """Test admin endpoints"""
        print("\n" + "="*60)
        print("TESTING ADMIN ENDPOINTS")
        print("="*60)
        
        # Test admin stats (should require auth)
        success, _ = self.run_test(
            "GET /api/admin/stats - Admin stats (unauthenticated)",
            "GET", "/admin/stats", 401
        )
        
        if success:
            print("   ✅ Admin stats correctly requires authentication")
        
        # Test admin subscription orders (should require auth)
        success, _ = self.run_test(
            "GET /api/admin/orders/subscriptions - Subscription orders (unauthenticated)",
            "GET", "/admin/orders/subscriptions", 401
        )
        
        if success:
            print("   ✅ Admin subscription orders correctly requires authentication")

    def test_blog(self):
        """Test blog endpoints"""
        print("\n" + "="*60)
        print("TESTING BLOG ENDPOINTS")
        print("="*60)
        
        success, posts = self.run_test(
            "GET /api/blog - All blog posts",
            "GET", "/blog", 200
        )
        
        if success:
            print(f"   📊 Found {len(posts)} blog posts")
            if len(posts) != 3:
                print(f"   ⚠️  Expected 3 posts, got {len(posts)}")
            
            # Check for SEO metadata
            posts_with_seo = sum(1 for post in posts if post.get('meta_description') or post.get('meta_keywords'))
            print(f"   📊 Posts with SEO metadata: {posts_with_seo}/{len(posts)}")
        
        # Test single blog post
        success, post = self.run_test(
            "GET /api/blog/pet-safe-flowers-complete-guide - Single blog post",
            "GET", "/blog/pet-safe-flowers-complete-guide", 200
        )
        
        if success:
            print(f"   📊 Post: {post.get('title', 'No title')}")
            has_meta_desc = bool(post.get('meta_description'))
            has_meta_keywords = bool(post.get('meta_keywords'))
            print(f"   📊 SEO metadata - Description: {has_meta_desc}, Keywords: {has_meta_keywords}")

    def test_checkout(self):
        """Test checkout endpoints"""
        print("\n" + "="*60)
        print("TESTING CHECKOUT ENDPOINTS")
        print("="*60)
        
        # First get a real product to use for checkout
        success, products = self.run_test(
            "GET /api/products - Get products for checkout test",
            "GET", "/products", 200
        )
        
        if not success or not products:
            print("   ❌ Cannot test checkout - no products available")
            return
        
        # Use first product for checkout test
        product = products[0]
        test_items = [
            {
                "product_id": product["id"],
                "name": product["name"],
                "price": product["price"],
                "quantity": 1,
                "image_url": product.get("image_url", "")
            }
        ]
        
        # Test checkout with delivery date and referral code
        success, checkout = self.run_test(
            "POST /api/orders/checkout - Create checkout session with delivery_date and referral_code",
            "POST", "/orders/checkout", 200,
            data={
                "items": test_items,
                "origin_url": self.base_url,
                "order_type": "regular",
                "delivery_date": "2025-01-15",
                "referral_code": "TESTCODE"
            }
        )
        
        if success:
            print(f"   📊 Checkout URL: {checkout.get('url', 'No URL')[:50]}...")
            print(f"   📊 Session ID: {checkout.get('session_id', 'No session ID')}")
            print(f"   📊 Order ID: {checkout.get('order_id', 'No order ID')}")

    def test_auth_endpoints(self):
        """Test auth endpoints - should return 401 when not authenticated"""
        print("\n" + "="*60)
        print("TESTING AUTH ENDPOINTS")
        print("="*60)
        
        success, _ = self.run_test(
            "GET /api/auth/me - Should return 401 when not authenticated",
            "GET", "/auth/me", 401
        )
        
        if success:
            print("   ✅ Auth endpoint correctly returns 401 for unauthenticated requests")

    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*60)
        print("BACKEND API TEST SUMMARY")
        print("="*60)
        print(f"Tests run: {self.tests_run}")
        print(f"Tests passed: {self.tests_passed}")
        print(f"Tests failed: {len(self.failed_tests)}")
        print(f"Success rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        if self.failed_tests:
            print("\nFailed tests:")
            for failure in self.failed_tests:
                print(f"❌ {failure}")
        
        return len(self.failed_tests) == 0

def main():
    """Run all backend tests"""
    print("🚀 Starting Petal & Paw Backend API Tests")
    print("=" * 60)
    
    tester = PetalPawTester()
    
    # Run all test suites
    tester.test_products()
    tester.test_subscriptions()
    tester.test_blog()
    tester.test_bouquet_builder()
    tester.test_referral_system()
    tester.test_checkout()
    tester.test_admin_endpoints()
    tester.test_auth_endpoints()
    
    # Print summary and return exit code
    success = tester.print_summary()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())