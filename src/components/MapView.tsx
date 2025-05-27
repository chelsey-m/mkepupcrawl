import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { GoogleMap, useLoadScript, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { useLocations } from '../context/LocationContext';
import { Location } from '../types';
import { PawPrint, Loader, ExternalLink } from 'lucide-react';

// Center on Milwaukee
const DEFAULT_CENTER = { lat: 43.0389, lng: -87.9065 };
const DEFAULT_ZOOM = 13;

const mapStyles = {
  width: '100%',
  height: '100%'
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  styles: [
    {
      featureType: 'poi.business',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    }
  ]
};

interface MarkerTooltipProps {
  location: Location;
}

const MarkerTooltip: React.FC<MarkerTooltipProps> = ({ location }) => {
  return (
    <div className="min-w-[200px] max-w-[300px]">
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
  );
};

const MapView: React.FC = () => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: 'YOUR_API_KEY_HERE'
  });

  const { filteredLocations, selectLocation, selectedLocation, isLoading } = useLocations();
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);

  const handleMarkerClick = useCallback((locationId: string) => {
    setSelectedMarkerId(locationId);
    selectLocation(locationId);
  }, [selectLocation]);

  const handleInfoWindowClose = useCallback(() => {
    setSelectedMarkerId(null);
    selectLocation(null);
  }, [selectLocation]);

  const mapCenter = useMemo(() => DEFAULT_CENTER, []);

  if (!isLoaded || isLoading) {
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
      <GoogleMap
        mapContainerStyle={mapStyles}
        center={mapCenter}
        zoom={DEFAULT_ZOOM}
        options={mapOptions}
      >
        {filteredLocations.map((location) => (
          <React.Fragment key={location.id}>
            <MarkerF
              position={{ lat: location.coordinates[0], lng: location.coordinates[1] }}
              onClick={() => handleMarkerClick(location.id)}
              icon={{
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('🍺'),
                scaledSize: new google.maps.Size(32, 32)
              }}
            />
            {selectedMarkerId === location.id && (
              <InfoWindowF
                position={{ lat: location.coordinates[0], lng: location.coordinates[1] }}
                onCloseClick={handleInfoWindowClose}
              >
                <MarkerTooltip location={location} />
              </InfoWindowF>
            )}
          </React.Fragment>
        ))}
      </GoogleMap>
    </div>
  );
};

export default MapView;