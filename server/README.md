# Safety-Aware Routing Backend

Backend API server for the safety-aware routing system built with Node.js, Express, TypeScript, and Socket.IO.

## Project Structure

```
server/
├── src/
│   ├── app.ts                 # Express app setup and middleware
│   ├── index.ts               # Entry point
│   ├── socket.ts              # WebSocket/Socket.IO setup
│   ├── controllers/           # Request handlers
│   │   ├── routesController.ts
│   │   ├── weatherController.ts
│   │   ├── crowdController.ts
│   │   └── eventsController.ts
│   ├── routes/                # Express routes
│   │   ├── routes.ts
│   │   ├── weather.ts
│   │   ├── crowd.ts
│   │   └── events.ts
│   └── services/              # Business logic
│       ├── mockData.ts        # Mock data service
│       └── safetyScore.ts    # Safety scoring algorithm
├── sample-responses/          # Sample API responses
│   ├── routes.json
│   ├── weather.json
│   ├── crowd.json
│   └── events.json
├── package.json
└── tsconfig.json
```

## Installation

```bash
npm install
```

## Running the Server

```bash
npm run dev
```

The server will start on `http://localhost:3001` (or the port specified in `PORT` environment variable).

## API Endpoints

### GET `/api/routes`
Get route options between origin and destination.

**Query Parameters:**
- `origin`: `lat,lng` (required)
- `dest`: `lat,lng` (required)
- `vehicleType`: `car` | `truck` | `bike` | `pedestrian` (optional, default: `car`)
- `timeOfDay`: `day` | `night` (optional, default: `day`)

**Example:**
```
GET /api/routes?origin=40.7128,-74.0060&dest=40.7580,-73.9855&vehicleType=car&timeOfDay=day
```

**Response:** Array of route objects with safety scores (see `sample-responses/routes.json`)

### GET `/api/weather`
Get current weather forecast.

**Query Parameters:**
- `bbox`: `minLng,minLat,maxLng,maxLat` (optional)

**Example:**
```
GET /api/weather?bbox=-74.1,40.7,-73.9,40.8
```

**Response:** Weather object (see `sample-responses/weather.json`)

### GET `/api/crowd`
Get crowd density for specified segments.

**Query Parameters:**
- `segmentIds`: Comma-separated segment IDs (required)

**Example:**
```
GET /api/crowd?segmentIds=s1,s2,s3
```

**Response:** Array of crowd density objects (see `sample-responses/crowd.json`)

### POST `/api/events`
Trigger dev events (storm, crowd spike, construction).

**Body:**
```json
{
  "event": "startStorm" | "crowdSpike" | "toggleConstruction",
  "segmentId": "s1" // required for toggleConstruction
}
```

**Response:** Event confirmation (see `sample-responses/events.json`)

## WebSocket Events

The server emits the following events:

- `weather_update`: Weather condition changes
- `crowd_update`: Crowd density changes for a segment
- `vehicle_updates`: Simulated vehicle position updates (every 5 seconds)
- `event_applied`: Confirmation when a dev event is applied

## Environment Variables

- `PORT`: Server port (default: 3001)
- `CORS_ORIGIN`: Allowed CORS origin (default: http://localhost:5173)

## Safety Scoring

The safety scoring algorithm is deterministic and documented in `src/services/safetyScore.ts`. Formula:

```
safety_score = base_score - weather_penalty + crowd_bonus - darkness_penalty - construction_penalty
```

## Testing

```bash
npm test
```

Runs unit tests for the safety scoring function.

## Build

```bash
npm run build
```

Compiles TypeScript to JavaScript in the `dist/` folder.

