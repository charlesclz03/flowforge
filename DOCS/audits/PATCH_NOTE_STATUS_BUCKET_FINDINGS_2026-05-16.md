# Patch-Note Status Bucket Findings

**Date:** 2026-05-16
**Audit baseline:** Patch-note history verification performed after v1.1.0
**Current repo context:** v1.1.1 Patch Note Governance is present in `HEAD`

## Executive Summary

This document explains the audit status table used to summarize the patch-note history verification. It is a bucket-rationale report, not a reconstructed 631-row claim ledger.

Original audit baseline:

| Status | Count | Meaning |
| --- | ---: | --- |
| Done | 456 | Claims that were implemented and reachable or verifiable in code, tests, docs, or browser checks. |
| Partial | 61 | Claims where the core intent existed, but wording, evidence, tests, route behavior, or documentation was incomplete or misaligned. |
| Not done | 18 | Claims that described behavior not present in the current implementation at the time of audit. |
| Useless-unreachable | 28 | Claims tied to dead, unused, superseded, mocked, or unreachable behavior. |
| Needs evidence/manual | 68 | Claims that could not be fully verified without credentials, production data, external dashboards, device testing, or account state. |

The original audit counted 631 meaningful item-level claims from `lib/data/patch-notes.ts`. Since then, v1.1.1 added patch-note governance entries. The current repo contains 154 release entries and 639 patch-note item strings. The 456/61/18/28/68 table should therefore be read as the original audit baseline, not as a fresh classification of the current 639 strings.

Baseline reproduction:

| Snapshot | Releases | Claim items | Notes |
| --- | ---: | ---: | --- |
| v1.1.0 audit baseline, commit `477b4c86` | 151 | 631 | Source snapshot that matches the 456/61/18/28/68 status table. |
| Current `HEAD`, v1.1.1 | 154 | 639 | Includes v1.1.1 patch-note governance additions. |

## Source And Method

Primary sources:

- `lib/data/patch-notes.ts`
- `DOCS/reference/PATCH_NOTES_MASTER.md`
- `DOCS/reference/FEATURE_MATRIX.md`
- `DOCS/summaries/NEXT_PROMPT_PATCH_NOTE_NOT_DONE_AUDIT.md`
- Current app routes, components, API routes, Prisma schema, PWA/TWA assets, tests, and docs

Verification method:

- Extract concrete user-facing and technical claims from every release entry.
- Prefer code inspection first, then runtime/browser checks for UI, routing, layout, mobile, accessibility, PWA/TWA, and visual claims.
- Mark authenticated, paid-tier, admin, Android-device, Stripe, Supabase, production-only, and live-data claims as manual when the repo could not prove them end to end.
- Preserve historical patch-note entries as history, but flag wording that is misleading when read as current product truth.

Important limitation:

- The original audit produced item-level counts but did not create a permanent 631-row ledger. This document explains why claims fell into each bucket using representative evidence. A full ledger would require reconstructing all item-level classifications.

## Status Definitions

### Done

A claim is `Done` when the current implementation contains the described behavior and it is reachable or otherwise verifiable. Evidence may come from source code, tests, generated docs, manifests, browser checks, or command output.

### Partial

A claim is `Partial` when the implementation mostly supports the claim, but some part is incomplete, stale, imprecise, unverified, or contradicted by another current artifact. This includes passing behavior with stale wording, docs that overstate the result, tests that lag the product, and features that exist but not exactly where or how the patch note says.

### Not Done

A claim is `Not done` when it describes behavior that is not implemented in the current app. These are not merely missing manual proof. They are contradicted by current source, route behavior, schema shape, or browser checks.

### Useless-Unreachable

A claim is `Useless-unreachable` when it refers to code or behavior that is no longer reachable, is superseded by newer behavior, exists only as a mock, or points to a route/component that is not wired into the app.

### Needs Evidence / Manual

A claim is `Needs evidence/manual` when the repo can show structure or intent, but cannot prove the full claim without an external condition. Typical blockers are Google auth, Pro subscription state, SUPERADMIN role, Stripe dashboard state, Supabase production data, Android TWA install, Play Console state, physical iOS behavior, or private user-owned data.

## Bucket Details

