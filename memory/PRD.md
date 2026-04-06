# Petal & Paw - Pet-Safe Flower Ecommerce PRD

## Problem Statement
Modern, minimal ecommerce website for pet-safe flowers with Scandinavian design (Ole & Steen inspired). Full-width hero, image-first layouts, calm premium aesthetic.

## Architecture
- **Frontend**: React + Tailwind CSS + shadcn/ui + React Router + react-helmet-async
- **Backend**: FastAPI + MongoDB (motor) + SendGrid (MOCKED until key provided)
- **Auth**: Emergent Google OAuth (admin + customer)
- **Payments**: Stripe via emergentintegrations library

## What's Been Implemented

### Phase 1 (March 9, 2026)
- Full-stack scaffolding: Homepage, Shop, Product, Subscriptions, Bouquet Builder, Cart, Admin Dashboard
- Core integrations: Emergent Google Auth (admin), Stripe (payments)

### Phase 2 (March 9, 2026)
- Customer accounts with Google OAuth and order history
- Referral program (Give $10, Get $10)
- Product search functionality
- SendGrid integration (MOCKED)
- Delivery date picker for checkout
- Letterbox flower products
- Enhanced step-based bouquet builder
- SEO metadata management
- Blog with SEO metadata
- Admin dashboard: order management, product CRUD, blog CRUD

### Phase 3 (March 10, 2026) - Mobile Responsiveness & Logo
- [x] Integrated user-provided Petal + Paw circular logo in Navbar and Footer
- [x] Full mobile responsiveness across all pages
- [x] Quick View modal: hover bar on desktop, eye icon on mobile, adds to cart without navigating away

### Phase 4 (March 15, 2026) - Content & Feature Updates
- [x] Removed all Scandinavian references from frontend, backend seed data, and blog posts
- [x] Changed all currency from $ (USD) to £ (GBP) — frontend + Stripe backend
- [x] Updated homepage text: scientific data, subscription CTA, bouquet builder → COMING SOON (disabled)
- [x] Added About Us page (/about) with mission, values, and feature cards
- [x] Added Contact page (/contact) with form and info sidebar (MOCKED — no backend endpoint)
- [x] Removed shop category filters (kept search bar)
- [x] Removed free vase references from subscription plans
- [x] Replaced emergentintegrations Stripe wrapper with standard stripe library for deployment
- [x] Cleaned index.html (removed Made with Emergent badge, PostHog analytics)

### Phase 5 (April 6, 2026) - Stripe Payments, Email Receipts & Contact Form
- [x] Stripe integration with real test key — subscription and order checkout working
- [x] Email collection dialog before payment (subscription + cart checkout)
- [x] Stripe receipt emails sent automatically via receipt_email on payment intent
- [x] Contact form wired to backend API (/api/contact) — stores in DB + sends email (SendGrid ready, MOCKED until key provided)
- [x] Instagram handle @petalandpawflorist added to Contact page and Footer
- [x] Footer links scroll to top on navigation
- [x] Better Stripe error handling (clear user-facing messages)
- [x] Order confirmation emails prepared (SendGrid ready, MOCKED until key provided)
  - HomePage: Responsive hero (60vh mobile, 85vh desktop), vertical promise strip, scaled feature sections
  - ShopPage: Responsive filters, 2-col mobile / 4-col desktop product grid
  - ProductPage: Stacked layout on mobile, readable text sizes
  - SubscriptionPage: Stacked plan cards on mobile
  - BouquetBuilder: Responsive step indicator and form
  - CartPage: Responsive cart items and order summary
  - BlogPage: 1-col mobile / 3-col desktop blog grid
  - AccountPage: Responsive header and referral section
  - Footer: 2-col mobile / 4-col desktop grid with inverted logo
  - Navbar: Mobile hamburger menu with Sheet component
  - ProductCard: Responsive text sizes

## Test Results
- Backend: 100% pass rate (19 endpoints) - iteration 2
- Frontend: 100% pass rate (24 mobile/desktop layout tests) - iteration 3
- Subscription page "loading delay" investigated: API responds in ~300ms, not a real bug

## Products
- 10 products across 4 categories: bouquet, single-stem, arrangement, letterbox
- 3 letterbox flower products
- 3 subscription tiers: Petite Paws ($29.99), Classic Bloom ($44.99), Grand Garden ($64.99)

## Key DB Collections
- `users`: email, password_hash, created_at, referral_code, referred_by
- `products`: name, price, description, image, category, stock
- `subscriptions`: name, price, description, features, is_monthly
- `orders`: user_id, items, total, status, delivery_date, created_at
- `blog_posts`: title, content, author, date, seo_title, seo_description

## Backlog
### P1
- Customer order email with SendGrid key
- Inventory management
- Delivery scheduling with time slots

### P2
- Wishlist feature
- Product reviews
- Advanced blog editor (rich text)
- Discount codes / promo system

### P3
- Social sharing for products
- Gift cards
- Analytics dashboard with charts
- Push notifications

## Refactoring Backlog
- Break down monolithic server.py into modular route files (routes/, models/)
