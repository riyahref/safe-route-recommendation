import { Router } from 'express';
import { Server } from 'socket.io';
import { createEventsController } from '../controllers/eventsController';

export default function createEventsRouter(io: Server) {
  const router = Router();
  router.post('/', createEventsController(io));
  return router;
}

