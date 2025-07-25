import { useState, useEffect } from 'react';
import './AdminPage.css';
import EditPlaceModal from './EditPlaceModal';
import EditEventModal from './EditEventModal';
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

interface AdminPageProps {
  onMenuAction?: (action: string) => void;
}

export default function AdminPage({ onMenuAction }: AdminPageProps) {
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
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  // Hamburger menu state
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);

  const { user, hasRole, logout } = useAuth();

  useEffect(() => {
    fetchPlaces();
    fetchActivities();
    fetchEvents();
    fetchStatus();
  }, []);

  const fetchPlaces = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Authorization': `Bearer ${token}`,
      };
      const response = await fetch('http://localhost:3000/api/admin/places', { headers });
      const data = await response.json();
      setPlaces(data);
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
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Authorization': `Bearer ${token}`,
      };
      const response = await fetch('http://localhost:3000/api/admin/events', { headers });
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
  const handleAddPlace = () => {
    setEditingPlace(null);
    setIsPlaceModalOpen(true);
  };
  const handleClosePlaceModal = () => {
    setIsPlaceModalOpen(false);
    setEditingPlace(null);
  };
  const handleSavePlace = async (updatedPlace: Omit<Place, 'id'> & { userId?: number }) => {
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      let response;
      if (editingPlace) {
        // Update existing place
        response = await fetch(`http://localhost:3000/api/places/${editingPlace.id}`, {
          method: 'PUT',
          headers: headers,
          body: JSON.stringify(updatedPlace),
        });
      } else {
        // Add new place
        response = await fetch('http://localhost:3000/api/places', {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(updatedPlace),
        });
      }

      if (response.ok) {
        handleClosePlaceModal();
        fetchPlaces();
        alert(`Place ${editingPlace ? 'updated' : 'added'} successfully!`);
      } else {
        alert(`Error ${editingPlace ? 'updating' : 'adding'} place`);
      }
    } catch (error) {
      console.error(`Error ${editingPlace ? 'updating' : 'adding'} place:`, error);
      alert(`Error ${editingPlace ? 'updating' : 'adding'} place`);
    }
  };

  // Event modal handlers
  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setIsEventModalOpen(true);
  };
  const handleAddEvent = () => {
    setEditingEvent(null);
    setIsEventModalOpen(true);
  };
  const handleCloseEventModal = () => {
    setIsEventModalOpen(false);
    setEditingEvent(null);
  };
  const handleSaveEvent = async (updatedEvent: Omit<Event, 'id' | 'place' | 'activity'> & { placeId: number; activityId: number }) => {
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      let response;
      if (editingEvent) {
        // Update existing event
        response = await fetch(`http://localhost:3000/api/events/${editingEvent.id}`, {
          method: 'PUT',
          headers: headers,
          body: JSON.stringify(updatedEvent),
        });
      } else {
        // Add new event
        response = await fetch('http://localhost:3000/api/events', {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(updatedEvent),
        });
      }

      if (response.ok) {
        handleCloseEventModal();
        fetchEvents();
        alert(`Event ${editingEvent ? 'updated' : 'added'} successfully!`);
      } else {
        alert(`Error ${editingEvent ? 'updating' : 'adding'} event`);
      }
    } catch (error) {
      console.error(`Error ${editingEvent ? 'updating' : 'adding'} event:`, error);
      alert(`Error ${editingEvent ? 'updating' : 'adding'} event`);
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

  // Hamburger menu handlers
  const toggleHamburgerMenu = () => {
    setIsHamburgerOpen(!isHamburgerOpen);
  };

  const handleMenuClick = (action: string) => {
    setIsHamburgerOpen(false);
    if (onMenuAction) {
      onMenuAction(action);
    }
  };

  return (
    <div className="admin-container">
      {/* Hamburger Menu */}
      <div className="hamburger-menu">
        <button className="hamburger-btn" onClick={toggleHamburgerMenu}>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
        
        {isHamburgerOpen && (
          <div className="hamburger-dropdown">
            <button className="menu-item" onClick={() => handleMenuClick('search')}>
              Search
            </button>
            <button className="menu-item" onClick={() => handleMenuClick('admin')}>
              Admin
            </button>
            <button className="menu-item" onClick={() => handleMenuClick('user-admin')}>
              User Admin
            </button>
            <button className="menu-item" onClick={logout}>
              Logout ({user?.username})
            </button>
          </div>
        )}
      </div>

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
        {hasRole('Admin') && <button className="bar-btn" onClick={openActivitiesModal}>Manage Activities</button>}
        <button className="bar-btn" onClick={openPlacesModal}>Manage Places</button>
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
            <div className="modal-footer">
              <button className="add-new-btn" onClick={handleAddPlace}>Add New Place</button>
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
                  <button className="edit-btn" onClick={() => handleEditEvent(event)} title="Edit">✏️</button>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="add-new-btn" onClick={handleAddEvent}>Add New Event</button>
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

      {/* Edit Event Modal */}
      <EditEventModal
        event={editingEvent}
        isOpen={isEventModalOpen}
        onClose={handleCloseEventModal}
        onSave={handleSaveEvent}
      />

      {/* Activities and Events modals to be implemented similarly */}
    </div>
  );
} 