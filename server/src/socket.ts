import { Server } from 'socket.io';
import { mockDataService } from './services/mockData';

/**
 * Setup WebSocket realtime updates
 * Handles connections and emits periodic updates for weather, crowd, and vehicle position
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

    // Send initial crowd densities
    const segments = mockDataService.getSegments();
    segments.forEach((seg: any) => {
      const crowd = mockDataService.getCrowdDensity(seg.segmentId);
      if (crowd) {
        socket.emit('crowd_update', {
          segmentId: crowd.segmentId,
          density: crowd.density,
          value: crowd.value,
        });
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  // Simulate vehicle position updates every 5 seconds
  let mockVehiclePosition = { lat: 40.7128, lng: -74.0060 };
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
