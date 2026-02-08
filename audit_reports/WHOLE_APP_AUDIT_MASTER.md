# Wholeâ€‘App Audit Master (FlowForge â€‘ Freestyle)

**Purpose:** Canonical, repeatable â€œwhole appâ€ audit that covers code health, routes, tests, docs drift, and MCP usageâ€”plus live smoke checks (when possible).

**Audit rule (default):** Prefer **no repo changes** during an audit run. Generate the report in-chat first. Only write/update audit files if explicitly requested.

---

## How to Run This Audit (Agent Workflow)

> This is the expanded â€œwholeâ€‘appâ€ version of `.agent/workflows/audit.md` + `.agent/workflows/MCP_audits.md`.

### 0) Preconditions
- Clean working tree: `git status -sb`
- No secrets in output: never paste keys/tokens/DB URLs in the report. Use placeholders and redact identifiers where needed.
- Use Windowsâ€‘safe commands (`npm.cmd` / `npx.cmd`) when running via PowerShell.

### 1) Local automated checks
Run (single run, no watch):

```powershell
& "C:/Program Files/nodejs/npm.cmd" run lint
& "C:/Program Files/nodejs/npx.cmd" tsc --noEmit
& "C:/Program Files/nodejs/npm.cmd" run test -- --run
& "C:/Program Files/nodejs/npm.cmd" run build
```

Record PASS/FAIL + any warnings (do not â€œfixâ€ anything during audit).

### 2) Dependency security scan

```powershell
& "C:/Program Files/nodejs/npm.cmd" audit --audit-level=high
```

Record counts and whether fixes require breaking upgrades.

### 3) Route surface inventory
Goal: count pages/API routes and identify largest files/hotspots.

Recommended (PowerShell):

```powershell
# Pages
(Get-ChildItem -Recurse -File app -Filter page.tsx).Count

# API routes (Next App Router)
(Get-ChildItem -Recurse -File app\\api -Filter route.ts).Count

# Largest pages by LOC (top 10)
Get-ChildItem -Recurse -File app -Filter page.tsx |
  ForEach-Object { [pscustomobject]@{ Path=$_.FullName; Lines=(Get-Content $_.FullName).Count } } |
  Sort-Object Lines -Descending |
  Select-Object -First 10

# Largest API routes by LOC (top 10)
Get-ChildItem -Recurse -File app\\api -Filter route.ts |
  ForEach-Object { [pscustomobject]@{ Path=$_.FullName; Lines=(Get-Content $_.FullName).Count } } |
  Sort-Object Lines -Descending |
  Select-Object -First 10
```

### 4) Typeâ€‘safety + complexity sweep
Goal: quantify type escapes + identify the â€œregression gravity wellsâ€.

```powershell
# Type escape hatches (exclude docs/tests)
rg -n \"\\bany\\b|as any|@ts-ignore|@ts-expect-error\" app components hooks lib prisma types --glob '!**/__tests__/**' --glob '!**/e2e/**' --glob '!**/DOCS/**'
```

Also list the biggest files by LOC in key areas (`app/practice`, `hooks/player`, `lib/audio`, auth).

### 5) Forensics (churn + circular refactor loop detection)
Run the existing audit script against top risk zones (at minimum):
- Practice/Audio
- Auth/Roles
- Stripe/Monetization

```powershell
& "C:/Program Files/nodejs/npx.cmd" ts-node scripts/audit-feature.ts "PRACTICE_AUDIO" "app/practice/**/*" "hooks/player/**/*" "lib/audio/**/*"
& "C:/Program Files/nodejs/npx.cmd" ts-node scripts/audit-feature.ts "AUTH" "lib/auth.ts" "app/api/auth/**/*" "middleware.ts" "types/**/*"
& "C:/Program Files/nodejs/npx.cmd" ts-node scripts/audit-feature.ts "STRIPE" "app/api/stripe/**/*" "lib/stripe.ts" "components/molecules/monetization/**/*"
```

Read the generated reports in `audit_reports/` and summarize the â€œwhy we keep refactoring thisâ€ pattern.

Optional deep dive (audit.md â€œHall of Fameâ€ / circular refactor analysis):
- Identify 5â€“10 checkpoints (tags or commit hashes) for the highest-risk zone.
- Score each checkpoint (0â€“100) using:
  - **Stability (40%)**: time until next hotfix in that area
  - **Cleanliness (30%)**: fewer `any` / `@ts-*` / TODOs
  - **Performance (30%)**: subjective loop/latency correctness