### Done - 456

Most modern release claims were verifiable. These claims had direct code evidence, tests, browser-visible behavior, or current docs.

Exact reproduced grouping:

| Finding group | Count |
| --- | ---: |
| Practice engine, prompt queues, session save, 2-bar timing, TTS sync, iOS text-only prompt behavior | 96 |
| Auth/profile/account/privacy controls that are implemented in routes, APIs, and components | 54 |
| Beat library, uploads, recordings, playback, deletion, cue/latency support with code evidence | 72 |
| UI/layout/accessibility/visual polish verified by code or browser checks | 88 |
| PWA/TWA/static metadata/assets/docs/security hardening with repo evidence | 58 |
| Tests, release pipeline, docs, patch-note, audit, and build-system claims with evidence | 51 |
| Pricing/download/funnel/protected-route behavior verified unauthenticated or by code | 37 |
| **Total** | **456** |

Representative examples:

- v1.1.0 visual polish is implemented. `components/atoms/IconFrame.tsx` provides the shared icon treatment, and high-traffic surfaces use it across layout, onboarding, download, settings, profile, recordings, and related UI.
- v1.1.0 Practice START halo work is implemented in `components/organisms/practice/PracticeControls.tsx`, with the glow moved outside the clipped visualizer area.
- v1.1.0 landing readability evidence matched browser checks on `/howitworks`: mobile feature-card headings, body copy, line-height, and no-overflow behavior matched the patch-note claim.
- v1.0.9 pricing and auth entry pages are present at `app/pricing/page.tsx`, `app/login/page.tsx`, and `app/signup/page.tsx`.
- v1.0.9 protected-route redirect behavior is implemented in `lib/auth/require-user-session.ts`, and current unauthenticated guarded pages route through `/login?callbackUrl=...`.
- v1.0.8 prompt uniqueness is implemented through `lib/words/session-queue.ts` and consumed by the practice engine.
- v1.0.8 2-bar timing is represented in `lib/constants/design.ts`, the frequency selector, and save/API validation paths.
- v1.0.8 iOS beat protection is represented by the practice client disabling spoken TTS on iPhone/iPad.
- PWA/TWA structure exists in `app/layout.tsx`, `public/manifest.json`, icon assets, service worker configuration, and `public/.well-known/assetlinks.json`.

Risk level: Low for the verified claims. The main risk is future drift if patch-note claims are not backed by repeatable checks.

Recommended handling:

- Keep using code and browser checks before adding release claims.
- Preserve `docs:check:patch-notes` as a release gate.
- Add targeted tests when a patch-note claim describes route behavior, auth redirects, pricing, or prompt/session logic.

### Partial - 61

Partial claims were the audit's gray zone. They generally had a real implementation underneath, but the claim was too broad, stale in one artifact, only partly evidenced, or changed by later work.

Exact reproduced grouping:

| Finding group | Count | Detail |
| --- | ---: | --- |
| Patch-note sync and duplicate historical release IDs | 12 | v1.1.1 aligned TS/master counts, but historical duplicate versions remain: `0.9.995`, `0.9.92`, `0.9.15`. |
| Claims true in code but originally stale in tests/docs | 9 | Example: auth redirect test was stale in the original audit; current v1.1.1 appears fixed. |
| Clean/pristine build wording overstated | 7 | Build passed, but warning-free wording was too strong because Sentry/OpenTelemetry warnings appeared. |
| Refactor wording imprecise | 6 | Example: `PracticeControls` was reduced and split, but not exactly as some wording implies. |
| Canonical-domain history/supersession ambiguity | 4 | Older `freestyla.app` wording is superseded by current `www.freestyla.app`. |
| UI polish claims needing browser evidence | 8 | Real implementation existed, but claims needed viewport/mobile verification to prove. |
| Route/funnel behavior changed by later releases | 6 | Some route claims are historically true but misleading as current truth. |
| Release/version evidence present but documentation trail incomplete | 5 | Implementation existed, but acceptance evidence was not always linked. |
| PWA/TWA repo evidence present but device proof incomplete | 4 | Static assets existed, but device/TWA proof belongs in manual evidence. |
| **Total** | **61** |  |

Representative examples:

