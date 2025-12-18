import { Server } from 'socket.io';
import { mockDataService } from './services/mockData';

/**
 * Setup WebSocket realtime updates
 * Handles connections and emits periodic updates for weather, crowd, and vehicle position
 * No segment-based logic - uses global modifiers
 */
export function setupSocket(io: Server, mockDataService: any): void {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Send initial weather state
    const weather = mockDataService.getWeatherState();
    socket.emit('weather_update', {
      condition: weather.condition,
      intensity: weather.intensity,
      starts_at: weather.startsAt,
      ends_at: weather.endsAt,
    });

    // Send initial global crowd penalty (if any)
    const crowdPenalty = mockDataService.getGlobalCrowdPenalty();
    if (crowdPenalty > 0) {
      socket.emit('crowd_update', {
        global: true,
        penalty: crowdPenalty,
      });
    }

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  // Simulate vehicle position updates every 5 seconds
  let mockVehiclePosition = { lat: 19.0760, lng: 72.8777 }; // Default to Mumbai
  setInterval(() => {
    // Simulate slight movement
    mockVehiclePosition.lat += (Math.random() - 0.5) * 0.001;
    mockVehiclePosition.lng += (Math.random() - 0.5) * 0.001;

    io.emit('vehicle_updates', {
      lat: mockVehiclePosition.lat,
      lng: mockVehiclePosition.lng,
      timestamp: Date.now() / 1000,
    });
  }, 5000);
}