- For the top 1â€“2 suspect functions, use line-history tracing:
  - `git log -L :<functionName>:<filePath>` to detect â€œwe fixed this before, then removed itâ€.

### 6) MCP audit + live smoke (when tools are available)
If MCP tools are available:
- `chrome-devtools`: run a smoke harness (public pages + console/network assertions).
- `supabase-mcp-server`: verify connectivity (project list, basic SQL read-only query, logs if available).

Minimum live smoke checklist (production URL):
- `/` redirect behavior (record the final landing URL)
- Retired social discovery route remains removed (expect 404).
- `/tracks` as signed-out user: confirm no â€œerrorâ€ noise for expected unauth states
- `/practice`: start a session, confirm audio plays, confirm no CORS/CSP violations, confirm no privacy leaks in logs

### 7) Report + scoring
Produce a report using the same section headings as the â€œLatest Reportâ€ below:
- Automated checks
- Routes
- Live smoke + navigation correctness
- MCP audit
- Forensics hotspots
- Type safety/complexity
- Security/privacy
- Scorecard (0â€“100)
- â€œForever Fixâ€ backlog (P0/P1/P2)

### 8) Remediation plan
Produce a decisionâ€‘complete fix plan (P0 â†’ P1 â†’ P2) with:
- exact files to touch
- acceptance criteria
- tests to run (unit/e2e/manual)
- rollout notes (prod logging/monitoring)

---

## Latest Report (No Repo Changes)
# Wholeâ€‘App Audit Report (No Repo Changes)
**Date:** 2026-02-03  
**Scope:** End-to-end health (code + routes + testing + docs + MCP usage), plus live smoke checks via `chrome-devtools`. No files were edited.

---

## 1) Automated Checks (Local)
**Status:** âœ… PASS (no errors)

- **Lint:** `npm run lint` â†’ **0 errors**, warnings only (mostly `prettier/prettier` CRLF + `@next/next/next-script-for-ga` in `app/layout.tsx`).
- **Types:** `npx tsc --noEmit` â†’ **PASS**
- **Unit tests:** `npm run test -- --run` â†’ **PASS** (27 tests)
- **Build:** `npm run build` â†’ **PASS** (warnings only; Sentry/otel â€œrequire functionâ€¦â€ warning + the same prettier warnings).

### Security scan (dependency audit)
**Status:** ðŸ”´ RISK (requires follow-up)
- `npm audit --audit-level=high` reports **15 vulnerabilities** (**4 high**, **11 moderate**).  
- Auto-fix path requires breaking upgrades (it suggests `next@16`, `eslint@9`, `vitest@4`). This needs a dedicated upgrade sprint.

---

## 2) App Surface Area Inventory (Routes)
- **Pages:** 35  
- **API routes:** 29  
- **Largest pages (LOC):** `app/admin/beats/page.tsx` (388), `app/tracks/page.tsx` (328), `app/u/[username]/page.tsx` (312), `app/orderconfirmed/page.tsx` (235)  
- **Largest API routes (LOC):** `app/api/recordings/route.ts` (334), `app/api/session/complete/route.ts` (197), `app/api/stripe/webhook/route.ts` (196)

---

## 3) Live Smoke (MCP `chrome-devtools`, production site)
**Status:** ðŸŸ¡ Mixed (core pages load; a few correctness/UX issues surfaced)

### Navigation correctness
- `/` **redirects to** `/howitworks` (production behavior).  
  - **Impact:** current Playwright `e2e/basic.spec.ts` assumptions for `/` likely donâ€™t match production.
- Retired social discovery route returns **404** in production.
  - **Impact:** `e2e/basic.spec.ts` test â€œnavigate to retired social routeâ€ is stale (would fail against reality).

### Tracks page behavior
- `/tracks` loads and shows the Beat Vault correctly.
- The client performs `GET /api/user/beats` even when not signed in â†’ **401** shows up as a console/network error.
  - **Forever-fix candidate:** only request user beats when a session exists, or treat 401 as an expected state without logging as an error.

### Practice audio behavior (important)
- `/practice` loads; after clicking **START**, the beat asset was requested from Supabase storage and audio initialized successfully.
- **No CORS/CSP console errors observed** during start.
- **Privacy/production logging issue:** the console logs include full beat URLs (including user-scoped storage paths/IDs).  
  - **Forever-fix candidate (high priority):** disable debug logging in production and/or sanitize URLs before logging.

---

## 4) MCP Audit (per `.agent/workflows/MCP_audits.md`)
**chrome-devtools**
- **Status:** âœ… Healthy
- **Connectivity:** confirmed (list pages, navigate, snapshots, network/console inspection all worked).
- **Opportunity:** use it as an official â€œsmoke harnessâ€ (public routes + console/network assertions) to prevent regressions like retired-route drift and unauth 401 noise.

**supabase-mcp-server**
- **Status in this Codex session:** âš ï¸ Not available as an executable tool (canâ€™t run SQL/log queries here).  
- **Repo usage:** no code uses MCP; only docs reference MCP commands (expected).

---

## 5) Code Forensics (Churn + â€œCircular Refactorâ€ risk)
### Hotspots since 2026-01-04 (most touched paths)
- Practice/audio stack churn is highest: `app/practice/page.tsx`, `components/organisms/practice/PracticeControls.tsx`, `hooks/player/usePracticeEngine.ts`, `app/practice/PracticeClient.tsx`.
- Settings also churny: `components/organisms/settings/SettingsList.tsx`.

**Interpretation:** the practice/audio engine is historically the highest regression-risk zone. This aligns with prior audits noting repeated â€œfixedâ€ loops.

---

## 6) Type Safety / Complexity Debt
### Type escape hatch count (excluding tests/docs)
- ~**26** matches of `as any` / `: any` / `@ts-*` in production code.
- Biggest contributor: **`lib/auth.ts`** (multiple `@ts-expect-error` for NextAuth custom fields).

**Forever-fix candidates**
- Add proper NextAuth module augmentation for `session.user` fields (id, role, username, subscriptionStatus, etc.) to eliminate repeated `@ts-expect-error`.
- Replace monkey-patching (`audio._sourceNode`) with a typed interface extension for `HTMLAudioElement`.

### Complexity hotspots (LOC)
- `PracticeControls.tsx` ~806 LOC, `PracticeClient.tsx` ~547 LOC, `usePracticeEngine.ts` ~472 LOC.
- `app/api/recordings/route.ts` ~334 LOC.

**Forever-fix candidates**
- Split `PracticeControls` into smaller â€œdumbâ€ UI + a single orchestration layer.
- Introduce an explicit state machine boundary for practice lifecycle (loaded â†’ primed â†’ running â†’ paused â†’ stopped) and make it the single source of truth.

---

## 7) Security / Privacy Findings (High-signal)
**P0**
- Production console logs leak user-scoped storage URLs/IDs during audio start (privacy/telemetry concern).

**P1**
- CSP includes `'unsafe-inline'` and `'unsafe-eval'` in `script-src` (broad attack surface). Lint also flags GA/GTM script usage.
- `images.remotePatterns` is very broad (`**.supabase.co`) and `npm audit` flags a Next image optimizer DoS advisory. Even without upgrading Next immediately, tightening host patterns reduces risk.

**P1**
- Hardcoded superadmin emails in `lib/auth.ts` (role/auth logic tied to email strings; also a privacy smell). Prefer DB roles + a one-time migration/backfill.

---

## 8) Scorecard (0â€“100)
- **Stripe reliability:** 85 (race mitigation + idempotent webhook logic exists; still watch env/observability)
- **Audio reliability:** 80 (works live; needs production log hardening + regression harness)
- **Auth/roles robustness:** 60 (hardcoded superadmin emails + type escapes)
- **Testing maturity:** 65 (unit tests pass; Playwright exists but stale + not wired to run with a webServer)
- **Security posture:** 55 (`npm audit` highs + CSP looseness + broad remotePatterns)
- **Docs alignment:** 70 (much improved, but feature matrix header/version and some legacy TODOs are stale)
- **MCP readiness:** 75 (chrome-devtools strong; supabase MCP not verifiable in this session)

---

## 9) â€œForever Fixâ€ Backlog (Prioritized, no implementation here)
**P0 (do next)**
1. **Kill/sanitize production audio logs** (no user URLs/IDs in console; debug behind env flag).
2. **Fix `/tracks` unauth 401 noise** (donâ€™t call `/api/user/beats` unless signed in; handle 401 as expected).
3. **Update Playwright to match reality** (replace retired-route test; align `/` redirect behavior; enable `webServer` in config or add a documented test harness).

**P1**
4. **NextAuth type augmentation + remove `@ts-expect-error` pile** (single canonical session/user type surface).
5. **Security tightening**: remove `'unsafe-eval'` where possible; migrate GTM/GA to `next/script`; tighten `remotePatterns` to your exact storage hosts.
6. **Practice engine refactor boundary**: state machine + smaller components + one integration smoke test.

