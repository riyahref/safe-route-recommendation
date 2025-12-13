import { Request, Response } from 'express';
import { mockDataService } from '../services/mockData';
import { computeSafetyScore } from '../services/safetyScore';

/**
 * GET /api/routes
 * Returns 2-4 route options between origin and destination with safety scores
 */
export async function getRoutes(req: Request, res: Response) {
  try {
    const originParam = req.query.origin as string;
    const destParam = req.query.dest as string;
    const vehicleType = (req.query.vehicleType as string) || 'car';
    const timeOfDay = (req.query.timeOfDay as string) || 'day';

    if (!originParam || !destParam) {
      return res.status(400).json({ error: 'Missing origin or dest parameters' });
    }

    const [originLat, originLng] = originParam.split(',').map(Number);
    const [destLat, destLng] = destParam.split(',').map(Number);

    if (isNaN(originLat) || isNaN(originLng) || isNaN(destLat) || isNaN(destLng)) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }

    const origin: [number, number] = [originLng, originLat];
    const dest: [number, number] = [destLng, destLat];

    // Generate routes
    const routes = mockDataService.generateRoutes(origin, dest);

    // Get current weather and crowd data
    const weather = mockDataService.getWeatherState();

    // Calculate safety scores for each route
    const routesWithScores = routes.map((route) => {
      const crowdDensities = mockDataService.getCrowdDensities(route.segments);
      const safetyScore = computeSafetyScore(
        route,
        weather,
        crowdDensities,
        {
          vehicleType: vehicleType as 'car' | 'truck' | 'bike' | 'pedestrian',
          timeOfDay: timeOfDay as 'day' | 'night',
        }
      );

      return {
        ...route,
        ...safetyScore,
        polyline: route.polyline, // Keep as array for GeoJSON
      };
    });

    res.json(routesWithScores);
  } catch (error) {
    console.error('Error generating routes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

