# Practice Reliability Audit

**Date:** 2026-05-18
**Target Release:** v1.1.6
**Status:** In progress

## Objective

Make v1.1.6 a focused practice-quality release after the v1.1.5 Enterprise UI Remediation baseline. The release should improve confidence in the multilingual prompt loop, spoken-prompt fallback behavior, recording lifecycle clarity, review waveform fallback, and private beat upload adapter without changing public API contracts or database schema.

## Current Repo Findings

- v1.1.5 is now the committed baseline for UI/accessibility remediation.
- Prompt queue, anti-rhyme, and language handoff are already covered by focused unit tests under `__tests__/words/` and `__tests__/hooks/usePracticeEngine-tts.test.tsx`.
- TTS adapter boundaries live in `hooks/useTTS.ts` and `lib/tts/speech-engine.ts`; Easy Speech is optional and native `speechSynthesis` remains the fallback path.
- Review waveform fallback is isolated in `components/molecules/review/ReviewWaveform.tsx`, which can recover to the existing canvas scrubber.
- Private beat upload uses `lib/uploads/beat-upload-client.ts` with signed PUT as the default path and opt-in Uppy/Tus as a resumable path.
- Recording state clarity spans `hooks/player/usePracticeEngine.ts`, `/api/recordings`, `/api/session/complete`, `components/organisms/recordings/RecordingCard.tsx`, and `/review/[id]`.

## First Slice Completed

- Added focused adapter validation for Easy Speech speak/warmup failure recovery to native speech.
- Added review waveform validation for runtime Wavesurfer error fallback, not only constructor failure.
- Added beat upload validation for signed URL ticket failures and signed PUT storage failures.

## Recommended Next Slices

1. Add a production-smoke checklist for authenticated practice, recordings, review, upload, and admin states using mocked fixtures where real credentials are unavailable.
2. Add a small language-quality fixture that samples EN/FR/PT queues at 2-bar and 4-bar cadence and asserts no duplicate prompt keys within a session budget.
3. Improve recording lifecycle labels so audio recording, processing audio, and stats-only metadata are consistently named across setup, post-session save, recordings, and review.
4. Add telemetry assertions around existing `trackReliabilityEvent` calls for prompt queue top-up/fallback and metadata-only recording fallback.
5. Validate Uppy/Tus behavior behind `NEXT_PUBLIC_ENABLE_SUPABASE_TUS_UPLOADS` with mocks before recommending any production enablement.

## Verification

- `npm run lint`
- `npx tsc --noEmit`
- `npm run docs:check`
- `npm run test -- --run __tests__/tts/speech-engine.test.ts __tests__/review/ReviewWaveform.test.tsx __tests__/uploads/beat-upload-client.test.ts`
- For broader v1.1.6 closure: `npm run test -- --run`, `npx playwright test e2e/practice.spec.ts`, and `npx playwright test e2e/enterprise-ui-regression.spec.ts`.
