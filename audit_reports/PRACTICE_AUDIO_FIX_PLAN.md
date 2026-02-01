# Practice Audio "Forever Fix" Plan

**Goal**: Unify AudioContext and HTMLAudioElement execution to ensure 100% playback reliability (No more "Timer works/Sound doesn't").

## User Review Required
> [!IMPORTANT]
> This refactor will create a `MediaElementSourceNode` from the existing `<audio>` element. This requires the `AudioContext` to be `running`. We will enforce strict "Start" logic.

## Proposed Changes

### 1. Audio Architecture (`lib/audio/`)
#### [MODIFY] `lib/audio/player.ts`
-   Add `connectToContext(audioContext: AudioContext)` method.
-   Create `sourceNode = ctx.createMediaElementSource(this.audio)`.
-   Connect `sourceNode -> ctx.destination`.
-   **Why**: This makes the Track a citizen of the AudioContext. If Context is suspended, Track stops (correct behavior). If Context runs, Track runs.

### 2. Beat Player Hook (`hooks/useBeatPlayer.ts`)
#### [MODIFY] `useBeatPlayer.ts`
-   Expose `connectTo(ctx)` method.
-   Ensure `loadBeat` handles `crossOrigin = "anonymous"` correctly to allow Web Audio API processing (needed for analyzing/visualizing later).

### 3. Audio Engine (`hooks/player/usePracticeEngine.ts`)
#### [MODIFY] `usePracticeEngine.ts`
-   In `startSession()`:
    1.  `await ctx.resume()` (Ensure Context is READY).
    2.  `beatPlayer.connectTo(ctx)` (Link them).
    3.  `await beatPlayer.play()` (Verify playback started).
    4.  *Then* dispatch `START`.
-   Remove "Fire and Forget" logic for playback. If Play fails, Session must NOT start.

### 4. Practice Client (`app/practice/PracticeClient.tsx`)
#### [MODIFY] `PracticeClient.tsx`
-   Add error handling toast if `startSession` throws (e.g., "Audio Blocked").

## Verification Plan

### Automated Tests
-   Since this relies heavily on Web Audio API (hard to mock in Node), we rely on Browser Testing.

### Manual Verification
1.  **The "Silence Check"**:
    -   Go to Practice Mode.
    -   Select Beat.
    -   Click Start.
    -   **Expect**: Countdown completes -> Music Starts immediately. (No timer running without sound).
2.  **The "Mobile Check"** (Simulated):
    -   Use DevTools "Sensors" to simulate touch? (Hard).
    -   Profile -> Performance -> Start.
3.  **The "Resume" Check**:
    -   Pause session.
    -   Resume.
    -   **Expect**: Track resumes instantly with timer.
