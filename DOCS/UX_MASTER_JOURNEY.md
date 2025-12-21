# FreeStyla: Master UX & User Journey Guide
**Version**: 1.3.1 (Universal Gateway)
**Philosophy**: "Frictionless Flow" — Immediate value for guests, deep progression for members.

---

## 🚀 1. The Onboarding (First Impressions)
### Guest Entry ("The Cold Start")
*   **Touchpoint**: Landing Page (`/`)
*   **Experience**: User clicks "Start Practicing". No signup wall.
*   **Flow**:
    1.  **Landing**: Minimalist, high-energy hero section.
    2.  **How It Works**: A 3-step carousel explaining the core loop (Select Beat -> Catch Prompts -> Improve).
    3.  **Action**: User hits "Studio" and is immediately dropped into the **Difficulty Selection** screen.
    4.  **The Hook**: They can complete a full 60s session. Only when they try to *save* or *view stats* do we ask for an account.

### Authenticated Entry ("The Pro Start")
*   **Flow**: Login via Google (NextAuth).
*   **Redirect**: Bypasses Landing, goes straight to `/difficultyselection` or `/practice` (based on last state).
*   **Context**: Profile picture loads, XP bar syncs, "My Beats" become available.

---

## 🎙️ 2. The Core Loop (The Practice Session)
This is the heart of the application. Everything leads here.

### A. Setup (`/difficultyselection`)
*   **The Three Pillars**: Users choose their intensity.
    *   **Easy**: 8-bar intervals. Simple words. (Good for warming up).
    *   **Medium**: 4-bar intervals. Standard vocabulary. (The sweet spot).
    *   **Hard**: 2-bar intervals. Complex, multisyllabic words. (Stress testing).
*   **Beat Selection**:
    *   **Default**: "Random" (low friction).
    *   **Selector**: Users can open the **Vinyl Collection** to choose specific tracks (Grime, Boom Bap, Trap) or their own uploads ("My Beats").

### B. The Session (`/practice`)
*   **Visual Anchor**: The **Orb**. A reactive, glowing sphere that pulses to the beat and the user's microphone input. It is the focal point.
*   **The HUD**:
    *   **Top**: Progress bar (Time remaining).
    *   **Center**: The Word Prompt. Large, legible typography. Animate in/out on beat.
    *   **Bottom**: Controls (Mic Toggle, Visualizer Mode).
*   **The "Frozen" State**: If the user pauses or takes a call, the visualizer "freezes" in place (crystallizes), maintaining immersion without breaking state.
*   **Duration**:
    *   **Free**: Hard cap at 60 seconds.
    *   **Pro**: Unlimited.

### C. Post-Session (`/summary`)
*   **Immediate Feedback**: "Session Complete".
*   **The Payoff**:
    *   **Playback**: Instant audio replay.
    *   **FX Studio**: Users can add Reverb or adjust Vocal Timing (latency correction).
    *   **Action**: Save (Persist to DB), Share (Native OS Sheet), or Discard.

---

## 🏆 3. Progression & Gamification
We use "Invisible Gamification" — stats are tracked in the background but presented as premium achievements.

### The XP System (Battle Pass Style)
*   **Visual**: A sleek, purple/cyan gradient bar on the **Leaderboard** header.
*   **Logic**:
    *   1 sec of flow = 1 XP.
    *   Completing a session = 100 XP Bonus.
    *   Streaks (Daily) = Multiplier.
*   **Display**: Shows "Level" (e.g., Lvl 5 MC) and progress to next rank.

### The Leaderboard (`/leaderboard`)
*   **Social Proof**: Ranked list of users by "Flow Points" (All Time & Weekly).
*   **Entry Points**:
    *   **Cypher**: A call-to-action card ("Enter the Cypher") invites users to multiplayer.
    *   **Achievements**: Tab switching to view Badges (e.g., "Night Shift" for practicing after 11 PM).

---

## ⚔️ 4. Multiplayer ("The Cypher")
*   **Concept**: Real-time, turn-based lobbies using Websockets (Socket.io).
*   **UX**:
    *   **Lobby**: 4 slots. Avatars light up when active.
    *   **The Pass**: When a user's 8 bars are up, the visualizer turns **Red** (Get Ready), then **Green** (Go) for the next player.
    *   **Spectating**: Users can join just to listen.

---

## 💎 5. The Economy (Free vs. Pro)
Designed to give enough value to be useful for free, but enough power to be essential for pros.

| Feature | Free Tier (Guest/Auth) | Pro Tier ($4.99/mo) | The "Upsell" Moment |
| :--- | :--- | :--- | :--- |
| **Recording Time** | 60 seconds | Unlimited | When timer hits 0:60. |
| **History** | Last 3 sessions | Infinite Archive | Scrolling down on Profile. |
| **Beats** | Public Library | **Upload MP3s** / Cloud Storage | Clicking "Upload" in Vinyl. |
| **Stats** | Basic (Time) | **Flow Density** / Graphs | Viewing "Stats" tab. |
| **Ads** | Visible (Banner) | **Ad-Free** | Persistent bottom banner. |

---

## 🎨 6. UI/UX System (The "Vibe")
### Visual Language
*   **Theme**: Dark Mode Native. Deep blacks (`#0A0A0A`), Zinc grays, and electric accents (`#7D7AFF` Purple).
*   **Materials**: extensively uses "Glassmorphism" (Blur backdrops) to feel native on iOS/Android.
*   **Typography**: Clean, sans-serif (Inter/Geist) for legibility during fast rapping.

### Interactions
*   **Haptics**: We use `navigator.vibrate` for tactile feedback on:
    *   Beat Drop.
    *   Button Taps.
    *   Timer Countdown (3...2...1).
*   **Transitions**: Framer Motion for buttery smooth page slides. No hard refeshes.

### Navigation
*   **Mobile Bottom Bar**:
    *   **Center Orb**: Big "Record" button (Primary Action).
    *   **Sides**: Vinyl, Trophy, Recordings, Profile.
    *   **Smart Hide**: Disappears during active recording to reduce distraction.
