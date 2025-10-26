import React, { useState, useEffect } from 'react';
import './ReportsPage.css';
import { API_BASE_URL } from '../config';

interface TrafficData {
  period: string;
  totalTraffic: number;
  trafficByAction: Array<{ action: string; count: string }>;
  mostViewedPlaces: Array<{ placeName: string; placeId: number; viewCount: string }>;
  mostSearchedActivities: Array<{ activityName: string; activityId: number; searchCount: string }>;
  searchQueries: Array<{ query: string; count: string }>;
  hourlyTraffic: Array<{ hour: string; count: string }>;
}

interface PlaceTrafficData {
  place: {
    id: number;
    name: string;
    address: string;
    area: string;
  };
  period: string;
  totalViews: number;
  dailyViews: Array<{ date: string; views: string }>;
}

const ReportsPage: React.FC = () => {
  const [trafficData, setTrafficData] = useState<TrafficData | null>(null);
  const [placeTrafficData, setPlaceTrafficData] = useState<PlaceTrafficData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedPlace, setSelectedPlace] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTrafficData();
  }, [selectedPeriod]);

  useEffect(() => {
    if (selectedPlace) {
      fetchPlaceTrafficData(selectedPlace);
    }
  }, [selectedPlace, selectedPeriod]);

  const fetchTrafficData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/reports/traffic?period=${selectedPeriod}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTrafficData(data);
      } else {
        setError('Failed to fetch traffic data');
      }
    } catch (err) {
      setError('Error fetching traffic data');
      console.error('Error fetching traffic data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlaceTrafficData = async (placeId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reports/traffic/place/${placeId}?period=${selectedPeriod}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPlaceTrafficData(data);
      } else {
        setError('Failed to fetch place traffic data');
      }
    } catch (err) {
      setError('Error fetching place traffic data');
      console.error('Error fetching place traffic data:', err);
    }
  };

  const formatNumber = (num: string | number) => {
    return parseInt(num.toString()).toLocaleString();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="reports-container">
        <div className="loading-spinner">Loading reports...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reports-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1>Traffic Reports</h1>
        <div className="period-selector">
          <label htmlFor="period">Period:</label>
          <select
            id="period"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="1d">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </div>

      {trafficData && (
        <div className="reports-grid">
          {/* Overview Cards */}
          <div className="overview-cards">
            <div className="stat-card">
              <h3>Total Traffic</h3>
              <div className="stat-value">{formatNumber(trafficData.totalTraffic)}</div>
              <div className="stat-label">visits</div>
            </div>
            
            <div className="stat-card">
              <h3>Most Popular Action</h3>
              <div className="stat-value">
                {trafficData.trafficByAction[0]?.action.replace('_', ' ').toUpperCase() || 'N/A'}
              </div>
              <div className="stat-label">
                {trafficData.trafficByAction[0] ? formatNumber(trafficData.trafficByAction[0].count) : 0} times
              </div>
            </div>
          </div>

          {/* Traffic by Action */}
          <div className="report-section">
            <h2>Traffic by Action</h2>
            <div className="action-stats">
              {trafficData.trafficByAction.map((action, index) => (
                <div key={index} className="action-item">
                  <span className="action-name">{action.action.replace('_', ' ').toUpperCase()}</span>
                  <span className="action-count">{formatNumber(action.count)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Most Viewed Places */}
          <div className="report-section">
            <h2>Most Viewed Places</h2>
            <div className="places-list">
              {trafficData.mostViewedPlaces.map((place, index) => (
                <div 
                  key={index} 
                  className={`place-item ${selectedPlace === place.placeId ? 'selected' : ''}`}
                  onClick={() => setSelectedPlace(place.placeId)}
                >
                  <div className="place-info">
                    <span className="place-name">{place.placeName}</span>
                    <span className="place-views">{formatNumber(place.viewCount)} views</span>
                  </div>
                  <div className="place-rank">#{index + 1}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Most Searched Activities */}
          <div className="report-section">
            <h2>Most Searched Activities</h2>
            <div className="activities-list">
              {trafficData.mostSearchedActivities.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-info">
                    <span className="activity-name">{activity.activityName}</span>
                    <span className="activity-searches">{formatNumber(activity.searchCount)} searches</span>
                  </div>
                  <div className="activity-rank">#{index + 1}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Search Queries */}
          <div className="report-section">
            <h2>Popular Search Queries</h2>
            <div className="search-queries">
              {trafficData.searchQueries.map((query, index) => (
                <div key={index} className="query-item">
                  <span className="query-text">"{query.query}"</span>
                  <span className="query-count">{formatNumber(query.count)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hourly Traffic */}
          <div className="report-section">
            <h2>Traffic by Hour</h2>
            <div className="hourly-chart">
              {trafficData.hourlyTraffic.map((hour, index) => (
                <div key={index} className="hour-bar">
                  <div className="hour-label">{hour.hour}:00</div>
                  <div className="hour-bar-container">
                    <div 
                      className="hour-bar-fill"
                      style={{ 
                        width: `${(parseInt(hour.count) / Math.max(...trafficData.hourlyTraffic.map(h => parseInt(h.count)))) * 100}%` 
                      }}
                    ></div>
                    <span className="hour-count">{formatNumber(hour.count)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Place Detail View */}
      {placeTrafficData && (
        <div className="place-detail-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{placeTrafficData.place.name} - Traffic Details</h2>
              <button onClick={() => setSelectedPlace(null)} className="close-btn">×</button>
            </div>
            <div className="place-details">
              <div className="place-info">
                <p><strong>Address:</strong> {placeTrafficData.place.address}</p>
                <p><strong>Area:</strong> {placeTrafficData.place.area}</p>
                <p><strong>Total Views:</strong> {formatNumber(placeTrafficData.totalViews)}</p>
              </div>
              <div className="daily-views">
                <h3>Daily Views</h3>
                {placeTrafficData.dailyViews.map((day, index) => (
                  <div key={index} className="daily-view-item">
                    <span className="date">{formatDate(day.date)}</span>
                    <span className="views">{formatNumber(day.views)} views</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
