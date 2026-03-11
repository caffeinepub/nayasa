# NayaSa

## Current State
- Login page exists at `/login` with Google and Phone (OTP) options
- No separate Signup page; no `/signup` or `/profile-setup` routes
- Checkout at `/checkout/$id` has full Indian payment UI (UPI, Card, Net Banking, Wallet) but payment is simulated — no real payment processing
- App.tsx has routes for home, listing, checkout, sell, diagnose, quote, login, admin
- Stripe component has been selected and backend bindings are available

## Requested Changes (Diff)

### Add
- `/signup` page with Google, Outlook (Microsoft), and Phone (OTP) sign-up options. Toggle link "Already have an account? Log in" links to `/login`
- `/profile-setup` page: collects Name and Handle after sign-up, then redirects to home
- Stripe real card payment flow in Checkout: when user selects "Debit / Credit Card", a "Pay with Stripe" button creates a Stripe checkout session via `actor.createCheckoutSession()` and redirects to Stripe-hosted payment page
- `/payment-success` route and PaymentSuccess component: confirms order, shows Seal ID
- `/payment-failure` route and PaymentFailure component: shows error, offers retry link back to checkout
- Stripe admin configuration panel in AdminPanel: `isStripeConfigured()` check on admin login; if not configured, prompt to enter Stripe secret key and allowed countries via `setStripeConfiguration()`
- `useCreateCheckoutSession` hook with proper JSON parsing and url validation

### Modify
- `Login.tsx`: add Outlook (Microsoft) as a third sign-in option alongside Google and Phone. Add toggle link "Don't have an account? Sign up" pointing to `/signup`
- `App.tsx`: add routes for `/signup`, `/profile-setup`, `/payment-success`, `/payment-failure`
- `Checkout.tsx`: card payment option triggers Stripe checkout session creation and redirect instead of manual card form entry. Other methods (UPI, Net Banking, Wallet) remain simulated. Show loading state while Stripe session is being created.

### Remove
- Manual card form (card number, expiry, CVV, name) from Checkout when card method is selected — replaced by Stripe redirect

## Implementation Plan
1. Create `src/frontend/src/hooks/useCreateCheckoutSession.ts`
2. Create `src/frontend/src/pages/Signup.tsx` mirroring Login structure with Google, Outlook, Phone OTP; redirects to `/profile-setup` after success
3. Create `src/frontend/src/pages/ProfileSetup.tsx` with Name + Handle form, saves to localStorage and backend, redirects to `/`
4. Create `src/frontend/src/pages/PaymentSuccess.tsx`
5. Create `src/frontend/src/pages/PaymentFailure.tsx`
6. Update `Login.tsx`: add Outlook button, add sign-up toggle link
7. Update `Checkout.tsx`: replace card form with Stripe session trigger button
8. Update `AdminPanel.tsx`: add Stripe configuration section
9. Update `App.tsx`: register all new routes
