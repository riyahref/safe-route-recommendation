/**
 * Real Weather Service using Open-Meteo API
 * Fetches real weather data and calculates safety penalties
 * 
 * No API key required - Open-Meteo is free and open source
 * Cache: 10 minutes using Map (in-memory)
 */

interface WeatherCacheEntry {
  data: WeatherData;
  timestamp: number;
}

export interface HourlyWeather {
  time: string;
  temperature: number;
  condition: string;
  weatherCode: number;
}

interface WeatherData {
  temperature: number;
  precipitation: number;
  weatherCode: number;
  windSpeed: number;
  visibility: number;
  condition: string;
  penalty: number;
  hourly?: HourlyWeather[];
}

interface OpenMeteoResponse {
  current: {
    temperature_2m: number;
    precipitation: number;
    weather_code: number;
    wind_speed_10m: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
    visibility: number[];
    precipitation: number[];
  };
}

// Cache: Map<"lat_lng", { data, timestamp }>
const weatherCache = new Map<string, WeatherCacheEntry>();
const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Get weather data for coordinates with caching
 * @param lat Latitude
 * @param lng Longitude
 * @returns Weather data with penalty calculation
 */
export async function getWeatherData(lat: number, lng: number): Promise<WeatherData> {
  const cacheKey = `${lat.toFixed(4)}_${lng.toFixed(4)}`;
  
  // Check cache first
  const cached = weatherCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MS) {
    console.log(`🌤️ [Weather] Using cached data for [${lat}, ${lng}]`);
    return cached.data;
  }

  try {
    console.log(`🌤️ [Weather] Fetching weather for [${lat}, ${lng}]`);
    
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code,visibility,precipitation&forecast_days=1&timezone=auto`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Open-Meteo API error: ${response.status}`);
    }

    const data: OpenMeteoResponse = await response.json();
    
    // Extract current weather data
    const current = data.current;
    const visibility = data.hourly?.visibility?.[0] || 10000; // Default 10km if not available
    
    // Calculate weather condition from weather code
    const condition = getWeatherCondition(current.weather_code);
    
    // Calculate penalties
    const rainPenalty = calculateRainPenalty(current.precipitation);
    const visibilityPenalty = calculateVisibilityPenalty(visibility);
    const windPenalty = calculateWindPenalty(current.wind_speed_10m);
    const severeWeatherPenalty = calculateSevereWeatherPenalty(current.weather_code);
    
    // Total penalty (sum of all penalties)
    const totalPenalty = rainPenalty + visibilityPenalty + windPenalty + severeWeatherPenalty;
    
    // Extract hourly forecast (next 24 hours, every hour)
    const hourlyForecast: HourlyWeather[] = [];
    if (data.hourly && data.hourly.time && data.hourly.temperature_2m && data.hourly.weather_code) {
      const now = new Date();
      for (let i = 0; i < Math.min(24, data.hourly.time.length); i++) {
        const hourTime = new Date(data.hourly.time[i]);
        // Only include future hours
        if (hourTime >= now) {
          hourlyForecast.push({
            time: data.hourly.time[i],
            temperature: data.hourly.temperature_2m[i],
            condition: getWeatherCondition(data.hourly.weather_code[i]),
            weatherCode: data.hourly.weather_code[i],
          });
        }
        // Limit to 12 hours for display
        if (hourlyForecast.length >= 12) break;
      }
    }
    
    const weatherData: WeatherData = {
      temperature: current.temperature_2m,
      precipitation: current.precipitation,
      weatherCode: current.weather_code,
      windSpeed: current.wind_speed_10m,
      visibility: visibility / 1000, // Convert to km
      condition,
      penalty: Math.min(totalPenalty, 90), // Cap at 90 to prevent negative scores
      hourly: hourlyForecast.length > 0 ? hourlyForecast : undefined,
    };

    // Store in cache
    weatherCache.set(cacheKey, {
      data: weatherData,
      timestamp: Date.now(),
    });

    console.log(`✅ [Weather] Fetched: ${condition}, temp: ${current.temperature_2m}°C, penalty: ${weatherData.penalty}`);
    
    return weatherData;
  } catch (error: any) {
    console.error(`❌ [Weather] Error fetching weather: ${error.message}`);
    console.log(`⚠️ [Weather] Using fallback (0 penalty)`);
    
    // Return fallback with 0 penalty
    return {
      temperature: 20,
      precipitation: 0,
      weatherCode: 0,
      windSpeed: 0,
      visibility: 10,
      condition: 'clear',
      penalty: 0,
    };
  }
}

