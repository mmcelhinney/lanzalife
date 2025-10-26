import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';
import './EditEventModal.css';
import { API_BASE_URL } from '../config';

interface Place {
  id: number;
  name: string;
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

interface EditEventModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: {
    placeId: number;
    activityId: number;
    selectedDays: number[];
    startTime: string;
    endTime: string;
    description: string;
  }) => void;
  activities?: Activity[];
  places?: Place[];
  selectedPlace?: Place | null;
}

const EditEventModal: React.FC<EditEventModalProps> = ({ event, isOpen, onClose, onSave, activities = [], places = [], selectedPlace = null }) => {
  const [placeId, setPlaceId] = useState<number | string>('');
  const [activityId, setActivityId] = useState<number | string>('');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');
  const [localPlaces, setLocalPlaces] = useState<Place[]>([]);
  const [localActivities, setLocalActivities] = useState<Activity[]>([]);
  
  // Use passed props or local state
  const currentPlaces = places.length > 0 ? places : localPlaces;
  const currentActivities = activities.length > 0 ? activities : localActivities;

  const { user, hasRole } = useAuth();

  useEffect(() => {
    if (isOpen) {
      if (event) {
        setPlaceId(event.place.id);
        setActivityId(event.activity.id);
        setSelectedDays([new Date(event.start_time).getDay()]);
        setStartTime(new Date(event.start_time).toTimeString().slice(0, 5));
        setEndTime(new Date(event.end_time).toTimeString().slice(0, 5));
        setDescription(event.description);
      } else {
        // Reset form for new event
        setPlaceId(selectedPlace ? selectedPlace.id : '');
        setActivityId('');
        setSelectedDays([]);
        setStartTime('');
        setEndTime('');
        setDescription('');
      }
      fetchPlaces();
      fetchActivities();
    }
  }, [isOpen, event, selectedPlace]);

  const fetchPlaces = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Authorization': `Bearer ${token}`,
      };
      // Use the admin/places endpoint which filters by user for Place Owners
      const response = await axios.get(`${API_BASE_URL}/api/admin/places`, { headers });
      setPlaces(response.data);
    } catch (error) {
      console.error('Error fetching places:', error);
    }
  };

  const fetchActivities = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Authorization': `Bearer ${token}`,
      };
      const response = await axios.get(`${API_BASE_URL}/api/activities`, { headers });
      setActivities(response.data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const handleDayToggle = (day: number) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!placeId || !activityId || selectedDays.length === 0 || !startTime || !endTime) {
      alert('Please fill in all required fields and select at least one day.');
      return;
    }

    onSave({
      placeId: Number(placeId),
      activityId: Number(activityId),
      selectedDays: selectedDays,
      startTime,
      endTime,
      description,
    });
  };

  const daysOfWeek = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
  ];

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{event ? 'Edit Event' : 'Add Event'}</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="event-place">Place:</label>
            <select
              id="event-place"
              value={placeId}
              onChange={(e) => setPlaceId(Number(e.target.value))}
              required
              disabled={hasRole('Place Owner') && event !== null || (hasRole('Place Owner') && selectedPlace !== null)}
            >
              <option value="">Select a Place</option>
              {currentPlaces.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="event-activity">Activity:</label>
            <select
              id="event-activity"
              value={activityId}
              onChange={(e) => setActivityId(Number(e.target.value))}
              required
            >
              <option value="">Select an Activity</option>
              {currentActivities.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Select Days (you can choose multiple):</label>
            {selectedDays.length > 0 && (
              <div className="selected-days-info">
                {selectedDays.length} day{selectedDays.length > 1 ? 's' : ''} selected
              </div>
            )}
            <div className="day-selector">
              {daysOfWeek.map((day) => (
                <div
                  key={day.value}
                  className={`day-option ${selectedDays.includes(day.value) ? 'selected' : ''}`}
                  onClick={() => handleDayToggle(day.value)}
                >
                  <input
                    type="checkbox"
                    id={`day-${day.value}`}
                    checked={selectedDays.includes(day.value)}
                    onChange={() => handleDayToggle(day.value)}
                  />
                  <label htmlFor={`day-${day.value}`}>
                    <div className="day-name">{day.label.slice(0, 3)}</div>
                    <div className="day-number">{day.value === 0 ? 'S' : day.value}</div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="time-row">
            <div className="form-group">
              <label htmlFor="event-start-time">Start Time:</label>
              <input
                id="event-start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="event-end-time">End Time:</label>
              <input
                id="event-end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="event-description">Description (Optional):</label>
            <textarea
              id="event-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Add any additional details about this event..."
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="save-btn">
              {event ? 'Update Event' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEventModal;
