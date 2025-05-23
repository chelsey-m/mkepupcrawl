import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
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

const createClusterIcon = (cluster: any) => {
  const count = cluster.getChildCount();
  const size = Math.min(44 + Math.floor(count / 10) * 2, 56);
  
  return new DivIcon({
    html: `
      <div class="cluster-icon" style="width: ${size}px; height: ${size}px">
        <span class="cluster-count">${count}</span>
        <img src="/brewery-icon.svg" alt="Brewery cluster" />
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
    moveend: () => onViewportChange(map.getBounds()),
    zoomend: () => onViewportChange(map.getBounds())
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

const LocationMarker: React.FC<{
  location: Location;
  onSelect: (id: string) => void;
  isSelected: boolean;
}> = ({ location, onSelect, isSelected }) => {
  return (
    <Marker
      position={location.coordinates}
      eventHandlers={{
        click: () => onSelect(location.id)
      }}
      zIndexOffset={isSelected ? 1100 : 1000}
    />
  );
};

const MapView: React.FC = () => {
  const { filteredLocations, selectLocation, selectedLocation, isLoading } = useLocations();
  const [userLocation, setUserLocation] = useState<LatLngTuple | null>(null);
  const [visibleLocations, setVisibleLocations] = useState<Location[]>([]);
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
        tap={true}
        tapTolerance={30}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <ViewportManager onViewportChange={handleViewportChange} />
        <MapController selectedLocation={selectedLocation} />
        
        {visibleLocations.length > 0 && (
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
          />
        )}
      </MapContainer>
      <FilterOverlay />
    </div>
  );
};

export default React.memo(MapView);