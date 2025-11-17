# FlowForge MVP Build Plan

**Date**: November 6, 2025  
**Status**: 📋 Build Requirements Defined  
**Estimated Time**: 45-71 hours of development

---

## 🎯 Executive Summary

**Current State**: Infrastructure (backend, database, APIs) is 100% complete. Marketing page is deployed.

**Gap**: The actual MVP user interface and user journey are **not built**.

**Goal**: Build the complete practice application so users can:
1. Sign in with Google
2. Select a beat and configure practice settings
3. Play beat with on-beat word prompts
4. Record their freestyle
5. Review and save their session

---

## 📊 What's Already Built (Infrastructure)

### ✅ Backend & Database (100%)
- Supabase PostgreSQL database
- Prisma ORM configured
- 15 beats seeded (with BPM, genre, URLs)
- 45 words seeded (with difficulty levels)
- All database migrations applied

### ✅ API Endpoints (100%)
- `GET /api/beats` - Returns all beats
- `GET /api/beats?free=true` - Returns free beats only
- `GET /api/words/random?difficulty=medium&count=10` - Returns random words
- `GET /api/sessions` - Returns user sessions
- `POST /api/sessions` - Creates new session

### ✅ Visual Assets (100%)
- Favicon (all sizes)
- PWA icons
- OG image for social sharing
- Brand colors and design system

### ✅ Marketing Page (100%)
- Landing page deployed at https://flowforge-pi.vercel.app
- Hero section with animated timer (decorative)
- Feature showcase
- "Join waitlist" CTA

---

## ❌ What Needs to Be Built (MVP User Journey)

### Phase 1: Authentication (5-8 hours)

**Goal**: Users can sign in with Google and have persistent sessions.

#### 1.1 NextAuth.js Setup
- [ ] Install NextAuth.js: `npm install next-auth`
- [ ] Create `/app/api/auth/[...nextauth]/route.ts`
- [ ] Configure Google OAuth provider
- [ ] Set up session strategy (JWT or database)
- [ ] Add environment variables:
  ```bash
  GOOGLE_CLIENT_ID=your_client_id
  GOOGLE_CLIENT_SECRET=your_client_secret
  NEXTAUTH_SECRET=your_secret
  NEXTAUTH_URL=http://localhost:3000
  ```

#### 1.2 User Model & Database
- [ ] Add `User` model to Prisma schema
- [ ] Add `Account` and `Session` models (NextAuth tables)
- [ ] Create migration: `npx prisma migrate dev --name add-auth`
- [ ] Update `FreestyleSession` to include `userId` foreign key

#### 1.3 Auth UI Components
- [ ] Create `SignInButton` component
- [ ] Create `SignOutButton` component
- [ ] Create `UserAvatar` component (shows user photo/name)
- [ ] Add auth status to header/nav

#### 1.4 Protected Routes
- [ ] Create middleware to protect `/practice` and `/review` routes
- [ ] Redirect unauthenticated users to landing page
- [ ] Show "Sign in to continue" message

**Files to Create/Modify:**
- `app/api/auth/[...nextauth]/route.ts` (new)
- `prisma/schema.prisma` (update)
- `components/auth/SignInButton.tsx` (new)
- `components/auth/SignOutButton.tsx` (new)
- `components/auth/UserAvatar.tsx` (new)
- `middleware.ts` (new)

**Reference**: See `DOCS/AUTH_SETUP.md` for detailed guide.

---

### Phase 2: Practice Page UI (20-30 hours)

**Goal**: Users can configure and start a practice session.

#### 2.1 Practice Page Route
- [ ] Create `/app/practice/page.tsx`
- [ ] Set up page layout with responsive design
- [ ] Add loading states
- [ ] Add error boundaries

#### 2.2 Beat Selector Component
- [ ] Create `BeatSelector` component
- [ ] Fetch beats from `/api/beats?free=true`
- [ ] Display beat cards with:
  - Beat title
  - Artist name
  - BPM
  - Genre
  - Duration
  - Premium badge (if applicable)
- [ ] Allow user to select one beat
- [ ] Store selected beat in state

#### 2.3 Configuration Controls
- [ ] Create `FrequencySelector` component
  - Toggle buttons: 4 bars / 8 bars / 16 bars
  - Default: 8 bars
  - Store in state
