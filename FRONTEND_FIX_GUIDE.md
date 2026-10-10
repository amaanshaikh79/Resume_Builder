# Frontend White Screen Fix Guide 🔧

## Problem: White Screen Showing

Ye issue import/export mismatch ya CSS loading issue hai. Follow these steps:

## Quick Fix Steps

### Step 1: Terminal Band Karo
Press `Ctrl + C` in terminal where `npm run dev` is running

### Step 2: Node Modules Clear Karo
```powershell
cd "c:\AI Resume Builder\frontend"
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
```

### Step 3: Fresh Install
```powershell
npm install
npm install react-router-dom
```

### Step 4: Check Browser Console
1. Frontend start karo: `npm run dev`
2. Browser mein `F12` press karo
3. Console tab mein errors dekho
4. Screenshot share karo errors ka

## Common Issues & Solutions

### Issue 1: Module Not Found Errors
```powershell
# Install missing packages
npm install react-router-dom
npm install axios
```

### Issue 2: CSS Not Loading
Check karo ki ye files exist karti hain:
- `frontend/src/styles/design-system.css`
- `frontend/src/components/Button.css`
- `frontend/src/components/Navbar.css`
- `frontend/src/pages/Home.css`

### Issue 3: Import/Export Mismatch
Maine already fix kar diya hai App.tsx mein. Ab sab default exports hain.

## Test Commands

### Test 1: Simple Server
```powershell
cd "c:\AI Resume Builder\frontend"
npm run dev
```

### Test 2: Build Check
```powershell
npm run build
```
Agar ye without errors complete ho jaye, toh code theek hai.

## Browser Console Errors Ko Samjho

### Error: "Cannot read property 'map' of undefined"
**Fix:** Data loading issue hai, backend running hona chahiye

### Error: "Module not found: Can't resolve './pages/Home'"
**Fix:** File exists karo check
```powershell
Get-ChildItem -Path "src\pages" -Name
```

### Error: "Failed to fetch"
**Fix:** Backend start karo:
```powershell
cd backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
```

## Verification Steps

1. ✅ Frontend running: http://localhost:5173
2. ✅ Backend running: http://localhost:8000
3. ✅ No console errors in browser F12
4. ✅ Network tab mein API calls successful (status 200)

## Emergency: Completely Fresh Start

Agar sab fail ho jaye, toh ye karo:

```powershell
# 1. Frontend cleanup
cd "c:\AI Resume Builder\frontend"
Remove-Item -Recurse -Force node_modules, dist, .vite
Remove-Item -Force package-lock.json

# 2. Reinstall
npm install

# 3. Start fresh
npm run dev
```

## Check List Before Asking for Help

- [ ] `npm run dev` command successfully start hui?
- [ ] Browser console (F12) mein kya error hai?
- [ ] Backend running hai? (localhost:8000/docs check karo)
- [ ] Network tab mein red (failed) requests hain?
- [ ] Screenshot liya error ka?

## Most Likely Issues

1. **Node modules corrupt** → Delete & reinstall
2. **Port already in use** → Change port in vite.config.ts
3. **Backend not running** → Start backend first
4. **Import paths wrong** → Already fixed in App.tsx
5. **CSS not loading** → Already created all CSS files

## Next Steps

1. Try fresh install (Step 1-3 above)
2. Share browser console errors
3. Check if backend is running
4. Send screenshot of terminal where npm run dev is running

---

**Most Common Fix:**
```powershell
cd frontend
Remove-Item -Recurse -Force node_modules
npm install
npm run dev
```

Then press `F12` in browser and check Console tab!