- Patch-note source sync was partial during the original audit because `lib/data/patch-notes.ts` and `DOCS/reference/PATCH_NOTES_MASTER.md` were not fully synchronized. In current v1.1.1, both sources report 154 release headings, but duplicate versions such as `0.9.995`, `0.9.92`, and `0.9.15` still exist as historical duplicates in both sources.
- The auth redirect test was partial during the original audit because one test expected the old `/?callbackUrl=...` behavior. In current v1.1.1, `__tests__/auth/require-user-session.test.ts` now expects `/login?callbackUrl=%2Fpractice`, so that specific partial item appears resolved.
- Clean-build or pristine-build wording was partial because the build passed, but emitted Sentry/OpenTelemetry critical dependency warnings. The implementation was shippable, but "warning-free" wording would overstate the evidence.
- PracticeControls split/refactor wording was partial because the component was smaller and used extracted molecules, but the wording could imply a cleaner or different split than the actual current structure.
- Historical canonical-domain wording was partial because older notes referenced `freestyla.app`, while current canonical behavior is `www.freestyla.app`. The older note can remain as history, but should not be read as current canonical truth.

Risk level: Medium. Partial claims are the easiest to accidentally reintroduce as documentation debt because they sound mostly correct.

Recommended handling:

- Treat each partial item as a decision: fix code, fix tests, clarify patch-note wording, add a supersession note, or leave historical wording with an explicit caveat.
- Do not bulk-edit patch notes without preserving release history.
- For future claims, include acceptance evidence in the same release workflow when the claim depends on runtime behavior.

### Not Done - 18

Not-done claims described behavior that the repo did not implement at the time of audit. These require either product work or documentation correction.

Exact reproduced grouping:

| Finding group | Count | Detail |
| --- | ---: | --- |
| `/` real landing-page claim | 3 | Current `app/page.tsx` redirects `/` to `/howitworks`. |
| Social feed/discover/vote/follow claims | 6 | Routes such as `app/feed/page.tsx`, `app/discover/page.tsx`, and `app/api/user/votes/route.ts` are absent. |
| Duel/ranked/live battle claims | 3 | `app/duel/page.tsx` marks ranked behavior as coming soon. |
| Cypher room creation as real backend behavior | 2 | `app/api/cypher/create/route.ts` describes mock room creation. |
| Social graph/schema-backed behavior | 2 | Prisma does not back the claimed follow/vote/duel behavior. |
| Current-facing claims contradicted by route reachability | 2 | Claimed experiences are not reachable through the current app pathing. |
| **Total** | **18** |  |

Representative examples:

- The v1.0.6 claim that `/` is a real landing page instead of a redirect stub is not true in the current app. `app/page.tsx` redirects `/` to `/howitworks`.
- Legacy social/feed/follow/vote claims are not implemented as full product behavior. The repo does not contain routes such as `app/feed/page.tsx`, `app/discover/page.tsx`, or `app/api/user/votes/route.ts`.
- Duel/ranked behavior is not implemented as a real live feature. `app/duel/page.tsx` marks ranked behavior as "Coming Soon".
- Cypher room creation is not implemented as a real data-backed flow. `app/api/cypher/create/route.ts` explicitly describes mock room creation.
- Social graph behavior is not backed by Prisma models for follow/vote/duel style entities.

Risk level: High. These claims are user-facing trust risks if readers assume patch notes describe current functionality.

Recommended handling:

- Use `DOCS/summaries/NEXT_PROMPT_PATCH_NOTE_NOT_DONE_AUDIT.md` as the guarded source prompt for planning the 18 not-done items.
- For each item, choose one resolution: implement the behavior, correct the patch note, add a supersession note, or intentionally archive the historical claim.
- Prioritize the `/` landing-page mismatch and the legacy social/duel claims because they are easy for users or reviewers to misunderstand.

### Useless / Unreachable - 28

These claims refer to behavior that may have existed historically, but is currently dead, mocked, unreachable, or superseded.

Exact reproduced grouping:

