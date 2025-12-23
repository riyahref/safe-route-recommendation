import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useStore } from '../store/useStore';
import Card from './Card';

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

  const getWeatherIcon = (condition?: string) => {
    if (!condition) return 'ri-sun-line text-yellow-500';
    switch (condition) {
      case 'clear': return 'ri-sun-line text-yellow-500';
      case 'rain': return 'ri-rainy-line text-blue-500';
      case 'storm': return 'ri-thunderstorms-line text-purple-600';
      case 'fog': return 'ri-foggy-line text-gray-400';
      default: return 'ri-cloud-line text-gray-400';
    }
  };

  const getSafetyColor = (score?: number) => {
    if (!score) return 'text-gray-400';
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSafetyIcon = (score?: number) => {
    if (!score) return 'ri-shield-line text-gray-400';
    if (score >= 75) return 'ri-shield-check-line text-green-600';
    if (score >= 50) return 'ri-shield-warning-line text-yellow-600';
    return 'ri-shield-cross-line text-red-600';
  };

  if (!selectedRoute) {
    return (
      <div className="text-sm text-gray-500 text-center py-8">
        Select a route to see details
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Safety Score Card */}
      <Card icon={getSafetyIcon(selectedRoute.final_safety_score)}>
        <div className="mb-2">
          <div className="text-sm font-medium text-gray-600 mb-1">Safety Score</div>
          <div className={`text-4xl font-bold ${getSafetyColor(selectedRoute.final_safety_score)}`}>
            {selectedRoute.final_safety_score.toFixed(1)}
          </div>
        </div>
        <div className="text-xs text-gray-500">
          {selectedRoute.routeId.toUpperCase()}
        </div>
      </Card>

      {/* Weather Summary Card */}
      <Card icon={getWeatherIcon(selectedRoute.weather?.condition || weather?.condition)}>
        <div className="mb-2">
          <div className="text-sm font-medium text-gray-600 mb-1">Weather</div>
          {selectedRoute.weather ? (
            <>
              <div className="text-2xl font-bold text-gray-900">
                {selectedRoute.weather.temperature.toFixed(1)}°C
              </div>
              <div className="text-xs text-gray-500 capitalize mt-1">
                {selectedRoute.weather.condition.replace('-', ' ')}
              </div>
              
              {/* Hourly Forecast */}
              {selectedRoute.weather.hourly && selectedRoute.weather.hourly.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="text-xs font-medium text-gray-600 mb-2">Hourly Forecast</div>
                  <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}>
                    {selectedRoute.weather.hourly.slice(0, 12).map((hour, idx) => {
                      const hourDate = new Date(hour.time);
                      const hourStr = hourDate.toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: true 
                      });
                      return (
                        <div
                          key={idx}
                          className="flex-shrink-0 flex flex-col items-center gap-1 px-2 py-2 bg-gray-50 rounded-lg min-w-[60px] hover:bg-gray-100 transition-colors"
                        >
                          <div className="text-xs text-gray-500">{hourStr}</div>
                          <i className={`text-lg ${getWeatherIcon(hour.condition)}`}></i>
                          <div className="text-xs font-semibold text-gray-900">
                            {hour.temperature.toFixed(0)}°
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="text-2xl font-bold text-gray-900 capitalize">
                {weather?.condition || 'Clear'}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Intensity: {weather ? (weather.intensity * 100).toFixed(0) : 0}%
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Crowd Trend Card */}
      <Card icon="ri-group-line">
        <div className="mb-2">
          <div className="text-sm font-medium text-gray-600 mb-2">Crowd Trend</div>
          <ResponsiveContainer width="100%" height={100}>
            <LineChart data={crowdTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="time"
                stroke="#9ca3af"
                fontSize={9}
                tick={{ fill: '#6b7280' }}
              />
              <YAxis
                stroke="#9ca3af"
                fontSize={9}
                tick={{ fill: '#6b7280' }}
                domain={[0, 100]}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
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
      </Card>
    </div>
  );
}

