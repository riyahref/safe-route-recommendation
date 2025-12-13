/**
 * Mock Data Service
 * Generates static road segments, weather schedules, and crowd density patterns
 */

export interface RoadSegment {
  segmentId: string;
  polyline: number[][]; // Array of [lng, lat] coordinates
  baseSafetyScore: number; // 0-100, higher is safer
  lighting: 'good' | 'moderate' | 'poor';
  cctv: boolean;
  isolationLevel: 'low' | 'medium' | 'high';
}

export interface WeatherState {
  condition: 'clear' | 'rain' | 'storm' | 'fog';
  intensity: number; // 0-1
  startsAt: number; // Unix timestamp
  endsAt: number; // Unix timestamp
}

export interface CrowdDensity {
  segmentId: string;
  density: 'low' | 'normal' | 'high';
  value: number; // 0-1
}

export interface Route {
  routeId: string;
  polyline: number[][]; // Array of [lng, lat] coordinates
  base_time_min: number;
  distance_km: number;
  segments: string[];
}

class MockDataService {
  private segments: Map<string, RoadSegment> = new Map();
  private weatherState: WeatherState = {
    condition: 'clear',
    intensity: 0,
    startsAt: Date.now() / 1000,
    endsAt: Date.now() / 1000 + 3600,
  };
  private crowdDensities: Map<string, CrowdDensity> = new Map();
  private constructionSegments: Set<string> = new Set();

  constructor() {
    this.initializeSegments();
    this.initializeCrowdDensities();
  }

  private initializeSegments() {
    // Generate 8 road segments with varying safety characteristics
    const baseLat = 40.7128; // NYC area
    const baseLng = -74.0060;

    const segmentConfigs = [
      { id: 's1', offset: [0, 0], safety: 85, lighting: 'good' as const, cctv: true, isolation: 'low' as const },
      { id: 's2', offset: [0.01, 0.01], safety: 70, lighting: 'moderate' as const, cctv: true, isolation: 'low' as const },
      { id: 's3', offset: [0.02, 0], safety: 60, lighting: 'moderate' as const, cctv: false, isolation: 'medium' as const },
      { id: 's4', offset: [0.01, -0.01], safety: 50, lighting: 'poor' as const, cctv: false, isolation: 'high' as const },
      { id: 's5', offset: [-0.01, 0.01], safety: 80, lighting: 'good' as const, cctv: true, isolation: 'low' as const },
      { id: 's6', offset: [-0.02, 0], safety: 65, lighting: 'moderate' as const, cctv: false, isolation: 'medium' as const },
      { id: 's7', offset: [-0.01, -0.01], safety: 75, lighting: 'good' as const, cctv: true, isolation: 'low' as const },
      { id: 's8', offset: [0, -0.02], safety: 55, lighting: 'poor' as const, cctv: false, isolation: 'high' as const },
    ];

    segmentConfigs.forEach((config) => {
      // Create a simple polyline for each segment (2 points)
      const polyline: number[][] = [
        [baseLng + config.offset[0], baseLat + config.offset[1]],
        [baseLng + config.offset[0] + 0.005, baseLat + config.offset[1] + 0.005],
      ];

      this.segments.set(config.id, {
        segmentId: config.id,
        polyline,
        baseSafetyScore: config.safety,
        lighting: config.lighting,
        cctv: config.cctv,
        isolationLevel: config.isolation,
      });
    });
  }

  private initializeCrowdDensities() {
    // Initialize all segments with normal crowd density
    this.segments.forEach((segment) => {
      this.crowdDensities.set(segment.segmentId, {
        segmentId: segment.segmentId,
        density: 'normal',
        value: 0.5,
      });
    });
  }

  getSegments(): RoadSegment[] {
    return Array.from(this.segments.values());
  }

  getSegment(segmentId: string): RoadSegment | undefined {
    return this.segments.get(segmentId);
  }

  getWeatherState(): WeatherState {
    return { ...this.weatherState };
  }

  setWeatherState(condition: WeatherState['condition'], intensity: number) {
    this.weatherState = {
      condition,
      intensity,
      startsAt: Date.now() / 1000,
      endsAt: Date.now() / 1000 + 3600, // 1 hour default
    };
  }

  getCrowdDensity(segmentId: string): CrowdDensity | undefined {
    return this.crowdDensities.get(segmentId);
  }

  getCrowdDensities(segmentIds: string[]): CrowdDensity[] {
    return segmentIds
      .map((id) => this.crowdDensities.get(id))
      .filter((d): d is CrowdDensity => d !== undefined);
  }

  setCrowdDensity(segmentId: string, density: CrowdDensity['density'], value: number) {
    this.crowdDensities.set(segmentId, {
      segmentId,
      density,
      value,
    });
  }

  triggerCrowdSpike() {
    // Randomly spike crowd on 2-3 segments
    const segmentIds = Array.from(this.segments.keys());
    const spikeCount = Math.floor(Math.random() * 2) + 2;
    const shuffled = segmentIds.sort(() => 0.5 - Math.random());
    
    shuffled.slice(0, spikeCount).forEach((id) => {
      this.setCrowdDensity(id, 'high', 0.8 + Math.random() * 0.2);
    });
  }

  toggleConstruction(segmentId: string) {
    if (this.constructionSegments.has(segmentId)) {
      this.constructionSegments.delete(segmentId);
    } else {
      this.constructionSegments.add(segmentId);
    }
  }

  hasConstruction(segmentId: string): boolean {
    return this.constructionSegments.has(segmentId);
  }

  generateRoutes(origin: [number, number], dest: [number, number]): Route[] {
    // Generate 2-4 route options between origin and destination
    const routeCount = Math.floor(Math.random() * 3) + 2; // 2-4 routes
    const routes: Route[] = [];

    // Get available segments
    const availableSegments = Array.from(this.segments.keys());

    for (let i = 0; i < routeCount; i++) {
      // Create a route using 2-4 segments
      const segmentCount = Math.floor(Math.random() * 3) + 2;
      const routeSegments = availableSegments
        .sort(() => 0.5 - Math.random())
        .slice(0, segmentCount);

      // Build polyline from origin through segments to destination
      const polyline: number[][] = [origin];
      
      routeSegments.forEach((segId) => {
        const segment = this.segments.get(segId);
        if (segment) {
          polyline.push(...segment.polyline);
        }
      });
      
      polyline.push(dest);

      // Calculate base time and distance (simplified)
      const baseTime = 30 + Math.random() * 30; // 30-60 minutes
      const distance = 10 + Math.random() * 15; // 10-25 km

      routes.push({
        routeId: `r${i + 1}`,
        polyline,
        base_time_min: Math.round(baseTime),
        distance_km: Math.round(distance * 10) / 10,
        segments: routeSegments,
      });
    }

    return routes;
  }
}

export const mockDataService = new MockDataService();



