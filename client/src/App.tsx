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
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Left Column - Search Panel */}
      <div className="w-64 bg-slate-900/80 border-r border-slate-800 flex flex-col backdrop-blur">
        <div className="p-6 border-b border-slate-800 flex-shrink-0">
          <h1 className="text-2xl font-bold text-[#EAEAEA] flex items-center gap-2">
            <i className="ri-route-line text-cyan-400"></i>
            Canopy
          </h1>
          <p className="text-sm text-[#B5B5B5] mt-1">
            Real-time adaptive routing
          </p>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          <SearchPanel />
        </div>
      </div>

      {/* Middle Column - Route Cards */}
      <div className="w-80 bg-slate-900/70 border-r border-slate-800 flex flex-col backdrop-blur">
        <div className="p-6 overflow-y-auto flex-1">
          <RouteComparisonPanel />
        </div>
      </div>

      {/* Right Column - Map + Bottom Cards - Scrollable */}
      <div className="flex-1 flex flex-col bg-slate-950 min-w-0 overflow-y-auto">
        {/* Map Container - Fixed height, doesn't shrink */}
        <div className="h-[65vh] relative flex-shrink-0 min-h-[500px]">
          <MapView />
        </div>
        
        {/* Bottom Info Cards - Scrollable content below map */}
        <div className="p-6 border-t border-slate-800 bg-slate-900/80 backdrop-blur">
          <KPIPanel />
        </div>
      </div>
    </div>
  );
}

export default App;



