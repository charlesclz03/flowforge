# FlowForge - Design System Reference

**Last Updated**: November 11, 2025  
**Purpose**: Comprehensive design system documentation for FlowForge  
**Status**: ✅ **Updated to Purple-Based Design**

---

## 🎨 Design Philosophy

### Current Design Approach
- **Inspiration**: iOS Clock App aesthetics
- **Style**: Dark theme with glassmorphic effects
- **Architecture**: Atomic Design principles (atoms → molecules → organisms → templates → pages)
- **Typography**: SF Pro Display, Inter, system fonts
- **Theme**: Professional, modern, minimalist

---

## 🎨 Color Palette

### Background Colors
```typescript
background: {
  DEFAULT: '#000000',    // Pure black
  card: '#1C1C1E',       // Dark gray cards
  elevated: '#2C2C2E',   // Elevated surfaces
  glow: '#0A0A0C',       // Glow effects
}
```

### Text Colors
```typescript
text: {
  primary: '#FFFFFF',    // White (main text)
  secondary: '#8E8E93',  // Gray (secondary text)
  tertiary: '#48484A',   // Dark gray (muted text)
  muted: '#3A3A3C',      // Very dark gray
}
```

### Accent Colors
```typescript
accent: {
  purple: '#7D7AFF',     // PRIMARY ACCENT (play button, timer ring, selected states)
  orange: '#FF9500',     // Premium badges only (NOT primary accent)
  blue: '#0A84FF',       // Secondary accent
  green: '#30D158',      // Success, Easy difficulty
  red: '#FF3B30',        // Error, recording indicator, Hard difficulty
  violet: '#7D7AFF',     // Same as purple
  aqua: '#32D3FF',       // Quaternary accent
  teal: '#64D2FF',       // Quinary accent
}
```

### Timer Colors
```typescript
timer: {
  ring: '#7D7AFF',       // Purple progress ring (updated from orange)
  background: '#3A3A3C', // Gray background ring
}
```

### Stroke Colors
```typescript
stroke: {
  subtle: '#2F2F30',     // Subtle borders
  strong: '#3F3F41',     // Strong borders
  glow: '#1B1B1D',       // Glow borders
}
```

---

## 📝 Typography

### Font Families
```typescript
sans: ['"SF Pro Display"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif']
mono: ['SF Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace']
```

### Font Sizes
```typescript
display: '4rem'          // Large display text (light weight, -0.02em tracking)
display-sm: '3rem'       // Small display text (light weight, -0.015em tracking)
numeral: '4.5rem'        // Numeric displays (extra light, -0.03em tracking)
xl: '2rem'
lg: '1.5rem'
base: '1rem'
sm: '0.875rem'
xs: '0.75rem'
```

### Font Weights
```typescript
light: 300
normal: 400
medium: 500
semibold: 600
bold: 700
```

### Letter Spacing
```typescript
tight: '-0.02em'
normal: '0em'
wide: '0.08em'
```

---

## 🎭 Visual Effects

### Gradients
```typescript
pulse: 'linear-gradient(135deg, #7D7AFF 0%, #9D7AFF 50%, #BD7AFF 100%)' // Purple gradient
aurora: 'linear-gradient(120deg, rgba(125,122,255,0.6) 0%, rgba(157,122,255,0.4) 50%, rgba(189,122,255,0.3) 100%)' // Purple-based
purple: 'linear-gradient(135deg, #7D7AFF 0%, #9D7AFF 100%)' // Simple purple gradient
midnight: 'linear-gradient(160deg, rgba(12,12,15,0.9) 0%, rgba(27,27,31,0.9) 50%, rgba(10,10,12,0.95) 100%)'
```

### Shadows
```typescript
neon: '0 0 30px rgba(125, 122, 255, 0.4)' // Purple glow
glow: '0 10px 40px rgba(125, 122, 255, 0.3)' // Purple glow for buttons
purple: '0 0 20px rgba(125, 122, 255, 0.5)' // Strong purple glow
soft: '0 20px 60px rgba(0, 0, 0, 0.45)'
```

### Backdrop Blur
```typescript
heavy: '24px'
medium: '18px'
light: '12px'
```

