# Petal & Paw - Pet-Safe Flower Ecommerce PRD

## Problem Statement
Create a modern, minimal ecommerce website for a pet-safe flower business with Scandinavian minimalism design (inspired by Ole & Steen). Neutral colour palette, large white space, calm premium feel.

## Architecture
- **Frontend**: React + Tailwind CSS + shadcn/ui + React Router
- **Backend**: FastAPI + MongoDB (motor)
- **Auth**: Emergent-managed Google OAuth (admin only)
- **Payments**: Stripe via emergentintegrations library
- **Design**: Playfair Display + DM Sans fonts, #FAF9F6/#E8E4D9/#8DA399 palette

## User Personas
1. **Pet Owner Shopper** - Browses products, buys bouquets, subscribes to deliveries
2. **Gift Buyer** - Looks for safe floral gifts for pet-owning friends
3. **Store Admin** - Manages products, orders, blog posts via dashboard

## Core Requirements
- Homepage with hero, featured products, brand story
- Shop with category filters (bouquet, single-stem, arrangement)
- Product detail with pet-safe info and add-to-cart
- Subscription plans (weekly/bi-weekly/monthly) with Stripe checkout
- Visual bouquet builder (click-to-add flowers, live preview)
- Cart with Stripe checkout integration
- Blog with admin-managed posts
- Admin dashboard (Google OAuth, CRUD for products/orders/blog)

## What's Been Implemented (March 9, 2026)
- [x] Full backend with 20+ API endpoints (products, blog, subscriptions, bouquet, orders, auth, admin)
- [x] MongoDB seed data: 8 products, 3 subscription plans, 3 blog posts, 11 bouquet flowers
- [x] Stripe checkout integration with payment transactions tracking
- [x] Emergent Google OAuth for admin authentication
- [x] All 8 pages: Home, Shop, Product Detail, Subscriptions, Bouquet Builder, Cart, Blog, Admin Dashboard
- [x] Interactive visual bouquet builder with flower positioning
- [x] Responsive design with Scandinavian minimal aesthetic
- [x] 100% test pass rate on backend and frontend

## Prioritized Backlog
### P0 (Critical)
- None remaining

### P1 (High)
- SEO meta tags per page (title, description, og:image)
- Order confirmation emails (SendGrid integration)
- Product search functionality
- Inventory management (stock tracking)

### P2 (Medium)
- Customer accounts (order history, saved bouquets)
- Wishlist feature
- Product reviews
- Advanced blog editor (rich text vs raw HTML)
- Delivery date picker with calendar
- Discount codes / promo system

### P3 (Nice to Have)
- Social media sharing for products
- Gift card functionality
- Referral program
- Analytics dashboard with charts
- Push notifications for delivery updates

## Next Tasks
1. Add SEO meta tags to all pages
2. Implement product search in shop
3. Add customer account system
4. Set up email notifications for orders
5. Add delivery scheduling with calendar
