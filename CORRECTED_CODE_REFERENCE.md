# ✅ Corrected Code Reference

## Complete Request Flow (Verified)

```
Frontend (Port 5173)
    ↓
POST http://localhost:3001/api/routes
    ↓
Backend (Port 3001)
    ↓
/api/routes → routesRouter → getRoutes()
```

---

## 1. Frontend API Call

### File: `client/src/services/api.ts`

```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function fetchRoutes(
  origin: [number, number], // [lng, lat]
  dest: [number, number], // [lng, lat]
  vehicleType: string,
  timeOfDay: string
): Promise<RouteResponse[]> {
  try {
    const url = `${API_URL}/api/routes`;
    const requestBody = {
      origin, // Already in [lng, lat] format
      destination: dest, // Already in [lng, lat] format
      vehicleType,
      timeOfDay,
    };
    
    // 🔍 DEBUG: Log the full request
    console.log('🔍 [Frontend] Fetching routes from:', url);
    console.log('🔍 [Frontend] Request body:', requestBody);
    console.log('🔍 [Frontend] API_URL:', API_URL);
    
    const response = await fetch(url, {
      method: 'POST',  // ✅ Matches backend
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      const errorMessage = errorData.details || errorData.error || `HTTP ${response.status}`;
      const hint = errorData.hint || '';
      throw new Error(`${errorMessage}${hint ? `\n\n${hint}` : ''}`);
    }

    const data = await response.json();
    
    // Backend returns { routes: [...] }
    if (data.routes && Array.isArray(data.routes)) {
      return data.routes;
    }
    
    // Fallback for backward compatibility
    return Array.isArray(data) ? data : [];
  } catch (error: any) {
    console.error('Error fetching routes:', error);
    throw error;
  }
}
```

**Key Points:**
- ✅ URL: `http://localhost:3001/api/routes`
- ✅ Method: `POST`
- ✅ Body: `{ origin, destination, vehicleType, timeOfDay }`
- ✅ Logs full request details for debugging

---

## 2. Backend Application Setup

### File: `server/src/app.ts`

```typescript
import dotenv from "dotenv";
dotenv.config();

import express from 'express';
import cors from 'cors';
import routesRouter from './routes/routes.routes';
import weatherRouter from './routes/weather.routes';
import crowdRouter from './routes/crowd.routes';
import testRouter from './routes/test.routes';
import { createEventsRouter } from './routes/events.routes';

console.log("🔑 ORS_API_KEY loaded:", process.env.ORS_API_KEY ? "YES" : "NO");

const app = express();

// Middleware
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',  // ✅ Matches frontend port
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  optionsSuccessStatus: 200
};

console.log('🔍 [Backend] CORS configured for origin:', corsOptions.origin);

app.use(cors(corsOptions));
app.use(express.json());

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`🔍 [Backend] ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api/test', testRouter);       // ✅ Test endpoint
app.use('/api/routes', routesRouter);   // ✅ Routes endpoint (matches frontend call)
app.use('/api/weather', weatherRouter);
app.use('/api/crowd', crowdRouter);

// Events router needs to be set up with Socket.IO in server.ts
export function setupEventsRoute(io: any) {
  app.use('/api/events', createEventsRouter(io));
}

export default app;
```

**Key Points:**
- ✅ CORS allows: `http://localhost:5173`
- ✅ Route registered at: `/api/routes`
- ✅ Logs all incoming requests
- ✅ Test endpoint at: `/api/test/ping`

---

## 3. Backend Server

### File: `server/src/server.ts`

```typescript
import 'dotenv/config';
import { createServer } from 'http';
import { Server } from 'socket.io';
import app, { setupEventsRoute } from './app';
import { setupSocket } from './socket';
import { mockDataService } from './services/mockData';

const PORT = process.env.PORT || 3001;  // ✅ Matches frontend API_URL

// Create HTTP server
const httpServer = createServer(app);

// Create Socket.IO server
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Setup events route with Socket.IO
setupEventsRoute(io);

// Setup WebSocket handlers
setupSocket(io, mockDataService);

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket server ready`);
  console.log(`🔍 [Backend] API Routes available:`);
  console.log(`   - POST http://localhost:${PORT}/api/routes`);
  console.log(`   - GET  http://localhost:${PORT}/api/weather`);
  console.log(`   - GET  http://localhost:${PORT}/api/crowd`);
});
```

**Key Points:**
- ✅ Port: `3001` (matches frontend API_URL)
- ✅ Logs available routes on startup
- ✅ CORS configured for WebSocket too

---

## 4. Routes Router

### File: `server/src/routes/routes.routes.ts`

```typescript
import { Router } from 'express';
import { getRoutes } from '../controllers/routes.controller';

