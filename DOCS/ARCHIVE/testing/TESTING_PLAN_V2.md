# Archived Document

**Archived On**: 2026-02-13
**Original Path**: DOCS/testing/TESTING_PLAN_V2.md
**Canonical Replacement**: DOCS/testing/TESTING_PLAN_V3.md
**Reason**: Pre-existing historical archive metadata normalization.
**Last Verified**: 2026-02-13

---
#  FreeStyla v0.9.5 (Beta) - Professional QA Testing Plan V2

**Version**: 2.0  
**Last Updated**: January 12, 2026  
**Target**: Complete end-to-end coverage for professional app testers  
**Estimated Duration**: 4-6 hours for full execution

---

##  Pre-Test Setup

### Environment Requirements
- [ ] Chrome/Safari/Firefox (latest versions)
- [ ] Mobile device or emulator (iOS Safari, Android Chrome)
- [ ] Headphones with microphone
- [ ] Stable internet connection
- [ ] Test accounts: Guest, Free User, Pro User, Superadmin

### Test Accounts
| Role | Email | Purpose |
|------|-------|---------|
| Guest | N/A | Unauthenticated flows |
| Free User | test@freestyla.app | Standard feature access |
| Pro User | pro@freestyla.app | Premium feature access |
| Superadmin | admin@freestyla.app | Admin panel access |

---

##  Module 1: Authentication & Authorization (15 tests)

### 1.1 Sign-In/Sign-Up Flow
| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| AUTH-001 | Google Sign-In | Click "Continue with Google" → Select account | Redirect to `/difficultyselection`, user session created |
| AUTH-002 | New User Registration | Sign in with new Google account | Account created, redirected to onboarding or practice |
| AUTH-003 | Session Persistence | Sign in → Close browser → Reopen | User remains authenticated |
| AUTH-004 | Sign Out | Click Profile → Sign Out | Session cleared, redirect to landing page |
| AUTH-005 | Protected Route (Unauthenticated) | Visit `/profile` without login | Redirect to sign-in or modal prompt |

### 1.2 Role-Based Access
| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| AUTH-006 | Free User Premium Beat | Click locked (Pro) beat | Premium modal appears |
| AUTH-007 | Pro User Premium Beat | Click locked beat as Pro user | Beat loads successfully |
| AUTH-008 | Admin Panel Access (Non-Admin) | Visit `/admin` as regular user | Redirect or 403 error |
| AUTH-009 | Admin Panel Access (Superadmin) | Visit `/admin` as superadmin | Dashboard loads |
| AUTH-010 | Recording Time Limit (Free) | Record for >10 minutes as free user | Session ends at limit |

### 1.3 Guest Mode
| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| AUTH-011 | Guest Practice | Start session without login | Session plays normally |
| AUTH-012 | Guest Save Prompt | Complete session → Try to save | Sign-in modal appears |
| AUTH-013 | Guest to User Transition | Sign in after guest session | Recording saved to account |
| AUTH-014 | Guest Beat Access | Select free beats | All free beats accessible |
| AUTH-015 | Guest Premium Beat | Click premium beat | Upgrade prompt shown |

---

##  Module 2: Audio Engine & Beat Playback (20 tests)

### 2.1 Beat Library (`/tracks`)
| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| AUDIO-001 | Beat Library Load | Navigate to `/tracks` | All beats load with titles, BPM, waveforms |
| AUDIO-002 | Beat Preview | Click play on any beat | Audio plays, waveform animates |
| AUDIO-003 | Beat Favorite | Click heart icon | Beat added to favorites (persists on refresh) |
| AUDIO-004 | Beat Search | Type in search box | Results filter in real-time |
| AUDIO-005 | Beat Category Filter | Select genre filter | Only matching beats shown |

### 2.2 Practice Session (`/practice`)
| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| AUDIO-006 | Beat Playback Start | Click Start → Beat plays | Audio starts immediately, loops seamlessly |
| AUDIO-007 | Beat Loop Seamless | Let beat play through full loop | No gap, click, or stutter at loop point |
| AUDIO-008 | Beat Volume Control | Adjust beat volume slider | Volume changes without interruption |
| AUDIO-009 | Beat Change Mid-Session | Change beat during active session | New beat loads, session continues |
| AUDIO-010 | Beat Random Selection | Select "Random" beat option | Random beat loads each session |