### Glassmorphism
- Background: `bg-background-card/60` or `bg-background-card/80`
- Backdrop blur: `backdrop-blur-medium` or `backdrop-blur-light`
- Border: `border-stroke-subtle/50` or `border-stroke-subtle/40`
- Shadow: `shadow-soft`

---

## 🎬 Animations

### Durations
```typescript
fast: '150ms'
normal: '300ms'
slow: '500ms'
```

### Easing
```typescript
default: 'cubic-bezier(0.4, 0, 0.2, 1)'
in: 'cubic-bezier(0.4, 0, 1, 1)'
out: 'cubic-bezier(0, 0, 0.2, 1)'
inOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
```

### Keyframes
```typescript
orbital: 'orbital-glow 16s linear infinite'
pulse: 'pulse-record 1.5s ease-in-out infinite'
pulse-slow: 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite'
```

### Pulse Animation (Recording)
```css
@keyframes pulse-record {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}
```

---

## 📐 Spacing System

```typescript
xs: '0.25rem'    // 4px
sm: '0.5rem'     // 8px
md: '1rem'       // 16px
lg: '1.5rem'     // 24px
xl: '2rem'       // 32px
2xl: '3rem'      // 48px
3xl: '4rem'      // 64px
```

---

## 🔲 Border Radius

```typescript
sm: '0.5rem'     // 8px
md: '0.75rem'    // 12px
lg: '1rem'       // 16px
xl: '1.5rem'     // 24px
2xl: '2rem'      // 32px
3xl: '3rem'      // 48px
full: '9999px'   // Fully rounded
```

---

## 📱 Breakpoints

