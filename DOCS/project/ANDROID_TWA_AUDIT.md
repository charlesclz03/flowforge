# Android TWA Compatibility Audit Report

**Date:** January 16, 2026  
**Project:** FreeStyla  
**Target:** Google Play Store (Trusted Web Activity)

---

## Executive Summary

The FreeStyla codebase is **highly compatible** with Android TWA deployment. No critical blockers were found. A few minor UX considerations and action items are noted below.

**Overall Readiness: 90%** — The app is ready for TWA conversion pending manifest polish and Play Store asset creation.

---

##  Green Flags (No Action Required)

### Audio Playback (`lib/audio/player.ts`)
- Uses standard `HTMLAudioElement` API.
- Proper looping, seeking, volume control.
- `prime()` method correctly unlocks autoplay restrictions on user gesture.
- **Verdict:** Fully compatible.

### Recording (`lib/recording/recorder.ts`)
- Uses `navigator.mediaDevices.getUserMedia()` (standard).
- Uses `MediaRecorder` with proper MIME type detection (`audio/webm`, `audio/ogg`, etc.).
- Includes `webkitAudioContext` fallback for older browsers/WebViews.
- **Verdict:** Fully compatible.

### Wake Lock (`hooks/useWakeLock.ts`)
- Uses `navigator.wakeLock.request('screen')`.
- Handles `visibilitychange` event to re-acquire lock after tab switch.
- Graceful degradation if API not supported.
- **Verdict:** Fully compatible.

### Offline Storage (`lib/guest-storage.ts`)
- Uses `IndexedDB` for guest session persistence.
- Standard API, works in Chrome WebView.
- **Verdict:** Fully compatible.

### PWA Configuration
- `manifest.json` is present with icons and display mode.
- Service Worker (`sw.js`) caches fonts, images, and audio.
- **Verdict:** Ready for TWA build.

### Legal Pages
- `/legal/privacy` page exists with comprehensive GDPR-compliant content.
- `/legal/terms` page exists with TOS including beat usage license.
- **Verdict:** Play Store requirement met. ️

### Authentication (`lib/auth.ts`)
- Uses NextAuth with Google OAuth.
- Standard redirect flow (not popup).
- **Verdict:** Compatible with TWA. Google login will open in-app.

