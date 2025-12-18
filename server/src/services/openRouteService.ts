/**
 * OpenRouteService Integration
 * Fetches real routing data from ORS Directions API
 */

export interface ORSRouteResponse {
  geometry: number[][]; // [lng, lat] coordinates
  distance: number; // meters
  duration: number; // seconds
}

export interface ORSDirectionsResponse {
  type?: string;
  features?: Array<{
    geometry: {
      coordinates: number[][]; // [lng, lat] pairs
      type: string;
    };
    properties: {
      summary: {
        distance: number; // meters
        duration: number; // seconds
      };
    };
  }>;
  routes?: Array<{
    summary: {
      distance: number;
      duration: number;
    };
    geometry: string | number[][];
  }>;
  metadata?: any;
  bbox?: number[];
}

/**
 * Map vehicle type to ORS profile
 */
function mapVehicleTypeToORSProfile(vehicleType: string): string {
  const mapping: Record<string, string> = {
    'car': 'driving-car',
    'truck': 'driving-hgv',
    'bike': 'cycling-regular',
    'pedestrian': 'foot-walking',
    // Also support direct ORS profile names
    'driving-car': 'driving-car',
    'driving-hgv': 'driving-hgv',
    'cycling-regular': 'cycling-regular',
    'foot-walking': 'foot-walking',
  };

  const profile = mapping[vehicleType.toLowerCase()];
  if (!profile) {
    console.warn(`⚠️ Unknown vehicle type "${vehicleType}", defaulting to "driving-car"`);
    return 'driving-car';
  }
  return profile;
}

/**
 * Get all alternative routes from OpenRouteService
 */
export async function getORSRoutes(
  origin: [number, number], // [lng, lat]
  dest: [number, number] ,
  vehicle: string = "driving-car"// [lng, lat]
): Promise<ORSRouteResponse[]> {
  const apiKey = process.env.ORS_API_KEY;
  if (!apiKey ) {
    const errorMsg = 'ORS_API_KEY is not set or is still using placeholder. Please:\n1. Get your free API key from https://openrouteservice.org/dev/#/signup\n2. Edit server/.env file\n3. Replace "your_api_key_here" with your actual API key\n4. Restart the server';
    console.error('❌', errorMsg);
    throw new Error(errorMsg);
  }

  // ORS expects coordinates in [longitude, latitude] format
  // Frontend sends [lng, lat], so we pass through as-is
  const [lng1, lat1] = origin;
  const [lng2, lat2] = dest;

  // Map vehicle type to ORS profile
  const profile = mapVehicleTypeToORSProfile(vehicle);
  // Request GeoJSON format explicitly
  const url = `https://api.openrouteservice.org/v2/directions/${profile}/geojson`;
  
  const requestBody = {
    coordinates: [
      [lng1, lat1],  // ORS format: [longitude, latitude]
      [lng2, lat2],
    ],
    alternative_routes: {
      target_count: 3,
      share_factor: 0.6,
      weight_factor: 1.4,
    },
    geometry: true,
    instructions: false,
  };
  
  console.log(`📍 [ORS] Profile: ${profile}`);
  console.log(`📍 [ORS] Origin received: [${origin[0]}, ${origin[1]}] (as [lng, lat])`);
  console.log(`📍 [ORS] Destination received: [${dest[0]}, ${dest[1]}] (as [lng, lat])`);
  console.log(`📍 [ORS] Sending to ORS API:`, JSON.stringify(requestBody, null, 2));
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey.trim(), // Remove any whitespace
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `ORS API error ${response.status}`;
      
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || errorJson.error || errorText;
      } catch {
        errorMessage = errorText || `HTTP ${response.status}`;
      }
      
      console.error(`❌ ORS API error ${response.status}:`, errorMessage);
      
      if (response.status === 401) {
        throw new Error('Invalid ORS API key. Please check your ORS_API_KEY in the .env file.');
      } else if (response.status === 403) {
        throw new Error('ORS API key does not have permission. Please check your API key.');
      } else {
        throw new Error(`ORS API error: ${errorMessage}`);
      }
    }

    const data = await response.json() as ORSDirectionsResponse;
    
    // 🔍 DEBUG: Log full ORS response (first 500 chars)
    const responseStr = JSON.stringify(data);
    console.log(`📍 [ORS] API Response (${responseStr.length} chars):`, responseStr.substring(0, 500) + '...');
    console.log(`📍 [ORS] Response type:`, data.type);
    console.log(`📍 [ORS] Has features:`, !!data.features);
    console.log(`📍 [ORS] Has routes:`, !!data.routes);

    // Handle GeoJSON format (features)
    if (data.features && data.features.length > 0) {
      console.log(`✅ Found ${data.features.length} route(s) from ORS (GeoJSON format)`);
      
      return data.features.map((feature) => {
        const coordinates = feature.geometry.coordinates as number[][];
        const summary = feature.properties.summary;

        if (!coordinates || coordinates.length === 0) {
          throw new Error('Route has no coordinates');
        }

        return {
          geometry: coordinates,
          distance: summary.distance,
          duration: summary.duration,
        };
      });
    }
    
    // Handle JSON format (routes)
    if (data.routes && data.routes.length > 0) {
      console.log(`✅ Found ${data.routes.length} route(s) from ORS (JSON format)`);
      
      return data.routes.map((route) => {
        let coordinates: number[][];
        
        if (typeof route.geometry === 'string') {
          // Encoded polyline - need to decode (not implemented yet)
          throw new Error('Encoded polyline format not supported. Use GeoJSON format.');
        } else {
          coordinates = route.geometry as number[][];
        }

        if (!coordinates || coordinates.length === 0) {
          throw new Error('Route has no coordinates');
        }

        return {
          geometry: coordinates,
          distance: route.summary.distance,
          duration: route.summary.duration,
        };
      });
    }

    // No routes found
    console.error('❌ No routes found in ORS response');
    console.error('❌ Response keys:', Object.keys(data));
    console.error('❌ Full response:', JSON.stringify(data, null, 2));
    throw new Error('No routes found from ORS API');
  } catch (error: any) {
    console.error('❌ Error in getORSRoutes:', error.message);
    
    // Check if it's a fetch error (Node.js version issue)
    if (error.message && (error.message.includes('fetch') || error.message.includes('is not defined'))) {
      throw new Error('Fetch API not available. Please use Node.js 18+ or install node-fetch: npm install node-fetch');
    }
    
    throw error;
  }
}
