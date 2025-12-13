import { io, Socket } from 'socket.io-client';
import { useStore } from '../store/useStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

let socket: Socket | null = null;

export function connectWebSocket() {
  if (socket?.connected) return socket;

  socket = io(API_URL, {
    transports: ['websocket'],
  });

  socket.on('connect', () => {
    console.log('WebSocket connected');
  });

  socket.on('disconnect', () => {
    console.log('WebSocket disconnected');
  });

  socket.on('weather_update', (data: any) => {
    useStore.getState().setWeather(data);
  });

  socket.on('crowd_update', (data: any) => {
    useStore.getState().setCrowdDensity(data);
  });

  socket.on('vehicle_updates', (data: any) => {
    useStore.getState().setVehiclePosition(data);
  });

  socket.on('event_applied', (data: any) => {
    console.log('Event applied:', data);
    // Trigger route refresh if needed
    const { origin, destination, vehicleType, timeOfDay } = useStore.getState();
    if (origin && destination) {
      // Refetch routes to get updated scores
      import('./api').then(({ fetchRoutes }) => {
        fetchRoutes(origin, destination, vehicleType, timeOfDay).then((routes) => {
          useStore.getState().setRoutes(routes);
        });
      });
    }
  });

  return socket;
}

export function disconnectWebSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

