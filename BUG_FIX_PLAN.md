# Bug Fix Plan

## 1. Fix Practice Session Audio (Priority)
**Issue:** User hears countdown/TTS(sometimes), but track does not play after countdown.
**Analysis:** 
- The `startCountdown` function separates the user gesture (click/keypress) from the actual audio playback trigger by a `setTimeout` (the countdown duration). 
- Browsers often block `audio.play()` if it's not triggered *immediately* during a user gesture.
- `triggerAudio` is called after ~3-4 seconds.
**Solution:**
- We must "unlock" the audio element immediately upon the user's click (Interaction).
- We play the audio *muted* or *paused* immediately, then unpause/volume-up when the countdown finishes.
- Or, we use the `AudioContext` time to schedule the playback, but we are using `HTMLAudioElement`.
- **Refined Approach:** 
    1. On `startCountdown` (user click), immediately call `audio.play()` then `audio.pause()` (or set volume 0 and play) to "warm up" the element.
    2. My previous fix attempted this `beatPlayer.play().then(() => beatPlayer.pause())`.
    3. However, doing `play()` then immediate `pause()` might be race-condition prone if loading hasn't finished.
    4. Better: Set `audio.muted = true`, `audio.play()`. Then when countdown ends, `audio.muted = false`, `audio.currentTime = 0`. This keeps the "playing" state active or at least the element "blessed".
    5. Actually, for `HTMLAudioElement`, just calling `play()` inside the click handler returns a Promise. If we await it then pause, we have "blessed" the element.
    6. I will verify if `beatPlayer.seek` is working correctly in `player.ts`.

## 2. Fix Tracks Page Visibility
**Issue:** "No beats found" on Tracks page.
**Analysis:** 
- API might be returning empty list or DB error. 
- I previously added a fallback to `api/beats/route.ts`.
- Check if `app/tracks/page.tsx` correctly handles the API response structure.
- Check if the fallback beats actually have valid URLs.

## 3. Fix "Section Stuck in Loading"
**Issue:** Infinite loading spinner (Purple Mic).
**Analysis:** 
- Identify which component renders that specific spinner. 
- If it's `PracticeControls` in "Preparing" state, `isLoading` prop is true.
- If it's `PracticePage` loading beat, `selectedBeat` is null.
- Check `usePracticeSession` logic. If `selectedBeat` is lost on reload, it should redirect or default.

---

# Execution Steps

1.  **Refine Audio Player Logic**: Modify `lib/audio/player.ts` to add a `prime()` method that plays (muted) and pauses to unlock autoplay. 
2.  **Update Practice Page**: Use `prime()` in `startCountdown`. Ensure `triggerAudio` handles errors gracefully.
3.  **Verify Tracks API**: I already modified the API. I will create a test script or just manually verify component logic in `TracksPage` to ensure it falls back gracefully on client-side too if fetch fails.
4.  **Investigate Loading State**: Check `app/page.tsx` (Home) and `PracticePage` loading states.
