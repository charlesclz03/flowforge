# Practice Reliability Audit

**Date:** 2026-05-18
**Target Release:** v1.1.6
**Status:** Complete

## Objective

Make v1.1.6 a focused practice-quality release after the v1.1.5 Enterprise UI Remediation baseline. The release should improve confidence in the multilingual prompt loop, spoken-prompt fallback behavior, recording lifecycle clarity, review waveform fallback, and private beat upload adapter without changing public API contracts or database schema.

## Current Repo Findings

- v1.1.5 is now the committed baseline for UI/accessibility remediation.
- Prompt queue, anti-rhyme, and language handoff are already covered by focused unit tests under `__tests__/words/` and `__tests__/hooks/usePracticeEngine-tts.test.tsx`.
- TTS adapter boundaries live in `hooks/useTTS.ts` and `lib/tts/speech-engine.ts`; Easy Speech is optional and native `speechSynthesis` remains the fallback path.
- Review waveform fallback is isolated in `components/molecules/review/ReviewWaveform.tsx`, which can recover to the existing canvas scrubber.
- Private beat upload uses `lib/uploads/beat-upload-client.ts` with signed PUT as the default path and opt-in Uppy/Tus as a resumable path.
- Recording state clarity spans `hooks/player/usePracticeEngine.ts`, `/api/recordings`, `/api/session/complete`, `components/organisms/recordings/RecordingCard.tsx`, and `/review/[id]`.

## Completed Release Work

- Added focused adapter validation for Easy Speech speak/warmup failure recovery to native speech.
- Added review waveform validation for runtime Wavesurfer error fallback, not only constructor failure.
- Added beat upload validation for signed URL ticket failures and signed PUT storage failures.
- Added deterministic EN/FR/PT prompt queue checks for 2-bar and 4-bar fallback sessions.
- Added shared TTS fallback copy for text-only, loading, unsupported, and fallback voice states.
- Added shared recording lifecycle copy for audio-ready, audio-processing, and stats-only practice states.
- Added sanitized telemetry assertions for prompt queue fallback, metadata-only recording fallback, and beat upload failure events.
- Added mocked Uppy/Tus validation and authenticated Playwright setup smoke coverage.

## Recommended Next Slices After v1.1.6

1. Production-smoke authenticated practice, recordings, review, upload, and admin states on real desktop/mobile browsers.
2. Expand language-aware word dictionaries and per-language anti-rhyme quality beyond fallback-pack validation.
3. Add production dashboards/alerts for practice pipeline failures, processing delays, and upload adapter failures.
4. Validate Android/TWA packaging and real-device audio behavior.

## Verification

- `npm run lint`
- `npx tsc --noEmit`
- `npm run docs:check`
- `npm run build`
- `npm run test -- --run`
- `npm run test -- --run __tests__/tts/speech-engine.test.ts __tests__/review/ReviewWaveform.test.tsx __tests__/uploads/beat-upload-client.test.ts`
- `npx playwright test e2e/practice.spec.ts`
- `npx playwright test e2e/enterprise-ui-regression.spec.ts`
