# Phase 5: Premium Features & Monetization

**Status**: 🚧 **IN PROGRESS**
**Start Date**: November 18, 2025
**Target Completion**: December 2025

---

## 🎯 Goal

Transform Freestyla from a free tool into a sustainable busines by introducing a "Pro" tier (€4.99/mo or €49.99/yr) that offers tangible value to serious artists.

## 📦 Key Features

### 1. Stripe Integration (The Core)

- [ ] **Checkout System**: Full integration with Stripe Checkout.
- [ ] **Customer Portal**: Self-serve cancellation/management.
- [ ] **Webhooks**: Reliable handling of subscription updates.
- [ ] **Database**: Sync subscription status to `User` model.

### 2. Feature Gating (The "Fence")

- [ ] **Premium Beats**: Lock curated beats behind Pro tier.
- [ ] **Extended Duration**: Allow >2 minute sessions for Pro users.
- [ ] **Advanced Settings**: Lock "Hard" difficulty or custom timer settings.

### 3. "Guest Mode" (The Funnel)

- [ ] Allow unauthenticated users to record **one** session.
- [ ] Prompt for Sign Up / Sign In _after_ the recording is finished to save it.
- [ ] Smooth transition from Guest -> Free User -> Pro User.

---

## 📅 Implementation Plan

### Step 1: Stripe Foundation

- Configure Environment Variables.
- Implement `lib/stripe.ts` utility.
- Create API routes for checkout and webhooks.

### Step 2: Database Schema

- Update `User` model with `stripeCustomerId`, `subscriptionStatus`, `currentPeriodEnd`.
- Run migrations.

### Step 3: UI Updates

- Create "Upgrade to Pro" pricing page.
- Add "Premium" badges to locked features.
- Build "Manage Subscription" button in Profile.

### Step 4: Logic Implementation

- Refactor `Recorder` to check user tier for duration limits.
- Refactor `BeatSelector` to disable premium beats for free users.
- Implement Guest Mode logic in `practice/page.tsx`.

---

## 🔮 Success Metrics

- **Conversion Rate**: % of Free users who start a trial/sub.
- **Churn**: % of Pro users who cancel.
- **Guest Conversion**: % of Guest sessions that result in a Sign Up.
