import { useState, useEffect } from 'react';
import './AdminPage.css';
import EditPlaceModal from './EditPlaceModal';

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
}

interface Event {
  id: number;
  place: Place;
  activity: Activity;
  start_time: string;
  end_time: string;
  description: string;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const AREAS = [
  'Costa Teguise',
  'Puerto Del Carmen',
  'Puerto Calero',
  'Playa Blanca',
];

function AdminPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  
  // Form states
  const [placeForm, setPlaceForm] = useState({
    name: '',
    address: '',
    area: '',
    latitude: '',
    longitude: '',
    description: ''
  });
  
  const [activityForm, setActivityForm] = useState({
    name: ''
  });
  
  const [eventForm, setEventForm] = useState({
    placeId: '',
    activityId: '',
    selectedDays: [] as number[],
    startTime: '08:00',
    endTime: '10:00',
    description: ''
  });

  // Edit states
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [dbStatus, setDbStatus] = useState({ places: 0, activities: 0, events: 0 });
  const [isPlaceModalOpen, setIsPlaceModalOpen] = useState(false);

  useEffect(() => {
    fetchActivities();
    fetchPlaces();
    fetchEvents();
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/status');
      const data = await response.json();
      setDbStatus(data);
    } catch (error) {
      console.error('Error fetching status:', error);
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/activities');
      const data = await response.json();
      setActivities(data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const fetchPlaces = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/places');
      const data = await response.json();
      setPlaces(data);
    } catch (error) {
      console.error('Error fetching places:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/events');
      const data = await response.json();
      console.log('Fetched events:', data);
      console.log('Events count:', data.length);
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handlePlaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingPlace 
        ? `http://localhost:3000/api/places/${editingPlace.id}`
        : 'http://localhost:3000/api/places';
      
      const response = await fetch(url, {
        method: editingPlace ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...placeForm,
          latitude: parseFloat(placeForm.latitude),
          longitude: parseFloat(placeForm.longitude),
        }),
      });

      if (response.ok) {
        handleCancelEdit();
        fetchPlaces();
        alert(editingPlace ? 'Place updated successfully!' : 'Place added successfully!');
      } else {
        alert(editingPlace ? 'Error updating place' : 'Error adding place');
      }
    } catch (error) {
      console.error(editingPlace ? 'Error updating place:' : 'Error adding place:', error);
      alert(editingPlace ? 'Error updating place' : 'Error adding place');
    }
  };

  const handleActivitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingActivity 
        ? `http://localhost:3000/api/activities/${editingActivity.id}`
        : 'http://localhost:3000/api/activities';
      
      const response = await fetch(url, {
        method: editingActivity ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(activityForm),
      });

      if (response.ok) {
        handleCancelEdit();
        fetchActivities();
        alert(editingActivity ? 'Activity updated successfully!' : 'Activity added successfully!');
      } else {
        alert(editingActivity ? 'Error updating activity' : 'Error adding activity');
      }
    } catch (error) {
      console.error(editingActivity ? 'Error updating activity:' : 'Error adding activity:', error);
      alert(editingActivity ? 'Error updating activity' : 'Error adding activity');
    }
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (eventForm.selectedDays.length === 0) {
      alert('Please select at least one day');
      return;
    }

    try {
      // Create events for each selected day
      const promises = eventForm.selectedDays.map(async (day) => {
        const response = await fetch('http://localhost:3000/api/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            placeId: parseInt(eventForm.placeId),
            activityId: parseInt(eventForm.activityId),
            dayOfWeek: day,
            startTime: eventForm.startTime,
            endTime: eventForm.endTime,
            description: eventForm.description,
          }),
        });
        return response;
      });

      const responses = await Promise.all(promises);
      const allSuccessful = responses.every(response => response.ok);

      if (allSuccessful) {
        setEventForm({
          placeId: '',
          activityId: '',
          selectedDays: [],
          startTime: '08:00',
          endTime: '10:00',
          description: ''
        });
        fetchEvents();
        alert('Events added successfully!');
      } else {
        alert('Error adding some events');
      }
    } catch (error) {
      console.error('Error adding events:', error);
      alert('Error adding events');
    }
  };

  const handleDayToggle = (dayValue: number) => {
    setEventForm(prev => ({
      ...prev,
      selectedDays: prev.selectedDays.includes(dayValue)
        ? prev.selectedDays.filter(d => d !== dayValue)
        : [...prev.selectedDays, dayValue]
    }));
  };

  // Edit handlers
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
      const response = await fetch(`http://localhost:3000/api/places/${editingPlace.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
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

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setActivityForm({
      name: activity.name
    });
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    const eventDate = new Date(event.start_time);
    setEventForm({
      placeId: event.place.id.toString(),
      activityId: event.activity.id.toString(),
      selectedDays: [eventDate.getDay()],
      startTime: new Date(event.start_time).toTimeString().slice(0, 5),
      endTime: new Date(event.end_time).toTimeString().slice(0, 5),
      description: event.description || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingPlace(null);
    setEditingActivity(null);
    setEditingEvent(null);
    setPlaceForm({
      name: '',
      address: '',
      area: '',
      latitude: '',
      longitude: '',
      description: ''
    });
    setActivityForm({
      name: ''
    });
    setEventForm({
      placeId: '',
      activityId: '',
      selectedDays: [],
      startTime: '08:00',
      endTime: '10:00',
      description: ''
    });
  };

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
      
      <div className="admin-sections">
        {/* Add Place Section */}
        <div className="admin-section">
          <h2>Add New Place</h2>
          <form onSubmit={handlePlaceSubmit} className="admin-form">
            <div className="form-group">
              <label htmlFor="place-name">Place Name:</label>
              <input
                type="text"
                id="place-name"
                value={placeForm.name}
                onChange={(e) => setPlaceForm(prev => ({ ...prev, name: e.target.value }))}
                required
              />
              {editingPlace && <small style={{color: 'green'}}>Editing: {editingPlace.name}</small>}
            </div>

            <div className="form-group">
              <label htmlFor="place-address">Address:</label>
              <input
                type="text"
                id="place-address"
                value={placeForm.address}
                onChange={(e) => setPlaceForm(prev => ({ ...prev, address: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="place-area">Area:</label>
              <select
                id="place-area"
                value={placeForm.area}
                onChange={(e) => setPlaceForm(prev => ({ ...prev, area: e.target.value }))}
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
                <label htmlFor="place-latitude">Latitude:</label>
                <input
                  type="number"
                  id="place-latitude"
                  step="any"
                  value={placeForm.latitude}
                  onChange={(e) => setPlaceForm(prev => ({ ...prev, latitude: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="place-longitude">Longitude:</label>
                <input
                  type="number"
                  id="place-longitude"
                  step="any"
                  value={placeForm.longitude}
                  onChange={(e) => setPlaceForm(prev => ({ ...prev, longitude: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="place-description">Description:</label>
              <textarea
                id="place-description"
                value={placeForm.description}
                onChange={(e) => setPlaceForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="form-buttons">
              <button type="submit" className="submit-btn">
                {editingPlace ? 'Update Place' : 'Add Place'}
              </button>
              {editingPlace && (
                <button type="button" onClick={handleCancelEdit} className="cancel-btn">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Add Activity Section */}
        <div className="admin-section">
          <h2>Add New Activity</h2>
          <form onSubmit={handleActivitySubmit} className="admin-form">
            <div className="form-group">
              <label htmlFor="activity-name">Activity Name:</label>
              <input
                type="text"
                id="activity-name"
                value={activityForm.name}
                onChange={(e) => setActivityForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Live Music, Quiz Night, Bingo"
                required
              />
            </div>

            <div className="form-buttons">
              <button type="submit" className="submit-btn">
                {editingActivity ? 'Update Activity' : 'Add Activity'}
              </button>
              {editingActivity && (
                <button type="button" onClick={handleCancelEdit} className="cancel-btn">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="admin-sections">
        {/* Add Event Section */}
        <div className="admin-section">
          <h2>Add Activity to Place</h2>
          <form onSubmit={handleEventSubmit} className="admin-form">
            <div className="form-group">
              <label htmlFor="event-place">Place:</label>
              <select
                id="event-place"
                value={eventForm.placeId}
                onChange={(e) => setEventForm(prev => ({ ...prev, placeId: e.target.value }))}
                required
              >
                <option value="">Select Place</option>
                {places.map(place => (
                  <option key={place.id} value={place.id}>{place.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="event-activity">Activity:</label>
              <select
                id="event-activity"
                value={eventForm.activityId}
                onChange={(e) => setEventForm(prev => ({ ...prev, activityId: e.target.value }))}
                required
              >
                <option value="">Select Activity</option>
                {activities.map(activity => (
                  <option key={activity.id} value={activity.id}>{activity.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Days of Week:</label>
              <div className="days-grid">
                {DAYS_OF_WEEK.map(day => (
                  <label key={day.value} className="day-checkbox">
                    <input
                      type="checkbox"
                      checked={eventForm.selectedDays.includes(day.value)}
                      onChange={() => handleDayToggle(day.value)}
                    />
                    {day.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="event-start-time">Start Time:</label>
                <input
                  type="time"
                  id="event-start-time"
                  value={eventForm.startTime}
                  onChange={(e) => setEventForm(prev => ({ ...prev, startTime: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="event-end-time">End Time:</label>
                <input
                  type="time"
                  id="event-end-time"
                  value={eventForm.endTime}
                  onChange={(e) => setEventForm(prev => ({ ...prev, endTime: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="event-description">Description:</label>
              <textarea
                id="event-description"
                value={eventForm.description}
                onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <button type="submit" className="submit-btn">Add Activity</button>
          </form>
        </div>
      </div>

      {/* Events Table Section */}
      <div className="admin-section">
        <h2>Events Schedule ({events.length} events)</h2>
        <div className="table-container">
          <table className="events-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Place</th>
                <th>Day</th>
                <th>Time</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map(event => {
                console.log('Rendering event:', event);
                const eventDate = new Date(event.start_time);
                const dayName = DAYS_OF_WEEK[eventDate.getDay()].label;
                const startTime = new Date(event.start_time).toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true 
                });
                const endTime = new Date(event.end_time).toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true 
                });
                
                return (
                  <tr key={event.id}>
                    <td>{event.activity?.name || 'N/A'}</td>
                    <td>{event.place?.name || 'N/A'}</td>
                    <td>{dayName}</td>
                    <td>{startTime} - {endTime}</td>
                    <td>{event.description || '-'}</td>
                    <td>
                      <button 
                        onClick={() => handleEditEvent(event)}
                        className="edit-btn"
                        title="Edit event"
                      >
                        ✏️
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {events.length === 0 && (
            <div className="no-events">
              <p>No events scheduled yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Data Display Section */}
      <div className="admin-section">
        <h2>Current Data</h2>
        <div className="data-display">
          <div className="data-column">
            <h3>Places ({places.length})</h3>
            <ul>
              {places.map(place => (
                <li key={place.id}>
                  <div className="item-header">
                    <strong>{place.name}</strong> - {place.area}
                    <button 
                      onClick={() => handleEditPlace(place)}
                      className="edit-btn"
                      title="Edit place"
                    >
                      ✏️
                    </button>
                  </div>
                  <small>{place.address}</small>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="data-column">
            <h3>Activities ({activities.length})</h3>
            <ul>
              {activities.map(activity => (
                <li key={activity.id}>
                  <div className="item-header">
                    {activity.name}
                    <button 
                      onClick={() => handleEditActivity(activity)}
                      className="edit-btn"
                      title="Edit activity"
                    >
                      ✏️
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <EditPlaceModal
        place={editingPlace}
        isOpen={isPlaceModalOpen}
        onClose={handleClosePlaceModal}
        onSave={handleSavePlace}
      />
    </div>
  );
}

export default AdminPage; 