| Finding group | Count |
| --- | ---: |
| Root landing components or claims not reachable from `/` | 5 |
| Recording open-access wording superseded by protected-route behavior | 3 |
| Vote-history UI references without matching API route | 3 |
| Duel/cypher shells that are disabled, mocked, or coming soon | 4 |
| Older canonical-domain claims superseded by current `www` canonical | 2 |
| Stale route/component artifacts or unused imports/scratch surfaces | 2 |
| Old onboarding/feedback/patch-note behavior superseded by newer flows | 3 |
| Public profile/social graph UI without schema-backed behavior | 3 |
| Historical download/mobile wording superseded by newer platform messaging | 3 |
| **Total** | **28** |

Representative examples:

- Older recording-access wording that implied recordings were open to all users is superseded by current protected-route behavior. `/recordings` now requires authentication.
- Duel and cypher surfaces include UI or API shells, but parts of the claimed behavior are disabled, mocked, or marked coming soon.
- Vote history UI references are not useful when the matching API route is absent.
- Some older landing-page components still exist as code, but the root route currently redirects to `/howitworks`, so claims about a root landing experience are not reachable through `/`.
- Older canonical-domain claims can be misleading when superseded by current `www.freestyla.app` canonical behavior.

Risk level: Medium to high. Dead or unreachable claims create confusion during QA because auditors may spend time looking for behavior the app no longer exposes.

Recommended handling:

- Separate historical archive notes from current product truth.
- Remove, archive, or clearly label dead route/component claims if they are not intended to return.
- Add route-level reachability checks for claims that mention a page, CTA, or user journey.

### Needs Evidence / Manual - 68

These claims could not be fully proven from the repo alone. Many had code evidence, but required account state, production data, external dashboards, or device behavior to verify end to end.

Exact reproduced grouping:

| Finding group | Count | Required check |
| --- | ---: | --- |
| Google auth, profile completion, username lock | 8 | Real Google login and account state. |
| Stripe/Pro checkout/subscription/webhook behavior | 11 | Stripe test/live dashboard and paid account state. |
| SUPERADMIN/admin-only behavior | 7 | Account with SUPERADMIN role. |
| Supabase storage, private beats, signed URLs, production data | 12 | Real Supabase project data/storage. |
| Recordings/review library with user-owned data | 8 | Authenticated user with saved sessions. |
| Android/TWA/Play Console/AAB/device install | 10 | Android device/emulator and Play Console/AAB evidence. |
| iOS Safari/PWA/TTS/audio behavior | 5 | Physical iOS Safari verification. |
| Production SEO/canonical redirects/analytics | 5 | Production deployment and analytics dashboard. |
| External email/webhook/log behavior | 2 | External provider or production logs. |
| **Total** | **68** |  |

Representative examples:

- Google login and first-time profile completion require an actual auth flow and user account state.
- Pro subscription and premium upgrade behavior require Stripe checkout, webhook, subscription state, and paid account verification.
- SUPERADMIN-only behavior requires an account with the correct role and production-like authorization data.
- Supabase-backed storage, private beat uploads, signed URLs, and recording libraries require real user-owned data and storage state.
- Android/TWA claims require physical or emulator install checks, AAB/Play Console evidence, asset link validation, and device launch behavior.
- iOS home-screen/PWA behavior and Safari audio behavior require real device verification beyond static repo inspection.

Risk level: Medium. These are not necessarily broken, but they lack complete acceptance evidence.

Recommended handling:

- Maintain a manual verification checklist with required account types, devices, and dashboards.
- Capture evidence without secrets: screenshots, route names, sanitized account tier, Stripe test mode IDs, and device/browser versions.
- Add seeded test users or Playwright auth fixtures where possible so fewer claims depend on manual proof.

## Current Repo Delta After v1.1.1

The current repo has changed since the original audit baseline:

- `HEAD` is v1.1.1, with patch-note governance added.
- `PATCH_NOTES` now contains 154 release entries and 639 item strings.
- `DOCS/reference/PATCH_NOTES_MASTER.md` also contains 154 release headings and is marked as generated from `lib/data/patch-notes.ts`.
- `DOCS/reference/FEATURE_MATRIX.md` marks Patch Notes Sync as `PASS [x] 2026-05-16`.
- `DOCS/summaries/NEXT_PROMPT_PATCH_NOTE_NOT_DONE_AUDIT.md` now exists as the next-session prompt for planning the 18 `Not done` findings.
- The original stale auth redirect test appears fixed in current v1.1.1.
- Historical duplicate version entries still exist in both the TS source and generated master notes, which means source alignment is improved, but duplicate historical release IDs remain.

