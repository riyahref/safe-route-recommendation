import { Request, Response } from 'express';
import { mockDataService } from '../services/mockData';
import { computeSafetyScore } from '../services/safetyScore';
import { getORSRoutes } from '../services/openRouteService';

/**
 * POST /api/routes
 * Returns real route options from OpenRouteService with safety scores
 * Body: { origin: [lng, lat], destination: [lng, lat], vehicleType?: string, timeOfDay?: string }
 */
export async function getRoutes(req: Request, res: Response): Promise<void> {
  try {
    console.log('🔍 [Backend Controller] getRoutes called');
    console.log('🔍 [Backend Controller] Request body:', JSON.stringify(req.body, null, 2));
    
    const { origin, destination, vehicleType = 'car', timeOfDay = 'day' } = req.body;

    if (!origin || !destination) {
      console.log('❌ [Backend Controller] Missing origin or destination');
      res.status(400).json({ error: 'Missing origin or destination in request body' });
      return;
    }

    // Validate coordinates are arrays with 2 numbers
    if (!Array.isArray(origin) || origin.length !== 2 || 
        !Array.isArray(destination) || destination.length !== 2) {
      res.status(400).json({ error: 'Invalid coordinates format. Expected [lng, lat] arrays' });
      return;
    }

    // Frontend sends coordinates as [lng, lat] - validate and pass through as-is
    const [lng1, lat1] = origin.map(Number);
    const [lng2, lat2] = destination.map(Number);

    if (isNaN(lng1) || isNaN(lat1) || isNaN(lng2) || isNaN(lat2)) {
      res.status(400).json({ error: 'Invalid coordinates - must be numbers' });
      return;
    }

    // Pass coordinates through to ORS as-is (no swapping)
    const originCoord: [number, number] = [lng1, lat1];  // [lng, lat] format
    const destCoord: [number, number] = [lng2, lat2];    // [lng, lat] format
    
    console.log(`🔍 [Backend Controller] Passing to ORS: origin=[${lng1}, ${lat1}], dest=[${lng2}, ${lat2}]`);

    // Fetch real routes from OpenRouteService
    let orsRoutes;
    try {
      orsRoutes = await getORSRoutes(originCoord, destCoord, vehicleType);
    } catch (error: any) {
      console.error('❌ Error fetching ORS routes:', error.message);
      // Return detailed error to help user debug
      res.status(500).json({ 
        error: 'Failed to fetch routes from routing service',
        details: error.message,
        hint: error.message.includes('ORS_API_KEY') 
          ? 'Make sure you have set ORS_API_KEY in your .env file. Get a free key at https://openrouteservice.org/dev/#/signup'
          : 'Check server console for more details'
      });
      return;
    }

    if (orsRoutes.length === 0) {
      res.status(404).json({ error: 'No routes found' });
      return;
    }

    // Get current weather state for safety scoring
    const weather = mockDataService.getWeatherState();

    // Convert ORS routes to our format with safety scores
    const routesWithScores = orsRoutes.map((orsRoute, index) => {
      // Create a route object for safety scoring
      const route = {
        routeId: `route_${index + 1}`,
        polyline: orsRoute.geometry,
        base_time_min: Math.round(orsRoute.duration / 60),
        distance_km: Math.round((orsRoute.distance / 1000) * 10) / 10,
        segments: [] as string[],
      };

      // Calculate safety score
      const safetyScore = computeSafetyScore(
        route,
        weather,
        {
          vehicleType: vehicleType as 'car' | 'truck' | 'bike' | 'pedestrian',
          timeOfDay: timeOfDay as 'day' | 'night',
        }
      );

      return {
        routeId: route.routeId,
        polyline: route.polyline, // Real ORS polyline coordinates [lng, lat]
        base_time_min: route.base_time_min,
        distance_km: route.distance_km,
        segments: route.segments,
        ...safetyScore,
      };
    });

    res.json({ routes: routesWithScores });
  } catch (error: any) {
    console.error('❌ Error generating routes:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}
