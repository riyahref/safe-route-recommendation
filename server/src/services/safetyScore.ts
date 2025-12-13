/**
 * Safety Scoring Service
 * Deterministic formula for calculating route safety scores
 * 
 * Formula: safety_score = base_score - weather_penalty + crowd_bonus - darkness_penalty
 * 
 * Constants and reasoning:
 * - Base score: Derived from segment characteristics (lighting, CCTV, isolation)
 * - Weather penalty: Reduces safety during adverse weather (rain, storm, fog)
 * - Crowd bonus: Increases safety when more people are present (safety in numbers)
 * - Darkness penalty: Reduces safety during night-time conditions
 * - Construction penalty: Additional penalty for construction zones
 */

import { Route } from './mockData';
import { WeatherState, CrowdDensity } from './mockData';
import { mockDataService } from './mockData';

export interface SafetyScoreResult {
  base_score: number;
  weather_penalty: number;
  crowd_penalty: number; // Actually a bonus, but named penalty for consistency with API
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
 * @param crowdDensities - Crowd density for each segment in the route
 * @param profile - User profile (vehicle type, time of day)
 * @returns Safety score breakdown and final score
 */
export function computeSafetyScore(
  route: Route,
  weather: WeatherState,
  crowdDensities: CrowdDensity[],
  profile: UserProfile
): SafetyScoreResult {
  // Calculate base score from segment characteristics
  let baseScore = 0;
  let segmentCount = 0;

  route.segments.forEach((segmentId) => {
    const segment = mockDataService.getSegment(segmentId);
    if (segment) {
      baseScore += segment.baseSafetyScore;
      segmentCount++;
    }
  });

  // Average base score across segments
  const base_score = segmentCount > 0 ? baseScore / segmentCount : 50;

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

  // Crowd bonus calculation (named "penalty" but actually a bonus)
  // Low crowd (deserted): penalty, Normal: neutral, High: bonus
  let crowd_penalty = 0;
  if (crowdDensities.length > 0) {
    const avgCrowdValue = crowdDensities.reduce((sum, c) => sum + c.value, 0) / crowdDensities.length;
    
    if (avgCrowdValue < 0.3) {
      // Low crowd (deserted/spooky) - penalty
      crowd_penalty = -15; // Negative means penalty
    } else if (avgCrowdValue > 0.7) {
      // High crowd - bonus (safety in numbers)
      crowd_penalty = 10; // Positive means bonus
    }
    // Normal crowd (0.3-0.7): no change
  }

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

  // Construction penalty
  let construction_penalty = 0;
  route.segments.forEach((segmentId) => {
    if (mockDataService.hasConstruction(segmentId)) {
      construction_penalty += 15; // 15 points per construction segment
    }
  });

  // Calculate final safety score
  // Formula: base_score - weather_penalty + crowd_bonus - darkness_penalty - construction_penalty
  // Note: crowd_penalty is negative for low crowd (penalty), positive for high crowd (bonus)
  // So we add it: base_score - weather_penalty + crowd_penalty - darkness_penalty - construction_penalty
  const final_safety_score = Math.max(
    0,
    Math.min(
      100,
      base_score - weather_penalty + crowd_penalty - darkness_penalty - construction_penalty
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

