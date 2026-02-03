# FreeStyla v0.9.74 (Release Candidate) - Professional QA Testing Plan V3

> [!IMPORTANT]
> **Testing Environment Warning**
> All tests MUST be performed on the live Vercel deployment: `https://flowforge-freestyle.vercel.app`
> DO NOT test on `localhost`.
> **CRITICAL**: Always wait at least **9 seconds** after navigating to a page to ensure full load before interacting or verifying.

**Version**: 3.0  
**Last Updated**: January 16, 2026  
**Basis**: Evolution of V2 + Historical "Day 0" Development & Bug Analysis  
**Tests**: ~190 (Expanded Coverage)

---

## New in V3: "The Reality Check" Integration

_Based on development history (Sessions 0-20), the following critical areas have been added:_

1.  **Android TWA & PWA Deep Dive**: Validating the Play Store readiness.
2.  **Gamification Logic**: Covering "Rate App" thresholds and XP sync.
3.  **Cypher Stability**: Specific audio glitch tests.
4.  **Regression Suite**: Explicit tests for fixed bugs (URLs, Auth, UI).

---

## Module 1: Authentication & Authorization (17 tests)

### 1.1 Sign-In/Sign-Up Flow

| ID       | Test Case                         | Steps                                         | Expected Result                                          |
| -------- | --------------------------------- | --------------------------------------------- | -------------------------------------------------------- |
| AUTH-001 | Google Sign-In                    | Click "Continue with Google" → Select account | Redirect to `/difficultyselection`, user session created |
| AUTH-002 | New User Registration             | Sign in with new Google account               | Account created, redirected to onboarding or practice    |
| AUTH-003 | Session Persistence               | Sign in → Close browser → Reopen              | User remains authenticated                               |
| AUTH-004 | Sign Out                          | Click Profile → Sign Out                      | Session cleared, redirect to landing page                |
| AUTH-005 | Protected Route (Unauthenticated) | Visit `/profile` without login                | Redirect to sign-in or modal prompt                      |

### 1.2 Role-Based Access

| ID       | Test Case                       | Steps                               | Expected Result         |
| -------- | ------------------------------- | ----------------------------------- | ----------------------- |
| AUTH-006 | Free User Premium Beat          | Click locked (Pro) beat             | Premium modal appears   |
| AUTH-007 | Pro User Premium Beat           | Click locked beat as Pro user       | Beat loads successfully |
| AUTH-008 | Admin Panel Access (Non-Admin)  | Visit `/admin` as regular user      | Redirect or 403 error   |
| AUTH-009 | Admin Panel Access (Superadmin) | Visit `/admin` as superadmin        | Dashboard loads         |
| AUTH-010 | Recording Time Limit (Free)     | Record for >10 minutes as free user | Session ends at limit   |

### 1.3 Guest Mode

| ID       | Test Case             | Steps                                      | Expected Result                    |
| -------- | --------------------- | ------------------------------------------ | ---------------------------------- |
| AUTH-011 | Guest Practice        | Start session without login                | Session plays normally             |
| AUTH-012 | Guest Finish Redirect | Complete session (Min 3s) → Click Finish   | Redirect to Menu (No Upsell Modal) |
| AUTH-013 | Guest No-Save Check   | Finish guest session → Check Profile/Beats | No session saved, clean state      |
| AUTH-014 | Guest Beat Access     | Select free beats                          | All free beats accessible          |
| AUTH-015 | Guest Premium Beat    | Click premium beat                         | Upgrade prompt shown               |

### 1.4 New Regression Tests (V3)

| ID       | Test Case             | Steps                                     | Expected Result                                                                   |
| -------- | --------------------- | ----------------------------------------- | --------------------------------------------------------------------------------- |
| AUTH-016 | **Schema Sync Check** | Log in with new/unrated account           | **No Redirect Loop**. Valid session established. (Verifies `hasRated` schema fix) |
| AUTH-017 | Admin Email Override  | Log in as hardcoded admin (e.g., Charles) | Role explicitly set to SUPERADMIN regardless of DB default                        |

---

## Module 2: Audio Engine & Beat Playback (22 tests)

### 2.1 Beat Library (`/tracks`)

