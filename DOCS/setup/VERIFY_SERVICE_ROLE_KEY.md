# ⚠️ Important: Verify Service Role Key

## 🔍 Issue Detected

The service role key you provided (`Ssuuppaabbaassee036973`) looks suspiciously **short**. 

Supabase service role keys are typically **long JWT tokens** (similar to your anon key), not short strings.

### Your Anon Key (for reference):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3Znl5Y3NwaWdvbWl2ZXZ2bnF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzODM3OTMsImV4cCI6MjA3Nzk1OTc5M30.7oHPEypbJtt7UKY1T0V7uvfrmT1_4J2-rQmbfhm--xA
```
(Notice it's a long JWT token with three parts separated by dots)

### Your Service Role Key:
```
Ssuuppaabbaassee036973
```
(This is very short and doesn't look like a JWT token)

---

## ✅ How to Get the Correct Service Role Key

1. **Go to Supabase Dashboard:**
   - Navigate to: https://supabase.com/dashboard/project/xwfyycspigomivevvnqw/settings/api

2. **Find the Service Role Key:**
   - Look for the "Project API keys" section
   - Find the key labeled **"service_role"** (not "anon" or "public")
   - It should be a **long JWT token** (similar format to your anon key)
   - It should start with `eyJ...` (like your anon key)

3. **Copy the Full Key:**
   - Click the "Reveal" or "Copy" button next to the service_role key
   - Copy the **entire key** (it should be very long, like your anon key)
   - It should look something like:
     ```
     eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3Znl5Y3NwaWdvbWl2ZXZ2bnF3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjM4Mzc5MywiZXhwIjoyMDc3OTU5NzkzfQ.XXXXXXXXXXXXX...
     ```

4. **Update .env.local:**
   - Open `.env.local`
   - Find the line: `SUPABASE_SERVICE_ROLE_KEY=Ssuuppaabbaassee036973`
   - Replace `Ssuuppaabbaassee036973` with the actual service role key
   - Save the file

5. **Restart your development server:**
   ```bash
   npm run dev
   ```

---

## 🔒 Security Note

- ⚠️ The service role key is a **secret key**
- ⚠️ Never commit it to git (it should be in `.env.local` which is in `.gitignore`)
- ⚠️ Never share it publicly
- ⚠️ Only use it server-side (which we do in our API routes)

---

## 🧪 Test After Updating

After updating the service role key:

1. **Restart your dev server:**
   ```bash
   npm run dev
   ```

2. **Test recording upload:**
   - Sign in to your app
   - Go to Practice page
   - Record a session
   - Check if it saves successfully

3. **Check for errors:**
   - If you see "Failed to upload recording", the service role key might be incorrect
   - Check browser console for errors
   - Check server logs for errors

---

## ✅ Verification

Once you have the correct service role key, you can verify it by:

1. **Running the verification script:**
   ```bash
   npm run verify:storage
   ```

2. **Or manually check:**
   - The key should be a long JWT token (like your anon key)
   - It should start with `eyJ...`
   - It should have three parts separated by dots (`.`)
   - It should be much longer than the current value

---

## 📚 Reference

- **Supabase Dashboard**: https://supabase.com/dashboard/project/xwfyycspigomivevvnqw/settings/api
- **Service Role Key Location**: Settings > API > Project API keys > service_role
- **Documentation**: See `DOCS/SUPABASE_STORAGE_SETUP.md`

---

## 🎯 Next Steps

1. ✅ Get the correct service role key from Supabase Dashboard
2. ✅ Update `.env.local` with the correct key
3. ✅ Restart development server
4. ✅ Test recording upload
5. ✅ Verify it works

---

**If you're unsure, you can test with the current key first. If uploads fail, you'll know you need to update it.**

