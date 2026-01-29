# ADR001: Technology Stack & Core Architecture

## Status
Accepted

## Context
Freestyla requires a highly interactive, low-latency web application that feels like a native mobile app ("TWA-ready"). The application involves real-time audio synchronization, microphone recording, and social features. We needed a stack that balances rapid development, performance, and type safety.

## Decision
We chose the following core technologies:

### 1. Framework: Next.js 14 (App Router)
-   **Why**: Provides Server Components for performance (initial load) and Client Components for interactivity. The App Router offers better layout handling for persistent audio players compared to the Pages router.
-   **Trade-off**: High learning curve for "Server vs Client" boundaries, but essential for future performance.

### 2. Language: TypeScript
-   **Why**: Non-negotiable for a complex state-machine-driven application. We need strict typing for the AudioEngine limits and database serialization.

### 3. Database: Supabase (PostgreSQL)
-   **Why**: relational data (Users -> Recordings -> Votes) fits SQL better than NoSQL. Supabase offers "Auth" and "Storage" out of the box, reducing backend boilerplate.
-   **Alternatives Considered**: Firebase (rejected due to poor relational data handling and complex/costly queries for "Leaderboards").

### 4. Styling: Tailwind CSS
-   **Why**: Atomic utility classes allow for rapid UI iteration without context-switching to CSS files. Crucial for maintaining the "Vibrant/Premium" aesthetic with complex gradients.

### 5. Android Wrapper: Bubblewrap (TWA)
-   **Why**: Allows publishing the PWA to the Play Store without building a separate React Native codebase.
-   **Limitation**: No native audio plugins; we must rely on Web Audio API compatibility.

## Consequences
-   **Positive**: Rapid iteration speed; "One Codebase" for Web and Android.
-   **Negative**: We are bound by Mobile Safari/Chrome audio limitations (e.g., auto-play policies).
-   **Mitigation**: Implemented `useAudioSync` with a "Prime Engine" user interaction pattern to unlock AudioContext.
