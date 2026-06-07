import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const { login, darkMode } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    try {
      const res = await API.post('/auth/register', { name: form.name, email: form.email, password: form.password });
      login(res.data.user, res.data.token);
      toast.success('Account created!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  const card = {
    background: darkMode ? '#1e293b' : '#ffffff',
    padding: '2rem', borderRadius: '12px', width: '380px',
    border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
  };

  const inputStyle = {
    width: '100%', padding: '0.6rem',
    background: darkMode ? '#0f172a' : '#f8fafc',
    border: `1px solid ${darkMode ? '#334155' : '#cbd5e1'}`,
    borderRadius: '6px', color: darkMode ? '#e2e8f0' : '#334155'
  };

  const fields = [
    { key: 'name', type: 'text', label: 'Name' },
    { key: 'email', type: 'email', label: 'Email' },
    { key: 'password', type: 'password', label: 'Password' },
    { key: 'confirmPassword', type: 'password', label: 'Confirm Password' },
  ];

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div style={card}>
        <h2 style={{ marginBottom: '1.5rem', color: darkMode ? '#38bdf8' : '#334155' }}>Register</h2>
        <form onSubmit={handleSubmit}>
          {fields.map(({ key, type, label }) => (
            <div key={key} style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: darkMode ? '#94a3b8' : '#64748b', fontSize: '0.85rem' }}>{label}</label>
              <input
                type={type}
                value={form[key]}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
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
          }}>Register</button>
        </form>
        <p style={{ marginTop: '1rem', color: '#64748b', textAlign: 'center', fontSize: '0.9rem' }}>
          Have account? <Link to="/login" style={{ color: darkMode ? '#38bdf8' : '#607274' }}>Login</Link>
        </p>
      </div>
    </div>
  );
}