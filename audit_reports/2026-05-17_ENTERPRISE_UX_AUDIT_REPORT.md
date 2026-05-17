# Enterprise UX Audit Report

**Date:** 2026-05-17
**App:** FlowForge / FreeStyla
**Scope:** Public funnel, practice setup, practice session, Beat Vault, recordings, review studio, settings, auth/profile/account, admin-safe surfaces, PWA/TWA, patch notes, support, feedback, legal, empty/loading/error/offline/free/pro/mobile states.
**Mode:** Report-only audit. No code changes, installs, commits, deploys, real payments, destructive admin actions, or production data mutations were performed during the audit run.

## 1. Executive Summary

FreeStyla has a strong product shell, a polished practice setup, callback-preserving auth redirects, and credible PWA/TWA foundations. The highest-risk UX gaps found were a blank unauthenticated `/review/[id]` deep-link path, stale Playwright expectations, feedback accessibility issues, sub-44px mobile targets, duplicate React keys on patch notes, and unclear loading/locked/install states in several product surfaces.

The app is close to an enterprise-grade mobile practice tool, but it needs a small set of trust fixes: never render blank protected states, make every lifecycle state explicit, stabilize regression tests around current behavior, and formalize touch target/accessibility rules across shared primitives.

## 2. Methodology

Local docs read:

- `.agent/workflows/load_context.md`
- `.agent/workflows/whole_app_audit.md`
- `DOCS/project/PROJECT_STATUS.md`
- `DOCS/project/ROADMAP.md`
- `DOCS/summaries/QUICK_START_NEXT_SESSION.md`
- `DOCS/DOCUMENTATION_INDEX.md`
- `DOCS/architecture/APP_OVERVIEW.md`
- `DOCS/architecture/PRODUCT_SPEC.md`
- `DOCS/testing/TESTING_PLAN_V3.md`
- `DOCS/guides/DEPLOYMENT.md`
- `DOCS/guides/ANDROID_DEPLOYMENT.md`
- `DOCS/reference/DOC_CANONICAL_MAP.json`
- `DOCS/reference/FEATURE_MATRIX.md`
- `audit_reports/WHOLE_APP_AUDIT_MASTER.md`

Workflow and skills used:

- FlowForge repository skill.
- Whole-app audit workflow.
- Web design guidelines skill.
- Browser/devtools exploration.
- Playwright route and breakpoint probes.
- Supabase MCP read-only inspection.

Commands run during audit:

- `npm run lint`: pass.
- `npx tsc --noEmit`: pass.
- `npm run test -- --run`: pass, 116 tests.
- `npm run docs:check`: pass.
- `npm audit --audit-level=high`: pass, 0 vulnerabilities.
- `npm run build`: pass with known Sentry/OpenTelemetry critical dependency warnings.
- `npx playwright test --reporter=line`: failed, 25 passed, 13 failed, 2 skipped.

Browser routes tested on desktop and mobile:

- `/`, `/howitworks`, `/pricing`, `/download`, `/login`, `/signup`
- `/difficultyselection`, `/practice`, `/tracks`, `/recordings`
- `/settings/latency`, `/patch-notes`, `/feedback`
- `/legal`, `/legal/privacy`, `/legal/terms`
- `/profile`, `/admin`, `/admin/beats`, `/review/fake-audit-id`

Research sources:

- WCAG 2.2: https://www.w3.org/TR/WCAG22/
- Apple design tips: https://developer.apple.com/design/tips/
- web.dev PWA installation: https://web.dev/learn/pwa/installation
- Chrome Trusted Web Activity docs: https://developer.chrome.com/docs/android/trusted-web-activity/
- Vercel Labs Web Interface Guidelines: https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md

## 3. Current UX Strengths

- The app shell is cohesive, dark, app-like, and stable across tested desktop and mobile routes.
- `/difficultyselection` is one of the strongest surfaces: beat choice, cadence, language, recording mode, and summary are clear.
- `/practice` starts and runs on desktop/mobile with large primary controls and clear pause/restart affordances.
- Protected routes preserve callback intent for `/recordings`, `/profile`, and `/settings/latency`.
- Beat Vault has clear public/private/pro mental models and visible locked states.
- PWA/TWA foundations exist: manifest, maskable icons, asset links, mobile app meta, safe-area CSS, and `viewport-fit=cover`.
- Local quality gates were strong except for stale Playwright E2E expectations.
- Supabase public tables inspected during the audit had RLS enabled.

## 4. Critical Issues Ranked by Severity

### P0 - Review deep links can render blank for guests

