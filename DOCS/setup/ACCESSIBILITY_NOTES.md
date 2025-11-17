# FlowForge UI Accessibility Notes

_Updated: November 6, 2025_

## Visual Contrast
- Primary text (`#FFFFFF`) on the dark background palette (`#000000` – `#2C2C2E`) exceeds WCAG AA large-text contrast ratios (> 7.0).
- Accent indicators (orange `#FF9500`, blue `#0A84FF`, violet `#7D7AFF`) were paired with neutral backing cards to maintain a minimum 4.5:1 ratio for body copy and 3:1 for UI affordances.
- Elevated cards use translucent overlays with additional border strokes to preserve edge definition for low-vision users.

## Focus & Interaction States
- Primary button styles now rely on tailwind `focus-visible` rings with offset contrast to ensure keyboard focus clarity on glass surfaces.
- Hover states increase soft shadows rather than only color shifts, adding a non-color cue for interaction readiness.

## Motion Considerations
- Global stylesheet includes a `prefers-reduced-motion` override to minimise ambient animations while preserving essential timing cues.
- Timer ring animation remains visible but the surrounding orbital glow halts for users who opt out of motion.

## Next Checks
- Validate gradient overlays against real devices in dark rooms (especially OLED) to confirm perceived contrast.
- Audit component library focus order once interactive flows are implemented beyond the marketing hero.


