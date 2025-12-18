import 'dotenv/config'; // Load environment variables from .env file
import { createServer } from 'http';
import { Server } from 'socket.io';
import app, { setupEventsRoute } from './app';
import { setupSocket } from './socket';
import { mockDataService } from './services/mockData';

const PORT = process.env.PORT || 3001;

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