Route/component: `app/review/[id]/page.tsx`.
Repro: open `/review/fake-audit-id` as a guest.
Observed: blank or near-blank body with bottom nav instead of login/private/not-found state.
Risk: users following recording links lose trust immediately.

Evidence type: browser testing and local code.

### P0 - Playwright E2E suite is red

Routes/components: `e2e/basic.spec.ts`, `e2e/mobile.spec.ts`, `e2e/practice.spec.ts`, `app/tracks/page.tsx`, `components/organisms/layout/BottomNav.tsx`, `lib/auth/require-user-session.ts`.
Observed: 13 failures from stale redirect expectations, public funnel nav assumptions, and brittle `Beat Vault` text locators.
Risk: release confidence is reduced even when app behavior is mostly correct.

Evidence type: local command output and local code.

### P1 - Feedback accessibility is below product baseline

Routes/components: `/feedback`, `components/features/feedback/FeedbackForm.tsx`, `components/molecules/input/StarRating.tsx`.
Observed: unlabeled star buttons, no radiogroup semantics, placeholder-only textarea.
Risk: feedback is hard to submit with assistive tech or keyboard navigation.

Evidence type: browser testing and local code.

### P1 - Mobile touch targets are inconsistent

Routes/components: `/tracks`, `/settings`, `/feedback`, `/download`, shared modal/switch controls.
Observed: several controls measured below the 44px mobile target baseline.
Risk: TWA/mobile ergonomics feel compressed and error-prone.

Evidence type: browser testing and research.

### P1 - Patch notes route emits duplicate-key console errors

Route/component: `app/patch-notes/page.tsx`.
Observed: duplicate keys for repeated categories such as `Visual Overhaul`.
Risk: noisy console and unstable list reconciliation.

Evidence type: browser testing and local code.

## 5. Full Route-by-Route Findings

`/`: redirects to `/howitworks`, matching the current practice-first funnel.

`/howitworks`: strong hierarchy and content, but public navigation is narrow. CTAs should be consistently link-like where navigation is the action.

`/pricing`: good Free/Pro framing. Duplicate H1 hierarchy and guest CTA ambiguity reduce clarity.

`/download`: truthful platform copy, but install guidance should respond to platform and installed state. Manifest screenshots should show real product surfaces.

`/login` and `/signup`: callback preservation is good. Duplicate H1 structure should be reduced, and guest-vs-account value copy should remain explicit.

`/difficultyselection`: strong setup console. Needs accessible status for voice packs/TTS and a larger, labeled recording-mode switch.

`/practice`: core session flow works. Needs screen-reader status messaging for playing, recording, paused, mixing, saving, and errors.

`/tracks`: clear content and pro gating. Needs stable loading copy, larger chips/actions, less repetitive lock copy, and telemetry for locked/pro friction.

`/recordings`: protected redirect is correct. Empty/loading/stats-only/processing states exist but should be more explicit and accessible.

`/review/[id]`: highest-risk route. Guests should see login/private context and authenticated users should see a useful not-found/private/processing state.

`/settings/latency`: redirect works. Settings sheet needs accessible switch labels, close label, safe-area confidence, and touch-target cleanup.

`/admin` and `/admin/beats`: safely not exposed to guests. Session-expired admins should go to login instead of only seeing a 404.

`/patch-notes`: content is rich but long. Duplicate keys need fixing and bottom navigation should remain polished.

`/feedback`: useful surface, but star rating and textarea accessibility need remediation.

`/legal/*`: stable and public. Header/action targets need the same mobile target standard as app routes.

## 6. Mobile, PWA, and TWA Findings

- Safe-area and manifest foundations are present.
- The product should apply a strict 44px minimum for tappable controls.
- `/download` should distinguish browser launch, iOS home-screen install, Android app/TWA path, and already-installed standalone mode.
- Real app screenshots should replace generic OG screenshots in manifest install metadata.
- TWA validation should include physical Android hardware checks for `/difficultyselection`, `/practice`, `/tracks`, `/recordings`, `/profile`, and legal pages.

Evidence type: local code, browser testing, and web research.

## 7. Accessibility Findings

- Add labels and semantics to feedback star controls.
- Add labels to switch-only controls.
- Avoid duplicate H1s on public/auth pages.
- Add `role=status` or `aria-live` to recording, saving, loading, processing, TTS readiness, and error states.
- Ensure modal close buttons have accessible names.
- Preserve visible focus rings on chips, switches, icon buttons, and route CTAs.

Evidence type: browser testing, local code, and WCAG 2.2.

## 8. Performance and Perceived-Latency Findings

