import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Icon, LatLngTuple, DivIcon, LatLngBounds } from 'leaflet';
import { useLocations } from '../context/LocationContext';
import { Location } from '../types';
import { Beer, PawPrint, Loader } from 'lucide-react';
import FilterOverlay from './FilterOverlay';
import debounce from 'lodash/debounce';

const DEFAULT_CENTER: LatLngTuple = [43.0389, -87.9065];
const DEFAULT_ZOOM = 13;
const MOBILE_BREAKPOINT = 768;

// Fallback icon in case SVG fails to load
const fallbackIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTcgMTFoMWEzIDMgMCAwIDEgMCA2aC0xIiBzdHJva2U9IiNmNTllMGIiIHN0cm9rZS13aWR0aD0iMiIvPjxwYXRoIGQ9Ik05IDEydjYiIHN0cm9rZT0iI2Y1OWUwYiIgc3Ryb2tlLXdpZHRoPSIyIi8+PHBhdGggZD0iTTEzIDEydjYiIHN0cm9rZT0iI2Y1OWUwYiIgc3Ryb2tlLXdpZHRoPSIyIi8+PHBhdGggZD0iTTUgOHYxMmEyIDIgMCAwIDAgMiAyaDhhMiAyIDAgMCAwIDItMlY4IiBzdHJva2U9IiNmNTllMGIiIHN0cm9rZS13aWR0aD0iMiIvPjwvc3ZnPg==',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  className: 'brewery-marker'
});

// Create icons with error handling
const createIcon = (type: string): Icon => {
  try {
    return new Icon({
      iconUrl: `/brewery-${type}.svg`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
      className: 'brewery-marker'
    });
  } catch (e) {
    console.warn(`Failed to load icon for ${type}, using fallback`);
    return fallbackIcon;
  }
};

const icons = {
  indoor: createIcon('indoor'),
  outdoor: createIcon('outdoor'),
  both: createIcon('both')
};

const createClusterIcon = (cluster: any) => {
  const count = cluster.getChildCount();
  return new DivIcon({
    html: `
      <div class="cluster-icon bg-amber-50 border-2 border-amber-500">
        <span class="text-amber-700">${count}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-amber-500">
          <path d="M17 11h1a3 3 0 0 1 0 6h-1"></path>
          <path d="M9 12v6"></path>
          <path d="M13 12v6"></path>
          <path d="M14 7.5c-1 0-1.44.5-3 .5s-2-.5-3-.5-1.72.5-2.5.5a2.5 2.5 0 0 1 0-5c.78 0 1.57.5 2.5.5S9.44 3 11 3s2 .5 3 .5 1.72-.5 2.5-.5a2.5 2.5 0 0 1 0 5c-.78 0-1.5-.5-2.5-.5Z"></path>
          <path d="M5 8v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8"></path>
        </svg>
      </div>
    `,
    className: 'custom-cluster-icon',
    iconSize: [40, 40]
  });
};

const ViewportManager: React.FC<{
  onViewportChange: (bounds: LatLngBounds) => void
}> = ({ onViewportChange }) => {
  const map = useMapEvents({
    moveend: debounce(() => {
      requestAnimationFrame(() => {
        onViewportChange(map.getBounds());
      });
    }, 150),
    zoomend: debounce(() => {
      requestAnimationFrame(() => {
        onViewportChange(map.getBounds());
      });
    }, 150)
  });
  return null;
};

const MapController: React.FC<{ 
  selectedLocation: Location | null 
}> = React.memo(({ selectedLocation }) => {
  const map = useMap();
  
  useEffect(() => {
    if (selectedLocation) {
      map.flyTo(selectedLocation.coordinates, 16, {
        duration: 1.5,
        easeLinearity: 0.25
      });
    }
  }, [map, selectedLocation]);
  
  return null;
});

const PawRating = React.memo(({ rating }: { rating: number }) => (
  <div className="flex items-center mt-1">
    {Array.from({ length: 4 }).map((_, index) => (
      <PawPrint 
        key={index}
        className={`w-4 h-4 ${index < rating ? 'text-amber-500' : 'text-gray-300'}`}
        fill={index < rating ? '#f59e0b' : 'none'}
      />
    ))}
  </div>
));

