# Recordings Logic Audit Report

**Date**: 2026-01-31  
**Auditor**: Antigravity  
**Status**: Critical Logic Flaw Identified

## Executive Summary

Users reported two key issues in the `/recordings` list:
1.  **UI Glitch**: "Play" button does not toggle to "Pause" state.
2.  **Audio State**: Multiple recordings can play simultaneously.

The audit has identified a **Race Condition & Logic Conflict** in `RecordingCard.tsx`. The component uses a "Hybrid Control" model where playback is driven *both* by local imperative calls (`toggle()`) and reactive prop updates (`useEffect`). This redundancy causes state desynchronization.

## Technical Analysis

### 1. The Conflict Mechanism

The `RecordingCard` component triggers two conflicting actions on a click event:

```typescript
// components/organisms/recordings/RecordingCard.tsx

onClick={() => {
  if (onPlay) onPlay() // Action A: Notifies Parent
  toggle()             // Action B: Commands Local Hook
}}
```

*   **Action A** (`onPlay`) updates the parent `RecordingsList` state (`playingId`). This triggers a re-render and fires a `useEffect` in the child to synchronize state.
*   **Action B** (`toggle`) immediately commands the local `useRecordingPlayback` hook to play/pause.

These two actions race against each other. The `useEffect` logic:

```typescript
useEffect(() => {
  // If parent says "PLAY THIS" but we are stopped -> PLAY
  if (playingId === recording.id && !isPlaying) {
    play()
  } 
  // If parent says "PLAY THAT" but we are playing -> STOP
  else if (playingId !== recording.id && isPlaying) {
    pause()
  }
}, [playingId, recording.id, isPlaying])
```

When `toggle()` runs first and sets `isPlaying` to true, the `useEffect` logic might misinterpret the state or double-fire. More critically, if the parent state update lags or the render cycle is complex, the "Stop Others" signal might be missed or overwritten locally.

### 2. Failure to Enforce Mutual Exclusion

The "Multiple Playbacks" issue arises because the local `toggle()` forces playback *regardless* of what the parent/global state thinks. While the `useEffect` *should* clean up other players, the immediate imperative `play()` call overrides the "wait for permission" pattern required for a single-source-of-truth system.

### 3. Button State Glitch

The "Play button not turning to Pause" is likely a symptom of the race condition where `isPlaying` (hook state) and `playingId` (prop state) get out of sync, causing the hook to perhaps pause itself immediately after playing, or the UI to flicker.

## Remediation Plan

**Switch to a Strictly Reactive Model.**

1.  **Remove Imperative Logic**: The `onClick` handler should **ONLY** call `onPlay()` (renamed to `onToggleRequest` conceptualy). It should *not* call `toggle()` directly.
2.  **Single Source of Truth**: The `useEffect` alone should drive the local `play()` and `pause()` commands based on the `playingId` prop.
3.  **Parent Logic**: The parent `RecordingsList` already handles the toggle logic correctly (`prev === id ? null : id`), so it acts as the master controller.

### Proposed Code

```diff
- onClick={() => {
-   if (onPlay) onPlay()
-   toggle()
- }}
+ onClick={() => onPlay?.()}
```

This ensures that:
1.  User clicks -> Parent updates `playingId`.
2.  All Cards re-render.
3.  Card A (Target) sees `playingId === myId` -> Calls `play()`.
4.  Card B (Old) sees `playingId !== myId` -> Calls `pause()`.

Absolute mutual exclusion is strictly enforced by the React lifecycle.
