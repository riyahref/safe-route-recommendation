import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useStore } from '../store/useStore';

export default function KPIPanel() {
  const { routes, selectedRouteId, weather, crowdDensities } = useStore();

  const selectedRoute = useMemo(() => {
    return routes.find((r: any) => r.routeId === selectedRouteId);
  }, [routes, selectedRouteId]);

  // Generate crowd trend data (mock data for chart)
  const crowdTrendData = useMemo(() => {
    const data = [];
    const now = Date.now();
    for (let i = 9; i >= 0; i--) {
      const timestamp = now - i * 60000; // Every minute
      const value = 0.3 + Math.random() * 0.4; // Random between 0.3-0.7
      data.push({
        time: new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        density: Math.round(value * 100),
      });
    }
    return data;
  }, [crowdDensities]);

  const getWeatherEmoji = (condition?: string) => {
    switch (condition) {
      case 'clear':
        return '☀️';
      case 'rain':
        return '🌧️';
      case 'storm':
        return '⛈️';
      case 'fog':
        return '🌫️';
      default:
        return '☀️';
    }
  };

  const getSafetyColor = (score?: number) => {
    if (!score) return 'text-gray-400';
    if (score >= 70) return 'text-green-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="p-4 border-b border-gray-700">
      <h2 className="text-lg font-semibold mb-3">KPI Dashboard</h2>

      {selectedRoute ? (
        <div className="space-y-4">
          <div className="p-3 bg-gray-800 rounded border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Safety Score</div>
            <div className={`text-3xl font-bold ${getSafetyColor(selectedRoute.final_safety_score)}`}>
              {selectedRoute.final_safety_score.toFixed(1)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Route: {selectedRoute.routeId.toUpperCase()}
            </div>
          </div>

          <div className="p-3 bg-gray-800 rounded border border-gray-700">
            <div className="text-sm text-gray-400 mb-2">Current Weather</div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getWeatherEmoji(weather?.condition)}</span>
              <div>
                <div className="font-medium capitalize">{weather?.condition || 'Clear'}</div>
                <div className="text-xs text-gray-400">
                  Intensity: {weather ? (weather.intensity * 100).toFixed(0) : 0}%
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-gray-800 rounded border border-gray-700">
            <div className="text-sm text-gray-400 mb-2">Crowd Trend</div>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={crowdTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="time"
                  stroke="#9ca3af"
                  fontSize={10}
                  tick={{ fill: '#9ca3af' }}
                />
                <YAxis
                  stroke="#9ca3af"
                  fontSize={10}
                  tick={{ fill: '#9ca3af' }}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '4px',
                    color: '#fff',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="density"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="text-sm text-gray-400">
          Select a route to see KPIs
        </div>
      )}
    </div>
  );
}

