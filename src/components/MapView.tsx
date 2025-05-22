import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, LatLngTuple } from 'leaflet';
import { useLocations } from '../context/LocationContext';
import { Location } from '../types';
import { PawPrint } from 'lucide-react';

// Default map center (Milwaukee downtown)
const DEFAULT_CENTER: LatLngTuple = [43.0389, -87.9065];
const DEFAULT_ZOOM = 13;

// Custom icons for indoor and outdoor locations
const indoorIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const outdoorIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const bothIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to locate user and update map view
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

// Get the correct icon based on location type
const getLocationIcon = (type: Location['type']) => {
  switch (type) {
    case 'indoor':
      return indoorIcon;
    case 'outdoor':
      return outdoorIcon;
    case 'both':
      return bothIcon;
    default:
      return indoorIcon;
  }
};

// Render paw rating
const PawRating: React.FC<{ rating: number }> = ({ rating }) => {
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
};

const MapView: React.FC = () => {
  const { filteredLocations, selectLocation } = useLocations();
  const [userLocation, setUserLocation] = useState<LatLngTuple | null>(null);

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

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer 
        center={userLocation || DEFAULT_CENTER} 
        zoom={DEFAULT_ZOOM} 
        className="h-full w-full"
        zoomControl={true}
        attributionControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <LocationFinder />
        
        {filteredLocations.map(location => (
          <Marker 
            key={location.id}
            position={location.coordinates}
            icon={getLocationIcon(location.type)}
            eventHandlers={{
              click: () => {
                selectLocation(location.id);
              },
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
                  onClick={() => selectLocation(location.id)}
                >
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {userLocation && (
          <Marker 
            position={userLocation}
            icon={new Icon({
              iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
              iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
              shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41]
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
    </div>
  );
};

export default MapView;