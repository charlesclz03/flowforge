# 🚀 Quick Start - Next Session

**Last Updated:** November 18, 2025  
**Current Status:** Phase 4 Complete, Phase 5 Started (~82% Overall)  
**Next Phase:** Phase 5 - Premium Features (Stripe + gating)

---

## ✅ **WHAT'S DONE**

### **Phase 4: Recording Management** (100% Complete)

- ✅ Supabase Storage integration
- ✅ Recording upload to cloud
- ✅ Recording library page (`/recordings`)
- ✅ Play, download, delete recordings
- ✅ Enhanced profile statistics
- ✅ Auto-save after sessions

---

## 🎯 **NEXT STEPS: PHASE 5 - PREMIUM FEATURES**

### **Overview**

Implement Stripe payment integration and premium subscription features to monetize the platform.

### **Estimated Time:** 10-12 hours

---

## 📋 **PHASE 5 TASK BREAKDOWN**

### **1. Stripe Setup** (2-3 hours)

#### **Tasks:**

- [ ] Create Stripe account
- [ ] Set up Stripe products (Free vs Premium)
- [ ] Configure webhook endpoints
- [ ] Add Stripe environment variables
- [ ] Install Stripe SDK (`npm install stripe @stripe/stripe-js`)

#### **Files to Create:**

```
lib/stripe.ts                        # Stripe client
app/api/stripe/checkout/route.ts     # Create checkout session
app/api/stripe/webhook/route.ts      # Handle webhooks
app/api/stripe/portal/route.ts       # Customer portal
```

#### **Environment Variables:**

```bash
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

### **2. Subscription Management** (3-4 hours)

#### **Tasks:**

- [ ] Create pricing page component
- [ ] Implement checkout flow
- [ ] Handle successful payments
- [ ] Update user subscription status in database
- [ ] Create subscription management page
- [ ] Implement cancel subscription
- [ ] Show billing history

#### **Files to Create:**

```
app/pricing/page.tsx                 # Pricing page
components/pricing/PricingCard.tsx   # Pricing card component
components/pricing/CheckoutButton.tsx # Checkout button
app/billing/page.tsx                 # Billing management
```

#### **Database Updates:**

```prisma
model User {
  subscriptionStatus  String?   @default("free")
  subscriptionId      String?
  stripeCustomerId    String?
  subscriptionEndsAt  DateTime?
}
```

---

### **3. Premium Features** (4-5 hours)

#### **Tasks:**

- [ ] Implement feature gating (check subscription status)
- [ ] Add premium beat access
- [ ] Remove recording limits for premium users
- [ ] Add longer session durations (5 min, 10 min)
- [ ] Implement advanced word filters
- [ ] Add custom word lists feature
- [ ] Remove ads for premium users

#### **Files to Create:**

```
lib/features/premium.ts              # Feature gating utilities
hooks/useSubscription.ts             # Subscription hook
components/premium/UpgradePrompt.tsx # Upgrade CTA
components/premium/PremiumBadge.tsx  # Premium badge
```

#### **Feature Gating Example:**

```typescript
// Check if user has premium
const { isPremium } = useSubscription()

// Gate feature
if (!isPremium) {
  return <UpgradePrompt feature="Unlimited Recordings" />
}
```

---

### **4. Google AdSense Integration** (1-2 hours)

#### **Tasks:**

- [ ] Create AdSense account
- [ ] Add AdSense script to layout
- [ ] Create ad components
- [ ] Place ads on landing page (free tier only)
- [ ] Implement ad blocker detection
- [ ] Hide ads for premium users

#### **Files to Create:**

```
components/ads/AdUnit.tsx            # Ad unit component
lib/adsense.ts                       # AdSense utilities
```

#### **Environment Variables:**

```bash
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-...
```

---

## 🎨 **PREMIUM TIER COMPARISON**

### **Free Tier**

- ✅ 10 recordings max
- ✅ 2-minute sessions
- ✅ Basic beats (currently 18 total beats, with 8 premium‑flagged in the UI)
- ✅ Standard word prompts
- ❌ Ads displayed
- ❌ Limited features

### **Premium Tier** ($9.99/month)

- ✅ Unlimited recordings
- ✅ 2, 5, 10-minute sessions
- ✅ Premium beats (20+ available)
- ✅ Advanced word filters
- ✅ Custom word lists
- ✅ MP3 export
- ✅ Beat volume control
- ✅ Metronome option
- ✅ Ad-free experience
- ✅ Priority support

---

## 🔧 **TECHNICAL SETUP REQUIRED**

### **1. Stripe Account Setup**

1. Go to [stripe.com](https://stripe.com)
2. Create account
3. Go to Dashboard → Developers → API Keys
4. Copy "Publishable key" and "Secret key"
5. Add to `.env.local`

### **2. Create Stripe Products**

```bash
# Run in Stripe Dashboard or CLI
stripe products create \
  --name "FlowForge Premium" \
  --description "Unlimited recordings, premium beats, ad-free"

