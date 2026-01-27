# Mobile & PWA Launch Checklist

**Last Updated**: January 27, 2026  
**Status**: 90% Ready — Pending manifest polish and Play Store assets

---

## Quick Status

| Category | Status |
|----------|--------|
| Mobile UI/UX | ✅ Complete |
| Audio APIs | ✅ Compatible |
| Recording APIs | ✅ Compatible |
| PWA/Service Worker | ✅ Compatible |
| Authentication | ✅ Compatible |
| Payments (Stripe) | ✅ Compatible |
| Legal Pages | ✅ Ready |
| Manifest Polish | ✅ Complete (orientation + maskable icon) |
| Play Store Assets | ✅ Ready (Feature Graphic + Icons) |
| Custom Domain | ✅ Done (`freestyla.app`) |

---

## 🔴 Action Required (Before TWA Build)

### 1. ~~Add `orientation` to `manifest.json`~~ ✅ DONE
**File**: `public/manifest.json`
> Already present. Also added `maskable` icon purpose for better Android adaptive icons.

### 2. ~~Create Feature Graphic (1024x500 PNG)~~ ✅ DONE
- **Status**: ✅ **Ready for Upload**
- **Required by**: Google Play Store
- **Purpose**: Promotional banner on the Store page
- **Tool**: Canva, Figma, or Photoshop
- **Save to**: Local folder for Play Console upload

### 3. Take App Screenshots (Min 2)
- **Required by**: Google Play Store
- **Examples**: Practice screen, Profile screen, Session Review
- **Tip**: Use phone frame mockups for professional look

### 4. Run Bubblewrap & Build AAB
```bash
npm install -g @bubblewrap/cli
cd ~/freestyla-android  # Create new folder outside repo
bubblewrap init --manifest https://freestyla.app/manifest.json
bubblewrap build
```
> This creates `app-release-bundle.aab` (for Play Store) and `app-release-signed.apk` (for testing).

### 5. ~~Deploy `assetlinks.json`~~ ✅ CREATED
**File**: `public/.well-known/assetlinks.json`
> File created with placeholder. **After running `bubblewrap init`, replace `REPLACE_WITH_YOUR_SHA256_FINGERPRINT_FROM_BUBBLEWRAP` with the actual fingerprint, then deploy to Vercel.**

### 6. Save Keystore Securely
> ⚠️ **CRITICAL**: If you lose your keystore, you cannot update your app ever again.
- Save `.keystore` file and passwords in a password manager or encrypted drive.
- **Do NOT commit to git.**

---

##  Play Store Console Steps

| # | Task | Status |
|---|------|--------|
| 1 | Create release in [Play Console](https://play.google.com/console) | ⬜ |
| 2 | Upload `.aab` file (not .apk) | ⬜ |
| 3 | Fill out Store Listing (description, screenshots) | ⬜ |
| 4 | Complete Content Rating questionnaire | ⬜ |
| 5 | Declare Target Audience (not for kids under 13) | ⬜ |
| 6 | Set App Category: "Music & Audio" | ⬜ |
| 7 | Add Privacy Policy URL: `https://freestyla.app/legal/privacy` | ⬜ |
| 8 | Add Contact Email | ⬜ |
| 9 | Submit for Review | ⬜ |

---

## 🟡 Optional Improvements (Post-Launch)

### 1. Native Share Sheet
**File**: `components/organisms/sharing/ShareMenu.tsx`
> ✅ **Implemented**. Uses `navigator.share` (when available) for native Instagram/TikTok/Message share sheet integration.

### 2. Optimistic XP Animation
- Calculate XP client-side, animate immediately
- Reconcile with server response in background
- Improves perceived performance

### 3. Rate App Redirect
**File**: `components/organisms/feedback/RateAppModal.tsx`
```javascript
// Once live on Play Store:
window.location.href = "https://play.google.com/store/apps/details?id=com.flowforge.freestyla";
```

---

## 🧪 Pre-Launch Testing Checklist

- [ ] Test on real Android phone (not emulator)
- [ ] Test with Bluetooth headphones (verify latency calibration)
- [ ] Test on notched device (Samsung S21, Pixel 6)
- [ ] Verify mic permission prompt appears correctly
- [ ] Verify Google login works end-to-end
- [ ] Verify Stripe checkout redirects correctly
- [ ] Verify `assetlinks.json` is accessible at `https://freestyla.app/.well-known/assetlinks.json`
- [ ] Use Internal Testing Track first (instant, no review)

---

## 💰 Cost Summary

| Item | Cost | When |
|------|------|------|
| Google Play Developer Account | $25 (one-time) | Before first upload |
| Custom Domain | ~$14/year | ✅ Already done |
| Vercel + Supabase | Free tier | Ongoing |
| **Total Upfront** | **~$25** | |

---

## ⏱️ Timeline Expectations

| Stage | Timeline |
|-------|----------|
| First Submission Review | 1-7 days |
| Updates After Launch | Usually hours |
| Rejection Response | 1-3 days after fixing |

---

## 📚 Reference Documents

- [ANDROID_DEPLOYMENT.md](./ANDROID_DEPLOYMENT.md) — Full technical guide
- [ANDROID_TWA_AUDIT.md](./ANDROID_TWA_AUDIT.md) — Compatibility audit report
- [MOBILE_DESIGN_IMPLEMENTATION.md](../design/MOBILE_DESIGN_IMPLEMENTATION.md) — UI implementation (complete)
