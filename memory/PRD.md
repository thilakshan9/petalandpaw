# Petal & Paw - Pet-Safe Flower Ecommerce PRD

## Problem Statement
Modern, minimal ecommerce website for pet-safe flowers. Neutral colour palette, elegant typography, minimal layouts. Full-width hero, image-first layouts, calm premium aesthetic.

## Architecture
- **Frontend**: React + Tailwind CSS + shadcn/ui + React Router + react-helmet-async
- **Backend**: FastAPI + MongoDB (motor)
- **Auth**: Emergent Google OAuth (admin + customer)
- **Payments**: Standard `stripe` library (handles recurring subscriptions and one-time payments)
- **Images**: Served from Google Drive (public folder) via `lh3.googleusercontent.com`

## What's Been Implemented

### Phase 1 (March 9, 2026)
- Full-stack scaffolding: Homepage, Shop, Product, Subscriptions, Bouquet Builder, Cart, Admin Dashboard
- Core integrations: Emergent Google Auth (admin), Stripe (payments)

### Phase 2 (March 9, 2026)
- Customer accounts with Google OAuth and order history
- Referral program (Give £10, Get £10)
- Product search functionality
- Delivery date picker for checkout
- Letterbox flower products
- Enhanced step-based bouquet builder
- SEO metadata management
- Blog with SEO metadata
- Admin dashboard: order management, product CRUD, blog CRUD

### Phase 3 (March 10, 2026) - Mobile Responsiveness & Logo
- Integrated user-provided Petal + Paw circular logo in Navbar and Footer
- Full mobile responsiveness across all pages
- Quick View modal: hover bar on desktop, eye icon on mobile

### Phase 4 (March 15, 2026) - Content & Feature Updates
- Removed all Scandinavian references from frontend, backend seed data, and blog posts
- Changed all currency from $ (USD) to £ (GBP)
- Updated homepage text: scientific data, subscription CTA, bouquet builder → COMING SOON
- Added About Us page (/about), Contact page (/contact), FAQ page (/faq)
- Replaced emergentintegrations Stripe wrapper with standard stripe library
- Cleaned index.html (removed badges, analytics)

### Phase 5 (April 6, 2026) - Stripe Payments, Email Receipts & Contact Form
- Stripe integration with real test key — subscription and order checkout working
- Email collection dialog before payment (subscription + cart checkout)
- Stripe receipt emails sent automatically via receipt_email on payment intent
- Contact form wired to backend API (/api/contact)
- Instagram handle @petalandpawflorist added to Contact page and Footer
- Better Stripe error handling
- Configured Stripe checkout to collect UK shipping addresses (allowed_countries: ["GB"])
- "Classic Bloom" split into Subscribe (monthly recurring) and One-time purchase
- "Petite Paws" and "Grand Garden" set to Coming Soon
- Fixed checkout success page to handle both one-time and subscription sessions

### Phase 6 (April 12, 2026) - Personalized Message & Google Drive Images
- Added personalized message textarea to Subscription checkout dialog and Cart page order summary
- Message captured in Stripe checkout session metadata (visible in Stripe Dashboard)
- Message stored in MongoDB order documents and payment transactions
- 500 character limit with live counter on both inputs
- Homepage images updated with Google Drive photos:
  - Hero banner: Cat with colourful bouquet (#20/DSC_6583)
  - Every Stem Verified: Dog sniffing yellow flower (#1/DSC_6472)
  - Monthly Delivery: Hand-held bouquet (#32/DSC_6607)
  - Personalise: Pastel rose bouquet (#4/DSC_6505)
- Gallery page converted from API-driven to static Google Drive images (10 curated photos)
- Subscription plan images blurred for all three tiers
- SendGrid integration removed from roadmap (no longer needed)

## Google Drive Image Reference
Folder: https://drive.google.com/drive/folders/1KFiaKmLQZKWllAd7tHnDWxyzKeV_75Or
URL format: `https://lh3.googleusercontent.com/d/{FILE_ID}=w{WIDTH}`

## Key DB Collections
- `users`: email, password_hash, created_at, referral_code, referred_by
- `products`: name, price, description, image, category, stock
- `subscription_plans`: name, price, description, features, is_monthly
- `orders`: user_id, items, total, status, delivery_date, personalized_message, created_at
- `payment_transactions`: session_id, amount, currency, metadata (includes personalized_message)
- `blog_posts`: title, content, author, date, seo_title, seo_description
- `contact_messages`: name, email, message, created_at

## Key API Endpoints
- `POST /api/subscriptions/checkout` - Creates Stripe session for subscriptions (accepts personalized_message)
- `POST /api/orders/checkout` - Creates Stripe session for cart (accepts personalized_message)
- `GET /api/orders/status/{session_id}` - Verifies payment success
- `POST /api/contact` - Captures contact form messages

## Backlog
### P1
- Inventory management
- Delivery scheduling with time slots

### P2
- Bouquet Builder full implementation (currently Coming Soon)
- Backend refactor: Split server.py (~900 lines) into modular route files
- Wishlist feature
- Product reviews

### P3
- Gift cards
- Analytics dashboard
- Discount codes / promo system
- Social sharing for products

## Mocked Services
- SendGrid email sending (removed from roadmap per user request)
