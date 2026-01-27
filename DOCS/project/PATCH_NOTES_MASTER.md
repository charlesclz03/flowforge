# PATCH NOTES MASTER FILE

## v0.9.63 - Identity Restored (2026-01-27)
**"The Public Profile Polish 👤"**

We fixed a critical issue where public profiles were failing to load for guests, and ensured our Superadmins always have the correct identity.

### Fixes & Improvements
- **Profile Fix**: Resolved the "Something went wrong" error on public profiles. Your stats are visible to the world again!
- **Admin Identity**: Superadmins are now automatically assigned their correct handles (Admin1/Admin2) upon login.

---

## v0.9.62 - Accessibility Polish (2026-01-22)
**"The Accessibility Polish Update 🏆"**

We achieved a perfect 100/100 Accessibility score! This update brings crystal clear text contrast, massive performance gains by deferring audio engine startup, and a snappier feel thanks to lazy-loading.

### Fixes & Improvements
- **100% Accessibility**: Fixed color contrast on beat metadata text to ensure it is readable for everyone.
- **Performance Boost**: Deferred the audio engine warmup to when you actually start a session, eliminating page load lag.
- **Lazy Loading**: Heavy menus like the Session Summary and Guest Login now load only when needed, speeding up the app.

---

## v0.9.57 - Identity & Access (2026-01-22)
**"Profile & Auth Security"**

Fixed the critical 500 crash on profiles, enabled guest audio previews, and hardened authentication logic.

### Core Fixes
- **Profile Page**: Fixed Server Error on `/u/Admin` (UUID Logic).
- **Guest Access**: Audio previews now play correctly (Storage Policy Update).
- **Auth**: Enforced unique usernames and Admin handles.

---

## v0.9.56 - Clear Skies (2026-01-21)
**"Storage Clarity Update"**

Switched storage tracking from file size to duration (1-hour limit) and improved usage visualization for all users.

### Visual Overhaul
- **Storage Bar**: Now displays usage based on recording duration (1h Cap).
- **Visualization**: Removed "Unlimited" text; shows exact % used for everyone.

---

## v0.9.55 - Third Time Charm (2026-01-21)
**"Hotfix for the Hotfix (Again) 🙈"**
