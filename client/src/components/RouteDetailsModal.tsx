import { useStore, Route } from '../store/useStore';
import SafetyScoreTooltip from './SafetyScoreTooltip';

interface RouteDetailsModalProps {
  routeId: string | null;
  onClose: () => void;
}

export default function RouteDetailsModal({ routeId, onClose }: RouteDetailsModalProps) {
  const { routes } = useStore();
  const route = routes.find((r: Route) => r.routeId === routeId);

  if (!route) return null;

  const getSafetyColor = (score: number) => {
    if (score >= 70) return 'text-green-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-gray-900 text-white rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Route {route.routeId.toUpperCase()} Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-gray-800 rounded border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#B5B5B5]">Safety Score</span>
              <div className="flex items-center gap-2">
                <span className={`text-3xl font-bold ${getSafetyColor(route.final_safety_score)}`}>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-800 rounded border border-gray-700">
              <div className="text-sm text-[#B5B5B5] mb-1">Time</div>
              <div className="text-lg font-semibold text-[#EAEAEA]">{route.base_time_min} min</div>
            </div>
            <div className="p-3 bg-gray-800 rounded border border-gray-700">
              <div className="text-sm text-[#B5B5B5] mb-1">Distance</div>
              <div className="text-lg font-semibold text-[#EAEAEA]">{route.distance_km} km</div>
            </div>
          </div>

          <div className="p-4 bg-gray-800 rounded border border-gray-700">
            <div className="text-sm font-semibold mb-3 text-[#EAEAEA]">Score Breakdown</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#B5B5B5]">Base Score:</span>
                <span className="text-[#EAEAEA]">{route.base_score.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#B5B5B5]">Weather Penalty:</span>
                <span className="text-red-400">-{route.weather_penalty.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#B5B5B5]">Crowd:</span>
                <span className={route.crowd_penalty >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {route.crowd_penalty >= 0 ? '+' : ''}{route.crowd_penalty.toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#B5B5B5]">Darkness Penalty:</span>
                <span className="text-red-400">-{route.darkness_penalty.toFixed(1)}</span>
              </div>
              {route.construction_penalty > 0 && (
                <div className="flex justify-between">
                  <span className="text-[#B5B5B5]">Construction:</span>
                  <span className="text-red-400">-{route.construction_penalty.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-3 bg-gray-800 rounded border border-gray-700">
            <div className="text-sm text-[#B5B5B5] mb-1">Segments</div>
            <div className="text-sm text-[#EAEAEA]">{route.segments.join(', ')}</div>
          </div>

          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

