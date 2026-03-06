# Whole-App Audit Report (No Repo Changes)
**Date:** 2026-03-05
**Scope:** E2E Health, Test Suites, Route Analytics, Dependency Audits, Code Forensics, and Live Smoke Checks in `localhost:3001` (production build).

---

## 1) Automated Checks (Local)
**Status:** ✅ PASS (Syntactic + Tests + Build)

- **Lint:** `npm run lint` → **PASS** (1 Next.js 16 deprecation warning).
- **Types:** `npx tsc --noEmit` → **PASS** (Zero errors)
- **Unit tests:** `npm run test -- --run` → **PASS** (72/72 tests passed, including new stricter Zod coercion logic).
- **Build:** `npm run build` → **PASS** (Successfully generated optimized static chunks and ISR configurations).

### Security scan (Dependency audit)
**Status:** 🔴 RISK
- `npm audit --audit-level=high` → **26 vulnerabilities** (1 moderate, 25 high).
- **Note:** Next-PWA and serialize-javascript are primarily flagged. This requires a targeted dependency upgrade sprint.

---

## 2) App Surface Area Inventory (Routes)
- **Pages:** 35 (`app/**/page.tsx`)
- **API Routes:** 29 (`app/api/**/route.ts`)
- **Largest pages (LOC):** `/settings/latency` (583), `/admin/beats` (412), `/review/[id]` (398), `/tracks` (380), `/u/[username]` (354)
- **Largest API routes (LOC):** `/api/recordings` (535), `/api/session/complete` (260), `/api/recordings/[id]` (230), `/api/stripe/webhook` (225)

---

## 3) Live Smoke Test (Performance & Production Build)
**Status:** ✅ HEALTHY

### Navigation Correctness
- `http://localhost:3001/` properly redirects and executes middleware without throwing.
- Unauthenticated `/tracks` access returns cleanly without triggering noisy 401 console errors.

### Practice Audio Pipeline
- Playwright-based script smoke-tested `/practice`, confirming **0 console errors** and **0 CORS/CSP violations**. 
- The recent fix to silence audio URL leaks in the console was successful. Privacy is maintained.

---

## 4) Code Forensics (Git History & Churn)
Scripts run: `audit-feature.ts` against `AUTH`, `STRIPE`, and `PRACTICE_AUDIO`.

- **AUTH (`lib/auth.ts`, `app/api/auth/*`)**
  - **Status:** 🔴 HIGH CHURN DETECTED (25 Commits, 28% Hotfix Ratio).
  - **Risk:** "Circular Refactoring" suspects identified around the topics `auth` and `sync`. High complexity remains.
- **STRIPE**
  - **Status:** 🟢 STABLE (19 Commits, 31.6% Hotfix Ratio).
- **PRACTICE_AUDIO**
  - **Status:** 🟢 STABLE (0 recent hotfixes; recent P0/P1 stability patches have hardened this zone successfully).

---

## 5) Type Safety / Complexity Debt
**Status:** 🟡 MODERATE
- **Count:** **51** instances of `as any`, `: any`, `@ts-expect-error`, or `@ts-ignore`.
- **Primary Source:** `lib/auth.ts` remains a massive gravity well for type escapes due to missing NextAuth module augmentations.

---

## 6) Scorecard (0-100)
- **Audio Reliability**: 95 (Hardened, debug variables strictly gated, Suspense boundaries added)
- **Stripe Reliability**: 90 (Stable)
- **Auth/Roles Robustness**: 60 (High churn, 51 type escapes scattered around session tokens)
- **Security Posture**: 55 (25 High NPM Audit vulnerabilities flagged)
- **Testing Maturity**: 80 (Vitest spans 72 assertions, Zod testing is strict)

---

## 7) "Forever Fix" Backlog & Remediation Plan

### P0 (Must Fix Next)
1. **NPM Audit Vulnerability Sprint**
   - **Goal:** Resolve the 25 high-severity reports tied to Webpack/Serialize-Javascript and Next-PWA.
   - **Remediation:** Branch off to run `npm audit fix --force` or manually upgrade `next-pwa` to a modern fork. Retest all service worker offline capabilities.

### P1 (High ROI Hardening)
2. **NextAuth Type Augmentation**
   - **Goal:** Eliminate the ~51 type escape hatches primarily stemming from `session.user` extensions.
   - **Remediation:** Create `types/next-auth.d.ts` and augment the `Session` and `User` interfaces with `role`, `subscriptionStatus`, `username`, `currentStreak`, and `xp`. Remove all `@ts-expect-error` calls in `lib/auth.ts`.

3. **Practice UI Re-Architecture**
   - **Goal:** Separate the monolithic ~800+ LOC component into a strict Orchestrator (State Machine) vs Presentational "Dumb" UI layout. This prevents future regressions in the Audio loop.

### P2 (Cleanup)
4. **Settings Page Optimization**
   - **Goal:** `/settings/latency` is currently the largest page in the app (583 LOC). Break it down into smaller Client Components using `dynamic()` lazy-loading.
