# TTS - Forensic Audit Report
**Date**: 2026-02-17
**Scope**: `hooks/useTTS.ts hooks/player/usePracticeEngine.ts lib/tts/languages.ts lib/tts/voice-picker.ts app/practice/PracticeClient.tsx app/practice/page.tsx app/difficultyselection/DifficultySelectionClient.tsx app/api/words/random/route.ts`

## 1. Executive Summary
- **Total Commits**: 157
- **Hotfix Ratio**: 74/157 (47.1%)
- **Churn Validation**: 🔴 HIGH CHURN DETECTED

## 2. Forensic Analysis

### A. Activity Heatmap (Commits per Month)
| Month | Commits | Status |
|-------|---------|--------|
| 2026-02 | 21 | 🔥 Hotspot |
| 2026-01 | 98 | 🔥 Hotspot |
| 2025-12 | 35 | 🔥 Hotspot |
| 2025-11 | 3 | Normal |

### B. "Circular Refactoring" Suspects
*Topics that appear consistently in commit messages:*
| Topic | Occurrences | Risk |
|-------|-------------|------|
| sync | 5 | 🔴 CRITICAL |
| save | 3 | 🟡 Warning |
| auth | 3 | 🟡 Warning |
| timer | 2 | 🟡 Warning |
| upload | 2 | 🟡 Warning |
| drift | 1 | 🟡 Warning |

## 3. Version History (Hall of Fame Candidates)
| Hash | Date | Message |
|------|------|---------|
| 9e3e75b8 | 2026-02-13 | chore(release): v1.0.2 - Practice Full Height Fix |
| e8c8fa2d | 2026-02-11 | chore(release): v0.9.1009 - Sync & Speed |
| 11c904cc | 2026-02-10 | chore(release): v0.9.1004 - Practice Continuity |
| 9af01aa3 | 2026-02-09 | chore(release): v0.9.998 - Session Guard |
| f88fbce1 | 2026-02-09 | fix(practice): restore random difficulty prompts and ring sync |


## 4. Recommendations
1. **Verify Hotspots**: Check months with high churn.
2. **Deep Dive**: Run `git log -p` on the "Circular Refactoring" topics.
3. **Current State**: Run `npm run lint` on these files.
