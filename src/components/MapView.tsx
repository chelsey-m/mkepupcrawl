import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Icon, LatLngTuple, DivIcon, LatLngBounds } from 'leaflet';
import { useLocations } from '../context/LocationContext';
import { Location } from '../types';
import { Beer, PawPrint, Loader } from 'lucide-react';
import debounce from 'lodash/debounce';

// Center on Milwaukee
const DEFAULT_CENTER: LatLngTuple = [43.0389, -87.9065];
const DEFAULT_ZOOM = 13;
const MOBILE_BREAKPOINT = 768;

// Create a custom icon with red border for debugging
const breweryIcon = new Icon({
  iconUrl: '/brewery-icon.svg',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  className: 'brewery-marker-debug' // This class will be styled with CSS
});

interface MarkerTooltipProps {
  location: Location;
  visible: boolean;
}

const MarkerTooltip: React.FC<MarkerTooltipProps> = ({ location, visible }) => {
  if (!visible) return null;

  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-gray-800/90 backdrop-blur-sm text-white p-2 rounded-lg shadow-lg pointer-events-none">
      <h3 className="font-medium text-sm truncate">{location.name}</h3>
      <p className="text-xs text-gray-300 mt-1">
        {location.coordinates[0].toFixed(6)}, {location.coordinates[1].toFixed(6)}
      </p>
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-gray-300 capitalize">
          {location.type === 'both' ? 'Indoor & Outdoor' : location.type}
        </span>
        <div className="flex">
          {Array.from({ length: 4 }).map((_, i) => (
            <PawPrint
              key={i}
              className={`w-3 h-3 ${
                i < location.rating ? 'text-amber-500' : 'text-gray-400'
              }`}
              fill={i < location.rating ? '#f59e0b' : 'none'}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const LocationMarker: React.FC<{
  location: Location;
  onSelect: (id: string) => void;
}> = ({ location, onSelect }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);

  useEffect(() => {
    const handleResize = debounce(() => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    }, 150);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Create LatLngTuple for marker position
  const position: LatLngTuple = location.coordinates;

  // Log marker position for debugging
  console.log(`Placing marker for ${location.name}:`, {
    coordinates: position,
    address: location.address
  });

  return (
    <div className="relative">
      <Marker
        position={position}
        icon={breweryIcon}
        eventHandlers={{
          click: () => onSelect(location.id),
          mouseover: () => !isMobile && setShowTooltip(true),
          mouseout: () => setShowTooltip(false)
        }}
      >
        <Popup>
          <div className="p-2">
            <h3 className="font-medium">{location.name}</h3>
            <p className="text-xs text-gray-600 mt-1">
              Coordinates: {position[0].toFixed(6)}, {position[1].toFixed(6)}
            </p>
            <p className="text-xs text-gray-600">
              Type: {location.type === 'both' ? 'Indoor & Outdoor' : location.type}
            </p>
          </div>
        </Popup>
      </Marker>
      <MarkerTooltip location={location} visible={showTooltip} />
    </div>
  );
};

const ViewportManager: React.FC<{
  onViewportChange: (bounds: LatLngBounds) => void
}> = ({ onViewportChange }) => {
  const map = useMapEvents({
    moveend: () => onViewportChange(map.getBounds()),
    zoomend: () => onViewportChange(map.getBounds())
  });

  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [map]);

  return null;
};

const MapController: React.FC<{ 
  selectedLocation: Location | null,
  onMapReady: () => void
}> = React.memo(({ selectedLocation, onMapReady }) => {
  const map = useMap();
  
  useEffect(() => {
    if (selectedLocation) {
      map.flyTo(selectedLocation.coordinates, 16, {
        duration: 1.5,
        easeLinearity: 0.25
      });
    }
  }, [map, selectedLocation]);

  useEffect(() => {
    map.invalidateSize();
    onMapReady();
  }, [map, onMapReady]);
  
  return null;
});

const MapView: React.FC = () => {
  const { filteredLocations, selectLocation, selectedLocation, isLoading } = useLocations();
  const [userLocation, setUserLocation] = useState<LatLngTuple | null>(null);
  const [visibleLocations, setVisibleLocations] = useState<Location[]>([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);
  const [isMapReady, setIsMapReady] = useState(false);
  const mapRef = useRef(null);

  const handleViewportChange = useCallback((bounds: LatLngBounds) => {
    if (filteredLocations.length > 0) {
      setVisibleLocations(
        filteredLocations.filter(location => bounds.contains(location.coordinates))
      );
    }
  }, [filteredLocations]);

  useEffect(() => {
    const handleResize = debounce(() => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    }, 150);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        () => {
          console.log('Geolocation not available');
        }
      );
    }
  }, []);

  const handleLocationSelect = useCallback((id: string) => {
    selectLocation(id);
  }, [selectLocation]);

  const handleMapReady = useCallback(() => {
    setIsMapReady(true);
  }, []);

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-2">
          <Loader className="w-6 h-6 animate-spin text-amber-500" />
          <span className="text-gray-600">Loading breweries...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      <MapContainer 
        ref={mapRef}
        center={userLocation || DEFAULT_CENTER} 
        zoom={DEFAULT_ZOOM} 
        className="h-full w-full"
        zoomControl={!isMobile}
        attributionControl={true}
        dragging={true}
        touchZoom={true}
        tap={true}
        doubleClickZoom={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <ViewportManager onViewportChange={handleViewportChange} />
        <MapController selectedLocation={selectedLocation} onMapReady={handleMapReady} />
        
        {isMapReady && visibleLocations.map(location => (
          <LocationMarker
            key={location.id}
            location={location}
            onSelect={handleLocationSelect}
          />
        ))}
        
        {userLocation && (
          <Marker 
            position={userLocation}
            icon={new Icon({
              iconUrl: '/user-location.svg',
              iconSize: [24, 24],
              iconAnchor: [12, 12],
            })}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default MapView;