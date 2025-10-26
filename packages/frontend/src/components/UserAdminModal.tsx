import React, { useState } from 'react';
import './UserAdminModal.css';

interface UserAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: UserData) => void;
  user?: UserData | null;
  isEdit?: boolean;
}

interface UserData {
  id?: number;
  firstName: string;
  lastName: string;
  username: string;
  role: string;
  telephone: string;
  email: string;
  password?: string;
}

const ROLES = [
  'Admin',
  'Place Owner',
  'Guest'
];

const UserAdminModal: React.FC<UserAdminModalProps> = ({ isOpen, onClose, onSave, user, isEdit = false }) => {
  const [formData, setFormData] = useState<UserData>({
    firstName: '',
    lastName: '',
    username: '',
    role: '',
    telephone: '',
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState<Partial<UserData>>({});

  React.useEffect(() => {
    if (isOpen) {
      if (isEdit && user) {
        setFormData({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          role: user.role,
          telephone: user.telephone,
          email: user.email || '',
          password: ''
        });
      } else {
        setFormData({
          firstName: '',
          lastName: '',
          username: '',
          role: '',
          telephone: '',
          email: '',
          password: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, isEdit, user]);

  const validateForm = (): boolean => {
    const newErrors: Partial<UserData> = {};

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

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    if (!formData.telephone.trim()) {
      newErrors.telephone = 'Telephone number is required';
    } else if (!/^[\+]?[0-9\s\-\(\)]{10,}$/.test(formData.telephone)) {
      newErrors.telephone = 'Please enter a valid telephone number';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation - required for new users, optional for edit
    if (!isEdit && !formData.password?.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  const handleInputChange = (field: keyof UserData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEdit ? 'Edit User' : 'Create New User'}</h2>
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
            <label htmlFor="role">Role:</label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              className={errors.role ? 'error' : ''}
            >
              <option value="">Select a role</option>
              {ROLES.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            {errors.role && <span className="form-error">{errors.role}</span>}
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
            <label htmlFor="password">
              Password {isEdit ? '(leave blank to keep current)' : ''}:
            </label>
            <input
              type="password"
              id="password"
              value={formData.password || ''}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={errors.password ? 'error' : ''}
              placeholder={isEdit ? 'Enter new password (optional)' : 'Enter password'}
            />
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="save-btn">
              {isEdit ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserAdminModal;
