# **💎 FlowForge V1.0: The Bible**

Status: Finalized & Locked  
Action: Ready for Development

## ---

**1\. User Interface (UI) & Experience**

**Philosophy:** "Native App" feel. No browser quirks.

### **1.1 Layout & Navigation**

- **Viewport Lock:** min-height: 100dvh on main wrapper to prevent iOS Safari address bar shifts.
- **Structure:**
  - **Header:** Logo, Streak Counter, Profile Avatar.
  - **Stage:** Flexible center area for Visualizer/Prompts.
  - **Controls:** Fixed bottom footer (Play/Record/Settings).
- **Quick Restart:** A dedicated button (or gesture) to instantly reset the session to 0:00.
- **Settings:** Opens `/settings` page (or modal).
- **Beat Select:** Opens `/beats` or bottom sheet.
- **Profile:** Opens `/profile` page (Full screen view with stats & history).
- **Feedback Loop:** A small **"?" or "Bug" Icon** in the Profile Drawer that links to a simple form/email for bug reporting.
- **Social Proof:** Landing page must include a placeholder section for 3 testimonials ("This helped my flow") to increase trust before login.

### **1.2 Onboarding (The "Guest Mode")**

- **The Flow:** User can record **one session** (60s+) without an account.
- **The Gate:** Clicking "Save," "Review," or "Stats" triggers the **Google One-Tap Auth** modal.
- **Visual Overlay:** On the very first visit, show a semi-transparent overlay:
  - Arrow \-\> Beat Selector (_"Select your beat"_).
  - Arrow \-\> Timer Ring (_"Rhyme when the circle fills"_).
- **Empty State Copy:** If a user (or Guest) has 0 recordings, the Dashboard must read: **_"Your legacy starts today. Record your first track."_** (Do not show "0 Recordings").

### **1.3 Visuals**

- **Winamp Visualizer:** Retro pulsing logo/sine-wave in the center reacting to audio amplitude.
- **Golden Prompts:** Every 50th word in the array renders in **Gold/Yellow** with a glow effect.
- **Desktop Shortcuts:** Space (Play/Stop), R (Record).
- Shortcut UI: Display small tooltip 'Pro Tip: Press Space to Start' on desktop.

## ---

**2\. The Audio Engine (Core Tech)**

**Priority:** Low Latency, High Trust.

### **2.1 Inputs & Processing**

- **Android Latency Wizard:** One-time calibration. User taps to a beep. Apply offset (ms) to vocal track start time.
- **Screen Wake Lock:** navigator.wakeLock.request('screen') on session start.
- **Preloading:** "Start" button disabled until Beat Blob is fully downloaded (No buffering).
- **Context Resume:** Call AudioContext.resume() on the first user interaction.
- **Audio Ducking:** Auto-pause session on visibilitychange (tab switch/call).

### **2.2 Post-Processing**

- **Vocal Mixer:** Volume slider (0.5x \- 2.0x) in Review stage.
- **Studio FX:** Toggle for ConvolverNode (Reverb) on vocals.

- **Manual Nudge**: A slider to shift vocal timing +/- 100ms in the Review stage (Safety net for latency).

### **2.3 Safety Nets**

- **Offline Fallback:** If Supabase fails, save to **IndexedDB**. Show "Retry Upload" button.
- **Route Guard:** Confirmation modal (_"Leave and lose progress?"_) on navigation during recording.
- **Headphone Nudge:** Toast: _"🎧 Headphones recommended for studio quality."_
- **Permission Recovery:** If Mic denied, show link to browser settings in the URL bar.

## ---

**3\. Gamification (The Hook)**

### **3.1 Scoring & Analysis**

- **Flow Density Score:** (Active Vocal Time / Total Time) \* 10,000.
  - _Relentless_ (\>90%), _Pocket Flow_ (\>60%), _Choppy_ (\<30%).
- **Vibe Check:** Qualitative tag based on volume variance (_Hype / Chill / Locked In_).
- **Word Vault:** Stats page: "Collected X / 2000 Words".

### **3.2 Progression**

