# Debugging Recording Save Issue

## Issue
Recording is not being saved to Supabase when user stops recording.

## Changes Made

### 1. Fixed Play/Stop Button Behavior
- **Before**: Clicking stop while recording would pause the recording (not stop it)
- **After**: Clicking stop while recording now properly stops the recording and triggers save

### 2. Added Detailed Logging
- Added console logs to track recording flow
- Logs when recording starts, stops, and completes
- Logs blob size and type
- Logs authentication status
- Logs API call status

### 3. Improved Error Handling
- Check if blob is empty before saving
- Better error messages
- Log all steps of the save process

## How to Debug

### Step 1: Check Browser Console

1. Open browser console (F12)
2. Start a recording
3. Stop the recording after a few seconds
4. Look for these log messages:

**Expected Logs:**
```
Recording complete: [size] bytes
Recording blob type: audio/webm
User session: Authenticated
Selected beat: [beat name]
Saving recording: { blobSize, duration, beatId, userId, title }
FormData prepared, uploading...
Uploading recording to /api/recordings...
API response: { status: 200, data: {...} }
Recording saved successfully: {...}
```

### Step 2: Check Common Issues

#### Issue 1: "Recording blob is empty"
**Cause**: Recording stopped too quickly or MediaRecorder didn't collect data
**Solution**: Record for at least 2-3 seconds

#### Issue 2: "Not saving recording: { hasSession: false, hasBeat: true }"
**Cause**: User is not authenticated
**Solution**: Sign in first

#### Issue 3: "Not saving recording: { hasSession: true, hasBeat: false }"
**Cause**: No beat selected
**Solution**: Select a beat before recording

#### Issue 4: "Failed to upload recording: [error]"
**Cause**: Supabase Storage issue
**Solution**: Check Supabase Storage configuration

#### Issue 5: "Unauthorized" error
**Cause**: Authentication issue
**Solution**: Check if user is signed in, check NextAuth configuration

### Step 3: Check Server Logs

Look at the terminal where `npm run dev` is running for:
- API request logs
- Supabase Storage errors
- Database errors
- Authentication errors

### Step 4: Check Network Tab

1. Open browser DevTools > Network tab
2. Start recording
3. Stop recording
4. Look for POST request to `/api/recordings`
5. Check:
   - Request status (200 = success, 401 = unauthorized, 500 = server error)
   - Request payload (FormData with audio file)
   - Response data

### Step 5: Verify Supabase Storage

1. Go to Supabase Dashboard > Storage > recordings
2. Check if files are being uploaded
3. Check for any errors in Supabase logs

## Testing Checklist

- [ ] User is signed in
- [ ] Beat is selected
- [ ] Recording starts (check Recording Indicator)
- [ ] Recording stops when button is clicked
- [ ] Console shows "Recording complete" message
- [ ] Console shows "Saving recording" message
- [ ] Console shows "Recording saved successfully" message
- [ ] Success alert appears on page
- [ ] File appears in Supabase Storage
- [ ] Recording appears in `/recordings` page

## Common Problems & Solutions

### Problem: Recording doesn't start
**Check:**
- Mic permission granted?
- Browser supports MediaRecorder?
- Console shows any errors?

### Problem: Recording stops but doesn't save
**Check:**
- User authenticated? (check console log)
- Beat selected? (check console log)
- Blob size > 0? (check console log)
- API call successful? (check Network tab)

### Problem: "Failed to upload recording"
**Check:**
- Supabase Storage bucket exists?
- Bucket is public?
- Service role key is set correctly?
- File size within limits?

### Problem: "Unauthorized" error
**Check:**
- User is signed in?
- Session is valid?
- NextAuth is working?
- Check `/api/auth/session` endpoint

## Next Steps

1. **Test the recording flow:**
   - Sign in
   - Select a beat
   - Start recording
   - Record for at least 5 seconds
   - Stop recording
   - Check console for logs
   - Check if recording appears in Supabase Storage
   - Check if recording appears in `/recordings` page

2. **If it still doesn't work:**
   - Share console logs
   - Share server logs
   - Share Network tab screenshot
   - Check Supabase Storage dashboard

## Expected Behavior

### When Recording Works:
1. User clicks Play → Recording starts
2. Recording Indicator shows red dot
3. User clicks Stop → Recording stops
4. Console shows "Recording complete"
5. Console shows "Saving recording"
6. Console shows "Recording saved successfully"
7. Success alert appears
8. File appears in Supabase Storage
9. Recording appears in `/recordings` page

### When Recording Fails:
1. Check console for error messages
2. Check Network tab for failed requests
3. Check server logs for errors
4. Verify all prerequisites (auth, beat, mic permission)

---

**Last Updated**: November 11, 2025  
**Status**: Debugging guide created


