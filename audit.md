# Review Studio Tools Audit (Reverb + Alignment)

**Date:** 2026-02-13
**Feature:** `/review/[id]` SessionPlayer studio controls
**Status:** PASS with fixes applied

## 1) Objective
Audit and verify that Review studio controls (reverb/studio mode + alignment nudge + levels) behave reliably, persist correctly, and do not carry stale values.

## 2) Scope
- `components/organisms/recordings/SessionPlayer.tsx`
- `app/review/[id]/page.tsx`
- `app/s/[id]/page.tsx`
- `app/api/recordings/[id]/route.ts`
- `lib/audio/mixer.ts`

## 3) Reproduction Focus
1. Open `/review/[id]` with audio.
2. Change Studio settings (voice, beat, alignment, studio toggle).
3. Verify `Save Changes` appears only when dirty.
4. Save, leave page, return to same review.
5. Confirm controls reload from persisted `fxConfig`.

## 4) Findings

### P1 - Stale FX state risk in SessionPlayer
- **Issue:** `SessionPlayer` state was initialized from props, but not fully rehydrated when recording/settings payload changed.
- **Impact:** In client-side route transitions or reused mounts, prior settings could carry over and appear “stuck”.
- **Fix Applied:** Added props-to-state rehydration effect keyed to incoming settings/audio payload.

### P1 - Audio graph lifecycle leak / stale source risk
- **Issue:** WebAudio nodes/context were not fully reset on source teardown.
- **Impact:** FX graph could remain tied to prior source state in reuse scenarios.
- **Fix Applied:** Added deterministic graph teardown/reset on cleanup (source, compressor, reverb, gain nodes, context).

### P2 - Loaded voice level could be inconsistent on fresh source
- **Issue:** New audio element did not explicitly apply current voice level at source setup time.
- **Impact:** Saved volume could sound incorrect until user interacted with slider.
- **Fix Applied:** Apply voice volume at source creation and keep it synced via effect.

### P3 - Label/processing mismatch
- **Issue:** UI showed `Reverb & EQ` while runtime path had reverb only.
- **Impact:** Misleading control naming.
- **Fix Applied:** Updated preview processing to include compressor with reverb and renamed control to `Reverb + Comp` for accuracy.

## 5) Persistence Model Verification
- `SessionPlayer` emits settings via `onSettingsChange`.
- `/review/[id]` tracks `savedSettings` vs `currentSettings`.
- Dirty state gates `Save Changes` visibility.
- `PATCH /api/recordings/[id]` persists `fxConfig`.
- Re-open path normalizes both legacy `reverb` and current `isStudioMode`.

## 6) Industry-Standard Recommendation (Studio Feel)
- Keep the current single-toggle `Reverb + Comp` for simplicity and predictable UX.
- If expanding later, split into explicit controls: `Compression`, `Tone (EQ)`, `Reverb` with presets (`Clean`, `Warm`, `Wide`) rather than raw engineering knobs.

## 7) Forever Fix Applied
- Added robust settings rehydration in `SessionPlayer`.
- Added audio graph teardown/rebuild safety for source changes.
- Added compressor parity in review preview path and corrected labeling.
- Existing explicit save flow remains in place (`Save Changes` appears only when edited).

## 8) Verification Checklist
- [x] Dirty-state save action appears only after edits.
- [x] Saved settings persist across leave/return.
- [x] Legacy `fxConfig.reverb` still honored.
- [x] Review/shared playback use normalized settings.