Interpretation:

- The 456/61/18/28/68 counts remain useful as the original audit baseline.
- Some individual `Partial` findings have likely moved after v1.1.1.
- A current-state count would require a full reclassification of the current 639 item strings.

## Not Done Resolution Update - 2026-05-17

Resolution approach:

- The available source material is this bucket-rationale report and its reproduced Not Done grouping, not a preserved 18-row claim ledger.
- The grouped Not Done findings are resolved as patch-note governance clarifications, not product implementation.
- Current product behavior is intentionally preserved: `/` routes to `/howitworks`, social/feed/follow/vote/notification systems are not live scope, duel/ranked behavior remains non-live, and cypher room creation remains a mock shell.

Resolution decisions:

| Finding group | Decision | Current source of truth |
| --- | --- | --- |
| `/` real landing-page claim | Historical caveat/supersession note in patch notes. | `app/page.tsx` redirects `/` to `/howitworks`; `/pricing` carries current plan cards. |
| Social feed/discover/vote/follow claims | Historical caveat/retired-current-scope note in patch notes. | No current `app/feed`, `app/discover`, or `app/api/user/votes` route. |
| Duel/ranked/live battle claims | Historical caveat/non-live note in patch notes. | `app/duel/page.tsx` keeps ranked behavior marked as coming soon. |
| Cypher room creation as real backend behavior | Mock-shell caveat in patch notes. | `app/api/cypher/create/route.ts` remains a mock room creation endpoint. |
| Social graph/schema-backed behavior | Historical caveat/retired-current-scope note in patch notes. | `prisma/schema.prisma` has no Follow, Vote, Duel, or Notification persistence models. |
| Current-facing claims contradicted by route reachability | Historical caveat/supersession note in patch notes. | Current route surface remains practice-first and onboarding-focused. |

Traceability limitation:

- Exact item-level closure for all 18 original rows is not possible from this document alone because the original audit did not preserve a permanent 631-row ledger.
- The grouped 18-count table above remains the canonical traceability spine unless a future session reconstructs a full item-level ledger from the original v1.1.0 audit baseline.

## Recommended Next Documents

Recommended follow-up documents:

- A full 639-item classification ledger if exact current-state counts are required.
- A focused `Partial` resolution plan that chooses code fix, test fix, wording clarification, supersession note, or no-op rationale for each partial item.
- A manual verification checklist for paid, admin, Android/TWA, Supabase, Stripe, and production-only claims.

## Appendix: Representative Evidence

Static evidence paths:

- `lib/data/patch-notes.ts`
- `DOCS/reference/PATCH_NOTES_MASTER.md`
- `DOCS/reference/FEATURE_MATRIX.md`
- `DOCS/summaries/NEXT_PROMPT_PATCH_NOTE_NOT_DONE_AUDIT.md`
- `app/page.tsx`
- `app/pricing/page.tsx`
- `app/login/page.tsx`
- `app/signup/page.tsx`
- `app/duel/page.tsx`
- `app/api/cypher/create/route.ts`
- `lib/auth/require-user-session.ts`
- `lib/words/session-queue.ts`
- `lib/constants/design.ts`
- `components/atoms/IconFrame.tsx`
- `components/organisms/practice/PracticeControls.tsx`
- `public/manifest.json`
- `public/.well-known/assetlinks.json`
- `__tests__/auth/require-user-session.test.ts`

Representative command evidence from the current repo:

- `PATCH_NOTES` current count: 154 release entries, 639 item strings.
- `PATCH_NOTES_MASTER.md` current count: 154 release headings.
- Current duplicate historical versions in both sources: `0.9.995`, `0.9.92`, `0.9.15`.
- Current `FEATURE_MATRIX.md` status: Patch Notes Sync is `PASS [x] 2026-05-16`.
- Current auth redirect test expectation: `/login?callbackUrl=%2Fpractice`.
- Current `/` behavior: redirects to `/howitworks`.
