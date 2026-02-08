# Responsive Audit Report

**Date**: 2026-02-08
**Agent**: ResponsiveAudit
**Status**: Pending Review

This report identifies hardcoded values (magic numbers) and rigid layout definitions that potentially break responsive design principles.

## Violation A: Arbitrary Values (Pixel Hardcoding)

Usage of `-[...px]` indicates a departure from the design token system.

### `app/practice/PracticeClient.tsx`
- **Line 506**: `blur-[128px]`
  - **Proposed Fix**: `blur-3xl` (usually sufficient context) or define `blur-4xl` in theme if needed. 128px is extremely heavy.
- **Line 507**: `blur-[128px]`
  - **Proposed Fix**: Same as above.

### `app/session/[id]/page.tsx`
- **Line 58**: `max-w-[300px]`
  - **Proposed Fix**: `max-w-xs` (20rem / 320px) or `max-w-[18rem]` (72) for a closer match.

### `app/u/[username]/loading.tsx`
- **Line 14**: `w-[88px] h-[88px] sm:w-[128px] sm:h-[128px]`
  - **Proposed Fix**: `w-22 h-22` (if mapped) or `w-24 h-24` (96px). `sm:w-32 sm:h-32`.
- **Line 29**: `lg:w-[400px]`
  - **Proposed Fix**: `lg:w-96` (384px) or `lg:max-w-sm`.

### `app/u/[username]/page.tsx`
- **Line 252**: `lg:w-[760px]`, `lg:w-[600px]`, `lg:w-[400px]`
  - **Proposed Fix**: These look like column widths. `lg:w-3/4`, `lg:max-w-2xl`, etc. Refactor to standard `max-w` classes. 400px -> `max-w-sm`. 600px -> `max-w-xl` (576px) or `max-w-2xl` (672px).

### `app/orderconfirmed/page.tsx`
- **Line 164**: `sm:min-w-[280px]`
  - **Proposed Fix**: `sm:min-w-64` (256px) or `sm:min-w-72` (288px).
- **Line 225**: `sm:min-w-[240px]`
  - **Proposed Fix**: `sm:min-w-60` (240px).

### `components/organisms/settings/SettingsDropdown.tsx`
- **Line 19**: `min-w-[44px] min-h-[44px]`
  - **Proposed Fix**: `min-w-11 min-h-11` (44px is exactly 11 units).

### `components/molecules/tracks/BeatGridCard.tsx`
- **Line 117**: `min-h-[44px] min-w-[44px]`
  - **Proposed Fix**: `min-h-11 min-w-11`.

### `components/molecules/practice/BeatDropdown.tsx`
- **Line 277**: `max-h-[400px]`
  - **Proposed Fix**: `max-h-96` (384px).
- **Line 313**: `max-h-[300px]`
  - **Proposed Fix**: `max-h-72` (288px) or `max-h-80` (320px).

### `components/organisms/recordings/SessionPlayer.tsx`
- **Line 419**: `blur-[100px]`
  - **Proposed Fix**: `blur-3xl`.

## Violation C: Grid/Flex Rigidity

Usage of `grid-cols-X` without a mobile base class (assuming mobile is 1 column).

### `app/admin/beats/new/page.tsx`
- **Line 168**: `grid grid-cols-2 gap-6`
  - **Code**: `<div className="grid grid-cols-2 gap-6">`
  - **Proposed Fix**: `grid grid-cols-1 md:grid-cols-2 gap-6`. (Forces 2 columns on mobile screens, causing squashed inputs).

### `app/admin/upload-beat/page.tsx`
- **Line 191**: `grid grid-cols-2 gap-4`
  - **Proposed Fix**: `grid grid-cols-1 sm:grid-cols-2 gap-4`.
- **Line 216**: `grid grid-cols-3 gap-4`
  - **Proposed Fix**: `grid grid-cols-1 sm:grid-cols-3 gap-4` or `grid-cols-1 md:grid-cols-3`.

### `components/organisms/recordings/SessionPlayer.tsx`
- **Line 628**: `grid grid-cols-2 gap-4`
  - **Proposed Fix**: `grid grid-cols-1 sm:grid-cols-2 gap-4` (Metadata metrics might be too wide for 2-up on small mobile).

### `components/organisms/upload/UserBeatUpload.tsx`
- **Line 318**: `grid grid-cols-2 gap-3`
  - **Proposed Fix**: `grid grid-cols-1 sm:grid-cols-2 gap-3`.

## Recommendation

Execute fixes to standardize these values. For blurring and glow effects, consider adding a design token `blur-4xl: 100px` if `blur-3xl` is too weak, rather than using arbitrary values.
