import React from 'react';
import './EditPlaceModal.css';
import './LocationPicker.css';
import { useAuth } from '../auth/AuthContext';
import LocationPicker from './LocationPicker';

interface Place {
  id: number;
  name: string;
  address: string;
  area: string;
  latitude: number;
  longitude: number;
  description?: string;
}

interface EditPlaceModalProps {
  place?: Place | null; // Make place optional
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedPlace: Omit<Place, 'id'> & { userId?: number }) => void; // Add userId to updatedPlace type
}

const AREAS = [
  'Costa Teguise',
  'Puerto Del Carmen',
  'Puerto Calero',
  'Playa Blanca',
];

const EditPlaceModal: React.FC<EditPlaceModalProps> = ({ place, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = React.useState({
    name: '',
    address: '',
    area: '',
    latitude: 0,
    longitude: 0,
    description: ''
  });

  const { user, hasRole } = useAuth();

  React.useEffect(() => {
    if (isOpen) { // Only reset form when modal opens
      if (place) {
        setFormData({
          name: place.name,
          address: place.address,
          area: place.area,
          latitude: place.latitude,
          longitude: place.longitude,
          description: place.description || ''
        });
      } else {
        // Reset form for new place
        setFormData({
          name: '',
          address: '',
          area: '',
          latitude: 0,
          longitude: 0,
          description: ''
        });
      }
    }
  }, [isOpen, place]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedPlace: Omit<Place, 'id'> & { userId?: number } = {
      name: formData.name,
      address: formData.address,
      area: formData.area,
      latitude: formData.latitude,
      longitude: formData.longitude,
      description: formData.description
    };

    if (user && hasRole('Place Owner')) {
      updatedPlace.userId = user.id;
    }

    onSave(updatedPlace);
  };

  const handleLocationSelect = (latitude: number, longitude: number) => {
    setFormData(prev => ({
      ...prev,
      latitude,
      longitude
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{place ? 'Edit Place' : 'Add New Place'}</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="modal-place-name">Place Name:</label>
            <input
              type="text"
              id="modal-place-name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="modal-place-address">Address:</label>
            <input
              type="text"
              id="modal-place-address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="modal-place-area">Area:</label>
            <select
              id="modal-place-area"
              value={formData.area}
              onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
              required
            >
              <option value="">Select Area</option>
              {AREAS.map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Location:</label>
            <LocationPicker
              initialLatitude={formData.latitude || undefined}
              initialLongitude={formData.longitude || undefined}
              onLocationSelect={handleLocationSelect}
              height="250px"
            />
          </div>

          <div className="form-group">
            <label htmlFor="modal-place-description">Description:</label>
            <textarea
              id="modal-place-description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="save-btn">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPlaceModal; 