import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';
import './EditEventModal.css';

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
  onSave: (event: Omit<Event, 'id' | 'place' | 'activity'> & { placeId: number; activityId: number }) => void;
}

const EditEventModal: React.FC<EditEventModalProps> = ({ event, isOpen, onClose, onSave }) => {
  const [placeId, setPlaceId] = useState<number | string>('');
  const [activityId, setActivityId] = useState<number | string>('');
  const [dayOfWeek, setDayOfWeek] = useState<number | string>('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');
  const [places, setPlaces] = useState<Place[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  const { user, hasRole } = useAuth();

  useEffect(() => {
    if (isOpen) {
      if (event) {
        setPlaceId(event.place.id);
        setActivityId(event.activity.id);
        setDayOfWeek(new Date(event.start_time).getDay());
        setStartTime(new Date(event.start_time).toTimeString().slice(0, 5));
        setEndTime(new Date(event.end_time).toTimeString().slice(0, 5));
        setDescription(event.description);
      } else {
        // Reset form for new event
        setPlaceId('');
        setActivityId('');
        setDayOfWeek('');
        setStartTime('');
        setEndTime('');
        setDescription('');
      }
      fetchPlaces();
      fetchActivities();
    }
  }, [isOpen, event]);

  const fetchPlaces = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Authorization': `Bearer ${token}`,
      };
      // Use the admin/places endpoint which filters by user for Place Owners
      const response = await axios.get('http://localhost:3000/api/admin/places', { headers });
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
      const response = await axios.get('http://localhost:3000/api/activities', { headers });
      setActivities(response.data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!placeId || !activityId || !dayOfWeek || !startTime || !endTime || !description) {
      alert('Please fill in all fields.');
      return;
    }

    onSave({
      placeId: Number(placeId),
      activityId: Number(activityId),
      dayOfWeek: Number(dayOfWeek),
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
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{event ? 'Edit Event' : 'Add Event'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="event-place">Place:</label>
            <select
              id="event-place"
              value={placeId}
              onChange={(e) => setPlaceId(Number(e.target.value))}
              required
              disabled={hasRole('Place Owner') && event !== null} // Disable if editing and is Place Owner
            >
              <option value="">Select a Place</option>
              {places.map((p) => (
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
              {activities.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="event-day">Day of Week:</label>
            <select
              id="event-day"
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(Number(e.target.value))}
              required
            >
              <option value="">Select Day</option>
              {daysOfWeek.map((day) => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
          </div>
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
          <div className="form-group">
            <label htmlFor="event-description">Description:</label>
            <textarea
              id="event-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="form-buttons">
            <button type="submit" className="submit-btn">Save</button>
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEventModal;