- [ ] Create `DifficultySelector` component
  - Toggle buttons: Easy / Medium / Hard
  - Default: Medium
  - Store in state
- [ ] Visual feedback for selected options

#### 2.4 Timer Ring Component (Functional)
- [ ] Create `TimerRing` component (currently decorative)
- [ ] Calculate total session time (default: 2 minutes for free tier)
- [ ] Animate ring countdown synchronized with beat
- [ ] Display time remaining (MM:SS format)
- [ ] Pause/resume functionality
- [ ] Reset functionality

#### 2.5 Play/Stop Button
- [ ] Create large, prominent button
- [ ] States: Ready / Playing / Paused / Stopped
- [ ] Disabled state when no beat selected
- [ ] Visual feedback on interaction
- [ ] Keyboard shortcut (spacebar)

#### 2.6 Word Prompt Display
- [ ] Create `WordPrompt` component
- [ ] Large, centered text display
- [ ] Fetch words from `/api/words/random?difficulty=X&count=Y`
- [ ] Calculate word count based on:
  - Session duration (2 minutes = 120 seconds)
  - Beat BPM
  - Frequency (4/8/16 bars)
  - Formula: `wordsNeeded = (duration / secondsPerPrompt)`
- [ ] Animate word appearance (fade in/out)
- [ ] Sync with beat timing

#### 2.7 Recording Status Indicator
- [ ] Create `RecordingIndicator` component
- [ ] Show microphone status (requesting / granted / denied)
- [ ] Show recording status (idle / recording / paused)
- [ ] Red dot animation when recording
- [ ] Audio level meter (optional but nice)

**Files to Create:**
- `app/practice/page.tsx` (new)
- `components/practice/BeatSelector.tsx` (new)
- `components/practice/FrequencySelector.tsx` (new)
- `components/practice/DifficultySelector.tsx` (new)
- `components/practice/TimerRing.tsx` (update existing)
- `components/practice/PlayButton.tsx` (new)
- `components/practice/WordPrompt.tsx` (new)
- `components/practice/RecordingIndicator.tsx` (new)
- `lib/audio/timing.ts` (new - timing calculations)

**Key Calculations:**

```typescript
// Calculate seconds per bar
const secondsPerBar = (60 / bpm) * 4; // 4 beats per bar

// Calculate seconds per prompt
const secondsPerPrompt = secondsPerBar * frequency; // frequency = 4, 8, or 16

// Calculate number of prompts needed
const totalPrompts = Math.floor(sessionDuration / secondsPerPrompt);

// Example: 90 BPM, 8 bars, 120 seconds
// secondsPerBar = (60 / 90) * 4 = 2.67 seconds
// secondsPerPrompt = 2.67 * 8 = 21.33 seconds
// totalPrompts = 120 / 21.33 = 5.6 ≈ 5 prompts
```

---

### Phase 3: Audio System (10-15 hours)

**Goal**: Play beats, record vocals, sync word prompts to beat timing.

#### 3.1 Beat Playback
- [ ] Create `BeatPlayer` class using Web Audio API
- [ ] Load audio file from beat `storageUrl`
- [ ] Implement play/pause/stop controls
- [ ] Loop beat for session duration
- [ ] Volume control
- [ ] Handle audio loading errors

#### 3.2 Microphone Recording
- [ ] Create `MicrophoneRecorder` class
- [ ] Request microphone permission
- [ ] Use MediaRecorder API
- [ ] Record audio in WebM format
- [ ] Handle permission denied
- [ ] Handle browser compatibility (Safari, Chrome, Firefox)

#### 3.3 Audio Mixing (Optional for MVP)
- [ ] Mix beat and vocal tracks (if needed)
- [ ] Or save separately and play together on review

#### 3.4 BPM Synchronization
- [ ] Create `BeatTimer` class
- [ ] Calculate bar intervals based on BPM
- [ ] Emit events at bar boundaries
- [ ] Sync word prompts to bar events
- [ ] Sync timer ring to bar events
- [ ] Handle tempo drift (use audio context time, not Date.now())

