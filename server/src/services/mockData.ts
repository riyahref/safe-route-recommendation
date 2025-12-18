/**
 * Mock Data Service
 * Generates smooth Bezier-curve routes between origin and destination
 * No segments - only clean, Google Maps-like route variations
 */

export interface WeatherState {
  condition: 'clear' | 'rain' | 'storm' | 'fog';
  intensity: number; // 0-1
  startsAt: number; // Unix timestamp
  endsAt: number; // Unix timestamp
}

export interface Route {
  routeId: string;
  polyline: number[][]; // Array of [lng, lat] coordinates - smooth Bezier curve
  base_time_min: number;
  distance_km: number;
  segments: string[]; // Empty array - kept for API compatibility but not used
  // Safety scores will be added by safetyScore service
  base_score?: number;
  weather_penalty?: number;
  crowd_penalty?: number;
  darkness_penalty?: number;
  construction_penalty?: number;
  final_safety_score?: number;
}

class MockDataService {
  private weatherState: WeatherState = {
    condition: 'clear',
    intensity: 0,
    startsAt: Date.now() / 1000,
    endsAt: Date.now() / 1000 + 3600,
  };
  
  // Global modifiers (not per-segment)
  private globalCrowdPenalty: number = 0; // Applied to all routes
  private globalConstructionPenalty: number = 0; // Applied to all routes

  constructor() {
    // No initialization needed - routes generated on demand
  }

  /**
   * Generate a smooth quadratic Bezier curve between three points
   * @param start Start point [lng, lat]
   * @param control Control point [lng, lat] 
   * @param end End point [lng, lat]
   * @param samples Number of points to generate (default 80 for smooth curves)
   * @returns Array of [lng, lat] coordinates
   */
  private bezierCurve(
    start: [number, number],
    control: [number, number],
    end: [number, number],
    samples: number = 80
  ): number[][] {
    const curve: number[][] = [];

    for (let i = 0; i <= samples; i++) {
      const t = i / samples;
      // Quadratic Bezier formula: (1-t)²P₀ + 2(1-t)tP₁ + t²P₂
      const lng =
        (1 - t) * (1 - t) * start[0] +
        2 * (1 - t) * t * control[0] +
        t * t * end[0];

      const lat =
        (1 - t) * (1 - t) * start[1] +
        2 * (1 - t) * t * control[1] +
        t * t * end[1];

      curve.push([lng, lat]);
    }

    return curve;
  }

  /**
   * Calculate distance between two points in kilometers
   * Uses Haversine formula approximation
   */
  private calculateDistance(
    point1: [number, number],
    point2: [number, number]
  ): number {
    const [lng1, lat1] = point1;
    const [lng2, lat2] = point2;
    
    const dLng = lng2 - lng1;
    const dLat = lat2 - lat1;
    
    // Rough approximation: 1 degree ≈ 111 km
    const distance = Math.sqrt(dLng * dLng + dLat * dLat) * 111;
    
    return distance;
  }

  /**
   * Generate 3-4 smooth route variations using Bezier curves
   * Creates Google Maps-like alternate routes (left curve, center, right curve, optional detour)
   */
  generateRoutes(
    origin: [number, number],
    dest: [number, number]
  ): Route[] {
    const routes: Route[] = [];
    const [oLng, oLat] = origin;
    const [dLng, dLat] = dest;

    // Calculate midpoint
    const midLng = (oLng + dLng) / 2;
    const midLat = (oLat + dLat) / 2;

    // Calculate perpendicular vector for offsetting control points
    const dx = dLng - oLng;
    const dy = dLat - oLat;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Perpendicular vector (rotate 90 degrees)
    const perpLng = -dy / distance;
    const perpLat = dx / distance;

    // Generate 3-4 route variations
    const routeCount = Math.floor(Math.random() * 2) + 3; // 3-4 routes
    
    // Base offset magnitude (adjusts curve intensity)
    const baseOffset = distance * 0.15; // 15% of straight-line distance

    for (let i = 0; i < routeCount; i++) {
      // Create different control point offsets
      let offsetMultiplier: number;
      
      if (routeCount === 3) {
        // Left curve, center, right curve
        offsetMultiplier = (i - 1) * 0.5; // -0.5, 0, 0.5
      } else {
        // 4 routes: left, slight left, slight right, right
        offsetMultiplier = (i - 1.5) * 0.4; // -0.6, -0.2, 0.2, 0.6
      }

      // Control point = midpoint + perpendicular offset
      const control: [number, number] = [
        midLng + perpLng * baseOffset * offsetMultiplier,
        midLat + perpLat * baseOffset * offsetMultiplier,
      ];

      // Generate smooth Bezier curve
      const polyline = this.bezierCurve(origin, control, dest, 80);

      // Calculate distance (sum of distances between consecutive points for accuracy)
      let totalDistance = 0;
      for (let j = 0; j < polyline.length - 1; j++) {
        totalDistance += this.calculateDistance(
          polyline[j] as [number, number],
          polyline[j + 1] as [number, number]
        );
      }

      // Estimate travel time (rough: 2-3 minutes per km depending on route variation)
      const baseTimePerKm = 2.5 + (Math.abs(offsetMultiplier) * 0.5); // Curvier routes take slightly longer
      const baseTime = Math.round(totalDistance * baseTimePerKm);

      routes.push({
        routeId: `route_${i + 1}`,
        polyline,
        base_time_min: baseTime,
        distance_km: Math.round(totalDistance * 10) / 10,
        segments: [], // Empty - not used anymore
      });
    }

    return routes;
  }

  // Weather state management
  getWeatherState(): WeatherState {
    return { ...this.weatherState };
  }

  setWeatherState(condition: WeatherState['condition'], intensity: number) {
    this.weatherState = {
      condition,
      intensity,
      startsAt: Date.now() / 1000,
      endsAt: Date.now() / 1000 + 3600,
    };
  }

  // Global crowd penalty (applied to all routes)
  getGlobalCrowdPenalty(): number {
    return this.globalCrowdPenalty;
  }

  setGlobalCrowdPenalty(penalty: number) {
    this.globalCrowdPenalty = Math.max(0, Math.min(30, penalty)); // Clamp 0-30
  }

  triggerCrowdSpike() {
    // Set a global crowd penalty that affects all routes
    // High crowd = penalty (traffic, congestion)
    this.globalCrowdPenalty = 15 + Math.random() * 10; // 15-25 penalty
  }

  clearCrowdSpike() {
    this.globalCrowdPenalty = 0;
  }

  // Global construction penalty
  getGlobalConstructionPenalty(): number {
    return this.globalConstructionPenalty;
  }

  setGlobalConstructionPenalty(penalty: number) {
    this.globalConstructionPenalty = Math.max(0, Math.min(20, penalty)); // Clamp 0-20
  }

  toggleConstruction(active: boolean) {
    this.globalConstructionPenalty = active ? 15 : 0;
  }
}

export const mockDataService = new MockDataService();
