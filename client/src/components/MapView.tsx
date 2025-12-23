import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useStore } from '../store/useStore';
import RouteDetailsModal from './RouteDetailsModal';

export default function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const routeLayersRef = useRef<Map<string, L.Polyline>>(new Map());
  const originMarkerRef = useRef<L.Marker | null>(null);
  const destinationMarkerRef = useRef<L.Marker | null>(null);
  const [modalRouteId, setModalRouteId] = useState<string | null>(null);
  
  // Helper function to get route color based on safety score
  const getRouteColor = (score: number): string => {
    if (score >= 75) return '#22c55e'; // Green
    if (score >= 50) return '#eab308'; // Yellow
    return '#ef4444'; // Red
  };

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

  // Update route polylines - render all routes with color coding
  useEffect(() => {
    if (!map.current) return;

    // Remove all existing route layers
    routeLayersRef.current.forEach((layer) => {
      map.current?.removeLayer(layer);
    });
    routeLayersRef.current.clear();

    // Remove existing route if no routes
    if (routes.length === 0) {
      return;
    }

    // Collect all bounds for fitting
    const allBounds = L.latLngBounds([]);

    // Render all routes with color coding based on safety score
    routes.forEach((route) => {
      if (!route.polyline || route.polyline.length === 0) {
        console.warn(`Route ${route.routeId} has no polyline data`);
        return;
      }

      // Convert ORS coordinates [lng, lat] to Leaflet [lat, lng]
      const leafletCoordinates: [number, number][] = route.polyline
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
        console.warn(`Route ${route.routeId} has no valid coordinates`);
        return;
      }

      // Get color based on safety score
      const routeColor = getRouteColor(route.final_safety_score);
      const isSelected = route.routeId === selectedRouteId;

      // Create polyline with color based on safety score
      const polyline = L.polyline(leafletCoordinates, {
        color: routeColor,
        weight: isSelected ? 6 : 4, // Thicker line for selected route
        opacity: isSelected ? 1.0 : 0.7, // More opaque for selected route
        lineJoin: 'round',
        lineCap: 'round',
      }).addTo(map.current);

      // Add click handler to select route
      polyline.on('click', () => {
        setSelectedRouteId(route.routeId);
        setModalRouteId(route.routeId);
      });

      // Add hover effect
      polyline.on('mouseover', () => {
        if (map.current) {
          map.current.getContainer().style.cursor = 'pointer';
        }
        polyline.setStyle({ weight: (isSelected ? 6 : 4) + 1 });
      });

      polyline.on('mouseout', () => {
        if (map.current) {
          map.current.getContainer().style.cursor = '';
        }
        polyline.setStyle({ weight: isSelected ? 6 : 4 });
      });

      // Store reference
      routeLayersRef.current.set(route.routeId, polyline);

      // Add to bounds
      leafletCoordinates.forEach(coord => allBounds.extend(coord));
    });

    // Add origin and destination to bounds if they exist
    if (origin) {
      const [lng, lat] = origin;
      allBounds.extend([lat, lng]);
    }
    if (destination) {
      const [lng, lat] = destination;
      allBounds.extend([lat, lng]);
    }

    // Fit bounds with padding (only if we have routes)
    if (routes.length > 0 && allBounds.isValid()) {
      map.current.fitBounds(allBounds, { 
        padding: [50, 50],
        maxZoom: 16 // Prevent zooming in too much
      });
    }
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
      <div ref={mapContainer} className="w-full h-full rounded-2xl overflow-hidden shadow-lg" id="map" />
      {modalRouteId && (
        <RouteDetailsModal
          routeId={modalRouteId}
          onClose={() => setModalRouteId(null)}
        />
      )}
    </>
  );
}
