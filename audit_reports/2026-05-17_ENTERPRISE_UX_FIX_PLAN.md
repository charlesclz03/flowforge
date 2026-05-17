# Enterprise UX 17-Track Fix Plan

**Date:** 2026-05-17
**Source audit:** `audit_reports/2026-05-17_ENTERPRISE_UX_AUDIT_REPORT.md`
**Packaging:** Phased PRs. Keep the audit master template unchanged.

## P0 - User-Blocking and Release-Confidence Fixes

1. `/review/[id]` unauthenticated/deep-link blank state
   - Fix: show a private-review sign-in state and redirect to `/login?callbackUrl=/review/[id]`.
   - Accept: guest deep link never renders blank; authenticated missing/deleted recording shows useful not-found/private copy.
   - Verify: Playwright guest review test.

2. Red Playwright E2E suite and stale route expectations
   - Fix: update protected route expectations to `/login?callbackUrl=...`, update mobile public funnel nav expectations, and replace ambiguous `Beat Vault` text locators with heading-specific locators.
   - Accept: targeted E2E tests pass on desktop and mobile projects.
   - Verify: `npx playwright test e2e/basic.spec.ts e2e/mobile.spec.ts e2e/practice.spec.ts`.

3. Feedback form accessibility
   - Fix: make star rating a radiogroup, label each star, add a visible textarea label, preserve keyboard/focus behavior.
   - Accept: stars are discoverable as radio options and textarea is findable by label.
   - Verify: Playwright feedback accessibility smoke.

4. Patch notes duplicate React keys
   - Fix: use composite keys for repeated category groups.
   - Accept: `/patch-notes` renders without duplicate-key console errors.
   - Verify: console-error Playwright guard.

5. Beat Vault loading/copy collision
   - Fix: rename loading copy so it does not collide with the page heading and keep fallback catalog messaging explicit.
   - Accept: route tests can target the real heading and users understand fallback/loading state.
   - Verify: `/tracks` guest smoke and unauthorized-user-beats guard.

## P1 - Mobile, TWA, and Lifecycle Polish

6. Mobile touch target sweep
   - Fix: standardize 44px minimum targets on chips, icon buttons, switches, modal close buttons, track actions, and settings controls.
   - Accept: critical mobile controls meet the app target baseline.
   - Verify: Playwright target-size checks for `/tracks`, `/feedback`, `/difficultyselection`, settings sheet.

7. Public funnel information architecture and CTA clarity
   - Fix: keep public funnel focused while ensuring clear routes to practice, pricing, download, sign-in, and app home.
   - Accept: users can infer where to start, upgrade, or install without opening settings.
   - Verify: desktop/mobile public funnel smoke.

8. Pricing/login/signup heading and conversion copy
   - Fix: reduce duplicate H1 patterns and distinguish free practice from Pro checkout.
   - Accept: guest CTAs clearly communicate `Start Free` vs `Pro Checkout`.
   - Verify: accessible heading snapshots and CTA text checks.

9. Download/PWA/TWA install experience
   - Fix: add platform-aware installed-state copy and make iOS/Android/browser paths explicit.
   - Accept: `/download` does not imply unavailable binaries and gives device-appropriate next steps.
   - Verify: mocked platform/device checks where practical.

10. Practice setup recording/TTS trust states
    - Fix: add `aria-live` voice readiness, label recording switch, and instrument recording mode changes.
    - Accept: users and assistive tech can tell whether TTS/recording is available.
    - Verify: `/difficultyselection` accessibility smoke.

11. Practice session recording controls and lifecycle states
    - Fix: add screen-reader status for ready, countdown, playing, recording, paused, mixing, saving, and error states.
    - Accept: session state is never visual-only.
    - Verify: practice start/pause/resume/end E2E.

12. Recordings empty/loading/error/processing states
    - Fix: make loading/processing state live, clarify empty copy, and keep stats-only state clear.
    - Accept: users understand whether audio is ready, processing, stats-only, or missing.
    - Verify: component/unit coverage plus recordings smoke.

13. Review studio playback/save/not-found states
    - Fix: preserve save/download behavior while making private/not-found/loading states explicit.
    - Accept: review studio never renders blank and always offers a next action.
    - Verify: review route smoke and existing review unit coverage.

14. Settings sheet accessibility and safe-area behavior
    - Fix: label switch controls, label close button, ensure safe-area scrolling, and preserve focus rings.
    - Accept: settings sheet is usable by touch, keyboard, and assistive tech.
    - Verify: mobile settings smoke.

15. Admin unauthorized/session-expired UX
    - Fix: redirect unauthenticated admins to login with callback while preserving 404 for signed-in non-admin users.
    - Accept: session-expired admins can recover; unauthorized users do not learn admin details.
    - Verify: unauthenticated `/admin` route test and signed-in non-admin test when fixture is available.

## P2 - Conversion, Platform Confidence, and System Consistency

16. Monetization, locked states, and Pro upgrade prompts
    - Fix: make locked copy benefit-led, reduce repetition, and instrument pro-lock clicks.
    - Accept: upgrade prompts explain what Pro unlocks at the moment of friction.
    - Verify: Beat Vault lock smoke and analytics helper test.

17. Design-system, i18n, telemetry, and regression-test hardening
    - Fix: document primitive contracts for target size, labels, focus, empty/loading/error states, multilingual readiness, and UX friction events.
    - Accept: new UI work has explicit reusable standards instead of page-level one-offs.
    - Verify: docs check, unit tests where helpers are added, and targeted Playwright regression matrix.

## Required Verification

Run after implementation:

```powershell
& "C:/Program Files/nodejs/npm.cmd" run lint
& "C:/Program Files/nodejs/npx.cmd" tsc --noEmit
& "C:/Program Files/nodejs/npm.cmd" run test -- --run
& "C:/Program Files/nodejs/npm.cmd" run docs:check
& "C:/Program Files/nodejs/npm.cmd" run build
```

Run targeted browser regression:

```powershell
& "C:/Program Files/nodejs/npx.cmd" playwright test e2e/basic.spec.ts e2e/mobile.spec.ts e2e/practice.spec.ts --reporter=line
```

## Assumptions

- No database schema changes are required.
- No public API contract changes are required.
- Telemetry should use the existing `lib/analytics/track.ts` helper only.
- Real payments, production data mutation, and destructive admin actions remain out of scope for verification.
- User-visible changes must stay synchronized in `lib/data/patch-notes.ts` and `DOCS/reference/PATCH_NOTES_MASTER.md`.
