# NayaSa

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Full Buyer flow: Home page with brand filter, listing grid with Health Score badges, product detail with Flaw-Finder toggle + Component History Ledger + Savings Calculator, checkout with shipping selector and OBD checkboxes
- Full Seller flow: Device entry form, 4-step simulated AI-Surgeon diagnostic suite (Acoustic, Thermal, Dead Pixel, Sensor), algorithmic quote page with countdown timer + market trend mini-graph, pickup slot selector
- 10-15 seed listings (brand, model, storage, IMEI, battery health, condition grade, retail price, NayaSa price, component history, diagnostic results)
- "Live from Warehouse" tally widget on home page
- Dark luxury design: deep charcoal backgrounds, neon mint accents, Bento Grid layouts

### Modify
- N/A

### Remove
- N/A

## Implementation Plan

1. **Backend (Motoko)**
   - `Listing` type: id, brand, model, storage, imei, batteryHealth, conditionGrade, nayasaPrice, retailPrice, componentHistory (array of records), diagnosticResults, inStock
   - `SellerSubmission` type: id, brand, model, storage, condition, diagnosticResults, quotedPrice, status, pickupSlot
   - Queries: `getListings`, `getListing(id)`, `getListingsByBrand`
   - Updates: `submitSellRequest`, `saveDiagnosticResult`
   - Seed data: 12 listings across Apple, Samsung, OnePlus, Xiaomi, Google brands

2. **Frontend Pages**
   - `/` — Home: hero section, brand filter bento grid, listing grid, live warehouse tally
   - `/listing/:id` — Product detail: 360 viewer simulation, Flaw-Finder toggle, component history, savings bar, checkout CTA
   - `/checkout/:id` — Checkout: shipping selector, transparency checkboxes, order summary
   - `/sell` — Sell entry: brand/model/storage/condition form
   - `/sell/diagnose` — AI-Surgeon diagnostic suite: 4 animated tests with progress
   - `/sell/quote` — Quote page: price ticker, countdown, market mini-graph, pickup slot selector
