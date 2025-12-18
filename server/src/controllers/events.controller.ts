import { Request, Response } from 'express';
import { Server } from 'socket.io';
import { mockDataService } from '../services/mockData';

/**
 * POST /api/events
 * Accepts dev events to inject (e.g., storm, crowd_spike, construction)
 * Returns updated state and emits WebSocket events
 * No segment-based logic - uses global modifiers
 */
export async function handleEvent(req: Request, res: Response, io: Server): Promise<void> {
  try {
    const { event, active } = req.body;

    switch (event) {
      case 'startStorm':
        mockDataService.setWeatherState('storm', 0.8);
        io.emit('weather_update', {
          condition: 'storm',
          intensity: 0.8,
          starts_at: Date.now() / 1000,
          ends_at: Date.now() / 1000 + 3600,
        });
        break;

      case 'startRain':
        mockDataService.setWeatherState('rain', 0.6);
        io.emit('weather_update', {
          condition: 'rain',
          intensity: 0.6,
          starts_at: Date.now() / 1000,
          ends_at: Date.now() / 1000 + 3600,
        });
        break;

      case 'startFog':
        mockDataService.setWeatherState('fog', 0.7);
        io.emit('weather_update', {
          condition: 'fog',
          intensity: 0.7,
          starts_at: Date.now() / 1000,
          ends_at: Date.now() / 1000 + 3600,
        });
        break;

      case 'clearWeather':
        mockDataService.setWeatherState('clear', 0);
        io.emit('weather_update', {
          condition: 'clear',
          intensity: 0,
          starts_at: Date.now() / 1000,
          ends_at: Date.now() / 1000 + 3600,
        });
        break;

      case 'crowdSpike':
        // Trigger global crowd penalty (affects all routes)
        mockDataService.triggerCrowdSpike();
        const crowdPenalty = mockDataService.getGlobalCrowdPenalty();
        io.emit('crowd_update', {
          global: true,
          penalty: crowdPenalty,
        });
        break;

      case 'clearCrowdSpike':
        mockDataService.clearCrowdSpike();
        io.emit('crowd_update', {
          global: true,
          penalty: 0,
        });
        break;

      case 'toggleConstruction':
        // Toggle global construction penalty
        const isActive = active !== undefined ? active : mockDataService.getGlobalConstructionPenalty() === 0;
        mockDataService.toggleConstruction(isActive);
        const constructionPenalty = mockDataService.getGlobalConstructionPenalty();
        io.emit('event_applied', {
          event: 'construction',
          active: isActive,
          penalty: constructionPenalty,
        });
        break;

      default:
        res.status(400).json({ error: `Unknown event: ${event}` });
        return;
    }

    io.emit('event_applied', {
      event,
      timestamp: Date.now() / 1000,
    });

    res.json({
      success: true,
      event,
      message: `Event ${event} applied successfully`,
    });
  } catch (error) {
    console.error('Error processing event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
