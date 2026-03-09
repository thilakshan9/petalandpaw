# Petal & Paw - Pet-Safe Flower Ecommerce PRD

## Problem Statement
Modern, minimal ecommerce website for pet-safe flowers with Scandinavian design (Ole & Steen inspired). Full-width hero, image-first layouts, calm premium aesthetic.

## Architecture
- **Frontend**: React + Tailwind CSS + shadcn/ui + React Router + react-helmet-async
- **Backend**: FastAPI + MongoDB (motor) + SendGrid (MOCKED until key provided)
- **Auth**: Emergent Google OAuth (admin + customer)
- **Payments**: Stripe via emergentintegrations library

## What's Been Implemented (March 9, 2026 - Phase 2)

### Homepage (Ole & Steen Inspired)
- [x] Full-width hero with lifestyle image, minimal headline, single CTA
- [x] Promise strip (pet-safe, sustainable, free delivery)
- [x] 3 feature sections: Pet-Safe Flowers, Letterbox Subscriptions, Create Your Own Bouquet
- [x] Featured products grid
- [x] Clean, image-first, calm premium aesthetic

### Products
- [x] 10 products across 4 categories: bouquet, single-stem, arrangement, letterbox
- [x] 3 letterbox flower products
- [x] Product search (name, description, category)
- [x] Category filtering

### Subscriptions (Monthly Only)
- [x] 3 tiers: Petite Paws ($29.99), Classic Bloom ($44.99), Grand Garden ($64.99)
- [x] Pet toy add-on ($8.99) toggle per plan
- [x] Stripe checkout integration

### Bouquet Builder (Step-Based)
- [x] Step 1: Select size (Petite/Classic/Grand)
- [x] Step 2: Choose flowers from categorized lists
- [x] Step 3: Pet type dropdown (Dog, Cat, Rabbit, Other + text input)
- [x] Step 4: Review + optional pet toy add-on
- [x] Safety notice always displayed
- [x] Clean form UI with step indicator

### Cart & Checkout
- [x] Delivery date picker (calendar component)
- [x] Referral code input with validation
- [x] Stripe checkout with delivery date and referral support
- [x] Free delivery over $50

### Customer Accounts
- [x] Google OAuth login for customers
- [x] Order history view
- [x] Referral code display and copy link

### Referral Program (Give $10, Get $10)
- [x] Auto-generated 8-char referral code per user
- [x] Referral landing page with validation
- [x] $10 discount applied at checkout
- [x] Credit tracking in user account

### Admin Dashboard
- [x] Order status: To Do / Complete (toggleable)
- [x] Subscription orders tab
- [x] Order details view (items, pet notes, add-ons, delivery date)
- [x] Product CRUD with letterbox category
- [x] Blog CRUD with SEO metadata (meta description, keywords)
- [x] Dashboard stats including subscription orders and todo count

### SEO
- [x] react-helmet-async for per-page meta tags
- [x] Title, description, og:image, keywords per page
- [x] Blog posts with meta_description and meta_keywords

### Email Notifications
- [x] SendGrid integration (MOCKED - add SENDGRID_API_KEY + SENDER_EMAIL to .env)
- [x] Order confirmation HTML email template

## Test Results
- Backend: 100% pass rate (19 endpoints)
- Frontend: 95% pass rate (minor subscription loading delay)

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
