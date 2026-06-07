// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';

// export default function Navbar() {
//   const { user, logout, darkMode, toggleDarkMode } = useAuth();
//   const navigate = useNavigate();
//   const [isOpen, setIsOpen] = useState(false);

//   const handleLogout = () => { logout(); navigate('/login'); };

//   const nav = {
//     background: darkMode ? '#1e293b' : 'white',
//     padding: '1rem 2rem',
//     borderBottom: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
//     position: 'relative',
//     zIndex: 1000,
//     boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
//   };

//   const linkColor = darkMode ? '#94a3b8' : '#334155';
//   const btnBg = darkMode ? '#334155' : '#607274';

//   return (
//     <nav style={nav}>
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1100px', margin: '0 auto' }}>
//         <span style={{ fontSize: '1.3rem', fontWeight: 'bold', color: darkMode ? '#38bdf8' : '#334155' }}>
//           💰 ExpenseTracker
//         </span>

//         <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }} className="desktop-menu">
//           <Link to="/" style={{ color: linkColor, textDecoration: 'none', fontWeight: '500' }}>Dashboard</Link>
//           <Link to="/expenses" style={{ color: linkColor, textDecoration: 'none', fontWeight: '500' }}>Expenses</Link>
//           <span style={{ color: linkColor, fontSize: '0.9rem' }}>Hi, {user?.name}</span>
//           <button onClick={toggleDarkMode} style={{
//             background: 'transparent', border: `1px solid ${darkMode ? '#475569' : '#cbd5e1'}`,
//             color: linkColor, padding: '0.35rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem'
//           }}>
//           {darkMode ? 'Dark' : 'Light'}
//             {/* {darkMode ? '☀️ Light' : '🌙 Dark'} */}
//           </button>
//           <button onClick={handleLogout} style={{
//             background: btnBg, color: 'white', border: 'none',
//             padding: '0.4rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '500'
//           }}>Logout</button>
//         </div>

//         <button onClick={() => setIsOpen(!isOpen)}
//           style={{ background: 'none', border: 'none', color: linkColor, fontSize: '1.7rem', cursor: 'pointer' }}
//           className="mobile-hamburger-btn">
//           {isOpen ? '✕' : '☰'}
//         </button>
//       </div>

//       {isOpen && (
//         <div style={{
//           display: 'flex', flexDirection: 'column', gap: '1rem',
//           background: darkMode ? '#1e293b' : '#f8fafc',
//           position: 'absolute', top: '100%', left: 0, width: '100%',
//           padding: '1.5rem 2rem', borderBottom: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
//           boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)'
//         }}>
//           <Link to="/" onClick={() => setIsOpen(false)} style={{ color: linkColor, textDecoration: 'none', fontWeight: '500' }}>Dashboard</Link>
//           <Link to="/expenses" onClick={() => setIsOpen(false)} style={{ color: linkColor, textDecoration: 'none', fontWeight: '500' }}>Expenses</Link>
//           <div style={{ borderTop: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`, paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
//             <span style={{ color: linkColor, fontSize: '0.9rem' }}>Hi, {user?.name}</span>
//             <button onClick={toggleDarkMode} style={{ background: 'transparent', border: `1px solid ${darkMode ? '#475569' : '#cbd5e1'}`, color: linkColor, padding: '0.3rem 0.7rem', borderRadius: '5px', cursor: 'pointer' }}>
//               {darkMode ? '☀️ Light' : '🌙 Dark'}
//             </button>
//             <button onClick={handleLogout} style={{ background: btnBg, color: 'white', border: 'none', padding: '0.4rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>Logout</button>
//           </div>
//         </div>
//       )}
//     </nav>
//   );
// }