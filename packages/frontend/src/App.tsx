import { useState, useEffect } from 'react';
import './App.css';
import MapDisplay from './components/MapDisplay';
import AdminPage from './components/AdminPage';
import Login from './auth/Login';
import Register from './auth/Register';
import { useAuth } from './auth/AuthContext';

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

function App() {
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [selectedActivity, setSelectedActivity] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [nearMe, setNearMe] = useState<boolean>(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [showMap, setShowMap] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<'main' | 'admin' | 'login' | 'register'>('login');

  // Helper function to safely check currentView
  const isCurrentView = (view: 'main' | 'admin' | 'login' | 'register') => currentView === view;
  const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null);

  const { user, logout, hasRole } = useAuth();

  useEffect(() => {
    if (user) {
      if (hasRole('Admin')) {
        setCurrentView('admin');
      } else {
        setCurrentView('main');
      }
    } else {
      setCurrentView('login');
    }
  }, [user, hasRole]);

  const areas = [
    'Costa Teguise',
    'Puerto Del Carmen',
    'Puerto Calero',
    'Playa Blanca',
  ];

  const daysOfWeek = [
    { value: '0', label: 'Sunday' },
    { value: '1', label: 'Monday' },
    { value: '2', label: 'Tuesday' },
    { value: '3', label: 'Wednesday' },
    { value: '4', label: 'Thursday' },
    { value: '5', label: 'Friday' },
    { value: '6', label: 'Saturday' },
  ];

  useEffect(() => {
    fetch('http://localhost:3000/api/activities')
      .then((res) => res.json())
      .then((data: Activity[]) => setActivities(data))
      .catch((err) => console.error('Error fetching activities:', err));
  }, []);

  const handleSearch = () => {
    let url = `http://localhost:3000/api/places?`;
    if (selectedArea && !nearMe) {
      url += `area=${selectedArea}&`;
    }
    if (selectedActivity) {
      url += `activity=${selectedActivity}&`;
    }
    if (selectedDay) {
      url += `day=${selectedDay}&`;
    }
    if (nearMe) {
      url += `nearMe=true&`;
    }
    // Remove trailing '&' if any
    url = url.endsWith('&') ? url.slice(0, -1) : url;

    fetch(url)
      .then((res) => res.json())
      .then((data: Place[]) => {
        setPlaces(data);
        setShowMap(true);
        setSelectedPlaceId(null);
      })
      .catch((err) => console.error('Error fetching places:', err));
  };

  const handleSearchAgain = () => {
    setShowMap(false);
    setSelectedPlaceId(null);
  };

  // Table row pin click handler
  const handlePinClick = (placeId: number) => {
    setSelectedPlaceId(placeId);
  };

  const showAuth = currentView === 'login' || currentView === 'register';

  // Handle hamburger menu actions from AdminPage
  const handleHamburgerAction = (action: string) => {
    switch (action) {
      case 'search':
        setCurrentView('main');
        break;
      case 'admin':
        setCurrentView('admin');
        break;
      case 'user-admin':
        // TODO: Implement User Admin functionality
        console.log('User Admin clicked - functionality to be implemented');
        break;
      default:
        break;
    }
  };

  return (
    <div className="container">
      {!showAuth && currentView !== 'admin' && (
        <div className="header">
          <h1>Lanzalife</h1>
          <nav className="nav-tabs">
            <button 
              className={`nav-tab ${isCurrentView('main') ? 'active' : ''}`}
              onClick={() => setCurrentView('main')}
            >
              Search
            </button>
            {user && hasRole('Admin') && (
              <button 
                className={`nav-tab ${isCurrentView('admin') ? 'active' : ''}`}
                onClick={() => setCurrentView('admin')}
              >
                Admin
              </button>
            )}
            {!user ? (
              <>
                <button 
                  className={`nav-tab ${isCurrentView('login') ? 'active' : ''}`}
                  onClick={() => setCurrentView('login')}
                >
                  Login
                </button>
                <button 
                  className={`nav-tab ${isCurrentView('register') ? 'active' : ''}`}
                  onClick={() => setCurrentView('register')}
                >
                  Register
                </button>
              </>
            ) : (
              <button className="nav-tab" onClick={logout}>Logout ({user.username})</button>
            )}
          </nav>
        </div>
      )}

      {currentView === 'main' && (
        <>
          {!showMap ? (
            <div className="selection-form">
              <div className="form-group">
                <label htmlFor="area-select">Select Area:</label>
                <select
                  id="area-select"
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  disabled={nearMe}
                >
                  <option value="">--Please choose an area--</option>
                  {areas.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    checked={nearMe}
                    onChange={(e) => setNearMe(e.target.checked)}
                  />
                  Near Me
                </label>
              </div>

              <div className="form-group">
                <label htmlFor="activity-select">Select Event Type:</label>
                <select
                  id="activity-select"
                  value={selectedActivity}
                  onChange={(e) => setSelectedActivity(e.target.value)}
                >
                  <option value="">--Please choose an event type--</option>
                  {activities.map((activity) => (
                    <option key={activity.id} value={activity.id}>
                      {activity.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="day-select">Select Day:</label>
                <select
                  id="day-select"
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                >
                  <option value="">--Any day--</option>
                  {daysOfWeek.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>

              <button onClick={handleSearch}>Search</button>
            </div>
          ) : (
            <>
              <MapDisplay places={places} selectedPlaceId={selectedPlaceId} />
              {places.length > 0 && (
                <div className="results-table-container">
                  <table className="results-table">
                    <thead>
                      <tr>
                        <th>Place</th>
                        <th>Area</th>
                        <th>Pin</th>
                      </tr>
                    </thead>
                    <tbody>
                      {places.map((place) => (
                        <tr key={place.id} className={selectedPlaceId === place.id ? 'selected-row' : ''}>
                          <td>{place.name}</td>
                          <td>{place.area}</td>
                          <td>
                            <button className="pin-btn" onClick={() => handlePinClick(place.id)} title="Locate on map">
                              📍
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div style={{ textAlign: 'center', margin: '2rem 0' }}>
                <button className="search-again-btn" onClick={handleSearchAgain}>Search Again</button>
              </div>
            </>
          )}
        </>
      )}

      {currentView === 'admin' && user && hasRole('Admin') && <AdminPage onMenuAction={handleHamburgerAction} />}
      {currentView === 'login' && <Login onSwitchToRegister={() => setCurrentView('register')} />}
      {currentView === 'register' && <Register onSwitchToLogin={() => setCurrentView('login')} />}
    </div>
  );
}

export default App;
