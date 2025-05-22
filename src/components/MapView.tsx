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

// Memoized brewery icons
const icons = {
  indoor: new Icon({
    iconUrl: '/brewery-indoor.svg',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
    className: 'brewery-marker'
  }),
  outdoor: new Icon({
    iconUrl: '/brewery-outdoor.svg',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
    className: 'brewery-marker'
  }),
  both: new Icon({
    iconUrl: '/brewery-both.svg',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
    className: 'brewery-marker'
  })
};

// Optimized cluster icon creation
const createClusterIcon = (cluster: any) => {
  const count = cluster.getChildCount();
  return new DivIcon({
    html: `
      <div class="cluster-icon">
        <span>${count}</span>
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="currentColor">
          <path d="M4 2h15l-2 20H6L4 2z"/>
        </svg>
      </div>
    `,
    className: 'custom-cluster-icon',
    iconSize: [40, 40]
  });
};

// Viewport manager for lazy loading
const ViewportManager: React.FC<{
  onViewportChange: (bounds: LatLngBounds) => void
}> = ({ onViewportChange }) => {
  const map = useMapEvents({
    moveend: debounce(() => {
      onViewportChange(map.getBounds());
    }, 100),
    zoomend: debounce(() => {
      onViewportChange(map.getBounds());
    }, 100)
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
  const icon = icons[location.type];
  
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
  const [visibleLocations, setVisibleLocations] = useState(filteredLocations);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);

  const handleViewportChange = useCallback((bounds: LatLngBounds) => {
    const visible = filteredLocations.filter(location => 
      bounds.contains(location.coordinates)
    );
    setVisibleLocations(visible);
  }, [filteredLocations]);

  useEffect(() => {
    const handleResize = debounce(() => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    }, 100);

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
        center={userLocation || DEFAULT_CENTER} 
        zoom={DEFAULT_ZOOM} 
        className="h-full w-full"
        zoomControl={!isMobile}
        attributionControl={true}
        preferCanvas={true}
        tap={true}
        tapTolerance={20}
        wheelDebounceTime={100}
        wheelPxPerZoomLevel={150}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <ViewportManager onViewportChange={handleViewportChange} />
        <MapController selectedLocation={selectedLocation} />
        
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
        
        {userLocation && (
          <Marker 
            position={userLocation}
            icon={new Icon({
              iconUrl: '/user-location.svg',
              iconSize: [30, 30],
              iconAnchor: [15, 15],
            })}
          >
            <Popup>
              <div className="text-center p-2">
                <h3 className="font-bold">Your Location</h3>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
      <FilterOverlay />
    </div>
  );
};

export default React.memo(MapView);