import React, { useState, useEffect } from 'react';
import './PlaceOwnerPage.css';
import EditPlaceModal from './EditPlaceModal';
import EditEventModal from './EditEventModal';
import ProfileModal from './ProfileModal';
import Notification from './Notification';
import { useAuth } from '../auth/AuthContext';
import { API_BASE_URL } from '../config';

interface Place {
  id: number;
  name: string;
  address: string;
  area: string;
  latitude: number | string;
  longitude: number | string;
  description?: string;
  user?: { id: number; username: string };
}

interface Activity {
  id: number;
  name: string;
}

interface Event {
  id: number;
  place: Place;
  activity: Activity;
  start_time: string;
  end_time: string;
  description: string;
}

interface PlaceOwnerPageProps {
  onMenuAction?: (action: string) => void;
}

export default function PlaceOwnerPage({ onMenuAction }: PlaceOwnerPageProps) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [showPlacesModal, setShowPlacesModal] = useState(false);
  const [showEventsModal, setShowEventsModal] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isPlaceModalOpen, setIsPlaceModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedPlaceForEvent, setSelectedPlaceForEvent] = useState<Place | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  // Hamburger menu state
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  
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

  const { user, logout } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [placesRes, activitiesRes, eventsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/places`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`${API_BASE_URL}/api/activities`),
        fetch(`${API_BASE_URL}/api/admin/events`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (placesRes.ok) {
        const placesData = await placesRes.json();
        setPlaces(placesData);
      }

      if (activitiesRes.ok) {
        const activitiesData = await activitiesRes.json();
        setActivities(activitiesData);
      }

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setEvents(eventsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showNotification('Error loading data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    setNotification({ message, type, isVisible: true });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  };

  const handleAddPlace = () => {
    setEditingPlace(null);
    setIsPlaceModalOpen(true);
  };

  const handleEditPlace = (place: Place) => {
    // Convert string coordinates to numbers if needed
    const placeWithNumbers = {
      ...place,
      latitude: typeof place.latitude === 'string' ? parseFloat(place.latitude) : place.latitude,
      longitude: typeof place.longitude === 'string' ? parseFloat(place.longitude) : place.longitude
    };
    setEditingPlace(placeWithNumbers);
    setIsPlaceModalOpen(true);
  };

  const handleClosePlaceModal = () => {
    setIsPlaceModalOpen(false);
    setEditingPlace(null);
  };

  const handleSavePlace = async (placeData: any) => {
    try {
      const url = editingPlace 
        ? `${API_BASE_URL}/api/places/${editingPlace.id}`
        : `${API_BASE_URL}/api/places`;
      
      const method = editingPlace ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(placeData)
      });

      if (response.ok) {
        showNotification(
          editingPlace ? 'Place updated successfully!' : 'Place created successfully!',
          'success'
        );
        setIsPlaceModalOpen(false);
        setEditingPlace(null);
        fetchData(); // Refresh data
      } else {
        const errorData = await response.json();
        showNotification(`Error: ${errorData.message || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      console.error('Error saving place:', error);
      showNotification('Error saving place', 'error');
    }
  };

  const handleAddEvent = (place: Place) => {
    setEditingEvent(null);
    setSelectedPlaceForEvent(place);
    setIsEventModalOpen(true);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setIsEventModalOpen(true);
  };

  const handleCloseEventModal = () => {
    setIsEventModalOpen(false);
    setEditingEvent(null);
    setSelectedPlaceForEvent(null);
  };

  const handleSaveEvent = async (eventData: any) => {
    try {
      // For multiple days, we need to create separate events for each day
      if (eventData.selectedDays && eventData.selectedDays.length > 0) {
        const promises = eventData.selectedDays.map((day: number) => {
          const eventPayload = {
            placeId: eventData.placeId,
            activityId: eventData.activityId,
            dayOfWeek: day,
            startTime: eventData.startTime,
            endTime: eventData.endTime,
            description: eventData.description
          };

          const url = editingEvent 
            ? `${API_BASE_URL}/api/events/${editingEvent.id}`
            : `${API_BASE_URL}/api/events`;
          
          const method = editingEvent ? 'PUT' : 'POST';
          
          return fetch(url, {
            method,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(eventPayload)
          });
        });

        const responses = await Promise.all(promises);
        const allSuccessful = responses.every(response => response.ok);
        
        if (allSuccessful) {
          showNotification(
            editingEvent ? 'Event updated successfully!' : 'Events created successfully!',
            'success'
          );
          setIsEventModalOpen(false);
          setEditingEvent(null);
          setSelectedPlaceForEvent(null);
          fetchData(); // Refresh data
        } else {
          showNotification('Error creating some events', 'error');
        }
        return;
      }

      // Fallback for single day (backward compatibility)
      const url = editingEvent 
        ? `${API_BASE_URL}/api/events/${editingEvent.id}`
        : `${API_BASE_URL}/api/events`;
      
      const method = editingEvent ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(eventData)
      });

      if (response.ok) {
        showNotification(
          editingEvent ? 'Event updated successfully!' : 'Event created successfully!',
          'success'
        );
        setIsEventModalOpen(false);
        setEditingEvent(null);
        setSelectedPlaceForEvent(null);
        fetchData(); // Refresh data
      } else {
        const errorData = await response.json();
        showNotification(`Error: ${errorData.message || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      console.error('Error saving event:', error);
      showNotification('Error saving event', 'error');
    }
  };

  if (loading) {
    return (
      <div className="place-owner-container">
        <div className="loading-spinner">Loading your places...</div>
      </div>
    );
  }

  const toggleHamburgerMenu = () => {
    setIsHamburgerOpen(!isHamburgerOpen);
  };

  const handleMenuClick = (action: string) => {
    setIsHamburgerOpen(false);
    if (action === 'profile') {
      setShowProfileModal(true);
    } else if (action === 'logout') {
      logout();
    }
  };

  return (
    <div className="place-owner-container">
      {/* Hamburger Menu */}
      <div className="hamburger-menu">
        <button className="hamburger-icon" onClick={toggleHamburgerMenu}>
          ☰
        </button>
        {isHamburgerOpen && (
          <div className="dropdown-menu">
            <button onClick={() => handleMenuClick('profile')}>My Profile</button>
            <button onClick={() => handleMenuClick('logout')}>Logout</button>
          </div>
        )}
      </div>

      <div className="header-section">
        <h1>Manage Your Places</h1>
        <p>Add and manage your places, then create activities and events for each location.</p>
      </div>

      <div className="places-section">
        <div className="section-header">
          <h2>Your Places</h2>
          <button onClick={handleAddPlace} className="add-place-btn">
            + Add New Place
          </button>
        </div>

        {places.length === 0 ? (
          <div className="empty-state">
            <p>You haven't added any places yet.</p>
            <button onClick={handleAddPlace} className="add-first-place-btn">
              Add Your First Place
            </button>
          </div>
        ) : (
          <div className="places-grid">
            {places.map(place => (
              <div key={place.id} className="place-card">
                <div className="place-header">
                  <h3>{place.name}</h3>
                  <div className="place-actions">
                    <button 
                      onClick={() => handleEditPlace(place)}
                      className="edit-btn"
                      title="Edit place"
                    >
                      ✏️
                    </button>
                  </div>
                </div>
                <div className="place-details">
                  <p><strong>Address:</strong> {place.address}</p>
                  <p><strong>Area:</strong> {place.area}</p>
                  {place.description && <p><strong>Description:</strong> {place.description}</p>}
                </div>
                <div className="place-events">
                  <h4>Activities & Events</h4>
                  <button 
                    onClick={() => handleAddEvent(place)}
                    className="add-event-btn"
                  >
                    + Add Event
                  </button>
                  {events.filter(event => event.place.id === place.id).map(event => (
                    <div key={event.id} className="event-item">
                      <span className="event-activity">{event.activity.name}</span>
                      <span className="event-time">
                        {new Date(event.start_time).toLocaleTimeString()} - 
                        {new Date(event.end_time).toLocaleTimeString()}
                      </span>
                      <button 
                        onClick={() => handleEditEvent(event)}
                        className="edit-event-btn"
                        title="Edit event"
                      >
                        ✏️
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <EditPlaceModal
        place={editingPlace}
        isOpen={isPlaceModalOpen}
        onClose={handleClosePlaceModal}
        onSave={handleSavePlace}
      />

      <EditEventModal
        event={editingEvent}
        isOpen={isEventModalOpen}
        onClose={handleCloseEventModal}
        onSave={handleSaveEvent}
        activities={activities}
        places={places}
        selectedPlace={selectedPlaceForEvent}
      />

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onShowNotification={showNotification}
      />

      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />
    </div>
  );
}
