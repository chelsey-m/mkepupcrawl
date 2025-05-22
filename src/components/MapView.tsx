import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Icon, LatLngTuple, DivIcon } from 'leaflet';
import { useLocations } from '../context/LocationContext';
import { Location } from '../types';
import { Beer, PawPrint } from 'lucide-react';
import FilterOverlay from './FilterOverlay';

const DEFAULT_CENTER: LatLngTuple = [43.0389, -87.9065];
const DEFAULT_ZOOM = 13;

// Create custom brewery icon
const createBreweryIcon = (type: Location['type']) => {
  const color = type === 'both' ? '#f59e0b' : type === 'indoor' ? '#0891b2' : '#059669';
  const svg = `
    <svg width="32" height="42" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0C7.16344 0 0 7.16344 0 16C0 24.8366 16 42 16 42C16 42 32 24.8366 32 16C32 7.16344 24.8366 0 16 0Z" fill="${color}"/>
      <circle cx="16" cy="16" r="14" fill="white"/>
      <path d="M10 10h12v12c0 3.314-2.686 6-6 6s-6-2.686-6-6V10z" fill="${color}"/>
    </svg>
  `;
  
  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(svg)}`,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -42],
  });
};

const icons = {
  indoor: createBreweryIcon('indoor'),
  outdoor: createBreweryIcon('outdoor'),
  both: createBreweryIcon('both')
};

// Custom cluster icon with brewery theme
const createClusterIcon = (cluster: any) => {
  const count = cluster.getChildCount();
  return new DivIcon({
    html: `
      <div class="cluster-icon">
        <span>${count}</span>
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="currentColor">
          <path d="M4 2h15l-2 20H6L4 2z"/>
          <path d="M6 2h12v4H6z"/>
        </svg>
      </div>
    `,
    className: 'custom-cluster-icon',
    iconSize: [40, 40]
  });
};

// Map controller component for handling location updates
const MapController: React.FC<{ selectedLocation: Location | null }> = ({ selectedLocation }) => {
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
  isSelected: boolean;
}> = React.memo(({ location, onSelect, isSelected }) => {
  const icon = useMemo(() => icons[location.type], [location.type]);
  const markerRef = useRef(null);
  
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
  const { filteredLocations, selectLocation, selectedLocation } = useLocations();
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
        icon={new Icon({
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
        })}
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
        <MapController selectedLocation={selectedLocation} />
        
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
              isSelected={selectedLocation?.id === location.id}
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