#### 3.5 Session Recording
- [ ] Start recording when user presses PLAY
- [ ] Stop recording at 2-minute mark (free tier limit)
- [ ] Convert recorded audio to Blob
- [ ] Prepare for upload

**Files to Create:**
- `lib/audio/BeatPlayer.ts` (new)
- `lib/audio/MicrophoneRecorder.ts` (new)
- `lib/audio/BeatTimer.ts` (new)
- `lib/audio/AudioMixer.ts` (new, optional)
- `hooks/useBeatPlayer.ts` (new - React hook)
- `hooks/useMicrophone.ts` (new - React hook)
- `hooks/useBeatTimer.ts` (new - React hook)

**Key Technologies:**
- Web Audio API for beat playback
- MediaRecorder API for vocal recording
- AudioContext for precise timing
- MediaStream for microphone access

**Browser Compatibility Notes:**
- Safari requires user interaction before audio playback
- Firefox and Chrome have different MediaRecorder formats
- iOS Safari has restrictions on audio autoplay

---

### Phase 4: Session Save & Upload (5-8 hours)

**Goal**: Save completed sessions to database and storage.

#### 4.1 Session Metadata
- [ ] Collect session data:
  - User ID
  - Beat ID
  - Duration
  - Word frequency
  - Difficulty
  - Timestamp
- [ ] Create session object

#### 4.2 Audio Upload
- [ ] Convert recorded Blob to File
- [ ] Upload to temporary storage (for MVP, can use base64 in DB)
- [ ] Or implement Google Cloud Storage upload (see `DOCS/GCS_UPLOAD_PLAN.md`)
- [ ] Get storage URL

#### 4.3 Save to Database
- [ ] Call `POST /api/sessions` with:
  ```json
  {
    "beatId": "beat-id",
    "duration": 120,
    "recordingUrl": "storage-url-or-base64",
    "wordFrequency": 8,
    "difficulty": "medium"
  }
  ```
- [ ] Handle success/error responses
- [ ] Show success message to user

#### 4.4 Redirect to Review
- [ ] After save, redirect to `/review/[sessionId]`
- [ ] Pass session data via URL params or fetch from API

**Files to Create/Modify:**
- `lib/api/uploadSession.ts` (new)
- `lib/storage/audioUpload.ts` (new)
- `app/api/sessions/route.ts` (update to accept audio data)

**Storage Options for MVP:**
1. **Base64 in Database** (simplest, not scalable)
   - Encode audio as base64 string
   - Store in `recordingUrl` field
   - Decode on playback
   - Limit: Database size, slow queries

2. **Google Cloud Storage** (recommended)
   - Upload to GCS bucket
   - Store public URL in database
   - See `DOCS/GCS_UPLOAD_PLAN.md`

---

### Phase 5: Review/Playback Page (5-8 hours)

**Goal**: Users can listen to their completed sessions.

#### 5.1 Review Page Route
- [ ] Create `/app/review/[sessionId]/page.tsx`
- [ ] Fetch session data from `/api/sessions?id=[sessionId]`
- [ ] Handle loading state
- [ ] Handle session not found

#### 5.2 Session Display
- [ ] Show session metadata:
  - Date/time
  - Beat used
  - Duration
  - Difficulty
  - Word frequency
- [ ] Show beat artwork (if available)

#### 5.3 Audio Playback Controls
- [ ] Create `AudioPlayer` component
- [ ] Load session recording URL
- [ ] Play/pause button
- [ ] Progress bar
- [ ] Volume control
- [ ] Time display (current / total)

#### 5.4 Actions
- [ ] "Practice Again" button → back to `/practice`
- [ ] "Share" button (copy link, social share)
- [ ] "Delete" button (with confirmation)
- [ ] "Download" button (optional)

#### 5.5 Session List View
- [ ] Create `/app/sessions/page.tsx`
- [ ] Fetch all user sessions from `/api/sessions`
- [ ] Display as grid or list
- [ ] Show preview info for each session
- [ ] Click to go to review page

**Files to Create:**
- `app/review/[sessionId]/page.tsx` (new)
- `app/sessions/page.tsx` (new)
- `components/review/AudioPlayer.tsx` (new)
- `components/review/SessionCard.tsx` (new)
- `components/review/ShareButton.tsx` (new)

---

