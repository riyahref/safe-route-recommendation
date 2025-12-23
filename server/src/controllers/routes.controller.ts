import { Request, Response } from 'express';
import { mockDataService } from '../services/mockData';
import { computeSafetyScore } from '../services/safetyScore';
import { getORSRoutes } from '../services/openRouteService';
import { getWeatherData, calculateRouteMidpoint } from '../services/weatherService';

/**
 * POST /api/routes
 * Returns real route options from OpenRouteService with safety scores
 * Body: { origin: [lng, lat], destination: [lng, lat], vehicleType?: string, timeOfDay?: string }
 */
export async function getRoutes(req: Request, res: Response): Promise<void> {
  try {
    console.log('🔍 [Backend Controller] getRoutes called');
    console.log('🔍 [Backend Controller] Request body:', JSON.stringify(req.body, null, 2));
    
    const { 
      origin, 
      destination, 
      vehicleType = 'car', 
      timeOfDay = 'day',
      safetyToggles = {
        crowdSpike: false,
        darkness: false,
        construction: false,
        storm: false,
      }
    } = req.body;

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

    // Get current weather state for safety scoring (legacy compatibility)
    const weather = mockDataService.getWeatherState();

    // Fetch real weather data for route midpoint
    const midpoint = calculateRouteMidpoint(originCoord, destCoord);
    let realWeather;
    try {
      realWeather = await getWeatherData(midpoint[0], midpoint[1]);
      console.log(`🌤️ [Controller] Real weather: ${realWeather.condition}, temp: ${realWeather.temperature}°C, penalty: ${realWeather.penalty}`);
    } catch (error: any) {
      console.error('❌ [Controller] Failed to fetch real weather, using fallback:', error.message);
      realWeather = undefined; // Will use toggle-based penalty as fallback
    }

    // Convert ORS routes to our format with safety scores
    const routesWithScores = orsRoutes.map((orsRoute, index) => {
      // Calculate distance in km
      const distanceKm = Math.round((orsRoute.distance / 1000) * 10) / 10;
      
      // Calculate realistic travel time based on distance and vehicle speed
      // Speed: walking = 5 km/h, car = 30 km/h
      const speedKmPerHour = vehicleType === 'pedestrian' ? 5 : 30;
      const timeMinutes = Math.round((distanceKm / speedKmPerHour) * 60);
      
      // Create a route object for safety scoring
      const route = {
        routeId: `route_${index + 1}`,
        polyline: orsRoute.geometry,
        base_time_min: timeMinutes, // Realistic time based on distance
        distance_km: distanceKm,
        segments: [] as string[],
      };

      // Calculate safety score with user-controlled safety toggles and real weather
      const safetyScore = computeSafetyScore(
        route,
        weather,
        {
          vehicleType: vehicleType as 'car' | 'truck' | 'bike' | 'pedestrian',
          timeOfDay: timeOfDay as 'day' | 'night',
        },
        safetyToggles,
        realWeather
      );

      return {
        routeId: route.routeId,
        polyline: route.polyline, // Real ORS polyline coordinates [lng, lat]
        base_time_min: route.base_time_min,
        distance_km: route.distance_km,
        segments: route.segments,
        ...safetyScore,
        // Include weather data for frontend display
        weather: realWeather ? {
          temperature: realWeather.temperature,
          condition: realWeather.condition,
          precipitation: realWeather.precipitation,
          windSpeed: realWeather.windSpeed,
          visibility: realWeather.visibility,
          hourly: realWeather.hourly,
        } : undefined,
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
