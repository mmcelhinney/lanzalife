import { useState, useEffect } from 'react';
import './AdminPage.css';
import EditPlaceModal from './EditPlaceModal';
import EditEventModal from './EditEventModal';
import UserAdminModal from './UserAdminModal';
import UserSearch from './UserSearch';
import UserDetailsModal from './UserDetailsModal';
import ReportsPage from './ReportsPage';
import Notification from './Notification';
import { useAuth } from '../auth/AuthContext';
import { API_BASE_URL } from '../config';

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

interface UserData {
  id?: number;
  firstName: string;
  lastName: string;
  username: string;
  role: string;
  telephone: string;
  password?: string;
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
  const [showUserAdminModal, setShowUserAdminModal] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [isEditUser, setIsEditUser] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [viewingUser, setViewingUser] = useState<UserData | null>(null);
  
  // Notification state
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    isVisible: boolean;
  }>({
    message: '',
    type: 'info',
    isVisible: false
  });

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
      const response = await fetch(`${API_BASE_URL}/api/admin/places`, { headers });
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
      const response = await fetch(`${API_BASE_URL}/api/activities`, { headers });
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
      const response = await fetch(`${API_BASE_URL}/api/admin/events`, { headers });
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
      const response = await fetch(`${API_BASE_URL}/api/status`, { headers });
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
        response = await fetch(`${API_BASE_URL}/api/places/${editingPlace.id}`, {
          method: 'PUT',
          headers: headers,
          body: JSON.stringify(updatedPlace),
        });
      } else {
        // Add new place
        response = await fetch(`${API_BASE_URL}/api/places`, {
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
  const handleSaveEvent = async (updatedEvent: {
    placeId: number;
    activityId: number;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    description: string;
  }) => {
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
        response = await fetch(`${API_BASE_URL}/api/events/${editingEvent.id}`, {
          method: 'PUT',
          headers: headers,
          body: JSON.stringify(updatedEvent),
        });
      } else {
        // Add new event
        response = await fetch(`${API_BASE_URL}/api/events`, {
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
    if (action === 'user-admin') {
      setShowUserSearch(true);
    } else if (action === 'reports') {
      setShowReports(true);
    } else if (onMenuAction) {
      onMenuAction(action);
    }
  };

  const handleCreateUser = async (userData: UserData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          username: userData.username,
          password: userData.password || 'TempPassword123!',
          roleName: userData.role,
          firstName: userData.firstName,
          lastName: userData.lastName,
          telephone: userData.telephone,
          email: userData.email
        })
      });

      if (response.ok) {
        showNotification('User created successfully!', 'success');
        setShowUserAdminModal(false);
        setShowUserSearch(true); // Return to user search
      } else {
        const errorData = await response.json();
        showNotification(`Error creating user: ${errorData.message || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      showNotification('Error creating user. Please try again.', 'error');
    }
  };

  const handleEditUser = (user: UserData) => {
    setEditingUser(user);
    setIsEditUser(true);
    setShowUserAdminModal(true);
    setShowUserSearch(false); // Close the user search overlay
  };

  const handleUpdateUser = async (userData: UserData) => {
    try {
      const updateData: any = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        username: userData.username,
        roleName: userData.role,
        telephone: userData.telephone,
        email: userData.email
      };

      // Only include password if it's provided
      if (userData.password && userData.password.trim()) {
        updateData.password = userData.password;
      }

      const response = await fetch(`${API_BASE_URL}/api/users/${userData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        showNotification('User updated successfully!', 'success');
        setShowUserAdminModal(false);
        setEditingUser(null);
        setIsEditUser(false);
        setShowUserSearch(true); // Return to user search
      } else {
        const errorData = await response.json();
        showNotification(`Error updating user: ${errorData.message || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      showNotification('Error updating user. Please try again.', 'error');
    }
  };

  const handleSaveUser = (userData: UserData) => {
    if (isEditUser) {
      handleUpdateUser(userData);
    } else {
      handleCreateUser(userData);
    }
  };

  const handleCreateNewUser = () => {
    setEditingUser(null);
    setIsEditUser(false);
    setShowUserAdminModal(true);
    setShowUserSearch(false); // Close the user search overlay
  };

  const handleViewUser = (user: UserData) => {
    setViewingUser(user);
    setShowUserDetails(true);
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    setNotification({
      message,
      type,
      isVisible: true
    });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }));
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
            <button className="menu-item" onClick={() => handleMenuClick('reports')}>
              Reports
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

      <UserAdminModal
        isOpen={showUserAdminModal}
        onClose={() => {
          setShowUserAdminModal(false);
          setEditingUser(null);
          setIsEditUser(false);
          // If we were editing, return to user search
          if (isEditUser) {
            setShowUserSearch(true);
          }
        }}
        onSave={handleSaveUser}
        user={editingUser}
        isEdit={isEditUser}
      />

      {showUserSearch && (
        <div className="user-search-overlay">
          <div className="user-search-wrapper">
            <div className="user-search-header">
              <h2>User Management</h2>
              <div className="user-search-actions">
                <button onClick={handleCreateNewUser} className="create-user-btn">
                  + Create New User
                </button>
                <button onClick={() => setShowUserSearch(false)} className="close-search-btn">
                  ×
                </button>
              </div>
            </div>
            <UserSearch
              onEditUser={handleEditUser}
              onRefresh={() => {}}
              onViewUser={handleViewUser}
              onShowNotification={showNotification}
            />
          </div>
        </div>
      )}

      <UserDetailsModal
        isOpen={showUserDetails}
        onClose={() => {
          setShowUserDetails(false);
          setViewingUser(null);
        }}
        user={viewingUser}
      />

      {showReports && (
        <ReportsPage />
      )}

      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />

      {/* Activities and Events modals to be implemented similarly */}
    </div>
  );
} 