# Archived Document

**Archived On**: 2026-02-13
**Original Path**: DOCS/guides/ANDROID_TWA_SETUP.md
**Canonical Replacement**: DOCS/guides/ANDROID_DEPLOYMENT.md
**Reason**: Pre-existing historical archive metadata normalization.
**Last Verified**: 2026-02-13

---
# Android TWA Setup & Deployment Guide

## Overview
This document outlines the steps taken to convert the FlowForge PWA into a Trusted Web Activity (TWA) for the Google Play Store using `bubblewrap`.

## Configuration Details

- **App Name:** FreeStyla
- **Package ID:** `com.flowforge.freestyla`
- **Display Mode:** Standalone
- **Orientation:** Portrait
- **Icon Source:** `manifest.json`
- **Maskable Icon:** Yes

## Keystore Information
**⚠️ CRITICAL:** Back up these files! If lost, you cannot update the app on the Play Store.

- **Location:** `C:\Projects\FlowForge - Freestyle\twa\android.keystore`
- **Alias:** `android`
- **Key Password:** (Stored securely by user)
- **Keystore Password:** (Stored securely by user)

## Verification (Asset Links)
The following SHA256 fingerprint has been added to `public/.well-known/assetlinks.json` to verify ownership:

```
BC:82:4C:3C:BD:E6:04:46:7D:0C:E1:51:5E:27:3F:5E:11:FF:3B:EB:65:00:CE:31:E6:96:31:13:7A:CE:81:97
```

## Build Process

### 1. Prerequisite: Java
Bubblewrap uses its own internal JDK. If system Java fails, use the forced path:

```powershell
cmd /c "set JAVA_HOME=C:\Users\charl\.bubblewrap\jdk\jdk-17.0.11+9&& bubblewrap build"
```

### 2. Build Command
Run the following in the `twa` directory:

```powershell
cmd /c bubblewrap build
```

### 3. Output
The final artifact is located at:
`C:\Projects\FlowForge - Freestyle\twa\app-release-bundle.aab`

## Uploading to Play Console
1. Go to [Google Play Console](https://play.google.com/console).
2. Select **FreeStyla**.
3. Navigate to **Testing > Internal testing** (or Production).
4. Create a new release and upload `app-release-bundle.aab`.

