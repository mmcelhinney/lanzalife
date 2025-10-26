import React, { useState, useEffect } from 'react';
import './UserSearch.css';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  role: string;
  telephone: string;
  isPlaceOwner?: boolean;
  placeCount?: number;
}

interface UserSearchProps {
  onEditUser: (user: User) => void;
  onRefresh: () => void;
  onViewUser: (user: User) => void;
  onShowNotification: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

const UserSearch: React.FC<UserSearchProps> = ({ onEditUser, onRefresh, onViewUser, onShowNotification }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://192.168.0.16:3000'}/api/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Add place ownership information
        const usersWithPlaceInfo = await Promise.all(data.map(async (user: User) => {
          if (user.role === 'Place Owner') {
            try {
              const placesResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://192.168.0.16:3000'}/api/admin/places`, {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
              });
              if (placesResponse.ok) {
                const places = await placesResponse.json();
                const userPlaces = places.filter((place: any) => place.user?.id === user.id);
                return {
                  ...user,
                  isPlaceOwner: true,
                  placeCount: userPlaces.length
                };
              }
            } catch (err) {
              console.error('Error fetching places for user:', err);
            }
          }
          return {
            ...user,
            isPlaceOwner: user.role === 'Place Owner',
            placeCount: 0
          };
        }));
        setUsers(usersWithPlaceInfo);
      } else {
        setError('Failed to fetch users');
      }
    } catch (err) {
      setError('Error fetching users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    // Check if user is a place owner with places
    if (user.isPlaceOwner && user.placeCount && user.placeCount > 0) {
      alert(`Cannot delete ${user.username}. This user owns ${user.placeCount} place(s). Please transfer the places to another user before deleting.`);
      return;
    }

    // Double confirmation for deletion
    if (!confirm(`Are you sure you want to delete user "${user.username}"?`)) {
      return;
    }

    if (!confirm('This action cannot be undone. Are you absolutely sure?')) {
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://192.168.0.16:3000'}/api/users/${user.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setUsers(users.filter(u => u.id !== user.id));
        onRefresh();
        onShowNotification('User deleted successfully', 'success');
      } else {
        const errorData = await response.json();
        onShowNotification(`Failed to delete user: ${errorData.message || 'Unknown error'}`, 'error');
      }
    } catch (err) {
      onShowNotification('Error deleting user', 'error');
      console.error('Error deleting user:', err);
    }
  };

  const filteredUsers = users.filter(user =>
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="user-search-container">
        <div className="loading-spinner">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="user-search-container">
      <div className="search-header">
        <h2>User Management</h2>
        <div className="search-controls">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button onClick={fetchUsers} className="refresh-btn">
            🔄 Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={2} className="no-users">
                  {searchTerm ? 'No users found matching your search.' : 'No users found.'}
                </td>
              </tr>
            ) : (
              filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>
                    <button
                      onClick={() => onViewUser(user)}
                      className="username-link"
                      title="Click to view user details"
                    >
                      {user.username}
                    </button>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => onEditUser(user)}
                        className="edit-btn"
                        title="Edit user"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user)}
                        className={`delete-btn ${user.isPlaceOwner && user.placeCount && user.placeCount > 0 ? 'disabled' : ''}`}
                        title={user.isPlaceOwner && user.placeCount && user.placeCount > 0 ? 'Cannot delete - user owns places' : 'Delete user'}
                        disabled={user.isPlaceOwner && user.placeCount && user.placeCount > 0}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserSearch;
