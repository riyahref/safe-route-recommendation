# Safety-Aware Routing System

A full-stack prototype of a real-time adaptive routing system that prioritizes safety, visibility, and situational awareness over just speed. The system dynamically adapts to weather conditions, crowd density, construction zones, and time of day to recommend safer routes for any vehicle or pedestrian.

## Features

- **Real-time Safety Scoring**: Deterministic formula that considers weather, crowd density, lighting, and construction
- **Dynamic Route Recommendations**: 2-4 route options with color-coded safety levels (green/yellow/red)
- **Live Updates**: WebSocket-based real-time updates for weather, crowd density, and vehicle position
- **Vehicle & Time Awareness**: Different safety calculations for Car, Truck, Bike, and Pedestrian modes, with Day/Night considerations
- **Dev Controls**: Trigger events like storms, crowd spikes, and construction zones to test real-time updates
- **KPI Dashboard**: Safety score, weather conditions, and crowd trend visualization

## Tech Stack

### Backend
- Node.js + Express
- Socket.IO for WebSocket real-time updates
- TypeScript
- In-memory data store (no database required)

### Frontend
- React + TypeScript
- Vite
- Mapbox GL JS (default, easily swappable to Leaflet)
- Zustand for state management
- Recharts for data visualization
- Tailwind CSS for styling

## Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Mapbox account and access token ([Get one here](https://account.mapbox.com/))

### Backend Setup

```bash
cd server
npm install
npm run dev
```

The server will run on `http://localhost:3001`

### Frontend Setup

1. Create a `.env` file in the `client` directory:

```bash
cd client
cp .env.example .env
```

2. Edit `.env` and add your Mapbox token:

```
VITE_MAPBOX_TOKEN=your_mapbox_token_here
VITE_API_URL=http://localhost:3001
```

3. Install dependencies and run:

```bash
npm install
npm run dev
```

The frontend will run on `http://localhost:5173`

## Safety Scoring Formula

The safety score is calculated using a deterministic formula:

```
safety_score = base_score - weather_penalty + crowd_bonus - darkness_penalty - construction_penalty
```

### Components:

1. **Base Score** (0-100): Derived from segment characteristics
   - Lighting quality (good/moderate/poor)
   - CCTV presence
   - Isolation level (low/medium/high)

2. **Weather Penalty**:
   - Clear: 0
   - Rain: 10-20 (based on intensity)
   - Storm: 25-40 (based on intensity)
   - Fog: 15-25 (based on intensity)

3. **Crowd Bonus/Penalty**:
   - Low crowd (< 0.3): -15 penalty (deserted/spooky areas)
   - Normal crowd (0.3-0.7): 0
   - High crowd (> 0.7): +10 bonus (safety in numbers)

4. **Darkness Penalty** (applies only at night):
   - Pedestrian: -20
   - Bike: -15
   - Car: -10
   - Truck: -12

5. **Construction Penalty**: -15 per construction segment

The final score is clamped between 0 and 100.

### Code Location

The scoring function is implemented in `server/src/services/safetyScore.ts` with detailed comments explaining each component.

## API Endpoints

### GET `/api/routes?origin=lat,lng&dest=lat,lng&vehicleType=car&timeOfDay=day`
Returns 2-4 route options with safety scores.

**Response:**
```json
[
  {
    "routeId": "r1",
    "polyline": [[lng, lat], ...],
    "base_time_min": 45,
    "distance_km": 18.5,
    "segments": ["s1", "s2", "s3"],
    "base_score": 71.7,
    "weather_penalty": 0,
    "crowd_penalty": 0,
    "darkness_penalty": 0,
    "construction_penalty": 0,
    "final_safety_score": 71.7
  }
]
```

### GET `/api/weather?bbox=minLng,minLat,maxLng,maxLat`
Returns current weather forecast.

**Response:**
```json
{
  "condition": "rain",
  "intensity": 0.7,
  "starts_at": 1700000000,
  "ends_at": 1700003600
}
```

### GET `/api/crowd?segmentIds=s1,s2,s3`
Returns crowd density for specified segments.

**Response:**
```json
[
  {
    "segmentId": "s1",
    "density": "normal",
    "value": 0.5
  }
]
```

### POST `/api/events`
Trigger dev events (startStorm, crowdSpike, toggleConstruction).

**Request:**
```json
{
  "event": "startStorm",
  "segmentId": "s1" // optional, required for toggleConstruction
}
```

## WebSocket Events

The server emits the following events:

- `weather_update`: Weather condition changes
- `crowd_update`: Crowd density changes for a segment
- `vehicle_updates`: Simulated vehicle position updates
- `event_applied`: Confirmation when a dev event is applied

## Testing

Run unit tests for the safety scoring function:

```bash
cd server
npm test
```

## Sample Responses

Sample API responses are included in `server/sample-responses/` for reference.

## Project Structure

```
.
├── server/
│   ├── src/
│   │   ├── routes/          # API route handlers
│   │   ├── services/        # Business logic (mockData, safetyScore)
│   │   ├── realtime/        # WebSocket setup and events
│   │   └── index.ts         # Server entry point
│   ├── sample-responses/    # Sample API responses
│   └── package.json
├── client/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── services/        # API and WebSocket clients
│   │   ├── store/           # Zustand state management
│   │   └── App.tsx
│   └── package.json
└── README.md
```

## Acceptance Criteria

✅ Installation and run steps work (`npm run dev` in each folder)  
✅ Frontend displays at least 2 routes for a search and colors them by safety  
✅ Changing weather/crowd via Dev Controls or backend events updates scores and map visuals in realtime  
✅ Selecting different vehicle types & Day/Night changes recommended route  
✅ Code includes a documented scoring function and unit tests pass  
✅ README explains safety formula and how to trigger events  

## Notes

- The system uses mock data for demonstration purposes
- Mapbox is the default map provider, but the code is structured to allow easy swapping to Leaflet
- All scoring is deterministic and fully documented (no ML implementation)
- The UI is minimal and production-like using Tailwind CSS

## License

ISC



