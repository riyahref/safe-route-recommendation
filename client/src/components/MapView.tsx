import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useStore } from '../store/useStore';
import RouteDetailsModal from './RouteDetailsModal';

export default function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const originMarkerRef = useRef<L.Marker | null>(null);
  const destinationMarkerRef = useRef<L.Marker | null>(null);
  const [modalRouteId, setModalRouteId] = useState<string | null>(null);

  const { routes, selectedRouteId, origin, destination, setSelectedRouteId } = useStore();

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize Leaflet map
    map.current = L.map(mapContainer.current, {
      center: [40.7128, -74.006], // Default center (NYC) - [lat, lng]
      zoom: 12,
      zoomControl: true,
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map.current);

    // Force map to invalidate size after a short delay to ensure container is rendered
    setTimeout(() => {
      if (map.current) {
        map.current.invalidateSize();
      }
    }, 100);

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update route polyline
  useEffect(() => {
    if (!map.current) return;

    // Remove existing route if no routes
    if (routes.length === 0) {
      if (routeLayerRef.current) {
        map.current.removeLayer(routeLayerRef.current);
        routeLayerRef.current = null;
      }
      return;
    }

    // Use first route or selected route
    const routeToDisplay = routes.find(r => r.routeId === selectedRouteId) || routes[0];

    if (!routeToDisplay || !routeToDisplay.polyline || routeToDisplay.polyline.length === 0) {
      console.warn('Route has no polyline data');
      return;
    }

    // Convert ORS coordinates [lng, lat] to Leaflet [lat, lng]
    const leafletCoordinates: [number, number][] = routeToDisplay.polyline
      .map((coord: number[]) => {
        if (!Array.isArray(coord) || coord.length < 2) {
          console.warn('Invalid coordinate:', coord);
          return null;
        }
        // ORS returns [lng, lat], Leaflet needs [lat, lng]
        return [coord[1], coord[0]] as [number, number];
      })
      .filter((coord): coord is [number, number] => coord !== null);

    if (leafletCoordinates.length === 0) {
      console.warn('No valid coordinates after conversion');
      return;
    }

    // Remove existing route layer
    if (routeLayerRef.current) {
      map.current.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }

    // Create red polyline (matching ORS demo style)
    const polyline = L.polyline(leafletCoordinates, {
      color: '#ef4444', // red
      weight: 5,
      opacity: 0.9,
      lineJoin: 'round',
      lineCap: 'round',
    }).addTo(map.current);

    // Add click handler to select route
    polyline.on('click', () => {
      setSelectedRouteId(routeToDisplay.routeId);
      setModalRouteId(routeToDisplay.routeId);
    });

    // Add hover effect
    polyline.on('mouseover', () => {
      if (map.current) {
        map.current.getContainer().style.cursor = 'pointer';
      }
      polyline.setStyle({ weight: 6 });
    });

    polyline.on('mouseout', () => {
      if (map.current) {
        map.current.getContainer().style.cursor = '';
      }
      polyline.setStyle({ weight: 5 });
    });

    routeLayerRef.current = polyline;

    // Fit map bounds to include route, origin, and destination
    const bounds = L.latLngBounds(leafletCoordinates);
    
    // Add origin and destination to bounds if they exist
    if (origin) {
      const [lng, lat] = origin;
      bounds.extend([lat, lng]);
    }
    if (destination) {
      const [lng, lat] = destination;
      bounds.extend([lat, lng]);
    }

    // Fit bounds with padding
    map.current.fitBounds(bounds, { 
      padding: [50, 50],
      maxZoom: 16 // Prevent zooming in too much
    });
  }, [routes, selectedRouteId, setSelectedRouteId, origin, destination]);

  // Update origin marker
  useEffect(() => {
    if (!map.current) return;

    // Remove existing origin marker
    if (originMarkerRef.current) {
      map.current.removeLayer(originMarkerRef.current);
      originMarkerRef.current = null;
    }

    // Add origin marker if origin exists
    if (origin) {
      // Convert [lng, lat] to [lat, lng] for Leaflet
      const [lng, lat] = origin;
      const greenIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: #22c55e; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
      const marker = L.marker([lat, lng], { icon: greenIcon })
        .bindPopup('Origin')
        .addTo(map.current);

      originMarkerRef.current = marker;
    }
  }, [origin]);

  // Update destination marker
  useEffect(() => {
    if (!map.current) return;

    // Remove existing destination marker
    if (destinationMarkerRef.current) {
      map.current.removeLayer(destinationMarkerRef.current);
      destinationMarkerRef.current = null;
    }

    // Add destination marker if destination exists
    if (destination) {
      // Convert [lng, lat] to [lat, lng] for Leaflet
      const [lng, lat] = destination;
      const redIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: #ef4444; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
      const marker = L.marker([lat, lng], { icon: redIcon })
        .bindPopup('Destination')
        .addTo(map.current);

      destinationMarkerRef.current = marker;
    }
  }, [destination]);

  return (
    <>
      <div ref={mapContainer} className="w-full h-full" id="map" />
      {modalRouteId && (
        <RouteDetailsModal
          routeId={modalRouteId}
          onClose={() => setModalRouteId(null)}
        />
      )}
    </>
  );
}
