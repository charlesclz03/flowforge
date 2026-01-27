# PATCH NOTES MASTER FILE

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