| ID        | Test Case            | Steps                       | Expected Result                               |
| --------- | -------------------- | --------------------------- | --------------------------------------------- |
| AUDIO-001 | Beat Library Load    | Navigate to `/tracks`       | All beats load with titles, BPM, waveforms    |
| AUDIO-002 | Beat Preview         | Click play on any beat      | Audio plays, waveform animates                |
| AUDIO-003 | Beat Favorite        | Click heart icon            | Beat added to favorites (persists on refresh) |
| AUDIO-004 | Beat Search          | [REMOVED - No Search Bar]   | N/A                                           |
| AUDIO-005 | Beat Category Filter | Select genre filter bubbles | Only matching beats shown                     |

### 2.2 Practice Session (`/practice`)

| ID        | Test Case               | Steps                             | Expected Result                            |
| --------- | ----------------------- | --------------------------------- | ------------------------------------------ |
| AUDIO-006 | Beat Playback Start     | Click Start → Beat plays          | Audio starts immediately, loops seamlessly |
| AUDIO-007 | Beat Loop Seamless      | Let beat play through full loop   | No gap, click, or stutter at loop point    |
| AUDIO-008 | Beat Volume Control     | Adjust beat volume slider         | Volume changes without interruption        |
| AUDIO-009 | Beat Change Mid-Session | Change beat during active session | New beat loads, session continues          |
| AUDIO-010 | Beat Random Selection   | Select "Random" beat option       | Random beat loads each session             |

### 2.3 Word Prompts

| ID        | Test Case               | Steps                           | Expected Result                |
| --------- | ----------------------- | ------------------------------- | ------------------------------ |
| AUDIO-011 | Word Display Timing     | Start session (4-bar frequency) | Words appear on beat (4 bars)  |
| AUDIO-012 | Easy Difficulty Words   | Select Easy → Start             | Simple, common words displayed |
| AUDIO-013 | Medium Difficulty Words | Select Medium → Start           | Standard vocabulary words      |
| AUDIO-014 | Hard Difficulty Words   | Select Hard → Start             | Complex, multi-syllable words  |
| AUDIO-015 | Word Animation          | Observe word transitions        | Smooth fade/scale animation    |

### 2.4 Recording & Microphone

| ID        | Test Case                 | Steps                          | Expected Result                                     |
| --------- | ------------------------- | ------------------------------ | --------------------------------------------------- |
| AUDIO-016 | Mic Permission Request    | Start recording (first time)   | Browser permission prompt appears                   |
| AUDIO-017 | Mic Permission Denied     | Deny microphone access         | Graceful error, option to retry                     |
| AUDIO-018 | Recording Indicator       | Start recording                | Visual recording indicator visible                  |
| AUDIO-019 | Recording with Headphones | Use headphones while recording | Audio plays in headphones, recording captures voice |
| AUDIO-020 | Mixed Download            | Complete session → Download    | MP3 contains voice + beat (mixed)                   |

### 2.5 New Cypher & Audio Tests (V3)

| ID        | Test Case                    | Steps                                   | Expected Result                                                       |
| --------- | ---------------------------- | --------------------------------------- | --------------------------------------------------------------------- |
| AUDIO-021 | **Cypher Player Transition** | In Cypher mode, pass turn from P4 to P1 | **No Audio Glitch**. Seamless loop, visual indicator moves instantly. |
| AUDIO-022 | Playback URL Validity        | Play older recording in list            | Audio plays (Verifies fix for internal file path vs HTTP URL bug)     |

---

## Module 3: Core User Flows (28 tests)

### 3.1 Landing & Onboarding

| ID       | Test Case          | Steps                        | Expected Result                               |
| -------- | ------------------ | ---------------------------- | --------------------------------------------- |
| FLOW-001 | Landing Page Load  | Visit `/`                    | Hero section, stats, CTA buttons visible      |
| FLOW-002 | How It Works       | Navigate to `/howitworks`    | 3-step flow explanation, Start button works   |
| FLOW-003 | Dynamic Beat Count | Check stats on `/howitworks` | Shows actual DB beat count (not static "10+") |
| FLOW-004 | Landing CTA        | Click "Start Practicing"     | Redirect to `/difficultyselection`            |
| FLOW-005 | Mobile Navigation  | Open nav on mobile           | Bottom nav bar visible, all icons work        |

### 3.2 Difficulty Selection (`/difficultyselection`)

