# Phase 8: Pro Tier & Superadmin (In Progress)

**Status**: 🚧 In Progress
**Date**: December 18, 2025

## 1. Overview

Phase 8 focuses on monetization infrastructure (Pro Tier), Superadmin capabilities, and enhanced content management.

## 2. Key Deliverables

### 2.1 Superadmin Role & Content Management 👑

- **Role Management**: Defined `SUPERADMIN` role in `Prisma` and `NextAuth`.
- **Beat Upload**: Created a dedicated `AdminUploadSection` for Superadmins to upload beats directly from the profile page.
- **API**: Implemented `/api/admin/beats/upload` for secure file handling and metadata storage.

### 2.2 Pro Tier Features ⭐️

- **10-Minute Sessions**: Increased recording limit for Pro users from 2 minutes to 10 minutes.
- **Recording Gating**:
  - Free users heavily restricted (locked history, gated recording start).
  - Pro users enjoy visual "Red/Recording" state and unlimited history access.
- **UI Gating**: Restricted access to `/recordings` for Free users with an upgrade prompt.

## 3. Technical Changes

- **Schema**: Added `role` to `User` model.
- **Auth**: Updated `next-auth` to persist `role` in sessions.
- **Client**: Major updates to `PracticeControls`, `ProfilePage`, and `RecordingsPage` to support role-based rendering.

## 4. Known Issues / Blockers

- **Direct URL**: Schema migrations (`prisma db push`) currently blocked by missing `DIRECT_URL` environment variable on local setup.
