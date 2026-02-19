# Word Prompt Random Logic ReAudit - Forensic Audit Report
**Date**: 2026-02-19
**Feature**: Prompt Engine (Random Word Logic / Repeat Walls)
**Scope**: `hooks/player/usePracticeEngine.ts` `lib/words/generator.ts` `lib/words/rhyme.ts` `lib/words/utils.ts` `lib/db/words.ts` `app/practice/page.tsx` `app/api/words/random/route.ts` `lib/data/fallbacks.ts` `__tests__/words/generator.test.ts` `__tests__/words/fallbacks.test.ts` `__tests__/words/rhyme.test.ts`

## 1. Executive Summary
- Status: FAIL
- User symptom validated: repeated prompts like `horizon`, `expression`, and `energie` are explainable by current selection order and pool size.
- Main regression: anti-repeat protection is now secondary to anti-rhyme fallback ordering, causing repeated words before exhausting fresh options in constrained pools.

## 2. What Is Happening
### A. Current selection order in `WordGenerator`
`lib/words/generator.ts` currently uses:
1. Pass A: fresh + non-rhyming (`freshNonRhyming`).
2. Pass B: any non-rhyming across full difficulty pool (`anyNonRhyming`) - this includes already used words.
3. Pass C: fallback pools.

Relevant lines:
- Pass ordering and pool selection: `lib/words/generator.ts:110` to `lib/words/generator.ts:125`
- Used-word memory reset only when all fresh words are exhausted: `lib/words/generator.ts:102`

Net effect:
- In rhyme-heavy sets, Pass B can pull older words before exhausting all unused rhyming words.
- This creates visible repeats even when users expect "wall" behavior.

### B. Pool-size pressure
Fallback dictionaries currently have 7 words per language per difficulty tier (`lib/data/fallbacks.ts`, validated by count script).
- `en-US`: 7/7/7
- `fr-FR`: 7/7/7
- `pt-PT`: 7/7/7

With frequency=1 and normal session lengths, repeats are inevitable without stronger session or cross-session walls.

### C. Historical wall removal
A prior implementation had a one-hour local history wall in old `app/practice/page.tsx` (`d6eb33d9`), with `HISTORY_KEY` and `ONE_HOUR` filtering.
That protection is not present in the current architecture.

## 3. Reproduction Evidence
Manual simulation (30 draws per language/difficulty, current `WordGenerator`):
- `fr-FR difficulty=2`: `horizon` appeared 4 times, `energie` 4 times.
- `fr-FR difficulty=3`: `authentique` appeared 15 times.
- `pt-PT difficulty=3`: `oportunidade` appeared 9 times.

This reproduces the exact class of issue reported by the user.

## 4. Forensic Metrics
From repository forensic script:
- Total commits in scope: 154
- Hotfix ratio: 69/154 (44.8%)
- Churn hotspots: 2026-02, 2026-01, 2025-12
- Circular refactor signals: repeated `sync`, `timer`, `save`, `upload` topics

## 5. Hall Of Fame (Version Scoring)
Weighted model: Stability 40%, Cleanliness 30%, Performance 30%.

| Version / Commit | Stability | Cleanliness | Performance | Score | Notes |
| --- | --- | --- | --- | --- | --- |
| `d6eb33d9` | 30 | 22 | 22 | 74 | Included 1-hour repeat wall (legacy architecture) |
| `99319593` (v0.9.44) | 28 | 23 | 22 | 73 | Strong anti-repeat-first behavior, suffix anti-rhyme |
| `9e3e75b8` (v1.0.2) | 26 | 24 | 21 | 71 | Better phonetic anti-rhyme; repeat ordering regression introduced |
| `38ee6347` (current) | 24 | 24 | 21 | 69 | Same core prompt order as prior release |
| `f88fbce1` | 22 | 22 | 20 | 64 | Fixed random difficulty starvation, did not restore repeat wall |

## 6. The Crimes
1. Anti-repeat priority inversion.
   - Repeated words can be selected before unused rhyming words.
2. Wall strategy drift.
   - Legacy 1-hour history wall removed; no equivalent replacement.
3. Small dictionary amplification.
   - 7-word per-tier pools make selection-order defects very visible.
4. Coverage gap.
   - Tests validate anti-rhyme and survival, but not distribution fairness or repeat-rate ceilings.

## 7. Verdict
Current `HEAD` is not the best prompt randomization version for user-perceived variety. The engine is stable in generating words, but repeat walls are not behaving as expected in French and Portuguese tiers.

## 8. Forever Fix Plan
See `brain/WORD_PROMPT_RANDOM_LOGIC_FIX_PLAN_2026-02-19.md`.
