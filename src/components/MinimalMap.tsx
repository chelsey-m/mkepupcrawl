import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';

const breweryIcon = new Icon({
  iconUrl: '/brewery-icon.svg',
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});

const MinimalMap: React.FC = () => {
  return (
    <MapContainer 
      center={[43.052335, -87.900908]} 
      zoom={18} 
      style={{ height: '100vh', width: '100vw' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker 
        position={[43.052335, -87.900908]}
        icon={breweryIcon}
      >
        <Popup>Lakefront Brewery</Popup>
      </Marker>
    </MapContainer>
  );
};

export default MinimalMap;