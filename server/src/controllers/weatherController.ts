import { Request, Response } from 'express';
import { mockDataService } from '../services/mockData';

/**
 * GET /api/weather
 * Returns current weather forecast for the area
 * bbox parameter is optional for this mock implementation
 */
export async function getWeather(req: Request, res: Response) {
  try {
    const weather = mockDataService.getWeatherState();

    res.json({
      condition: weather.condition,
      intensity: weather.intensity,
      starts_at: weather.startsAt,
      ends_at: weather.endsAt,
    });
  } catch (error) {
    console.error('Error fetching weather:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

