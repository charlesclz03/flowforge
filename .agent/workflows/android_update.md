---
description: Update Android Trusted Web Activity (TWA) configurations and assets.
---

1.  **Manifest & Config**
    - Check `public/manifest.json`. Ensure `start_url`, `theme_color`, and `background_color` match the "App-Like" aesthetic.
    - Verify `display: "standalone"` or `"fullscreen"`.

2.  **Asset Links (Deep Linking)**
    - IF domain changes or cleaning is needed, check `public/.well-known/assetlinks.json`.
    - Ensure the SHA-256 fingerprint matches the Play Store keystore.

3.  **Visual Assets**
    - If changing icons, ensure `public/icon-512x512.png` (maskable) and `icon-192x192.png` are updated.
    - These are critical for the Android Splash Screen.

4.  **Documentation**
    - Update `DOCS/guides/ANDROID_DEPLOYMENT.md` if any configuration steps have changed.
