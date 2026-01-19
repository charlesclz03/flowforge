# Android Deployment Guide (Trusted Web Activity)

This guide walks you through converting your Next.js PWA into a native Android app using the **Trusted Web Activity (TWA)** standard. This allows you to list `FreeStyla` on the Google Play Store.

## Prerequisites
- **Node.js** (v14 or later)
- **JDK 8 or later** (Bubblewrap will try to install this if missing)
- **Google Play Console Account** ($25 one-time fee)

---

## Step 0: Pre-Flight Checklist (Play Store Requirements)

Before you start the technical build, ensure these items are ready. Google **will reject** your app if these are missing.

### Legal Pages (REQUIRED)
| Page | Status | Notes |
|---|---|---|
| **Privacy Policy** (`/legal/privacy`) | ⬜ | Must explain what data you collect (email, recordings, analytics). Must be publicly accessible (no login required). |
| **Terms of Service** (`/legal/terms`) | ⬜ | Standard usage terms. |

> [!IMPORTANT]
> The Privacy Policy URL is entered directly into the Play Store listing. If Google can't access it, your app **will be rejected**.

### Custom Domain (STRONGLY RECOMMENDED)
- **Technically optional**: You *can* use `your-app.vercel.app`.
- **Practically required**: A `.vercel.app` subdomain looks unprofessional and locks you to Vercel forever. If you ever migrate, your app breaks.
- **Action**: Buy a domain (e.g., `freestyla.app` ~$14/year) and point it to Vercel.

#### Domain Registrar Upsells — Skip These
When purchasing your domain (e.g., from Spaceship, Namecheap, etc.), the registrar will offer add-ons. **Skip all of them**:

| Upsell | Do You Need It? |
|--------|-----------------|
| Web Hosting |  No — You use **Vercel** (free tier) |
| WordPress Hosting |  No — You don't use WordPress |
| Virtual Machines / Servers |  No — You use Vercel serverless |
| Load Balancers / Volumes |  No — Enterprise overkill |
| SSL Certificates |  No — Vercel provides free SSL |
| Custom Email (you@freestyla.app) |  Optional — See below |

**Just buy the domain. That's it.**

#### Custom Email (Optional, Nice-to-Have)
A professional email like `support@freestyla.app` looks better than a Gmail address on the Play Store.

| Option | Cost | Notes |
|--------|------|-------|
| **Zoho Mail (Free Tier)** | $0 | 5 users free, custom domain email |
| **Google Workspace** | ~$6/mo | Full Gmail integration, overkill for now |
| **Registrar's Email** | ~$1-3/mo | Works but may have poor deliverability |

**Recommendation:** Start with Gmail for support. Add custom email later when you want to look more professional.


### Play Store Graphics
| Asset | Dimensions | Notes |
|---|---|---|
| **App Icon** | 512x512 PNG | Already in `/public`. ️ |
| **Feature Graphic** | 1024x500 PNG | Promotional banner for the Store page. Use Canva/Figma. **You need this.** |
| **Screenshots** | Min 2 | Show the app in action. Use phone frame mockups. |

### Play Store Console Setup
| Item | Notes |
|---|---|
| **Content Rating Questionnaire** | Google asks about violence, gambling, etc. For FreeStyla: "Everyone". Takes 2 min. |
| **Target Audience Declaration** | Is it for kids under 13? (Answer: No, unless you want COPPA compliance). |
| **App Category** | Recommended: "Music & Audio" or "Education". |
| **Contact Email** | Visible on Play Store page. |

---

## Step 1: Polish Your Manifest (`manifest.json`)

Before building, your `public/manifest.json` needs specific fields to look good as a native app.

**Action**: Edit `public/manifest.json` and ensure it has these recommended configurations:

```json
{
  "name": "FreeStyla",
  "short_name": "FreeStyla",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait", 
  "background_color": "#000000",
  "theme_color": "#000000",
  "description": "The #1 AI Freestyle Coach...",
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "categories": ["music", "education", "lifestyle"]
}
```

> **Key Changes:**
> - `orientation: "portrait"`: Locks the app to portrait mode (essential for a handheld "coach" experience).
> - `categories`: Helps with Play Store discovery.
> - `purpose: "maskable"`: Ensures the icon looks good on all Android shapes (circle, rounded square, etc.).

---

## Step 2: Digital Asset Links (The "Trusted" Part)

To remove the browser address bar and verify ownership, you need a "Digital Asset Links" file.

