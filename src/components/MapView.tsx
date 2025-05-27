import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon, LatLngTuple } from 'leaflet';
import { useLocations } from '../context/LocationContext';
import { PawPrint, ExternalLink } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const breweryIcon = new Icon({
  iconUrl: '/brewery-icon.svg',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const MapView: React.FC = () => {
  const { filteredLocations, selectLocation } = useLocations();
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.invalidateSize();
    }
  }, []);

  return (
    <MapContainer
      center={[43.0389, -87.9065]}
      zoom={12}
      style={{ width: '100%', height: '100%' }}
      ref={mapRef}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {filteredLocations.map((location) => {
        const position: LatLngTuple = [location.coordinates[0], location.coordinates[1]];
        return (
          <Marker
            key={location.id}
            position={position}
            icon={breweryIcon}
            eventHandlers={{
              click: () => selectLocation(location.id)
            }}
          >
            <Popup>
              <div className="min-w-[200px] max-w-[300px] p-2">
                <h3 className="font-medium text-gray-900 mb-1">{location.name}</h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-600 capitalize">
                    {location.type === 'both' ? 'Indoor & Outdoor' : location.type}
                  </span>
                  <div className="flex">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <PawPrint
                        key={i}
                        className={`w-3 h-3 ${
                          i < location.rating ? 'text-amber-500' : 'text-gray-300'
                        }`}
                        fill={i < location.rating ? '#f59e0b' : 'none'}
                      />
                    ))}
                  </div>
                </div>
                {location.notes && (
                  <p className="text-sm text-gray-700 mb-2">{location.notes}</p>
                )}
                {location.yelpLink && (
                  <a
                    href={location.yelpLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>View on Yelp</span>
                  </a>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default MapView;