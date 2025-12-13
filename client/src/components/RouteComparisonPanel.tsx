import { useStore } from '../store/useStore';
import SafetyScoreTooltip from './SafetyScoreTooltip';

export default function RouteComparisonPanel() {
  const { routes, selectedRouteId, setSelectedRouteId } = useStore();

  if (routes.length === 0) {
    return (
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold mb-2">Route Comparison</h2>
        <p className="text-sm text-gray-400">Search for routes to see options</p>
      </div>
    );
  }

  const getSafetyColor = (score: number) => {
    if (score >= 70) return 'text-green-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="p-4 border-b border-gray-700">
      <h2 className="text-lg font-semibold mb-3">Route Comparison</h2>
      <div className="space-y-3">
        {routes.map((route) => (
          <div
            key={route.routeId}
            className={`p-3 bg-gray-800 rounded border ${
              selectedRouteId === route.routeId
                ? 'border-blue-500'
                : 'border-gray-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{route.routeId.toUpperCase()}</span>
              <div className="flex items-center gap-2">
                <span className={`text-lg font-bold ${getSafetyColor(route.final_safety_score)}`}>
                  {route.final_safety_score.toFixed(1)}
                </span>
                <SafetyScoreTooltip
                  score={route.final_safety_score}
                  breakdown={{
                    base_score: route.base_score,
                    weather_penalty: route.weather_penalty,
                    crowd_penalty: route.crowd_penalty,
                    darkness_penalty: route.darkness_penalty,
                    construction_penalty: route.construction_penalty,
                  }}
                />
              </div>
            </div>

            <div className="text-xs text-gray-400 space-y-1 mb-3">
              <div>Time: {route.base_time_min} min</div>
              <div>Distance: {route.distance_km} km</div>
            </div>

            <div className="text-xs space-y-1 mb-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Base Score:</span>
                <span>{route.base_score.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Weather Penalty:</span>
                <span className="text-red-400">-{route.weather_penalty.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Crowd:</span>
                <span className={route.crowd_penalty >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {route.crowd_penalty >= 0 ? '+' : ''}{route.crowd_penalty.toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Darkness Penalty:</span>
                <span className="text-red-400">-{route.darkness_penalty.toFixed(1)}</span>
              </div>
              {route.construction_penalty > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Construction:</span>
                  <span className="text-red-400">-{route.construction_penalty.toFixed(1)}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedRouteId(route.routeId)}
              className={`w-full px-3 py-1.5 rounded text-sm font-medium ${
                selectedRouteId === route.routeId
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {selectedRouteId === route.routeId ? 'Selected' : 'Select Route'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

