/**
 * Safety Scoring Service
 * Calculates route safety scores based on weather, crowd, and construction penalties
 * 
 * Formula: final_safety_score = 100 - (weather_penalty + crowd_penalty + construction_penalty)
 * 
 * All penalties are additive and reduce the safety score.
 */

import { Route } from './mockData';
import { WeatherState } from './mockData';
import { mockDataService } from './mockData';

export interface SafetyScoreResult {
  base_score: number;
  weather_penalty: number;
  crowd_penalty: number;
  darkness_penalty: number;
  construction_penalty: number;
  final_safety_score: number;
}

export interface UserProfile {
  vehicleType: 'car' | 'truck' | 'bike' | 'pedestrian';
  timeOfDay: 'day' | 'night';
}

/**
 * Calculate safety score for a route
 * 
 * @param route - The route to score
 * @param weather - Current weather state
 * @param profile - User profile (vehicle type, time of day)
 * @returns Safety score breakdown and final score
 */
export function computeSafetyScore(
  route: Route,
  weather: WeatherState,
  profile: UserProfile
): SafetyScoreResult {
  // Base score starts at 100 (perfect safety)
  // Penalties reduce from this base
  const base_score = 100;

  // Weather penalty calculation
  // Clear: 0, Rain: 10-20, Storm: 25-40, Fog: 15-25
  let weather_penalty = 0;
  if (weather.condition === 'rain') {
    weather_penalty = 10 + weather.intensity * 10; // 10-20
  } else if (weather.condition === 'storm') {
    weather_penalty = 25 + weather.intensity * 15; // 25-40
  } else if (weather.condition === 'fog') {
    weather_penalty = 15 + weather.intensity * 10; // 15-25
  }

  // Crowd penalty (global - affects all routes)
  // High crowd = traffic congestion = safety penalty
  const crowd_penalty = mockDataService.getGlobalCrowdPenalty();

  // Darkness penalty (only applies at night)
  let darkness_penalty = 0;
  if (profile.timeOfDay === 'night') {
    // Penalty varies by vehicle type
    if (profile.vehicleType === 'pedestrian') {
      darkness_penalty = 20; // Higher penalty for pedestrians at night
    } else if (profile.vehicleType === 'bike') {
      darkness_penalty = 15;
    } else if (profile.vehicleType === 'truck') {
      darkness_penalty = 12; // Lower for trucks (better lighting)
    } else {
      darkness_penalty = 10; // Car
    }
  }

  // Construction penalty (global - affects all routes)
  const construction_penalty = mockDataService.getGlobalConstructionPenalty();

  // Calculate final safety score
  // Formula: 100 - (weather_penalty + crowd_penalty + darkness_penalty + construction_penalty)
  const final_safety_score = Math.max(
    0,
    Math.min(
      100,
      base_score - weather_penalty - crowd_penalty - darkness_penalty - construction_penalty
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