/**
 * Get weather condition name from weather code
 * Weather codes: https://open-meteo.com/en/docs
 */
function getWeatherCondition(weatherCode: number): string {
  // Clear sky
  if (weatherCode === 0) return 'clear';
  
  // Mainly clear, partly cloudy, overcast
  if (weatherCode >= 1 && weatherCode <= 3) return 'partly-cloudy';
  
  // Fog
  if (weatherCode >= 45 && weatherCode <= 48) return 'fog';
  
  // Drizzle
  if (weatherCode >= 51 && weatherCode <= 57) return 'drizzle';
  
  // Rain
  if (weatherCode >= 61 && weatherCode <= 67) return 'rain';
  
  // Freezing rain
  if (weatherCode >= 71 && weatherCode <= 77) return 'freezing-rain';
  
  // Snow
  if (weatherCode >= 71 && weatherCode <= 77) return 'snow';
  
  // Thunderstorm
  if (weatherCode >= 95 && weatherCode <= 99) return 'storm';
  
  return 'unknown';
}

/**
 * Calculate rain penalty (0-20)
 * Based on precipitation in mm
 */
function calculateRainPenalty(precipitation: number): number {
  if (precipitation === 0) return 0;
  if (precipitation < 0.5) return 5; // Light rain
  if (precipitation < 2.0) return 10; // Moderate rain
  if (precipitation < 5.0) return 15; // Heavy rain
  return 20; // Very heavy rain
}

/**
 * Calculate visibility penalty (0-25)
 * Based on visibility in meters
 */
function calculateVisibilityPenalty(visibilityMeters: number): number {
  const visibilityKm = visibilityMeters / 1000;
  
  if (visibilityKm >= 10) return 0; // Excellent visibility
  if (visibilityKm >= 5) return 5; // Good visibility
  if (visibilityKm >= 2) return 10; // Moderate visibility
  if (visibilityKm >= 1) return 15; // Poor visibility
  if (visibilityKm >= 0.5) return 20; // Very poor visibility
  return 25; // Extremely poor visibility (< 500m)
}

/**
 * Calculate wind penalty (0-15)
 * Based on wind speed in km/h
 */
function calculateWindPenalty(windSpeedKmh: number): number {
  if (windSpeedKmh < 20) return 0; // Light wind
  if (windSpeedKmh < 40) return 5; // Moderate wind
  if (windSpeedKmh < 60) return 10; // Strong wind
  return 15; // Very strong wind (> 60 km/h)
}

/**
 * Calculate severe weather penalty (0-30)
 * Based on weather code (thunderstorms, heavy snow, etc.)
 */
function calculateSevereWeatherPenalty(weatherCode: number): number {
  // Thunderstorm codes: 95-99
  if (weatherCode >= 95 && weatherCode <= 99) {
    if (weatherCode >= 97) return 30; // Heavy thunderstorm
    return 20; // Moderate thunderstorm
  }
  
  // Heavy rain codes: 65-67
  if (weatherCode >= 65 && weatherCode <= 67) {
    return 25; // Heavy rain
  }
  
  // Heavy snow codes: 73-77
  if (weatherCode >= 73 && weatherCode <= 77) {
    return 25; // Heavy snow
  }
  
  // Freezing rain: 66, 67
  if (weatherCode === 66 || weatherCode === 67) {
    return 30; // Freezing rain is very dangerous
  }
  
  return 0;
}

/**
 * Calculate midpoint between two coordinates
 * @param origin [lng, lat]
 * @param destination [lng, lat]
 * @returns [lat, lng] for weather API (Open-Meteo uses lat, lng)
 */
export function calculateRouteMidpoint(
  origin: [number, number],
  destination: [number, number]
): [number, number] {
  const [lng1, lat1] = origin;
  const [lng2, lat2] = destination;
  
  const midLat = (lat1 + lat2) / 2;
  const midLng = (lng1 + lng2) / 2;
  
  return [midLat, midLng];
}

