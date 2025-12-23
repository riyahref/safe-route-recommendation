import { useState } from 'react';
import { useStore } from '../store/useStore';
import { fetchRoutes } from '../services/api';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function SearchPanel() {
  const { vehicleType, timeOfDay, setRoutes, setOrigin, setDestination, setVehicleType, setTimeOfDay, setSelectedRouteId } = useStore();
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
      
      // Auto-select safest route (highest safety score)
      if (routes && routes.length > 0) {
        const safestRoute = routes.reduce((best, current) => 
          current.final_safety_score > best.final_safety_score ? current : best
        );
        setSelectedRouteId(safestRoute.routeId);
        setRoutes(routes);
      } else {
        setRoutes(routes);
      }

      // Save route data to Firestore after successful fetch
      if (routes && routes.length > 0) {
        try {
          // Use the first route's safety score (or dummy value)
          const safetyScore = routes[0]?.final_safety_score || 85; // Dummy fallback
          
          await addDoc(collection(db, 'routes'), {
            origin: {
              lng: origin[0],
              lat: origin[1],
            },
            destination: {
              lng: dest[0],
              lat: dest[1],
            },
            safetyScore: safetyScore,
            createdAt: serverTimestamp(),
          });
          
          console.log('✅ Route saved to Firestore');
        } catch (firestoreError) {
          // Don't break the UI if Firestore save fails
          console.error('Error saving to Firestore:', firestoreError);
        }
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
      alert('Failed to fetch routes');
    } finally {
      setLoading(false);
    }
  };

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'car': return 'ri-car-line text-blue-600';
      case 'bike': return 'ri-bike-line text-green-600';
      case 'pedestrian': return 'ri-walk-line text-orange-500';
      case 'truck': return 'ri-truck-line text-blue-700';
      default: return 'ri-car-line text-blue-600';
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <i className="ri-search-line text-blue-600"></i>
        Search Routes
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Origin (lat,lng)</label>
          <input
            type="text"
            value={originInput}
            onChange={(e) => setOriginInput(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="40.7128,-74.0060"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Destination (lat,lng)</label>
          <input
            type="text"
            value={destInput}
            onChange={(e) => setDestInput(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="40.7580,-73.9855"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <i className="ri-route-line"></i>
            Vehicle Type
          </label>
          <select
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value as any)}
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="car">Car</option>
            <option value="truck">Truck</option>
            <option value="bike">Bike</option>
            <option value="pedestrian">Pedestrian</option>
          </select>
          <div className="mt-2 text-2xl">
            <i className={getVehicleIcon(vehicleType)}></i>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <i className="ri-time-line"></i>
            Time of Day
          </label>
          <select
            value={timeOfDay}
            onChange={(e) => setTimeOfDay(e.target.value as any)}
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="day">Day</option>
            <option value="night">Night</option>
          </select>
        </div>

        <button
          onClick={handleSearch}
          disabled={loading}
          className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <i className="ri-loader-4-line animate-spin"></i>
              <span>Searching...</span>
            </>
          ) : (
            <>
              <i className="ri-search-line"></i>
              <span>Search Routes</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}



