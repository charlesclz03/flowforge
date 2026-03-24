# Prompt Engine - Matrix Feature Audit
**Date**: 2026-03-24
**Feature**: Prompt Engine
**Matrix Area**: Core Practice
**Tier**: All
**Status**: PASS

## Scope
- `hooks/player/usePracticeEngine.ts`
- `lib/words/session-queue.ts`
- `lib/db/words.ts`
- `app/api/words/random/route.ts`
- `lib/data/fallbacks.ts`
- `prisma/seed.ts`
- `app/api/user/profile/route.ts`
- `app/api/user/profile/username-availability/route.ts`
- `app/auth/continue/page.tsx`
- `app/complete-profile/**/*`

## What Was Failing
1. The old prompt runtime still depended on `WordGenerator`, which clears its used-word set after pool exhaustion and can repeat words inside the same session.
2. `usePracticeEngine` also filtered the pool through recent localStorage history, shrinking the available prompt set before a session even started.
3. The local database only had `en-US` prompt rows, so French and Portuguese sessions were falling back to very small local dictionaries.
4. On iPhone and iPad, Safari/WebKit speech playback ducks other audio, so spoken prompts were lowering beat volume during practice.

## Forever Fix Applied
1. Replaced recycle-on-exhaustion prompt generation with a prebuilt session queue from `lib/words/session-queue.ts`.
2. Added exclusion-aware word fetching so queue top-ups request fresh same-language prompts instead of reusing already-seen ones.
3. Expanded French and Portuguese fallback/seed inventories to `36/36/38` prompts per difficulty band and reseeded the database.
4. Added `/auth/continue` and `/complete-profile`, plus a required first-time profile-completion gate after Google OAuth.
5. Forced iPhone/iPad practice to text-only prompts while keeping non-iOS spoken prompts unchanged.

## Validation
- `npx.cmd vitest run __tests__/words/session-queue.test.ts __tests__/auth/paths.test.ts __tests__/auth/require-user-session.test.ts __tests__/auth/username.test.ts __tests__/tts/platform.test.ts __tests__/api/profile-route.test.ts __tests__/api/username-availability.test.ts __tests__/hooks/useDevice.test.tsx`
- `npm.cmd run lint`
- `npx.cmd tsc --noEmit`
- `npm.cmd run build`
- `npm.cmd run docs:check`
- DB seed verification after `npx.cmd prisma db seed`: `fr-FR` and `pt-PT` now each have `36/36/38` prompt rows by difficulty.

## Verdict
- Current `HEAD` is the best version of this feature to date.
- Remaining watch item: `usePracticeEngine.ts` is still a large orchestration hook, but the repeat-prone word selection logic now lives in a pure queue helper with dedicated tests.

## Master-Project Reuse Note
- Reused the async username-availability validation pattern from `master-project` (`useAsyncValidation`) and intentionally did not port unrelated auth/audio scaffolding.
