# LaunchPad OS — Marketplace Monetization & Billing Notes

**Version:** `v1.0.0-production`  

---

## 1. Monetization Architecture

LaunchPad supports a publisher monetization engine using Stripe Checkout and Webhook Events (`MarketplaceBillingService`):

- **Pricing Types**: `FREE`, `ONE_TIME`, `SUBSCRIPTION`.
- **Commission Split**: Configurable platform commission rate (`PLATFORM_COMMISSION_RATE` default: 0.15 = 15%).
- **Publisher Payouts**: Automated calculation and logging of publisher net earnings on completed transactions.

---

## 2. Webhook Event Processing Flow

```mermaid
sequenceDiagram
    participant Buyer as Buyer Org Admin
    participant Mkt as Marketplace UI
    participant Gateway as Billing Service
    participant Stripe as Stripe API & Webhook
    participant License as License Service

    Buyer->>Mkt: 1. Click 'Purchase Asset'
    Mkt->>Gateway: 2. POST /marketplace/checkout-session
    Gateway->>Stripe: 3. Create Stripe Checkout Session
    Gateway-->>Mkt: 4. Return Session ID & Redirect URL
    Buyer->>Stripe: 5. Complete Payment on Stripe Hosted Checkout
    Stripe->>Gateway: 6. POST /marketplace/webhooks/stripe (checkout.session.completed)
    Gateway->>Gateway: 7. Verify Webhook Signature & Idempotency Check
    Gateway->>Gateway: 8. Update Transaction status -> SUCCEEDED
    Gateway->>License: 9. Issue MarketplaceLicense entitlement
    Gateway->>Gateway: 10. Record Publisher Payout Entry
```

---

## 3. Webhook Security & Idempotency Rules

- **Signature Verification**: Verified against `STRIPE_WEBHOOK_SECRET`.
- **Idempotency**: Webhook events check `marketplaceTransaction.findFirst({ where: { stripeSessionId } })`. If status is already `SUCCEEDED`, the handler returns `{ received: true, alreadyProcessed: true }` without duplicating licenses or payouts.
