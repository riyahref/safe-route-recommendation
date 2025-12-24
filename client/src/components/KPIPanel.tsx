import { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useStore } from '../store/useStore';
import Card from './Card';
import { fetchRoutes } from '../services/api';

export default function KPIPanel() {
  const { routes, selectedRouteId, weather, crowdDensities, origin, destination, vehicleType, timeOfDay, darknessToggle, setDarknessToggle, setRoutes, setSelectedRouteId } = useStore();
  const [isDarknessExpanded, setIsDarknessExpanded] = useState(false);

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

  // Calculate darkness percentage (simplified - based on time of day)
  const getDarknessPercentage = () => {
    if (timeOfDay === 'night') {
      // Estimate darkness based on route distance (longer routes = more darkness exposure)
      if (!selectedRoute) return 0;
      return Math.min(100, Math.round((selectedRoute.distance_km / 10) * 100));
    }
    return 0;
  };

  // Handle darkness toggle - recalculate routes when toggled
  const handleDarknessToggle = async () => {
    const newToggleState = !darknessToggle;
    setDarknessToggle(newToggleState);
    
    // If routes exist and we have origin/destination, recalculate routes
    if (routes.length > 0 && origin && destination) {
      try {
        const updatedRoutes = await fetchRoutes(origin, destination, vehicleType, timeOfDay, {
          darkness: newToggleState,
        });
        
        if (updatedRoutes && updatedRoutes.length > 0) {
          setRoutes(updatedRoutes);
          // Auto-select safest route after recalculation
          const safestRoute = updatedRoutes.reduce((best, current) => 
            current.final_safety_score > best.final_safety_score ? current : best
          );
          setSelectedRouteId(safestRoute.routeId);
        }
      } catch (error) {
        console.error('Error recalculating routes with darkness toggle:', error);
      }
    }
  };

  if (!selectedRoute) {
    return (
      <div className="text-sm text-[#B5B5B5] text-center py-8">
        Select a route to see details
      </div>
    );
  }

  const darknessPercentage = getDarknessPercentage();
  const darknessPenalty = selectedRoute.darkness_penalty || 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
      {/* Safety Score Card */}
      <Card icon={getSafetyIcon(selectedRoute.final_safety_score)}>
        <div className="mb-2">
          <div className="text-sm font-medium text-[#B5B5B5] mb-1">Safety Score</div>
          <div className={`text-4xl font-bold ${getSafetyColor(selectedRoute.final_safety_score)}`}>
            {selectedRoute.final_safety_score.toFixed(1)}
          </div>
        </div>
        <div className="text-xs text-[#9CA3AF]">
          {selectedRoute.routeId.toUpperCase()}
        </div>
      </Card>

      {/* Weather Summary Card */}
      <Card icon={getWeatherIcon(selectedRoute.weather?.condition || weather?.condition)}>
        <div className="mb-2">
          <div className="text-sm font-medium text-[#B5B5B5] mb-1">Weather</div>
          {selectedRoute.weather ? (
            <>
              <div className="text-2xl font-bold text-[#EAEAEA]">
                {selectedRoute.weather.temperature.toFixed(1)}°C
              </div>
              <div className="text-xs text-[#B5B5B5] capitalize mt-1">
                {selectedRoute.weather.condition.replace('-', ' ')}
              </div>
              
              {/* Hourly Forecast */}
              {selectedRoute.weather.hourly && selectedRoute.weather.hourly.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-700">
                  <div className="text-xs font-medium text-[#B5B5B5] mb-2">Hourly Forecast</div>
                  <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollbarWidth: 'thin', scrollbarColor: '#475569 transparent' }}>
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
                          className="flex-shrink-0 flex flex-col items-center gap-1 px-2 py-2 bg-slate-800/50 rounded-lg min-w-[60px] hover:bg-slate-800 transition-colors"
                        >
                          <div className="text-xs text-[#B5B5B5]">{hourStr}</div>
                          <i className={`text-lg ${getWeatherIcon(hour.condition)}`}></i>
                          <div className="text-xs font-semibold text-[#EAEAEA]">
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
              <div className="text-2xl font-bold text-[#EAEAEA] capitalize">
                {weather?.condition || 'Clear'}
              </div>
              <div className="text-xs text-[#B5B5B5] mt-1">
                Intensity: {weather ? (weather.intensity * 100).toFixed(0) : 0}%
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Crowd Trend Card */}
      <Card icon="ri-group-line">
        <div className="mb-2">
          <div className="text-sm font-medium text-[#B5B5B5] mb-2">Crowd Trend</div>
          <ResponsiveContainer width="100%" height={100}>
            <LineChart data={crowdTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis
                dataKey="time"
                stroke="#9CA3AF"
                fontSize={9}
                tick={{ fill: '#9CA3AF' }}
              />
              <YAxis
                stroke="#9CA3AF"
                fontSize={9}
                tick={{ fill: '#9CA3AF' }}
                domain={[0, 100]}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                  color: '#EAEAEA',
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

      {/* Darkness Penalty Section */}
      <Card>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <i className="ri-moon-line text-2xl text-indigo-400"></i>
              <div>
                <div className="text-sm font-semibold text-[#EAEAEA]">Darkness Penalty</div>
                <div className="text-xs text-[#9CA3AF]">Risk assessment for night travel</div>
              </div>
            </div>
            <button
              onClick={() => setIsDarknessExpanded(!isDarknessExpanded)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 text-[#EAEAEA] hover:bg-slate-700 transition-colors"
            >
              {isDarknessExpanded ? 'Collapse' : 'Expand'}
            </button>
          </div>

          {isDarknessExpanded && (
            <div className="pt-3 border-t border-slate-700 space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <i className="ri-moon-fill text-xl text-indigo-400"></i>
                  <span className="text-sm text-[#B5B5B5]">Darkness Risk</span>
                </div>
                <button
                  onClick={handleDarknessToggle}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    darknessToggle
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                      : 'bg-slate-700 text-[#EAEAEA] hover:bg-slate-600'
                  }`}
                >
                  {darknessToggle ? 'Active' : 'Inactive'}
                </button>
              </div>

              {darknessToggle && (
                <div className="grid grid-cols-3 gap-3 p-3 bg-slate-800/30 rounded-lg">
                  <div>
                    <div className="text-xs text-[#9CA3AF] mb-1">Darkness %</div>
                    <div className="text-lg font-bold text-[#EAEAEA]">{darknessPercentage}%</div>
                  </div>
                  <div>
                    <div className="text-xs text-[#9CA3AF] mb-1">Penalty</div>
                    <div className="text-lg font-bold text-red-400">-{darknessPenalty.toFixed(1)}</div>
                  </div>
                  <div className="flex items-center justify-center">
                    <i className="ri-moon-fill text-3xl text-indigo-400"></i>
                  </div>
                </div>
              )}

              {!darknessToggle && (
                <div className="p-3 bg-slate-800/30 rounded-lg text-center">
                  <div className="text-sm text-[#9CA3AF]">
                    Darkness penalty is not affecting safety scores
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