### Phase 6: Navigation & User Flow (3-5 hours)

**Goal**: Connect all pages with intuitive navigation.

#### 6.1 Update Header/Nav
- [ ] Add navigation links:
  - Home (landing page)
  - Practice (if authenticated)
  - My Sessions (if authenticated)
- [ ] Add user avatar/menu (if authenticated)
- [ ] Add sign in/out buttons

#### 6.2 Update Landing Page
- [ ] Change "Join Waitlist" to "Start Practicing" (if authenticated)
- [ ] Or "Sign In to Start" (if not authenticated)
- [ ] Link to `/practice` page

#### 6.3 Onboarding Flow (Optional)
- [ ] First-time user tutorial
- [ ] Explain beat selection
- [ ] Explain word prompts
- [ ] Explain recording

#### 6.4 Empty States
- [ ] No sessions yet → encourage first practice
- [ ] No beats available → show error
- [ ] Microphone denied → show instructions

**Files to Modify:**
- `app/page.tsx` (landing page)
- `components/Header.tsx` or `components/Nav.tsx`
- `components/EmptyState.tsx` (new)

---

### Phase 7: Testing & Polish (5-10 hours)

**Goal**: Ensure MVP works reliably across browsers and devices.

#### 7.1 Cross-Browser Testing
- [ ] Test on Chrome (desktop)
- [ ] Test on Firefox (desktop)
- [ ] Test on Safari (desktop)
- [ ] Test on Safari (iOS)
- [ ] Test on Chrome (Android)

#### 7.2 Responsive Design
- [ ] Test on mobile (320px - 480px)
- [ ] Test on tablet (768px - 1024px)
- [ ] Test on desktop (1280px+)
- [ ] Ensure touch targets are large enough (44px minimum)

#### 7.3 Error Handling
- [ ] Test with no internet connection
- [ ] Test with slow connection
- [ ] Test with microphone denied
- [ ] Test with audio playback blocked
- [ ] Test with invalid session ID
- [ ] Show helpful error messages

#### 7.4 Performance
- [ ] Optimize audio loading (preload, lazy load)
- [ ] Optimize image loading
- [ ] Check bundle size
- [ ] Test on slow devices

#### 7.5 Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader support
- [ ] ARIA labels on interactive elements
- [ ] Focus states visible
- [ ] Color contrast meets WCAG AA

#### 7.6 User Experience
- [ ] Loading states feel responsive
- [ ] Animations are smooth
- [ ] Feedback is immediate
- [ ] Instructions are clear
- [ ] Errors are helpful

**Testing Checklist:**
- [ ] Can sign in with Google
- [ ] Can select a beat
- [ ] Can choose frequency and difficulty
- [ ] Can start practice session
- [ ] Beat plays correctly
- [ ] Microphone records correctly
- [ ] Word prompts appear on-beat
- [ ] Timer counts down accurately
- [ ] Session stops at 2 minutes
- [ ] Session saves successfully
- [ ] Can review saved session
- [ ] Can play back recording
- [ ] Can navigate between pages
- [ ] Can sign out

---

## 📁 File Structure (After MVP Build)

