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
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
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
app.use('/api/test', testRouter);
app.use('/api/routes', routesRouter);
app.use('/api/weather', weatherRouter);
app.use('/api/crowd', crowdRouter);

// Events router needs to be set up with Socket.IO in server.ts
export function setupEventsRoute(io: any) {
  app.use('/api/events', createEventsRouter(io));
}

export default app;
