import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Icon, LatLngTuple, DivIcon } from 'leaflet';
import { useLocations } from '../context/LocationContext';
import { Location } from '../types';
import { PawPrint } from 'lucide-react';
import FilterOverlay from './FilterOverlay';

const DEFAULT_CENTER: LatLngTuple = [43.0389, -87.9065];
const DEFAULT_ZOOM = 13;

// Create icons once outside component to prevent recreation
const createIcon = (type: Location['type']) => new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const icons = {
  indoor: createIcon('indoor'),
  outdoor: createIcon('outdoor'),
  both: createIcon('both')
};

// Optimize cluster icon creation
const createClusterIcon = (cluster: any) => {
  const count = cluster.getChildCount();
  return new DivIcon({
    html: `<div class="cluster-icon">${count}</div>`,
    className: 'custom-cluster-icon',
    iconSize: [40, 40]
  });
};

const LocationFinder: React.FC = () => {
  const map = useMap();
  
  useEffect(() => {
    map.locate({ setView: true, maxZoom: 16 });
    
    const handleLocationFound = (e: any) => {
      const radius = e.accuracy / 2;
    };
    
    const handleLocationError = () => {
      console.log('Location access denied or unavailable');
    };
    
    map.on('locationfound', handleLocationFound);
    map.on('locationerror', handleLocationError);
    
    return () => {
      map.off('locationfound', handleLocationFound);
      map.off('locationerror', handleLocationError);
    };
  }, [map]);
  
  return null;
};

const PawRating: React.FC<{ rating: number }> = React.memo(({ rating }) => {
  return (
    <div className="flex items-center mt-1">
      {Array.from({ length: 4 }).map((_, index) => (
        <PawPrint 
          key={index}
          className={`w-4 h-4 ${index < rating ? 'text-amber-500' : 'text-gray-300'}`}
          fill={index < rating ? '#f59e0b' : 'none'}
        />
      ))}
    </div>
  );
});

const LocationMarker: React.FC<{
  location: Location;
  onSelect: (id: string) => void;
}> = React.memo(({ location, onSelect }) => {
  const icon = useMemo(() => icons[location.type], [location.type]);
  
  const handleClick = useCallback((e: any) => {
    e.originalEvent.stopPropagation();
    onSelect(location.id);
  }, [location.id, onSelect]);
  
  return (
    <Marker 
      position={location.coordinates}
      icon={icon}
      eventHandlers={{
        click: handleClick,
      }}
    >
      <Popup className="leaflet-popup">
        <div className="text-center p-2">
          <h3 className="font-bold text-lg mb-1">{location.name}</h3>
          <p className="text-sm capitalize mb-2">
            {location.type === 'both' 
              ? 'Indoor & Outdoor' 
              : location.type}
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
  const { filteredLocations, selectLocation } = useLocations();
  const [userLocation, setUserLocation] = useState<LatLngTuple | null>(null);

  const handleLocationSelect = useCallback((id: string) => {
    selectLocation(id);
  }, [selectLocation]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        error => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  const userMarker = useMemo(() => {
    if (!userLocation) return null;
    return (
      <Marker 
        position={userLocation}
        icon={icons.both}
      >
        <Popup>
          <div className="text-center p-2">
            <h3 className="font-bold">Your Location</h3>
          </div>
        </Popup>
      </Marker>
    );
  }, [userLocation]);

  return (
    <div className="h-full w-full relative">
      <MapContainer 
        center={userLocation || DEFAULT_CENTER} 
        zoom={DEFAULT_ZOOM} 
        className="h-full w-full"
        zoomControl={true}
        attributionControl={true}
        preferCanvas={true}
        tap={true}
        tapTolerance={15}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <LocationFinder />
        
        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={40}
          spiderfyOnMaxZoom={true}
          zoomToBoundsOnClick={true}
          showCoverageOnHover={false}
          iconCreateFunction={createClusterIcon}
          disableClusteringAtZoom={16}
        >
          {filteredLocations.map(location => (
            <LocationMarker
              key={location.id}
              location={location}
              onSelect={handleLocationSelect}
            />
          ))}
        </MarkerClusterGroup>
        
        {userMarker}
      </MapContainer>
      <FilterOverlay />
    </div>
  );
};

export default React.memo(MapView);