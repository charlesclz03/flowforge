# Mobile Header TTS Runtime - Forensic Audit Report
**Date**: 2026-06-10
**Scope**: `components/organisms/layout/AppHeader.tsx app/globals.css app/practice/PracticeClient.tsx components/organisms/practice/PracticeControls.tsx hooks/useTTS.ts hooks/player/usePracticeEngine.ts lib/tts/platform.ts lib/tts/speech-engine.ts lib/tts/utterance-language.ts lib/tts/voice-picker.ts lib/tts/voice-status-copy.ts`

## 1. Executive Summary
- **Total Commits**: 180
- **Hotfix Ratio**: 65/180 (36.1%)
- **Churn Validation**: 🔴 HIGH CHURN DETECTED

## 2. Forensic Analysis

### A. Activity Heatmap (Commits per Month)
| Month | Commits | Status |
|-------|---------|--------|
| 2026-05 | 12 | 🔥 Hotspot |
| 2026-03 | 5 | Normal |
| 2026-02 | 27 | 🔥 Hotspot |
| 2026-01 | 101 | 🔥 Hotspot |
| 2025-12 | 29 | 🔥 Hotspot |
| 2025-11 | 6 | Normal |

### B. "Circular Refactoring" Suspects
*Topics that appear consistently in commit messages:*
| Topic | Occurrences | Risk |
|-------|-------------|------|
| sync | 4 | 🔴 CRITICAL |
| timer | 1 | 🟡 Warning |
| save | 1 | 🟡 Warning |
| auth | 1 | 🟡 Warning |

## 3. Version History (Hall of Fame Candidates)
| Hash | Date | Message |
|------|------|---------|
| 6d46f236 | 2026-05-22 | fix(practice): stabilize compact Safari ring layout |
| e269c868 | 2026-05-22 | chore(release): v1.1.8 - Pro-Grade Practice Refresh |
| dfdcb1ed | 2026-05-19 | chore(release): v1.1.7 polish and tts hotfix |
| de43b44b | 2026-05-18 | chore(release): v1.1.6 - Practice Reliability |
| 776a6b13 | 2026-05-18 | chore(release): v1.1.5 - Enterprise UI Remediation |


## 4. Recommendations
1. **Verify Hotspots**: Check months with high churn.
2. **Deep Dive**: Run `git log -p` on the "Circular Refactoring" topics.
3. **Current State**: Run `npm run lint` on these files.
