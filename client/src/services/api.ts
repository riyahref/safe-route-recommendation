const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface RouteResponse {
  routeId: string;
  polyline: number[][];
  base_time_min: number;
  distance_km: number;
  segments: string[];
  base_score: number;
  weather_penalty: number;
  crowd_penalty: number;
  darkness_penalty: number;
  construction_penalty: number;
  final_safety_score: number;
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

export async function fetchRoutes(
  origin: [number, number],
  dest: [number, number],
  vehicleType: string,
  timeOfDay: string
): Promise<RouteResponse[]> {
  const [lat1, lng1] = origin;
  const [lat2, lng2] = dest;
  const response = await fetch(
    `${API_URL}/api/routes?origin=${lat1},${lng1}&dest=${lat2},${lng2}&vehicleType=${vehicleType}&timeOfDay=${timeOfDay}`
  );
  if (!response.ok) throw new Error('Failed to fetch routes');
  return response.json();
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
  segmentId?: string
): Promise<any> {
  const response = await fetch(`${API_URL}/api/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event, segmentId }),
  });
  if (!response.ok) throw new Error('Failed to trigger event');
  return response.json();
}