- **Career Ranks:** _SoundCloud Rapper_ \-\> _Rap God_ (Based on total minutes).
- **Streak Freeze:** 1/mo (Free), Unlimited (Pro).
- **Panic Button:** "Shake/Tap to Skip Word." **Penalty:** \-500 Points.

### **3.3 Badges (Apex Legends Style)**

- **Founder:** Sign up \+ Record in first 7 days.
- **Night Shift:** Session between 02:00–05:00.
- **Machine Gun:** Hard Mode \+ 4 Bar Frequency.
- **Perfectionist:** 5 Consecutive Restarts.
- **The Listener:** 10 Playbacks of own audio.
- **Weekend Warrior:** Sat+Sun sessions for 4 weeks.
- **Beat Mastery:** 5 Sessions on one Beat (Gold Frame reward).

## ---

**4\. Viral Growth**

- **Duel Links:** flowforge.com/c/xyz \-\> Loads exact Beat \+ exact Word Seed for a fair challenge.
- **Video Export:** "Clean View" (Visualizer only) for manual Screen Recording.
- **Stat Card:** Generate PNG Image (Score \+ Beat) for Socials.
- **Social Links:** Input fields for IG/TikTok on Profile.
- **Site OG Image:** Design a static `og-image.jpg` (1200x630px) for the main URL preview on social media/messaging apps.

## ---

**5\. Operations & Data**

**Strategy:** Efficient & Safe.

### **5.1 Database Schema (Complete)**

Extrait de code

model User {  
 id String @id @default(uuid())  
 username String @unique  
 flow_points Int @default(0)  
 badges String\[\]  
 socials Json? // { instagram: "..." }  
 tier String @default("Free")  
 streak Int @default(0)  
 sessions Session\[\]  
}

model Beat {  
 id String @id @default(uuid())  
 title String  
 producer String  
 bpm Int  
 genre String  
 fileUrl String  
 difficulty String // "Easy", "Hard"  
 sessions Session\[\]  
}

model Session {  
 id String @id @default(uuid())  
 userId String  
 user User @relation(fields: \[userId\], references: \[id\])  
 beatId String  
 beat Beat @relation(fields: \[beatId\], references: \[id\])  
 score Int  
 audioUrl String  
 isPublic Boolean @default(true)  
 createdAt DateTime @default(now())

@@index(\[score(sort: Desc), createdAt\])  
}

**Sentry/Error Logging:** Implement client-side tracking to capture `AudioContext` and permission failures automatically.  
**Auth Hook:** On user creation, sync email to Resend audience immediately

### **5.2 Mechanics**

- **Word Bank:** Bag System (Shuffle once, no repeats until empty). 500+ unique words per language (EN/ES/FR).
- **Safe Mode:** Settings toggle to filter explicit words.
- **Randomize Button:** Dice icon to randomize Beat/Settings.
- **Admin Route:** /admin/upload to add beats without code pushes.
- **Storage Policy:** Auto-delete Free Tier recordings \> 7 days.
- **Cache-Control:** Beats set to immutable (1 year).
- **PWA Manifest:** Configure `manifest.json` with app icons and `display: standalone` to allow "Add to Home Screen" functionality.
- **Premium Price Point**: €4.99/month

### **5.3 Legal**

- **TOS:** User owns 100% of lyrics/audio.
- **GDPR:** Cookie Banner.
- **Credits:** Beat Producer Name visible in Player.
- **Google Verification:** Submit OAuth Consent Screen for verification to prevent "Unverified App" warnings.

## ---

**6\. Launch Execution**

- **Leaderboard:** Resets every **Wednesday**.
- **Emails:** Hype (24h pre), Live (Now), Retention (48h post).
- **Abandonment:** Auto-email if inactive for 7 days ("The mic is cold").
- **Product Hunt:** Video Demo using the "Screen Record" feature.
- **Daily Drop:** (Nice to Have) Highlight a specific beat daily if time permits, otherwise rely on Leaderboard.
- **SEO Metadata:** Configure `layout.tsx` title/description for keywords: "Freestyle Rap Generator," "Online Cypher," "Rap Practice."
