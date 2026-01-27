# Changelog

## v0.9.74 - Stripe Checkout Fix (2026-01-27)
- **Fix (Critical)**: Corrected invalid Stripe API version (`2025-11-17.clover` → `2024-06-20`).
- **Fix (Infra)**: Resolved trailing newline issues in Vercel environment variables.
- **Enhancement**: Added detailed error logging for checkout failures.

## v0.9.73 - Feature Labels Update (2026-01-27)
- **Fix (UX)**: Removed misleading "Session history" claim from free tier.
- **Fix (UX)**: Updated Pro tier to accurately show uploads, 100+ beats, and save/download.
- **Fix (UI)**: Aligned landing page pricing with accurate feature lists.

## v0.9.72 - Price Fix (2026-01-27)
- **Fix (Critical)**: Corrected €3.99/€39 to €4.99/€49 across all components.
- **Fix (Currency)**: Converted remaining USD prices to EUR.

## v0.9.71 - EUR Currency Update (2026-01-27)
- **System**: All pricing now displayed in Euros (€4.99/mo, €49.00/yr).
- **Stripe Sync**: Matched yearly plan price to Stripe Dashboard.

## v0.9.70 - Cleanup & Sync (2026-01-27)
- **Refactor**: Centralized session/storage limits into `design.ts`.
- **Data Health**: Moved Words and Beats to dedicated modules.
- **Fix**: Removed outdated "trial" claims.

## v0.9.69 - Security Hardening (2026-01-27)
- **Security**: Added CSP, HSTS, X-Frame-Options, and Permissions-Policy headers.
- **Legal**: Added Trademark and Copyright Monitoring clauses to Terms.
- **Android**: Native share sheet and maskable icons.

## v0.9.68 - Launch Readiness (2026-01-27)
- **SEO**: Dynamic social cards, sitemaps, and structured data.
- **PWA**: Rich Install support and custom Offline page.
- **Performance**: Lifeline loading animation and faster visualizer.

## v0.9.67 - In-App Support Form (2026-01-26)
- **Feature**: Added support form in Settings with email integration.

## v0.9.30 - The Visual Polish Update
- **UI (Cypher)**: Relocated player segments to the outer edge of the control ring.
- **UI (Header)**: Added a "Help" button linked to /howitworks.
- **FX**: Boosted "Police Siren" intensity by 200%.
- **UI (Polish)**: Central record button is now a consistent glass ring.

## v0.9.29 - The Safe Resume & Admin Polish Update
- **Fix (Regression)**: Restored missing SVG turn rings in Cypher Mode.

## v0.9.27 - The True Timer Fix
- **Fix (Critical)**: Timer was running at 2x speed due to React StrictMode.
- **Fix (Core)**: All animation loop exit paths now properly cleanup frame references.

## v0.9.26 - Stability Fixes
- **Fix (Core)**: Removed unstable `beatPlayer` object reference from effect dependencies.
- **Fix (UI)**: Added `min-h-14` to control buttons row to prevent layout shift.

## v0.9.25 - The Mobile & Precision Update
- **Fix (Mobile)**: Practice ring now caps at 45% viewport height.
- **Fix (UI)**: Split Exit/Pause buttons into dedicated row.
- **Fix (Core)**: Grid Lock frequency change no longer freezes timer.

*(For complete history, see `/patch-notes` or `lib/data/patch-notes.ts`)*