**Action**: Create a new file at `public/.well-known/assetlinks.json` with the following content:

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.flowforge.freestyla",
      "sha256_cert_fingerprints": [
        "REPLACE_WITH_YOUR_ACTUAL_SHA256_FINGERPRINT"
      ]
    }
  }
]
```

> [!IMPORTANT]
> You will get the `SHA256` fingerprint **during step 3** when generating your signing key. You must come back and paste it here, then deploy your website, *before* uploading to the Play Store.

---

## Step 3: Build the Android App (using Bubblewrap)

We will use Google's **Bubblewrap CLI** to generate the Android project.

1.  **Install Bubblewrap**:
    ```bash
    npm install -g @bubblewrap/cli
    ```

2.  **Initialize the Project**:
    Navigate to a *new folder* (outside your repo, e.g., `~/freestyla-android`) and run:
    ```bash
    bubblewrap init --manifest https://your-production-url.com/manifest.json
    ```
    *   **Question prompts**:
        *   **Domain**: `your-production-url.com`
        *   **Application name**: FreeStyla
        *   **Package name**: `com.flowforge.freestyla` (must match assetlinks.json)
        *   **Keystore**: it will ask to create one. **Save the passwords!**

3.  **Get your SHA-256 Fingerprint**:
    The CLI will output a SHA-256 fingerprint during the `init` process (or when managing keys).
    *   **Action**: Copy this fingerprint > Paste it into `public/.well-known/assetlinks.json` in your project > **Deploy your website**.

4.  **Build the APK/AAB**:
    ```bash
    bubblewrap build
    ```
    This creates:
    *   `app-release-bundle.aab` (Upload this to Google Play Console)
    *   `app-release-signed.apk` (For testing on your own device)

---

## Step 4: Testing & Release

1.  **Test Locally**: Transfer the `.apk` to your phone and install it.
    *   *Note*: If you haven't deployed the `assetlinks.json` yet, you will still see the browser URL bar at the top. This is normal.
2.  **Upload to Play Store**:
    *   Create a release in the [Google Play Console](https://play.google.com/console).
    *   Upload the `.aab` file (not the .apk).
    *   Fill out the store listing (screenshots, description, rating).
3.  **Verify Asset Links**: Use the [Play Console's Deep Link Validator](https://play.google.com/console/about/deep-linking/) to ensure your website and app are properly linked.

---

##  Keystore Management (CRITICAL)

> [!CAUTION]
> If you lose your keystore file or passwords, **you cannot update your app ever again**. You would have to publish a new app with a new package name.

| Item | Details |
|------|---------|
| **What it is** | A cryptographic file that "signs" your APK. Proves you are the owner. |
| **When created** | During `bubblewrap init` (it will ask for passwords). |
| **Action** | Save the `.keystore` file and passwords in a secure location (password manager, encrypted drive, NOT in git). |

### Play App Signing (Recommended)
Google offers to manage your signing key for you:
*   **Pros:** If you lose your local keystore, Google still has a copy. Safer.
*   **Cons:** You give Google control of your signing key.
*   **Recommendation:** Enable it. Most developers do now.

---

##  App Update Behavior

Unlike native apps, TWA updates **do not** require a Play Store re-upload:

| Change | Requires Play Store Update? |
|--------|-----------------------------|
| Code changes (features, bug fixes) |  No — Deploy to Vercel, users see it immediately |
| App name or icon change |  Yes |
| New Android permissions |  Yes |
| Package name change |  Yes (new app) |

---

##  Analytics & Crash Reporting

| Tool | Status |
|------|--------|
| **Google Analytics** | Works normally (tracks as web traffic). |
| **Sentry** | Works normally (you already have it configured). |
| **Play Console Vitals** | Limited. Google can't see inside your web code. Crash reports are minimal. |

---

##  Deep Linking (Optional)

If you want users to click `freestyla.app/tracks/xyz` and open directly in the app:
1.  Add intent filters in `twa-manifest.json` during `bubblewrap init`.
2.  Ensure `assetlinks.json` lists all subpaths.

*Not required for launch, but good for social sharing.*

---

##  Play Store Review Process

| Stage | Timeline |
|-------|----------|
| **First Submission** | 1-7 days (they scrutinize new developers). |
| **Updates** | Usually hours, sometimes instant. |
| **Rejection** | You get an email explaining why. Common reasons: missing Privacy Policy link, metadata issues, low-quality screenshots. |

---

##  AAB vs APK

*   `bubblewrap build` creates both.
*   **Upload the `.aab`** (Android App Bundle) to Play Console, not the `.apk`.
*   Google generates optimized APKs for each device type from the AAB.
*   The `.apk` is for local testing only.

---

##  Minimum Android Version

*   TWAs require **Android 7.0 (API 24)** or higher.
*   ~97% of active Android devices are covered.
*   Users on Android 6 or below will see a fallback browser experience (Chrome Custom Tab with URL bar visible).

---

##  WebView Version

TWA uses the system **Chrome WebView** (or full Chrome if available):
*   Most users have recent Chrome auto-updated.
*   Edge case: Old phones with outdated WebView may have API quirks.
*   **Your mitigation:** You already use fallbacks (e.g., `webkitAudioContext`). ️

---

## Troubleshooting

- **URL Bar won't go away**: This means the "Handshake" failed.
    - Check that `assetlinks.json` is accessible at `https://your-domain.com/.well-known/assetlinks.json`.
    - Check that the `package_name` in `assetlinks.json` matches your Android app exactly.
    - Check that the `sha256_cert_fingerprints` matches your Keystore exactly.
