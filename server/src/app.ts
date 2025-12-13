import express from 'express';
import cors from 'cors';
import routesRouter from './routes/routes.routes';
import weatherRouter from './routes/weather.routes';
import crowdRouter from './routes/crowd.routes';
import { createEventsRouter } from './routes/events.routes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/routes', routesRouter);
app.use('/api/weather', weatherRouter);
app.use('/api/crowd', crowdRouter);

// Events router needs to be set up with Socket.IO in server.ts
export function setupEventsRoute(io: any) {
  app.use('/api/events', createEventsRouter(io));
}

export default app;
