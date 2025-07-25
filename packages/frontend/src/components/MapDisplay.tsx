import React, { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default icon not showing
// @ts-ignore
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
  selectedPlaceId?: number | null;
}

const MapDisplay: React.FC<MapDisplayProps> = ({ places, selectedPlaceId }) => {
  // Center map on selected place or first place
  const mapRef = useRef<any>(null);
  const initialCenter: [number, number] = places.length > 0
    ? [places[0].latitude, places[0].longitude]
    : [28.9637, -13.5477]; // Center of Lanzarote

  // Center map on selected place
  useEffect(() => {
    if (selectedPlaceId && mapRef.current) {
      const place = places.find((p) => p.id === selectedPlaceId);
      if (place) {
        mapRef.current.setView([place.latitude, place.longitude], 15, { animate: true });
      }
    }
  }, [selectedPlaceId, places]);

  // Center map on first place if places change and no selectedPlaceId
  useEffect(() => {
    if (!selectedPlaceId && places.length > 0 && mapRef.current) {
      mapRef.current.setView([places[0].latitude, places[0].longitude], 13, { animate: true });
    }
  }, [places, selectedPlaceId]);

  // Memoize the selected icon
  const selectedIcon = useMemo(() => new L.Icon({
    iconUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/images/marker-icon-red.png',
    iconRetinaUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/images/marker-icon-red.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }), []);

  return (
    <MapContainer
      center={initialCenter}
      zoom={11}
      style={{ height: '400px', width: '100%' }}
      // @ts-ignore
      whenReady={(event) => {
        mapRef.current = event.target;
      }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />
      {places.map((place) => {
        const isSelected = selectedPlaceId === place.id;
        return (
          <Marker
            key={place.id}
            position={[place.latitude, place.longitude]}
            {...(isSelected ? { icon: selectedIcon } : {})}
          >
            <Popup>
              <h3>{place.name}</h3>
              <p>{place.address}</p>
              {place.description && <p>{place.description}</p>}
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default MapDisplay;
