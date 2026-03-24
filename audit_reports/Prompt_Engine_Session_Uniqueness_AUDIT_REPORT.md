# Prompt Engine Session Uniqueness - Forensic Audit Report
**Date**: 2026-03-24
**Scope**: `hooks/player/usePracticeEngine.ts`, `lib/words/*.ts`, `lib/data/fallbacks.ts`, `prisma/seed.ts`, `app/api/words/random/route.ts`, `app/api/user/profile/**/*.ts`, `app/auth/continue/page.tsx`, `app/complete-profile/**/*`, `lib/auth/**/*.ts`, `components/organisms/settings/SettingsList.tsx`, `app/difficultyselection/DifficultySelectionClient.tsx`, `app/practice/PracticeClient.tsx`, `hooks/useDevice.ts`

## 1. Executive Summary
- **Status**: PASS
- **Why the bug happened**: repeated prompts were caused by both logic drift and data scarcity. The runtime still recycled words after pool exhaustion, and French/Portuguese sessions were often running against tiny fallback pools because the local database only had `en-US` words.
- **Forever fix applied**: practice now builds a full no-repeat queue at session start, requests exclusion-based top-ups when needed, expands same-language prompts before any fallback pressure, forces iPhone/iPad practice to text-only prompts, and requires first-time Google users to complete a real profile before entering guarded routes.

## 2. Hall of Fame
| Rank | Version / Hash | Score | Why |
| --- | --- | ---: | --- |
| 1 | 2026-03-24 working tree | 93 | First version that closes the repeat loop, backfills FR/PT data, adds explicit iOS spoken-prompt fallback, and adds regression coverage around the new auth/profile flow. |
| 2 | `v1.0.2` / `5037a703` | 82 | Strong anti-rhyme and language-runtime hardening, but the generator could still clear used words and FR/PT pools were still too small for long sessions. |
| 3 | `v0.9.1004` / `11c904cc` | 76 | Good prompt-boundary control handoff, but no hard no-repeat session contract. |
| 4 | `v0.9.84` / `5773e2be` | 61 | Stabilized TTS after a regression wave, but prompt logic still lived in a hotfix-era generator path. |

## 3. The Crimes
1. **Recycle-on-exhaustion generator**: `WordGenerator` clears its used set once a difficulty bucket is exhausted, which makes in-session repeats inevitable during longer runs.
2. **Pool shrinkage before play**: `usePracticeEngine` was also filtering prompts through recent localStorage history, shrinking the candidate pool before a session even started.
3. **Data mismatch by language**: the database had `en-US` rows only. French and Portuguese sessions therefore depended on tiny local fallback lists.
4. **iOS ducking side effect**: Safari/WebKit speech playback still ducks concurrent media, so spoken prompts were audibly lowering beat volume on iPhone/iPad.
5. **OAuth identity gap**: Google sign-in still auto-created a usable session without requiring the user to confirm their long-term handle/profile.

## 4. Current State Verification
- **Prompt budget math**: at the repo's max supported BPM (`155`) and 4-bar frequency, a 10-minute session needs `97` prompt slots. The new queue builder fills that budget without repeats.
- **DB verification after reseed**:
  - `en-US`: `77 / 60 / 59` words by difficulty.
  - `fr-FR`: `36 / 36 / 38` words by difficulty.
  - `pt-PT`: `36 / 36 / 38` words by difficulty.
- **Type safety / verification**:
  - `npm.cmd run lint`
  - `npx.cmd tsc --noEmit`
  - `npx.cmd vitest run __tests__/words/session-queue.test.ts __tests__/auth/paths.test.ts __tests__/auth/require-user-session.test.ts __tests__/auth/username.test.ts __tests__/tts/platform.test.ts __tests__/api/profile-route.test.ts __tests__/api/username-availability.test.ts __tests__/hooks/useDevice.test.tsx`
  - `npm.cmd run build`
  - `npm.cmd run docs:check`
- **Complexity note**: `usePracticeEngine.ts` is still a large orchestration hook, but the repeat-prone selection logic is now delegated to `lib/words/session-queue.ts`, which is deterministic and directly tested.

## 5. Forever Fix Applied
1. Replaced generator-driven prompt selection with a prebuilt session queue keyed by BPM, frequency, difficulty, language, and session duration.
2. Added exclusion-aware word fetching and queue rebuilds so pending prompt changes do not reset or recycle used words mid-session.
3. Expanded fallback and seed packs so French and Portuguese have enough same-language prompts to satisfy the 10-minute max-case budget.
4. Added `/auth/continue`, `/complete-profile`, username availability checks, and guarded route redirects so first-time Google users must finish profile setup.
5. Added an iOS text-only spoken-prompt fallback so beat volume remains stable on Safari/WebKit.

## 6. Master-Project Reuse Note
- Reused the async username-availability validation pattern from `master-project` (`useAsyncValidation`).
- Explicitly did **not** port unrelated auth/audio boilerplate from that repo.

## 7. Verdict
- The current version is the best version of this feature to date.
- The circular refactor loop is broken only if future changes keep the no-repeat queue pure and keep multilingual seed/fallback inventories above the prompt budget floor.
