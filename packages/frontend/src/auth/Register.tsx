import React, { useState } from 'react';
import axios from 'axios';

const Register: React.FC = () => {
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
      // Optionally redirect to login or update UI
    } catch (error) {
      alert('Registration failed!');
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register</h2>
      <div>
        <label>Username:</label>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
      </div>
      <div>
        <label>Password:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <div>
        <label>Role:</label>
        <select value={roleName} onChange={(e) => setRoleName(e.target.value)}>
          <option value="Guest">Guest</option>
          <option value="Place Owner">Place Owner</option>
          <option value="Admin">Admin</option>
        </select>
      </div>
      <button type="submit">Register</button>
    </form>
  );
  };

export default Register;
