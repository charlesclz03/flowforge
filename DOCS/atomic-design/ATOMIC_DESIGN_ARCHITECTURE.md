# Atomic Design Architecture

## Overview

FlowForge now follows **Atomic Design principles** for component organization. This structure provides a clear hierarchy from basic building blocks to complete pages, making the codebase more maintainable, scalable, and easier to understand.

## The Atomic Design Hierarchy

### 1. **Atoms** (`components/atoms/`)
The smallest, most basic building blocks of the UI. These are standalone components that can't be broken down further without losing their meaning.

**Current Atoms:**
- `Button.tsx` - Base button component with variants
- `Card.tsx` - Container card with consistent styling
- `Container.tsx` - Layout container for content width management
- `LoadingIndicator.tsx` - Simple loading animation
- `Spinner.tsx` - Loading spinner component
- `TimerRing.tsx` - Circular progress indicator

**Usage:**
```tsx
import { Button, Card, Spinner } from '@/components/atoms'
```

### 2. **Molecules** (`components/molecules/`)
Simple groups of atoms functioning together as a unit. Molecules have a single responsibility and purpose.

**Organization by domain:**

#### Auth (`molecules/auth/`)
- `SignInButton.tsx` - Google OAuth sign-in button
- `SignOutButton.tsx` - Sign out button
- `UserAvatar.tsx` - User profile avatar

#### Display (`molecules/display/`)
- `StatCard.tsx` - Statistics display card

#### Feedback (`molecules/feedback/`)
- `EmptyState.tsx` - Empty state placeholder
- `ErrorAlert.tsx` - Error message display
- `SuccessAlert.tsx` - Success message display

#### Practice (`molecules/practice/`)
- `BeatCard.tsx` - Beat selection card
- `DifficultySelector.tsx` - Difficulty level selector
- `DurationDisplay.tsx` - Session duration display
- `FrequencySelector.tsx` - Word frequency selector
- `PlayButton.tsx` - Play/pause button with timer ring
- `RecordingIndicator.tsx` - Recording status indicator
- `WordPrompt.tsx` - Word prompt display

**Usage:**
```tsx
import { StatCard, ErrorAlert, PlayButton } from '@/components/molecules'
```

### 3. **Organisms** (`components/organisms/`)
Complex components composed of molecules and/or atoms. Organisms form distinct sections of an interface.

#### Common (`organisms/common/`)
- `PageHeader.tsx` - Reusable page header with optional back button

#### Landing (`organisms/landing/`)
- `LandingHero.tsx` - Hero section with stats and CTA
- `LandingHowItWorks.tsx` - How it works section
- `LandingPricing.tsx` - Pricing plans section
- `LandingFAQ.tsx` - FAQ section

#### Layout (`organisms/layout/`)
- `AppHeader.tsx` - Application header with navigation

#### Practice (`organisms/practice/`)
- `BeatSelector.tsx` - Beat selection interface with search
- `PracticeControls.tsx` - Main practice session controls
- `PracticeHelpSection.tsx` - Help/instructions section
- `SessionSetup.tsx` - Session configuration
- `SessionPlayer.tsx` - Audio playback controls
- `SessionList.tsx` - List of past sessions

#### Profile (`organisms/profile/`)
- `AccountInfo.tsx` - User account information
- `SubscriptionSection.tsx` - Subscription management
- `SecuritySection.tsx` - Security settings
- `StatsSection.tsx` - User statistics display
- `QuickActions.tsx` - Quick action buttons

#### Recordings (`organisms/recordings/`)
- `RecordingCard.tsx` - Individual recording card with playback
- `RecordingsList.tsx` - List of all recordings
- `RecordingsStats.tsx` - Recording statistics

**Usage:**
```tsx
import { PageHeader } from '@/components/organisms/common'
import { BeatSelector, PracticeControls } from '@/components/organisms/practice'
```

### 4. **Templates** (`components/templates/`)
Page-level structures that arrange organisms into layouts. Templates define the page structure but don't contain business logic or data fetching.

**Current Templates:**
- `LandingTemplate.tsx` - Landing page layout
- `PracticeTemplate.tsx` - Practice page layout
- `ProfileTemplate.tsx` - Profile page layout
- `RecordingsTemplate.tsx` - Recordings page layout

**Usage:**
```tsx
import { PracticeTemplate } from '@/components/templates'

<PracticeTemplate
  header={<AppHeader />}
  pageHeader={<PageHeader title="Practice" />}
  beatSelector={<BeatSelector beats={beats} />}
  practiceControls={<PracticeControls {...props} />}
  helpSection={<PracticeHelpSection />}
/>
```

### 5. **Pages** (`app/`)
Specific instances of templates with real data and business logic. Pages handle:
- State management
- Data fetching
- Event handlers
- Routing logic

**Current Pages:**
- `app/page.tsx` - Landing page
- `app/practice/page.tsx` - Practice session page
- `app/profile/page.tsx` - User profile page
- `app/recordings/page.tsx` - Recordings library page

## Benefits of This Structure

### 1. **Reusability**
Components at each level can be easily reused across different pages and contexts.

### 2. **Maintainability**
Clear separation of concerns makes it easy to locate and update specific functionality.

### 3. **Testability**
Each level can be tested independently with appropriate mock data.

### 4. **Scalability**
New features can be added by creating new atoms/molecules/organisms without affecting existing code.

### 5. **Consistency**
Shared components ensure consistent UI/UX across the application.

### 6. **Developer Experience**
Clear hierarchy makes onboarding new developers easier and reduces cognitive load.

## Best Practices

### Component Placement