| ID       | Test Case        | Steps                            | Expected Result                         |
| -------- | ---------------- | -------------------------------- | --------------------------------------- |
| FLOW-006 | Page Load        | Navigate to difficulty selection | Difficulty cards, beat selector visible |
| FLOW-007 | Easy Selection   | Click "Easy"                     | Card highlights, stored for session     |
| FLOW-008 | Medium Selection | Click "Medium"                   | Card highlights, stored for session     |
| FLOW-009 | Hard Selection   | Click "Hard"                     | Card highlights, stored for session     |
| FLOW-010 | Beat Dropdown    | Click beat selector              | Dropdown expands with beat list         |
| FLOW-011 | Start Session    | Configure → Click Start          | Redirect to `/practice` with settings   |

### 3.3 Practice Session (`/practice`)

| ID       | Test Case             | Steps                               | Expected Result                        |
| -------- | --------------------- | ----------------------------------- | -------------------------------------- |
| FLOW-012 | Session Start         | Countdown → Go                      | Beat plays, words appear, timer starts |
| FLOW-013 | Session Timer         | Observe timer                       | Timer counts down accurately           |
| FLOW-014 | Session Pause         | Click pause                         | Beat pauses, timer pauses              |
| FLOW-015 | Session Resume        | Click play after pause              | Beat resumes from pause point          |
| FLOW-016 | Session End (Natural) | Let timer reach 0                   | Session summary modal appears          |
| FLOW-017 | Session End (Manual)  | Click stop                          | Save prompt appears                    |
| FLOW-018 | Session Save          | Click "Save" after session (Min 5s) | Recording saved, success message       |
| FLOW-019 | Session Discard       | Click "Discard"                     | No recording saved, return to menu     |

### 3.4 Recordings (`/recordings`)

| ID       | Test Case          | Steps                     | Expected Result                 |
| -------- | ------------------ | ------------------------- | ------------------------------- |
| FLOW-020 | Recordings List    | Navigate to `/recordings` | All saved recordings visible    |
| FLOW-021 | Recording Playback | Click play on a recording | Audio plays with waveform       |
| FLOW-022 | Recording Delete   | Click delete → Confirm    | Recording removed from list     |
| FLOW-023 | Recording Download | Click download            | MP3 file downloads              |
| FLOW-024 | Recording Share    | Click share               | Native share sheet or copy link |
| FLOW-025 | Empty State        | View with 0 recordings    | Helpful empty state message     |

### 3.5 New UX Refinements (V3)

| ID       | Test Case                | Steps                    | Expected Result                                                        |
| -------- | ------------------------ | ------------------------ | ---------------------------------------------------------------------- |
| FLOW-026 | **Start Button Clarity** | Check Player Circle      | Displays "START" text (or clear icon), not ambiguous.                  |
| FLOW-027 | Help Button Nav          | Click "?" icon in header | Redirects to `/howitworks`.                                            |
| FLOW-028 | Header Overlap           | Scroll content on mobile | Content flows _under_ blurred header, no interactive elements blocked. |

---

## Module 4: Profile & Gamification (25 tests)

### 4.1 Profile Page (`/profile`)

| ID       | Test Case      | Steps                            | Expected Result                   |
| -------- | -------------- | -------------------------------- | --------------------------------- |
| PROF-001 | Profile Load   | Navigate to `/profile`           | Avatar, stats, XP bar visible     |
| PROF-002 | XP Display     | Complete session → Check profile | XP increased, bar animated        |
| PROF-003 | Level Display  | Check level indicator            | Correct level shown with progress |
| PROF-004 | Stats Accuracy | Compare displayed stats          | Match actual session/word counts  |
| PROF-005 | Edit Profile   | Click edit → Change username     | Username updates across app       |

### 4.2 Achievements (`/achievements`)

| ID       | Test Case                | Steps                         | Expected Result                |
| -------- | ------------------------ | ----------------------------- | ------------------------------ |
| PROF-006 | Achievements Page        | Navigate to achievements      | All achievement cards visible  |
| PROF-007 | Unlocked Achievement     | Check unlocked achievement    | Badge highlighted, date shown  |
| PROF-008 | Locked Achievement       | Check locked achievement      | Greyed out, requirements shown |
| PROF-009 | Achievement Progress     | Check in-progress achievement | Progress bar/percentage shown  |
| PROF-010 | Achievement Unlock Toast | Trigger achievement condition | Toast notification appears     |

### 4.3 Streaks & Progression

