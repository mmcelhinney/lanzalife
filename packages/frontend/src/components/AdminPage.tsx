import { useState, useEffect } from 'react';
import './AdminPage.css';
import EditPlaceModal from './EditPlaceModal';
import { useAuth } from '../auth/AuthContext';

// Placeholder for Activity and Event modals (to be implemented)
// import EditActivityModal from './EditActivityModal';
// import EditEventModal from './EditEventModal';

interface Activity {
  id: number;
  name: string;
}

interface Place {
  id: number;
  name: string;
  address: string;
  area: string;
  latitude: number;
  longitude: number;
  description?: string;
  userId?: number; // Add userId to Place interface
}

interface Event {
  id: number;
  place: Place;
  activity: Activity;
  start_time: string;
  end_time: string;
  description: string;
}

export default function AdminPage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [dbStatus, setDbStatus] = useState({ places: 0, activities: 0, events: 0 });

  // Modal state
  const [showPlacesModal, setShowPlacesModal] = useState(false);
  const [showActivitiesModal, setShowActivitiesModal] = useState(false);
  const [showEventsModal, setShowEventsModal] = useState(false);

  // Editing state for modals
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [isPlaceModalOpen, setIsPlaceModalOpen] = useState(false);

  const { user, hasRole } = useAuth();

  useEffect(() => {
    fetchPlaces();
    fetchActivities();
    fetchEvents();
    fetchStatus();
  }, []);

  const fetchPlaces = async () => {
    try {
      const headers: HeadersInit = {};
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch('http://localhost:3000/api/places', { headers });
      const data = await response.json();
      if (hasRole('Place Owner') && user) {
        setPlaces(data.filter((place: Place) => place.userId === user.id));
      } else {
        setPlaces(data);
      }
    } catch (error) {
      console.error('Error fetching places:', error);
    }
  };

  const fetchActivities = async () => {
    try {
      const headers: HeadersInit = {};
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch('http://localhost:3000/api/activities', { headers });
      const data = await response.json();
      setActivities(data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const headers: HeadersInit = {};
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch('http://localhost:3000/api/events', { headers });
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchStatus = async () => {
    try {
      const headers: HeadersInit = {};
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch('http://localhost:3000/api/status', { headers });
      const data = await response.json();
      setDbStatus(data);
    } catch (error) {
      console.error('Error fetching status:', error);
    }
  };

  // Place modal handlers
  const handleEditPlace = (place: Place) => {
    setEditingPlace(place);
    setIsPlaceModalOpen(true);
  };
  const handleClosePlaceModal = () => {
    setIsPlaceModalOpen(false);
    setEditingPlace(null);
  };
  const handleSavePlace = async (updatedPlace: Omit<Place, 'id'>) => {
    if (!editingPlace) return;
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(`http://localhost:3000/api/places/${editingPlace.id}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(updatedPlace),
      });
      if (response.ok) {
        handleClosePlaceModal();
        fetchPlaces();
        alert('Place updated successfully!');
      } else {
        alert('Error updating place');
      }
    } catch (error) {
      console.error('Error updating place:', error);
      alert('Error updating place');
    }
  };

  // Modal openers
  const openPlacesModal = () => {
    setShowPlacesModal(true);
    setShowActivitiesModal(false);
    setShowEventsModal(false);
  };
  const openActivitiesModal = () => {
    setShowPlacesModal(false);
    setShowActivitiesModal(true);
    setShowEventsModal(false);
  };
  const openEventsModal = () => {
    setShowPlacesModal(false);
    setShowActivitiesModal(false);
    setShowEventsModal(true);
  };

  // Modal closers (for future modals)
  const closePlacesModal = () => setShowPlacesModal(false);
  const closeActivitiesModal = () => setShowActivitiesModal(false);
  const closeEventsModal = () => setShowEventsModal(false);

  // Debug: Log places data before rendering
  console.log('PLACES DATA:', places);

  return (
    <div className="admin-container">
      <h1>Admin Panel</h1>
      <div className="status-bar">
        <div className="status-item">
          <span className="status-label">Places:</span>
          <span className="status-value">{dbStatus.places}</span>
        </div>
        <div className="status-item">
          <span className="status-label">Activities:</span>
          <span className="status-value">{dbStatus.activities}</span>
        </div>
        <div className="status-item">
          <span className="status-label">Events:</span>
          <span className="status-value">{dbStatus.events}</span>
        </div>
      </div>
      <div className="admin-bar-buttons">
        <button className="bar-btn" onClick={openPlacesModal}>Manage Places</button>
        <button className="bar-btn" onClick={openActivitiesModal}>Manage Activities</button>
        <button className="bar-btn" onClick={openEventsModal}>Manage Schedules</button>
      </div>

      {/* Places Drawer */}
      {showPlacesModal && (
        <div className="drawer-overlay" onClick={closePlacesModal}>
          <div className="drawer-left" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Places</h2>
              <button className="modal-close" onClick={closePlacesModal}>×</button>
            </div>
            <div className="modal-list">
              {places.map(place => (
                <div className="modal-list-item" key={place.id}>
                  {place.name}
                  <button className="edit-btn" onClick={() => handleEditPlace(place)} title="Edit">✏️</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Activities Drawer */}
      {showActivitiesModal && (
        <div className="drawer-overlay" onClick={closeActivitiesModal}>
          <div className="drawer-left" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Activities</h2>
              <button className="modal-close" onClick={closeActivitiesModal}>×</button>
            </div>
            <div className="modal-list">
              {activities.map(activity => (
                <div className="modal-list-item" key={activity.id}>
                  {activity.name}
                  <button className="edit-btn" /* onClick={...} */ title="Edit">✏️</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Schedules Drawer */}
      {showEventsModal && (
        <div className="drawer-overlay" onClick={closeEventsModal}>
          <div className="drawer-left" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Schedules</h2>
              <button className="modal-close" onClick={closeEventsModal}>×</button>
            </div>
            <div className="modal-list">
              {events.map(event => (
                <div className="modal-list-item" key={event.id}>
                  {event.activity?.name} @ {event.place?.name}
                  <button className="edit-btn" /* onClick={...} */ title="Edit">✏️</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit Place Modal */}
      <EditPlaceModal
        place={editingPlace}
        isOpen={isPlaceModalOpen}
        onClose={handleClosePlaceModal}
        onSave={handleSavePlace}
      />

      {/* Activities and Events modals to be implemented similarly */}
    </div>
  );
} 