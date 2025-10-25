import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default icon not showing
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface LocationPickerProps {
  initialLatitude?: number;
  initialLongitude?: number;
  onLocationSelect: (latitude: number, longitude: number) => void;
  height?: string;
}

// Component to handle map click events
const MapClickHandler: React.FC<{
  onLocationSelect: (latitude: number, longitude: number) => void;
}> = ({ onLocationSelect }) => {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
    },
  });
  return null;
};

const LocationPicker: React.FC<LocationPickerProps> = ({
  initialLatitude,
  initialLongitude,
  onLocationSelect,
  height = '300px'
}) => {
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(
    initialLatitude && initialLongitude 
      ? [initialLatitude, initialLongitude] 
      : null
  );

  // Default center for Lanzarote
  const defaultCenter: [number, number] = [28.9637, -13.5477];
  const center = selectedPosition || defaultCenter;

  const handleLocationSelect = (latitude: number, longitude: number) => {
    setSelectedPosition([latitude, longitude]);
    onLocationSelect(latitude, longitude);
  };

  // Update selected position when initial coordinates change
  useEffect(() => {
    if (initialLatitude && initialLongitude) {
      setSelectedPosition([initialLatitude, initialLongitude]);
    }
  }, [initialLatitude, initialLongitude]);

  return (
    <div className="location-picker">
      <div className="location-picker-instructions">
        <p>Click on the map to select a location for your place.</p>
        {selectedPosition && (
          <p className="selected-coordinates">
            Selected: {selectedPosition[0].toFixed(6)}, {selectedPosition[1].toFixed(6)}
          </p>
        )}
      </div>
      <MapContainer
        center={center}
        zoom={13}
        style={{ height, width: '100%' }}
        className="location-picker-map"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapClickHandler onLocationSelect={handleLocationSelect} />
        {selectedPosition && (
          <Marker position={selectedPosition} />
        )}
      </MapContainer>
    </div>
  );
};

export default LocationPicker;