| ID       | Test Case            | Steps                       | Expected Result                     |
| -------- | -------------------- | --------------------------- | ----------------------------------- |
| PROF-011 | Daily Streak Display | Check streak on profile     | Current streak count shown          |
| PROF-012 | Streak Increment     | Complete session on new day | Streak increases by 1               |
| PROF-013 | Streak Reset         | Miss a day → Check          | Streak resets to 0                  |
| PROF-014 | XP Gain Calculation  | Complete session → Check XP | XP = words×10 + seconds + base      |
| PROF-015 | Level Up             | Gain enough XP to level     | Level increases, notification shown |

### 4.4 Public Profile (`/u/[username]`)

| ID       | Test Case           | Steps                      | Expected Result              |
| -------- | ------------------- | -------------------------- | ---------------------------- |
| PROF-016 | Public Profile Load | Visit `/u/username`        | Profile visible to anyone    |
| PROF-017 | Public Stats        | Check public profile stats | Sessions/words count visible |
| PROF-018 | Follow User         | Click Follow               | Follow count increments      |
| PROF-019 | Unfollow User       | Click Unfollow             | Follow count decrements      |
| PROF-020 | Own Profile View    | Visit own public profile   | Edit options available       |

### 4.5 New Rate App Logic & XP (V3)

| ID      | Test Case                    | Steps                                          | Expected Result                                                                      |
| ------- | ---------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------ |
| GAM-001 | **Rate Trigger (Threshold)** | Save 3rd recording (Session Count = 3)         | "Rate the App" modal appears automatically.                                          |
| GAM-002 | Rate "Rate Now"              | Click "Rate Now" in modal                      | Redirects to `/feedback?mode=rate`. DB `hasRated` -> true.                           |
| GAM-003 | Rate "Later"                 | Click "Later"                                  | Modal closes. Re-appears after X sessions/days (if logic exists).                    |
| GAM-004 | **XP Sync Accuracy**         | Complete session (Words+Time), Refresh browser | Profile XP bar matches "Session Summary" gained amount exactly. (Verifies DB write). |
| GAM-005 | Streak Popup                 | Click Streak Flame Icon                        | Popup is **Opaque** (Text readable), not transparent.                                |

---

## Module 5: Settings & Configuration (15 tests)

### 5.1 Settings Menu

| ID      | Test Case             | Steps                    | Expected Result                    |
| ------- | --------------------- | ------------------------ | ---------------------------------- |
| SET-001 | Settings Access       | Click settings icon/link | Settings panel opens               |
| SET-002 | Studio FX Toggle      | Toggle Studio FX on/off  | Setting persists, affects practice |
| SET-003 | Show Studio Tools     | Toggle Show Studio Tools | Affects practice UI visibility     |
| SET-004 | Theme (if available)  | Change theme setting     | UI theme updates                   |
| SET-005 | Notification Settings | Toggle notifications     | Setting persists                   |

### 5.2 Latency Calibration (`/settings/latency`)

| ID      | Test Case         | Steps                        | Expected Result              |
| ------- | ----------------- | ---------------------------- | ---------------------------- |
| SET-006 | Calibration Page  | Navigate to latency settings | Calibration wizard available |
| SET-007 | Run Calibration   | Complete calibration test    | Latency offset calculated    |
| SET-008 | Apply Calibration | Save calibration result      | Offset applied to recordings |
| SET-009 | Reset Calibration | Reset to default             | Offset returns to 0          |

### 5.3 Support & Feedback

| ID      | Test Case        | Steps                     | Expected Result                 |
| ------- | ---------------- | ------------------------- | ------------------------------- |
| SET-010 | Report Bug Link  | Click "Report Bug"        | Redirect to `/feedback`         |
| SET-011 | Submit Feedback  | Fill form → Submit        | Success message, feedback saved |
| SET-012 | Patch Notes Page | View `/patch-notes`       | Version history visible         |
| SET-013 | Version Display  | Check version in settings | Shows "v0.9.993"                |
| SET-014 | Legal Links      | Click Terms/Privacy       | Legal pages load correctly      |
| SET-015 | Contact/Support  | Find support contact      | Contact info available          |

---

## Module 6: Premium & Monetization (12 tests)

### 6.1 Subscription Modal

