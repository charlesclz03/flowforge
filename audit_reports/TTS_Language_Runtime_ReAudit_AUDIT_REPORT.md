# TTS Language Runtime ReAudit - Forensic Audit Report
**Date**: 2026-02-19
**Feature**: Language Runtime (TTS)
**Scope**: `hooks/useTTS.ts` `lib/tts/voice-picker.ts` `lib/tts/languages.ts` `hooks/player/usePracticeEngine.ts` `contexts/SessionContext.tsx` `app/difficultyselection/DifficultySelectionClient.tsx` `app/practice/PracticeClient.tsx` `app/practice/page.tsx` `__tests__/tts/useTTS-language.test.ts` `__tests__/tts/voice-picker.test.ts`

## 1. Executive Summary
- Status: FAIL
- User symptom validated: French prompts can still fail in production conditions even after the previous fallback patch.
- Root cause: there is a remaining silent path when `speechSynthesis.getVoices()` never resolves with voices. In that state, `voiceStatus` remains `loading` and the fallback language contract is never engaged.
- Scope impact: highest on non-default locales (`fr-FR`, `pt-PT`), lower on `en-US`.

## 2. Cross-Language Verification (EN/FR/PT)
Checks performed:
1. Static code path review for alias resolution and voice selection.
2. Unit test run:
   - `npm.cmd run test -- __tests__/tts/useTTS-language.test.ts __tests__/tts/voice-picker.test.ts`
3. Lint run on scoped files:
   - `npx.cmd eslint ...` (warnings only; no errors).

Results:
- `en-US`: PASS in nominal path (matching voice or default engine fallback).
- `fr-FR`: FAIL risk remains in zero-voices path.
- `pt-PT`: FAIL risk remains in zero-voices path.

Why:
- `useTTS` sets `voiceStatus` to `loading` and only transitions when `voices.length > 0` (`hooks/useTTS.ts:73`, `hooks/useTTS.ts:77`, `hooks/useTTS.ts:84`).
- `resolveUtteranceLanguage` only activates fallback logic when `voiceStatus === 'fallback'` and there is an `activeVoice` (`hooks/useTTS.ts:25`).
- If voices never load, `speak()` and `warmup()` still run with locale forcing but no chosen voice (`hooks/useTTS.ts:111`, `hooks/useTTS.ts:135`).
- Admin `testVoice()` bypasses `useTTS` fallback logic entirely and directly forces `u.lang = state.selectedLanguage` (`contexts/SessionContext.tsx:321`, `contexts/SessionContext.tsx:327`).

## 3. Forensic Metrics
From repository forensic script:
- Total commits in scope: 155
- Hotfix ratio: 74/155 (47.7%)
- Churn hotspots: 2026-02, 2026-01, 2025-12
- Circular refactor signals: repeated `sync`, `save`, `auth`, `timer` topics

## 4. Hall Of Fame (Version Scoring)
Weighted model: Stability 40%, Cleanliness 30%, Performance 30%.

| Version / Commit | Stability | Cleanliness | Performance | Score | Notes |
| --- | --- | --- | --- | --- | --- |
| `9e3e75b8` (v1.0.2) | 32 | 24 | 24 | 80 | Introduced multilingual routing + voice status model |
| `38ee6347` (current) | 28 | 24 | 24 | 76 | Added fallback `utterance.lang` contract and warmup; zero-voices edge still open |
| `18fb5dbe` (v0.9.85) | 18 | 20 | 19 | 57 | Initial hook restore, no language-specific fallback model |
| `5773e2be` (v0.9.84) | 20 | 18 | 19 | 57 | TTS restored with broader instability period |
| `d91c1fa1` | 14 | 16 | 16 | 46 | Critical regression era (audio + TTS churn) |

## 5. The Crimes
1. Unhandled zero-voices runtime branch.
   - `hooks/useTTS.ts` never exits `loading` if `getVoices()` remains empty.
   - This keeps non-default locales in a fragile path.
2. Split TTS contracts.
   - Main runtime uses `useTTS`, but admin/test path in context bypasses fallback voice/lang logic.
3. Missing regression test coverage for the exact failure mode.
   - Existing tests validate fallback-with-activeVoice only, not fallback-with-no-voices.

## 6. Verdict
Current `HEAD` is not the best TTS language runtime state. The previous fix removed one known failure mode, but French and Portuguese can still fail on browsers/devices where voices never populate.

## 7. Forever Fix Plan
See `brain/TTS_LANGUAGE_RUNTIME_FIX_PLAN_2026-02-19.md`.