### 2.3 Word Prompts
| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| AUDIO-011 | Word Display Timing | Start session (4-bar frequency) | Words appear on beat (4 bars) |
| AUDIO-012 | Easy Difficulty Words | Select Easy → Start | Simple, common words displayed |
| AUDIO-013 | Medium Difficulty Words | Select Medium → Start | Standard vocabulary words |
| AUDIO-014 | Hard Difficulty Words | Select Hard → Start | Complex, multi-syllable words |
| AUDIO-015 | Word Animation | Observe word transitions | Smooth fade/scale animation |

### 2.4 Recording & Microphone
| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| AUDIO-016 | Mic Permission Request | Start recording (first time) | Browser permission prompt appears |
| AUDIO-017 | Mic Permission Denied | Deny microphone access | Graceful error, option to retry |
| AUDIO-018 | Recording Indicator | Start recording | Visual recording indicator visible |
| AUDIO-019 | Recording with Headphones | Use headphones while recording | Audio plays in headphones, recording captures voice |
| AUDIO-020 | Mixed Download | Complete session → Download | MP3 contains voice + beat (mixed) |

---

##  Module 3: Core User Flows (25 tests)

### 3.1 Landing & Onboarding
| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| FLOW-001 | Landing Page Load | Visit `/` | Hero section, stats, CTA buttons visible |
| FLOW-002 | How It Works | Navigate to `/howitworks` | 3-step flow explanation, Start button works |
| FLOW-003 | Dynamic Beat Count | Check stats on `/howitworks` | Shows actual DB beat count (not static "10+") |
| FLOW-004 | Landing CTA | Click "Start Practicing" | Redirect to `/difficultyselection` |
| FLOW-005 | Mobile Navigation | Open nav on mobile | Bottom nav bar visible, all icons work |

### 3.2 Difficulty Selection (`/difficultyselection`)
| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| FLOW-006 | Page Load | Navigate to difficulty selection | Difficulty cards, beat selector visible |
| FLOW-007 | Easy Selection | Click "Easy" | Card highlights, stored for session |
| FLOW-008 | Medium Selection | Click "Medium" | Card highlights, stored for session |
| FLOW-009 | Hard Selection | Click "Hard" | Card highlights, stored for session |
| FLOW-010 | Beat Dropdown | Click beat selector | Dropdown expands with beat list |
| FLOW-011 | Start Session | Configure → Click Start | Redirect to `/practice` with settings |

### 3.3 Practice Session (`/practice`)
| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| FLOW-012 | Session Start | Countdown → Go | Beat plays, words appear, timer starts |
| FLOW-013 | Session Timer | Observe timer | Timer counts down accurately |
| FLOW-014 | Session Pause | Click pause | Beat pauses, timer pauses |
| FLOW-015 | Session Resume | Click play after pause | Beat resumes from pause point |
| FLOW-016 | Session End (Natural) | Let timer reach 0 | Session summary modal appears |
| FLOW-017 | Session End (Manual) | Click stop | Save prompt appears |
| FLOW-018 | Session Save | Click "Save" after session | Recording saved, success message |
| FLOW-019 | Session Discard | Click "Discard" | No recording saved, return to menu |

### 3.4 Recordings (`/recordings`)
| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| FLOW-020 | Recordings List | Navigate to `/recordings` | All saved recordings visible |
| FLOW-021 | Recording Playback | Click play on a recording | Audio plays with waveform |
| FLOW-022 | Recording Delete | Click delete → Confirm | Recording removed from list |
| FLOW-023 | Recording Download | Click download | MP3 file downloads |
| FLOW-024 | Recording Share | Click share | Native share sheet or copy link |
| FLOW-025 | Empty State | View with 0 recordings | Helpful empty state message |

---

##  Module 4: Profile & Gamification (20 tests)

### 4.1 Profile Page (`/profile`)
| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| PROF-001 | Profile Load | Navigate to `/profile` | Avatar, stats, XP bar visible |
| PROF-002 | XP Display | Complete session → Check profile | XP increased, bar animated |
| PROF-003 | Level Display | Check level indicator | Correct level shown with progress |
| PROF-004 | Stats Accuracy | Compare displayed stats | Match actual session/word counts |
| PROF-005 | Edit Profile | Click edit → Change username | Username updates across app |

### 4.2 Achievements (`/achievements`)
| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| PROF-006 | Achievements Page | Navigate to achievements | All achievement cards visible |
| PROF-007 | Unlocked Achievement | Check unlocked achievement | Badge highlighted, date shown |
| PROF-008 | Locked Achievement | Check locked achievement | Greyed out, requirements shown |
| PROF-009 | Achievement Progress | Check in-progress achievement | Progress bar/percentage shown |
| PROF-010 | Achievement Unlock Toast | Trigger achievement condition | Toast notification appears |

