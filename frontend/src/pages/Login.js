import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const { login, darkMode } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/login', form);
      login(res.data.user, res.data.token);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  const card = {
    background: darkMode ? '#1e293b' : '#ffffff',
    padding: '2rem',
    borderRadius: '12px',
    width: '360px',
    border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
  };

  const inputStyle = {
    width: '100%', padding: '0.6rem',
    background: darkMode ? '#0f172a' : '#f8fafc',
    border: `1px solid ${darkMode ? '#334155' : '#cbd5e1'}`,
    borderRadius: '6px',
    color: darkMode ? '#e2e8f0' : '#334155'
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div style={card}>
        <h2 style={{ marginBottom: '1.5rem', color: darkMode ? '#38bdf8' : '#334155' }}>Login</h2>
        <form onSubmit={handleSubmit}>
          {['email', 'password'].map(field => (
            <div key={field} style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: darkMode ? '#94a3b8' : '#64748b', textTransform: 'capitalize', fontSize: '0.85rem' }}>{field}</label>
              <input
                type={field === 'password' ? 'password' : 'email'}
                value={form[field]}
                onChange={e => setForm({ ...form, [field]: e.target.value })}
                required
                style={inputStyle}
              />
            </div>
          ))}
          <button type="submit" style={{
            width: '100%', padding: '0.7rem',
            background: darkMode ? '#38bdf8' : '#607274',
            color: darkMode ? '#0f172a' : 'white',
            border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem'
          }}>Login</button>
        </form>
        <p style={{ marginTop: '1rem', color: '#64748b', textAlign: 'center', fontSize: '0.9rem' }}>
          No account? <Link to="/register" style={{ color: darkMode ? '#38bdf8' : '#607274' }}>Register</Link>
        </p>
      </div>
    </div>
  );
}