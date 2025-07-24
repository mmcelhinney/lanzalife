import React from 'react';
import './EditPlaceModal.css';

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
  place: Place | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedPlace: Omit<Place, 'id'>) => void;
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
    latitude: '',
    longitude: '',
    description: ''
  });

  React.useEffect(() => {
    if (place) {
      setFormData({
        name: place.name,
        address: place.address,
        area: place.area,
        latitude: place.latitude.toString(),
        longitude: place.longitude.toString(),
        description: place.description || ''
      });
    }
  }, [place]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: formData.name,
      address: formData.address,
      area: formData.area,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      description: formData.description
    });
  };

  if (!isOpen || !place) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Place</h2>
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

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="modal-place-latitude">Latitude:</label>
              <input
                type="number"
                id="modal-place-latitude"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="modal-place-longitude">Longitude:</label>
              <input
                type="number"
                id="modal-place-longitude"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                required
              />
            </div>
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