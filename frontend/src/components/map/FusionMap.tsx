/**
 * FusionMap — Core Leaflet Map with 3D Aerial Satellite Imagery & GPS Location Services
 *
 * Features:
 * - 3D Photorealistic Satellite Aerial Imagery (Esri World Imagery + Reference Places)
 * - Default center on Mumbai, India (19.0760, 72.8777)
 * - 3D Tilt mode toggle (Defaults to 3D Tilt OFF as requested)
 * - Expanded vertical map viewport (490px)
 * - Live Browser Location Services (GPS) with one-click enable and accuracy ring
 * - Custom animated artisan and customer location markers
 * - Simulated worker dispatch route polyline
 * - Graceful fallback so map is NEVER empty
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
  Polyline,
  Circle,
  Popup,
} from 'react-leaflet';
import L from 'leaflet';
import { Layers, Navigation, Loader2, Compass, Check, AlertCircle } from 'lucide-react';
import type { GeoPosition } from '@/types/location';

// Fix Leaflet default icon issue with Vite/webpack
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Default coordinate: Mumbai, Maharashtra, India (Bandra / BKC Urban Area)
export const DEFAULT_FALLBACK_POSITION: GeoPosition = { lat: 19.0657, lng: 72.8687 };

// Custom Artisan / Worker Pin (Petrol Teal)
const workerMarkerIcon = new L.Icon({
  iconUrl:
    'data:image/svg+xml;base64,' +
    btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="38" height="48" viewBox="0 0 38 48">
      <defs>
        <radialGradient id="wg" cx="50%" cy="30%">
          <stop offset="0%" stop-color="#2a8076"/>
          <stop offset="100%" stop-color="#14524C"/>
        </radialGradient>
        <filter id="glow">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#14524C" flood-opacity="0.4"/>
        </filter>
      </defs>
      <ellipse cx="19" cy="44" rx="7" ry="3.5" fill="rgba(0,0,0,0.3)"/>
      <path d="M19 0 C9 0 2 7 2 16 C2 28 19 44 19 44 C19 44 36 28 36 16 C36 7 29 0 19 0Z" fill="url(#wg)" stroke="#FFFFFF" stroke-width="2" filter="url(#glow)"/>
      <circle cx="19" cy="16" r="7" fill="#FFFFFF"/>
      <path d="M16 16 L18 19 L23 13" stroke="#14524C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </svg>
  `),
  iconSize: [38, 48],
  iconAnchor: [19, 48],
  popupAnchor: [0, -48],
  shadowUrl: markerShadow,
  shadowSize: [41, 41],
  shadowAnchor: [13, 41],
});

// Customer Location Pin (Ochre / Gold)
const customerMarkerIcon = new L.Icon({
  iconUrl:
    'data:image/svg+xml;base64,' +
    btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="38" height="48" viewBox="0 0 38 48">
      <defs>
        <radialGradient id="cg" cx="50%" cy="30%">
          <stop offset="0%" stop-color="#f59e0b"/>
          <stop offset="100%" stop-color="#D68C31"/>
        </radialGradient>
        <filter id="cglow">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#D68C31" flood-opacity="0.5"/>
        </filter>
      </defs>
      <ellipse cx="19" cy="44" rx="7" ry="3.5" fill="rgba(0,0,0,0.3)"/>
      <path d="M19 0 C9 0 2 7 2 16 C2 28 19 44 19 44 C19 44 36 28 36 16 C36 7 29 0 19 0Z" fill="url(#cg)" stroke="#FFFFFF" stroke-width="2" filter="url(#cglow)"/>
      <circle cx="19" cy="16" r="6" fill="#FFFFFF"/>
      <circle cx="19" cy="16" r="3.5" fill="#D68C31"/>
    </svg>
  `),
  iconSize: [38, 48],
  iconAnchor: [19, 48],
  popupAnchor: [0, -48],
  shadowUrl: markerShadow,
  shadowSize: [41, 41],
  shadowAnchor: [13, 41],
});

interface RecenterProps {
  position: GeoPosition;
  zoom?: number;
}

// Fly to position when updated
const RecenterMap: React.FC<RecenterProps> = ({ position, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (position && position.lat && position.lng) {
      map.flyTo([position.lat, position.lng], zoom || map.getZoom(), {
        duration: 1.2,
        easeLinearity: 0.25,
      });
    }
  }, [position.lat, position.lng, zoom, map]);
  return null;
};

interface DraggableMarkerProps {
  position: GeoPosition;
  onDragEnd: (pos: GeoPosition) => void;
  markerType?: 'fusion' | 'customer' | 'worker';
  draggable?: boolean;
  label?: string;
}

const DraggableMarker: React.FC<DraggableMarkerProps> = ({
  position,
  onDragEnd,
  markerType = 'customer',
  draggable = false,
  label,
}) => {
  const markerRef = useRef<L.Marker>(null);

  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker) {
        const latlng = marker.getLatLng();
        onDragEnd({ lat: latlng.lat, lng: latlng.lng });
      }
    },
  };

  const icon = markerType === 'worker' ? workerMarkerIcon : customerMarkerIcon;

  return (
    <Marker
      draggable={draggable}
      eventHandlers={draggable ? eventHandlers : {}}
      position={[position.lat, position.lng]}
      icon={icon}
      ref={markerRef}
    >
      {label && (
        <Popup className="font-sans font-bold text-xs" closeButton={false}>
          <div className="p-1 text-[#1B2420]">
            <p className="font-bold">{label}</p>
          </div>
        </Popup>
      )}
    </Marker>
  );
};

interface MapClickHandlerProps {
  onClick?: (pos: GeoPosition) => void;
}

const MapClickHandler: React.FC<MapClickHandlerProps> = ({ onClick }) => {
  useMapEvents({
    click(e) {
      if (onClick) {
        onClick({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    },
  });
  return null;
};

// ─── Public API ───────────────────────────────────────────────────────────────

export interface FusionMapProps {
  /** Current customer/destination marker position */
  position: GeoPosition;
  /** Optional worker location for live dispatch route */
  workerPosition?: GeoPosition;
  /** Called when marker is dragged to a new position */
  onMarkerDragEnd?: (pos: GeoPosition) => void;
  /** Called when user clicks on the map */
  onMapClick?: (pos: GeoPosition) => void;
  /** Called when user enables browser GPS location */
  onLocationFound?: (pos: GeoPosition) => void;
  /** Zoom level (default 16 for high detail 3D satellite) */
  zoom?: number;
  /** Map container height (default 490px) */
  height?: string | number;
  /** Show the primary marker */
  showMarker?: boolean;
  /** Whether primary marker is draggable */
  draggable?: boolean;
  /** Marker color variant */
  markerType?: 'fusion' | 'customer' | 'worker';
  /** Default map layer: '3d-satellite' (default) or 'street' */
  defaultLayer?: '3d-satellite' | 'street';
  /** Allow layer toggling */
  showLayerToggle?: boolean;
  /** Allow user GPS button directly on map */
  showGpsButton?: boolean;
  /** Additional CSS classes for the container */
  className?: string;
}

