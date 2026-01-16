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

### Play Store Graphics
| Asset | Dimensions | Notes |
|---|---|---|
| **App Icon** | 512x512 PNG | Already in `/public`. ✔️ |
| **Feature Graphic** | 1024x500 PNG | Promotional banner for the Store page. Use Canva/Figma. **You need this.** |
| **Screenshots** | Min 2 | Show the app in action. Use phone frame mockups. |

### Play Store Console Setup
| Item | Notes |
|---|---|
| **Content Rating Questionnaire** | Google asks about violence, gambling, etc. For FreeStyla: "Everyone". Takes 2 min. |
| **Target Audience Declaration** | Is it for kids under 13? (Answer: No, unless you want COPPA compliance). |
| **App Category** | Recommended: "Music & Audio" or "Education". |

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
    *   Upload the `.aab` file.
    *   Fill out the store listing (screenshots, description, rating rating).
3.  **Verify Asset Links**: Use the [Play Console's Deep Link Validator](https://play.google.com/console/about/deep-linking/) to ensure your website and app are properly linked.

---

## Troubleshooting

- **URL Bar won't go away**: This means the "Handshake" failed.
    - Check that `assetlinks.json` is accessible at `https://your-domain.com/.well-known/assetlinks.json`.
    - Check that the `package_name` in `assetlinks.json` matches your Android app exactly.
    - Check that the `sha256_cert_fingerprints` matches your Keystore exactly.
- **Offline issues**: Ensure your `sw.js` (Service Worker) is caching the start URL (`/`).