```
flowforge/
├── app/
│   ├── page.tsx                          # Landing page (existing)
│   ├── practice/
│   │   └── page.tsx                      # Practice page (NEW)
│   ├── review/
│   │   └── [sessionId]/
│   │       └── page.tsx                  # Review page (NEW)
│   ├── sessions/
│   │   └── page.tsx                      # Session list (NEW)
│   └── api/
│       ├── auth/
│       │   └── [...nextauth]/
│       │       └── route.ts              # NextAuth (NEW)
│       ├── beats/
│       │   └── route.ts                  # Existing
│       ├── words/
│       │   └── random/
│       │       └── route.ts              # Existing
│       └── sessions/
│           ├── route.ts                  # Existing
│           └── upload/
│               └── route.ts              # Existing
├── components/
│   ├── auth/
│   │   ├── SignInButton.tsx              # NEW
│   │   ├── SignOutButton.tsx             # NEW
│   │   └── UserAvatar.tsx                # NEW
│   ├── practice/
│   │   ├── BeatSelector.tsx              # NEW
│   │   ├── FrequencySelector.tsx         # NEW
│   │   ├── DifficultySelector.tsx        # NEW
│   │   ├── TimerRing.tsx                 # UPDATE (make functional)
│   │   ├── PlayButton.tsx                # NEW
│   │   ├── WordPrompt.tsx                # NEW
│   │   └── RecordingIndicator.tsx        # NEW
│   ├── review/
│   │   ├── AudioPlayer.tsx               # NEW
│   │   ├── SessionCard.tsx               # NEW
│   │   └── ShareButton.tsx               # NEW
│   ├── Header.tsx                        # UPDATE
│   └── EmptyState.tsx                    # NEW
├── lib/
│   ├── audio/
│   │   ├── BeatPlayer.ts                 # NEW
│   │   ├── MicrophoneRecorder.ts         # NEW
│   │   ├── BeatTimer.ts                  # NEW
│   │   ├── AudioMixer.ts                 # NEW (optional)
│   │   └── timing.ts                     # NEW
│   ├── api/
│   │   └── uploadSession.ts              # NEW
│   └── storage/
│       └── audioUpload.ts                # NEW
├── hooks/
│   ├── useBeatPlayer.ts                  # NEW
│   ├── useMicrophone.ts                  # NEW
│   └── useBeatTimer.ts                   # NEW
├── middleware.ts                         # NEW (auth protection)
└── prisma/
    └── schema.prisma                     # UPDATE (add User, Account, Session)
```

---

## 🎯 MVP Feature Checklist

### Core User Journey
- [ ] User can sign in with Google
- [ ] User lands on practice page after sign in
- [ ] User can browse and select from 15 beats
- [ ] User can choose word frequency (4/8/16 bars)
- [ ] User can choose difficulty (Easy/Medium/Hard)
- [ ] User can press PLAY to start session
- [ ] Beat plays through speakers
- [ ] Microphone records user's voice
- [ ] Word prompts appear on-beat (synced to BPM)
- [ ] Timer ring counts down from 2:00 to 0:00
- [ ] Session automatically stops at 2 minutes
- [ ] Session saves to database
- [ ] User redirects to review page
- [ ] User can play back their recording
- [ ] User can see list of all their sessions
- [ ] User can sign out

### Technical Requirements
- [ ] Works in Chrome, Firefox, Safari
- [ ] Works on desktop and mobile
- [ ] Handles microphone permission denied gracefully
- [ ] Handles slow/no internet connection
- [ ] Audio timing is accurate (no drift)
- [ ] Recording quality is acceptable
- [ ] Page load time < 3 seconds
- [ ] No console errors in production

### Business Requirements
- [ ] Free tier limited to 2-minute recordings
- [ ] Free tier only accesses free beats
- [ ] AdSense ads displayed (if env var set)
- [ ] Analytics tracking (optional)
- [ ] SEO metadata on all pages

---

## ⏱️ Time Estimates by Phase

| Phase | Description | Estimated Time |
|-------|-------------|----------------|
| 1 | Authentication (NextAuth.js) | 5-8 hours |
| 2 | Practice Page UI | 20-30 hours |
| 3 | Audio System | 10-15 hours |
| 4 | Session Save & Upload | 5-8 hours |
| 5 | Review/Playback Page | 5-8 hours |
| 6 | Navigation & User Flow | 3-5 hours |
| 7 | Testing & Polish | 5-10 hours |
| **TOTAL** | **Full MVP Implementation** | **53-84 hours** |

**Realistic Timeline:**
- **Part-time (10 hrs/week)**: 5-8 weeks
- **Full-time (40 hrs/week)**: 1.5-2 weeks
- **Intensive (60 hrs/week)**: 1 week

---

## 🚀 Recommended Build Order

### Week 1: Core Functionality
1. **Day 1-2**: Authentication (Phase 1)
   - Set up NextAuth.js
   - Add Google OAuth
   - Create sign-in flow
   
2. **Day 3-5**: Practice Page Structure (Phase 2, parts 1-3)
   - Create practice page route
   - Build beat selector
   - Build configuration controls

3. **Day 6-7**: Audio System Foundation (Phase 3, parts 1-2)
   - Implement beat playback
   - Implement microphone recording