- **Offline issues**: Ensure your `sw.js` (Service Worker) is caching the start URL (`/`).
- **Play Store Rejection**: Read the email carefully. Usually it's a missing Privacy Policy URL or low-quality screenshots.

---

## Final Checklist

| # | Task | Status |
|---|------|--------|
| 1 | Add `orientation: portrait` to `manifest.json` | ⬜ |
| 2 | Create Feature Graphic (1024x500) | ⬜ |
| 3 | Take 2+ Screenshots | ⬜ |
| 4 | Buy custom domain (recommended) | ⬜ |
| 5 | Run `bubblewrap init` | ⬜ |
| 6 | **Save keystore + passwords securely** | ⬜ |
| 7 | Deploy `assetlinks.json` to website | ⬜ |
| 8 | Build AAB | ⬜ |
| 9 | Upload to Play Console | ⬜ |
| 10 | Fill out Play Console forms | ⬜ |
| 11 | Submit for review | ⬜ |

---

##  Cost Summary

| Item | Cost | When |
|------|------|------|
| Google Play Developer Account | $25 (one-time) | Before first upload |
| Custom Domain | ~$14/year | Before `assetlinks.json` setup |
| Vercel + Supabase | Already covered | Ongoing |
| **Total Upfront** | **~$39** | |

---

##  Testing Strategy

Before submitting to Google:

1.  **Internal Testing Track** — Upload to Play Console's "Internal Testing" first. 
    *   Only visible to emails you whitelist.
    *   Instant availability (no review).
    *   Test real install flow on multiple devices.

2.  **Devices to Test On:**
    *   A phone with a notch (Samsung S21, Pixel 6).
    *   A phone without a notch (older budget device).
    *   With Bluetooth headphones.
    *   With wired headphones.

---

##  Post-Launch: What to Monitor

| Metric | Where | Why |
|--------|-------|-----|
| Installs & Uninstalls | Play Console | Measure retention |
| Crashes | Play Console Vitals (limited for TWA) | May miss web errors |
| Real errors | Sentry | Your source of truth |
| User feedback | Play Store Reviews | Respond within 24h for better ratings |

---

## ️ User Support Expectations

Once you're on the Play Store:
*   Users **will** leave 1-star reviews for things you can't control ("doesn't work offline" when their internet is spotty).
*   **Respond politely** to negative reviews. Google favors apps where developers engage.
*   Consider adding a "Report Issue" button in-app that opens an email to you.

---

##  Marketing / ASO (App Store Optimization)

| Tip | Why |
|-----|-----|
| Use keywords in your app name | "FreeStyla: AI Freestyle Rap Coach" |
| Use keywords in description | "freestyle", "rap", "hip-hop", "battle", "practice" |
| Get early reviews | Ask beta testers to review. First 10 reviews matter most. |
| Localize if relevant | Spanish, French descriptions = wider reach. |

---

##  Timing Considerations

| Question | Answer |
|----------|--------|
| When to launch? | After testing. Don't rush. |
| Wait for iOS? | No. Launch Android now, add iOS later if demand exists. |
| Wait for ads? | No. Launch with Stripe only. Add rewarded ads later if needed. |
| Wait for push notifications? | No. TWA doesn't support them anyway. Not a blocker. |


##  Rate Us Configuration
Once your app is live on the Play Store, you should update the redirection logic in the "Rate App" feature to open the native store listing directly.

*   **File**: `components/organisms/feedback/RateAppModal.tsx`
*   **Action**: Replace the `/feedback` redirect with your store URL:
    ```javascript
    window.location.href = "market://details?id=com.flowforge.freestyla";
    // or
    window.location.href = "https://play.google.com/store/apps/details?id=com.flowforge.freestyla";
    ```
