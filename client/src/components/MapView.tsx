import { useEffect, useRef, useState } from 'react';
import maplibregl from "maplibre-gl";
import 'maplibre-gl/dist/maplibre-gl.css';

import { useStore } from '../store/useStore';
import RouteDetailsModal from './RouteDetailsModal';



export default function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const routesLayerRef = useRef<Record<string, { id: string }>>({});
  const vehicleMarkerRef = useRef<maplibregl.Marker | null>(null);
  const clickHandlerRef = useRef<((e: maplibregl.MapMouseEvent) => void) | null>(null);
  const mouseEnterHandlersRef = useRef<Record<string, () => void>>({});
  const mouseLeaveHandlersRef = useRef<Record<string, () => void>>({});
  
  const [modalRouteId, setModalRouteId] = useState<string | null>(null);

  const { routes, selectedRouteId, origin, destination, vehiclePosition, setSelectedRouteId } = useStore();

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors'
          }
        },
        layers: [
          {
            id: 'osm-tiles-layer',
            type: 'raster',
            source: 'osm-tiles',
            minzoom: 0,
            maxzoom: 22
          }
        ]
      },
      center: [-74.006, 40.7128],
      zoom: 12,
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update routes on map
  useEffect(() => {
    if (!map.current) return;

    const mapInstance = map.current;

    // Remove existing click handler if it exists
    if (clickHandlerRef.current) {
      mapInstance.off('click', clickHandlerRef.current);
      clickHandlerRef.current = null;
    }

    // Remove existing route layers and their event handlers
    Object.values(routesLayerRef.current).forEach((layer) => {
      const routeId = layer.id;
      // Remove event handlers
      if (mouseEnterHandlersRef.current[routeId]) {
        mapInstance.off('mouseenter', routeId, mouseEnterHandlersRef.current[routeId]);
      }
      if (mouseLeaveHandlersRef.current[routeId]) {
        mapInstance.off('mouseleave', routeId, mouseLeaveHandlersRef.current[routeId]);
      }
      // Remove layer and source
      if (mapInstance.getLayer(routeId)) {
        mapInstance.removeLayer(routeId);
      }
      if (mapInstance.getSource(routeId)) {
        mapInstance.removeSource(routeId);
      }
    });
    routesLayerRef.current = {};
    mouseEnterHandlersRef.current = {};
    mouseLeaveHandlersRef.current = {};

    // Add new routes
    routes.forEach((route) => {
      const routeId = route.routeId;
      const isSelected = routeId === selectedRouteId;

      // Determine color based on safety score
      let color = '#ef4444'; // red
      if (route.final_safety_score >= 70) {
        color = '#22c55e'; // green
      } else if (route.final_safety_score >= 50) {
        color = '#eab308'; // yellow
      }

      const lineWidth = isSelected ? 5 : 3;

      // Convert polyline to GeoJSON
      const geojson = {
        type: 'Feature' as const,
        properties: {},
        geometry: {
          type: 'LineString' as const,
          coordinates: route.polyline,
        },
      };

      if (mapInstance.getSource(routeId)) {
        const source = mapInstance.getSource(routeId);
        if (source && source.type === 'geojson') {
          (source as maplibregl.GeoJSONSource).setData(geojson);
        }
      } else {
        mapInstance.addSource(routeId, {
          type: 'geojson',
          data: geojson,
        });

        mapInstance.addLayer({
          id: routeId,
          type: 'line',
          source: routeId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': color,
            'line-width': lineWidth,
            'line-opacity': isSelected ? 1 : 0.7,
          },
        });
      }

      routesLayerRef.current[routeId] = {
        id: routeId,
        type: 'line',
      } as { id: string; type: string };
    });

    // Add single click handler that filters by layer
    const clickHandler = (e: maplibregl.MapMouseEvent) => {
      const features = mapInstance.queryRenderedFeatures([e.point.x, e.point.y], {
        layers: Object.keys(routesLayerRef.current),
      });
      if (features && features.length > 0) {
        const feature = features[0];
        if (feature.layer && feature.layer.id && routesLayerRef.current[feature.layer.id]) {
          const routeId = feature.layer.id;
        setSelectedRouteId(routeId);
        setModalRouteId(routeId);
        }
      }
    };
    clickHandlerRef.current = clickHandler;
    mapInstance.on('click', clickHandler);

    // Add mouseenter/mouseleave handlers for each route layer
    routes.forEach((route) => {
      const routeId = route.routeId;
      const mouseEnterHandler = () => {
        mapInstance.getCanvas().style.cursor = 'pointer';
      };
      const mouseLeaveHandler = () => {
        mapInstance.getCanvas().style.cursor = '';
      };
      
      mouseEnterHandlersRef.current[routeId] = mouseEnterHandler;
      mouseLeaveHandlersRef.current[routeId] = mouseLeaveHandler;
      
      mapInstance.on('mouseenter', routeId, mouseEnterHandler);
      mapInstance.on('mouseleave', routeId, mouseLeaveHandler);
    });

    // Update selected route styling
    routes.forEach((route) => {
      const routeId = route.routeId;
      const isSelected = routeId === selectedRouteId;
      if (mapInstance.getLayer(routeId)) {
        mapInstance.setPaintProperty(routeId, 'line-width', isSelected ? 5 : 3);
        mapInstance.setPaintProperty(routeId, 'line-opacity', isSelected ? 1 : 0.7);
      }
    });

    // Fit bounds to show all routes
    if (routes.length > 0) {
      const coordinates = routes.flatMap((r) => r.polyline);
      if (coordinates.length > 0) {
        const lngs = coordinates.map(c => (c as [number, number])[0]);
        const lats = coordinates.map(c => (c as [number, number])[1]);
        const bounds = [
          [Math.min(...lngs), Math.min(...lats)],
          [Math.max(...lngs), Math.max(...lats)]
        ] as [[number, number], [number, number]];
        mapInstance.fitBounds(bounds, { padding: 50 });
      }
    }
  }, [routes, selectedRouteId, setSelectedRouteId]);


  // Update origin/destination markers
  useEffect(() => {
    if (!map.current) return;

    // Remove existing markers
    const markers = document.querySelectorAll('.maplibregl-marker');
    markers.forEach((m) => m.remove());

    // Add origin marker
    if (origin) {
      new maplibregl.Marker({ color: '#22c55e' })
        .setLngLat(origin)
        .setPopup(new maplibregl.Popup().setText('Origin'))
        .addTo(map.current);
    }

    // Add destination marker
    if (destination) {
      new maplibregl.Marker({ color: '#ef4444' })
        .setLngLat(destination)
        .setPopup(new maplibregl.Popup().setText('Destination'))
        .addTo(map.current);
    }
  }, [origin, destination]);

  // Update vehicle position marker
  useEffect(() => {
    if (!map.current || !vehiclePosition) return;

    if (vehicleMarkerRef.current) {
      vehicleMarkerRef.current.setLngLat([vehiclePosition.lng, vehiclePosition.lat]);
    } else {
      vehicleMarkerRef.current = new maplibregl.Marker({ color: '#3b82f6' })
        .setLngLat([vehiclePosition.lng, vehiclePosition.lat])
        .addTo(map.current);
    }
  }, [vehiclePosition]);

  return (
    <>
      <div ref={mapContainer} className="w-full h-full" />
      {modalRouteId && (
        <RouteDetailsModal
          routeId={modalRouteId}
          onClose={() => setModalRouteId(null)}
        />
      )}
    </>
  );
}
