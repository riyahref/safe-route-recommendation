import { create } from 'zustand';

export interface Route {
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

export interface WeatherState {
  condition: 'clear' | 'rain' | 'storm' | 'fog';
  intensity: number;
  starts_at: number;
  ends_at: number;
}

export interface CrowdDensity {
  global?: boolean;
  penalty?: number;
  segmentId?: string; // Optional for backward compatibility
  density?: 'low' | 'normal' | 'high';
  value?: number;
}

export interface VehiclePosition {
  lat: number;
  lng: number;
  timestamp: number;
}

interface AppState {
  routes: Route[];
  selectedRouteId: string | null;
  origin: [number, number] | null;
  destination: [number, number] | null;
  vehicleType: 'car' | 'truck' | 'bike' | 'pedestrian';
  timeOfDay: 'day' | 'night';
  weather: WeatherState | null;
  crowdDensities: Map<string, CrowdDensity>;
  vehiclePosition: VehiclePosition | null;
  mockApiPayloads: any;
}

interface AppActions {
  setRoutes: (routes: Route[]) => void;
  setSelectedRouteId: (routeId: string | null) => void;
  setOrigin: (origin: [number, number] | null) => void;
  setDestination: (dest: [number, number] | null) => void;
  setVehicleType: (type: 'car' | 'truck' | 'bike' | 'pedestrian') => void;
  setTimeOfDay: (time: 'day' | 'night') => void;
  setWeather: (weather: WeatherState) => void;
  setCrowdDensity: (density: CrowdDensity) => void;
  setVehiclePosition: (position: VehiclePosition) => void;
  setMockApiPayloads: (payloads: any) => void;
}

export const useStore = create<AppState & AppActions>((set: any) => ({
  routes: [],
  selectedRouteId: null,
  origin: null,
  destination: null,
  vehicleType: 'car',
  timeOfDay: 'day',
  weather: null,
  crowdDensities: new Map(),
  vehiclePosition: null,
  mockApiPayloads: null,

  setRoutes: (routes: Route[]) => set({ routes }),
  setSelectedRouteId: (routeId: string | null) => set({ selectedRouteId: routeId }),
  setOrigin: (origin: [number, number] | null) => set({ origin }),
  setDestination: (destination: [number, number] | null) => set({ destination }),
  setVehicleType: (vehicleType: 'car' | 'truck' | 'bike' | 'pedestrian') => set({ vehicleType }),
  setTimeOfDay: (timeOfDay: 'day' | 'night') => set({ timeOfDay }),
  setWeather: (weather: WeatherState) => set({ weather }),
  setCrowdDensity: (density: CrowdDensity) =>
    set((state: AppState) => {
      // For global updates, store with a special key
      const newMap = new Map(state.crowdDensities);
      const key = density.global ? 'global' : (density.segmentId || 'global');
      newMap.set(key, density);
      return { crowdDensities: newMap };
    }),
  setVehiclePosition: (vehiclePosition: VehiclePosition) => set({ vehiclePosition }),
  setMockApiPayloads: (mockApiPayloads: any) => set({ mockApiPayloads }),
}));

