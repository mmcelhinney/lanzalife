import React, { useState } from 'react';
import axios from 'axios';
import './Login.css'; // Assuming Register uses the same styles

interface RegisterProps {
  onSwitchToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onSwitchToLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [roleName, setRoleName] = useState('Guest'); // Default role

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/auth/register', {
        username,
        password,
        roleName,
      });
      alert('Registration successful!');
      onSwitchToLogin(); // Switch to login view after successful registration
    } catch (error) {
      alert('Registration failed!');
      console.error(error);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Register</h2>
        <div className="form-group">
          <label htmlFor="reg-username">Username</label>
          <input
            id="reg-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="reg-password">Password</label>
          <input
            id="reg-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="role-select">Role</label>
          <select 
            id="role-select" 
            value={roleName} 
            onChange={(e) => setRoleName(e.target.value)}
          >
            <option value="Guest">Guest</option>
            <option value="Place Owner">Place Owner</option>
          </select>
        </div>
        <button type="submit" className="login-button">
          Register
        </button>
        <p className="switch-form-text">
          Already have an account?{' '}
          <a href="#" onClick={(e) => { e.preventDefault(); onSwitchToLogin(); }}>
            Login here
          </a>
        </p>
      </form>
    </div>
  );
};

export default Register;