| ID       | Test Case                 | Steps                 | Expected Result                    |
| -------- | ------------------------- | --------------------- | ---------------------------------- |
| PREM-001 | Modal Trigger (Beat)      | Click locked beat     | Premium modal appears              |
| PREM-002 | Modal Trigger (Recording) | Hit recording limit   | Premium modal appears              |
| PREM-003 | Modal Content             | View modal            | Pricing, features listed clearly   |
| PREM-004 | Dynamic Beat Count        | Check modal beatCount | Shows actual DB count (not "100+") |
| PREM-005 | Monthly Plan CTA          | Click Monthly button  | Redirects to Stripe Checkout       |
| PREM-006 | Annual Plan CTA           | Click Annual button   | Redirects to Stripe Checkout       |

### 6.2 Feature Gating

| ID       | Test Case           | Steps                       | Expected Result           |
| -------- | ------------------- | --------------------------- | ------------------------- |
| PREM-007 | Free Beat Access    | Access as free user         | All free beats playable   |
| PREM-008 | Pro Beat Lock       | Click Pro beat as free user | Locked, upgrade prompt    |
| PREM-009 | Pro Beat Unlock     | Click Pro beat as Pro user  | Beat plays normally       |
| PREM-010 | Recording Limit     | Free user records >10min    | Session ends at limit     |
| PREM-011 | Unlimited Recording | Pro user records >10min     | No limit enforced         |
| PREM-012 | Upload Beat (Pro)   | Upload custom beat as Pro   | Beat uploads successfully |

---

## Module 7: Admin Panel (13 tests)

### 7.1 Admin Dashboard (`/admin`)

| ID        | Test Case        | Steps                              | Expected Result                  |
| --------- | ---------------- | ---------------------------------- | -------------------------------- |
| ADMIN-001 | Dashboard Load   | Navigate to `/admin` as superadmin | Dashboard with all cards visible |
| ADMIN-002 | Non-Admin Access | Visit `/admin` as regular user     | Redirect or access denied        |

### 7.2 Beat Management (`/admin/beats`)

| ID        | Test Case            | Steps                         | Expected Result                                              |
| --------- | -------------------- | ----------------------------- | ------------------------------------------------------------ |
| ADMIN-003 | Beat List            | View beats page               | All beats listed with controls                               |
| ADMIN-004 | Edit Beat Title      | Click edit → Change title     | Title updates                                                |
| ADMIN-005 | Toggle Pro/Free      | Click badge to toggle         | isPremium status changes                                     |
| ADMIN-006 | **Sort Persistence** | Reorder beats -> Refresh Page | New order **Persists**. (Verifies deterministic sort logic). |
| ADMIN-007 | Delete Beat          | Click delete → Confirm        | Beat removed                                                 |

### 7.3 Feedback Viewer (`/admin/feedback`)

| ID        | Test Case        | Steps                    | Expected Result                |
| --------- | ---------------- | ------------------------ | ------------------------------ |
| ADMIN-008 | Feedback List    | View feedback page       | All submissions visible        |
| ADMIN-009 | Feedback Details | View individual feedback | Type, message, user info shown |

### 7.4 Beat Upload (`/admin/upload-beat`)

| ID        | Test Case       | Steps                  | Expected Result       |
| --------- | --------------- | ---------------------- | --------------------- |
| ADMIN-010 | Upload New Beat | Fill form → Upload MP3 | Beat added to library |

### 7.5 Bug Regression Suite (V3)

| ID      | Test Case               | Steps                     | Expected Result                                                         |
| ------- | ----------------------- | ------------------------- | ----------------------------------------------------------------------- |
| BUG-001 | **Report Bug Redirect** | Settings > Report Bug     | Redirects to `/feedback` (NOT `/patch-notes#feedback`).                 |
| BUG-002 | Admin Upload UI         | Toggle "Premium" slider   | Slider moves, className text **not** visible on screen (Fixes JSX bug). |
| BUG-003 | Beat Label Safety       | Upload beat without label | Defaults gracefully, no crash on `null` label.                          |

---

## Module 8: Mobile & Responsiveness (10 tests)

### 8.1 Layout

| ID      | Test Case           | Steps                 | Expected Result                   |
| ------- | ------------------- | --------------------- | --------------------------------- |
| MOB-001 | Landing (Mobile)    | View landing on phone | Fully responsive, no overflow     |
| MOB-002 | Practice (Mobile)   | Use practice on phone | Controls accessible, word visible |
| MOB-003 | Navigation (Mobile) | Use bottom nav        | All icons work, pages load        |
| MOB-004 | Settings (Mobile)   | Open settings panel   | Scrollable, all options visible   |
| MOB-005 | Modal (Mobile)      | Trigger any modal     | Modal fits screen, scrollable     |

