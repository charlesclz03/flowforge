# Profile Picture Audit Report

**Date:** 2026-02-02
**Feature:** Profile Picture (Avatar)
**Verdict:** 🟡 **WARN** (Functional but brittle)

## 1. Executive Summary
The user reports a "question mark" appearing on the profile page and profile picture areas. This coincides with the default fallback value `?` in the `Avatar` component. The current implementation fails to gracefully handle broken image URLs (404s), leading to either a broken image icon (browser default) or the default fallback depending on how `src` is handled.

## 2. Forensic Analysis

### A. The "Question Mark" Suspect
In `components/atoms/Avatar.tsx`:
```tsx
export function Avatar({
  // ...
  fallback = '?', // <--- The smoking gun
  // ...
}: AvatarProps)
```
If the consuming component does not provide a robust fallback, or if the logic falls through, it displays `?`.

### B. The `next/image` Handling Flaw
The `Avatar` component naively trusts the `src` prop:
```tsx
{src ? (
  <Image src={src} ... />
) : (
  <span>{fallback}</span>
)}
```
**Critical Issue**: If `src` is a non-empty string (e.g., a Google User Image URL that has expired or is 404), `next/image` attempts to load it. If it fails, there is **NO** `onError` handler to switch to the fallback state. The user sees a broken image or empty box, not the intended initials.

### C. Profile Page Logic (`app/u/[username]/page.tsx`)
The calculations for the fallback prop are actually robust:
```tsx
user.name ? initials : user.username[0] || 'U'
```
This suggests the issue is likely **Google Auth images expiring** or being invalid, and the `Avatar` component failing to catch the error.

## 3. Top Risk Files
1.  `components/atoms/Avatar.tsx`: Missing error boundary for images.
2.  `components/molecules/auth/UserAvatar.tsx`: Wraps Avatar, needs to ensure it passes data correctly.

## 4. Recommendations ("The Fix")
1.  **Enhance `Avatar.tsx`**: Add local state `hasError`.
    -   If `!src` OR `hasError`: Render Fallback.
    -   If `src`: Render Image with `onError={() => setHasError(true)}`.
2.  **Sanitize Fallback**: Change default fallback from `?` to `U` (User) or a generic icon, though `?` is helpful for debugging "No Data".

## 5. Hall of Fame (Version History)
-   Current Version: v0.9.99 (Sonic Unbound) - Functional but relies on perfect data.
