import { useEffect } from 'react';
import { connectWebSocket, disconnectWebSocket } from './services/websocket';
import MapView from './components/MapView';
import SearchPanel from './components/SearchPanel';
import RouteComparisonPanel from './components/RouteComparisonPanel';
import DevControlsPanel from './components/DevControlsPanel';
import KPIPanel from './components/KPIPanel';

console.log("Frontend API URL =", import.meta.env.VITE_API_URL);


function App() {
  useEffect(() => {
    connectWebSocket();
    return () => {
      disconnectWebSocket();
    };
  }, []);

  return (
    <div className="flex h-screen w-screen">
      {/* Left Sidebar */}
      <div className="w-96 bg-gray-900 text-white flex flex-col overflow-y-auto">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-2xl font-bold">Safety-Aware Routing</h1>
          <p className="text-sm text-gray-400 mt-1">
            Real-time adaptive routing for safety
          </p>
        </div>

        <SearchPanel />
        <RouteComparisonPanel />
        <KPIPanel />
        <DevControlsPanel />
      </div>

      {/* Map View */}
      <div className="flex-1 relative">
        <MapView />
      </div>
    </div>
  );
}

export default App;



