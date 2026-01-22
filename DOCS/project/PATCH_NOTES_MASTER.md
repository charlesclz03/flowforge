# PATCH NOTES MASTER FILE

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
