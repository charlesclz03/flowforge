#  Freestyla V1.0 - Comprehensive Testing Plan (Quality Assurance)

**Status**:  Ready for Execution
**Objective**: Validate end-to-end functionality of all 7 phases before Production Launch.

---

##  Priority 1: Core Mechanics (The "Must Haves")

### 1.1 Authentication & Session Management

- [ ] **Google Sign-In**: Login with existing account.
- [ ] **Sign-Up**: Create new account via Google.
- [ ] **Guest Mode**: Record without login -> Trigger Modal -> Sign In -> Verify Recording Saved.
- [ ] **Session Persistence**: Refresh page; ensure user remains logged in.
- [ ] **Sign Out**: Verify correct redirect and cookie clearing.

### 1.2 The Audio Engine (Critical Path)

- [ ] **Beat Playback**: Plays immediately, loops correctly.
- [ ] **Word Alignment**: Words appear continuously on beat (check 4/8/16 bar frequency).
- [ ] **Recording**: Mic permission prompt, visual waveform activity.
- [ ] **Latency**: Run "Calibration Wizard" and verify offset is applied.
- [ ] **Mobile Background**: Lock screen / background tab behavior (Audio Ducking).

### 1.3 Recording Management

- [ ] **Save Flow**: Finish recording -> "Save" -> Verify in Library.
- [ ] **Playback**: Play saved recording from `/recordings` list.
- [ ] **Deletion**: Delete recording -> Verify removed from UI and Storage (if possible).
- [ ] **Download**: Click "Download" -> Check MP3 file integrity.

---

##  Priority 2: Premium & Monetization (Phase 5)

### 2.1 Subscription Flow

- [ ] **Upgrade Button**: Click "Get Premium" -> Redirect to Stripe Checkout.
- [ ] **Purchase**: Complete test purchase (Stripe Test Mode) -> Verify Redirect to `/profile`.
- [ ] **Entitlement**: Verify `subscriptionStatus` updates to 'active' immediately (or via webhook).
- [ ] **Portal**: Click "Manage Subscription" -> Redirect to Stripe Customer Portal.

### 2.2 Feature Gating

- [ ] **Beat Access**: Free user clicking "Premium" beat -> Locked/Upgrade Prompt.
- [ ] **Pro Access**: Premium user clicking "Premium" beat -> Beat Loads.
- [ ] **Unlimited Recording**: Record > 2 mins as Pro (Free tier limited to 2m).

---

##  Priority 3: Social Ecosystem (Phase 6)

### 3.1 Profile & Feed

- [ ] **Public Profile**: Visit `/u/[username]` as unauthenticated user -> See stats/tracks.
- [ ] **Follow System**: Follow user -> Verify count increments -> Verify "Following" feed updates.
- [ ] **Global Feed**: Verify `/feed` loads "Trending" items.

### 3.2 Interaction

- [ ] **Like**: Like a track -> Count updates optimistically -> Persists on refresh.
- [ ] **Duel**: Vote on a duel -> Percentage updates -> Cannot vote twice.

---

##  Priority 4: Operations & Polish (Phase 7)

### 4.1 Data Integrity

- [ ] **Word Vault**: Complete session -> Check Profile "Word Vault" count increases.
- [ ] **Badges**: Trigger a badge condition (e.g., "The Listener") -> Check Profile badges.

### 4.2 Edge Cases

- [ ] **Offline Mode**: Disconnect Network -> Try to Save -> Check Error Handling/IndexedDB fallback.
- [ ] **404 Handling**: Visit invalid URL -> Check Custom 404 Page.

---

##  Execution Log

| Test ID | Feature          | Status | Notes |
| :------ | :--------------- | :----- | :---- |
| T-001   | Auth - Login     | ⬜️     |       |
| T-002   | Audio - Playback | ⬜️     |       |
| ...     | ...              | ...    |       |
