import { useState } from 'react';
import { useStore } from '../store/useStore';
import { fetchRoutes } from '../services/api';

export default function SearchPanel() {
  const { vehicleType, timeOfDay, setRoutes, setOrigin, setDestination, setVehicleType, setTimeOfDay } = useStore();
  const [originInput, setOriginInput] = useState('40.7128,-74.0060');
  const [destInput, setDestInput] = useState('40.7580,-73.9855');
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    try {
      const [lat1, lng1] = originInput.split(',').map(Number);
      const [lat2, lng2] = destInput.split(',').map(Number);

      if (isNaN(lat1) || isNaN(lng1) || isNaN(lat2) || isNaN(lng2)) {
        alert('Invalid coordinates. Use format: lat,lng');
        return;
      }

      // Store coordinates as [lng, lat] for map rendering
      const origin: [number, number] = [lng1, lat1];
      const dest: [number, number] = [lng2, lat2];

      setOrigin(origin);
      setDestination(dest);
      setLoading(true);

      const routes = await fetchRoutes(origin, dest, vehicleType, timeOfDay);
      setRoutes(routes);
    } catch (error) {
      console.error('Error fetching routes:', error);
      alert('Failed to fetch routes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border-b border-gray-700">
      <h2 className="text-lg font-semibold mb-3">Search Routes</h2>

      <div className="space-y-3">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Origin (lat,lng)</label>
          <input
            type="text"
            value={originInput}
            onChange={(e) => setOriginInput(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
            placeholder="40.7128,-74.0060"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Destination (lat,lng)</label>
          <input
            type="text"
            value={destInput}
            onChange={(e) => setDestInput(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
            placeholder="40.7580,-73.9855"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Vehicle Type</label>
          <select
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value as any)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
          >
            <option value="car">Car</option>
            <option value="truck">Truck</option>
            <option value="bike">Bike</option>
            <option value="pedestrian">Pedestrian</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Time of Day</label>
          <select
            value={timeOfDay}
            onChange={(e) => setTimeOfDay(e.target.value as any)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
          >
            <option value="day">Day</option>
            <option value="night">Night</option>
          </select>
        </div>

        <button
          onClick={handleSearch}
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-medium disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Search Routes'}
        </button>
      </div>
    </div>
  );
}



