# PATCH NOTES MASTER FILE

## v0.9.74 - Stripe Fix (2026-01-27)
**"Stripe Checkout Fix 🔧"**

Fixed Stripe integration to enable the subscription checkout flow.

### Fixes & Improvements
- **Stripe API Fix**: Corrected invalid API version (`2025-11-17.clover` → `2024-06-20`) that was blocking checkout.
- **Environment Cleanup**: Resolved trailing newline issues in Vercel environment variables.
- **Error Logging**: Added detailed error messages for debugging checkout failures.

---

## v0.9.73 - Feature Labels (2026-01-27)
**"Feature Labels Update 🏷️"**

Corrected subscription feature labels to accurately reflect actual capabilities.

### Fixes & Improvements
- **Free Tier Honesty**: Removed misleading "Session history" claim - free users cannot save recordings.
- **Pro Tier Clarity**: Updated features to show uploads, 100+ beats, and save/download capabilities.
- **Landing Page Sync**: Aligned pricing page with accurate feature lists.

---

## v0.9.72 - Price Fix (2026-01-27)
**"Price Fix 💰"**

Corrected pricing display across all components to match Stripe configuration.

### Fixes & Improvements
- **Price Sync**: Fixed €3.99 / €39 displaying instead of €4.99 / €49.
- **Currency Alignment**: Converted remaining USD ($) prices to EUR (€).
- **Affected Components**: SubscriptionSection, SubscriptionModal, LandingPricing.

---

## v0.9.71 - Euro Edition (2026-01-27)
**"EUR Currency Update 💶"**

Aligned the application with our Euro-based Stripe setup for a seamless global launch.

### System Updates
- **EUR Primary Currency**: All pricing now displayed in Euros (€4.99/mo).
- **Stripe Sync**: Matched yearly plan price to the Stripe Dashboard (€49.00/yr).
- **Multi-Currency Ready**: UK and other international users see their local currency at checkout via Stripe Adaptive Pricing.

---

## v0.9.70 - Cleanup Edition (2026-01-27)
**"Cleanup & Sync 🧹"**

A foundational update focused on code health, monetization consistency, and centralized configuration for a smoother launch.

### System Updates
- **Dynamic Pricing**: Premium modal now reflects real-time Stripe pricing without hardcoded limits.
- **Centralized Config**: Unified session and storage limits into a single source of truth in `design.ts`.
- **Data Health**: Moved large fallback data sets (Words and Beats) to dedicated modules, cleaning up core API and UI code.

### Fixes & Improvements
- **Monetization Sync**: Removed outdated "trial" claims to align with the current Stripe setup.
- **Refactored Fallbacks**: Improved app reliability during network/database failure modes by centralizing offline data.

---

## v0.9.69 - Fort Knox (2026-01-27)
**"Security & Android Prep 🛡️"**

We've hardened the app security headers, updated our legal terms, and prepared the ground for our Android Play Store launch with native sharing and better icon support.

### System Updates
- **Security Headers**: Added CSP, HSTS, X-Frame-Options, and Permissions-Policy.
- **Legal Upgrade**: Terms now include Trademark and Copyright Monitoring clauses.
- **Privacy Update**: Added App Permissions section for Play Store compliance.
- **Monitoring**: Added Sentry tracking for playback errors.

### New Features
- **Native Share**: Added a native share sheet for cleaner integration with Instagram, TikTok, and Messages.
- **Android Prep**: Locked orientation to portrait and added maskable icons for a native app feel.

---

## v0.9.68 - Launch Ready (2026-01-27)
**"Launch Readiness 🚀"**

Final polish for the public launch. Includes a massive SEO overhaul, smoother loading animations, and enhanced offline support.

### Launch Prep
- **SEO Overhaul**: Dynamic social cards, sitemaps, and structured data.
- **PWA Upgrade**: Added "Rich Install" support and a custom Offline page.
- **Performance**: New "Lifeline" loading animation and faster visualizer startup.

---

*For complete historical patch notes, see the live `/patch-notes` page or `lib/data/patch-notes.ts`.*
