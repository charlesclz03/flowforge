# Archived Document

**Archived On**: 2026-02-13
**Original Path**: DOCS/troubleshooting/FIX_LOCAL_AUTH.md
**Canonical Replacement**: DOCS/guides/DEVELOPER_SETUP.md
**Reason**: Pre-existing historical archive metadata normalization.
**Last Verified**: 2026-02-13

---
# Fixing Local Google Authentication

**Issue**: You are unable to sign in locally (`localhost:3000`) because of an `OAuthCallbackError: invalid_client`.
**Cause**: The Google Client ID in your `.env.local` is likely the **Production** one, which is not configured to allow `localhost` as a redirect URI.

## Solution: Create a "Local" Google OAuth Client

### Step 1: Go to Google Cloud Console

1.  Visit [Google Cloud Console > Credentials](https://console.cloud.google.com/apis/credentials).
2.  Make sure you are in the **Freestyla** project.

### Step 2: Create a New Client

1.  Click **+ CREATE CREDENTIALS** > **OAuth client ID**.
2.  **Application type**: Web application.
3.  **Name**: `Freestyla Local Dev`.
4.  **Authorized JavaScript origins**:
    - `http://localhost:3000`
5.  **Authorized redirect URIs**:
    - `http://localhost:3000/api/auth/callback/google`
6.  Click **CREATE**.

### Step 3: Update `.env.local`

1.  Copy the **Client ID** and **Client Secret** from the popup.
2.  Open your `.env.local` file in VS Code.
3.  Replace the existing values:

```bash
# In .env.local
GOOGLE_CLIENT_ID=your_new_local_client_id_here
GOOGLE_CLIENT_SECRET=your_new_local_client_secret_here
```

4.  **Important**: detailed in `DOCS/setup/AUTH_SETUP_COMPLETE.md`, ensure `NEXTAUTH_URL` is still:
    ```bash
    NEXTAUTH_URL=http://localhost:3000
    ```

### Step 4: Restart Server

1.  Stop your local server (Ctrl+C).
2.  Run `npm run dev`.
3.  Try signing in again.

> **Note**: Do NOT commit `.env.local` to git. It should stay local.

