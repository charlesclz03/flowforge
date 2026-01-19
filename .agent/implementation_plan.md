# Implementation Plan - Fixed Bottom Navigation Layout

The goal is to refactor the application layout to separate the content area from the bottom navigation bar. The Bottom Nav will become a fixed structural element at the bottom of the screen (reserving space), rather than a floating overlay. Content will scroll internally within the remaining viewport height.

## User Requirements
1.  **Fixed Bottom Nav**: "Option B" style structure (full-width reservation) but keeping the "Glass Dock" aesthetic.
2.  **Internal Scrolling**: Main content scrolls between Header and Footer.
3.  **No Overlap**: Content must never scroll *behind* the navbar.
4.  **Global Scope**: Apply to all pages in the application.

## Proposed Changes

### 1. Global Layout (`app/layout.tsx`)
Refactor the root layout to use a Flex Column structure that fills the viewport (`100dvh`).

```tsx
<body className="flex flex-col h-[100dvh] overflow-hidden ...">
  {/* Main Content Area - Expands to fill space, scrolls internally */}
  <main className="flex-1 w-full overflow-y-auto overflow-x-hidden relative scrollbar-hide" id="main-content">
     {children}
  </main>

  {/* Bottom Nav Area - Fixed height/space, stays at bottom */}
  <div className="flex-none w-full relative z-50">
     <BottomNav />
  </div>
</body>
```

### 2. Bottom Navigation (`components/organisms/layout/BottomNav.tsx`)
Update the styling to remove `fixed` positioning and adapt to the new flex container.

*   **Remove**: `fixed bottom-6 left-1/2 -translate-x-1/2`
*   **Add**: Vertical padding/spacing within the wrapper to maintain the "floating" look while physically reserving the space.
*   **Container**: Wrap the existing "Glass Dock" in a `w-full flex justify-center pb-6 pt-2 bg-transparent` (or similar) to ensure it sits correctly.

### 3. Page Standardization
All pages currently managing their own viewport height (e.g., `h-screen`, `h-[100dvh]`) need to be updated to fit `h-full` or `min-h-full` to work within the `flex-1` container.

#### Target Pages:
- `app/practice/page.tsx` (Uses `ScreenPage`)
- `app/profile/page.tsx`
- `app/recordings/page.tsx`
- `app/tracks/page.tsx`
- `components/layout/ScreenPage.tsx` (Might be deprecated or updated to logic `h-full`)

### 4. Component Updates
- **`ScreenPage`**: Update to remove `h-[100dvh]` and allow it to just fill the parent if it's being used as a wrapper. It currently adds padding for safe areas; we might move safe-area logic to the global layout.

## Verification Plan

### Automated Tests
- Build verification.

### Manual Verification
1.  **Scroll Test**: Go to Profile (long content). Scroll to bottom. Ensure the last item is visible *above* the nav bar, not behind it.
2.  **Practice Page**: Ensure the game UI fits and doesn't double-scroll. The Practice Page is unique as it's meant to be non-scrolling "App" view.
3.  **Visual Check**: Verify the "Glass Dock" design remains intact despite the layout change.

# Record Button Logic Update

The goal is to update the behaviors of the recording controls in the Practice/Cypher modes, specifically for Pro users.

## User Requirements
1. **Toggle Mode**: For Pro users, the secondary "REC" button (below the main player) should toggle Audio Capture ON/OFF if the session is not active.
2. **Prevent Modal**: Clicking this button should NOT show the "Get Pro" modal for Pro users.
3. **Prevent Start**: Clicking this button should NOT start the session (unlike before).
4. **Feedback**: Show a toast notification ("Audio Capture Enabled/Disabled").

## Implementation Details

### 1. `components/organisms/practice/PracticeControls.tsx`
- Add `onToggleRecordingMode` prop.
- Update `REC` button `onClick` handler:
  - If active (playing/recording): Prevent action.
  - If Pro: Call `onToggleRecordingMode`.
  - If Non-Pro: Call `handleUpgrade` (existing behavior).
- Update visual state to ensure button remains clickable (but dimmed) when `isRecordingEnabled` is false.

### 2. `app/practice/page.tsx`
- Implement `handleToggleRecordingMode`:
  - Check for active session.
  - Call `setIsRecordingEnabled(!isRecordingEnabled)` from context.
  - Show Toast.
- Pass this handler to `PracticeControls`.

## Verification
- **Test Pro User**: Click REC button -> Toast appears, Icon state changes.
- **Test Active Session**: Start session -> Click REC button -> Error Toast ("Cannot change settings...").
- **Test Non-Pro User**: Click REC button -> Premium Modal appears.
