# Enterprise UI Audit and Remediation Plan

Purpose:

- document the 2026-05-18 whole-app enterprise UI audit
- define the four implementation phases used for remediation
- provide a reusable UI quality checklist for future FlowForge work

Audience:

- maintainers
- coding agents
- product/design reviewers

Status:

- active

Source of truth scope:

- UI audit findings, remediation priorities, and UI regression expectations

Last updated:

- 2026-05-18

Related docs:

- `DOCS/reference/FEATURE_MATRIX.md`
- `DOCS/reference/PATCH_NOTES_MASTER.md`
- `DOCS/testing/TESTING_PLAN_V3.md`
- `DOCS/project/PROJECT_STATUS.md`

## Executive Summary

FlowForge / FreeStyla already has a strong dark, audio-first product identity and solid route coverage. The audit found that the remaining enterprise gap was not a single broken screen, but a set of system debts: primary CTA contrast, incomplete dialog semantics, hover-heavy beat actions, fragile global responsive CSS, dense mobile setup surfaces, and inconsistent accessibility states.

The v1.1.5 remediation release completes the accessibility/design-token foundation, mobile/touch recovery, remaining dialog hardening, route-level polish, admin/legal/offline refinement, and regression-governance coverage while preserving the FreeStyla identity.

## Methodology

Local project context was loaded through `.agent/workflows/load_context.md`; implementation used `.agent/workflows/layout_audit.md` as the single workflow. Relevant design guidance came from local FlowForge, frontend-design, mobile-design, web-design-guidelines, tailwind-patterns, and shadcn/component guidance.

Routes audited:

- Public funnel: `/`, `/howitworks`, `/pricing`, `/download`, `/login`, `/signup`
- Practice: `/difficultyselection`, `/practice`
- Beat Vault: `/tracks`, upload modal, beat dropdown, locked/pro states
- Account/review/settings: `/recordings`, `/review/[id]`, `/settings/latency`, `/profile`
- Support/docs/legal: `/patch-notes`, `/feedback`, `/legal`, `/legal/privacy`, `/legal/terms`, `/offline`
- Admin where safely testable: `/admin`, `/admin/beats`, `/admin/users`, `/admin/feedback`

Viewports audited:

- Desktop `1440x1000`
- Tablet `768x1024`
- Mobile `390x844`

Research references:

- WCAG 2.2 contrast, focus, and target-size guidance
- WAI-ARIA Authoring Practices for dialogs and interactive controls
- Material Design navigation/accessibility guidance
- Apple HIG safe-area and touch guidance
- web.dev PWA app-design guidance
- Vercel Web Interface Guidelines

## Current UI Strengths

- Clear FreeStyla identity: dark, focused, musical, premium, and practice-first.
- Strong app-shell architecture with safe-area variables, route-aware header, and mobile bottom dock.
- Practice setup and practice session are visually distinct and task-focused.
- Beat Vault, recordings, review, settings, feedback, and legal routes already expose loading/empty/protected-state surfaces.
- Existing tests cover route reachability, protected redirects, mobile practice startup, feedback accessibility, docs governance, and patch-note synchronization.

## Critical Findings

1. Primary action contrast failed WCAG AA when white text was placed on `#7D7AFF`.
2. Shared modals lacked complete dialog semantics, Escape handling, focus trapping, and focus restoration.
3. Beat Vault card actions depended too heavily on hover overlays, making mobile discovery weak.
4. Beat Dropdown used clickable containers for list rows and action icons instead of semantic controls.
5. Global height-based CSS rewrote common Tailwind spacing and text utilities, creating cross-route regression risk.

## Route Findings

- `/howitworks`: strong funnel story; CTA copy needed to be clearer than `Start`; decorative card density should stay restrained.
- `/pricing`: clear plan framing; primary CTA contrast was the main issue.
- `/download`: platform-aware copy was strong; mobile header and install modal actions needed contrast-safe buttons.
- `/login` and `/signup`: low-friction auth surfaces; Google/guest choices are clear.
- `/difficultyselection`: powerful setup console; mobile density is high but manageable with stable targets and clearer active states.
- `/practice`: memorable stage and good containment; decorative motion needed reduced-motion gating and recording-mode labeling needed semantic clarity.
- `/tracks`: feature-rich Beat Vault; touch users needed persistent or visible action affordances.
- Upload modal: capable workflow; file input, calibration preview, cue-point copy, and optional producer fields needed accessibility polish.
- `/recordings` and `/review/[id]`: protected and stats/audio states are well structured; private deep-link continuity should remain covered.
- `/settings/latency`: strong calibration tool; profile buttons, range control, and sync feedback needed explicit accessible state.
- `/feedback`: good form structure and rating coverage; success/error messaging needed screen-reader status and copy cleanup.
- `/patch-notes`: readable timeline; decorative motion needed reduced-motion support and the return link needed touch-safe sizing.
- Legal pages: readable but should stay calm, document-like, and free of unnecessary app-shell clutter.
- Admin routes: guest redirects are safe; authenticated admin surfaces should continue moving toward shared table/action primitives.

## Component/System Findings

- `Button`, `Surface`, `IconFrame`, and shared app-shell primitives are the right foundation.
- Dialogs, icon-only actions, form fields, segmented controls, tables, premium gates, empty states, and skeletons need stricter reuse rules.
- Hover-only behavior is acceptable for secondary desktop affordance, but never for a primary mobile action.
- Motion should communicate rhythm or state, not decorate every surface.

## Four-Phase Roadmap

### Phase 1: Accessibility and Design-Token Foundations

