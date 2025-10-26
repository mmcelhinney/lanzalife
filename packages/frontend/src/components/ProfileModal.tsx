import React, { useState, useEffect } from 'react';
import './ProfileModal.css';
import { useAuth } from '../auth/AuthContext';
import { API_BASE_URL } from '../config';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowNotification: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  telephone: string;
  email: string;
  role: string;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, onShowNotification }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<UserProfile>({
    id: 0,
    firstName: '',
    lastName: '',
    username: '',
    telephone: '',
    email: '',
    role: ''
  });
  const [errors, setErrors] = useState<Partial<UserProfile>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        id: user.id,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username,
        telephone: user.telephone || '',
        email: user.email || '',
        role: user.role?.name || ''
      });
      setErrors({});
    }
  }, [isOpen, user]);

  const validateForm = (): boolean => {
    const newErrors: Partial<UserProfile> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.telephone.trim()) {
      newErrors.telephone = 'Telephone number is required';
    } else if (!/^[\+]?[0-9\s\-\(\)]{10,}$/.test(formData.telephone)) {
      newErrors.telephone = 'Please enter a valid telephone number';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${formData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          username: formData.username,
          telephone: formData.telephone,
          email: formData.email
        })
      });

      if (response.ok) {
        onShowNotification('Profile updated successfully!', 'success');
        onClose();
      } else {
        const errorData = await response.json();
        onShowNotification(`Error updating profile: ${errorData.message || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      onShowNotification('Error updating profile. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>My Profile</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name:</label>
              <input
                type="text"
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className={errors.firstName ? 'error' : ''}
                placeholder="Enter first name"
              />
              {errors.firstName && <span className="form-error">{errors.firstName}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name:</label>
              <input
                type="text"
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className={errors.lastName ? 'error' : ''}
                placeholder="Enter last name"
              />
              {errors.lastName && <span className="form-error">{errors.lastName}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              className={errors.username ? 'error' : ''}
              placeholder="Enter username"
            />
            {errors.username && <span className="form-error">{errors.username}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="telephone">Telephone Number:</label>
            <input
              type="tel"
              id="telephone"
              value={formData.telephone}
              onChange={(e) => handleInputChange('telephone', e.target.value)}
              className={errors.telephone ? 'error' : ''}
              placeholder="Enter telephone number"
            />
            {errors.telephone && <span className="form-error">{errors.telephone}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address (Optional):</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={errors.email ? 'error' : ''}
              placeholder="Enter email address"
            />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Role:</label>
            <div className="role-display">
              <span className={`role-badge role-${formData.role.toLowerCase().replace(/\s/g, '-')}`}>
                {formData.role}
              </span>
              <small className="role-note">Role cannot be changed</small>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;