### Week 2: Integration & Polish
4. **Day 8-10**: Audio Synchronization (Phase 3, parts 3-4)
   - BPM timing system
   - Word prompt display
   - Timer ring functionality

5. **Day 11-12**: Session Management (Phase 4 & 5)
   - Save sessions to database
   - Build review page
   - Build session list

6. **Day 13-14**: Testing & Polish (Phase 7)
   - Cross-browser testing
   - Mobile responsiveness
   - Error handling
   - User experience refinement

---

## 🎨 Design Considerations

### Practice Page Layout (Desktop)

```
┌─────────────────────────────────────────────┐
│  Header: Logo | Practice | Sessions | Avatar│
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │     Beat Selector (Grid/Dropdown)   │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ 4 Bars   │  │ 8 Bars   │  │ 16 Bars  │  │
│  └──────────┘  └──────────┘  └──────────┘  │
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Easy    │  │  Medium  │  │  Hard    │  │
│  └──────────┘  └──────────┘  └──────────┘  │
│                                             │
│            ┌─────────────┐                  │
│            │             │                  │
│            │   TIMER     │                  │
│            │   RING      │                  │
│            │   2:00      │                  │
│            │             │                  │
│            └─────────────┘                  │
│                                             │
│            ┌─────────────┐                  │
│            │    PLAY     │                  │
│            └─────────────┘                  │
│                                             │
│         ┌─────────────────┐                 │
│         │   WORD PROMPT   │                 │
│         │   "CONNECTION"  │                 │
│         └─────────────────┘                 │
│                                             │
│            🔴 Recording...                  │
│                                             │
└─────────────────────────────────────────────┘
```

### Practice Page Layout (Mobile)

```
┌───────────────────┐
│ ☰  FlowForge  👤 │
├───────────────────┤
│                   │
│  Beat Selector ▼  │
│                   │
│ ┌───┐ ┌───┐ ┌───┐ │
│ │ 4 │ │ 8 │ │16 │ │
│ └───┘ └───┘ └───┘ │
│                   │
│ ┌───┐ ┌───┐ ┌───┐ │
│ │ E │ │ M │ │ H │ │
│ └───┘ └───┘ └───┘ │
│                   │
│    ┌─────────┐    │
│    │         │    │
│    │  TIMER  │    │
│    │  2:00   │    │
│    │         │    │
│    └─────────┘    │
│                   │
│   ┌───────────┐   │
│   │   PLAY    │   │
│   └───────────┘   │
│                   │
│  ┌─────────────┐  │
│  │ "CONNECTION"│  │
│  └─────────────┘  │
│                   │
│   🔴 Recording    │
│                   │
└───────────────────┘
```

---

## 🔧 Technical Challenges & Solutions

### Challenge 1: Audio Timing Accuracy
**Problem**: JavaScript timers (setTimeout, setInterval) are not precise enough for musical timing.

**Solution**: Use Web Audio API's AudioContext.currentTime for precise timing.

```typescript
class BeatTimer {
  private audioContext: AudioContext;
  private startTime: number;
  private bpm: number;

  constructor(bpm: number) {
    this.audioContext = new AudioContext();
    this.bpm = bpm;
  }

  start() {
    this.startTime = this.audioContext.currentTime;
    this.scheduleNextBeat();
  }

  private scheduleNextBeat() {
    const secondsPerBeat = 60 / this.bpm;
    const nextBeatTime = this.startTime + secondsPerBeat;
    
    // Schedule callback at exact time
    const delay = (nextBeatTime - this.audioContext.currentTime) * 1000;
    setTimeout(() => this.onBeat(), delay);
  }

  private onBeat() {
    // Trigger word prompt, update UI, etc.
    this.scheduleNextBeat();
  }
}
```

### Challenge 2: Microphone Permission
**Problem**: Users may deny microphone access or browser may block it.

**Solution**: Request permission early, show clear instructions, handle errors gracefully.

```typescript
async function requestMicrophone() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    return stream;
  } catch (error) {
    if (error.name === 'NotAllowedError') {
      // User denied permission
      showError('Microphone access is required to record your freestyle.');
    } else if (error.name === 'NotFoundError') {
      // No microphone found
      showError('No microphone detected. Please connect a microphone.');
    } else {
      // Other error
      showError('Could not access microphone. Please check your settings.');
    }
    return null;
  }
}
```

