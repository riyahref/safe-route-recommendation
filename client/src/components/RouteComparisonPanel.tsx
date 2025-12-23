import { useStore } from '../store/useStore';
import { RouteResponse } from '../services/api';
import SafetyScoreTooltip from './SafetyScoreTooltip';
import Card from './Card';

export default function RouteComparisonPanel() {
  const { routes, selectedRouteId, setSelectedRouteId } = useStore();

  if (routes.length === 0) {
    return (
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <i className="ri-route-line text-blue-600"></i>
          Route Comparison
        </h2>
        <p className="text-sm text-gray-500">Search for routes to see options</p>
      </div>
    );
  }

  const getSafetyColor = (score: number) => {
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSafetyIcon = (score: number) => {
    if (score >= 75) return 'ri-shield-check-line text-green-600';
    if (score >= 50) return 'ri-shield-warning-line text-yellow-600';
    return 'ri-shield-cross-line text-red-600';
  };

  const getWeatherIcon = (condition?: string) => {
    if (!condition) return 'ri-cloud-line text-gray-400';
    switch (condition) {
      case 'clear': return 'ri-sun-line text-yellow-500';
      case 'partly-cloudy': return 'ri-cloudy-line text-gray-400';
      case 'rain': return 'ri-rainy-line text-blue-500';
      case 'drizzle': return 'ri-drizzle-line text-blue-400';
      case 'storm': return 'ri-thunderstorms-line text-purple-600';
      case 'fog': return 'ri-foggy-line text-gray-400';
      case 'snow': return 'ri-snowy-line text-blue-300';
      case 'freezing-rain': return 'ri-hail-line text-blue-600';
      default: return 'ri-cloud-line text-gray-400';
    }
  };


  const getWeatherWarnings = (weather?: RouteResponse['weather']) => {
    if (!weather) return [];
    const warnings: string[] = [];
    
    if (weather.precipitation > 5) warnings.push('Heavy Rain');
    if (weather.windSpeed > 60) warnings.push('Strong Wind');
    if (weather.visibility < 1) warnings.push('Low Visibility');
    if (weather.condition === 'storm') warnings.push('Thunderstorm');
    if (weather.condition === 'freezing-rain') warnings.push('Freezing Rain');
    
    return warnings;
  };
  
  // Find safest route (highest safety score)
  const safestRouteId = routes.length > 0 
    ? routes.reduce((best, current) => 
        current.final_safety_score > best.final_safety_score ? current : best
      ).routeId
    : null;

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <i className="ri-route-line text-blue-600"></i>
        Route Options
      </h2>
      <div className="space-y-4">
        {routes.map((route) => {
          const isSelected = selectedRouteId === route.routeId;
          const isSafest = route.routeId === safestRouteId;
          
          return (
            <Card
              key={route.routeId}
              selected={isSelected}
              onClick={() => setSelectedRouteId(route.routeId)}
              icon="ri-route-line"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <span className="font-bold text-blue-600">{route.routeId.replace('route_', '')}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{route.routeId.toUpperCase()}</div>
                    {isSafest && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-xs font-semibold rounded-lg mt-1">
                        <i className="ri-star-fill"></i>
                        Best Route
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <i className={getSafetyIcon(route.final_safety_score)}></i>
                  <span className={`text-2xl font-bold ${getSafetyColor(route.final_safety_score)}`}>
                    {route.final_safety_score.toFixed(1)}
                  </span>
                </div>
              </div>

              {/* Route Info */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <i className="ri-time-line text-gray-400"></i>
                  <span className="text-gray-600">{route.base_time_min} min</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <i className="ri-map-pin-distance-line text-gray-400"></i>
                  <span className="text-gray-600">{route.distance_km} km</span>
                </div>
              </div>

              {/* Weather Info */}
              {route.weather && (
                <div className="mb-4 p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <i className={`text-2xl ${getWeatherIcon(route.weather.condition)}`}></i>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">
                        {route.weather.temperature.toFixed(1)}°C
                      </div>
                      <div className="text-xs text-gray-500 capitalize">
                        {route.weather.condition.replace('-', ' ')}
                      </div>
                    </div>
                  </div>
                  {getWeatherWarnings(route.weather).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {getWeatherWarnings(route.weather).map((warning, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 text-xs font-semibold rounded-lg"
                        >
                          <i className="ri-alert-line"></i>
                          {warning}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Safety Breakdown */}
              <div className="space-y-2 mb-4 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-gray-100">
                  <span className="text-gray-600">Base Score</span>
                  <span className="font-medium text-gray-900">{route.base_score.toFixed(1)}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-100">
                  <span className="text-gray-600 flex items-center gap-1">
                    <i className="ri-rainy-line"></i>
                    Weather
                  </span>
                  <span className="font-medium text-red-600">-{route.weather_penalty.toFixed(1)}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-100">
                  <span className="text-gray-600 flex items-center gap-1">
                    <i className="ri-group-line"></i>
                    Crowd
                  </span>
                  <span className={`font-medium ${route.crowd_penalty >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {route.crowd_penalty >= 0 ? '+' : ''}{route.crowd_penalty.toFixed(1)}
                  </span>
                </div>
                {route.construction_penalty > 0 && (
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-gray-600 flex items-center gap-1">
                      <i className="ri-alert-line"></i>
                      Construction
                    </span>
                    <span className="font-medium text-red-600">-{route.construction_penalty.toFixed(1)}</span>
                  </div>
                )}
              </div>

              {/* Select Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedRouteId(route.routeId);
                }}
                className={`w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {isSelected ? (
                  <span className="flex items-center justify-center gap-2">
                    <i className="ri-check-line"></i>
                    Selected
                  </span>
                ) : (
                  'Select Route'
                )}
              </button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

