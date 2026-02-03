# **Hardcoded Logic Audit Report: FlowForge (v0.9.69)**

## **Executive Summary**
This audit identifies hardcoded constants, magic strings, and business logic discrepancies across the FlowForge codebase. While foundational systems for gamification and monetization are configured via utility files or environment variables, several UI components and API routes contain "safety fallbacks" or hardcoded labels that risk creating a mismatch between user expectations and system behavior at launch.

---

## **1. Monetization & Billing (CRITICAL)**

These findings directly impact revenue and user trust.

| Location | Finding | Impact | Recommendation |
| :--- | :--- | :--- | :--- |
| `PremiumModal.tsx:133` | Hardcoded: `"Get Pro - 3.99€/mo"` | Price mismatch. `lib/stripe.ts` uses 4.99. Hardcoded currency symbol (€). | Reference `PLANS` from `lib/stripe` or use a dynamic translation/config. |
| `PremiumModal.tsx:137` | Hardcoded: `"7-day free trial included"` | Misleading Marketing. `app/api/stripe/checkout/route.ts` does **not** specify `trial_period_days`. | Verify if trials are intended for launch; if so, update Stripe API call. |
| `lib/stripe.ts:4` | Safety Fallback: `'sk_test_mock_key...'` | Risk of accidental mock key use in build. | Ensure `STRIPE_SECRET_KEY` is required; fail build if missing. |
| `JsonLd.tsx:10-11` | Hardcoded SEO: `price: '0'`, `currency: 'USD'` | Inaccurate Rich Results. Shows app as free forever to search engines. | Dynamically pull price or update to 'Starting at...' |

## **2. Storage & Quota Metrics**

| Location | Finding | Impact | Recommendation |
| :--- | :--- | :--- | :--- |
| `app/recordings/page.tsx:182` | Hardcoded: `limitSeconds={3600}` | Logic fragmentation. UI shows 1h limit regardless of server-side quota. | Use `RECORDING_CONFIG.QUOTA_SECONDS` (or similar) from common constants. |
| `lib/constants/design.ts:134-135` | Hardcoded Tier Limits: `120s` (Free) / `600s` (Pro) | Fragmentation. These limits are for practice sessions, but are in a "Design" file. | Move all business logic quotas to `lib/config/billing.ts` or `lib/gamification/xp.ts`. |

## **3. Authentication & Permission Systems**

| Location | Finding | Impact | Recommendation |
| :--- | :--- | :--- | :--- |
| (Resolved) `lib/auth.ts`, `lib/auth/admin.ts` | Hardcoded superadmin emails removed. | Account dependency eliminated; admin access no longer tied to literals in code. | Use DB roles (`user.role === 'SUPERADMIN'`) and optionally bootstrap via `SUPERADMIN_EMAILS` env allowlist (server-side only). |
| (Resolved) `lib/auth.ts` | Forced `Admin1`/`Admin2` username overrides removed. | Admin usernames can be changed normally. | Use one-time backfill tooling if you need to set specific admin usernames. |

## **4. Data & Content Fallbacks (Offline Safety)**

These are "Good Hardcoding" (safety nets) but should be moved to data files for maintainability.

| Location | Finding | Impact | Recommendation |
| :--- | :--- | :--- | :--- |
| `app/tracks/page.tsx:68-91` | Hardcoded: Offline fallback beats (`/beats/2-Naughty.mp3`) | Bulky UI files. Makes UI code harder to read. | Move fallbacks to `lib/data/fallbacks.ts`. |
| `app/api/words/random/route.ts` | Hardcoded: `FALLBACK_WORDS` array (70+ items) | Bloated API route file. | Move to `lib/data/words.ts`. |

## **5. Logic Anomalies (Resolved/Verified)**

| Category | Status | Note |
| :--- | :--- | :--- |
| **XP Calculation** | ✅ **Verified Dynamic** | All UI components (`SettingsList`, `AccountInfo`, `XPBar`) now use `getLevelInfo`. |
| **API URLs** | ✅ **Verified Environment** | Use of `NEXT_PUBLIC_SITE_URL` and relative fetch calls is consistent. |
| **Sentry/Monitoring** | ✅ **Verified Environment** | DSNs and environment flags correctly mapped to `.env`. |

---

## **Launch Decision Recommendation**
**YELLOW LIGHT**: The app is functionally robust, but the **Monetization Discrepancies** in `PremiumModal` (Price and Trial) must be resolved before processing real payments to avoid customer complaints. 

**Immediate Actions Needed:**
1. Align `PremiumModal` price and trial text with actual Stripe configuration.
2. Synchronize Storage Bar `limitSeconds` with the tiered constants in `design.ts`.
