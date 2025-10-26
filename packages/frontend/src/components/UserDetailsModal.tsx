import React from 'react';
import './UserDetailsModal.css';

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

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ isOpen, onClose, user }) => {
  if (!isOpen || !user) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>User Details</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="user-details-content">
          <div className="user-info-grid">
            <div className="info-item">
              <label>Full Name:</label>
              <span>{user.firstName} {user.lastName}</span>
            </div>
            
            <div className="info-item">
              <label>Username:</label>
              <span>{user.username}</span>
            </div>
            
            <div className="info-item">
              <label>Role:</label>
              <span className={`role-badge role-${user.role.toLowerCase().replace(' ', '-')}`}>
                {user.role}
              </span>
            </div>
            
            <div className="info-item">
              <label>Telephone:</label>
              <span>{user.telephone}</span>
            </div>
            
            {user.isPlaceOwner && (
              <div className="info-item place-info">
                <label>Places Owned:</label>
                <span className="place-count">
                  {user.placeCount || 0} place(s)
                </span>
                {user.placeCount && user.placeCount > 0 && (
                  <div className="place-warning">
                    ⚠️ This user owns places and cannot be deleted until places are transferred
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="modal-actions">
          <button onClick={onClose} className="close-btn">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;
