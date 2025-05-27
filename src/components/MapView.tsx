import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon, LatLngTuple } from 'leaflet';

// Center on Milwaukee
const DEFAULT_CENTER: LatLngTuple = [43.0389, -87.9065];
const DEFAULT_ZOOM = 13;

const breweryIcon = new Icon({
  iconUrl: '/brewery-icon.svg',
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

// Debug data
const debugBrewery = {
  name: "Lakefront Brewery",
  coordinates: [43.052402, -87.900836] as LatLngTuple
};

const MapView: React.FC = () => {
  return (
    <div className="h-full w-full relative">
      <MapContainer 
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM} 
        className="h-full w-full"
        zoomControl={true}
        attributionControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <Marker
          position={debugBrewery.coordinates}
          icon={breweryIcon}
        >
          <Popup>
            <div className="text-center">
              <h3 className="font-medium">{debugBrewery.name}</h3>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapView;