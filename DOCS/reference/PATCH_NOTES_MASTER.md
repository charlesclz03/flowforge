# PATCH NOTES MASTER FILE

## v1.1.8 - Pro-Grade Practice Refresh (2026-05-21)

**"Studio Circle"**

Refreshed the Practice/Header surface to a 2026 pro-grade baseline while preserving route flow, DOM anchors, audio behavior, and the existing FreeStyla brand direction.

### Fixes & Improvements

- **Practice Circle Geometry**: The live player now uses one square sizing variable for the orb shell, timer ring, cypher ring, visualizer clipping, and glow layers so the player remains a true circle on compact phones.
- **Small-iPhone Layout Recovery**: Added a stricter compact practice profile for iPhone SE-class heights, reducing only internal density so top controls, the player, and record control keep their anchors without overlapping.
- **Cypher Ring and Tinting**: Cypher mode now renders visible 2/3/4-player ring segments, preserves P1 purple, P2 orange, P3 gold, and P4 green, and applies the active player color to the ring, visualizer, and inner glow.
- **Practice Timer Weight**: Increased the word timer progress ring weight for clearer performance feedback while preserving red/blue siren override behavior.
- **Breathable AppHeader**: Small iPhone headers now have more vertical room and cleaner title/subtitle spacing while keeping the three-column header grid and existing controls.

### Visual Overhaul

- **2026 Pro-Grade Surface Polish**: Shared `Button`, `Surface`, `Card`, `IconFrame`, `StatusBadge`, `Modal`, `SegmentedControl`, and app ambient styling now use calmer dark-mode elevation, tactile inset highlights, and more consistent premium studio-tool depth.

### System Updates

- **UI Trend Research**: Added the 2026 FreeStyla UI trends fit matrix under `DOCS/research/` using current Figma, OpenAI, and design-trend sources.
- **Visual Guardrails**: Added Playwright coverage for small-iPhone Practice orb geometry, countdown/playing/paused screenshots, cypher 2/3/4-player ring segments, active-player tint propagation, and AppHeader touch safety across core surfaces.

---

## v1.1.7 - Polish + TTS Hotfix (2026-05-19)

**"Clearer Practice Surface"**

Released the product-quality patch with TTS runtime failure detection, cleaner Tool-facing copy, refreshed social preview assets, and verified public beat inventory boundaries.

### Fixes & Improvements

- **TTS Runtime Failure Detection**: Spoken prompts now listen for browser speech synthesis runtime errors after voices resolve across native and Easy Speech paths, mark voice prompts unavailable instead of silently staying ready, and log sanitized failure telemetry.
- **Tool Copy Polish**: Current marketing metadata, manifest copy, and landing FAQ language now describe FreeStyla as a freestyle rap tool while preserving technical identifiers and future feedback-layer roadmap language.

### Visual Overhaul

- **Modern Preview Assets**: Refreshed the static Open Graph image and Play Store feature graphic with a cleaner FreeStyla practice-tool visual system, updated the dynamic OG route default to match, and added a mobile-oriented manifest screenshot.

### System Updates

- **Beat Inventory Check**: Confirmed the public beat definition is `uploaderId: null`; the current local API/DB returns 41 public beats, with 46 total beats when 5 private uploads are included, and added API/DB regression coverage for that boundary.

---

## v1.1.6 - Practice Reliability (2026-05-18)

**"Reliable Practice Loop"**

Finished the practice reliability release with stronger multilingual prompt quality checks, clearer TTS fallback states, normalized recording lifecycle copy, and validated upload adapter fallbacks.

### Fixes & Improvements

- **Multilingual Prompt Quality**: Added deterministic EN/FR/PT queue checks for 2-bar and 4-bar sessions so fallback prompts stay unique and anti-rhyme ordered inside the session budget.
- **TTS Fallback Clarity**: Skill Check and Practice now share explicit copy for text-only, loading, unsupported, and fallback voice states while preserving the existing Easy Speech/native adapter contract.
- **Recording Lifecycle Clarity**: Recordings and Review now use shared audio-ready, audio-processing, and stats-only practice copy so metadata-only sessions remain clearly separate from audio recordings.

### System Updates

- **Adapter Validation**: Expanded Uppy/Tus and signed PUT tests to cover resumable success, resumable fallback, ticket failures, storage failures, and runtime waveform/TTS fallback behavior.
- **Reliability Telemetry Coverage**: Added sanitized assertions for prompt queue fallback, metadata-only recording fallback, and private beat upload failure events without exposing signed URLs or raw paths.
- **Authenticated Smoke Coverage**: Added Playwright coverage for authenticated Skill Check language/cadence/recording setup and practice pause/resume flow.
- **Governance Sync**: Updated package metadata, settings display, canonical docs, feature matrix, testing plan, and patch notes to v1.1.6.

---

## v1.1.5 - Enterprise UI Remediation (2026-05-18)

**"Accessible Studio"**

Completed the full enterprise UI remediation across accessibility foundations, mobile touch recovery, route-level polish, admin/legal/offline surfaces, and safe mocked regression coverage.

### Visual Overhaul

- **Contrast-Safe Actions**: Primary action tokens now pair FreeStyla purple with a dark foreground so CTAs meet WCAG AA for normal text while preserving the brand color.
- **Mobile Navigation Labels**: The bottom dock now shows compact visible labels and keeps app-shell settings controls at touch-safe sizes.
- **Beat Vault Touch Recovery**: Beat cards and beat selection controls expose touch-visible actions instead of relying on hover-only discovery.
- **Dialog and Motion Completion**: Pause, rate, support, session summary, and studio FX surfaces now avoid empty dialog labels, use shared dialog behavior where appropriate, and flatten decorative motion under reduced-motion preferences.
- **Route-Level Polish**: Public funnel CTAs, offline retry, legal reading surfaces, Premium prompts, and admin dashboards now use calmer contrast-safe actions, semantic links, and touch-safe layouts.
- **Admin Mobile Recovery**: Admin beat/user/feedback surfaces now include clearer loading/empty/error states, touch-safe action controls, and mobile fallback card layouts for safe inspection.

### Fixes & Improvements

- **Accessible Modal Foundation**: Shared dialogs now expose modal semantics, labelled titles, Escape handling, focus trapping, and focus restoration.
- **Upload and Calibration Polish**: Private beat upload, cue-point calibration, and latency controls now have clearer labels, focus states, and ARIA state where needed.
- **Motion Preference Support**: Practice and patch-note motion paths now respect reduced-motion preferences for decorative animation.
- **Post-Session Accessibility**: Studio FX sliders, playback buttons, and reverb controls now expose explicit labels and pressed state.
- **Stats-Only Review Guardrails**: Regression coverage now confirms stats-only recordings do not expose audio-only review actions while audio recordings remain reviewable.
- **Legal and Offline Trust Surfaces**: Legal cards are semantic links, long-form legal documents use constrained document-like spacing, and offline retry uses the shared button system.

### System Updates

- **Canonical UI Audit**: Added the 2026-05-18 enterprise UI audit and four-phase remediation roadmap under `DOCS/audits/`.
- **Regression Coverage**: Added UI regression checks for modal semantics, mobile nav labels, Beat Vault actions, upload accessibility, reduced motion, and feedback success states.
- **Safe Auth Fixtures**: Added a reusable Playwright NextAuth bootstrap helper for guest/free/pro/superadmin state coverage with test-user cleanup.
- **Expanded Enterprise Coverage**: Added desktop/mobile regression checks for public funnel overflow, admin guest redirects, mocked admin feedback, recordings/review states, offline/legal surfaces, and latency keyboard reachability.
- **Governance Sync**: Updated the enterprise UI audit, feature matrix, roadmap, testing plan, settings display, package metadata, and canonical patch notes to v1.1.5.

---

## v1.1.4 - Enterprise UX Recovery (2026-05-17)

**"Audit Fix Plan"**

Documented the enterprise UX audit and closed the first remediation wave across review deep links, E2E expectations, accessibility, mobile controls, install copy, and lifecycle states.

### Fixes & Improvements

- **Review Deep Links**: `/review/[id]` now gives guests a private-review sign-in path with callback preservation instead of a blank loading state.
- **Accessibility Recovery**: Feedback ratings, feedback text entry, modal close buttons, settings switches, recording controls, and lifecycle states now expose clearer labels or live status messaging.
- **Beat Vault Polish**: Loading copy, genre chips, locked-track prompts, action targets, fallback catalog messaging, and Pro-lock analytics were tightened for mobile and regression stability.
- **Install and Conversion Clarity**: `/download`, pricing, login, signup, and legacy `/selectdifficulty` routing now better match current PWA/TWA and auth expectations.

### System Updates

- **Enterprise UX Audit Artifacts**: Added dated audit and fix-plan reports under `audit_reports/` without modifying the whole-app audit master template.
- **Regression Coverage**: Updated Playwright coverage for current auth redirects, Beat Vault locators, review deep links, feedback accessibility, and patch-note console stability.

---

## v1.1.3 - Adapter Reliability (2026-05-17)

**"Research Spike Adapters"**

Added guarded adapter boundaries for TTS, review waveforms, and private beat uploads so researched libraries can improve reliability while preserving the existing fallback paths.

### Fixes & Improvements

- **TTS Reliability Adapter**: Routed spoken prompt readiness, warmup, cancel, and fallback behavior through a small Easy Speech-aware adapter while preserving native speechSynthesis behavior and iOS text-only prompts.
- **Review Waveform Guard**: Added a review-only wavesurfer.js wrapper with init/decode fallback to the existing waveform scrubber, keeping seek-to-pause behavior and beat sync intact.
- **Private Beat Upload Resilience**: Moved Pro private beat uploads behind a signed PUT-first adapter with opt-in Uppy/Tus support and progress feedback, leaving recording uploads unchanged.

### System Updates

- **Adapter Coverage**: Added focused Vitest coverage for TTS engine fallback, beat upload fallback/progress, and review waveform fallback rendering.
- **Deployment Versioning**: Bumped app metadata, canonical docs, and the settings display to `v1.1.3` for the adapter reliability release.

---

## v1.1.2 - Enterprise Polish (2026-05-17)

**"SSS Enterprise UI Polish"**

Upgraded FlowForge from energetic neon/glass toward cleaner futuristic enterprise polish while preserving the FreeStyla identity and the existing audio/session behavior.

### Visual Overhaul

- **Enterprise UI Primitives**: Added shared surface, toolbar, segmented-control, icon-button, feature-tile, and status-badge primitives so high-traffic routes can reuse consistent enterprise-grade states and spacing.
- **Design Token Cleanup**: Centralized missing token aliases, semantic accent roles, scrollbar helpers, shell safe-area variables, and calmer surface/glow shadows in the Tailwind/global CSS layer.
- **Skill Check Upgrade**: Reworked `/difficultyselection` into a setup console with segmented difficulty/cadence cards, first-class language and recording controls, a compact session summary, and a specific `Start Practice` CTA.
- **Practice Stage Polish**: Tightened the practice orb layout with stable rails, clamp-based sizing, reduced competing ambient glow, and preserved the current audio engine, session guard, TTS fallback, and recording retry behavior.
- **Workflow Surface Polish**: Cleaned the Beat Vault toolbar, recordings refresh/stats framing, review studio metadata and unsaved-settings state, plus `/howitworks`, `/pricing`, and `/download` product-proof panels.

### System Updates

- **UI Smoke Coverage**: Added Playwright shell/overflow smoke checks for desktop and mobile coverage across public funnel, Beat Vault, and Skill Check setup controls.
- **GitHub Spike Discipline**: Kept wavesurfer.js, Uppy, Bubblewrap, and Easy Speech as documented narrow spikes instead of broad runtime dependency adoption during the polish release.

---

## v1.1.1 - Audit Handoff (2026-05-17)

**"Patch Note Governance"**

Promoted the patch-note audit cleanup into the release baseline, clarified historical claims, and closed the Pricing header regression before the v1.1.1 deploy handoff.

### System Updates

- **Release Source Sync**: Kept `lib/data/patch-notes.ts` and `DOCS/reference/PATCH_NOTES_MASTER.md` aligned under the new patch-note sync check.
- **Deployment Versioning**: Bumped app, lockfile, settings display, and canonical documentation headers to `v1.1.1` for the release handoff.
- **Audit Follow-up Prompt**: Added a guarded next-session prompt for the 18 patch-note audit items classified as `Not done`, requiring the source audit list before any implementation plan is written.
- **Historical Claim Caveats**: Clarified the remaining `Not done` patch-note groups as historical or superseded: `/` now intentionally redirects to `/howitworks`, social feed/follow/vote/notification claims are not current live product scope, duel/ranked behavior remains non-live, and cypher room creation remains a mock shell rather than a data-backed multiplayer backend.
- **Pricing Header Recovery**: Restored the `/pricing` header back control and right-side header actions so the public pricing page matches the shared app chrome expectations before deployment.

---

## v1.1.0 - Visual Closure (2026-05-15)

**"Audit Visual Closure"**

Closed the remaining v1.0.9 visual audit follow-up with a shared icon treatment, measured landing-card readability validation, and a cleaner Practice START halo.

### Visual Overhaul

- **Icon Standard**: Added a shared `IconFrame` treatment and migrated high-traffic header, onboarding, download, Beat Vault, recordings, settings, and profile surfaces toward consistent Lucide sizing, frames, tones, and stroke defaults.
- **Practice START Halo**: Moved the decorative START-button glow outside the clipped visualizer circle and softened the text-only shadow so the call-to-action reads more balanced on mobile and desktop.

### Fixes & Improvements

- **Landing Readability Evidence**: Re-verified `/howitworks` feature-card typography on mobile and kept the current 18px headings, 14px body copy, 20px body line-height, and no-overflow baseline intact.

### System Updates

- **Patch Note Governance**: Re-synchronized the app patch-note data with the canonical master notes, clarified historical supersessions, and added a docs check to prevent future release-note drift.

---

## v1.0.9 - Funnel Polish (2026-05-15)

**"Audit Funnel Polish"**

Resolved the highest-impact audit polish buckets across auth, pricing, install messaging, premium gating, mobile layout, and accessibility clarity.

### New Features

- **Pricing Page**: Added `/pricing` with the existing Free/Pro plan logic and direct Stripe upgrade actions for signed-in users.
- **Google Auth Entry Pages**: Added `/login` and `/signup` as lightweight Google sign-in routes with callback preservation and a guest practice fallback.

### Fixes & Improvements

- **Protected Route Redirects**: Guests opening guarded pages now land on `/login?callbackUrl=...` instead of being silently routed through onboarding.
- **Premium Upgrade Path**: Locked premium beat and recording prompts now show guest sign-in/pricing actions and authenticated Stripe checkout actions.
- **Download Accuracy**: `/download` now describes Google Play for Android, Safari home-screen install for iOS, and browser launch for desktop without implying missing binaries.
- **Onboarding Progress Layout**: Onboarding progress dots now sit in the page flow so they no longer cover mobile copy or CTAs.
- **Beat Vault Polish**: Locked My Tracks/New Beat controls, loading states, practice chips, achievement text, slider labels, recording toggle, focus states, and low-contrast text tokens were tightened for readability.
- **Header Tier CTA**: Added a compact tier-aware header action so Free/guest users see `Get Pro` and Pro/SUPERADMIN users see their current tier state.
- **PWA Install Metadata**: Added missing mobile web app capability meta tags for install-friendly surfaces.

---

## v1.0.8 - Unique Flow (2026-05-15)

**"Prompt Engine Forever Fix"**

Locked practice sessions to unique prompt queues, added required first-time profile completion after Google sign-in, and switched iPhone/iPad practice to text-only prompts so the beat no longer ducks under TTS.

### Fixes & Improvements

- **Unique Session Queues**: Practice now builds a full no-repeat prompt queue at session start, keeps anti-rhyme as an ordering rule, and stops recycling used words mid-session.
- **Word-Family Rotation**: Prompt queues now avoid reusing the same rhyme family (for example `station` / `nation` / `creation`) until the other available families have had a turn.
- **Multilingual Prompt Coverage**: Expanded French and Portuguese fallback/seed dictionaries to 110 unique words each (`36/36/38` across difficulty tiers), and added exclusion-aware word top-ups for queue building.
- **2-Bar Frequency**: Skill Check and Practice now support 2-bar prompt timing alongside 4, 8, and 16 bars, including save/API validation paths.
- **TTS Prompt Sync**: Spoken prompts now fire as soon as the displayed PLAYING prompt is active, while pause/stop/word-change cleanup cancels stale speech to prevent delayed or doubled calls.
- **iOS Beat Protection**: Spoken prompts are now intentionally disabled on iPhone and iPad during practice so Safari speech playback cannot duck the instrumental volume.
- **Practice Track Looping**: Live practice beat playback now uses the Web Audio gapless looper, preserving calibrated cue points when a track reaches its end and continuing until the session is stopped or times out.
- **Retryable Metadata Saves**: Empty recording fallbacks now keep the same retryable save payload as audio and stats-only completions, so transient save failures can be retried from the in-session error banner.
- **Language-First Onboarding**: `/howitworks` now tells users up front that prompts can run in English, French, or Portuguese, and explains the iPhone/iPad text-only prompt behavior.

### System Updates

- **Required Google Profile Setup**: First-time Google sign-ins now land on `/auth/continue`, then complete `/complete-profile` before entering guarded app routes.
- **Username Validation Flow**: Added live username availability checks, duplicate handling, and a server-side rule that locks username edits after required setup is completed.
- **Prompt + Audio Regression Coverage**: Added Vitest coverage for session queues, word-family rotation, 2-bar session saves, TTS prompt timing, calibrated loop-start math, guarded route helpers, username/profile-completion routes, and iPad-class device detection.

---

## v1.0.7 - Residual Fix (2026-03-06)

**"Residual Cleanup"**

Cleared the last lint debt, replaced the remaining browser-native dialogs with in-app UI, and added conversion instrumentation to the public entry and checkout flow.

### Fixes & Improvements

- **Dialog Consistency**: Replaced the remaining `confirm()` and `alert()` calls in Download, Review, Profile Security, Admin Beats, and Beat Dropdown flows with in-app modals and toast feedback.
- **Lint Closure**: Removed the remaining Prettier/formatting drift so `next lint` is now fully clean again.
- **SEO Accuracy**: Updated JSON-LD metadata to the current `www.freestyla.app` domain and EUR pricing context.

### System Updates

- **Conversion Analytics**: Added client-side tracking for `/howitworks` views and CTA clicks, download page entry/CTA actions, checkout CTA launches, and order-confirmation activation events.
- **Analytics Test Coverage**: Added a unit test for the shared analytics helper to lock in `gtag` vs `dataLayer` behavior.

---

## v1.0.6 - Integrity Fix (2026-03-06)

**"Integrity & Funnel Fix"**

Cleared the remaining audit exposure, unified session-save logic, repaired the public landing funnel, and removed the most visible accessibility and UX regressions.

### System Updates

- **Audit Truth Restored**: Updated dependency overrides so `npm audit` now resolves to 0 vulnerabilities instead of shipping a partially fixed audit state.
- **Session Save Unification**: Moved recordings and metadata-only session completion onto a shared `saveSessionWithProgress` helper so XP, streaks, achievements, and session meta all follow one code path.
- **Build Discipline**: Re-enabled React Strict Mode and marked `/api/beats` as request-driven instead of pretending it can be statically rendered while reading query params.

### Fixes & Improvements

- **API Error Sanitization**: `/api/recordings`, `/api/session/complete`, and Stripe checkout now return safe client errors instead of leaking raw backend/provider details.
- **Pricing & Checkout Accuracy**: Homepage pricing now reflects the live Stripe plans, and upgrade/billing actions use in-app toasts instead of browser alerts.
- **Accessibility Baseline**: Restored browser zoom and text selection by removing the global no-zoom/no-select defaults.

### Visual Overhaul

- **Real Homepage Funnel (historical/superseded)**: This v1.0.6 entry described a temporary landing-page direction. Current product behavior intentionally routes `/` to `/howitworks`, while pricing and plan details live on `/pricing`.
- **Public Route Focus**: Hidden the bottom dock on `/` and `/howitworks` so onboarding pages feel like a guided funnel instead of the authenticated app shell.
- **Modal UX Cleanup**: Replaced the core Practice beat-switch confirm and Tracks delete confirm with native in-app modals, and cleaned stale copy across onboarding/pricing surfaces.

---

## v1.0.5 - Audit Fix (2026-03-05)

**"Whole App Audit Forever Fix"**

Resolved NPM audit security vulnerabilities, re-architectured the monolithic Practice UI state machine, and added lazy-loading to the Latency Settings page to drastically reduce bundle size.

### System Updates

- **NPM Audit Patch**: Overrode unmaintained Webpack tools and migrated to `@ducanh2912/next-pwa` to clear 25 high-severity vulnerabilities.
- **Settings Lazy-Loading**: Split the 500+ LOC Latency calibration studio out of the main bundle, lazy-loading the `AudioContext` only when needed.

### Fixes & Improvements

- **Practice Controls UI Detanglement**: `PracticeControls.tsx` now uses extracted molecules (`PracticeTopControls`, `PracticePauseModal`, `PracticeErrorBanner`) plus a dynamic `AudioVisualizer` boundary while still owning the main player, timer ring, and visualizer composition.

---

## v1.0.4 - Pipeline Hardening (2026-03-05)

**"Pipeline Hardening"**

Hardened the recording pipeline with retry-save, fixed TTS silence on session start, repaired BottomNav clipping on mobile, and improved post-session navigation logic.

### Fixes & Improvements

- **Retry Save**: Failed session saves now show a "Retry Save" button so users can recover without losing their session data.
- **TTS Silence Fix**: Resolved a race condition where TTS was silent on first session start due to rapid cancel→speak sequences between warmup and the first word announcement.
- **TTS Fallback Warning**: Practice screen now warns users when their browser lacks the native voice pack for the selected language.
- **BottomNav Visibility**: Fixed BottomNav being clipped on some devices by switching from `h-[100dvh]` to a rigid `fixed inset-0` app shell, and replaced conflicting CSS padding with explicit safe-area-aware inline styles.
- **Smart Post-Session Redirect**: Sessions without audio recording now redirect to Difficulty Selection instead of Recordings, keeping the practice loop tight.
- **Recording Card UX**: Processing state now shows a spinner with refresh button; stats-only sessions display a clear "Stats-Only (No Mic)" badge.

---

## v1.0.3 - Authentication Type Extensions (2026-03-05)

**"Authentication Type Extensions"**

Passed `tsc` statically by applying definitive Module Augmentations to NextAuth configurations.

### System Updates

- **Type Safety**: Passed `tsc` statically by applying definitive Module Augmentations to NextAuth configurations.

---

## v1.0.2 - Practice Full Height Fix (2026-02-12)

**"Practice Full Height Fix"**

Fixed an app transition wrapper height issue that prevented the Practice screen from filling the available space on some devices, leaving a black gap above the BottomNav.

### Fixes & Improvements

- **Practice Layout**: `/practice` now correctly fills `main-content` height during route transitions, keeping the player + REC aligned and eliminating the large empty black zone above BottomNav on mobile.
- **BottomNav Surface Continuity**: `/practice` now applies a route-aware backdrop behind the shared BottomNav shell, removing the visible seam/black line while keeping tab interactions unchanged.
- **Subpixel Seam Guard**: Added a practice-only 1px BottomNav overlap to neutralize viewport fractional-pixel boundaries that could still show a thin horizontal seam after hard refresh.
- **User Beat Calibration Runtime**: Practice playback now honors uploaded beat cue offsets (including replay/restart), so sessions begin at the calibrated queue point instead of 0s.
- **Long-Track Cue Save**: `/api/user/beats` now accepts full-track upload cue offsets (up to 1 hour), so calibration points beyond 30s save correctly.
- **Phonetic Anti-Rhyme Engine**: Practice word generation now blocks back-to-back rhyming prompts using phonetic rhyme keys (fixes cases like `Sky` -> `Tie`), and only allows rhyme fallback when every candidate rhymes.
- **Language-Aware Anti-Rhyme**: Runtime prompt generation now applies phonetic anti-rhyme with the active language profile (EN/FR/PT) instead of defaulting to English rules.
- **Language Handoff Integrity**: Practice now syncs to the server-resolved session language and supports alias inputs (`en`, `fr`, `pt`) for consistent dictionary/TTS selection.
- **Difficulty Metadata Integrity**: Practice now preserves server-provided word difficulty metadata instead of recomputing tiers from client-only syllable heuristics, keeping FR/PT prompt tiers aligned with source dictionaries.
- **Anti-Repeat Priority Restore**: Prompt generation now prioritizes unused words (including constrained rhyme pools) before recycling used words, preventing early repeats before pool exhaustion.
- **Word Pool De-duplication**: Random word fetch now removes case-variant duplicates before selection to reduce repeat collisions from legacy entries.
- **TTS Fallback Language Contract**: Practice now resolves `SpeechSynthesisUtterance.lang` against the active fallback voice language to prevent silent prompts when selected locale and fallback voice family differ.
- **TTS Zero-Voices Safety**: TTS now exits prolonged voice-loading states and falls back to a safe default utterance locale when browser voice catalogs never populate, preventing silent FR/PT fallback sessions.
- **Unified Voice Diagnostics**: Admin `Test Voice` now uses the same language/voice resolution contract as runtime Practice prompts for consistent diagnostics.
- **TTS Gesture Warmup**: Session start now primes TTS with a silent user-gesture utterance so first spoken prompts are more reliable on browsers that gate speech queue activation.
- **TTS Setup Diagnostics**: Skill Check now shows fallback/unsupported TTS diagnostics in setup so users can identify missing local language voice packs.
- **Skill Check Language Picker**: `/difficultyselection` now uses a compact flag-only language dropdown on the Advanced Settings row and removes the language help pill + voice readiness status line.
- **Cross-Platform Flag Rendering**: Skill Check language controls now render real SVG flag assets (US/FR/PT) so Windows and non-emoji environments no longer fall back to letter labels like `US`/`FR`/`PT`.
- **TTS Config Cleanup**: Removed unused `voiceGuidance` metadata from `lib/tts/languages.ts` to keep the language model focused on active runtime fields.
- **Recordings Processing State**: Recent audio sessions now show `PROCESSING` while signed playback URLs are not ready yet, instead of being mislabeled as stats-only.
- **Stats-Only Playback Guard**: Sessions created with `Capture the Audio` disabled remain metadata-only and no longer expose play/share/download/video actions in Recordings.
- **Review Settings Save**: `/review/[id]` now shows a `Save Changes` action only when studio settings were edited, and persists those changes back to the recording.
- **Studio FX Compatibility**: Review/shared players now correctly interpret legacy `fxConfig.reverb` values as Studio Mode so saved playback tone is consistent across pages.
- **Review FX State Sync**: SessionPlayer now rehydrates saved mix/alignment values when a recording/settings payload changes, preventing stale settings carry-over between review loads.
- **Studio Preview Parity**: Review playback now applies matching studio compression with reverb (`Reverb + Comp`) so live monitoring is closer to exported studio mix behavior.
- **Calibration Profiles**: Audio calibration now supports separate saved offsets for Phone Speaker, Wired, and Bluetooth outputs, with one active profile mirrored globally for compatibility.
- **Calibration Controls**: Advanced Settings now include quick `-10/+10ms` nudge controls, a manual slider, and a `Reset` action to instantly return the active profile to `0ms`.
- **Calibration Save UX**: `Save Changes` appears only when calibration edits are pending, with explicit save/discard feedback and persisted profile-aware values.
- **Sync Test Tooling**: Added one-shot and looped sync pulse testers in calibration settings so users can validate audio/visual timing before entering Practice.
- **Legacy Route Cleanup**: `/calibration` is now redirected to `/settings/latency` to enforce a single maintained calibration flow and prevent duplicate logic drift.
- **Auth Callback Loop Fix**: Replaced middleware token-gating with server-side route guards for `/settings`, `/recordings`, and `/profile`, eliminating redirect loops caused by DB-session auth (e.g. `/?callbackUrl=/settings/latency`).
- **Callback Flow Hardening**: Home callback handling now validates safe internal callback paths server-side, preserves callback intent for unauthenticated users via `/howitworks`, and removes client loader redirect loops.
- **Auth Callback Regression Tests**: Added Playwright coverage for `/?callbackUrl=/settings/latency` and direct guest access to `/settings/latency` to prevent callback-loop regressions.
- **Tracks -> Difficulty Handoff**: `/difficultyselection?beatId=` now resolves against both public beats and user-uploaded beats, fixing private-track preselect from the `/tracks` arrow action.
- **Regression Coverage**: Added a Playwright E2E test for private-track arrow handoff and calibrated playback start offset to prevent this flow from regressing.
- **Security Hardening**: `/api/debug/seed` is now SUPERADMIN-only (unauthorized and forbidden access are blocked server-side).
- **Avatar Upload Safety**: Profile avatar upload now enforces strict image validation (size cap + MIME allowlist + magic-byte verification), stores randomized filenames, and serves avatars with `nosniff` safe headers via proxy.
- **Support Form Safety**: `/api/support` now sanitizes HTML input and enforces subject/message length limits before sending email payloads.
- **Input Validation**: `/api/user/beats` and `/api/feedback` now validate payloads strictly (including BPM/rating constraints) and return clean 400 responses for invalid input.
- **Admin Beat Management Guardrails**: `/admin/beats` server actions now enforce public-library mutation scope (`uploaderId: null`) for update/delete/reorder paths, preventing out-of-scope private-beat mutations.
- **Admin Beat Payload Validation**: Beat updates now use strict field-whitelist validation (title/artist/label/genre/bpm/isPremium only) and reject unknown fields to prevent mass-assignment drift.
- **Admin Beat Regression Tests**: Added `__tests__/admin/admin-beats-actions.test.ts` to cover auth boundary, public-scope mutation guards, payload validation, and reorder normalization.
- **PWA Install Reliability**: Large static media folders are excluded from install-time precache; beats are now lazy-cached at first preview/play via runtime audio caching.
- **Auth Efficiency**: Server auth helper now resolves user IDs without duplicate `getServerSession()` calls on hot API paths.
- **Testing Tooling**: Restored coverage support by adding `@vitest/coverage-v8` so `npm run test:coverage` works again.
- **Dependency Security**: Pinned `qs@6.14.2` via overrides to resolve the audit advisory reported through Stripe dependency tree.
- **Dependency Security (Wave 2)**: Added a `minimatch@10.2.2` override and upgraded `@typescript-eslint` parser/plugin to reduce `npm audit` exposure from 35 (31 high / 4 moderate) to 15 moderate-only findings.
- **Build Noise Hardening**: Prisma build-phase initialization now suppresses expected datasource bootstrap error spam while preserving beat fallback behavior.
- **Lint Debt Cleanup**: Normalized formatting and line-ending drift across practice, recordings, and API modules to restore clean lint gates.
- **Audit Tooling Stability**: `scripts/audit-feature.ts` now uses CommonJS runtime imports and ISO date output, removing module-type warnings and locale-dependent report dates.
- **Docs Consolidation**: Reorganized `DOCS/` into a canonical-first structure, archived legacy documentation with stubs, and normalized archive metadata for historical references.
- **Docs Governance**: Added machine-readable docs contract (`DOC_CANONICAL_MAP.json`) plus internal link/drift/stub validation scripts (`docs:check`) enforced in CI.
- **Workflow Hardening**: Updated load-context and deploy workflows to explicitly include canonical-doc validation in release readiness.

---

## v1.0.1 - Practice Overlay Fix (2026-02-12)

**"Practice Overlay Fix"**

Practice dropdown is now fully opaque and blocks click-through, premium crowns are visible again, and the Practice stage fills the screen correctly (no dead black zone).

### Fixes & Improvements

- **Beat Dropdown Overlay**: Practice beat menu now renders as a true overlay with an opaque surface and proper hit-blocking (no tapping buttons behind it).
- **Premium Visibility**: Premium beats show a clear gold crown badge in the dropdown.
- **Practice Layout**: Practice stage now flex-fills the available height so the player stays centered between AppHeader and BottomNav across device sizes.

---

## v1.0.0 - 1.0 (2026-02-11)

**"1.0"**

FreeStyla v1.0. Account deletion is now clearly documented, and users can delete recordings or uploaded beats without deleting their account.

### Fixes & Improvements

- **Account Deletion**: Privacy Policy now includes a clear account deletion section (Profile → Security → Delete Account) plus email-based deletion requests.
- **Partial Deletion**: Users can delete individual recordings and uploaded beats without deleting their account.
- **Profile Data Controls**: Profile > Security links directly to Recordings and Tracks for data management.

### System Updates

- **Android App Links**: Production TWA App Links configuration is in place for Google Play submission.

---

## v0.9.1011 - Data Controls (2026-02-11)

**"Data Controls"**

Privacy policy and profile UI now clarify how to delete recordings or uploaded beats without deleting the whole account.

### Fixes & Improvements

- **Account Deletion Clarity**: Privacy Policy now explains how to delete your account and how to request deletion by email.
- **Partial Deletion**: Users can delete individual recordings or uploaded beats without deleting their account.
- **Profile Data Controls**: Profile > Security links directly to Recordings and Tracks for data management.

---

## v0.9.1010 - Android Deployment Ready (2026-02-11)

**"Android Deployment Ready"**

Production-ready Android App Links configuration: updated assetlinks.json with the real SHA-256 certificate fingerprint from the production keystore.

### System Updates

- **Android App Links**: Updated `assetlinks.json` with production SHA-256 fingerprint to enable TWA Digital Asset Links verification.
- **Play Store Preparation**: Generated production keystore and Android App Bundle (AAB) for Google Play Console submission.

---

## v0.9.1009 - Sync & Speed (2026-02-11)

**"Sync & Speed"**

Audio trust + performance polish + fixed chrome: recordings now stay locked to the beat across playback and exports, the recordings list loads significantly faster, and Practice is now truly no-scroll on mobile with a cleaner review/share flow.

### Fixes & Improvements

- **Locked-In Recording Sync**: Playback, share links, downloads, and video exports now honor the session sync model (beat phase offset + latency nudge) so vocals stay aligned to the beat.
- **Faster `/recordings` Load**: `/api/recordings` now batches Supabase signed URL creation (removes per-recording N+1 calls) to dramatically reduce recordings page load time.
- **Seek Safety**: Beat-loop seeking is normalized to avoid negative-offset edge cases when applying offsets/nudge.
- **Scrub-to-Pause**: Scrubbing the waveform now pauses playback so edits (FX/mix/alignment) apply cleanly; resume only when you hit Play again.
- **Studio While Paused**: Studio Processing and Alignment nudge controls now update correctly whether the track is playing or paused.
- **Practice Layout**: Removed extra empty space (“black zone”) below the Practice player on mobile by removing fixed-height control wrappers and redundant bottom padding.
- **Practice Track Switcher**: The beat dropdown no longer gets clipped on mobile, so changing tracks during a session is visible and scrollable.
- **Fixed App Chrome**: AppHeader + BottomNav now stay visually fixed outside the scroll area (prevents “phantom scroll” on small WebViews).
- **Share Placement**: Share moved next to the recording title (top-right) on review and shared pages; removed the Shared Session mic CTA and the redundant bottom Share button.

---

## v0.9.1008 - Recordings Refresh (2026-02-10)

**"Recordings Refresh"**

Launch polish: recordings now always show your latest sessions (including stats-only runs), and the active-session cancel guard no longer leaks onto non-practice routes.

### Fixes & Improvements

- **Recordings Freshness**: `/recordings` now fetches `/api/recordings?includeMetadata=true` with `no-store` caching so your newest sessions appear immediately (even when no audio was captured).
- **Cancel Session Guard**: The global exit prompt is now "Cancel Session?" and session teardown clears guard state to prevent lingering modals outside Practice (e.g. `/recordings`).

---

## v0.9.1007 - Icon Polish (2026-02-10)

**"Icon Polish"**

PWA/TWA polish: regenerated icons at correct sizes and added maskable variants so Android launch surfaces render cleanly without the mismatched icon border.

### Fixes & Improvements

- **Borderless Launch Icon**: Rebuilt PWA icons (`16/32/192/512`) from the clean logo asset with a true `#000000` background to eliminate the visible "circle" mismatch on splash/launch.
- **Maskable Icons**: Added dedicated maskable icons (`icon-maskable-192x192.png`, `icon-maskable-512x512.png`) and referenced them in `manifest.json` for better Android adaptive/splash rendering.

---

## v0.9.1006 - Canonical WWW (2026-02-10)

**"Canonical WWW"**

Production hotfix: fixed ERR_TOO_MANY_REDIRECTS by aligning canonical origin routing to `www.freestyla.app` (critical for PWA/TWA manifest + asset links trust checks).

### System Updates

- **Redirect Loop Fix**: Canonical origin is now `www.freestyla.app`. `freestyla.app` and `flowforge-freestyle.vercel.app` redirect to `www` to prevent infinite redirects and OAuth/session split-brain.
- **Launch Audit Default**: `scripts/prod-launch-audit.mjs` now defaults to `https://www.freestyla.app` for production verification.

---

## v0.9.1005 - Canonical Domain (2026-02-10)

**"Canonical Domain"**

Historical Play Store TWA hardening: this release briefly enforced `freestyla.app` as the canonical origin before v0.9.1006 superseded it with `www.freestyla.app`.

### System Updates

- **Canonical Origin Redirect**: Historical note: `www.freestyla.app` and `flowforge-freestyle.vercel.app` redirected all non-API traffic to `freestyla.app`; v0.9.1006 superseded this with `www.freestyla.app` as the current canonical origin.
- **Launch Audit Default**: Historical note: `scripts/prod-launch-audit.mjs` temporarily defaulted to `https://freestyla.app`; current production verification defaults to `https://www.freestyla.app`.

---

## v0.9.1004 - Practice Continuity (2026-02-10)

**"Practice Continuity"**

Practice UX hardening: pause/resume now truly preserves the current prompt + timer ring, in-session control changes clearly show as pending, and Achievements progress fetch avoids sporadic production timeouts.

### Fixes & Improvements

- **True Pause/Resume**: Practice pause now preserves the current word and timer ring progress and resumes exactly where you left off.
- **Pending Session Controls**: Difficulty and frequency changes during a session now show a clear "Next: …" indicator and apply cleanly on prompt boundaries (keeps ring timing synchronized).
- **Achievements API Resilience**: `GET /api/user/achievements` now caps progress-count queries to prevent sporadic Vercel timeouts (504) on large accounts.

### System Updates

- **E2E Coverage**: Added Playwright regressions for pause/resume word continuity and pending control UX during active sessions.

---

## v0.9.1003 - Launch Audit Verified (2026-02-10)

**"Launch Audit Verified"**

Release QA hardening: validated the full launch matrix (Guest/Free/Pro/SUPERADMIN) and updated the production audit harness to tolerate legacy profile redirects.

### System Updates

- **Launch Matrix Audit**: Validated Guest + Free + Pro + SUPERADMIN UX against `www.freestyla.app` using `scripts/prod-launch-audit.mjs` with a real Chrome profile (CDP).
- **Audit Harness**: `/profile` checks now allow redirecting to `/u/[username]` for authenticated users.
- **Docs**: Updated Feature Matrix launch audit status to PASS (incl. SUPERADMIN beat publish smoke + cleanup).

---

## v0.9.1002 - Achievements Express Hotfix (2026-02-09)

**"Achievements Express Hotfix"**

Hotfix for Achievements Express: resolved a production 500 caused by an incorrect streak column reference in the optimized progress query.

### Fixes & Improvements

- **Achievements API Hotfix**: Fixed a production 500 in `/api/user/achievements` caused by an incorrect streak column reference in the optimized progress query.

---

## v0.9.1001 - Achievements Express (2026-02-09)

**"Achievements Express"**

Fixed remaining intermittent Achievements API timeouts in production by collapsing progress computation into a single query and removing blocking GET side-effects.

### Fixes & Improvements

- **Achievements API Hardening**: `/api/user/achievements` now computes progress in a single DB query and no longer performs blocking unlock side-effects, eliminating intermittent production timeouts (504).

---

## v0.9.1000 - Achievements Fastpath (2026-02-09)

**"Achievements Fastpath"**

Resolved production profile load failures caused by Achievements API timeouts. Achievements now load reliably for large accounts.

### Fixes & Improvements

- **Achievements API Timeout Fix**: `GET /api/user/achievements` now avoids Vercel function timeouts (504) by batching unlock writes and removing redundant query work.
- **Achievement Unlock Perf**: `AchievementSystem.checkAndUnlock` now batches user achievement inserts via `createMany` and avoids duplicate beat/genre scans.

---

## v0.9.999 - PWA Install Fix (2026-02-09)

**"PWA Install Fix"**

Fixed a service worker install failure where Workbox tried to precache a Next.js internal manifest that 404s in production, breaking PWA install/offline behavior.

### Fixes & Improvements

- **PWA Install Fix**: Excluded Next.js `app-build-manifest.json` from the service worker precache to prevent Workbox `bad-precaching-response` (404) install failures on production domains.

---

## v0.9.998 - Session Guard (2026-02-09)

**"Session Guard"**

We fixed a navigation-guard regression where stale active-session state could show "End Session?" outside Practice (including Recordings). Session cleanup and guard routing are now resilient.

### Fixes & Improvements

- **Practice Unmount Cleanup**: Practice engine teardown now explicitly clears global session-active state to prevent stale navigation locks.
- **Guard Scope Hardening**: Global `attemptNavigation` now enforces the exit prompt only on `/practice` routes and self-heals stale active flags elsewhere.
- **Bottom Nav False-Positive Fix**: Tapping the currently active tab no longer triggers guarded navigation paths or exit prompts.

---

## v0.9.997 - Silent Night Fix (2026-02-08)

**"Silent Night Fix 🌙"**

We resolved a critical issue where empty recordings were being saved in Practice Mode. We also optimized the experience for Free users by ensuring they only save session metadata without triggering upload errors.

### Fixes & Improvements

- **Empty Recording Fix**: Prevented "Practice Mode" sessions from uploading 0-byte audio files.
- **Free Tier Optimization**: Practice sessions for free users now automatically skip audio uploads, preventing 403 errors and saving metadata only.
- **Signed Upload Recovery**: `/api/upload/signed-url` now self-heals missing storage buckets and returns actionable errors instead of opaque failures.
- **Admin Auth Status Codes**: `/api/admin/beats/upload` now returns `401/403` correctly for unauthorized/forbidden access.
- **Achievement Freshness**: `/api/user/achievements` now refreshes unlocked achievements immediately after lazy unlock checks.
- **Random Difficulty Restore**: Difficulty `Random` now uses the full word pool instead of an empty filter, restoring prompt generation.
- **Prompt Ring Sync**: Practice now tracks and renders active frequency from the engine, with frequency changes applied safely on the next prompt boundary.
- **Word Prompt Failsafe**: Added a fallback prompt source so sessions never enter a no-word state that leaves the timer ring stuck at 100%.
- **Recording Save Authorization**: `/api/recordings` now uses the same Pro/SUPERADMIN gating logic as `/api/upload/signed-url`, preventing false `403 Forbidden` saves for privileged users.
- **Signed URL Bucket Recovery**: `/api/upload/signed-url` now treats Supabase `404` / `related resource does not exist` responses as missing-bucket signals, so self-healing bucket creation runs reliably.

---

## v0.9.996 - Studio Restoration (2026-02-08)

**"Button Fix 🔧"**

We restored the missing Pause and Restart buttons in Practice Mode. The controls are now robust and always visible during your sessions.

### Fixes & Improvements

- **Practice Controls**: Restored visibility of Pause and Restart buttons by removing unstable animation logic and fixing layout z-index issues.

---

## v0.9.995 - Optimization (2026-02-08)

**"Turbo Charge ⚡"**

We optimized the Achievements system to load instantly. By removing redundant database checks, we reduced server load by 60% and eliminated the "lag" when opening your profile.

### Fixes & Improvements

- **Performance**: Reduced database queries from 16 to 6 per page load.
- **Lag Fix**: Eliminated the "Double Fetch" pattern in the achievements API.

---

## v0.9.995 - Upload Shield (2026-02-08)

**"Upload Shield"**

This release locks in the new admin upload transport by retiring the legacy large-body endpoint and validating production behavior after deployment.

### Fixes & Improvements

- **Admin API Deprecation**: `POST /api/admin/beats` now returns `410 Gone` with migration instructions to the signed direct upload flow.
- **Upload Path Standardization**: Admin upload surfaces now consistently use `POST /api/upload/signed-url` + `POST /api/admin/beats/upload`.
- **Production Smoke Validation**: Verified key routes on production with no reproduced CSP/413/504 browser-console errors.
- **Production Log Validation**: Checked Vercel production logs and confirmed no new `413` or `504` entries after deploy.

### System Updates

- **Release Metadata**: Bumped app metadata to `v0.9.995 (Upload Shield)` across package version, project status, and in-app settings label.

---

## v0.9.994 - Self-Heal (2026-02-05)

**"Achievements Fix Ã°Å¸Ââ€ "**

Fixed a critical bug where users saw "0/0" achievements. We implemented a "Self-Healing" API that automatically repairs missing data, ensuring your trophies always load correctly.

### Fixes & Improvements

- **Achievements Repaired**: Implemented API self-healing to automatically seed missing achievements if the database returns an empty list.
- **Zero-State Fix**: Users will no longer see "0/0" stats due to hydration failures.
- **Practice Audio Guard**: Practice mode now confirms beat playback before switching to `PLAYING`, preventing silent-state sessions.
- **Playback Resume Guard**: Resume from pause now stays paused if audio playback cannot restart.
- **Session Timer Enforcement**: Practice sessions now auto-finish when the session timer reaches 10:00 for all users.
- **Recorder Mode Respect**: Practice now honors recording mode and no longer force-starts recorder flow when recording is disabled.
- **Copy Alignment**: Pricing and upgrade surfaces now consistently describe 10-minute sessions.
- **E2E Stability**: Playwright smoke suite now runs in a serialized mode to reduce local dev-server cold-start flakiness.
- **Guest End-State Guard**: Guest practice sessions now avoid auth-only save endpoints and reset cleanly without lingering in finishing states.
- **Timeout Verification**: Added local E2E coverage for auto-finish behavior and guest session completion without 401 save calls.
- **Release Gate Utility**: Added `npm run check:release-env` to validate required production environment variables before deployment.
- **Strict Env Validation**: `check:release-env` now validates formats, rejects placeholder values, and enforces live Stripe keys in production mode.
- **Local Env Health Check**: Added `npm run check:release-env:local` for local CI/dev verification without weakening production checks.
- **Vercel Env Gate**: Added `npm run check:release-env:vercel` to verify required production variable names directly in Vercel.
- **Auth Debug Control**: NextAuth debug now respects `NEXTAUTH_DEBUG`, eliminating noisy debug warnings during local automation runs.
- **Stripe Yearly Alias Support**: Runtime and env checks now accept legacy `STRIPE_PRICE_ID_ANNUAL` as a fallback for yearly checkout pricing.
- **Legacy Route Cleanup**: Active docs now reflect the retired social discovery route and current live product surface.
- **UI Encoding Cleanup**: Fixed mojibake artifacts on `/patch-notes` and `/orderconfirmed`.
- **Public Profile Stability**: Allowed `api.dicebear.com` avatars in Next image config and updated search links to prefer `/u/<username>` routes.
- **Google Avatar Backfill**: Google sign-ins now backfill missing profile pictures for legacy accounts while preserving custom uploaded avatars.
- **Session Avatar Sync**: Session callback now reads the latest `users.image` value from the database so profile/settings avatar rendering stays up to date.
- **Deferred Difficulty Apply**: Practice difficulty changes now lock until the current word cycle completes, then apply cleanly on the next prompt boundary.
- **Practice Engine Sync Guard**: Fixed an effect-cleanup regression that could stop playback on countdown/play transitions; Cypher rotation now starts on Player 1 correctly and timer ring stays aligned to active prompts.
- **Practice Session Payloads**: Session saves now include real `wordsUsed` data instead of an empty array fallback.
- **Review Flow Guard**: Recordings list now filters out stats-only sessions (no `storageUrl`) by default, preventing broken `/review` opens for non-audio runs.
- **Metadata Session UX**: Recordings and review surfaces now clearly label sessions saved without captured audio and hide playback-only actions for those entries.
- **Review Waveform Theme**: Session review waveform now follows app styling with purple played audio, dark grey unplayed audio, and red playhead marker.
- **Superadmin Profile Shortcut**: Restored a SUPERADMIN-only `Upload Public Beats` action in profile navigation, placed immediately after `Settings`, and wired directly to `/admin/beats/new`.
- **Admin Upload Metadata**: Replaced the `Difficulty` selector on `/admin/beats/new` with a freeform `Label` input while preserving the `Premium Only (Pro)` toggle.
- **CSP Image Allowlist**: Added `www.google.co.uk`, `www.google.com`, and `www.google.fr` to `img-src` so Google Ads audience pixels no longer trigger CSP image violations.
- **Recording Upload Flow**: Practice saves now upload audio via signed Supabase URLs and submit lightweight JSON metadata to `/api/recordings`, preventing large-body `413` failures.
- **Session Complete Resilience**: Added `maxDuration` and timeout guards around long-running gamification tasks in `/api/session/complete` to reduce gateway timeout (`504`) risk.
- **Admin Upload Transport**: `/admin/beats/new` now uses signed direct upload + `/api/admin/beats/upload` metadata save (including label/duration), eliminating `/api/admin/beats` large-body `413` failures.
- **Legacy Admin Upload Migration**: `/admin/upload` and `/admin/upload-beat` now use signed direct uploads and metadata registration, removing remaining large-body upload paths.
- **Recording Deletion Integrity**: Recording delete now supports both path-based and legacy URL-based storage references to avoid orphaned files after the new direct-upload flow.

---

## v0.9.993 - Type Safe (2026-02-03)

**"Reliability Pass Ã°Å¸â€ºÂ¡Ã¯Â¸Â"**

Hardened Stripe subscription activation to eliminate the Ã¢â‚¬Å“paid but not Pro yetÃ¢â‚¬Â race, improved webhook resilience, and aligned versioning/docs for v0.9.993.

### Fixes & Improvements

- **Stripe Activation**: `/orderconfirmed` now waits for Pro activation before celebrating.
- **Webhook Reliability**: Stripe webhooks are idempotent and wonÃ¢â‚¬â„¢t 500 on unknown customers/users.
- **Checkout Stability**: Reuses existing Stripe customers to avoid duplicates.
- **Subscription Status API**: Added `GET /api/subscription/status` for client polling.
- **Redirect URL Safety**: Standardized Stripe base URL resolution across routes.
- **Practice Stability**: Metadata-only session saves no longer crash or 500 when no recording is present.
- **Beat Vault UX**: Guests no longer trigger noisy 401s by calling `/api/user/beats`.
- **Audio Privacy**: Production no longer logs full storage URLs; debug is opt-in via `NEXT_PUBLIC_AUDIO_DEBUG` (non-prod).
- **Auth Roles**: Superadmin access is role-based with optional bootstrap via `SUPERADMIN_EMAILS` (no hardcoded emails).
- **Type Safety**: Added NextAuth type augmentation and removed `@ts-expect-error` suppressions in auth callbacks.
- **Security**: CSP tightened (removes `unsafe-eval` in production) and Supabase image host allowlist is narrowed.
- **Practice UX**: Direct visits to `/practice` auto-select a default beat instead of showing a stuck loader.
- **Audio Type Safety**: `_sourceNode` tracking is now typed (no HTMLAudioElement monkey-patch suppressions).
- **Premium UI**: Removed stale Ã¢â‚¬Å“Stripe V2Ã¢â‚¬Â placeholder copy; upgrade prompts reflect the live Stripe checkout flow.

### System Updates

- **Versioning**: Standardized Ã¢â‚¬Å“Type SafeÃ¢â‚¬Â to `v0.9.993` (avoids collision with `v0.9.93`).
- **Testing**: Vitest now runs only `__tests__` (excludes Playwright `e2e/`).
- **E2E**: Updated Playwright smoke tests and added a `/practice` startability smoke test (with `webServer`).
- **Docs Safety**: Redacted deployment/database credentials and expanded Stripe env templates.
- **Docs Alignment**: Updated Feature Matrix, App Overview, Testing Plans, and Developer Setup to match production reality.
- **Lint Hygiene**: Normalized line endings to eliminate Prettier warnings in `npm run lint`.
- **Dependencies**: Upgraded Next.js and eslint-config-next to clear `npm audit --audit-level=high` (Next 15 async request APIs included).

---

## v0.9.92 - Trophy Hunter (2026-02-02)

**"Achievements Fix Ã°Å¸Ââ€ "**

Resolved a critical issue where achievements were not seeding correctly. We validated the database and verified that all 47 trophies are now attainable.

### Fixes & Improvements

- **Seeding Fix**: Manually populated the achievements table to ensure consistent data.
- **DB Verification**: Confirmed database connectivity and validated the fix with debug tools.

---

## v0.9.992 - Profile Perfected (2026-02-02)

**"Profile Perfected Ã°Å¸â€“Â¼Ã¯Â¸Â"**

We polished the Profile experience by widening the layout for desktop and adding smart fallbacks for user avatars. We also enabled metadata-only saves for sessions without microphone input.

### Visual Overhaul

- **Profile Layout**: Widened the profile page container (lg Ã¢â€ â€™ xl) to fully utilize desktop screen real estate.
- **Avatar Safe Mode**: Added smart error handling to user avatars. If an image fails to load (e.g., expired Google URL), it now gracefully falls back to your initials.
- **Tab Styling**: Fixed dynamic Tailwind classes to ensure tabs look correct on all screen sizes.

### Fixes & Improvements

- **Silent Saves**: Added support for saving session metadata even if audio recording is disabled or fails (Metadata-Only Mode).
- **Build Hardening**: Verified build integrity for recent layout changes.

---

## v0.9.991 - Sonic Unbound (2026-02-02)

**"Sonic Unbound (Hotfix) Ã°Å¸â€â€œ"**

We fixed a critical CORS issue in the audio engine that was silencing tracks, and performed a comprehensive audit of our UI layout components to ensure pixel-perfect stability.

### Fixes & Improvements

- **Profile Crash Fix**: Hardened Audio Player to fail silently when destroyed, preventing 500 errors during navigation.
- **CSP Update**: Allowed `blob:` images in Content Security Policy to fix profile picture previews.
- **Audio Core**: Unified Playback and Context engines for gapless synchronization.
- **Audio Fix**: Uncommented critical `crossOrigin` setting in Audio Player to fix silent playback.
- **UI Audit**: Verified and hardened 6+ layout components (AppHeader, BottomNav, etc.).
- **Volume Sync**: Fixed regression where player volume desynchronized from session settings (Live Sync V2).
- **CSP Expansion**: Whitelisted Google Analytics/Ads domains to silence browser console errors.
- **Performance**: Verified build stability and type safety.

---

## v0.9.98 - Audio Shield (2026-02-01)

**"Audio Shield"**

Hardened Profile and Practice audio paths by fixing an Audio Player race, allowing blob previews, and consolidating Audio Context handling.

### Fixes & Improvements

- **Profile Audio Race Fix**: Resolved a 500 Global Error on the Profile page caused by an Audio Player race condition.
- **Preview CSP Fix**: Added `blob:` to CSP so profile picture previews render correctly.
- **Practice Audio Sync**: Consolidated Audio Context handling for Practice Mode audio sync.

---

## v0.9.96 - Profile Polish (2026-02-01)

**"Profile Polish & Header Fix"**

UI Consistency update. Fixed profile page layout scale, google image loading, and mobile header overlap.

---

## v0.9.95 - Dashboard Upgrade (2026-02-01)

**"Dashboard Upgrade"**

Transformed the Profile page into a responsive desktop dashboard and fixed AppHeader overlap issues on mobile.

### Visual Overhaul

- **Desktop Dashboard**: The Profile page is now a wide 2-column dashboard on desktop with sticky sidebar.
- **Mobile Header**: Moved Help button to the left to prevent title overlap.

---

## v0.9.94 - Studio Fix (2026-02-01)

**"Studio Fix"**

Fixed the Play/Pause button state in Playback mode and stabilized the audio engine.

### Fixes & Improvements

- **Playback Control**: Fixed Play/Pause button de-sync using stable refs.
- **Audio Stability**: Prevented unnecessary audio engine re-initializations.

---

## v0.9.93 - Infinity Loop (2026-02-01)

**"Infinity Loop"**

Hotfix for loop regression. Restored seamless track looping during practice sessions.

### Fixes & Improvements

- **Audio Loop**: Explicitly enabled looping on the audio player to prevent tracks from stopping at the end.

---

## v0.9.92 - Sync Guard (2026-02-01)

**"Sync Guard"**

Hotfix for regressions introduced in the Master Clock update. Fixed the stuck countdown and premature word playback.

### Fixes & Improvements

- **Stuck Countdown**: Memoized `useAudioSync` to prevent high-frequency UI polling from resetting the countdown state.
- **Premature Words**: Guarded the TTS engine to strictly wait for the session to be in `PLAYING` state before speaking.

---

## v0.9.91 - The Master Clock (2026-01-31)

**"The Master Clock"**

Standardized all Practice Mode UI elements on a single high-precision monotonic master clock. This permanently fixes the frozen timer ring, countdown visibility, and session timer jumps.

### Fixes & Improvements

- **Master Clock**: Implemented monotonic time sync across all UI components.
- **Countdown Fixed**: Ensured the visual countdown remains visible even when words are pre-loaded.
- **Ring Sync**: Fixed the frozen timer ring issue by standardizing on absolute audio time units.

---

## v0.9.90 - Timekeeper's Redemption (2026-01-31)

**"Timekeeper's Redemption"**

Fixed the frozen timer and missing countdown by implementing a high-performance UI polling loop. The Siren effect is also fully restored.

### Fixes & Improvements

- **UI Reactivity**: Implemented `requestAnimationFrame` polling to ensure the timer and countdown update smoothly without re-rendering the audio engine.
- **Siren Effect**: Restored the red/blue flashing warning before word changes.

---

## v0.9.89 - Wordsmith's Return (2026-01-31)

**"Wordsmith's Return"**

Fixed a critical issue where words were not displaying on Medium/Hard difficulties due to a logic error in the previous optimization.

### Fixes & Improvements

- **Word Logic Restored**: Fixed an issue where words were missing on Medium/Hard difficulties.
- **TTS Fix**: Resolved voice consistency issues.

---

## v0.9.88 - Practice Perfected (2026-01-31)

**"Practice Perfected Ã°Å¸â€™Å½"**

We completely rebuilt the Practice Engine core to eliminate infinite loops and ensure perfect timing. The countdown, word generation, and TTS are now glitch-free.

### Fixes & Improvements

- **Forever Fix**: Refactored `usePracticeEngine` to use the Command Pattern, permanently fixing the infinite loop regression.
- **Engine Stability**: Removed circular dependencies between the Audio Player and the Engine State.
- **Reliable Countdown**: The 3-2-1-GO sequence is now silky smooth and perfectly synced with the drop.

---

## v0.9.87 - Iron Core (2026-01-31)

**"Core Stability Patch"**

Critical stability updates to the Recording Engine and Practice Mode to prevent infinite loops and ensure reliable session handling.

### Fixes & Improvements

- Resolved a critical reference instability in `useRecording` causing repeated effect triggers.
- Fixed an issue where the Practice Engine could enter a play/pause loop.
- Stabilized recorder dependencies to prevent unnecessary re-rendering.

---

## v0.9.86 - Loop Breaker (2026-01-31)

**"Engine Stabilization"**

Hotfix for Practice Mode regression causing infinite loops.

### Fixes & Improvements

- Resolved circular dependency in Practice Engine.
- Fixed infinite loop where player would stall on start.
- Optimized audio scheduler synchronization.

---

## v0.9.85 - Voice Upgrade (2026-01-31)

**"Voice & Verification Ã°Å¸Å½â„¢Ã¯Â¸Â"**

We significantly upgraded the Text-to-Speech engine with smart voice selection and mobile hardening. We also performed a comprehensive audit of the audio player, certifying it as rock-solid.

### Fixes & Improvements

- **Smart Voice Selection**: The app now automatically picks the highest quality voice (Google US English, Samantha) instead of the robotic system default.
- **Player Audit**: Verified the stability of the Audio Player and Seamless Looping engine.
- **Mobile TTS**: Fixed issues where voice wouldn't play on iOS/Android without direct interaction.

---

## v0.9.84 - Voice Restoration (2026-01-31)

**"Voice Restoration Ã°Å¸â€”Â£Ã¯Â¸Â"**

We restored the Practice Mode voice engine! Words are now spoken aloud again, and we hardened the word generator to ensure you never run out of rhymes.

### Fixes & Improvements

- **TTS Restoration**: The text-to-speech engine is back online. It now speaks every word prompt.
- **Word Generator Safety**: Added a double-layer failsafe (Client + Server) to ensure words always appear, even if the database is sleepy.

---

## v0.9.83 - Visual Polish (2026-01-30)

**"Visual Polish Ã¢Å“Â¨"**

A visual enhancement update focusing on the Profile Card aesthetics and roadmap planning. We implemented a softer, more modern glow effect and outlined future features.

### Visual Overhaul

- **Profile Card**: Replaced the "Star" background with a premium soft glow effect for better readability and aesthetics.
- **Roadmap**: Updated `ROADMAP_v1.4.md` with upcoming Gamification and AI features.

### System Updates

- **MCP Audit**: Completed full audit of AI tools for 2026-01-30.
- **Fixes**: Resolved build warnings in ProfileStatsTab.

---

## v0.9.82 - Monetization Audit (2026-01-29)

**"Monetization Audit Ã°Å¸â€™Â°"**

We performed a comprehensive audit of our monetization logic. The History Graph is now correctly gated for Pro users, preventing free access. We also confirmed the security of our Stripe webhooks and beat upload flows.

### Fixes & Improvements

- **History Graph Gating**: Fixed a permission issue where the activity graph was visible to free users. It is now properly locked.
- **Header Cleanup**: Removed unused import in `VideoCreator` to keep the codebase clean.

### System Updates

- **Monetization Audit**: Verified security for Stripe Webhooks, Video Export, and Cloud Storage.
- **Master MCP Audit**: Validated that our AI tools (`chrome-devtools`, `supabase-mcp`) are healthy and ready for autonomous testing.

---

## v0.9.81 - Section Audit (2026-01-29)

**"User Beat Management Audit Ã°Å¸Â¥Â"**

A deep dive into the User Beat Management system. We fixed a critical upload bug, added integration tests, and refactored the beat selector for better performance.

### Fixes & Improvements

- **Upload Beats**: Fixed a critical bug where beat metadata failed to save due to an incorrect API endpoint.
- **Beat Deletion**: Verified secure deletion flow for both cloud and database records.
- **Code Health**: Extracted complex dropdown logic into a reusable `useBeatDropdown` hook.

### System Updates

- **API Tests**: Added a new integration test suite for `/api/user/beats` to prevent future regressions.
- **Audit History**: Officially audited and verified: Upload Beats, Cloud Storage, Calibration, Beat Deletion, and "My Beats".

---

## v0.9.80 - Clean Slate (2026-01-29)

**"The Feature Audit Update Ã°Å¸â€Â"**

We performed comprehensive audits on 7 core features, fixing bugs and adding polish. The Latency Wizard now correctly saves calibration data, and we added 8 new unit tests for the Word Prompt system.

### Fixes & Improvements

- **Latency Fix**: Resolved a bug where the Latency Wizard calibration was not being applied during playback.
- **Word Prompt Tests**: Added 8 unit tests covering anti-rhyme logic, fallback behavior, and difficulty filtering.
- **JSDoc Comments**: Added detailed documentation to the scheduler and beat library modules.

### System Updates

- **MCP Audit Workflow**: Added a new workflow for auditing MCP server integrations.
- **Feature Matrix**: Verified 7 features: Solo Mode, Cypher Mode, Word Prompts, Beat Library, Orb Visualizer, Latency Fix.

---

## v0.9.79 - Pass the Phone (2026-01-29)

**"Cypher Mode Activated Ã°Å¸Å½Â¤"**

We activated the Cypher Mode! Gather your crew around a single device and trade bars. The ring now rotates automatically for up to 4 players.

### New Features

- **Local Multiplayer**: "Cypher Mode" is now live! Select 2-4 players and pass the phone.
- **Auto-Rotation**: The beat engine now tracks whose turn it is and switches players automatically every 4/8/16 bars.
- **Visual Feedback**: The Simon Ring visualizer now spins to match the active player.

---

## v0.9.78 - Dewey Decimal (2026-01-29)

**"The Library Update Ã°Å¸â€œÅ¡"**

We completely overhauled our documentation to be world-class. Added "How-to-Code" guides (TSDoc), rigorous Architecture Records, and automated link checking.

### System Updates

- **Docs 2.0**: Reorganized all documentation into a clean, industry-standard structure (Architecture, Guides, Reference).
- **Code Integration**: Added detailed usage docs directly into the code for the Practice Engine.
- **Automated Validation**: The documentation now self-checks for broken links on every update.

---

## v0.9.77 - Visual Polish (2026-01-27)

**"Visual Polish Ã°Å¸Å½Â¨"**

Fixed alignment issues on the "How it Works" section.

### Visual Overhaul

- **Step Alignment**: Improved vertical alignment of step numbers for multi-line titles.

---

## v0.9.76 - Conversion Flow (2026-01-27)

**"Ad Conversion Update Ã°Å¸Å¡â‚¬"**

We launched a dedicated download landing page and a celebration screen for new Pro members to optimize our ad campaigns.

### New Features

- **New /download Page**: A smart landing page that detects your device (Android/iOS/Desktop) and serves the perfect download link.
- **Order Confirmation**: A celebratory "You are now a Pro" page with confetti and feature recaps after successful payment.
- **Homepage CTA**: Added a "Get the App" button to the main hero section.

---

## v0.9.75 - Sonic Boost (2026-01-27)

**"Sonic Boost Update Ã¢Å¡Â¡"**

A massive performance update! We rewrote the Practice engine to load instantly and hardened security with industry-standard CSP protection.

### System Updates

- **Server-Side Practice**: The practice page now loads instantly thanks to Next.js Server Components. No more waiting for beats to fetch!
- **Security Hardening**: Fixed Content Security Policy (CSP) to ensure Google Analytics and other integrations run safely and securely.

### Fixes & Improvements

- **LCP Optimization**: Reduced Largest Contentful Paint (LCP) to ~2.7s for a faster initial render.
- **Database Security**: Verified Row Level Security (RLS) is active on all sensitive user tables.

---

## v0.9.74 - Stripe Fix (2026-01-27)

**"Stripe Checkout Fix"**

Fixed Stripe integration to enable the subscription checkout flow.

### Fixes & Improvements

- **Stripe API Fix**: Corrected invalid API version that was blocking checkout.
- **Environment Cleanup**: Resolved trailing newline issues in Vercel env vars.
- **Error Logging**: Added detailed error messages for debugging.

---

## v0.9.73 - Feature Labels (2026-01-27)

**"Feature Labels Update"**

Corrected subscription feature labels to accurately reflect actual capabilities.

### Fixes & Improvements

- **Free Tier Honesty**: Removed misleading "Session history" claim - free users cannot save recordings.
- **Pro Tier Clarity**: Updated features to show uploads, 100+ beats, and save/download capabilities.
- **Landing Page Sync**: Aligned pricing page with accurate feature lists.

---

## v0.9.72 - Price Fix (2026-01-27)

**"Price Fix"**

Corrected pricing display across all components to match Stripe configuration.

### Fixes & Improvements

- **Price Sync**: Fixed Ã¢â€šÂ¬3.99 / Ã¢â€šÂ¬39 displaying instead of Ã¢â€šÂ¬4.99 / Ã¢â€šÂ¬49.
- **Currency Alignment**: Converted remaining USD ($) prices to EUR (Ã¢â€šÂ¬).
- **Affected Components**: SubscriptionSection, SubscriptionModal, LandingPricing.

---

## v0.9.71 - Euro Edition (2026-01-27)

**"EUR Currency Update"**

Aligned the application with our Euro-based Stripe setup for a seamless global launch.

### System Updates

- **EUR Primary Currency**: All pricing now displayed in Euros (Ã¢â€šÂ¬4.99/mo).
- **Stripe Sync**: Matched yearly plan price to the Stripe Dashboard (Ã¢â€šÂ¬49.00/yr).
- **Multi-Currency Ready**: UK and other international users see their local currency at checkout via Stripe Adaptive Pricing.

---

## v0.9.70 - Cleanup Edition (2026-01-27)

**"Cleanup & Sync"**

A foundational update focused on code health, monetization consistency, and centralized configuration for a smoother launch.

### System Updates

- **Dynamic Pricing**: Premium modal now reflects real-time Stripe pricing without hardcoded limits.
- **Centralized Config**: Unified session and storage limits into a single source of truth.
- **Data Health**: Moved large fallback data sets to dedicated modules, cleaning up core API and UI code.

### Fixes & Improvements

- **Monetization Sync**: Removed outdated "trial" claims to align with the current Stripe setup.
- **Refactored Fallbacks**: Improved app reliability during network/database failure modes.

---

## v0.9.69 - Fort Knox (2026-01-27)

**"Security Hardening"**

Implemented industry-standard HTTP security headers, improved legal compliance, and enhanced mobile usability.

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

**"Launch Readiness"**

Final polish for the public launch. Includes a massive SEO overhaul, smoother loading animations, and enhanced offline support.

### System Updates

- **SEO Overhaul**: Dynamic social cards, sitemaps, and structured data.
- **PWA Upgrade**: Added "Rich Install" support and a custom Offline page.
- **Performance**: New "Lifeline" loading animation and faster visualizer startup.

---

## v0.9.67 - Direct Support (2026-01-27)

**"Direct Support Update Ã°Å¸Â¤Â"**

We made it easier to get help. You can now contact support directly from the app without leaving to your email client.

### New Features

- **In-App Support**: Send messages directly to our team from the Settings menu.
- **Faster Routing**: Profile links are now instant (no more redirects).

---

## v0.9.66 - Direct Line (2026-01-27)

**"The Contact Update Ã°Å¸â€œÂ§"**

We updated our support channels to ensure your feedback always reaches us. Plus, more polish for the public profile experience.

### Visual Overhaul

- **Contact Update**: Updated all support and legal contact emails to `contact@freestyla.app`.
- **Profile Polish**: Verified public profile stability.

---

## v0.9.65 - Instant Access (2026-01-27)

**"Instant Access Update Ã¢Å¡Â¡"**

Navigation is now blazing fast. Accessing your profile is instant, and we fixed some deployment stability issues.

### Fixes & Improvements

- **Instant Profile**: Clicking "Profile" now takes you there instantly without redirects.
- **Smart Login**: Signing in now correctly returns you to your profile.
- **Stability**: Fixed build errors ensuring a rock-solid experience.

---

## v0.9.64 - Crash Fix (2026-01-27)

**"The Profile Hotfix Ã°Å¸â€Â¥"**

We quickly squashed a bug that caused Public Profiles to crash. Visiting a user profile is now safe and smooth again!

### Fixes & Improvements

- **Crash Fix**: Resolved a Server Component error on the profile page caused by an illegal function prop. Simple fix, big impact.

---

## v0.9.63 - Identity Restored (2026-01-27)

**"The Public Profile Polish Ã°Å¸â€˜Â¤"**

We fixed a critical issue where public profiles were failing to load for guests, and ensured our Superadmins always have the correct identity.

### Fixes & Improvements

- **Profile Fix**: Resolved the "Something went wrong" error on public profiles. Your stats are visible to the world again!
- **Admin Identity**: Superadmins are now automatically assigned their correct handles (Admin1/Admin2) upon login.

---

## v0.9.62 - Accessibility Polish (2026-01-22)

**"The Accessibility Polish Update Ã°Å¸Ââ€ "**

We achieved a perfect 100/100 Accessibility score! This update brings crystal clear text contrast, massive performance gains by deferring audio engine startup, and a snappier feel thanks to lazy-loading.

### Fixes & Improvements

- **100% Accessibility**: Fixed color contrast on beat metadata text to ensure it is readable for everyone.
- **Performance Boost**: Deferred the audio engine warmup to when you actually start a session, eliminating page load lag.
- **Lazy Loading**: Heavy menus like the Session Summary and Guest Login now load only when needed, speeding up the app.

---

## v0.9.58 - Gold Plated (2026-01-22)

**"The Golden Polish Update Ã°Å¸Ââ€ "**

We fixed the "Word Smith" achievement logic and updated the Premium Beat count to show the real number of tracks available.

### Fixes & Improvements

- **Achievement Fix**: "Word Smith" now unlocks correctly when you view your achievements.
- **Dynamic Counts**: The "Get Pro" modal now shows the actual number of premium beats available (140+) instead of a static "100+".

---

## v0.9.57 - Identity Fix (2026-01-22)

**"Identity & Access"**

Critical fixes for user profiles, guest access, and authentication security.

### Fixes & Improvements

- **Profile Page**: Fixed Server Error on `/u/Admin` (UUID Logic).
- **Guest Access**: Audio previews now play correctly (Storage Policy Update).
- **Auth**: Enforced unique usernames and Admin handles.

---

## v0.9.56 - Clear Skies (2026-01-21)

**"Storage Clarity Update"**

Switched storage tracking from file size to duration (1-hour limit) and improved usage visualization for all users.

### Visual Overhaul

- **Storage Bar**: Now displays usage based on recording duration (1h Cap).
- **Visualization**: Removed "Unlimited" text; shows exact % used for everyone.

---

## v0.9.55 - Third Time Charm (2026-01-21)

**"Hotfix for the Hotfix (Again) Ã°Å¸â„¢Ë†"**

Fixed the build error by properly destructuring the sessionDuration prop. We manually verified the file this time!

### Fixes & Improvements

- **Build Fix**: Officially exposed sessionDuration to the player scope.

---

## v0.9.54 - Patch Perfect (2026-01-21)

**"Hotfix for the Hotfix Ã°Å¸â€ºÂ Ã¯Â¸Â"**

Fixed a build error introduced in the previous hotfix. The duration display is now truly fixed and stable.

### Fixes & Improvements

- **Build Fix**: Resolved a variable scope issue in the player component.

---

## v0.9.53 - Time Lord (2026-01-21)

**"Duration Hotfix Ã¢ÂÂ±Ã¯Â¸Â"**

Fixed a bug where the total time would show as "INFINITY:NAN" while the audio was loading. We now properly use the saved session duration for instant display.

### Fixes & Improvements

- **Instant Duration**: Usage of saved session duration ensures the timer and progress bar are correct immediately on load.
- **Safety Net**: Added guards to prevent "NaN" or "Infinity" from ever appearing in the time display.

---

## v0.9.52 - Pixel Perfect (2026-01-21)

**"The Visual Perfection Update Ã°Å¸Å½Â¨"**

We polished the audio player with a pro-grade progress bar and stabilized the playback engine to ensure your sessions never skip a beat.

### Visual Overhaul

- **Audio Progress Bar**: Added a "SoundCloud-style" progress indicator. The waveform now fills with color as it plays!
- **Header Harmony**: Enforced single-line titles to prevent text wrapping from breaking the layout on small screens.

### Fixes & Improvements

- **Playback Reliability**: Fixed the "Empty src" error by rewriting the audio player lifecycle. Playback is now rock solid.

---

## v0.9.51 - Duplicate Removed (2026-01-21)

**"Pure Harmony Ã¢ËœÂ¯Ã¯Â¸Â"**

We found a ghost in the machine! The navigation bar was being rendered twice, causing layout shifts and clipping. We removed the double-print and restored pure symmetrical balancing.

### Visual Overhaul

- **De-Duplication**: Removed the duplicate Bottom Nav that was squeezing the layout.
- **Pure Centering**: Removed all manual offsets. The player now floats perfectly in the flex container.

---

## v0.9.50 - Visual Balance (2026-01-21)

**"Gravity Center Ã°Å¸Å½Â¨"**

We removed the complex math and simply pushed the player down to visually balance it against the header. Sometimes simpler is better.

### Visual Overhaul

- **True Centering**: Added top padding to push the player down, fixing the high bias.
- **No Clipping**: Ensured the glow effects are fully visible.

---

## v0.9.49 - Relative Flow (2026-01-21)

**"Universal Center Ã°Å¸Å’Â"**

We unlocked the physics of the layout. The player now adapts to any device notch or header size for true responsive centering.

### Visual Overhaul

- **Fluid Layout**: Calculated dynamic padding to counterbalance the header and safe-areas on iOS/Android.
- **Breathing Room**: Fixed an issue where the recording glow was getting clipped.

### Visual Overhaul

- **Header Fix**: Prevented the "FreeStyla" title from overlapping with the new Help button.

---

## v0.9.48 - Euclidean (2026-01-21)

**"Geometric Center Ã°Å¸â€œÂ"**

Mathematically perfect centering accounting for global UI chrome.

### Visual Overhaul

- **Euclidean Center**: Fixed a subtle 28px vertical offset on mobile. The player is now geometrically centered.

### Visual Overhaul

- **Grouped Controls**: Info pills are now grouped with the top controls for better visual hierarchy.

---

## v0.9.47 - True Center (2026-01-21)

**"Hotfix Ã°Å¸â€Â§"**

Layout corrections for true mathematical centering.

### Visual Overhaul

- **True Center**: Adjusted top spacing to perfectly balance the player against the bottom navigation.

---

## v0.9.46 - Perfect Center (2026-01-21)

**"The Balance Update Ã¢Å¡â€“Ã¯Â¸Â"**

We fine-tuned the practice experience with focused layout improvements and expanded frequency options for veteran rappers.

### New Features

- **16-Bar Option**: You can now select "Every 16 Bars" for word switches. Perfect for long-form storytelling and endurance practice.

### Visual Overhaul

- **Refined Layout**: The Practice Player now floats perfectly in the center of your screen, with balanced spacing from top to bottom.
- **UI Cleanup**: Removed redundant "Upload" prompts in the beat selector for a cleaner look.

---

## v0.9.45 - Cloud Control (2026-01-20)

**"Cloud Control Ã¢ËœÂÃ¯Â¸Â"**

We are introducing smart storage limits to keep the platform sustainable while ensuring Pro users get the premium experience.

### New Features

- **Storage Limits**: Free users are now "Read-Only". You must be Pro to save new recordings. Pro users remain unlimited.
- **Legacy Estimation**: Old recordings are automatically estimated to ensure fair usage calculations.

### Visual Overhaul

- **Perfect Center**: The practice player is now perfectly centered on all devices, ensuring a consistent experience.
- **Storage Bar**: A new visual indicator helping you track your cloud usage at a glance.

---

## v0.9.44 - Smart Flow (2026-01-20)

**"The Smart Flow Update Ã°Å¸Â§Â "**

We made the practice engine smarter! No more repeated words, and we now prevent simple rhymes from appearing back-to-back to force you to think harder.

### System Updates

- **Smart Anti-Repeat**: Words will now cycle through the ENTIRE library before repeating. No more seeing the same word twice in one session!
- **Anti-Rhyme Logic**: The engine now prevents consecutive words that rhyme too easily (like "Nation" -> "Station"), ensuring a more diverse flow.

### Fixes & Improvements

- **Navbar Scroll Fix**: The bottom navigation bar now reserves its own space in the layout, ensuring that content lists can never scroll behind it or be obscured.
- **Smart Frequency Switch**: Changing the word frequency (e.g., 4 to 8 bars) now waits for the current word to finish before applying. No more jarring jumps or broken flows!

---

## v0.9.43 - Native Feel (2026-01-20)

**"Natural Flow"**

UI polish to make the app feel cleaner and more native.

### Visual Overhaul

- Fixed Navigation: Bottom bar is now locked to the bottom of the screen (no more scrolling away)
- Natural Scrolling: Removed forced 100vh locks for a smoother native scroll feel
- Settings Upgrade: Added visible Level badge and XP progress bar to your settings profile card

---

## v0.9.42 - Unified Profile (2026-01-20)

**"Unified Identity"**

Merging private profiles with public pages for a cohesive experience.

### New Features

- Refactored Profile System: Private dashboard merged into public /u/[username] page
- Unified Header: Standardized navigation bar across App, Profile, and Record pages
- Owner Controls: Added edit/settings tools directly to your public profile page
- Smart Redirects: /profile now auto-redirects to your unique user handle

---

## v0.9.41 - Full Roster (2026-01-19)

**"The Admin Visibility Update"**

We introduced a comprehensive User List in the Admin panel, giving admins full visibility into the community. Track growth, subscription status, and engagement all in one place.

### New Features

- **Admin User List**: A powerful new dashboard to view all registered users with real-time stats (Level, XP, Streaks) and subscription status.
- **Smart Badges**: Instantly spot PRO users and Superadmins with distinct visual badges in the user table.

---

## v0.9.40.5 - Cloud Native (2026-01-19)

**"The Storage & Polish Update"**

We introduced a sleek new Cloud Storage bar to tracking your recording capacity, opened up the Recordings page for everyone to preview, and performed a massive system-wide emoji cleanup for a cleaner professional look.

### New Features

- **Cloud Storage Bar**: Added an iCloud-style storage visualization on the Recordings page. Pro users can now see exactly how much studio time they have engaged.
- **Open Access**: The Recordings page is now accessible to all users! Free users can browse the interface (with storage features locked behind Pro).

### Visual Overhaul

- **Emoji Clean-up**: rigorously removed all emojis from the application UI and documentation for a more polished, app-native aesthetic.

### Fixes & Improvements

- **Performance**: Optimized component rendering on the Recordings page.

---

## v0.9.40 - Polish & Progression (2026-01-19)

**"The Master Bug Fix Update "**

We addressed the highest priority issues from our Master Bug Report, restoring your XP bars, fixing broken achievements, and finally adding that Random Beat button!

### New Features

- **Random Beat**: Added a "Random Beat" option to the beat selector. Perfect for when you want the vibe to choose you.

### Fixes & Improvements

- **Profile Stats Restored**: Fixed a bug where your XP Bar and Level indicator were invisible on the profile page. Your grind is visible again!
- **Achievement Unlocked**: Fixed the "Word Smith" achievement logic. If you earned it, it should now unlock automatically.
- **Premium Fix**: Verified that locked beats correctly trigger the upgrade modal.

---

## v0.9.39 - Unblocked (2026-01-17)

**"The Pro Save Fix "**

We fixed a critical bug where Pro users were blocked from saving their sessions by an incorrect "Get Pro" modal. Your flow is now unblocked!

### Fixes & Improvements

- **Pro Save Unblocked**: Fixed a bug where the "REC" button would trigger the "Get Pro" modal even for subscribed users. Pro users can now toggle recording and save sessions freely.

---

## v0.9.38 - Open Mic (2026-01-17)

**"The Guest Pass Hotfix Ã¯Â¸Â"**

We fixed a critical bug preventing guest users from starting a recording session. The "The Booth" is now open to everyone again!

### Fixes & Improvements

- **Guest Recording Enabled**: Removed an incorrect check that blocked unauthenticated users from hitting record. Rap first, sign up later.
- **Upgrade Trigger**: Fixed the "Get Pro" modal not appearing when requested.

---

## v0.9.37 - Fair Game (2026-01-17)

**"The True Shuffle Update "**

We fixed the word randomization logic to ensure you actually get new words in every session, and now your stats will finally track "Words Unlocked" correctly.

### Fixes & Improvements

- **True Randomness**: Fixed a caching issue that caused the same words to appear repeatedly. Every session now pulls a fresh batch.
- **Stats Sync**: "Words Unlocked" stats now correctly track unique words encountered, fixing the discrepancy with "Total Words Generated".

---

## v0.9.36 - Direct Line (2026-01-16)

**"The Feedback Fix "**

We fixed the "Report Bug" link in the settings menu to correctly redirect to the dedicated feedback page, and cleaned up the Patch Notes UI.

### Fixes & Improvements

- **Report Bug Redirect**: The "Report Bug" button in Settings now correctly takes you to the Feedback page instead of the Patch Notes.
- **UI Cleanup**: Removed the redundant "Feedback" form from the bottom of the Patch Notes page.

---

## v0.9.35 - Seamless Upload (2026-01-16)

**"The Flow State Update "**

We smoothed out the "My Tracks" experience. You can now upload beats directly from the difficulty menu and managing your library is easier than ever.

### New Features

- **Instant Upload**: Added a smart "Upload your first beat" prompt and a permanent "Upload new track" button right in the My Tracks dropdown.
- **Seamless Flow**: Uploading from the difficulty menu now auto-redirects you to the upload vault.

### Fixes & Improvements

- Ã¯Â¸Â **Delete Fixed**: Resolved an issue where deleting server-side tracks from the dropdown wasn't working. Clean up your library with confidence!

---

## v0.9.34 - Five Stars (2026-01-16)

**"The Social Proof Update "**

We enabled a seamless rating experience, polished beat card visuals, and finally solved audio looping for infinite flow.

### New Features

- **Rate Us**: Added a sleek rating modal that appears after your 3rd session. Love the app? Let us know!
- Ã¢Â­Â **Star Power**: You can now drop a star rating directly in the feedback form.

### Fixes & Improvements

- Ã¯Â¸Â **Perfect Loops**: Rewrote the audio engine to use Web Audio scheduling. Beats now loop seamlessly with zero gaps.
- **Clean Cards**: Combined Artist and Producer names on beat cards for a cleaner look.

---

## v0.9.33 - Go Time (2026-01-16)

**"The Green Light Update "**

We made sure your recordings always playback perfectly and gave the Practice Mode a clearer, punchier "START" button so you know exactly when to drop your bars.

### Fixes & Improvements

- **Playback Rescued**: Fixed a "Failed to Play" bug caused by some beats having spaces in their cloud filenames. Your history is safe!
- **Clearer Start**: Swapped the ambiguous mic icon for a big, bold, pulsing "START" button. Less guessing, more rapping.

---

## v0.9.32 - Liquid Flow (2026-01-16)

**"The Responsive Polish Update "**

We smoothed out the Admin experience and fine-tuned the mobile layout to feel even more native. Plus, difficulty settings now stick instantly!

### Fixes & Improvements

- Ã¯Â¸Â **Admin Focus Fix**: Resolved an annoying bug where editing track details would lose focus after every character. Smooth typing is back!
- Ã¯Â¸Â **Instant Difficulty**: Changing difficulty mid-session now instantly updates the word vibe for the rest of your session.

### Visual Overhaul

- **Compact Mobile Layout**: Optimized padding and scaling for small iPhones (SE, Mini) to ensure all controls fit on a single screen without scrolling.
- **Responsive Practice controls**: The REC indicator and main buttons now scale aggressively to respect the viewport on smaller devices.

---

## v0.9.31 - Safe Zone (2026-01-16)

**"The Quality of Life Update Ã¯Â¸Â"**

A massive polish update ensuring content never covers navigation, fixing audio glitches during review, and professionalizing the experience with better legal pages and feedback tools.

### Visual Overhaul

- **Bottom Nav Safety**: Implemented global padding logic so content is never hidden behind the bottom bar on any device.
- **Header Harmony**: Constrained header titles to prevent text overlapping with buttons on smaller screens.
- **Professional Polish**: Refined the look of legal pages and feedback forms with cleaner iconography.

### Fixes & Improvements

- **Audio Glitch Eradicated**: Fixed stuttering and popping during recording review playback.
- **Smooth Waveform**: The playback indicator now smoothly glides across the track without jitter.
- Ã¯Â¸Â **Feedback Center**: Launched a dedicated /feedback page for easier bug reporting.

---

## v0.9.30 - Neon Ring (2026-01-16)

**"The Visual Polish Update "**

We gave the Cypher UI a major facelift with a new outer-ring layout and boosted the "Siren" intensity for maximum hype. Plus, a handy Help button in the header!

### Visual Overhaul

- **Cypher Outer Ring**: The player segments now hug the outer edge of the main control button for a cleaner, futuristic look.
- **Siren Boost**: The "Police Siren" effect before word switches is now 200% more intense. You can't miss it!
- Ã¢â€žÂ¹Ã¯Â¸Â **Header Help**: Added a quick-access Help button (?) to the global header that takes you straight to the "How it Works" guide.
- **Glass Record Ring**: The central record button is now a consistent transparent glass ring with a purple border, ensuring the logo always shines through.

---

## v0.9.29 - Smooth Operator (2026-01-15)

**"The Safe Resume & Admin Polish Update "**

WeÃ¢â‚¬â„¢ve ironed out the playback wrinkles in Practice Mode (resuming works perfectly now!) and gave the Admin Beat Upload experience a serious upgrade with better layouts and stricter data controls.

### Fixes & Improvements

- Ã¢ÂÂ¯Ã¯Â¸Â **Perfect Resume**: Fixed a bug where resuming a paused session wouldn't restart the beat. Now it picks up exactly where you left off.
- **Safe Pausing**: Switching browser tabs now safely pauses your session instead of stopping it completely.
- **Spacebar Safety**: Pressing Spacebar now gently pauses the session (with confirmation) instead of abruptly ending it.

### New Features

- Ã¯Â¸Â **Admin Upload 2.0**: Completely redesigned the beat upload card. Added a sleek "Free/Premium" toggle switch and optimized the layout.
- Ã¯Â¸Â **Smart Genre Filter**: The Beat Vault filter now dynamically updates to show only relevant genres for the tracks you are viewing.
- **Data Integrity**: Producer Name and Genre are now mandatory fields for new uploads.

---

## v0.9.28 - The One Ring (2026-01-15)

**"Cypher Rings Restored "**

Fixed a regression where the player turn indicators in Cypher Mode were missing. The visual rings are back!

### Fixes & Improvements

- **Cypher Mode**: Restored missing player turn rings.
- **Visual Fix**: Corrected SVG rendering for player segments.

---

## v0.9.27 - StrictMode Safe (2026-01-15)

**"The True Timer Fix Ã¢ÂÂ±Ã¯Â¸Â"**

The session timer now runs at the correct speed! We discovered React StrictMode was causing the timer to run 2x faster by spawning duplicate animation loops.

### Fixes & Improvements

- Ã¢ÂÂ° **Accurate Timer**: Timer now counts at exactly 1 second per real second.
- Ã¯Â¸Â **StrictMode Guard**: Added animation ref guard to prevent duplicate timing loops.
- **Clean Exit Paths**: All animation loop exit points now properly clean up the frame reference.
- **Silence on Save**: Fixed "Leave site?" warning appearing after successful session save.

---

## v0.9.26 - True Time (2026-01-15)

**"The Metronome Fix Ã¢ÂÂ±Ã¯Â¸Â"**

Minor timer stability improvements and layout polish.

### Fixes & Improvements

- **Stable Dependencies**: Removed unstable object references from timer effect.
- **Layout Lock**: Added fixed height to control buttons row to prevent player circle from shifting when controls appear.

---

## v0.9.25 - Pocket Studio (2026-01-15)

**"The Mobile & Precision Update "**

A comprehensive update focusing on mobile ergonomics and rigorous timing precision. We rebuilt the layout for small screens and locked the word intervals to the musical grid.

### System Updates

- **Grid Lock Integrity**: Fixed a bug where changing bar frequency mid-session could freeze the timer. Timing is now reset instantly on change.
- **Smart PWA Installer**: The app now detects iOS vs Android and teaches iOS users how to bypass microphone permission prompts.

### Visual Overhaul

- **Dynamic Scaling**: The practice ring now caps its height at 45% of the screen, ensuring buttons are never cut off on smaller IPhones.
- **Split Layout**: Separated the Exit/Pause buttons into their own dedicated row to prevent overlap with the main player ring.
- **Viewport Stability**: Enforced `100dvh` (Dynamic Viewport Height) to respect the Safari bottom bar, preventing navigation issues.

---

## v0.9.20 - Grid Lock (2026-01-15)

**"The Precision Update "**

A major stability update introducing the "Grid Lock" timing engine for perfect musical synchronization, plus a polished "Satellite Layout" for the player controls.

### System Updates

- **Grid Lock Timing**: Word switching is now mathematically locked to the beat grid. No more drifting!

### Visual Overhaul

- Ã¯Â¸Â **Satellite UI**: Redesigned player controls to prevent button cropping and improve reachability.
- **Layout Fixes**: Solved vertical scrolling issues on smaller screens across the app.

---

## v0.9.19 - Silent Loop (2026-01-15)

**"Polish & Precision"**

A smoother practice experience with seamless audio looping, pixel-perfect button alignment, and a smarter TTS engine that knows when to be quiet.

### Fixes & Improvements

- Seamless Looping: Fixed the 0.5s delay at the end of audio tracks. Beats now loop perfectly forever.
- Smart Silence: The voice tool now instantly stops talking when you leave a session or switch tabs.
- Visual Balance: Interactive buttons are now perfectly centered, and the Mode indicator takes center stage.

---

## v0.9.18 - Focus Mode (2026-01-13)

**"Streamlined Setup"**

We removed the "Word Theme" selector to make starting a session faster and more intuitive. One bank, total focus.

### Fixes & Improvements

- Feature Removal: Word Themes have been pruned for a simpler experience.

---

## v0.9.17 - Red Line (2026-01-13)

**"Visual Playhead"**

Added a distinct red playback cursor to the audio waveform, so you always know exactly where you are in the track.

### Visual Overhaul

- Waveform: Now features a glowing red playhead indicating current position.

---

## v0.9.16 - Safety Net (2026-01-13)

**"Smart Fallbacks & Sleek Reviews"**

We polished the Review page to look more pro and fixed a logic quirk where "Easy" mode could get tough if the internet blipped. Plus, dynamic difficulty switching!

### Visual Overhaul

- Review Page: Title moved to app header, removing clutter and waste of space.
- Layout: Tighter spacing on top of review and practice screens.

### Fixes & Improvements

- Word Engine: "Easy" mode is now strictly easy, even offline.
- Dynamic Difficulty: Changing the difficulty slider mid-session now instantly updates the word vibe.

---

## v0.9.15 - One Screen (2026-01-13)

**"Mobile Experience"**

Practice sessions now fit perfectly on your mobile screen. No scrolling, no distractionsÃ¢â‚¬â€just you and the booth.

### Fixes & Improvements

- Viewport Lock: The "The Booth" now uses 100% of your screen height, eliminating annoying scrollbars.
- Responsive Ring: The record button scales down for smaller phones so you can reach every control.
- Smart Layout: Controls now distribute themselves evenly to fill available space.

---

## v0.9.15 - Prism (2026-01-13)

**"Cypher Visual Alignment"**

Small but mighty visual tweak: The Cypher player selection buttons now match the actual in-game player colors.

### Fixes & Improvements

- Cypher Setup: Player count buttons now sport their team colors (Orange, Gold, Green, Blue).

---

## v0.9.14 - Safe Mode (2026-01-13)

**"Session Safety & Layout"**

Practice sessions are now safer! We added confirmation dialogues to prevent accidental exits and polished the studio controls layout.

### New Features

- Exit Safeguard: Use the Bottom Bar freely. We now ask for confirmation before discarding your session.
- Layout Polish: Resized the Record button and moved controls up for a cleaner look.
- Smart Controls: Pause/Discard buttons now hide automatically when recording is disabled.

---

## v0.9.13 - Obsidian (2026-01-13)

**"Dark Mode Refined"**

We heard you! The track covers have been reimagined with a sleeker, darker, and more premium aesthetic.

### New Features

- Dark Premium Palettes: Replaced neon colors with deep blacks, blues, and charcoals.
- De-cluttered Interface: Removed the large "RAP" text overlay from track cards.
- Subtle Textures: Refined the noise and pattern overlays for a cleaner finish.

---

## v0.9.12 - Fresh Paint (2026-01-12)

**"Visual Velocity"**

We have completely overhauled the track browser with a new Generative Art engine. Every beat now gets a unique, high-fidelity cover.

### Visual Overhaul

- Generative Covers: No more static gradients. Every track has unique, code-generated art.
- Streetwear Aesthetic: Added noise textures and bold typography overlays.
- Dynamic Patterns: Mesh gradients, neon shapes, and geometric grids.

---

## v0.9.11 - Clean Sweep (2026-01-12)

**"UI Hotfix"**

Removed the redundant Daily Streak widget from the Difficulty Selection page. Tracking is now exclusively via the header icon.

### Visual Overhaul

- UI Cleanup: Removed the duplicate "Keep the Streak" widget from the center of the Skill Check page.

---

## v0.9.10 - Neon Squad (2026-01-12)

**"The Cypher Polish"**

Refining the Cypher Mode experience with distinct player identities and cleaning up global header rendering.

### Visual Overhaul

- Cypher Player Roster: Implemented game-like avatars with unique colors (Purple, Orange, Gold, Green, Blue) for each player.
- Hover Streak Widget: Moved the Streak details into a tooltip to reduce header clutter.
- Header Cleanup: Resolved text duplication issues in the window title for a cleaner app presence.

### Fixes & Improvements

- Manifest Update: Shortened app name to "FreeStyla" to prevent title redundancy.
- Color Logic: Fixed "all blue" bug by correcting accent color definitions in the theme.

---

## v0.9.7 - Grid Lock (2026-01-12)

**"Precision Sync Update"**

We fixed a critical timing bug where switching difficulties mid-session would cause words to drift off-beat. Now, everything snaps perfectly to the musical grid.

### Fixes & Improvements

- Grid Alignment: Difficulty switches now "snap" to the next musical phrase.
- Visual Sync: Timer ring always starts fresh on new words, no matter when you switch.
- Cypher UI: Relocated player indicator to the bottom controls.

### Fixes & Improvements

- Playback: Fixed "Failed to play recording" error for new uploads.

---

## v0.9.5 - Wave 2 (2026-01-11)

**"Career Update"**

The "Career Update" is here! We added 27 new achievements to track your rise from rookie to legend, plus better timer visibility and stability fixes.

### New Features

- Added 27 new achievements (XP, Streaks, Skill, Volume)
- Enhanced database seeding for new achievements

### Visual Overhaul

- Increased session timer size for better readability in the Booth

### Fixes & Improvements

- Fixed build system type errors for smoother deployments

---

## v0.9.4 - Visual Loyalty (2026-01-11)

**"High Contrast Update"**

Improving accessibility with higher contrast settings menus and finalizing the Global Header rollout.

### Visual Overhaul

- High Contrast Settings: Darker backgrounds and brighter text for better readability.
- Global Headers Complete: Finalized AppHeader integration across Search and Admin pages.

---

## v0.9.3 - Consolidated Identity (2026-01-11)

**"Global Header Architecture"**

Replacing inconsistent page headers with a unified, context-aware global header system that improves mobile visibility and branding.

### Visual Overhaul

- Global Header System: Unified AppHeader across all pages (Practice, Recordings, Admin, etc.).
- Dynamic Branding: Custom titles (e.g., "THE BOOTH") replace static "FreeStyla" logo.
- Mobile Visibility: Increased header height and enabled subtitles on mobile.

---

## v0.9.2 - Studio Tune-Up (2026-01-10)

**"Practice Player Polish"**

A focused update refining the Practice Mode experience and squashing critical audio bugs.

### New Features

- Session Timer Restored: The countdown is back, displayed below the word.

### Fixes & Improvements

- 10-Minute Sessions: Fixed premature session termination.
- Gapless Loop: Eliminated audio gap when beats loop.
- Gamification Logic: Fixed 0-streak bug. Real stats now track.
- Branding Polish: Finalized FreeStyla rename in all exports.

---

## v0.9.1 - App Native (2026-01-10)

**"The Mobile Flow"**

A major layout update transforming FreeStyla into a true single-screen experience. The app now feels native, with locked viewports and smooth internal scrolling.

### System Updates

- Single-Screen Layout: The app viewport is now locked. No more full-page scrolling.
- Internal Scrolling: Content lists now scroll independently while keeping headers/footers fixed.
- Adaptive Design: Optimized for all mobile notches and safe areas.

### Fixes & Improvements

- Layout Stability: Fixed layout jitter and double scrollbars on mobile.
- Practice Page: Resolved type errors and modal stability issues.

---

## v0.9.0 - FreeStyla (2026-01-10)

**"The Rebrand"**

A new identity. "FlowForge" is now "FreeStyla". We have also renamed the "Vinyl Collection" to "Beat Vault" and polished the gamification system for a unified, premium experience.

### Visual Overhaul

- Identity Shift: "FlowForge" branding replaced with "FreeStyla" across the entire application.
- Beat Vault: Renamed "Vinyl Collection" to "Beat Vault" to better align with our premium "Unlock the Vault" messaging.
- Navigation: "Vinyl" tab renamed to "Beats" for clarity.

### Fixes & Improvements

- Critical Audio: Resolved playback failures on the Practice Page for reliable sessions.
- Record Button: Fixed icon rendering issues for a cleaner look.
- Profile Images: Google profile pictures now correctly display in the sidebar.
- Victory Screen: Enhanced animations and data connection for the post-session summary.

---

## v0.8.1 - Embedded Share (2026-01-10)

**"The Social Polish"**

Refining the recording sharing UI to use an embedded, non-overlapping layout.

### Visual Overhaul

- Embedded Share Menu: The sharing dropdown now pushes content down instead of floating, preventing UI overlap.
- Solid Backgrounds: Removed transparency from the share menu for better readability.

---

## v0.8.0 - Level Up (2026-01-10)

**"The Gamification Core"**

The gamification system is now fully operational with real backend persistence for XP and Levels. No more placeholders.

### New Features

- Real XP Persistence: User levels and XP are now saved to the database.
- Scoring Engine: Earn 5 XP/word, 2 XP/second, and 100 XP/achievement.
- Live Victory Screen: Session summary now displays your actual database progress.

---

## v0.7.7 - Direct Access (2026-01-10)

**"The Seamless Selection"**

Removing friction from the difficulty selection flow. We removed the "Enable Local Tracks" slider and made local uploads directly accessible in the beat dropdown by default.

### Visual Overhaul

- Direct Access: Removed the "Enable Local Tracks" slider. Local tracks are now always available in the beat dropdown.
- UI Cleanup: Simplified the Difficulty Selection interface.

---

## v0.7.6 - Visual Rhythm (2026-01-10)

**"The Heartbeat Update"**

Refining the visual language with a pro-level waveform for uploads and restoring the classic Heart icon for favorites.

### Visual Overhaul

- Heart Restoration: Replaced the checkmark with a proper Heart icon for favoriting beats.
- Static Waveform: New SoundCloud-style visualization for beat calibration.

### New Features

- Precision Cue Points: Click or drag anywhere on the new full-width waveform to set your start point instantly.

---

## v0.7.5 - XP Tuner (2026-01-10)

**"The Final Polish"**

A critical quality-of-life update focusing on the "gamification feel" and eliminating session friction. We rebalanced the XP system and cleaned up the victory screen.

### Fixes & Improvements

- XP Rebalance: Shifted to action-based XP (10 XP/word + 1 XP/sec).
- Upload Core: Fixed "Failed to create upload URL" error.
- Victory Screen: Removed redundant "VICTORY" header.
- Display Timing: Word prompt waits for countdown.
- Exit Safety: Added "Leave Session?" confirmation modal.
- Ghost Voices: Fixed TTS persisting after navigation.

---

## v0.7.4 - Secure Flow (2026-01-10)

**"The Safety Update"**

Protecting session data with stricter recording safety checks and ensuring reliable playback for deep-dives.

### New Features

- Track Change Safety: Changing beats during a recording now asks for confirmation, preventing accidental session loss.

### Fixes & Improvements

- Recording Review: Fixed playback failures in the detailed review page by implementing signed secure URLs.
- Achievement Text: "Legacy Milestone" is now correctly labeled as "Achievement Unlocked!".

---

## v0.7.3 - Studio Prime (2026-01-10)

**"The Studio Perfected"**

Refined the studio interaction with intelligent defaults and mixed audio downloads for a complete production workflow.

### New Features

- Mixed Audio Download: Downloading a recording now intelligently merges the voice and beat into a high-quality WAV file.
- Studio Defaults: "Studio FX" Reverb is now ON by default for instant professional sound.

### Fixes & Improvements

- Beat Volume Slider: Fixed a critical bug where adjusting the beat volume would stop playback.
- Recording Playback: Recordings now properly play both the voice track and the beat track in sync.
- Studio Tools Visibility: Specialized tools are now open by default for easier discovery.

---

## v0.7.2 - Cinema VeritÃƒÂ© (2026-01-10)

**"The Video Studio"**

Introduced a dedicated Video Export Studio page and refined the gamification UI for clarity.

### New Features

- Video Export Studio: A dedicated page for creating high-fidelity video exports of your sessions.
- Random Difficulty: Level 4 is now fully live, mixing words from all difficulty tiers.

### Visual Overhaul

- UI Clarity: Renamed "Difficulty Selection" to "Freestyle Session" and removed cluttered widgets.
- Real-Time Streaks: Fixed gamification displays to show live user data instead of placeholders.

---

## v0.7.1 - Liquid Metal (2026-01-10)

**"The Mobile Polish"**

Transformed the Settings menu for mobile, improved navigation flow, and fixed the "Double Beat" upload bug.

### Visual Overhaul

- Collapsible Studio Controls: Audio settings are now tucked into a sleek accordion to save screen space.
- Compact Support Grid: Support links rearranged into a touch-friendly grid layout.
- Universal Back Navigation: Added back buttons to Terms, Privacy, and Calibration pages.

### Fixes & Improvements

- Duplicate Prevention: Fixed a bug where uploading a beat would show it twice in the list.
- Admin Restoration: Superadmins can once again upload directly to the public library.
- User Beat Upload: Added a clear "X" close button to the upload modal.

---

## v0.7.0 - Master Control (2026-01-10)

**"The Admin Update"**

Empowering Super Admins with full control over the beat library: curation, editing, and monetization.

### New Features

- Admin Dashboard: New /admin/beats interface for managing the platform catalog.
- Beat Reordering: Curate the playlist order with simple Up/Down controls.
- Metadata Editing: Fix typos or update Beat details (BPM, Artist, Genre) on the fly.
- Monetization Toggle: Instantly switch tracks between FREE and PRO tiers.

### Fixes & Improvements

- Beat Dropdown UI: Moved the Favorite (Heart) icon to the right for a cleaner list view.
- Database Sync: Added sortOrder support for persistent custom playlists.

---

## v0.6.2 - Pure Flow (2026-01-10)

**"The Zero State"**

Achieved a "Zero Problem" build state, perfected audio loop handling, and finalized admin tools.

### Fixes & Improvements

- Concurrent Playback: Implemented "Single Source of Truth" audio logic. Only one track plays at a time.
- Gapless Looping: Eliminated the restart gap in SessionPlayer and RecordingCard loops.
- Build Stability: Resolved the known lint warnings and type errors for that release baseline. Current builds may still pass with known Sentry/OpenTelemetry critical dependency warnings.
- Admin Management: Fixed Beat Reordering and Upload tools.

---

## v0.6.1 - Visual Flow (2026-01-10)

**"The Waveform Update"**

SoundCloud-style waveform overhaul with tap-to-seek functionality and integrated review visualization.

### Visual Overhaul

- SoundCloud-Style Waveform: Two-tone coloring system (Purple Played / White Unplayed) across the entire platform.
- Integrated Review Waveform: A high-fidelity waveform has replaced the basic progress bar in the Session Review Studio.

### Fixes & Improvements

- Global Tap-to-Seek: Jump to any timestamp instantly by tapping the waveform in both upload and review modes.
- Calibration Marker: Restored the red "START" bar visibility during beat upload playback.
- Cue Point Mastery: Playback now correctly honors and starts from the defined cue point in the upload window.
- UI Cleanup: Removed the redundant "Test Start Point" button for a more streamlined calibration experience.

---

## v0.6.0 - Platinum Record (2026-01-09)

**"The Studio Update"**

Major release consolidating our audio engine overhaul, visual intensity updates, and the highly requested Studio Quality Export.

### New Features

- Production Export: Download sessions with "Studio FX" (Reverb & Polish) baked in.
- Visual Intensity: Dynamic "Cop Siren" and Shake effects warn you of upcoming word changes.
- Guest Restoration: Unsaved guest sessions are now automatically restored after login.

### System Updates

- Audio Engine 2.0: Complete rewrite aiming for zero-latency start times on all devices.
- Security Lock: Integrity checks now prevent beat ripping by enforcing vocal volume rules.
- Safari Support: "Mute-Prime-Play" strategy guarantees playback reliability on iOS.

### Fixes & Improvements

- XP System: Fixed issue where XP/Levels would sometimes display as 0 after a session.
- Navigation: Standardized "Back" gestures across Review and Recording pages.
- Safety Nets: Added exit confirmations to prevent accidental data loss during practice.

---

## v0.5.9 - Final Polish (2026-01-09)

**"The Final Polish"**

Resolved user-reported friction points in the practice session, including upload errors, exit confirmation, and precise timing logic.

### Fixes & Improvements

- Upload Error: Fixed "Failed to create upload URL" by correcting bucket reference.
- Exit Confirmation: Added modal to prevent accidental session loss.
- Word Randomization: Ensured sessions start with random words every time.
- Display Timing: Word prompt waits for "GO" before appearing.
- TTS Cleanup: Speech stops immediately on navigation.

---

## v0.5.8 - High Intensity (2026-01-09)

**"Sirens & Intensity"**

Added high-intensity visual warnings before word changes.

### Visual Overhaul

- Implemented "cop siren" alternating red/blue ring effects
- Added background pulsing and word shake animations during warnings
- Configured sirens to trigger 4s before every other word change

---

## v0.5.7 - Direct Flow (January 09, 2026)

**"The Direct Flow"**

Refined session handoff logic and streamlined Victory screen for a more direct post-session experience.

### Fixes & Improvements

- Session Termination: Fixed loop bugs where beats wouldn't stop after session end.
- Auto-Summary: Guaranteed modal trigger on session completion.
- Victory UI: Removed "Menu" button and centered "Continue" for a streamlined flow.

---

## v0.5.6 - Back to Basics (January 09, 2026)

**"The Stable Circle"**

Restored core practice UI and hardened architecture against serialization errors.

### Fixes & Improvements

- Props Sanitized: Resolved persistent Next.js warnings about non-serializable props.
- UI Restoration: Reverted Practice Studio to original circular design.
- BeatDropdown: Embedded and retracted by default in practice mode.

---

## v0.5.5 - Perfect Sync (January 09, 2026)

**"The Zero Warning"**

Critical regressions in audio timing and synchronization resolved. At the time, the release cleared the known build-warning baseline; current builds may still pass with known Sentry/OpenTelemetry critical dependency warnings.

### Fixes & Improvements

- Audio Logic: Removed race conditions and laggy polling loops for absolute precision on start.
- Double TTS: Fixed logic bug causing the first word to repeat twice.
- Error Persistence: useBeatPlayer now clears errors on stop/restart.
- Achievements: Implemented auto-seeding to ensure milestones are always populated.
- Industrial Cleanup: Fixed the 8 build warnings known in that release baseline; later Sentry/OpenTelemetry critical dependency warnings are tracked separately as known passing-build warnings.

---

## v0.5.4 - Smooth Operator (January 09, 2026)

**"The Polish"**

Quality-of-life improvements that make the app feel more responsive and polished.

### Fixes & Improvements

- Collapsible Dropdown: Practice beat selector is now collapsible with smooth animations.
- Mic Icon Fix: Resolved rendering issues with the record button microphone icon.
- Profile Pictures: Fixed Google profile images not displaying in the sidebar/profile.
- Navigation: Improved transition flow from Vinyl Collection to Practice Studio.

---

## v0.5.3 - Second Wind (January 09, 2026)

**"The Resurrection"**

Critical fixes for audio playback, authentication loops, and UI visibility. The app was broken; now it works.

### Fixes & Improvements

- Audio Engine: Implemented "Mute-Play-Unmute" strategy for guaranteed playback on Safari/Mobile.
- Auth Redirect Loop: Removed edge middleware protection for Profile/Recordings routes.
- Record Button: Fixed invisible "REC" button by changing black-on-black styling to white.
- Layout Overlap: Reduced min-height on Practice page to prevent bottom nav overlap.
- Cypher Mode (mock shell): Created mock room creation API and lobby page. This remains a non-production shell and is superseded by the current local pass-the-phone cypher practice flow.
- Tracks Fallback: Added client-side fallback beats if API fails.

### System Updates

- Audio Player Debugging: Added comprehensive lifecycle logging.
- Grace Period: Session won't stop before 1.5s to prevent instant-death glitches.
- Optimistic UI: Play state updates immediately for faster feedback.

---

## v0.4.0 - Diamond Cutter (December 21, 2025)

**"The Platinum Polish"**

The final layer of sheen. We heard your feedback and have refined the core experience. This update brings user beat uploads, a completely revamped layout, and critical stability fixes.

### New Features

- User Beat Uploads: Pro users can now upload, calibrate, and manage their own instrumental tracks directly from the Tracks page.
- Beat Vault: Added tabs for "Public Tracks" and "My Tracks" for easier library management.
- Achievements System: The "Leaderboard" is now "Achievements", featuring 100+ Overwatch 2 style medals.
- Classic Mode: Restored the beloved central-player layout for the Practice Studio.

### Fixes & Improvements

- Windows Support: Resolved all file-system encoding issues for a smoother dev experience.
- Search & Filters: Fixed all filtering logic on the Tracks page.
- Performance: Optimized asset loading for instant playback.
- Visuals: Standardized font usage (Inter/JetBrains Mono) and removed visual clutter.

---

## v0.3.0 - Level Up (December 20, 2025)

**"The Gamification Update"**

Turn your practice into a game. We have introduced a robust streak system, XP progression, and a battle-pass style rewards track to keep you motivated.

### New Features

- Streak System: Track your daily consistency with fire and ice visual indicators.
- XP Battle Pass: Earn XP for every minute you flow and unlock tier rewards.
- Zen Mode: Toggle off all gamification elements when you just need to focus.

### System Updates

- Offline Support: Optimistic UI updates ensure your progress counts even if the connection drops.
- Safe Area Wrapper: Optimized layout for modern mobile devices (Notches/Dynamic Islands).

---

## v0.2.1 - Infinite Loop (December 18, 2025)

**"The Perfectionist"**

Reaching for the peak. This update completes the "Bible" requirements with a focus on deep practice mechanics, better progression tracking, and dynamic social sharing.

### New Features

- Word "Bag System": New shuffle algorithm ensures no word repeats until the entire 500-word set is exhausted.
- Stat Card Sharing: Export your sessions as custom PNG images shaped for social media stories.
- Random Mode: A new "Dice" button to instantly shake up your practice setup.
- Bug Reporting: Direct feedback link integrated into the settings dropdown.

### System Updates

- Advanced Badge Logic: "Perfectionist", "The Listener", and "Machine Gun" badges are now fully automated.
- Beat Preloading: Start buttons now wait for audio assets to be fully ready before allowing entry.
- Panic Penalty: Skips now correctly impact your Flow Density score.

---

## v0.1.8 - Arena of Voices (December 14, 2025)

**"The Social Awakening"**

Historical note: this early release described an intended social surface. Current FreeStyla is practice-first; public profile basics exist, but feed, follow graph, voting, notifications, and live social duels are not current live product scope.

### New Features

- The Global Feed (retired/not current): A feed route is not implemented in the current app.
- Duels System (historical/not live): Duel shells exist, but live asynchronous battles and ranked behavior remain non-live/currently marked as coming soon.
- Public Profiles (limited current scope): Public profile pages can show user basics and recent flows, but duel history and social graph-backed stats are not implemented.
- Follow System (retired/not current): Follow/following behavior is not backed by current routes or Prisma models.

### System Updates

- Voting Mechanics (retired/not current): Vote APIs and vote persistence are not implemented in the current app.
- Notification Infrastructure (retired/not current): Notification persistence and delivery are not implemented in the current app.

---

## v0.1.7 - Crystal Clarity (December 14, 2025)

**"The Polish & The Pragmatic"**

Before the gates opened, the world had to be perfected. This update focused on squashing the bugs that hid in the shadows and refining the experience to a mirror shine.

### Fixes & Improvements

- Mobile responsiveness overhauled for seamless flow on all devices.
- Navigation refined for intuitive movement through the app.
- Performance optimizations to ensure the beat never skips.

---

## v0.1.5 - Royal Ascension (December 11, 2025)

**"The Purple Void"**

A shift in the visual spectrum. The old Orange has faded, replaced by the regal FreeStyla Purple (#7D7AFF). This massive design overhaul redefined the aesthetic of the entire platform.

### Visual Overhaul

- New Color System: All UI elements migrated to the new Purple Design System.
- Premium Indicators: Gold badges now mark the elite features.
- Dark Mode Perfection: Contrast and shadows tuned for late-night studio sessions.

### Premium Features

- Subscription Foundations: The groundwork for Pro accounts has been laid.
- Exclusive Beats: 8 new high-fidelity beats added to the vault.

---

## v0.1.4 - Memory Keepers (November 11, 2025)

**"The Vault"**

The ability to capture time. Emcees can now save their sessions to the cloud, building a library of their lyrical evolution.

### New Features

- Cloud Storage: Secure uploads to Supabase Storage.
- Recording Library: A dedicated space to manage, rename, and download tracks.
- Auto-Save: Sessions save automatically upon completion.
- Delete Policy: Automated cleanup ensures the storage eco-system remains healthy.

---

## v0.1.3 - Sonic Boom (November 11, 2025)

**"Echoes of the Beat"**

The core engine roars to life. The audio system was finalized, bringing low-latency playback, perfectly synchronized word prompts, and the visual feedback of the Timer Ring.

### New Features

- The Practice Studio: The heart of FreeStyla. A fully immersive freestyle environment.
- Timer Ring: A visual representation of time, looping perfectly with the beat.
- Word Prompts: Dynamic words that challenge your flow in real-time.
- Audio Recorder: Browser-based recording with waveform visualization.

---

## v0.1.1 - The Foundation (November 10, 2025)

**"Genesis"**

In the beginning, there was code. The infrastructure was forged from the void.

### System Updates

- Next.js 14 initialized.
- Database connected (Supabase & Prisma).
- Authentication secured (Google OAuth).
- Design System established (Tailwind CSS).

---

_Generated automatically from lib/data/patch-notes.ts_
