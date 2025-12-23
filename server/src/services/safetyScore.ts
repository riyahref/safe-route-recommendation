/**
 * Safety Scoring Service - Hackathon MVP
 * Calculates route safety scores based on user-controlled safety layers
 * 
 * Formula: final_safety_score = 100 - (enabled_penalties) - distance_penalty
 * 
 * Penalties are only applied if corresponding safety toggle is enabled.
 */

import { Route } from './mockData';
import { WeatherState } from './mockData';

export interface SafetyScoreResult {
  base_score: number;
  weather_penalty: number;
  crowd_penalty: number;
  darkness_penalty: number;
  construction_penalty: number;
  final_safety_score: number;
}

export interface RealWeatherData {
  temperature: number;
  precipitation: number;
  weatherCode: number;
  windSpeed: number;
  visibility: number;
  condition: string;
  penalty: number;
}

export interface UserProfile {
  vehicleType: 'car' | 'truck' | 'bike' | 'pedestrian';
  timeOfDay: 'day' | 'night';
}

export interface SafetyToggles {
  crowdSpike?: boolean;
  darkness?: boolean;
  construction?: boolean;
  storm?: boolean;
}

/**
 * Calculate safety score for a route with user-controlled safety layers
 * 
 * @param route - The route to score (contains distance_km and polyline)
 * @param weather - Current weather state (legacy, kept for compatibility)
 * @param profile - User profile (vehicle type, time of day)
 * @param toggles - User-controlled safety toggles
 * @param realWeather - Real weather data from Open-Meteo API (optional)
 * @returns Safety score breakdown and final score
 */
export function computeSafetyScore(
  route: Route,
  weather: WeatherState,
  profile: UserProfile,
  toggles: SafetyToggles = {},
  realWeather?: RealWeatherData
): SafetyScoreResult {
  // Base score starts at 100 (perfect safety)
  const base_score = 100;
  
  const distanceKm = route.distance_km;
  const polylineLength = route.polyline?.length || 0;

  // 1. Crowd Penalty (only if toggle enabled)
  // If route distance > 7km → 20, Else → 10
  let crowd_penalty = 0;
  if (toggles.crowdSpike) {
    crowd_penalty = distanceKm > 7 ? 20 : 10;
  }

  // 2. Darkness Penalty (only if toggle enabled)
  // If timeOfDay === "night":
  //   If distance > 6km → 15, Else → 8
  // Else → 0
  let darkness_penalty = 0;
  if (toggles.darkness) {
    if (profile.timeOfDay === 'night') {
      darkness_penalty = distanceKm > 6 ? 15 : 8;
    } else {
      darkness_penalty = 0;
    }
  }

  // 3. Construction Penalty (only if toggle enabled)
  // If polyline length > 150 points → 15, Else → 5
  let construction_penalty = 0;
  if (toggles.construction) {
    construction_penalty = polylineLength > 150 ? 15 : 5;
  }

  // 4. Weather Penalty - Use REAL weather data if available, otherwise use toggle
  let weather_penalty = 0;
  if (realWeather) {
    // Use real weather penalty from Open-Meteo API
    weather_penalty = realWeather.penalty;
  } else if (toggles.storm) {
    // Fallback to toggle-based penalty if no real weather data
    weather_penalty = distanceKm > 7 ? 25 : 12;
  }

  // Distance penalty (always applied)
  // distancePenalty = distanceKm * 2
  const distance_penalty = distanceKm * 2;

  // Calculate final safety score
  // Formula: 100 - (enabled_penalties) - distance_penalty - real_weather_penalty
  const final_safety_score = Math.max(
    0,
    Math.min(
      100,
      base_score - crowd_penalty - darkness_penalty - construction_penalty - weather_penalty - distance_penalty
    )
  );

  return {
    base_score: Math.round(base_score * 10) / 10,
    weather_penalty: Math.round(weather_penalty * 10) / 10,
    crowd_penalty: Math.round(crowd_penalty * 10) / 10,
    darkness_penalty: Math.round(darkness_penalty * 10) / 10,
    construction_penalty: Math.round(construction_penalty * 10) / 10,
    final_safety_score: Math.round(final_safety_score * 10) / 10,
  };
}