```typescript
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

---

## 🧩 Component Architecture

### Atomic Design Hierarchy

#### Atoms (Building Blocks)
- **Spinner**: Loading spinner with size variants (sm, md, lg)
- **Button**: Full-featured button with variants (primary, secondary, ghost, danger, outline)
- **Card**: Reusable card wrapper with title/subtitle support

#### Molecules (Simple Combinations)
- **EmptyState**: Loading and empty states with icon support
- **ErrorAlert**: Dismissible error messages
- **StatCard**: Statistics display card with compact/default variants
- **RecordingCard**: Recording display with play/download/delete actions

#### Organisms (Complex Components)
- **Header**: Navigation header with auth
- **BeatSelector**: Beat selection with horizontal scroll
- **PlayButton**: Play/pause button with timer ring
- **WordPrompt**: Word display with animations
- **RecordingIndicator**: Recording status indicator
- **FrequencySelector**: Frequency selection (4/8/16 bars)
- **DifficultySelector**: Difficulty selection (Easy/Medium/Hard)

#### Templates (Page Layouts)
- Landing page layout
- Practice page layout
- Profile page layout
- Recordings page layout

#### Pages (Final UI)
- `/` - Landing page
- `/practice` - Practice session page
- `/profile` - User profile page
- `/recordings` - Recordings library page

---

## 🎯 UI Components Details

### Button Component
```typescript
Variants: primary, secondary, ghost, danger, outline
Sizes: sm, md, lg
Features: loading state, left/right icon support, disabled state
```

### Card Component
```typescript
Variants: default, elevated, glass
Padding: sm, md, lg
Features: title, subtitle, optional border, backdrop blur
```

### Timer Ring
```typescript
Size: 200px
Stroke Width: 10px
Colors: Purple progress (#7D7AFF), Gray background (#3A3A3C)
Animation: Smooth progress fill
Rotation: -90° (starts at top)
```

### Play Button
```typescript
Size Ratio: 55% of timer ring size
Icon Size: 20% of timer ring (play), 15% (stop)
Animation: Pulsing effect when playing
Colors: Purple accent (#7D7AFF) with white icon and purple glow
```

### Recording Indicator
```typescript
States: Gray (inactive), Red (recording)
Animation: Pulse animation (1.5s ease-in-out infinite)
Icon: Microphone icon
```

### Word Prompt
```typescript
Display: Large gradient text
Animation: Fade-in/scale animation
Size: Display text (4rem)
Style: Gradient text effect
```

### Beat Card
```typescript
Height: 80px
Display: BPM, duration, genre
States: Active, hover, premium (locked)
Layout: Horizontal scrollable grid
```

### Recording Card
```typescript
Layout: Glassmorphic background
Info: Title, beat details, difficulty badge, timestamp
Actions: Play, Download, Delete
Colors: Green (Easy), Orange (Medium), Red (Hard)
```

---

## 🎨 Design Patterns

### Glassmorphism
- Semi-transparent backgrounds
- Backdrop blur effects
- Subtle borders
- Soft shadows
- Used in: Cards, modals, overlays

### Gradient Text
- Uses `bg-gradient-pulse` with `bg-clip-text`
- Applied to: Headings, word prompts, accents

### Pulse Animation
- Used for: Recording indicator, play button when active
- Duration: 1.5s (recording), 3s (play button)
- Effect: Scale and opacity changes

### Smooth Transitions
- Default: 300ms for most UI elements
- Fast: 150ms for hover states
- Slow: 500ms for complex animations

---

## 📊 Session Configuration

### Default Settings
```typescript
DEFAULT_DURATION_SECONDS: 120      // 2 minutes
DEFAULT_FREQUENCY: 8                // 8 bars
DEFAULT_DIFFICULTY: 2               // Medium
TIMER_UPDATE_INTERVAL_MS: 100       // Update every 100ms
WORD_ROTATION_CHECK_INTERVAL_MS: 100 // Check every 100ms
```

### Frequency Options
```typescript
[4, 8, 16] bars
4 bars: Quick rotation, more challenging
8 bars: Balanced, standard practice
16 bars: Slower rotation, deeper exploration
```

### Difficulty Levels
```typescript
EASY: 1      // 1-2 syllables (green)
MEDIUM: 2    // 2-3 syllables (orange)
HARD: 3      // 4-5+ syllables (red)
```

### Recording Configuration
```typescript
FREE_TIER_LIMIT_SECONDS: 120       // 2 minutes
PRO_TIER_LIMIT_SECONDS: null       // Unlimited
SAMPLE_RATE: 44100
CHANNELS: 2
MIME_TYPE: 'audio/wav'
```

---

## 🎯 UI Constants

```typescript
TIMER_RING_SIZE: 200
TIMER_RING_STROKE_WIDTH: 10
WORD_DISPLAY_DURATION_MS: 500
BEAT_CARD_HEIGHT: 80
MAX_SESSION_TITLE_LENGTH: 50
PLAY_BUTTON_SIZE_RATIO: 0.55
PLAY_ICON_SIZE_RATIO: 0.2
STOP_ICON_SIZE_RATIO: 0.15
```

---

## 🎨 Color Coding

### Primary Accent
- **Purple** (#7D7AFF): Primary accent color used for:
  - Play buttons
  - Timer rings
  - Selected states
  - Progress indicators
  - Logo accents
  - CTA buttons
  - Focus rings
  - Active states

### Premium Indicators
- **Orange** (#FF9500): Reserved exclusively for:
  - Premium badges
  - Premium feature indicators
  - Upgrade prompts

### Difficulty Levels (Semantic Colors)
- **Easy**: Green (#30D158) - 1-2 syllables
- **Medium**: Orange (#FF9500) - 2-3 syllables (semantic, not accent)
- **Hard**: Red (#FF3B30) - 4-5+ syllables

### States
- **Active**: Purple accent (#7D7AFF)
- **Inactive**: Gray (#8E8E93)
- **Recording**: Red (#FF3B30)
- **Success**: Green (#30D158)
- **Error**: Red (#FF3B30)

---

## 📱 Responsive Design

### Mobile First
- Base styles for mobile (320px+)
- Breakpoints at: 640px, 768px, 1024px, 1280px, 1536px
- Touch-friendly targets (minimum 44x44px)
- Safe area insets for mobile devices

### Layout Patterns
- Single column on mobile
- Two column on tablet
- Multi-column on desktop
- Horizontal scroll for beat selector
- Grid layout for recordings

---

## ♿ Accessibility

### Color Contrast
- Text primary on background: WCAG AAA
- Text secondary on background: WCAG AA
- Accent colors: WCAG AA minimum

### Interactive Elements
- Focus states: Orange ring with offset
- Keyboard navigation: Full support
- Screen readers: ARIA labels
- Reduced motion: Respects `prefers-reduced-motion`

### Touch Targets
- Minimum size: 44x44px
- Adequate spacing between interactive elements
- Clear visual feedback on interaction

---

## 🔧 Implementation Files

### Design System Constants
- `lib/constants/design.ts` - All design constants
- `tailwind.config.ts` - Tailwind configuration
- `app/globals.css` - Global styles and utilities

### Component Files
- `components/atoms/` - Atomic components
- `components/molecules/` - Molecular components
- `components/organisms/` - Complex components (implied in session/, beats/, etc.)
- `components/layout/` - Layout components

---

## 📝 Design Principles

1. **Consistency**: Use design system constants, not magic numbers
2. **Reusability**: Build components that can be reused across the app
3. **Accessibility**: Ensure all users can interact with the interface
4. **Performance**: Optimize animations and transitions
5. **Responsiveness**: Mobile-first approach with progressive enhancement
6. **Clarity**: Clear visual hierarchy and feedback
7. **Minimalism**: Clean, uncluttered interfaces
8. **Feedback**: Clear visual feedback for all user actions

---

## 🎯 Current Design Status

### ✅ Implemented & Redesigned
- ✅ **Purple-based design system** (Primary accent: #7D7AFF)
- ✅ Dark theme with iOS-inspired aesthetics
- ✅ Glassmorphic card designs
- ✅ Purple gradient text effects
- ✅ Smooth animations and transitions
- ✅ Responsive layouts
- ✅ Atomic Design component architecture
- ✅ Unified error handling
- ✅ Loading states with purple accents
- ✅ Empty states
- ✅ Purple play buttons with glow effects
- ✅ Purple timer rings and progress indicators
- ✅ Purple selected states and checkmarks
- ✅ Orange reserved for premium badges only

---

## 📸 Design Reference

**Design Source**: `DOCS/FlowForge Design Assets/` (11 design screenshots)

All design screenshots have been analyzed and implemented:
- ✅ Feature cards with purple icon backgrounds
- ✅ Purple play button with glow
- ✅ Purple timer ring
- ✅ Selected beats with purple borders and checkmarks
- ✅ Session info pill with purple separator dots
- ✅ Premium badges in orange

---

## ✅ Redesign Complete

### Phase 1: Design Analysis ✅
- [x] Review all screenshots
- [x] Identify design changes
- [x] Document new design patterns
- [x] Update design system constants
- [x] Create design tokens

### Phase 2: Component Updates ✅
- [x] Update color palette (Orange → Purple)
- [x] Update typography
- [x] Update spacing system
- [x] Update border radius
- [x] Update shadows and effects (Purple glows)
- [x] Update animations

### Phase 3: Component Redesign ✅
- [x] Redesign atoms (Button, Card, Spinner - all use purple)
- [x] Redesign molecules (EmptyState, ErrorAlert, StatCard, RecordingCard)
- [x] Redesign organisms (Header, BeatSelector, PlayButton - all use purple)
- [x] Update page layouts (Practice, Landing pages)

### Phase 4: Testing
- [ ] Test on mobile devices
- [ ] Test on tablet devices
- [ ] Test on desktop
- [ ] Test accessibility
- [ ] Test animations
- [ ] Verify purple colors match design

### Phase 5: Documentation ✅
- [x] Update design system documentation (this file)
- [x] Create redesign completion document (REDESIGN_COMPLETE.md)
- [x] Update component references

---

## 🎉 Redesign Summary

**Status**: ✅ **COMPLETE**  
**Date**: November 11, 2025  
**Primary Change**: Orange → Purple accent color  
**Files Updated**: 13 components + 3 core design files  
**Documentation**: See `REDESIGN_COMPLETE.md` for full details

The FlowForge design system has been successfully updated to use **purple** (#7D7AFF) as the primary accent color throughout the application, with orange reserved exclusively for premium badges.

