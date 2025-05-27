import React, { useState } from 'react';
import Map, { Marker, Popup } from 'react-map-gl';
import { useLocations } from '../context/LocationContext';
import { PawPrint, ExternalLink } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGxxd2VqemkxMzBpM2pwZnM2dXZ1aDJ3In0.2RKlBLtbQZCTFN1-YK4yJw';

const MapView: React.FC = () => {
  const { filteredLocations, selectLocation, selectedLocation } = useLocations();
  const [popupInfo, setPopupInfo] = useState<string | null>(null);

  return (
    <Map
      initialViewState={{
        latitude: 43.0389,
        longitude: -87.9065,
        zoom: 12
      }}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/light-v11"
      mapboxAccessToken={MAPBOX_TOKEN}
    >
      {filteredLocations.map((location) => (
        <React.Fragment key={location.id}>
          <Marker
            latitude={location.coordinates[0]}
            longitude={location.coordinates[1]}
            onClick={e => {
              e.originalEvent.stopPropagation();
              setPopupInfo(location.id);
              selectLocation(location.id);
            }}
          >
            <div className="cursor-pointer text-2xl">🍺</div>
          </Marker>
          {popupInfo === location.id && (
            <Popup
              latitude={location.coordinates[0]}
              longitude={location.coordinates[1]}
              onClose={() => {
                setPopupInfo(null);
                selectLocation(null);
              }}
              closeButton={true}
              closeOnClick={false}
              anchor="bottom"
            >
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
          )}
        </React.Fragment>
      ))}
    </Map>
  );
};

export default MapView;