- Build passed, but `/selectdifficulty` duplicated the heavy `/difficultyselection` client page and should be a lightweight redirect.
- `/tracks` loading should avoid title collisions and should make fallback/retry behavior clear.
- `/patch-notes` is content-heavy; fixing console errors protects perceived quality.
- Known Sentry/OpenTelemetry build warnings remain non-blocking but noisy.

Evidence type: build output and local code.

## 9. Copy, Content, and Terminology Findings

- Standardize terms: Beat Vault, Practice, Review Studio, Recordings, Calibration, Pro, My Tracks, Public Tracks.
- Locked-state copy should be benefit-led, not repetitive.
- Manifest/app metadata should avoid broad claims that do not match current product truth.
- Auth copy should clarify what guests can do now and what accounts preserve.

Evidence type: browser testing and local code.

## 10. Monetization and Conversion Findings

- Pro boundaries are visible and understandable.
- Pricing CTAs should distinguish free practice from Pro checkout.
- Locked Beat Vault states should explain the benefit at the moment of friction.
- Telemetry should track pro lock clicks, checkout intent, install CTA, auth callback, upload fail, recording fail, review save, and TTS unavailable.

Evidence type: browser testing, local code, and inference.

## 11. What to Remove or Simplify

- Replace `/selectdifficulty` client re-export with a redirect.
- Reduce repeated locked-copy noise on beat cards.
- Remove duplicate heading hierarchy on auth/pricing pages.
- Avoid route tests that depend on ambiguous text shared by heading and loading states.

Evidence type: local code and browser testing.

## 12. What to Add

- Review deep-link login/private/not-found states.
- Accessible feedback rating controls.
- Mobile target-size guardrails.
- Status messages for practice and recording lifecycle.
- Platform-aware install guidance.
- UX friction telemetry.
- Regression tests for the current routing and accessibility rules.

Evidence type: local code, browser testing, and recommendations.

## 13. What to Modify

- Update Playwright tests to current auth behavior.
- Rename Beat Vault loading text to avoid locator collisions.
- Increase target sizes for chips, switches, close buttons, and icon actions.
- Fix patch-note keys with stable composite keys.
- Improve settings sheet switch labels.
- Improve pricing/auth CTA text.

Evidence type: local code and browser testing.

## 14. Enterprise-Grade Design System Recommendations

- Create and enforce shared primitives for icon button, switch, chip, modal close, locked state, empty state, skeleton, and status message.
- Use semantic roles and accessible names as part of the primitive contract.
- Keep SaaS/product surfaces dense but calm: scan-first hierarchy, predictable controls, restrained cards, and clear state labels.
- Add mobile-first acceptance criteria to every new UI component: target size, safe-area, no horizontal overflow, focus visible, and reduced-motion safety.

Evidence type: web research and inference.

## 15. Prioritized Implementation Roadmap

Quick wins:

- Fix review unauthenticated deep link.
- Fix Playwright stale expectations.
- Fix feedback labels and star semantics.
- Fix patch-note duplicate keys.
- Rename Beat Vault loading copy.

Medium spikes:

- Mobile touch-target sweep.
- Settings sheet accessibility pass.
- Recording and review lifecycle status messages.
- Platform-aware install route.
- Pro lock copy and telemetry.

Larger strategic improvements:

- Design-system primitive hardening.
- Authenticated/pro/admin fixture matrix.
- TWA physical-device QA.
- Full lifecycle observability dashboard.

## 16. Suggested Playwright and Regression Tests

- Guest `/review/[id]` never renders blank and preserves callback.
- Protected routes preserve `callbackUrl`.
- `/tracks` guest loads without unauthorized `/api/user/beats` noise.
- Mobile public funnel intentionally hides bottom nav while app routes show it.
- Feedback rating and textarea have accessible names.
- Critical mobile controls meet target-size checks.
- Patch notes route has no duplicate-key console errors.
- Practice start, pause, resume, end, and recording transitions work on desktop and mobile.
- `/download` shows platform-aware install copy where mockable.

## 17. Evidence Boundary

Findings from local code/docs:

- Route inventory, app docs, manifest, patch notes, component code, auth helpers, tests, build output.

Findings from browser testing:

- Route rendering, redirects, loading text, blank review state, mobile target measurements, feedback labels, patch-note console errors.

Findings from live web research:

- Accessibility, mobile touch target, PWA install, TWA, and web interface guidance.

Inferences or recommendations:

- Authenticated/pro/admin states were not fully mutated in live data.
- Real payments and destructive admin actions were not tested.
- PWA/TWA install behavior was assessed from manifest/code/docs and local browser behavior, not from a fresh Play Store install.