**P2**
7. Remove/replace dead or misleading TODO components (e.g., unused upgrade prompt that still alerts â€œStripe in V2â€).

If you want, I can also do a deeper â€œaudit.md-styleâ€ drilldown on ONE hotspot area (Practice Engine vs Recordings vs Auth) and produce a ranked Hall-of-Fame version table + exact â€œlost code / circular refactorâ€ suspects â€” still without changing any files.

---

## Remediation Plan (Decisionâ€‘Complete, P0 â†’ P2)

> This is the concrete engineering plan to resolve every item in Section 9, plus the high-signal risks called out in Sections 1 and 7.

### P0 â€” Must Fix Next (Privacy + Correctness + Test Signal)

#### P0.1 â€” Kill/sanitize production audio logs (privacy)
**Goal:** No production console output contains user-scoped Supabase storage paths, beat URLs, user IDs, or other PII-ish identifiers.

**Root cause:** `lib/audio/player.ts` defaults `debug = true` and logs the full beat URL in `AudioPlayer.load()`.

**Implementation (forever-fix):**
1. Change `AudioPlayer` debug default to `false`.
2. Gate debug logs behind a deliberate opt-in flag:
   - `NEXT_PUBLIC_AUDIO_DEBUG=true` enables logs, otherwise silent.
   - Additionally enforce `process.env.NODE_ENV !== 'production'` unless explicitly required for a short-lived prod investigation.
3. Sanitize any URL logs:
   - If logging is enabled, log only `origin` + `pathname` suffix (or a stable hash), never the full path.
4. Ensure error logs do not include full `this.audio.src` values.

**Files to change:**
- `lib/audio/player.ts`

**Tests/validation:**
- Manual (prod + local): open `/practice`, start audio, confirm console is clean in production by default.
- Unit: add a small test (optional) asserting `AudioPlayer` does not log when debug disabled (mock `console.log`).

**Acceptance criteria:**
- Production smoke via `chrome-devtools`: no `[AudioPlayer] Loading beat:` with a full URL.

---

#### P0.2 â€” Fix `/tracks` unauth 401 noise (UX correctness)
**Goal:** Signed-out users do not trigger a 401 request to `/api/user/beats` from `/tracks`.

**Root cause:** `app/tracks/page.tsx` calls `/api/user/beats` unconditionally in `fetchBeats()`.

**Implementation (forever-fix):**
1. Use `useSession()` to conditionally include the user-beats fetch:
   - If `session?.user?.id` is falsy, skip the request entirely and treat user beats as `[]`.
2. Optional hardening: if a 401 ever happens anyway, treat it as expected and avoid `console.error`.

**Files to change:**
- `app/tracks/page.tsx`

**Tests/validation:**
- Manual: open `/tracks` in an incognito browser â†’ verify no `/api/user/beats` request is made.
- Unit (optional): none required; this is a fetch gating change.

**Acceptance criteria:**
- Production network panel shows no 401s on `/tracks` as a guest.

---

#### P0.3 â€” Update Playwright to match production reality (tests become trustworthy)
**Goal:** Playwright smoke tests reflect real routes and can run locally/CI without manual server start.

**Root cause:**
- `e2e/basic.spec.ts` assumes `/` is the landing page with title â€œFlowForgeâ€ and that a retired social route exists.
- `playwright.config.ts` has `webServer` commented out.

**Implementation (forever-fix):**
1. Update `e2e/basic.spec.ts`:
   - Test 1: `page.goto('/')` then assert final URL contains `/howitworks` (or assert the onboarding headline).
   - Test 2: replace the retired-route assertion with an actually supported public page (recommend: `/tracks`).
2. Enable `webServer` in `playwright.config.ts`:
   - Use `command: 'npm run dev'` for local, or `npm run start` for CI.
   - Ensure `reuseExistingServer: !process.env.CI`.
3. Document how to run Playwright (Windows-safe) in a short section (either in this file or in a dedicated testing doc):
   - `& "C:/Program Files/nodejs/npx.cmd" playwright test`

**Files to change:**
- `e2e/basic.spec.ts`
- `playwright.config.ts`
- (Optional doc) `DOCS/testing/TESTING_PLAN_V3.md` or a small new `DOCS/testing/PLAYWRIGHT.md`

**Tests/validation:**
- Run: `& "C:/Program Files/nodejs/npx.cmd" playwright test`
- Confirm it passes against a local dev server and matches production routing assumptions.

