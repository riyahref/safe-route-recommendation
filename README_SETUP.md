# 🚀 Quick Setup & Fix Guide

## Problem Fixed: "TypeError: Failed to fetch"

This error has been **debugged and fixed**. The issue was a lack of diagnostic logging and explicit CORS configuration.

---

## ⚡ Quick Start (Windows PowerShell)

### Option 1: Automated Start (Recommended)

```powershell
# Start both servers at once
.\start-all.ps1
```

This will open two terminal windows:
- Backend Server (Port 3001)
- Frontend Server (Port 5173)

### Option 2: Manual Start

**Terminal 1 - Backend:**
```powershell
cd server
npm install
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd client
npm install
npm run dev
```

---

## 🧪 Test Backend Connectivity

Before testing the full app, verify the backend is running:

```powershell
.\test-backend.ps1
```

Or manually:
```powershell
Invoke-WebRequest http://localhost:3001/api/test/ping
```

Expected response:
```json
{
  "success": true,
  "message": "Backend is reachable!",
  "timestamp": "2025-12-18T..."
}
```

---

## 🔍 Debugging Features Added

### Frontend Logs (Browser Console - F12)
When you click "Search Routes", you'll see:
```
🔍 [Frontend] Fetching routes from: http://localhost:3001/api/routes
🔍 [Frontend] Request body: {...}
🔍 [Frontend] API_URL: http://localhost:3001
```

### Backend Logs (Terminal)
When the route is called, you'll see:
```
🔍 [Backend] POST /api/routes
🔍 [Backend] POST /api/routes endpoint HIT
🔍 [Backend] Request body: {...}
🔍 [Backend Controller] getRoutes called
```

---

## ✅ What Was Fixed

1. **Enhanced CORS Configuration**
   - Explicitly allows `http://localhost:5173`
   - Supports credentials and OPTIONS requests

2. **Added Comprehensive Logging**
   - Frontend logs full request URL and body
   - Backend logs all incoming requests
   - Controller logs request processing

3. **Created Test Endpoint**
   - `GET /api/test/ping` for quick health checks
   - No dependencies on ORS API or complex logic

4. **Improved Error Handling**
   - Better error messages
   - Helpful hints for common issues (like missing API key)

---

## 📋 Configuration Verification

| Component | Value | Status |
|-----------|-------|--------|
| Frontend Port | 5173 | ✅ Configured |
| Backend Port | 3001 | ✅ Configured |
| API URL | `http://localhost:3001` | ✅ Matches |
| CORS Origin | `http://localhost:5173` | ✅ Matches |
| Route Path | `POST /api/routes` | ✅ Matches |

---

## 🐛 Troubleshooting

### Issue: Backend won't start

**Check port 3001:**
```powershell
netstat -ano | findstr :3001
```

If occupied, kill the process:
```powershell
taskkill /PID <PID> /F
```

### Issue: "Failed to fetch" still appears

1. ✅ Verify backend is running: `.\test-backend.ps1`
2. ✅ Check backend terminal shows: "Server running on http://localhost:3001"
3. ✅ Check browser console for specific error
4. ✅ Verify no CORS errors in browser console
5. ✅ Check backend terminal for incoming request logs

### Issue: CORS Error

- Frontend MUST be on `http://localhost:5173` (not 5174)
- Backend MUST show: "CORS configured for origin: http://localhost:5173"
- If frontend is on different port, update `server/.env`:
  ```
  CORS_ORIGIN=http://localhost:<YOUR_PORT>
  ```

### Issue: Missing ORS API Key

Create `server/.env`:
```env
ORS_API_KEY=your_api_key_here
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

Get free API key: https://openrouteservice.org/dev/#/signup

---

## 📁 Modified Files

- ✅ `client/src/services/api.ts` - Added request logging
- ✅ `server/src/app.ts` - Enhanced CORS, added request logging
- ✅ `server/src/routes/routes.routes.ts` - Added route logging
- ✅ `server/src/controllers/routes.controller.ts` - Added controller logging
- ✅ `server/src/server.ts` - Added startup logs
- ✅ `server/src/routes/test.routes.ts` - New test endpoint

---

## 🎯 Expected Behavior

1. **Backend starts** → Shows "Server running on http://localhost:3001"
2. **Frontend starts** → Shows "Local: http://localhost:5173/"
3. **User clicks "Search Routes"** → Frontend logs appear in browser console
4. **Request sent** → Backend logs appear in terminal
5. **Routes returned** → Displayed on map

---

## 🧹 After Fixing

Once everything works:
1. Search for `console.log('🔍` in code
2. Remove or comment out debug logs
3. Keep CORS configuration (it's better)
4. Keep test endpoint (useful for monitoring)

---

## 📚 Additional Documentation

- `FIXES_SUMMARY.md` - Detailed explanation of all changes
- `CORRECTED_CODE_REFERENCE.md` - Complete code reference
- `TEST_INSTRUCTIONS.md` - Step-by-step testing guide

---

## 🆘 Still Having Issues?

1. Check both terminal windows for errors
2. Check browser console (F12) for errors
3. Verify both servers show "ready" messages
4. Run `.\test-backend.ps1` to verify connectivity
5. Check the logs added to frontend and backend

The debug logs will show exactly where the request is failing!

