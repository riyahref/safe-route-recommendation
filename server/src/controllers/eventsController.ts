import { Request, Response } from 'express';
import { Server } from 'socket.io';
import { mockDataService } from '../services/mockData';

/**
 * POST /api/events
 * Accepts dev events to inject (e.g., storm, crowd_spike, construction)
 * Returns updated state and emits WebSocket events
 */
export function createEventsController(io: Server) {
  return async (req: Request, res: Response) => {
    try {
      const { event, segmentId } = req.body;

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

        case 'crowdSpike':
          mockDataService.triggerCrowdSpike();
          // Emit crowd updates for all segments
          const segments = mockDataService.getSegments();
          segments.forEach((seg: any) => {
            const crowd = mockDataService.getCrowdDensity(seg.segmentId);
            if (crowd) {
              io.emit('crowd_update', {
                segmentId: crowd.segmentId,
                density: crowd.density,
                value: crowd.value,
              });
            }
          });
          break;

        case 'toggleConstruction':
          if (!segmentId) {
            return res.status(400).json({ error: 'segmentId required for toggleConstruction' });
          }
          mockDataService.toggleConstruction(segmentId);
          io.emit('event_applied', {
            event: 'construction',
            segmentId,
            active: mockDataService.hasConstruction(segmentId),
          });
          break;

        default:
          return res.status(400).json({ error: `Unknown event: ${event}` });
      }

      io.emit('event_applied', {
        event,
        segmentId: segmentId || null,
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
  };
}

