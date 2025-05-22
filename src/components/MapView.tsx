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

const createBreweryIcon = (): DivIcon => {
  return new DivIcon({
    html: `
      <div class="brewery-marker-container">
        <div class="brewery-marker-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white">
            <path d="M17 11h1a3 3 0 0 1 0 6h-1"></path>
            <path d="M9 12v6"></path>
            <path d="M13 12v6"></path>
            <path d="M14 7.5c-1 0-1.44.5-3 .5s-2-.5-3-.5-1.72.5-2.5.5a2.5 2.5 0 0 1 0-5c.78 0 1.57.5 2.5.5S9.44 3 11 3s2 .5 3 .5 1.72-.5 2.5-.5a2.5 2.5 0 0 1 0 5c-.78 0-1.5-.5-2.5-.5Z"></path>
            <path d="M5 8v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8"></path>
          </svg>
        </div>
      </div>
    `,
    className: 'custom-brewery-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

const createClusterIcon = (cluster: any) => {
  const count = cluster.getChildCount();
  const size = Math.min(40 + Math.floor(count / 10) * 5, 60);
  
  return new DivIcon({
    html: `
      <div class="cluster-icon" style="width: ${size}px; height: ${size}px">
        <span class="cluster-count">${count}</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white">
          <path d="M17 11h1a3 3 0 0 1 0 6h-1"></path>
          <path d="M9 12v6"></path>
          <path d="M13 12v6"></path>
          <path d="M14 7.5c-1 0-1.44.5-3 .5s-2-.5-3-.5-1.72.5-2.5.5a2.5 2.5 0 0 1 0-5c.78 0 1.57.5 2.5.5S9.44 3 11 3s2 .5 3 .5 1.72-.5 2.5-.5a2.5 2.5 0 0 1 0 5c-.78 0-1.5-.5-2.5-.5Z"></path>
          <path d="M5 8v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8"></path>
        </svg>
      </div>
    `,
    className: 'custom-cluster-icon',
    iconSize: [size, size],
    iconAnchor: [size/2, size/2]
  });
};

const ViewportManager: React.FC<{
  onViewportChange: (bounds: LatLngBounds) => void
}> = ({ onViewportChange }) => {
  const map = useMapEvents({
    moveend: () => {
      requestAnimationFrame(() => {
        onViewportChange(map.getBounds());
      });
    },
    zoomend: () => {
      requestAnimationFrame(() => {
        onViewportChange(map.getBounds());
      });
    }
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
  const icon = useMemo(() => createBreweryIcon(), []);
  
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
          setIsLoading(false);
        },
        () => {
          setIsLoading(false);
        },
        { timeout: 5000 }
      );
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleLocationSelect = useCallback((id: string) => {
    selectLocation(id);
  }, [selectLocation]);

  if (isLoading || filteredLocations.length === 0) {
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
        preferCanvas={true}
        whenReady={() => setMapLoaded(true)}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <ViewportManager onViewportChange={handleViewportChange} />
        <MapController selectedLocation={selectedLocation} />
        
        {mapLoaded && visibleLocations.length > 0 && (
          <MarkerClusterGroup
            chunkedLoading
            maxClusterRadius={50}
            spiderfyOnMaxZoom={true}
            zoomToBoundsOnClick={true}
            showCoverageOnHover={false}
            iconCreateFunction={createClusterIcon}
            disableClusteringAtZoom={16}
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
        )}
        
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
      </MapContainer>
      <FilterOverlay />
    </div>
  );
};

export default React.memo(MapView);