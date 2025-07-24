import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default icon not showing
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface Place {
  id: number;
  name: string;
  address: string;
  area: string;
  latitude: number;
  longitude: number;
  description?: string;
}

interface MapDisplayProps {
  places: Place[];
}

const MapDisplay: React.FC<MapDisplayProps> = ({ places }) => {
  const defaultPosition: [number, number] = [28.9637, -13.5477]; // Center of Lanzarote

  return (
    <MapContainer center={defaultPosition} zoom={11} style={{ height: '600px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />
      {places.map((place) => (
        <Marker key={place.id} position={[place.latitude, place.longitude]}>
          <Popup>
            <h3>{place.name}</h3>
            <p>{place.address}</p>
            {place.description && <p>{place.description}</p>}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapDisplay;
