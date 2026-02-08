# Audit: Missing Practice Control Buttons

**Date**: 2026-02-08
**Status**: Resolved
**Component**: `PracticeControls.tsx`

## Overview
The user reports that the **Pause** and **Restart** buttons have disappeared from the `/practice` page during active sessions.

## Resolution
The issue was identified as a combination of complex `AnimatePresence` logic and potential layout/pointer-event conflicts.
- **Action**: Removed `AnimatePresence` and simplified the buttons to use standard CSS `animate-in` classes.
- **Action**: Added `pointer-events-auto` to the button containers to ensure they are clickable even if the parent container has `pointer-events-none`.
- **Action**: Added explicit `z-10` and `relative` positioning to the button container.

## Component Analysis (`PracticeControls.tsx`)

### Hierarchy
- **Main Container**: `<Card>`
- **Top Controls**: `div.h-40 (sm:h-48)` - Contains `BeatDropdown` + Info Pills.
- **Center Stage**: `div.flex-1` - Contains `Hero Player` + Satellite Buttons.
- **Bottom Controls**: `div.h-40 (sm:h-48)` - Contains `Record Button`.

### Satellite Buttons (The Missing Elements)
The buttons are positioned as flex siblings to the main Hero Player.

```tsx
<div className="flex items-center justify-center gap-2 sm:gap-4 w-full px-2 relative z-10">
  {/* Left Satellite: RESTART */}
  <div className="w-12 sm:w-14 flex justify-end shrink-0">
    <AnimatePresence>
      {isPlaying && handleRestart && (
        <motion.button ... />
      )}
    </AnimatePresence>
  </div>

  {/* Hero Player */}
  <div className="relative flex items-center justify-center shrink-0"> ... </div>

  {/* Right Satellite: PAUSE */}
  <div className="w-12 sm:w-14 flex justify-start shrink-0">
    <AnimatePresence>
      {isPlaying && onTogglePause && !countdownValue && (
        <motion.button ... />
      )}
    </AnimatePresence>
  </div>
</div>
```

## Potential Failures

### 1. Conditional Rendering Logic
- **Restart Button**: Requires `isPlaying && handleRestart`.
- **Pause Button**: Requires `isPlaying && onTogglePause && !countdownValue`.

**Verification**:
- `isPlaying`: Defined in `PracticeClient.tsx` as `engine.status === 'PLAYING' || 'COUNTDOWN'`. During active play, this is `true`.
- `handleRestart`: Defined in `PracticeClient.tsx`.
- `onTogglePause`: Defined in `PracticeClient.tsx`.
- `countdownValue`: `null` during PLAYING.

### 2. Layout/CSS Issues
- **Flex Container**: `justify-center` with `gap-2`. If the `Hero Player` grows too large, it might squeeze the satellites if `shrink-0` fails or if the parent container is too narrow.
- **Z-Index**: The `Center Stage` has `z-20`. The `Top Controls` has `z-30`. If the `Top Controls` container overlaps the buttons, they might be unclickable, but should still be visible unless `overflow-hidden` clips them (unlikely as overflow is visible).
- **Opacity Animation**: `AnimatePresence` with `initial={{ opacity: 0 }}`. If the animation fails or exits prematurely, the buttons remain invisible.

### 3. Recent Changes
- The `.bak` file suggests recent edits to `PracticeControls.tsx`.
- A potential regression in a recent commit might have introduced a layout constraint (e.g., `overflow-hidden` on a parent) or changed the `isPlaying` logic.

## Recommended Fixes

1.  **Refactor Visibility Logic**: Simplify the `AnimatePresence` conditions.
2.  **Force Layout Integrity**: Ensure the satellite containers (`w-12`) are robust and not collapsing.
3.  **Debug Mode**: Temporarily remove `AnimatePresence` to see if buttons render without animation.