### Payment Flow (`UpgradeButton.tsx`, `/api/stripe/checkout`)
- Uses Stripe Checkout with redirect (`window.location.href`).
- No native in-app purchase API attempted.
- Google allows external payments for TWA apps (you're not forced into Play Billing).
- **Verdict:** Fully compatible (and allowed for TWA).

### Mobile UX (`globals.css`)
- Safe area insets defined (`.safe-top`, `.safe-bottom`, etc.).
- Touch target utility (`.touch-target`: 44px min).
- `overscroll-behavior: none` for native feel.
- `100dvh` used for full viewport.
- **Verdict:** Fully compatible.

### Bluetooth Audio Latency
- Calibration slider already exists in Profile settings.
- **Verdict:** Already mitigated. ️

---

##  Yellow Warnings (Minor UX Concerns)

### 1. Social Sharing Opens External Browser
**File:** `components/organisms/sharing/ShareMenu.tsx` (Line 50)
```javascript
window.open(shareLink, '_blank', 'noopener,noreferrer')
```
**Issue:** `window.open` with `_blank` will launch the external browser, briefly taking the user out of the app.  
**Risk:** Low. Standard for share flows.  
**Recommendation:** Acceptable as-is. Consider Web Share API (`navigator.share`) for native share sheet.

### 2. XP Animation Latency (Perceived)
**Issue:** The session summary modal waits for server response before animating XP bar.  
**Risk:** Medium. Feels "laggy" compared to native apps.  
**Recommendation:** Implement Optimistic UI (calculate XP client-side, animate immediately, reconcile with server).

### 3. No Explicit Orientation Lock in App
**File:** `manifest.json`
**Issue:** `orientation` field is missing. App may rotate unexpectedly if user unlocks rotation.  
**Recommendation:** Add `"orientation": "portrait"` to `manifest.json` before TWA build.

---

##  Action Required (Before TWA Build)

### 1. Add `orientation` to `manifest.json`
**File:** `public/manifest.json`
```diff
+ "orientation": "portrait",
```

### 2. Create Feature Graphic (1024x500 PNG)
**Issue:** Play Store requires this promotional banner.  
**Action:** Design a 1024x500 graphic using Canva/Figma.

### 3. Take App Screenshots (Min 2)
**Issue:** Play Store requires at least 2 screenshots.  
**Action:** Capture high-quality screenshots of the Practice and Profile screens.

### 4. Custom Domain (Strongly Recommended)
**Issue:** `assetlinks.json` requires a stable domain. Using `.vercel.app` locks you to Vercel.  
**Action:** Purchase a domain (e.g., `freestyla.app` ~$14/year) and point to Vercel.

---

## ️ Potential Runtime Issues (Test Before Launch)

### 1. Microphone Permission Prompt
**Why:** Android WebView handles permissions differently than desktop Chrome. First recording attempt triggers a system-level permission dialog.  
**Symptom:** If user denies, app can't record and may show confusing error.  
**Current Status:** Code handles `NotAllowedError` gracefully in `recorder.ts`. No dedicated "Please allow mic" UI.  
**Risk:** Low. Works, but UX could be smoother.  
**Recommendation:** Test on real Android device. Consider adding a permission explainer screen before first session.

### 2. Service Worker Cache Staleness
**Why:** When you deploy a new version on Vercel, the TWA may still serve the old cached version.  
**Symptom:** Users complain "I don't see the new feature" even though you deployed it.  
**Current Status:** `next-pwa` uses `StaleWhileRevalidate` for most assets (good).  
**Risk:** Low-Medium. Standard PWA issue.  
**Recommendation:** Accept this is normal. Major updates may require users to "pull to refresh" or clear cache.

### 3. Safe Area on Notched Devices
**Why:** Some Android phones have camera notches/punch holes.  
**Symptom:** Part of the header may be hidden behind the notch.  
**Current Status:** `.safe-top` CSS utility exists.  
**Risk:** Low.  
**Recommendation:** Test on a notched device (e.g., Samsung S21, Pixel 6) to confirm headers use safe area classes.

---

##  Edge Cases (Very Low Risk)

| Issue | Scenario | Likelihood |
|-------|----------|------------|
| **Old Android WebView** | User on Android 7 or lower with outdated WebView. MediaRecorder may fail. | Very Low |
| **TTS Voice Unavailable** | Some cheap Android devices don't have the Google TTS engine installed. TTS may silently fail. | Low |
| **OEM Battery Saver** | Aggressive battery savers (Xiaomi MIUI, Huawei EMUI) may kill background processes, breaking Wake Lock. | Low-Medium (mainly China-market devices) |

---

##  Distribution Strategy

### Why Both Web + Android?
| Channel | Purpose |
|---------|---------|
| **Web App (PWA)** | Acquisition hub. SEO, social links, TikTok bio. Zero friction to try. |
| **Play Store (TWA)** | Retention engine. Home screen icon = daily reminder. Discoverability via store search. |

### iOS Considerations
- **No App Store Version Yet:** Apple doesn't allow TWA-style apps. Would require Capacitor + native build + $99/year.
- **iOS Users Can Still Use the Web App:** Safari supports PWA. Users can "Add to Home Screen".
- **Audience Skew:** Freestyle/hip-hop audience tends to skew Android-heavy.
- **Recommendation:** Launch Android first. Add iOS later if demand justifies the investment.

---

## Pre-Launch Testing Checklist

- [ ] Test on real Android phone (not emulator)
- [ ] Test with Bluetooth headphones (latency calibration)
- [ ] Test on notched device (Samsung, Pixel)
- [ ] Verify mic permission prompt appears correctly
- [ ] Verify Google login works end-to-end
- [ ] Verify Stripe checkout redirects correctly
- [ ] Verify `assetlinks.json` is accessible at `https://your-domain/.well-known/assetlinks.json`

---

## Conclusion

| Category | Status |
|----------|--------|
| Audio APIs |  Compatible |
| Recording APIs |  Compatible |
| Storage (IndexedDB) |  Compatible |
| PWA/Service Worker |  Compatible |
| Authentication |  Compatible |
| Payments (Stripe) |  Compatible |
| Legal Pages |  Ready |
| Mobile UX (Safe Areas) |  Ready |
| Bluetooth Latency |  Already mitigated |
| Manifest Polish |  Needs `orientation` |
| Play Store Assets |  Missing graphics |
| Custom Domain |  Recommended |

**Overall Readiness: 90%**

The app is ready for TWA conversion. No showstoppers. The remaining work is manifest polish, asset creation, and testing on real devices.

