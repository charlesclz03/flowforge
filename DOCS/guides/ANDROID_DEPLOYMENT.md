# Android Deployment Guide (TWA)

**Current Version**: `1.1.2`
**Last Updated**: 2026-05-17

This is the canonical Android/TWA deployment reference.

## Requirements

1. Production web app deployed and stable.
2. Valid `public/.well-known/assetlinks.json` with production fingerprint.
3. Correct PWA icons and manifest values.
4. Google Play Console account and release assets.

## Critical Files

- `public/manifest.json`
- `public/.well-known/assetlinks.json`
- `public/icon-192x192.png`
- `public/icon-512x512.png`

## Build Flow

1. Initialize/update Bubblewrap project against production manifest.
2. Build signed Android App Bundle (`.aab`).
3. Upload `.aab` to Play Console internal testing track.
4. Validate app links and TWA fullscreen behavior.

## Verification Checklist

- Asset links endpoint is reachable and valid JSON.
- App opens without browser URL bar in TWA mode.
- Core flows work on Android hardware (practice, recordings, profile).
- Legal pages are reachable publicly (`/legal/privacy`, `/legal/terms`).

## Release Notes

For Android-related product changes, record updates in:

- `DOCS/reference/PATCH_NOTES_MASTER.md`
- `DOCS/project/PROJECT_STATUS.md`
