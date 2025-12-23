const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface RouteResponse {
  routeId: string;
  polyline: number[][]; // [lng, lat] coordinates
  base_time_min: number;
  distance_km: number;
  segments: string[];
  base_score: number;
  weather_penalty: number;
  crowd_penalty: number;
  darkness_penalty: number;
  construction_penalty: number;
  final_safety_score: number;
  weather?: {
    temperature: number;
    condition: string;
    precipitation: number;
    windSpeed: number;
    visibility: number;
    hourly?: {
      time: string;
      temperature: number;
      condition: string;
      weatherCode: number;
    }[];
  };
}

export interface WeatherResponse {
  condition: 'clear' | 'rain' | 'storm' | 'fog';
  intensity: number;
  starts_at: number;
  ends_at: number;
}

export interface CrowdResponse {
  segmentId: string;
  density: 'low' | 'normal' | 'high';
  value: number;
}

/**
 * Fetch routes from backend
 * @param origin [lng, lat] coordinates
 * @param dest [lng, lat] coordinates
 * @param vehicleType Vehicle type
 * @param timeOfDay Time of day
 * @returns Array of routes with polylines
 */
export async function fetchRoutes(
  origin: [number, number], // [lng, lat]
  dest: [number, number], // [lng, lat]
  vehicleType: string,
  timeOfDay: string,
  safetyToggles?: {
    crowdSpike?: boolean;
    darkness?: boolean;
    construction?: boolean;
    storm?: boolean;
  }
): Promise<RouteResponse[]> {
  try {
    const url = `${API_URL}/api/routes`;
    const requestBody = {
      origin, // Already in [lng, lat] format
      destination: dest, // Already in [lng, lat] format
      vehicleType,
      timeOfDay,
      safetyToggles: safetyToggles || {},
    };
    
    // 🔍 DEBUG: Log the full request
    console.log('🔍 [Frontend] Fetching routes from:', url);
    console.log('🔍 [Frontend] Request body:', requestBody);
    console.log('🔍 [Frontend] API_URL:', API_URL);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      const errorMessage = errorData.details || errorData.error || `HTTP ${response.status}`;
      const hint = errorData.hint || '';
      throw new Error(`${errorMessage}${hint ? `\n\n${hint}` : ''}`);
    }

    const data = await response.json();
    
    // Backend returns { routes: [...] }
    if (data.routes && Array.isArray(data.routes)) {
      return data.routes;
    }
    
    // Fallback for backward compatibility
    return Array.isArray(data) ? data : [];
  } catch (error: any) {
    console.error('Error fetching routes:', error);
    throw error;
  }
}

export async function fetchWeather(bbox?: string): Promise<WeatherResponse> {
  const url = bbox
    ? `${API_URL}/api/weather?bbox=${bbox}`
    : `${API_URL}/api/weather`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch weather');
  return response.json();
}

export async function fetchCrowd(segmentIds: string[]): Promise<CrowdResponse[]> {
  const response = await fetch(
    `${API_URL}/api/crowd?segmentIds=${segmentIds.join(',')}`
  );
  if (!response.ok) throw new Error('Failed to fetch crowd data');
  return response.json();
}

export async function triggerEvent(
  event: string,
  active?: boolean
): Promise<any> {
  const response = await fetch(`${API_URL}/api/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event, active }),
  });
  if (!response.ok) throw new Error('Failed to trigger event');
  return response.json();
}
