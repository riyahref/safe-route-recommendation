import { Router } from 'express';
import { Server } from 'socket.io';
import { handleEvent } from '../controllers/events.controller';

export function createEventsRouter(io: Server): Router {
  const router = Router();
  router.post('/', (req, res) => handleEvent(req, res, io));
  return router;
}