**When to create an Atom:**
- It's a basic UI element (button, input, icon)
- It can't be broken down further
- It's used across multiple molecules/organisms

**When to create a Molecule:**
- It combines 2-3 atoms with a single purpose
- It's reusable across different organisms
- It handles a specific UI pattern

**When to create an Organism:**
- It's a major section of the UI
- It combines multiple molecules/atoms
- It represents a complete feature or functionality

**When to create a Template:**
- You're defining a page layout structure
- You need to arrange multiple organisms
- The layout is reused across similar pages

### Import Patterns

Use barrel exports (index.ts) for cleaner imports:

```tsx
// ✅ Good - Clean barrel import
import { Button, Card, Spinner } from '@/components/atoms'
import { ErrorAlert, SuccessAlert } from '@/components/molecules'
import { PageHeader } from '@/components/organisms/common'

// ❌ Avoid - Direct file imports when barrel exists
import { Button } from '@/components/atoms/Button'
import { ErrorAlert } from '@/components/molecules/feedback/ErrorAlert'
```

### Component Props

Keep props interfaces close to components:

```tsx
interface MyComponentProps {
  title: string
  onAction: () => void
  isActive?: boolean
}

export function MyComponent({ title, onAction, isActive = false }: MyComponentProps) {
  // Component implementation
}
```

### State Management

- **Atoms/Molecules**: Should be stateless when possible, receiving props
- **Organisms**: Can have internal UI state (e.g., dropdown open/closed)
- **Pages**: Handle application state, data fetching, and business logic

### Styling

FlowForge uses:
- **Tailwind CSS** for utility-first styling
- **CSS Modules** for component-specific styles (when needed)
- **Design tokens** defined in `tailwind.config.ts`

## Migration Notes

### Old Structure → New Structure

The codebase has been refactored from a flat component structure to atomic design:

**Old:**
```
components/
  ├── beats/BeatSelector.tsx
  ├── session/FrequencySelector.tsx
  ├── auth/SignInButton.tsx
  └── RecordingCard.tsx
```

**New:**
```
components/
  ├── atoms/
  ├── molecules/
  │   ├── auth/SignInButton.tsx
  │   └── practice/FrequencySelector.tsx
  ├── organisms/
  │   ├── practice/BeatSelector.tsx
  │   └── recordings/RecordingCard.tsx
  └── templates/
```

### Breaking Changes

If you have old imports, update them:

```tsx
// Old imports
import { SignInButton } from '@/components/auth/SignInButton'
import { BeatSelector } from '@/components/beats/BeatSelector'

// New imports
import { SignInButton } from '@/components/molecules/auth/SignInButton'
import { BeatSelector } from '@/components/organisms/practice/BeatSelector'

// Or use barrel exports
import { SignInButton } from '@/components/molecules'
import { BeatSelector } from '@/components/organisms/practice'
```

## File Structure Reference

```
components/
├── atoms/
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Container.tsx
│   ├── LoadingIndicator.tsx
│   ├── Spinner.tsx
│   ├── TimerRing.tsx
│   └── index.ts
├── molecules/
│   ├── auth/
│   │   ├── SignInButton.tsx
│   │   ├── SignOutButton.tsx
│   │   └── UserAvatar.tsx
│   ├── display/
│   │   └── StatCard.tsx
│   ├── feedback/
│   │   ├── EmptyState.tsx
│   │   ├── ErrorAlert.tsx
│   │   └── SuccessAlert.tsx
│   ├── practice/
│   │   ├── BeatCard.tsx
│   │   ├── DifficultySelector.tsx
│   │   ├── DurationDisplay.tsx
│   │   ├── FrequencySelector.tsx
│   │   ├── PlayButton.tsx
│   │   ├── RecordingIndicator.tsx
│   │   └── WordPrompt.tsx
│   └── index.ts
├── organisms/
│   ├── common/
│   │   ├── PageHeader.tsx
│   │   └── index.ts
│   ├── landing/
│   │   ├── LandingHero.tsx
│   │   ├── LandingHowItWorks.tsx
│   │   ├── LandingPricing.tsx
│   │   ├── LandingFAQ.tsx
│   │   └── index.ts
│   ├── layout/
│   │   └── AppHeader.tsx
│   ├── practice/
│   │   ├── BeatSelector.tsx
│   │   ├── PracticeControls.tsx
│   │   ├── PracticeHelpSection.tsx
│   │   ├── SessionSetup.tsx
│   │   ├── SessionPlayer.tsx
│   │   ├── SessionList.tsx
│   │   └── index.ts
│   ├── profile/
│   │   ├── AccountInfo.tsx
│   │   ├── SubscriptionSection.tsx
│   │   ├── SecuritySection.tsx
│   │   ├── StatsSection.tsx
│   │   ├── QuickActions.tsx
│   │   └── index.ts
│   └── recordings/
│       ├── RecordingCard.tsx
│       ├── RecordingsList.tsx
│       ├── RecordingsStats.tsx
│       └── index.ts
└── templates/
    ├── LandingTemplate.tsx
    ├── PracticeTemplate.tsx
    ├── ProfileTemplate.tsx
    ├── RecordingsTemplate.tsx
    └── index.ts
```

## Resources

- [Atomic Design by Brad Frost](https://atomicdesign.bradfrost.com/)
- [Component-Driven Development](https://www.componentdriven.org/)
- [React Component Patterns](https://reactpatterns.com/)

## Future Improvements

- [ ] Add Storybook for component documentation
- [ ] Create unit tests for each atomic level
- [ ] Document component prop types in separate reference
- [ ] Add visual regression testing
- [ ] Create design system documentation site

---

**Last Updated:** November 2025  
**Maintained by:** FlowForge Development Team

