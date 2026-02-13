# Archived Document

**Archived On**: 2026-02-13
**Original Path**: DOCS/guides/STRIPE_LAUNCH_CHECKLIST.md
**Canonical Replacement**: DOCS/guides/DEVELOPER_SETUP.md
**Reason**: Pre-existing historical archive metadata normalization.
**Last Verified**: 2026-02-13

---
# Stripe Launch Checklist: v0.9.74 Production Readiness

This checklist covers the final steps required to transition your Stripe setup from "Development/Testing" to "Live Production" for FlowForge.

## 1. Feature Checklist

### [x] **Stripe Customer Portal**
- **Status**: ✅ Already implemented in Settings ("Manage Subscription" button).

### [x] **Stripe Tax (EU/UK Compliance)**
- **Status**: ✅ Already enabled in Stripe Dashboard ("Stripe Tax - In use").

---

## 2. Dashboard Checklist

### [x] **Branding & Look**
- ✅ Icon, Logo, and Brand Colors configured.

### [ ] **Customer Communication**
- [ ] Enable **Customer Emails** in Settings > Emails.
- [ ] Turn on "Successful payments" and "Refunds".

### [x] **Adaptive Pricing**
- ✅ Verified: Already enabled in Stripe Dashboard.

---

## 3. Deployment & Security (Final Push)

### [ ] **Production Webhook**
1.  Go to Stripe Dashboard > Webhooks (in **Live** mode).
2.  Create endpoint: `https://freestyla.app/api/stripe/webhook`.
3.  Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`.
4.  Copy the **Signing secret** (`whsec_...`).

### [ ] **Update Vercel Environment Variables**
In Vercel > Settings > Environment Variables (for **Production**):
- `STRIPE_SECRET_KEY` → `sk_live_...`
- `STRIPE_WEBHOOK_SECRET` → `whsec_...` (from Live webhook)
- `STRIPE_PRICE_ID_MONTHLY` → Live Price ID from Product Catalog
- `STRIPE_PRICE_ID_YEARLY` → Live Price ID from Product Catalog

### [ ] **Redeploy**
Trigger a redeploy from the Vercel dashboard to apply changes.

