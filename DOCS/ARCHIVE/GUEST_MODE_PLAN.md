# Guest Mode Implementation Plan

**Feature**: Guest Mode ("Try before you buy")
**Phase**: 5 (Premium & Monetization)
**Goal**: Allow unauthenticated users to record **one** session to demonstrate value, then prompt for sign-up to save it.

---

## 1. User Flow

1.  **Landing Page**: User clicks "Start Practicing" (no login required).
2.  **Practice Page**:
    - User can select beats and configure settings.
    - User records a freestyle.
3.  **Completion**:
    - Session ends (2 min limit).
    - **The Hook**: "Ready to save your fire? Sign in to keep this recording."
    - **Action**: Clicking "Save" or "Review" opens the Auth Modal (or redirects to Login).
4.  **Post-Auth**:
    - User signs in/up with Google.
    - The "Guest Session" (held in memory/IndexedDB) is automatically uploaded and saved to their new account.
    - User is redirected to the `/review/[id]` page for that session.

---

## 2. Technical Implementation

### A. State Management (`useGuestSession`)

We need a way to persist the recorded blob across the Auth redirect if possible, OR (simpler) keep it in client state if using a modal.
_Decision_: Since we use NextAuth with redirects, we might lose React state.
_Solution_: **IndexedDB** is the most robust way to store the large Audio Blob temporarily.

**New Utility**: `lib/guest-storage.ts`

- `saveGuestRecording(blob: Blob, metadata: SessionMetadata)`
- `getGuestRecording()`
- `clearGuestRecording()`

### B. Practice Page Logic (`app/practice/page.tsx`)

- Check `status` from `useSession()`.
- If `unauthenticated`:
  - Allow recording.
  - On "Finish":
    - Save Blob to IndexedDB.
    - Show "Sign In to Save" Modal.
- If `authenticated`:
  - Standard flow (Upload to Supabase immediately).

### C. Post-Login Hook (`app/dashboard/page.tsx` or `AuthProvider`)

- On mount, check `getGuestRecording()`.
- If found:
  - Trigger background upload to Supabase.
  - Create `FreestyleSession` record.
  - Clear IndexedDB.
  - Show Toast: "Guest session saved successfully!"
  - Redirect to the new review page.
- If not found: Do nothing.

---

## 3. Component Updates

### 1. `components/practice/PracticeSession.tsx` (Logic Core)

- Add conditional logic for Guest vs User.
- Implement the "Save to IndexedDB" step.

### 2. `components/auth/AuthModal.tsx`

- A clean modal that explains _why_ they need to sign in ("Don't lose your flow").

---

## 4. Privacy & Cleanup

- Guest recordings in IndexedDB should expire (e.g., clear on next visit if > 24 hours).
- Ensure no PII is collected before consent.

---

## 5. Step-by-Step Execution

1.  **Infrastructure**: Create `lib/guest-storage.ts` (Dexie.js or raw IndexedDB).
2.  **UI**: Updates to `PracticePage` to handle "Guest State".
3.  **Auth Interception**: Create the Sign-In Modal trigger.
4.  **Recovery**: Implement the "Upload on First Login" logic.