### 4.3 Streaks & Progression
| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| PROF-011 | Daily Streak Display | Check streak on profile | Current streak count shown |
| PROF-012 | Streak Increment | Complete session on new day | Streak increases by 1 |
| PROF-013 | Streak Reset | Miss a day → Check | Streak resets to 0 |
| PROF-014 | XP Gain Calculation | Complete session → Check XP | XP = words×10 + seconds + base |
| PROF-015 | Level Up | Gain enough XP to level | Level increases, notification shown |

### 4.4 Public Profile (`/u/[username]`)
| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| PROF-016 | Public Profile Load | Visit `/u/username` | Profile visible to anyone |
| PROF-017 | Public Stats | Check public profile stats | Sessions/words count visible |
| PROF-018 | Follow User | Click Follow | Follow count increments |
| PROF-019 | Unfollow User | Click Unfollow | Follow count decrements |
| PROF-020 | Own Profile View | Visit own public profile | Edit options available |

---

##  Module 5: Settings & Configuration (15 tests)

### 5.1 Settings Menu
| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| SET-001 | Settings Access | Click settings icon/link | Settings panel opens |
| SET-002 | Studio FX Toggle | Toggle Studio FX on/off | Setting persists, affects practice |
| SET-003 | Show Studio Tools | Toggle Show Studio Tools | Affects practice UI visibility |
| SET-004 | Theme (if available) | Change theme setting | UI theme updates |
| SET-005 | Notification Settings | Toggle notifications | Setting persists |

### 5.2 Latency Calibration (`/settings/latency`)
| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| SET-006 | Calibration Page | Navigate to latency settings | Calibration wizard available |
| SET-007 | Run Calibration | Complete calibration test | Latency offset calculated |
| SET-008 | Apply Calibration | Save calibration result | Offset applied to recordings |
| SET-009 | Reset Calibration | Reset to default | Offset returns to 0 |

### 5.3 Support & Feedback
| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| SET-010 | Report Bug Link | Click "Report Bug" | Redirect to `/patch-notes#feedback` |
| SET-011 | Submit Feedback | Fill form → Submit | Success message, feedback saved |
| SET-012 | Patch Notes Page | View `/patch-notes` | Version history visible |
| SET-013 | Version Display | Check version in settings | Shows "v0.9.5 (Beta)" |
| SET-014 | Legal Links | Click Terms/Privacy | Legal pages load correctly |
| SET-015 | Contact/Support | Find support contact | Contact info available |

---

##  Module 6: Premium & Monetization (12 tests)

### 6.1 Subscription Modal
| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| PREM-001 | Modal Trigger (Beat) | Click locked beat | Premium modal appears |
| PREM-002 | Modal Trigger (Recording) | Hit recording limit | Premium modal appears |
| PREM-003 | Modal Content | View modal | Pricing, features listed clearly |
| PREM-004 | Dynamic Beat Count | Check modal beatCount | Shows actual DB count (not "100+") |
| PREM-005 | Monthly Plan CTA | Click Monthly button | Alert/redirect (Stripe V2) |
| PREM-006 | Annual Plan CTA | Click Annual button | Alert/redirect (Stripe V2) |

### 6.2 Feature Gating
| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| PREM-007 | Free Beat Access | Access as free user | All free beats playable |
| PREM-008 | Pro Beat Lock | Click Pro beat as free user | Locked, upgrade prompt |
| PREM-009 | Pro Beat Unlock | Click Pro beat as Pro user | Beat plays normally |
| PREM-010 | Recording Limit | Free user records >10min | Session ends at limit |
| PREM-011 | Unlimited Recording | Pro user records >10min | No limit enforced |
| PREM-012 | Upload Beat (Pro) | Upload custom beat as Pro | Beat uploads successfully |

---

##  Module 7: Admin Panel (10 tests)

### 7.1 Admin Dashboard (`/admin`)
| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| ADMIN-001 | Dashboard Load | Navigate to `/admin` as superadmin | Dashboard with all cards visible |
| ADMIN-002 | Non-Admin Access | Visit `/admin` as regular user | Redirect or access denied |

### 7.2 Beat Management (`/admin/beats`)
| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| ADMIN-003 | Beat List | View beats page | All beats listed with controls |
| ADMIN-004 | Edit Beat Title | Click edit → Change title | Title updates |
| ADMIN-005 | Toggle Pro/Free | Click badge to toggle | isPremium status changes |
| ADMIN-006 | Reorder Beats | Click up/down arrows | Order changes in DB |
| ADMIN-007 | Delete Beat | Click delete → Confirm | Beat removed |