### 8.2 Touch Interactions

| ID      | Test Case      | Steps                    | Expected Result                   |
| ------- | -------------- | ------------------------ | --------------------------------- |
| MOB-006 | Swipe Gestures | Swipe on carousels/lists | Smooth native-feeling swipe       |
| MOB-007 | Tap Targets    | Tap all buttons/links    | 44px+ touch targets               |
| MOB-008 | Form Inputs    | Fill forms on mobile     | Keyboard doesn't obscure input    |
| MOB-009 | Scroll         | Scroll all pages         | Smooth, no stuck elements         |
| MOB-010 | Orientation    | Rotate device            | Layout adapts (or locks properly) |

---

## Module 9: API & Network (10 tests)

### 9.1 API Endpoints

| ID      | Test Case                  | Steps                   | Expected Result               |
| ------- | -------------------------- | ----------------------- | ----------------------------- |
| API-001 | GET /api/beats             | curl request            | Returns beat array with count |
| API-002 | GET /api/words/random      | curl with params        | Returns random words          |
| API-003 | POST /api/feedback         | Submit feedback via API | Feedback saved to DB          |
| API-004 | GET /api/user/stats        | Authenticated request   | Returns user statistics       |
| API-005 | GET /api/user/achievements | Authenticated request   | Returns achievement progress  |

### 9.2 Error Handling

| ID      | Test Case     | Steps                     | Expected Result          |
| ------- | ------------- | ------------------------- | ------------------------ |
| API-006 | 404 Page      | Visit `/nonexistent`      | Custom 404 page shown    |
| API-007 | API Error     | Force API error           | Graceful error message   |
| API-008 | Offline Mode  | Disable network → Use app | Fallback behavior works  |
| API-009 | Slow Network  | Throttle to 3G            | Loading states shown     |
| API-010 | Rate Limiting | Rapid API requests        | 429 or graceful handling |

---

## Module 10: Security & Edge Cases (10 tests)

### 10.1 Security

| ID      | Test Case         | Steps                           | Expected Result                |
| ------- | ----------------- | ------------------------------- | ------------------------------ |
| SEC-001 | XSS Input         | Enter `<script>` in text fields | Input sanitized, no execution  |
| SEC-002 | CSRF Protection   | Attempt cross-site request      | Request blocked or validated   |
| SEC-003 | Auth Token Expiry | Wait for token expiry           | Graceful re-auth prompt        |
| SEC-004 | Unauthorized API  | Call protected API without auth | 401 response                   |
| SEC-005 | SQL Injection     | Attempt SQL in inputs           | Query parameterized, no effect |

### 10.2 Edge Cases

| ID       | Test Case     | Steps                        | Expected Result                          |
| -------- | ------------- | ---------------------------- | ---------------------------------------- |
| EDGE-001 | Long Username | Create 50+ char username     | Truncated or validated                   |
| EDGE-002 | Empty Session | Start/stop immediately       | No crash, no empty recording             |
| EDGE-003 | Rapid Actions | Click buttons rapidly        | No duplicate requests/actions            |
| EDGE-004 | Browser Back  | Use back button mid-flow     | Graceful navigation                      |
| EDGE-005 | Tab Switch    | Switch tabs during recording | Recording continues or pauses gracefully |

---

## Module 11: Android TWA & PWA (New Module)

_Critically important for the Play Store release._

### 11.1 PWA Foundation