### Challenge 3: Audio Format Compatibility
**Problem**: Different browsers support different audio formats (WebM, MP4, WAV).

**Solution**: Detect supported format and use it, or convert on server.

```typescript
function getSupportedMimeType() {
  const types = [
    'audio/webm',
    'audio/webm;codecs=opus',
    'audio/ogg;codecs=opus',
    'audio/mp4',
  ];
  
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  
  return ''; // No supported type
}
```

### Challenge 4: Mobile Safari Restrictions
**Problem**: iOS Safari requires user interaction before playing audio.

**Solution**: Only start audio playback after user taps PLAY button.

```typescript
// Don't preload or autoplay on iOS
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

if (isIOS) {
  // Wait for user interaction
  playButton.addEventListener('click', () => {
    audioElement.play();
  });
} else {
  // Can preload on other platforms
  audioElement.preload = 'auto';
}
```

---

## 📚 Key Resources

### Documentation
- **NextAuth.js**: https://next-auth.js.org/
- **Web Audio API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- **MediaRecorder API**: https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder
- **Prisma**: https://www.prisma.io/docs/

### Internal Guides
- `DOCS/AUTH_SETUP.md` - NextAuth.js setup guide
- `DOCS/GCS_UPLOAD_PLAN.md` - Google Cloud Storage setup
- `DOCS/SETUP.md` - Development environment setup
- `TESTING.md` - API testing guide

### Example Code
- Look at existing `app/api/` routes for API patterns
- Look at `lib/db/` for database query patterns
- Look at `components/` for component structure

---

## ✅ Definition of Done

The MVP is complete when:

1. **User Journey Works End-to-End**
   - [ ] User can sign in
   - [ ] User can complete a practice session
   - [ ] User can review their recording
   - [ ] User can see their session history

2. **Technical Requirements Met**
   - [ ] All pages load without errors
   - [ ] Audio playback is smooth
   - [ ] Recording quality is acceptable
   - [ ] Timing is accurate (no noticeable drift)
   - [ ] Works on Chrome, Firefox, Safari (desktop)
   - [ ] Works on iOS Safari and Chrome Android (mobile)

3. **User Experience is Solid**
   - [ ] Instructions are clear
   - [ ] Loading states are present
   - [ ] Error messages are helpful
   - [ ] Navigation is intuitive
   - [ ] Design is polished

4. **Ready for User Testing**
   - [ ] Can deploy to Vercel without errors
   - [ ] Can onboard a new user successfully
   - [ ] Can collect feedback on the experience

---

## 🎯 Success Metrics

After MVP launch, measure:

- **Activation**: % of sign-ups who complete first session
- **Retention**: % of users who return within 7 days
- **Engagement**: Average sessions per user per week
- **Quality**: Average session duration (should approach 2 min)
- **Technical**: Error rate, page load time, audio quality

**Target for MVP Success:**
- 50%+ activation rate (sign-up → first session)
- 30%+ 7-day retention
- 2+ sessions per active user per week
- < 5% error rate
- < 3 second page load

---

## 🚀 Next Steps

1. **Review this plan** with the team
2. **Set up development environment** (if not already done)
3. **Start with Phase 1** (Authentication)
4. **Build incrementally**, testing each phase
5. **Deploy to staging** after each major phase
6. **Conduct user testing** before final launch
7. **Iterate based on feedback**

---

**Remember**: The goal is a **functional MVP**, not a perfect product. Ship it, test it, improve it.

**Focus on**:
- ✅ Core user journey working
- ✅ Audio quality acceptable
- ✅ Timing accurate
- ✅ Mobile-friendly
- ✅ Error handling

**Don't worry about** (for MVP):
- ❌ Advanced features (TTS, AI scoring, etc.)
- ❌ Perfect design polish
- ❌ Extensive beat library (15 is enough)
- ❌ Social features
- ❌ Premium tier (can add after MVP validation)

---

**Status**: Ready to build  
**Next Action**: Start Phase 1 (Authentication)  
**Estimated Completion**: 2-3 weeks (full-time) or 6-8 weeks (part-time)

---

**Last Updated**: November 6, 2025  
**Document Version**: 1.0

