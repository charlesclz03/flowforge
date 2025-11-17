# macOS Permission Issues - Quick Fix Guide

## Problem Summary

When running FlowForge on macOS, you may encounter permission errors that prevent the development server from starting properly.

---

## Common Errors

### 1. EPERM - Operation Not Permitted
```
Error: EPERM: operation not permitted, open '.env.local'
Error: EPERM: operation not permitted, open 'node_modules/next/...'
```

### 2. EMFILE - Too Many Open Files
```
Watchpack Error (watcher): Error: EMFILE: too many open files, watch
```

### 3. Extended Attributes
Files showing `@` symbol when listing:
```bash
-rw-r--r--@ 1 user staff 408 .env
```

---

## Quick Fix (5 Minutes)

### Step 1: Grant Full Disk Access
1. Open **System Settings** → **Privacy & Security**
2. Click **Full Disk Access**
3. Click the lock icon and authenticate
4. Add these applications:
   - Terminal.app
   - Cursor.app (if using Cursor)
5. **Restart Terminal completely** (Cmd+Q and reopen)

### Step 2: Clean the Project
```bash
cd "/Users/c0369/Documents/AI BUSINESS/FlowForge - Freestyle"

# Kill all Node processes
killall -9 node

# Remove extended attributes
xattr -cr .

# Remove corrupted node_modules (this takes 2-5 minutes)
rm -rf node_modules

# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
npm install

# Start server
npm run dev
```

---

## If Quick Fix Doesn't Work

### Option A: Fix System File Limits

Add to `/etc/sysctl.conf`:
```bash
echo "kern.maxfiles=65536" | sudo tee -a /etc/sysctl.conf
echo "kern.maxfilesperproc=65536" | sudo tee -a /etc/sysctl.conf
sudo sysctl -w kern.maxfiles=65536
sudo sysctl -w kern.maxfilesperproc=65536
```

Then in your shell session:
```bash
ulimit -n 10240
```

### Option B: Move Project to Simpler Path

The folder name "AI BUSINESS" with a space might cause issues:

```bash
mv "/Users/c0369/Documents/AI BUSINESS/FlowForge - Freestyle" \
   "/Users/c0369/Documents/FlowForge-Freestyle"

cd "/Users/c0369/Documents/FlowForge-Freestyle"
npm run dev
```

---

## Verification Commands

### Check if node_modules exists:
```bash
ls -la node_modules
```

### Check for extended attributes:
```bash
ls -la@ .env .env.local
```

### Check running processes:
```bash
lsof -i :3000
```

### Check for permission errors in logs:
```bash
# While server is running, check for EPERM errors
ps aux | grep "next dev"
```

---

## Understanding the Errors

### Why EPERM Happens
- macOS Gatekeeper/quarantine attributes on downloaded files
- Insufficient permissions on project directory
- Full Disk Access not granted to Terminal/IDE

### Why EMFILE Happens
- macOS default file descriptor limit is too low (256)
- Next.js watches many files during development
- Need to increase system limits

### Why node_modules Gets Corrupted
- Extended attributes from download/extraction
- Permission changes during npm operations
- Incomplete npm install/update operations

---

## Prevention

### For New Projects
```bash
# After cloning/creating project
cd your-project
xattr -cr .
npm install
```

### For Existing Projects
```bash
# Monthly maintenance
rm -rf node_modules .next
npm install
```

### Environment Files
Store sensitive .env files outside the project and symlink them:
```bash
# Store in secure location
mkdir -p ~/.flowforge-env
mv .env.local ~/.flowforge-env/
ln -s ~/.flowforge-env/.env.local .env.local
```

---

## Still Having Issues?

### Check Disk Space
```bash
df -h
```

### Check File System
```bash
diskutil verifyVolume /
```

### Nuclear Option (Last Resort)
```bash
# Complete reset
cd "/Users/c0369/Documents/AI BUSINESS/FlowForge - Freestyle"
killall -9 node
rm -rf node_modules .next package-lock.json
npm cache clean --force
npm install
npm run dev
```

---

## Related Documentation

- [QUICK_FIX_GUIDE.md](QUICK_FIX_GUIDE.md) - General troubleshooting
- [TESTING_SESSION_NOV_14_2025.md](TESTING_SESSION_NOV_14_2025.md) - Detailed session log
- [SETUP_CHECKLIST.md](../setup/SETUP_CHECKLIST.md) - Initial setup guide

---

## Success Indicators

✅ Server starts on port 3000  
✅ No EPERM errors in console  
✅ No EMFILE errors in logs  
✅ Page loads in browser  
✅ No compilation errors  

---

**Last Updated:** November 14, 2025