export const FusionMap: React.FC<FusionMapProps> = ({
  position: rawPosition,
  workerPosition,
  onMarkerDragEnd,
  onMapClick,
  onLocationFound,
  zoom = 16,
  height = 490,
  showMarker = true,
  draggable = false,
  markerType = 'customer',
  defaultLayer = '3d-satellite',
  showLayerToggle = true,
  showGpsButton = true,
  className = '',
}) => {
  // Graceful fallback coordinate centered on Mumbai, India
  const safePosition: GeoPosition =
    rawPosition && !isNaN(rawPosition.lat) && !isNaN(rawPosition.lng)
      ? rawPosition
      : DEFAULT_FALLBACK_POSITION;

  const [currentPos, setCurrentPos] = useState<GeoPosition>(safePosition);
  const [mapLayer, setMapLayer] = useState<'3d-satellite' | 'street'>(defaultLayer);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsActive, setGpsActive] = useState(false);
  const [gpsError, setGpsError] = useState('');
  // 3D Tilt is OFF by default as explicitly requested by user
  const [is3dPerspective, setIs3dPerspective] = useState(false);

  // Sync position prop
  useEffect(() => {
    if (rawPosition && !isNaN(rawPosition.lat) && !isNaN(rawPosition.lng)) {
      setCurrentPos(rawPosition);
    }
  }, [rawPosition?.lat, rawPosition?.lng]);

  // Handle GPS location request
  const handleEnableLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setGpsLoading(true);
    setGpsError('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newCoords: GeoPosition = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setCurrentPos(newCoords);
        setGpsActive(true);
        setGpsLoading(false);
        onLocationFound?.(newCoords);
      },
      (err) => {
        setGpsLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGpsError('Location permission denied. Please allow location in browser settings.');
        } else {
          setGpsError('Could not retrieve GPS location.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [onLocationFound]);

  // Compute simulated worker dispatch point nearby in Mumbai
  const activeWorkerPos: GeoPosition = workerPosition || {
    lat: currentPos.lat + 0.0038,
    lng: currentPos.lng - 0.0048,
  };

  const heightStyle = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-[#D8D3C7] bg-[#1B2420] select-none ${className}`}
      style={{ height: heightStyle, minHeight: '350px' }}
    >
      {/* Top Controls Overlay */}
      <div className="absolute top-3 left-3 right-3 z-[500] flex items-center justify-between pointer-events-none">
        {/* Left: 3D Satellite / Perspective Toggle */}
        <div className="pointer-events-auto flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1B2420]/85 backdrop-blur-md border border-white/20 text-white text-xs font-bold shadow-lg">
            <span className="w-2 h-2 rounded-full bg-[#4A6741] animate-pulse" />
            <span>{mapLayer === '3d-satellite' ? '3D Aerial Satellite' : 'Street Vector'}</span>
          </div>

          <button
            type="button"
            onClick={() => setIs3dPerspective((v) => !v)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold backdrop-blur-md transition-all ${
              is3dPerspective
                ? 'bg-[#14524C] text-[#FFFFFF] border-[#FFFFFF]/30 shadow-md'
                : 'bg-[#1B2420]/80 text-white/80 border-white/20 hover:bg-[#1B2420]'
            }`}
          >
            {is3dPerspective ? '3D Tilt ON' : '3D Tilt OFF'}
          </button>
        </div>

        {/* Right: GPS Location + Layer Switcher */}
        <div className="pointer-events-auto flex items-center gap-2">
          {showGpsButton && (
            <button
              type="button"
              onClick={handleEnableLocation}
              disabled={gpsLoading}
              title="Enable Live GPS Location"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-bold backdrop-blur-md transition-all shadow-md ${
                gpsActive
                  ? 'bg-[#4A6741] text-[#FFFFFF] border-[#4A6741]'
                  : gpsLoading
                  ? 'bg-[#14524C] text-[#FFFFFF] border-[#14524C] cursor-wait'
                  : 'bg-[#FFFFFF] text-[#14524C] border-[#D8D3C7] hover:bg-[#EEF1EE]'
              }`}
            >
              {gpsLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : gpsActive ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Navigation className="w-3.5 h-3.5" />
              )}
              <span>{gpsActive ? 'GPS Live Connected' : 'Enable My Location'}</span>
            </button>
          )}

          {showLayerToggle && (
            <button
              type="button"
              onClick={() =>
                setMapLayer((l) => (l === '3d-satellite' ? 'street' : '3d-satellite'))
              }
              title="Toggle Map Layers"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFFFFF] border border-[#D8D3C7] text-[#1B2420] text-xs font-bold hover:bg-[#EEF1EE] transition-all shadow-md"
            >
              <Layers className="w-3.5 h-3.5 text-[#14524C]" />
              <span>{mapLayer === '3d-satellite' ? 'Street View' : '3D Satellite'}</span>
            </button>
          )}
        </div>
      </div>

      {/* GPS Error Notification */}
      {gpsError && (
        <div className="absolute top-14 left-3 right-3 z-[500] p-2.5 rounded-xl bg-[#9C4A34]/90 text-white text-xs font-medium backdrop-blur-md flex items-center gap-2 border border-white/20">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{gpsError}</span>
        </div>
      )}

      {/* Map Canvas with 3D Perspective Tilt (controlled by toggle) */}
      <div
        className="w-full h-full transition-transform duration-500"
        style={
          is3dPerspective && mapLayer === '3d-satellite'
            ? { transform: 'perspective(900px) rotateX(15deg) scale(1.05)', transformOrigin: 'center bottom' }
            : {}
        }
      >
        <MapContainer
          center={[currentPos.lat, currentPos.lng]}
          zoom={zoom}
          style={{ height: '100%', width: '100%', background: '#1B2420' }}
          zoomControl={false}
          scrollWheelZoom={true}
          attributionControl={true}
        >
          {/* 3D Photorealistic Satellite Tiles or Street Map */}
          {mapLayer === '3d-satellite' ? (
            <>
              {/* Esri High-Resolution World Imagery (3D Aerial Photorealistic) */}
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution='Tiles &copy; Esri &mdash; DigitalGlobe, GeoEye, Earthstar Geographics'
                maxZoom={19}
              />
              {/* Overlay Roads, Boundaries, and City Reference Labels */}
              <TileLayer
                url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                maxZoom={19}
                opacity={0.85}
              />
            </>
          ) : (
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
              attribution='Tiles &copy; <a href="https://www.esri.com/">Esri</a>'
              maxZoom={19}
            />
          )}

          {/* Auto-recenter when coordinates update */}
          <RecenterMap position={currentPos} zoom={zoom} />

          {/* Map click listener */}
          {onMapClick && <MapClickHandler onClick={onMapClick} />}

          {/* Live GPS Accuracy Halo Circle */}
          {gpsActive && (
            <Circle
              center={[currentPos.lat, currentPos.lng]}
              radius={80}
              pathOptions={{
                color: '#4A6741',
                fillColor: '#4A6741',
                fillOpacity: 0.18,
                weight: 1.5,
              }}
            />
          )}

          {/* Simulated Artisan Dispatch Transit Polyline Route in Mumbai */}
          <Polyline
            positions={[
              [activeWorkerPos.lat, activeWorkerPos.lng],
              [
                (activeWorkerPos.lat + currentPos.lat) / 2 + 0.0008,
                (activeWorkerPos.lng + currentPos.lng) / 2 - 0.0012,
              ],
              [currentPos.lat, currentPos.lng],
            ]}
            pathOptions={{
              color: '#14524C',
              weight: 4.5,
              dashArray: '8, 8',
              opacity: 0.95,
            }}
          />

          {/* Worker / Specialist Marker */}
          <Marker
            position={[activeWorkerPos.lat, activeWorkerPos.lng]}
            icon={workerMarkerIcon}
          >
            <Popup className="font-sans font-bold text-xs" closeButton={false}>
              <div className="p-1 text-[#1B2420]">
                <p className="font-bold text-[#14524C]">⚡ Specialist En Route (Mumbai)</p>
                <p className="text-[10px] text-[#3A423E]">Dispatching with verified trade toolkit</p>
              </div>
            </Popup>
          </Marker>

          {/* Destination / Customer Marker */}
          {showMarker && (
            <DraggableMarker
              position={currentPos}
              onDragEnd={(pos) => {
                setCurrentPos(pos);
                onMarkerDragEnd?.(pos);
              }}
              markerType={markerType}
              draggable={draggable}
              label="🎯 Service Destination Address (Mumbai)"
            />
          )}
        </MapContainer>
      </div>

      {/* Bottom Dispatch Info Overlay */}
      <div className="absolute bottom-3 left-3 z-[500] pointer-events-none">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1B2420]/85 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold shadow-lg pointer-events-auto">
          <Compass className="w-3.5 h-3.5 text-[#D68C31] animate-spin" style={{ animationDuration: '8s' }} />
          <span>Mumbai Metropolitan Satellite Feed Active</span>
        </div>
      </div>
    </div>
  );
};

export default FusionMap;