**Acceptance criteria:**
- Playwright run is green and asserts correct landing flow (`/` â†’ `/howitworks`) and at least one stable public route.

---

### P1 â€” High ROI Hardening (Auth Types + Security + Practice Engine Boundary)

#### P1.1 â€” NextAuth module augmentation (remove `@ts-expect-error` pile)
**Goal:** Remove the need for repeated `@ts-expect-error` in `lib/auth.ts` and ensure `session.user` is correctly typed across the app.

**Root cause:** NextAuthâ€™s default `Session` / `User` types donâ€™t include custom Prisma fields (`role`, `subscriptionStatus`, `username`, etc.).

**Implementation (forever-fix):**
1. Add NextAuth type augmentation:
   - Create `types/next-auth.d.ts` (or `types/next-auth.d.ts` if already exists) with:
     - `Session['user']` extended fields: `id`, `role`, `subscriptionStatus`, `username`, `bio`, `socials`, `currentStreak`, `xp`, `level`.
     - `User` extended fields as appropriate.
2. Update `lib/auth.ts` session callback to stop using `@ts-expect-error` and assign fields in a typed way.
3. If Prisma adapter user type is still not aligned, define a narrow internal type for `user` in callbacks (typed pick).

**Files to change:**
- `lib/auth.ts`
- `types/next-auth.d.ts`
- `tsconfig.json` (only if needed to include `types/**/*.d.ts`)

**Tests/validation:**
- `& "C:/Program Files/nodejs/npx.cmd" tsc --noEmit` passes with fewer/no suppressions.
- Grep: reduced `@ts-expect-error` count in production code.

---

#### P1.2 â€” Remove hardcoded superadmin emails (auth/roles robustness)
**Goal:** Role enforcement is based on DB state (or explicit env allowlist), not hard-coded email literals.

**Root cause:** `lib/auth.ts` has hard-coded email strings for SUPERADMIN override and username assignment.

**Implementation (forever-fix):**
1. Replace hard-coded lists with one of:
   - Preferred: DB roles (`user.role === 'SUPERADMIN'`) only.
   - Transitional: `SUPERADMIN_EMAILS` env var (comma-separated), used only for bootstrap and documented.
2. Move â€œAdmin1/Admin2 username enforcementâ€ into an admin-only tooling path (one-time script), not on every sign-in.
3. Add a one-time backfill/migration step (manual procedure) to set `role` for the intended accounts.

**Files to change:**
- `lib/auth.ts`
- (Optional) `scripts/backfill-superadmins.ts` (one-time)
- Docs: deployment/env templates if introducing `SUPERADMIN_EMAILS`

**Tests/validation:**
- Manual: sign in as known superadmin â†’ role remains SUPERADMIN via DB.
- Automated: unit test for `isPro` checks should treat SUPERADMIN as pro (already pattern).

---

#### P1.3 â€” Security tightening (CSP + image host allowlist)
**Goal:** Reduce attack surface without breaking analytics, Stripe, or Sentry.

**Root causes:**
- CSP includes `'unsafe-inline'` and `'unsafe-eval'`.
- `images.remotePatterns` allows `**.supabase.co` broadly.

**Implementation (forever-fix):**
1. Migrate GA/GTM scripts in `app/layout.tsx` to `next/script` (satisfy `@next/next/next-script-for-ga`).
2. Attempt removal of `'unsafe-eval'` first; verify runtime.
3. Tighten `images.remotePatterns` to only the known Supabase project host(s) and known Google hosts:
   - Derive hostname from `NEXT_PUBLIC_SUPABASE_URL` in `next.config.js` and add that hostname specifically.
4. Add a â€œCSP regression smokeâ€ check to the MCP smoke harness: ensure no CSP violations on `/practice` and `/tracks`.

**Files to change:**
- `app/layout.tsx`
- `next.config.js`
- (Optional) `DOCS/guides/DEPLOYMENT.md` (to document required hosts)

**Tests/validation:**
- `npm run build` remains green.
- Live smoke: no CSP violations in console.

---

#### P1.4 â€” Practice engine boundary refactor (reduce circular refactor risk)
**Goal:** Lower regression risk by introducing a single explicit lifecycle/state boundary and splitting mega-components.

**Root cause:** High churn + large LOC in practice UI and engine; complex side-effects can regress easily.