### 7.3 Feedback Viewer (`/admin/feedback`)
| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| ADMIN-008 | Feedback List | View feedback page | All submissions visible |
| ADMIN-009 | Feedback Details | View individual feedback | Type, message, user info shown |

### 7.4 Beat Upload (`/admin/upload-beat`)
| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| ADMIN-010 | Upload New Beat | Fill form → Upload MP3 | Beat added to library |

---

##  Module 8: Mobile & Responsiveness (10 tests)

### 8.1 Layout
| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| MOB-001 | Landing (Mobile) | View landing on phone | Fully responsive, no overflow |
| MOB-002 | Practice (Mobile) | Use practice on phone | Controls accessible, word visible |
| MOB-003 | Navigation (Mobile) | Use bottom nav | All icons work, pages load |
| MOB-004 | Settings (Mobile) | Open settings panel | Scrollable, all options visible |
| MOB-005 | Modal (Mobile) | Trigger any modal | Modal fits screen, scrollable |

### 8.2 Touch Interactions
| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| MOB-006 | Swipe Gestures | Swipe on carousels/lists | Smooth native-feeling swipe |
| MOB-007 | Tap Targets | Tap all buttons/links | 44px+ touch targets |
| MOB-008 | Form Inputs | Fill forms on mobile | Keyboard doesn't obscure input |
| MOB-009 | Scroll | Scroll all pages | Smooth, no stuck elements |
| MOB-010 | Orientation | Rotate device | Layout adapts (or locks properly) |

---

##  Module 9: API & Network (10 tests)

### 9.1 API Endpoints
| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| API-001 | GET /api/beats | curl request | Returns beat array with count |
| API-002 | GET /api/words/random | curl with params | Returns random words |
| API-003 | POST /api/feedback | Submit feedback via API | Feedback saved to DB |
| API-004 | GET /api/user/stats | Authenticated request | Returns user statistics |
| API-005 | GET /api/user/achievements | Authenticated request | Returns achievement progress |

### 9.2 Error Handling
| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| API-006 | 404 Page | Visit `/nonexistent` | Custom 404 page shown |
| API-007 | API Error | Force API error | Graceful error message |
| API-008 | Offline Mode | Disable network → Use app | Fallback behavior works |
| API-009 | Slow Network | Throttle to 3G | Loading states shown |
| API-010 | Rate Limiting | Rapid API requests | 429 or graceful handling |

---

##  Module 10: Security & Edge Cases (10 tests)

### 10.1 Security
| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| SEC-001 | XSS Input | Enter `<script>` in text fields | Input sanitized, no execution |
| SEC-002 | CSRF Protection | Attempt cross-site request | Request blocked or validated |
| SEC-003 | Auth Token Expiry | Wait for token expiry | Graceful re-auth prompt |
| SEC-004 | Unauthorized API | Call protected API without auth | 401 response |
| SEC-005 | SQL Injection | Attempt SQL in inputs | Query parameterized, no effect |

### 10.2 Edge Cases
| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| EDGE-001 | Long Username | Create 50+ char username | Truncated or validated |
| EDGE-002 | Empty Session | Start/stop immediately | No crash, no empty recording |
| EDGE-003 | Rapid Actions | Click buttons rapidly | No duplicate requests/actions |
| EDGE-004 | Browser Back | Use back button mid-flow | Graceful navigation |
| EDGE-005 | Tab Switch | Switch tabs during recording | Recording continues or pauses gracefully |

---

##  Execution & Reporting

### Test Execution Log
| Module | Total Tests | Pass | Fail | Skip | Notes |
|--------|-------------|------|------|------|-------|
| Authentication | 15 | | | | |
| Audio Engine | 20 | | | | |
| Core Flows | 25 | | | | |
| Profile/Gamification | 20 | | | | |
| Settings | 15 | | | | |
| Premium | 12 | | | | |
| Admin | 10 | | | | |
| Mobile | 10 | | | | |
| API/Network | 10 | | | | |
| Security | 10 | | | | |
| **TOTAL** | **147** | | | | |

### Bug Report Template
```markdown
## Bug Report: [TITLE]
**ID**: [TEST-ID]
**Severity**: Critical / High / Medium / Low
**Module**: [Module Name]
**Steps to Reproduce**:
1. 
2. 
3. 
**Expected**: 
**Actual**: 
**Screenshots/Video**: 
**Device/Browser**: 
**Tester**: 
**Date**: 
```

---

**Version History**
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Dec 2025 | Dev Team | Initial plan (88 tests) |
| 2.0 | Jan 2026 | QA Team | Comprehensive rewrite (147 tests) |