- Add semantic tokens for primary foreground, premium, locked, success, warning, danger, raised surfaces, and subtle borders.
- Fix primary CTA contrast by using dark foreground text on FreeStyla purple.
- Upgrade shared modal semantics and focus behavior.
- Replace fragile global responsive utility rewrites with opt-in compact classes.
- Add ARIA labels/states to calibration, slider, playback, and locked/pro controls.

### Phase 2: Mobile, TWA, and Touch Interaction Recovery

- Add visible bottom-nav labels while preserving five destinations.
- Ensure app-shell controls use 44px+ hit areas.
- Make Beat Vault and Beat Dropdown actions visible and semantic on touch devices.
- Improve upload modal focus, file input labeling, preview labeling, and cue-point copy.
- Gate decorative Framer Motion animations with reduced-motion preference.

### Phase 3: Route-Level Enterprise Polish

- Tighten public CTA labels and reduce low-value decorative noise.
- Keep practice setup scannable on small screens.
- Harden practice CTA text fitting and recording-mode labels.
- Improve feedback success/error announcements and patch-note link sizing.
- Keep legal/support pages calm and trust-forward.

### Phase 4: Regression Coverage and Governance

- Add Playwright coverage for modal semantics, mobile nav labels, Beat Vault controls, upload accessibility, reduced motion, feedback success state, and protected/admin redirects.
- Keep `DOCS/reference/FEATURE_MATRIX.md`, `DOCS/reference/PATCH_NOTES_MASTER.md`, and `lib/data/patch-notes.ts` synchronized.
- Run lint, typecheck, unit tests, docs checks, and targeted Playwright route checks before closing the remediation wave.

## Remediation Status

v1.1.5 completed:

- semantic primary/on-primary design tokens and AA-safe primary CTA pairing
- shared modal dialog semantics, Escape handling, focus trap, and focus restoration
- mobile bottom-nav labels and touch-safe app-shell control sizing
- Beat Vault touch affordances, Beat Dropdown semantic rows, upload/calibration labels, and initial reduced-motion coverage
- first enterprise UI unit and Playwright regression coverage
- remaining dialog-like surfaces: pause, rate-app, support success overlay, session summary, and studio FX controls
- remaining reduced-motion handling for decorative post-session/reward/support surfaces
- public funnel CTA contrast cleanup, offline retry trust copy, semantic legal index links, and constrained legal reading layouts
- admin dashboard/table/card polish for loading, empty, error, action, and mobile fallback states
- safe Playwright auth fixtures for free/pro/superadmin sessions and mocked admin/recordings/review coverage
- version, patch-note, feature-matrix, roadmap, testing-plan, and settings-display synchronization for the combined v1.1.5 release

Remaining intentional debt:

- full payment and destructive admin mutation paths remain excluded from UI automation unless explicitly mocked
- additional screenshot baselines beyond the stable legal/offline trust surfaces should be added only once the target pages have deterministic data masks in CI
- deeper design-system extraction for admin tables can continue after this release without changing API or database contracts

## Shared Component Usage Rules

- Buttons: use `Button` for visible actions and `IconButton` for icon-only actions; every icon-only control needs a stable accessible name and at least a 44px target.
- Dialogs and sheets: use the shared `Modal` unless a component exactly matches dialog role, label, Escape, focus trap, backdrop, and focus restoration behavior.
- Fields: labels must be programmatically associated; sliders need explicit names and current-value state where the native control does not already expose it.
- Segmented controls and toggles: use `aria-pressed`, `aria-selected`, or radio/listbox semantics according to the interaction model.
- Tables: desktop admin tables must have mobile fallback cards or another small-screen representation with the same primary actions.
- Cards: cards can group repeated items, but links/actions inside cards must remain semantic and keyboard-visible.
- Empty/loading/error states: every data route needs explicit status/error surfaces, not silent blank space.
- Skeletons: use skeletons only when they preserve layout; do not introduce shimmer or pulse in reduced-motion mode.
- Premium gates: locked/pro states must explain the blocked action and expose a touch-visible upgrade path.
- Admin actions: edit/reorder/delete/save/cancel actions require accessible names, touch-safe targets, and confirmation for destructive work.

## UI Quality Checklist

- Contrast: normal text and button labels meet WCAG AA.
- Target size: tappable app controls are at least 44px in both axes.
- Focus: every keyboard-reachable control has visible focus.
- Semantics: dialogs, buttons, sliders, tabs, forms, and menus expose correct roles/names/states.
- Reduced motion: decorative animation is disabled or flattened when requested.
- Mobile safe area: header, dock, sheets, and fixed controls avoid notches/home indicators.
- Text overflow: mobile headers, buttons, cards, and circular controls do not clip meaningful text.
- Hover independence: touch users can discover every primary action without hover.
- State design: loading, empty, error, disabled, locked, success, offline, unauthenticated, Free, and Pro states are explicit.
- Governance: user-visible UI changes update patch notes, feature matrix, and regression coverage.

## Evidence Classification

Findings from local code/docs:

- route inventory, shared primitives, token definitions, app-shell variables, modal implementation, audit history, feature matrix, and patch-note governance

Findings from browser/testing:

- route smoke behavior, protected redirects, horizontal overflow checks, mobile target/label risks, and existing Playwright coverage

Findings from live research:

- WCAG target/contrast/focus requirements, ARIA dialog expectations, Material bottom navigation labeling, Apple safe-area/touch guidance, and PWA app-design expectations

Inferences/recommendations:

- authenticated recordings/review/profile/admin surfaces were partially inferred from code because destructive or private-data testing was avoided
- admin responsive polish should continue as a dedicated follow-up once safe mocked authenticated fixtures exist