**Implementation (forever-fix):**
1. Introduce a small explicit â€œpractice lifecycleâ€ state machine (can be plain TS, no new deps):
   - States: `idle` â†’ `loadingBeat` â†’ `primed` â†’ `countdown` â†’ `running` â†’ `paused` â†’ `stopped` â†’ `error`
   - Events: `SELECT_BEAT`, `LOAD_OK`, `LOAD_FAIL`, `START`, `PAUSE`, `RESUME`, `STOP`, `RESET`
2. Split `PracticeControls.tsx`:
   - UI-only components (dumb): buttons, sliders, timers, meters.
   - One orchestrator component that binds state machine + hooks + audio.
3. Add a single integration-style smoke test (Playwright recommended) that:
   - navigates to `/practice`, clicks Start, confirms audio element starts (or at least confirms state transitions and no console errors).

**Files to change (expected):**
- `components/organisms/practice/PracticeControls.tsx`
- `app/practice/PracticeClient.tsx`
- `hooks/player/usePracticeEngine.ts`
- Possibly new `hooks/player/usePracticeMachine.ts`

**Tests/validation:**
- Existing unit tests remain green.
- New Playwright test(s) cover the lifecycle boundary.

---

#### P1.5 â€” Type-safe AudioPlayer source node tracking (remove monkey-patching)
**Goal:** Remove `@ts-expect-error` and the implicit `audio._sourceNode` monkey-patch while keeping the â€œconnect HTMLAudioElement to AudioContextâ€ behavior.

**Root cause:** `lib/audio/player.ts` stores a non-standard property (`_sourceNode`) on `HTMLAudioElement` to prevent double-attaching `MediaElementAudioSourceNode`.

**Implementation (forever-fix):**
1. Add a local type augmentation (module/global) for `HTMLAudioElement`:
   - `interface HTMLAudioElement { _sourceNode?: MediaElementAudioSourceNode }`
2. Replace `@ts-expect-error` guards with typed property checks.
3. Ensure `destroy()` clears `_sourceNode` safely if needed.

**Files to change:**
- `lib/audio/player.ts`
- `types/*.d.ts` (new or existing, for the DOM augmentation)

**Tests/validation:**
- `npx tsc --noEmit` passes.
- Manual: `/practice` start/stop/navigation does not throw â€œcreateMediaElementSourceâ€ errors.

---

#### P1.6 â€” Vulnerability remediation sprint (npm audit highs)
**Goal:** Remove high severity vulnerabilities with controlled upgrades and regression testing.

**Implementation (forever-fix):**
1. Create a dedicated upgrade branch/sprint:
   - Upgrade Next (as recommended by audit), ESLint, Vitest.
2. Run full test suite + Playwright smoke.
3. Update docs and patch notes for the upgrade release.

**Acceptance criteria:**
- `npm audit --audit-level=high` returns 0 highs.

---

### P2 â€” Cleanup (Dead TODOs + Doc Drift)

#### P2.1 â€” Remove/replace dead upgrade prompts (â€œStripe V2â€)
**Goal:** No UI text/alerts refer to obsolete flows that confuse users.

**Implementation:**
- Find and remove unused components or stale copy; ensure premium CTAs point to the real Stripe checkout.

**Validation:**
- Manual: premium modal actions behave consistently with current Stripe implementation.

---

#### P2.2 â€” Documentation drift cleanup (feature matrix + testing plan + deployment docs)
**Goal:** Docs match production reality (routes, versions, commands, and current behavior).

**Targets (examples):**
- `DOCS/reference/FEATURE_MATRIX.md` header version and encoding/formatting cleanup.
- `DOCS/architecture/APP_OVERVIEW.md` remove/adjust claims about the retired social route if itâ€™s not live.
- `DOCS/testing/TESTING_PLAN_V3.md` update version display expectation + route expectations.
- `DOCS/guides/DEVELOPER_SETUP.md` align Windows-safe commands.

**Acceptance criteria:**
- No docs claim the retired social route exists if production returns 404.
- Current version references align to `v0.9.993`.

---

#### P2.3 â€” Warning cleanup (lint + build)
**Goal:** Reduce â€œwarning fatigueâ€ so CI signal stays meaningful.

**Targets:**
- Resolve `@next/next/next-script-for-ga` by completing the `next/script` migration (covered in P1.3).
- Normalize line endings to LF for files that trigger `prettier/prettier` CRLF warnings.
- Investigate and either fix or explicitly document any recurring build warnings (e.g., Sentry/otel â€œrequire functionâ€¦â€ warning).

**Acceptance criteria:**
- `npm run lint` output is clean or limited to acknowledged, documented warnings.
- `npm run build` output is clean or warnings are explicitly tracked with rationale.