const LocationMarker = React.memo(({ 
  location, 
  onSelect, 
  isSelected 
}: {
  location: Location;
  onSelect: (id: string) => void;
  isSelected: boolean;
}) => {
  const markerRef = useRef(null);
  const icon = useMemo(() => icons[location.type] || fallbackIcon, [location.type]);
  
  const handleClick = useCallback((e: any) => {
    e.originalEvent.stopPropagation();
    onSelect(location.id);
  }, [location.id, onSelect]);

  useEffect(() => {
    if (isSelected && markerRef.current) {
      // @ts-ignore
      markerRef.current.openPopup();
    }
  }, [isSelected]);
  
  return (
    <Marker 
      ref={markerRef}
      position={location.coordinates}
      icon={icon}
      eventHandlers={{ click: handleClick }}
    >
      <Popup className="leaflet-popup">
        <div className="text-center p-2">
          <h3 className="font-bold text-lg mb-1">{location.name}</h3>
          <p className="text-sm capitalize mb-2">
            {location.type === 'both' ? 'Indoor & Outdoor' : location.type}
          </p>
          <PawRating rating={location.rating} />
          <button 
            className="mt-3 px-4 py-2 bg-amber-500 text-white text-sm rounded-full hover:bg-amber-600 transition-colors w-full"
            onClick={handleClick}
          >
            View Details
          </button>
        </div>
      </Popup>
    </Marker>
  );
});

const MapView: React.FC = () => {
  const { filteredLocations, selectLocation, selectedLocation } = useLocations();
  const [userLocation, setUserLocation] = useState<LatLngTuple | null>(null);
  const [visibleLocations, setVisibleLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);

  const handleViewportChange = useCallback((bounds: LatLngBounds) => {
    requestAnimationFrame(() => {
      const visible = filteredLocations.filter(location => 
        bounds.contains(location.coordinates)
      );
      setVisibleLocations(visible);
    });
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
          setIsLoading(false);
        },
        () => {
          setIsLoading(false);
        }
      );
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleLocationSelect = useCallback((id: string) => {
    selectLocation(id);
  }, [selectLocation]);

  const memoizedMarkerClusterGroup = useMemo(() => (
    <MarkerClusterGroup
      chunkedLoading
      maxClusterRadius={isMobile ? 60 : 40}
      spiderfyOnMaxZoom={true}
      zoomToBoundsOnClick={true}
      showCoverageOnHover={false}
      iconCreateFunction={createClusterIcon}
      disableClusteringAtZoom={15}
    >
      {visibleLocations.map(location => (
        <LocationMarker
          key={location.id}
          location={location}
          onSelect={handleLocationSelect}
          isSelected={selectedLocation?.id === location.id}
        />
      ))}
    </MarkerClusterGroup>
  ), [visibleLocations, handleLocationSelect, selectedLocation, isMobile]);

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-2">
          <Loader className="w-6 h-6 animate-spin text-amber-500" />
          <span className="text-gray-600">Loading map...</span>
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
        className="h-full w-full z-0"
        zoomControl={!isMobile}
        attributionControl={true}
        preferCanvas={true}
        tap={true}
        tapTolerance={20}
        wheelDebounceTime={150}
        wheelPxPerZoomLevel={150}
        whenReady={() => setMapLoaded(true)}
      >
        {mapLoaded && (
          <>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            <ViewportManager onViewportChange={handleViewportChange} />
            <MapController selectedLocation={selectedLocation} />
            
            {memoizedMarkerClusterGroup}
            
            {userLocation && (
              <Marker 
                position={userLocation}
                icon={new Icon({
                  iconUrl: '/user-location.svg',
                  iconSize: [24, 24],
                  iconAnchor: [12, 12],
                })}
              >
                <Popup>
                  <div className="text-center p-2">
                    <h3 className="font-bold">Your Location</h3>
                  </div>
                </Popup>
              </Marker>
            )}
          </>
        )}
      </MapContainer>
      <FilterOverlay />
    </div>
  );
};

export default React.memo(MapView);