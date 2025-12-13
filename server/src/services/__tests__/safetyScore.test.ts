import { computeSafetyScore } from '../safetyScore';
import { Route, WeatherState, CrowdDensity } from '../../mockData';

describe('computeSafetyScore', () => {
  const mockRoute: Route = {
    routeId: 'r1',
    polyline: [[-74.006, 40.7128], [-74.005, 40.713]],
    base_time_min: 40,
    distance_km: 18,
    segments: ['s1', 's2'],
  };

  const clearWeather: WeatherState = {
    condition: 'clear',
    intensity: 0,
    startsAt: Date.now() / 1000,
    endsAt: Date.now() / 1000 + 3600,
  };

  const normalCrowd: CrowdDensity[] = [
    { segmentId: 's1', density: 'normal', value: 0.5 },
    { segmentId: 's2', density: 'normal', value: 0.5 },
  ];

  test('calculates base score correctly', () => {
    const result = computeSafetyScore(
      mockRoute,
      clearWeather,
      normalCrowd,
      { vehicleType: 'car', timeOfDay: 'day' }
    );

    expect(result.base_score).toBeGreaterThan(0);
    expect(result.base_score).toBeLessThanOrEqual(100);
  });

  test('applies weather penalty for rain', () => {
    const rainWeather: WeatherState = {
      condition: 'rain',
      intensity: 0.7,
      startsAt: Date.now() / 1000,
      endsAt: Date.now() / 1000 + 3600,
    };

    const result = computeSafetyScore(
      mockRoute,
      rainWeather,
      normalCrowd,
      { vehicleType: 'car', timeOfDay: 'day' }
    );

    expect(result.weather_penalty).toBeGreaterThan(0);
    expect(result.final_safety_score).toBeLessThan(result.base_score);
  });

  test('applies darkness penalty at night', () => {
    const dayResult = computeSafetyScore(
      mockRoute,
      clearWeather,
      normalCrowd,
      { vehicleType: 'car', timeOfDay: 'day' }
    );

    const nightResult = computeSafetyScore(
      mockRoute,
      clearWeather,
      normalCrowd,
      { vehicleType: 'car', timeOfDay: 'night' }
    );

    expect(nightResult.darkness_penalty).toBeGreaterThan(0);
    expect(nightResult.final_safety_score).toBeLessThan(dayResult.final_safety_score);
  });

  test('applies higher darkness penalty for pedestrians', () => {
    const carResult = computeSafetyScore(
      mockRoute,
      clearWeather,
      normalCrowd,
      { vehicleType: 'car', timeOfDay: 'night' }
    );

    const pedestrianResult = computeSafetyScore(
      mockRoute,
      clearWeather,
      normalCrowd,
      { vehicleType: 'pedestrian', timeOfDay: 'night' }
    );

    expect(pedestrianResult.darkness_penalty).toBeGreaterThan(carResult.darkness_penalty);
  });

  test('applies crowd bonus for high density', () => {
    const highCrowd: CrowdDensity[] = [
      { segmentId: 's1', density: 'high', value: 0.9 },
      { segmentId: 's2', density: 'high', value: 0.8 },
    ];

    const result = computeSafetyScore(
      mockRoute,
      clearWeather,
      highCrowd,
      { vehicleType: 'car', timeOfDay: 'day' }
    );

    expect(result.crowd_penalty).toBeGreaterThan(0); // Positive = bonus
    expect(result.final_safety_score).toBeGreaterThan(result.base_score);
  });

  test('applies crowd penalty for low density', () => {
    const lowCrowd: CrowdDensity[] = [
      { segmentId: 's1', density: 'low', value: 0.2 },
      { segmentId: 's2', density: 'low', value: 0.1 },
    ];

    const result = computeSafetyScore(
      mockRoute,
      clearWeather,
      lowCrowd,
      { vehicleType: 'car', timeOfDay: 'day' }
    );

    expect(result.crowd_penalty).toBeLessThan(0); // Negative = penalty
    expect(result.final_safety_score).toBeLessThan(result.base_score);
  });

  test('final score is clamped between 0 and 100', () => {
    const stormWeather: WeatherState = {
      condition: 'storm',
      intensity: 1.0,
      startsAt: Date.now() / 1000,
      endsAt: Date.now() / 1000 + 3600,
    };

    const result = computeSafetyScore(
      mockRoute,
      stormWeather,
      normalCrowd,
      { vehicleType: 'pedestrian', timeOfDay: 'night' }
    );

    expect(result.final_safety_score).toBeGreaterThanOrEqual(0);
    expect(result.final_safety_score).toBeLessThanOrEqual(100);
  });
});