| ID      | Test Case          | Steps                          | Expected Result                                                   |
| ------- | ------------------ | ------------------------------ | ----------------------------------------------------------------- |
| TWA-001 | Manifest Validity  | Inspect Application > Manifest | No warnings. `start_url`, `theme_color` (#7D7AFF), icons present. |
| TWA-002 | Offline Fallback   | Network Offline -> Refresh     | Custom "Beats Lab Offline" page loads (Service Worker active).    |
| TWA-003 | Add to Home Screen | Trigger A2HS (Browser menu)    | Installs with correct "FreeStyla" name and Maskable Icon.         |

### 11.2 Trusted Web Activity (TWA)

| ID      | Test Case                   | Steps                                | Expected Result                                                        |
| ------- | --------------------------- | ------------------------------------ | ---------------------------------------------------------------------- |
| TWA-004 | **AssetLinks Verification** | Visit `/.well-known/assetlinks.json` | Returns JSON with correct SHA-256 fingerprint for Play Store.          |
| TWA-005 | Status Bar Color            | Open TWA behavior                    | Status bar matches app theme (Purple/Dark), not generic browser white. |
| TWA-006 | Navigation Bar              | Check Android bottom nav             | No double nav bars (Browser URL bar hidden).                           |
| TWA-007 | Orientation Lock            | Rotate phone                         | App stays Portrait (if specified in manifest).                         |

---

## Module 12: The "Graveyard" (Regression Tests)

_Ensuring removed features don't haunt the code and weird bugs don't respawn._

| ID      | Test Case                | Steps                                                              | Expected Result                                                                                                 |
| ------- | ------------------------ | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| RGR-001 | **TTS Stop-on-Discard**  | Start session -> Wait for word spoken -> Immediately Click Discard | **Audio Cutoff**. Voice stops INSTANTLY. No "ghost" word finishes speaking after screen change.                 |
| RGR-002 | **Word Theme Zero**      | Check `PracticeControls` & `DifficultySelection`                   | **NO "Theme" Dropdown**. Feature should be invisible. UI code fully cleaned.                                    |
| RGR-003 | Slider Text Leak         | Check Admin Toggle Sliders                                         | **No ClassName Text**. The toggle switch should look like a switch, not display `relative inline-flex...` text. |
| RGR-004 | **Timer Speed (2x Bug)** | Start Session -> Compare with Stopwatch (10s)                      | **Accurate Time**. Timer should NOT tick down 2x as fast (StrictMode duplicate bug).                            |
| RGR-005 | **Spacebar Safety**      | Type in a text area (e.g. Feedback) -> Press Space                 | **Text input only**. Should NOT toggle play/pause while typing.                                                 |
| RGR-006 | **Exit Resume Flow**     | Recording -> Back Button -> "Stay"/Cancel                          | **Audio Resumes**. Music should start playing again immediately after cancelling exit.                          |
| RGR-007 | **Clean Navigation**     | Save Session -> Navigate Away                                      | **No "Leave Site?" Alert**. Browser should trust that the session is saved.                                     |

---

## Module 13: Stress & Reliability

_Pushing the app to the breaking point._

| ID         | Test Case                | Steps                                                        | Expected Result                                                                   |
| ---------- | ------------------------ | ------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| STRESS-001 | **Screen Lock Survival** | Start Session -> **Lock Phone Screen** -> Wait 30s -> Unlock | Audio continues (or resumes instantly). Timer remains accurate (WakeLock worked). |
| STRESS-002 | **Network Cut (Upload)** | Finish Recording -> **Airplane Mode** -> Click Save          | Graceful Error ("Upload Failed") or localized Retry. **NO Crash/White Screen**.   |
| STRESS-003 | Rapid Fire Discard       | Start -> Discard -> Start -> Discard (Fast)                  | App state remains stable. No double-playing audio layers.                         |
| STRESS-004 | Long Session Memory      | Record for 9m 59s (Pro)                                      | Browser doesn't crash. Waveform visualization remains smooth.                     |

---

## Execution & Reporting

### Bug Report Template

```markdown
## Bug Report: [TITLE]

**ID**: [TEST-ID]
**Severity**: Critical / High / Medium / Low
**Module**: [Module Name]
**Steps to Reproduce**:

1.
2.
3. **Expected**:
   **Actual**:
   **Screenshots/Video**:
   **Device/Browser**:
   **Tester**:
   **Date**:
```

---

## Summary of Final Testing Plan

| Module      | V2 Count | V3 Count | Primary Focus            |
| ----------- | -------- | -------- | ------------------------ |
| Auth        | 15       | 17       | Schema Stability         |
| Audio       | 20       | 22       | Cypher & URL Fixes       |
| Core Flow   | 25       | 28       | UI Clarity               |
| Profile     | 20       | 25       | Gamification Logic       |
| Settings    | 15       | 15       | Configuration            |
| Premium     | 12       | 12       | Monetization             |
| Admin       | 10       | 13       | UI Regressions           |
| Mobile      | 10       | 10       | Responsiveness           |
| API         | 10       | 10       | Network                  |
| Security    | 10       | 10       | Hardening                |
| Android/TWA | 0        | 7        | **Play Store**           |
| Regressions | 0        | 7        | **Ghost Features**       |
| Stress      | 0        | 4        | **Reliability**          |
| **TOTAL**   | **147**  | **180+** | **Production Stability** |