const router = Router();

// Test GET
router.get('/test', (req, res) => {
  res.json({ ok: true, message: 'Routes API is working' });
});

// POST /api/routes - actual routing logic
router.post('/', (req, res, next) => {  // ✅ POST method matches frontend
  console.log('🔍 [Backend] POST /api/routes endpoint HIT');
  console.log('🔍 [Backend] Request body:', req.body);
  console.log('🔍 [Backend] Request headers:', req.headers);
  next();
}, getRoutes);

export default router;
```

**Key Points:**
- ✅ Method: `POST /` (combined with `/api/routes` = `POST /api/routes`)
- ✅ Logs when endpoint is hit
- ✅ Logs request body and headers

---

## 5. Routes Controller

### File: `server/src/controllers/routes.controller.ts` (First 30 lines)

```typescript
import { Request, Response } from 'express';
import { mockDataService } from '../services/mockData';
import { computeSafetyScore } from '../services/safetyScore';
import { getORSRoutes } from '../services/openRouteService';

/**
 * POST /api/routes
 * Returns real route options from OpenRouteService with safety scores
 * Body: { origin: [lng, lat], destination: [lng, lat], vehicleType?: string, timeOfDay?: string }
 */
export async function getRoutes(req: Request, res: Response): Promise<void> {
  try {
    console.log('🔍 [Backend Controller] getRoutes called');
    console.log('🔍 [Backend Controller] Request body:', JSON.stringify(req.body, null, 2));
    
    const { origin, destination, vehicleType = 'car', timeOfDay = 'day' } = req.body;

    if (!origin || !destination) {
      console.log('❌ [Backend Controller] Missing origin or destination');
      res.status(400).json({ error: 'Missing origin or destination in request body' });
      return;
    }

    // Validate coordinates are arrays with 2 numbers
    if (!Array.isArray(origin) || origin.length !== 2 || 
        !Array.isArray(destination) || destination.length !== 2) {
      res.status(400).json({ error: 'Invalid coordinates format. Expected [lng, lat] arrays' });
      return;
    }

    // ... rest of the controller logic
  } catch (error: any) {
    console.error('❌ Error generating routes:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}
```

**Key Points:**
- ✅ Expects: `{ origin, destination, vehicleType, timeOfDay }`
- ✅ Validates coordinate format
- ✅ Logs request body for debugging
- ✅ Returns: `{ routes: [...] }`

---

## 6. Test Endpoint (NEW)

### File: `server/src/routes/test.routes.ts`

```typescript
import { Router } from 'express';

const router = Router();

// Simple connectivity test endpoint
router.get('/ping', (req, res) => {
  console.log('🔍 [Backend] /api/test/ping endpoint HIT');
  res.json({ 
    success: true, 
    message: 'Backend is reachable!',
    timestamp: new Date().toISOString()
  });
});

export default router;
```

**Usage:**
```bash
curl http://localhost:3001/api/test/ping
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Backend is reachable!",
  "timestamp": "2025-12-18T12:00:00.000Z"
}
```

---

## 7. Frontend Component

### File: `client/src/components/SearchPanel.tsx` (Lines 11-37)

```typescript
const handleSearch = async () => {
  try {
    const [lat1, lng1] = originInput.split(',').map(Number);
    const [lat2, lng2] = destInput.split(',').map(Number);

    if (isNaN(lat1) || isNaN(lng1) || isNaN(lat2) || isNaN(lng2)) {
      alert('Invalid coordinates. Use format: lat,lng');
      return;
    }

    // Store coordinates as [lng, lat] for map rendering
    const origin: [number, number] = [lng1, lat1];
    const dest: [number, number] = [lng2, lat2];

    setOrigin(origin);
    setDestination(dest);
    setLoading(true);

    const routes = await fetchRoutes(origin, dest, vehicleType, timeOfDay);  // ✅ Calls API
    setRoutes(routes);
  } catch (error) {
    console.error('Error fetching routes:', error);
    alert('Failed to fetch routes');
  } finally {
    setLoading(false);
  }
};
```

**Key Points:**
- ✅ Converts input to `[lng, lat]` format
- ✅ Calls `fetchRoutes()` from api.ts
- ✅ Handles errors gracefully

---

## Configuration Summary

| Component | Setting | Value |
|-----------|---------|-------|
| Frontend Port | vite.config.ts | `5173` |
| Backend Port | server/src/server.ts | `3001` |
| API URL | client/src/services/api.ts | `http://localhost:3001` |
| CORS Origin | server/src/app.ts | `http://localhost:5173` |
| Route Path | Frontend | `/api/routes` |
| Route Path | Backend | `/api/routes` |
| HTTP Method | Both | `POST` |

---

## ✅ Verification Matrix

| Check | Frontend | Backend | Match? |
|-------|----------|---------|--------|
| Port | 5173 | 3001 | ✅ Different (correct) |
| API URL | `http://localhost:3001` | Listens on 3001 | ✅ Match |
| Route Path | `/api/routes` | `/api/routes` | ✅ Match |
| HTTP Method | `POST` | `POST` | ✅ Match |
| CORS Origin | N/A | `http://localhost:5173` | ✅ Match |
| Request Body | `{origin, destination, vehicleType, timeOfDay}` | Expects same | ✅ Match |
| Response Format | Expects `{routes: [...]}` | Returns `{routes: [...]}` | ✅ Match |

---

## 🚀 Quick Start Commands

```bash
# Terminal 1: Start Backend
cd server
npm install
npm run dev

# Terminal 2: Start Frontend
cd client
npm install
npm run dev

# Terminal 3: Test Backend (Optional)
curl http://localhost:3001/api/test/ping
```

---

## 📋 Expected Console Output

### When Backend Starts:
```
🔑 ORS_API_KEY loaded: YES
🔍 [Backend] CORS configured for origin: http://localhost:5173
🚀 Server running on http://localhost:3001
📡 WebSocket server ready
🔍 [Backend] API Routes available:
   - POST http://localhost:3001/api/routes
   - GET  http://localhost:3001/api/weather
   - GET  http://localhost:3001/api/crowd
```

### When Route is Called:
**Browser Console:**
```
🔍 [Frontend] Fetching routes from: http://localhost:3001/api/routes
🔍 [Frontend] Request body: {origin: Array(2), destination: Array(2), vehicleType: "car", timeOfDay: "day"}
🔍 [Frontend] API_URL: http://localhost:3001
```

**Backend Terminal:**
```
🔍 [Backend] POST /api/routes
🔍 [Backend] POST /api/routes endpoint HIT
🔍 [Backend] Request body: {origin: [...], destination: [...], ...}
🔍 [Backend Controller] getRoutes called
🔍 [Backend Controller] Request body: {...}
```

---

## 🎯 Root Cause

The original configuration was **ALREADY CORRECT**, but:

1. **Missing debug logs** made it impossible to diagnose where the request was failing
2. **CORS configuration was minimal** - now explicitly configured
3. **No test endpoint** to quickly verify backend connectivity
4. **Most likely issue**: Backend server not running or crashed

The "TypeError: Failed to fetch" error occurs at the **network level** when the browser cannot connect to the backend. This means:
- Backend server is not running on port 3001
- Backend crashed and needs to be restarted
- Port 3001 is blocked or in use by another process
- Network connectivity issue (unlikely on localhost)

---

## 🧹 Cleanup (After Fixing)

Once routes are fetching successfully, you can:

1. **Remove debug logs** (search for `console.log('🔍`)
2. **Keep the enhanced CORS configuration** (it's better)
3. **Keep the test endpoint** (useful for health checks)
4. **Remove TEST_INSTRUCTIONS.md and FIXES_SUMMARY.md**