stripe prices create \
  --product prod_xxx \
  --unit-amount 999 \
  --currency usd \
  --recurring interval=month
```

### **3. Configure Webhooks**

1. Go to Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy webhook secret → `STRIPE_WEBHOOK_SECRET`

---

## 📁 **FILES TO REVIEW**

### **Existing Files to Modify:**

```
prisma/schema.prisma                 # Add subscription fields
app/profile/page.tsx                 # Add subscription section
components/layout/Header.tsx         # Add "Upgrade" button
app/practice/page.tsx                # Add feature gating
```

### **Documentation to Read:**

```
DOCS/STRIPE_SETUP.md                 # Stripe setup guide
DOCS/ADSENSE_SETUP.md                # AdSense setup guide
```

---

## 🧪 **TESTING CHECKLIST**

### **Stripe Integration:**

- [ ] Create checkout session
- [ ] Complete test payment (use test card: 4242 4242 4242 4242)
- [ ] Verify webhook received
- [ ] Verify user upgraded to premium
- [ ] Test subscription cancellation
- [ ] Test subscription renewal
- [ ] Test failed payment

### **Feature Gating:**

- [ ] Verify free users see upgrade prompts
- [ ] Verify premium users access all features
- [ ] Verify recording limits enforced (free: 10 max)
- [ ] Verify session duration limits (free: 2 min only)
- [ ] Verify premium beats locked for free users

### **AdSense:**

- [ ] Verify ads display for free users
- [ ] Verify ads hidden for premium users
- [ ] Test ad blocker detection
- [ ] Verify ad placement (non-intrusive)

---

## 🚨 **IMPORTANT NOTES**

### **Stripe Test Mode:**

- Use test API keys during development
- Test cards: [stripe.com/docs/testing](https://stripe.com/docs/testing)
- Switch to live keys only when ready for production

### **Webhook Security:**

- Always verify webhook signatures
- Use `STRIPE_WEBHOOK_SECRET` to validate requests
- Never trust webhook data without verification

### **Feature Gating:**

- Check subscription status on both client and server
- Never trust client-side checks alone
- Enforce limits in API routes

---

## 📊 **SUCCESS CRITERIA**

Phase 5 is complete when:

- [x] Stripe integration working
- [x] Users can subscribe to premium
- [x] Users can cancel subscriptions
- [x] Premium features are gated
- [x] Free tier has recording limits
- [x] Premium tier has unlimited access
- [x] AdSense ads display for free users
- [x] Ads hidden for premium users
- [x] Billing page shows subscription status
- [x] Webhook handling works correctly

---

## 🎉 **AFTER PHASE 5**

### **Phase 6: Social Features** (Final Phase)

- Share recordings publicly
- Public recording feed
- Comments and likes
- User profiles
- Leaderboards
- Challenges

**Estimated Time:** 12-15 hours

---

## 💡 **QUICK COMMANDS**

```bash
# Install Stripe
npm install stripe @stripe/stripe-js

# Start dev server
npm run dev

# Run linter
npm run lint

# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```

---

## 📚 **HELPFUL RESOURCES**

- [Stripe Docs](https://stripe.com/docs)
- [Stripe Next.js Guide](https://stripe.com/docs/payments/checkout/how-checkout-works)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Google AdSense](https://www.google.com/adsense/)
- [Next.js Docs](https://nextjs.org/docs)

---

**Ready to build premium features!** 🚀

**Current Progress:** 80% Complete (4 of 6 phases done)  
**Next Milestone:** 90% Complete (Phase 5 done)  
**Final Milestone:** 100% Complete (Phase 6 done)
