# Project memory

## Product intent & audience

- E-commerce site selling wreath kits (likely holiday/Christmas themed)
- Optional add-on: pet toy (£8.99)
- Prices in GBP (£); targets UK customers

## Brand personality & voice

- Promotional/sales-driven messaging (e.g. "Save £10" badges, crossed-out original prices)

## Visual design & UX direction

- Site palette includes a soft gold accent used for sale badges/highlights
- Home page features a popup ad showing the current sale price, original price crossed out, and a savings badge
- Product (wreath kit) page mirrors the same sale display treatment
- Frontend sale UI was already in place; updates needed to stay in sync with backend price

## Decisions, constraints & rationale

- Sale price set at £35 (down from £45), a £10 discount
- Backend maintains its own price constant for Stripe charges, separate from frontend display values
- Rationale: both frontend display and backend price constant must be updated together to avoid mismatch between advertised price and actual Stripe charge
- Site requires a rebuild after content/price changes; backend requires a restart for price-constant changes to take effect
- Pet toy add-on (£8.99) is added on top of base kit price at checkout

## Open questions & assumptions

- Backend restart mechanism and timing not yet documented; users may see stale pricing until restart
- Whether the £35 sale is temporary or permanent is unspecified
- Assumed Stripe charge amount is derived solely from the backend price constant (no other server-side price sources identified)