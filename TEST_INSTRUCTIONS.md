# 🔍 Debug Instructions - Fix "Failed to fetch" Error

## Changes Made

### 1. Added Debug Logs to Frontend (`client/src/services/api.ts`)
- Logs the full URL being called
- Logs the request body
- Logs the API_URL being used

### 2. Added Debug Logs to Backend
- `server/src/app.ts`: Logs all incoming requests and CORS configuration
- `server/src/routes/routes.routes.ts`: Logs when POST /api/routes is hit
- `server/src/controllers/routes.controller.ts`: Logs request body in controller

### 3. Enhanced CORS Configuration (`server/src/app.ts`)
- Explicitly set allowed methods
- Added credentials support
- Logs CORS origin on startup

### 4. Added Test Endpoint
- Created `GET /api/test/ping` for quick connectivity checks

---

## 🧪 Testing Steps

### Step 1: Start the Backend Server

```bash
cd server
npm run dev
```

**Expected Output:**
```
🔑 ORS_API_KEY loaded: YES (or NO)
🔍 [Backend] CORS configured for origin: http://localhost:5173
🚀 Server running on http://localhost:3001
📡 WebSocket server ready
🔍 [Backend] API Routes available:
   - POST http://localhost:3001/api/routes
   - GET  http://localhost:3001/api/weather
   - GET  http://localhost:3001/api/crowd
```

### Step 2: Test Backend Connectivity (Open new terminal)

```bash
# Windows PowerShell
Invoke-WebRequest -Uri http://localhost:3001/api/test/ping

# OR use curl (if available)
curl http://localhost:3001/api/test/ping
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Backend is reachable!",
  "timestamp": "2025-12-18T..."
}
```

### Step 3: Start the Frontend

```bash
cd client
npm run dev
```

**Expected Output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

### Step 4: Test in Browser

1. Open browser console (F12)
2. Navigate to `http://localhost:5173`
3. Enter coordinates and click "Search Routes"

**Expected Console Logs:**

**Frontend Console:**
```
🔍 [Frontend] Fetching routes from: http://localhost:3001/api/routes
🔍 [Frontend] Request body: {origin: [...], destination: [...], ...}
🔍 [Frontend] API_URL: http://localhost:3001
```

**Backend Terminal:**
```
🔍 [Backend] POST /api/routes
🔍 [Backend] POST /api/routes endpoint HIT
🔍 [Backend] Request body: {...}
🔍 [Backend Controller] getRoutes called
🔍 [Backend Controller] Request body: {...}
```

---

## 🐛 Troubleshooting

### Issue: Backend not starting
- Check if port 3001 is already in use
- Kill the process: `netstat -ano | findstr :3001` then `taskkill /PID <PID> /F`

### Issue: Frontend shows "Failed to fetch"
- ✅ Verify backend is running on port 3001
- ✅ Check browser console for the full error
- ✅ Look for CORS errors in browser console
- ✅ Verify the URL logged matches: `http://localhost:3001/api/routes`

### Issue: CORS Error
- Check backend logs show: `CORS configured for origin: http://localhost:5173`
- Frontend must be on `http://localhost:5173` (not 5174 or other port)
- Check browser console for specific CORS error message

### Issue: 404 Not Found
- Check backend logs show: `POST /api/routes` (the route is registered)
- Verify the route in `server/src/app.ts` is: `app.use('/api/routes', routesRouter)`

### Issue: ORS API Key Missing
- Create `server/.env` file with:
  ```
  ORS_API_KEY=your_key_here
  PORT=3001
  CORS_ORIGIN=http://localhost:5173
  ```
- Get free API key: https://openrouteservice.org/dev/#/signup

---

## 🎯 Common Root Causes

1. **Backend not running** - Most common cause of "Failed to fetch"
2. **Port mismatch** - Frontend calling wrong port
3. **CORS misconfiguration** - Backend not allowing frontend origin
4. **Route path mismatch** - Frontend calling different path than backend expects
5. **HTTP method mismatch** - Frontend POST vs Backend GET (already correct: both POST)

---

## 📝 Next Steps After Fixing

Once it works:
1. Remove the debug console.log statements
2. Verify ORS API key is set
3. Test with real coordinates
4. Check that routes are displayed on map

