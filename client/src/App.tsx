import { useEffect } from 'react';
import { connectWebSocket, disconnectWebSocket } from './services/websocket';
import MapView from './components/MapView';
import SearchPanel from './components/SearchPanel';
import RouteComparisonPanel from './components/RouteComparisonPanel';
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
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100">
      {/* Left Column - Search Panel */}
      <div className="w-80 bg-slate-900/80 border-r border-slate-800 flex flex-col overflow-y-auto backdrop-blur">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <i className="ri-route-line text-cyan-400"></i>
            Safety Routing
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time adaptive routing
          </p>
        </div>
        <div className="p-6">
          <SearchPanel />
        </div>
      </div>

      {/* Middle Column - Route Cards */}
      <div className="w-96 bg-slate-900/70 border-r border-slate-800 flex flex-col overflow-y-auto backdrop-blur">
        <div className="p-6">
          <RouteComparisonPanel />
        </div>
      </div>

      {/* Right Column - Map + Bottom Cards */}
      <div className="flex-1 flex flex-col bg-slate-950">
        {/* Map Container */}
        <div className="flex-[1.2] relative">
          <MapView />
        </div>
        
        {/* Bottom Info Cards */}
        <div className="p-6 border-t border-slate-800 bg-slate-900/80 backdrop-blur">
          <KPIPanel />
        </div>
      </div>
    </div>
  );
}

export default App;



