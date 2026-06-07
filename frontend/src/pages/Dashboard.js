import React, { useEffect, useState, useCallback } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, Legend
} from 'recharts';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#76885B', '#607274', '#B19470', '#E6A4B4', '#8DDFCB', '#D5B4B4', '#9A8A78', '#C7C8CC'];
const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Health', 'Entertainment', 'Bills', 'Education', 'Other'];
const PAYMENT_METHODS = ['Cash', 'Card', 'UPI', 'Net Banking', 'Other'];
const FILTER_CATS = ['All', 'Food', 'Transport', 'Shopping', 'Health', 'Entertainment', 'Bills', 'Education', 'Other'];
const empty = { title: '', amount: '', category: 'Other', paymentMethod: 'Cash', notes: '', expenseDate: '' };

export default function Dashboard() {
  const { user, logout, darkMode, toggleDarkMode } = useAuth();

  const [stats, setStats]           = useState(null);
  const [expenses, setExpenses]     = useState([]);
  const [form, setForm]             = useState(empty);
  const [editId, setEditId]         = useState(null);
  const [showForm, setShowForm]     = useState(false);
  const [search, setSearch]         = useState('');
  const [filterCat, setFilterCat]   = useState('All');
  const [view, setView]             = useState('dashboard');
  const [isMobile, setIsMobile]     = useState(window.innerWidth <= 768);
  const [menuOpen, setMenuOpen]     = useState(false);

  // ── Responsive listener ──
  useEffect(() => {
    const handle = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, []);

  // ── Theme ──
  const bg     = darkMode ? '#1e293b' : '#ffffff';
  const pageBg = darkMode ? '#0f172a' : '#f1f5f9';
  const border = darkMode ? '#334155' : '#e2e8f0';
  const text   = darkMode ? '#e2e8f0' : '#334155';
  const sub    = darkMode ? '#94a3b8' : '#64748b';
  const iBg    = darkMode ? '#0f172a' : '#f8fafc';

  const inp = {
    width: '100%', padding: '0.6rem',
    background: iBg, border: `1px solid ${border}`,
    borderRadius: '8px', color: text,
    fontSize: '0.9rem', outline: 'none',
    boxSizing: 'border-box'
  };

  const tip = {
    background: bg, border: `1px solid ${border}`,
    borderRadius: '8px', color: text
  };

  // ── Fetch ──
  const fetchStats = useCallback(() => {
    API.get('/dashboard').then(r => setStats(r.data)).catch(console.error);
  }, []);

  const fetchExpenses = useCallback(async () => {
    try {
      const p = {};
      if (search) p.search = search;
      if (filterCat !== 'All') p.category = filterCat;
      const r = await API.get('/expenses', { params: p });
      setExpenses(r.data);
    } catch { toast.error('Failed to load expenses'); }
  }, [search, filterCat]);

  useEffect(() => { fetchStats(); },    [fetchStats]);
  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  // ── CRUD ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.amount) return toast.error('Title and amount required');
    try {
      if (editId) {
        await API.put(`/expenses/${editId}`, form);
        toast.success('Expense updated!');
      } else {
        await API.post('/expenses', form);
        toast.success('Expense added!');
      }
      setForm(empty); setEditId(null); setShowForm(false);
      fetchExpenses(); fetchStats();
    } catch { toast.error('Failed to save'); }
  };

  const handleEdit = (exp) => {
    setForm({
      title: exp.title, amount: exp.amount,
      category: exp.category,
      paymentMethod: exp.paymentMethod || 'Cash',
      notes: exp.notes || '',
      expenseDate: exp.expenseDate?.slice(0, 10) || ''
    });
    setEditId(exp._id);
    setShowForm(true);
    setView('expenses');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await API.delete(`/expenses/${id}`);
      toast.success('Deleted');
      fetchExpenses(); fetchStats();
    } catch { toast.error('Delete failed'); }
  };

  // ── Stat Card ──
  const StatCard = ({ title, value, color, icon }) => (
    <div style={{
      background: bg,
      borderRadius: '14px',
      padding: isMobile ? '1rem' : '1.4rem 1.6rem',
      flex: '1 1 140px',
      borderLeft: `4px solid ${color}`,
      border: `1px solid ${border}`,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      minWidth: 0
    }}>
      <div style={{ fontSize: '1.3rem', marginBottom: '0.25rem' }}>{icon}</div>
      <div style={{ color: sub, fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</div>
      <div style={{ fontSize: isMobile ? '1.4rem' : '1.7rem', fontWeight: '700', color: text }}>
        {typeof value === 'number' ? `₹${value.toFixed(0)}` : value}
      </div>
    </div>
  );

  // ── Tab Button ──
  const TabBtn = ({ id, icon, label }) => (
    <button
      onClick={() => { setView(id); setMenuOpen(false); }}
      style={{
        padding: isMobile ? '0.45rem 0.9rem' : '0.5rem 1.2rem',
        borderRadius: '8px', border: 'none', cursor: 'pointer',
        fontWeight: '600', fontSize: isMobile ? '0.82rem' : '0.9rem',
        display: 'flex', alignItems: 'center', gap: '0.35rem',
        background: view === id ? (darkMode ? '#334155' : '#607274') : 'transparent',
        color: view === id ? '#ffffff' : sub,
        transition: 'all 0.2s', whiteSpace: 'nowrap'
      }}>
      {icon} {label}
    </button>
  );

  // ── Chart card wrapper ──
  const ChartCard = ({ title, children }) => (
    <div style={{
      background: bg, borderRadius: '14px', padding: '1.5rem',
      border: `1px solid ${border}`,
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      minWidth: 0
    }}>
      <h3 style={{
        color: sub, fontSize: '0.82rem', fontWeight: '600',
        marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em'
      }}>{title}</h3>
      {children}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: pageBg }}>

      {/* ══════════ HEADER ══════════ */}
      <div style={{
        background: bg, borderBottom: `1px solid ${border}`,
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 1px 6px rgba(0,0,0,0.06)'
      }}>
        <div style={{
          maxWidth: '1100px', margin: '0 auto',
          padding: '0 1rem',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          height: '60px', gap: '0.75rem'
        }}>

          {/* Brand */}
          <span style={{
            fontWeight: '700', fontSize: '1rem',
            color: text, whiteSpace: 'nowrap', flexShrink: 0
          }}>
            ExpenseTracker
          </span>

          {/* Desktop: tabs + actions */}
          {!isMobile && (
            <>
              {/* Tab switcher */}
              <div style={{
                display: 'flex', gap: '0.2rem',
                background: darkMode ? '#0f172a' : '#f1f5f9',
                borderRadius: '10px', padding: '0.25rem'
              }}>
                <TabBtn id="dashboard" label="Dashboard" />
                <TabBtn id="expenses"  label="Expenses"  />
              </div>

              {/* Right actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ color: sub, fontSize: '0.83rem' }}>Hi {user?.name}</span>

                <button onClick={toggleDarkMode} style={{
                  background: darkMode ? '#334155' : '#e2e8f0',
                  border: 'none', borderRadius: '20px',
                  padding: '0.32rem 0.75rem',
                  cursor: 'pointer', fontSize: '0.83rem', color: text
                }}>
                  {darkMode ? 'Dark' : 'Light'}
                  {/* {darkMode ? '☀️' : '🌙'} */}
                </button>

                <button onClick={() => {
                  setForm(empty); setEditId(null);
                  setShowForm(true); setView('expenses');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }} style={{
                  background: '#76885B', color: '#fff', border: 'none',
                  borderRadius: '8px', padding: '0.4rem 0.9rem',
                  fontWeight: '600', cursor: 'pointer', fontSize: '0.83rem', whiteSpace: 'nowrap'
                }}>
                  + Add Expense
                </button>

                <button onClick={logout} style={{
                  background: '#ef4444', color: '#fff', border: 'none',
                  borderRadius: '8px', padding: '0.4rem 0.85rem',
                  fontWeight: '600', cursor: 'pointer', fontSize: '0.83rem'
                }}>
                  Logout
                </button>
              </div>
            </>
          )}

          {/* Mobile: hamburger */}
          {isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button onClick={() => {
                setForm(empty); setEditId(null);
                setShowForm(true); setView('expenses');
                setMenuOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }} style={{
                background: '#76885B', color: '#fff', border: 'none',
                borderRadius: '8px', padding: '0.38rem 0.75rem',
                fontWeight: '600', cursor: 'pointer', fontSize: '0.8rem', whiteSpace: 'nowrap'
              }}>
                + Add
              </button>
              <button onClick={() => setMenuOpen(o => !o)} style={{
                background: 'transparent', border: `1px solid ${border}`,
                borderRadius: '8px', padding: '0.38rem 0.65rem',
                cursor: 'pointer', fontSize: '1.1rem', color: text
              }}>
                {menuOpen ? '✕' : '☰'}
              </button>
            </div>
          )}
        </div>

        {/* Mobile dropdown menu */}
        {isMobile && menuOpen && (
          <div style={{
            background: bg, borderTop: `1px solid ${border}`,
            padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem'
          }}>
            {/* Tabs */}
            <div style={{
              display: 'flex', gap: '0.4rem',
              background: darkMode ? '#0f172a' : '#f1f5f9',
              borderRadius: '10px', padding: '0.25rem'
            }}>
              <TabBtn id="dashboard" label="Dashboard" />
              <TabBtn id="expenses"  label="Expenses"  />
            </div>

            {/* User info + controls */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span style={{ color: sub, fontSize: '0.85rem' }}>Hi {user?.name}</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={toggleDarkMode} style={{
                  background: darkMode ? '#334155' : '#e2e8f0',
                  border: 'none', borderRadius: '20px',
                  padding: '0.35rem 0.75rem',
                  cursor: 'pointer', fontSize: '0.85rem', color: text
                }}>
                  {darkMode ? 'Dark' : 'Light'}
                  {/* {darkMode ? '☀️' : '🌙'} */}
                </button>
                <button onClick={logout} style={{
                  background: '#ef4444', color: '#fff', border: 'none',
                  borderRadius: '8px', padding: '0.35rem 0.85rem',
                  fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem'
                }}>
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ══════════ PAGE BODY ══════════ */}
      <div style={{
        maxWidth: '1100px', margin: '0 auto',
        padding: isMobile ? '1rem' : '2rem'
      }}>

        {/* ════════ DASHBOARD VIEW ════════ */}
        {view === 'dashboard' && (
          <>
            {!stats
              ? <div style={{ textAlign: 'center', padding: '4rem', color: sub }}>Loading...</div>
              : <>
                  {/* Stat Cards */}
                  <div style={{
                    display: 'flex', gap: '0.75rem',
                    marginBottom: '1.5rem', flexWrap: 'wrap'
                  }}>
                    <StatCard title="Total Expenses"      value={stats.total}        color="#76885B" />
                    <StatCard title="This Month"          value={stats.monthly}       color="#607274" />
                    <StatCard title="Recent Transactions" value={stats.recent.length} color="#B19470" />
                  </div>

                  {/* Pie + Bar charts */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                    gap: '1.25rem',
                    marginBottom: '1.25rem'
                  }}>
                    {/* Pie */}
                    <ChartCard title="Category Breakdown">
                      {Object.keys(stats.categoryBreakdown).length === 0
                        ? <div style={{ textAlign: 'center', color: sub, padding: '2rem' }}>No data yet</div>
                        : <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                              <Pie
                                data={Object.entries(stats.categoryBreakdown).map(([name, value]) => ({ name, value }))}
                                dataKey="value" nameKey="name"
                                cx="50%" cy="50%" outerRadius={75} paddingAngle={3}>
                                {Object.keys(stats.categoryBreakdown).map((_, i) => (
                                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(v) => `₹${v}`} contentStyle={tip} />
                            </PieChart>
                          </ResponsiveContainer>
                      }
                    </ChartCard>

                    {/* Bar */}
                    <ChartCard title="Recent Expenses">
                      {stats.recent.length === 0
                        ? <div style={{ textAlign: 'center', color: sub, padding: '2rem' }}>No data yet</div>
                        : <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={stats.recent.map(e => ({ name: e.title.slice(0, 8), amount: e.amount }))}>
                              <CartesianGrid strokeDasharray="3 3" stroke={border} />
                              <XAxis dataKey="name" tick={{ fill: sub, fontSize: 10 }} />
                              <YAxis tick={{ fill: sub, fontSize: 10 }} />
                              <Tooltip formatter={(v) => `₹${v}`} contentStyle={tip} />
                              <Bar dataKey="amount" fill="#76885B" radius={[6, 6, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                      }
                    </ChartCard>
                  </div>

                  {/* Monthly Trend + Recent Transactions */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                    gap: '1.25rem',
                    marginBottom: '1.5rem'
                  }}>
                    {/* Line Chart */}
                    <ChartCard title="Monthly Trend">
                      <ResponsiveContainer width="100%" height={240}>
                        <LineChart data={stats.monthlyTrend}>
                          <CartesianGrid strokeDasharray="3 3" stroke={border} />
                          <XAxis dataKey="month" tick={{ fill: sub, fontSize: 10 }} />
                          <YAxis tick={{ fill: sub, fontSize: 10 }} />
                          <Tooltip formatter={(v) => `₹${v}`} contentStyle={tip} />
                          <Legend />
                          <Line
                            type="monotone" dataKey="amount"
                            stroke="#607274" strokeWidth={2.5}
                            dot={{ fill: '#607274', r: 4 }} name="Expenses"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartCard>

                    {/* Recent Transactions */}
                    <div style={{
                      background: bg, borderRadius: '14px',
                      overflow: 'hidden', border: `1px solid ${border}`,
                      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                      display: 'flex', flexDirection: 'column'
                    }}>
                      <div style={{
                        padding: '0.9rem 1.25rem',
                        borderBottom: `1px solid ${border}`,
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                      }}>
                        <h3 style={{ color: sub, fontSize: '0.82rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Recent Transactions
                        </h3>
                        <button onClick={() => setView('expenses')} style={{
                          background: 'transparent', border: `1px solid ${border}`,
                          color: sub, padding: '0.25rem 0.7rem',
                          borderRadius: '6px', cursor: 'pointer', fontSize: '0.78rem'
                        }}>View All →</button>
                      </div>

                      <div style={{ flex: 1, overflowY: 'auto', maxHeight: '260px' }}>
                        {stats.recent.length === 0
                          ? <div style={{ padding: '2rem', textAlign: 'center', color: sub }}>No transactions yet.</div>
                          : stats.recent.map((exp, i) => (
                            <div key={exp._id} style={{
                              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                              padding: '0.75rem 1.25rem',
                              borderBottom: i < stats.recent.length - 1 ? `1px solid ${border}` : 'none',
                              gap: '0.5rem'
                            }}>
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{
                                  color: text, fontWeight: '500', fontSize: '0.9rem',
                                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                                }}>{exp.title}</div>
                                <div style={{ fontSize: '0.75rem', color: sub, marginTop: '0.1rem', display: 'flex', gap: '0.3rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                  <span style={{
                                    background: darkMode ? '#334155' : '#f1f5f9',
                                    padding: '0.08rem 0.4rem', borderRadius: '4px'
                                  }}>{exp.category}</span>
                                  <span>{new Date(exp.expenseDate).toLocaleDateString()}</span>
                                </div>
                              </div>
                              <span style={{ color: '#dc2626', fontWeight: '700', fontSize: '0.95rem', whiteSpace: 'nowrap' }}>
                                ₹{exp.amount}
                              </span>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  </div>
                </>
            }
          </>
        )}

        {/* ════════ EXPENSES VIEW ════════ */}
        {view === 'expenses' && (
          <>
            {/* Add / Edit Form */}
            {showForm && (
              <div style={{
                background: bg, borderRadius: '14px',
                padding: isMobile ? '1rem' : '1.5rem',
                marginBottom: '1.25rem',
                border: `1px solid ${border}`,
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ color: text, fontWeight: '700', fontSize: '1rem' }}>
                    {editId ? '✏️ Edit Expense' : '➕ New Expense'}
                  </h3>
                  <button onClick={() => { setShowForm(false); setForm(empty); setEditId(null); }} style={{
                    background: 'transparent', border: 'none',
                    color: sub, fontSize: '1.3rem', cursor: 'pointer', lineHeight: 1
                  }}>✕</button>
                </div>

                <form onSubmit={handleSubmit} style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                  gap: '0.85rem'
                }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.3rem', color: sub, fontSize: '0.8rem', fontWeight: '500' }}>Title *</label>
                    <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required style={inp} placeholder="e.g. Zomato Order" />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.3rem', color: sub, fontSize: '0.8rem', fontWeight: '500' }}>Amount (₹) *</label>
                    <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required min="0" style={inp} placeholder="e.g. 320" />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.3rem', color: sub, fontSize: '0.8rem', fontWeight: '500' }}>Category</label>
                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={inp}>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.3rem', color: sub, fontSize: '0.8rem', fontWeight: '500' }}>Payment Method</label>
                    <select value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })} style={inp}>
                      {PAYMENT_METHODS.map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.3rem', color: sub, fontSize: '0.8rem', fontWeight: '500' }}>Date</label>
                    <input type="date" value={form.expenseDate} onChange={e => setForm({ ...form, expenseDate: e.target.value })} style={inp} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.3rem', color: sub, fontSize: '0.8rem', fontWeight: '500' }}>Notes</label>
                    <input type="text" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={inp} placeholder="Optional..." />
                  </div>

                  {/* Submit row — full width */}
                  <div style={{
                    gridColumn: isMobile ? '1' : '1 / -1',
                    display: 'flex', gap: '0.75rem'
                  }}>
                    <button type="submit" style={{
                      flex: 1, padding: '0.7rem',
                      background: '#607274', color: '#fff',
                      border: 'none', borderRadius: '8px',
                      fontWeight: '700', cursor: 'pointer', fontSize: '0.95rem'
                    }}>
                      {editId ? '✔ Update' : '✔ Add Expense'}
                    </button>
                    <button type="button" onClick={() => { setShowForm(false); setForm(empty); setEditId(null); }} style={{
                      padding: '0.7rem 1.2rem',
                      background: 'transparent', color: sub,
                      border: `1px solid ${border}`, borderRadius: '8px',
                      cursor: 'pointer', fontWeight: '500', fontSize: '0.9rem'
                    }}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Search + Filter */}
            <div style={{
              display: 'flex', gap: '0.75rem',
              marginBottom: '1rem', flexWrap: 'wrap'
            }}>
              <input
                placeholder="🔍 Search by title or category..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ ...inp, flex: 1, minWidth: '160px' }}
              />
              <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
                style={{ ...inp, width: isMobile ? '100%' : '150px' }}>
                {FILTER_CATS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            {/* Count */}
            <div style={{ color: sub, fontSize: '0.8rem', marginBottom: '0.75rem' }}>
              Showing <strong style={{ color: text }}>{expenses.length}</strong> expense{expenses.length !== 1 ? 's' : ''}
            </div>

            {/* Expense List */}
            <div style={{
              background: bg, borderRadius: '14px',
              overflow: 'hidden', border: `1px solid ${border}`,
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
            }}>
              {expenses.length === 0
                ? (
                  <div style={{ padding: '4rem', textAlign: 'center', color: sub }}>
                    <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📭</div>
                    <div style={{ fontWeight: '500' }}>No expenses found</div>
                    <div style={{ fontSize: '0.85rem', marginTop: '0.3rem' }}>Click "+ Add Expense" to get started</div>
                  </div>
                )
                : expenses.map((exp, i) => (
                  <div key={exp._id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: isMobile ? 'flex-start' : 'center',
                    flexDirection: isMobile ? 'column' : 'row',
                    padding: '0.9rem 1.25rem',
                    borderBottom: i < expenses.length - 1 ? `1px solid ${border}` : 'none',
                    gap: '0.6rem'
                  }}>
                    {/* Info */}
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ color: text, fontWeight: '600', marginBottom: '0.2rem', fontSize: '0.95rem' }}>
                        {exp.title}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: sub, display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{
                          background: darkMode ? '#334155' : '#f1f5f9',
                          padding: '0.08rem 0.45rem', borderRadius: '4px'
                        }}>{exp.category}</span>
                        <span>{exp.paymentMethod || 'Cash'}</span>
                        <span>·</span>
                        <span>{new Date(exp.expenseDate).toLocaleDateString()}</span>
                        {exp.notes && <span>· {exp.notes}</span>}
                      </div>
                    </div>

                    {/* Amount + Actions */}
                    <div style={{
                      display: 'flex', alignItems: 'center',
                      gap: '0.5rem',
                      width: isMobile ? '100%' : 'auto',
                      justifyContent: isMobile ? 'space-between' : 'flex-end'
                    }}>
                      <span style={{
                        color: '#dc2626', fontWeight: '700',
                        fontSize: '1rem', whiteSpace: 'nowrap'
                      }}>₹{exp.amount}</span>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button onClick={() => handleEdit(exp)} style={{
                          background: '#16a34a', color: '#fff', border: 'none',
                          padding: '0.32rem 0.75rem', borderRadius: '6px',
                          cursor: 'pointer', fontSize: '0.8rem', fontWeight: '500'
                        }}>Edit</button>
                        <button onClick={() => handleDelete(exp._id)} style={{
                          background: '#dc2626', color: '#fff', border: 'none',
                          padding: '0.32rem 0.75rem', borderRadius: '6px',
                          cursor: 'pointer', fontSize: '0.8rem', fontWeight: '500'
                        }}>Delete</button>
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
          </>
        )}

      </div>
    </div>
  );
}




//unresponsive codes 2 card in 1 row
// import React, { useEffect, useState, useCallback } from 'react';
// import {
//   PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
//   BarChart, Bar, XAxis, YAxis, CartesianGrid,
//   LineChart, Line, Legend
// } from 'recharts';
// import API from '../api/axios';
// import toast from 'react-hot-toast';
// import { useAuth } from '../context/AuthContext';

// const COLORS = ['#76885B', '#607274', '#B19470', '#E6A4B4', '#8DDFCB', '#D5B4B4', '#9A8A78', '#C7C8CC'];
// const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Health', 'Entertainment', 'Bills', 'Education', 'Other'];
// const PAYMENT_METHODS = ['Cash', 'Card', 'UPI', 'Net Banking', 'Other'];
// const FILTER_CATS = ['All', 'Food', 'Transport', 'Shopping', 'Health', 'Entertainment', 'Bills', 'Education', 'Other'];
// const empty = { title: '', amount: '', category: 'Other', paymentMethod: 'Cash', notes: '', expenseDate: '' };

// export default function Dashboard() {
//   const { user, logout, darkMode, toggleDarkMode } = useAuth();

//   const [stats, setStats] = useState(null);
//   const [expenses, setExpenses] = useState([]);
//   const [form, setForm] = useState(empty);
//   const [editId, setEditId] = useState(null);
//   const [showForm, setShowForm] = useState(false);
//   const [search, setSearch] = useState('');
//   const [filterCat, setFilterCat] = useState('All');
//   const [view, setView] = useState('dashboard'); // 'dashboard' | 'expenses'

//   // ── Theme ──
//   const bg = darkMode ? '#1e293b' : '#ffffff';
//   const pageBg = darkMode ? '#0f172a' : '#f1f5f9';
//   const border = darkMode ? '#334155' : '#e2e8f0';
//   const text = darkMode ? '#e2e8f0' : '#334155';
//   const sub = darkMode ? '#94a3b8' : '#64748b';
//   const iBg = darkMode ? '#0f172a' : '#f8fafc';

//   const inp = {
//     width: '100%', padding: '0.6rem',
//     background: iBg, border: `1px solid ${border}`,
//     borderRadius: '8px', color: text, fontSize: '0.9rem',
//     outline: 'none'
//   };

//   const tip = { background: bg, border: `1px solid ${border}`, borderRadius: '8px', color: text };

//   // ── Data fetching ──
//   const fetchStats = useCallback(() => {
//     API.get('/dashboard').then(r => setStats(r.data)).catch(console.error);
//   }, []);

//   const fetchExpenses = useCallback(async () => {
//     try {
//       const p = {};
//       if (search) p.search = search;
//       if (filterCat !== 'All') p.category = filterCat;
//       const r = await API.get('/expenses', { params: p });
//       setExpenses(r.data);
//     } catch { toast.error('Failed to load expenses'); }
//   }, [search, filterCat]);

//   useEffect(() => { fetchStats(); }, [fetchStats]);
//   useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

//   // ── CRUD ──
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!form.title || !form.amount) return toast.error('Title and amount required');
//     try {
//       if (editId) {
//         await API.put(`/expenses/${editId}`, form);
//         toast.success('Expense updated!');
//       } else {
//         await API.post('/expenses', form);
//         toast.success('Expense added!');
//       }
//       setForm(empty); setEditId(null); setShowForm(false);
//       fetchExpenses(); fetchStats();
//     } catch { toast.error('Failed to save'); }
//   };

//   const handleEdit = (exp) => {
//     setForm({
//       title: exp.title, amount: exp.amount,
//       category: exp.category,
//       paymentMethod: exp.paymentMethod || 'Cash',
//       notes: exp.notes || '',
//       expenseDate: exp.expenseDate?.slice(0, 10) || ''
//     });
//     setEditId(exp._id);
//     setShowForm(true);
//     setView('expenses');
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm('Delete this expense?')) return;
//     try {
//       await API.delete(`/expenses/${id}`);
//       toast.success('Deleted');
//       fetchExpenses(); fetchStats();
//     } catch { toast.error('Delete failed'); }
//   };

//   // ── Reusable components ──
//   const StatCard = ({ title, value, color, icon }) => (
//     <div style={{
//       background: bg, borderRadius: '14px', padding: '1.4rem 1.6rem',
//       flex: '1 1 180px',
//       borderLeft: `4px solid ${color}`,
//       border: `1px solid ${border}`,
//       boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
//     }}>
//       <div style={{ fontSize: '1.4rem', marginBottom: '0.3rem' }}>{icon}</div>
//       <div style={{ color: sub, fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</div>
//       <div style={{ fontSize: '1.7rem', fontWeight: '700', color: text }}>
//         {typeof value === 'number' ? `₹${value.toFixed(0)}` : value}
//       </div>
//     </div>
//   );

//   const TabBtn = ({ id, icon, label }) => (
//     <button onClick={() => setView(id)} style={{
//       padding: '0.5rem 1.2rem',
//       borderRadius: '8px', border: 'none', cursor: 'pointer',
//       fontWeight: '600', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem',
//       background: view === id ? (darkMode ? '#334155' : '#607274') : 'transparent',
//       color: view === id ? '#ffffff' : sub,
//       transition: 'all 0.2s'
//     }}>
//       <span>{icon}</span>{label}
//     </button>
//   );

//   return (
//     <div style={{ minHeight: '100vh', background: pageBg }}>

//       {/* ══════════════ TOP HEADER ══════════════ */}
//       <div style={{
//         background: bg, borderBottom: `1px solid ${border}`,
//         padding: '0 2rem', position: 'sticky', top: 0, zIndex: 100,
//         boxShadow: '0 1px 6px rgba(0,0,0,0.06)'
//       }}>
//         <div style={{
//           maxWidth: '1100px', margin: '0 auto',
//           display: 'flex', alignItems: 'center',
//           justifyContent: 'space-between',
//           height: '60px', gap: '1rem'
//         }}>
//           {/* Left: brand + tabs */}
//           <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
//             <span style={{ fontWeight: '700', fontSize: '1.1rem', color: text, whiteSpace: 'nowrap' }}>
//               ExpenseTracker
//             </span>
//             <div style={{
//               display: 'flex', gap: '0.2rem',
//               background: darkMode ? '#0f172a' : '#f1f5f9',
//               borderRadius: '10px', padding: '0.25rem'
//             }}>
//               <TabBtn id="dashboard" label="Dashboard" />
//               <TabBtn id="expenses" label="Expenses" />
//             </div>
//           </div>

//           {/* Right: name + dark mode + add + logout */}
//           <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
//             <span style={{ color: sub, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
//               Hi {user?.name}
//             </span>

//             {/* Dark mode toggle */}
//             <button onClick={toggleDarkMode} title="Toggle theme" style={{
//               background: darkMode ? '#334155' : '#e2e8f0',
//               border: 'none', borderRadius: '20px',
//               padding: '0.35rem 0.8rem',
//               cursor: 'pointer', fontSize: '0.85rem', color: text,
//               display: 'flex', alignItems: 'center', gap: '0.3rem'
//             }}>
//               {/* {darkMode ? 'Dark' : 'Light'} */}
//               {darkMode ? '☀️' : '🌙'}
//             </button>

//             {/* Add Expense */}
//             <button onClick={() => {
//               setForm(empty); setEditId(null);
//               setShowForm(true); setView('expenses');
//               window.scrollTo({ top: 0, behavior: 'smooth' });
//             }} style={{
//               background: '#76885B', color: '#fff',
//               border: 'none', borderRadius: '8px',
//               padding: '0.45rem 1rem',
//               fontWeight: '600', cursor: 'pointer',
//               fontSize: '0.85rem', whiteSpace: 'nowrap'
//             }}>
//               + Add Expense
//             </button>

//             {/* Logout */}
//             <button onClick={logout} style={{
//               background: darkMode ? '#dc2626' : '#ef4444',
//               color: '#fff', border: 'none', borderRadius: '8px',
//               padding: '0.45rem 0.9rem',
//               fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem'
//             }}>
//               Logout
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* ══════════════ PAGE BODY ══════════════ */}
//       <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem' }}>

//         {/* ────────────── DASHBOARD VIEW ────────────── */}
//         {view === 'dashboard' && (
//           <>
//             {!stats
//               ? <div style={{ textAlign: 'center', padding: '4rem', color: sub }}>Loading...</div>
//               : <>
//                 {/* Stat Cards */}
//                 <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
//                   <StatCard title="Total Expenses" value={stats.total} color="#76885B" />
//                   <StatCard title="This Month" value={stats.monthly} color="#607274" />
//                   <StatCard title="Recent Transactions" value={stats.recent.length} color="#B19470" />
//                 </div>

//                 {/* Charts */}
//                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '0.5rem' }}>

//                   {/* Pie */}
//                   {/* <div style={{ background: bg, borderRadius: '14px', padding: '1.5rem', border: `1px solid ${border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
//                     <h3 style={{ color: sub, fontSize: '0.9rem', fontWeight: '600', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category Breakdown</h3>
//                     {Object.keys(stats.categoryBreakdown).length === 0
//                       ? <div style={{ textAlign: 'center', color: sub, padding: '2rem' }}>No data yet</div>
//                       : <ResponsiveContainer width="100%" height={220}>
//                         <PieChart>
//                           <Pie
//                             data={Object.entries(stats.categoryBreakdown).map(([name, value]) => ({ name, value }))}
//                             dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} paddingAngle={3}>
//                             {Object.keys(stats.categoryBreakdown).map((_, i) => (
//                               <Cell key={i} fill={COLORS[i % COLORS.length]} />
//                             ))}
//                           </Pie>
//                           <Tooltip formatter={(v) => `₹${v}`} contentStyle={tip} />
//                         </PieChart>
//                       </ResponsiveContainer>
//                     }
//                   </div> */}

//                   {/* Bar */}
//                   {/* <div style={{ background: bg, borderRadius: '14px', padding: '1.5rem', border: `1px solid ${border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
//                     <h3 style={{ color: sub, fontSize: '0.9rem', fontWeight: '600', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recent Expenses</h3>
//                     {stats.recent.length === 0
//                       ? <div style={{ textAlign: 'center', color: sub, padding: '2rem' }}>No data yet</div>
//                       : <ResponsiveContainer width="100%" height={220}>
//                         <BarChart data={stats.recent.map(e => ({ name: e.title.slice(0, 8), amount: e.amount }))}>
//                           <CartesianGrid strokeDasharray="3 3" stroke={border} />
//                           <XAxis dataKey="name" tick={{ fill: sub, fontSize: 11 }} />
//                           <YAxis tick={{ fill: sub, fontSize: 11 }} />
//                           <Tooltip formatter={(v) => `₹${v}`} contentStyle={tip} />
//                           <Bar dataKey="amount" fill="#76885B" radius={[6, 6, 0, 0]} />
//                         </BarChart>
//                       </ResponsiveContainer>
//                     }
//                   </div> */}

//                   {/* Line */}
//                   {/* <div style={{ background: bg, borderRadius: '14px', padding: '1.5rem', border: `1px solid ${border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.05)', gridColumn: 'span 2' }}>
//                     <h3 style={{ color: sub, fontSize: '0.9rem', fontWeight: '600', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Monthly Trend</h3>
//                     <ResponsiveContainer width="100%" height={220}>
//                       <LineChart data={stats.monthlyTrend}>
//                         <CartesianGrid strokeDasharray="3 3" stroke={border} />
//                         <XAxis dataKey="month" tick={{ fill: sub, fontSize: 11 }} />
//                         <YAxis tick={{ fill: sub, fontSize: 11 }} />
//                         <Tooltip formatter={(v) => `₹${v}`} contentStyle={tip} />
//                         <Legend />
//                         <Line type="monotone" dataKey="amount" stroke="#607274" strokeWidth={2.5} dot={{ fill: '#607274', r: 4 }} name="Expenses" />
//                       </LineChart>
//                     </ResponsiveContainer>
//                   </div> */}
//                 </div>

//                 {/* Recent Transactions */}
//                 {/* <div style={{ background: bg, borderRadius: '14px', overflow: 'hidden', border: `1px solid ${border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
//                   <div style={{ padding: '1rem 1.5rem', borderBottom: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                     <h3 style={{ color: sub, fontSize: '0.9rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recent Transactions</h3>
//                     <button onClick={() => setView('expenses')} style={{
//                       background: 'transparent', border: `1px solid ${border}`,
//                       color: sub, padding: '0.3rem 0.8rem',
//                       borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem'
//                     }}>View All →</button>
//                   </div>
//                   {stats.recent.length === 0
//                     ? <div style={{ padding: '2rem', textAlign: 'center', color: sub }}>No transactions yet. Add your first expense!</div>
//                     : stats.recent.map((exp, i) => (
//                       <div key={exp._id} style={{
//                         display: 'flex', justifyContent: 'space-between', alignItems: 'center',
//                         padding: '0.9rem 1.5rem',
//                         borderBottom: i < stats.recent.length - 1 ? `1px solid ${border}` : 'none',
//                         flexWrap: 'wrap', gap: '0.5rem'
//                       }}>
//                         <div>
//                           <div style={{ color: text, fontWeight: '500' }}>{exp.title}</div>
//                           <div style={{ fontSize: '0.78rem', color: sub, marginTop: '0.1rem' }}>
//                             <span style={{ background: darkMode ? '#334155' : '#f1f5f9', padding: '0.1rem 0.45rem', borderRadius: '4px', marginRight: '0.4rem' }}>{exp.category}</span>
//                             {exp.paymentMethod || 'Cash'} · {new Date(exp.expenseDate).toLocaleDateString()}
//                           </div>
//                         </div>
//                         <span style={{ color: '#dc2626', fontWeight: '700', fontSize: '1rem' }}>₹{exp.amount}</span>
//                       </div>
//                     ))
//                   }
//                 </div> */}
//                 {/* Charts */}
//                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>

//                   {/* Pie */}
//                   <div style={{ background: bg, borderRadius: '14px', padding: '1.5rem', border: `1px solid ${border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
//                     <h3 style={{ color: sub, fontSize: '0.9rem', fontWeight: '600', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category Breakdown</h3>
//                     {Object.keys(stats.categoryBreakdown).length === 0
//                       ? <div style={{ textAlign: 'center', color: sub, padding: '2rem' }}>No data yet</div>
//                       : <ResponsiveContainer width="100%" height={220}>
//                         <PieChart>
//                           <Pie
//                             data={Object.entries(stats.categoryBreakdown).map(([name, value]) => ({ name, value }))}
//                             dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} paddingAngle={3}>
//                             {Object.keys(stats.categoryBreakdown).map((_, i) => (
//                               <Cell key={i} fill={COLORS[i % COLORS.length]} />
//                             ))}
//                           </Pie>
//                           <Tooltip formatter={(v) => `₹${v}`} contentStyle={tip} />
//                         </PieChart>
//                       </ResponsiveContainer>
//                     }
//                   </div>

//                   {/* Bar */}
//                   <div style={{ background: bg, borderRadius: '14px', padding: '1.5rem', border: `1px solid ${border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
//                     <h3 style={{ color: sub, fontSize: '0.9rem', fontWeight: '600', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recent Expenses</h3>
//                     {stats.recent.length === 0
//                       ? <div style={{ textAlign: 'center', color: sub, padding: '2rem' }}>No data yet</div>
//                       : <ResponsiveContainer width="100%" height={220}>
//                         <BarChart data={stats.recent.map(e => ({ name: e.title.slice(0, 8), amount: e.amount }))}>
//                           <CartesianGrid strokeDasharray="3 3" stroke={border} />
//                           <XAxis dataKey="name" tick={{ fill: sub, fontSize: 11 }} />
//                           <YAxis tick={{ fill: sub, fontSize: 11 }} />
//                           <Tooltip formatter={(v) => `₹${v}`} contentStyle={tip} />
//                           <Bar dataKey="amount" fill="#76885B" radius={[6, 6, 0, 0]} />
//                         </BarChart>
//                       </ResponsiveContainer>
//                     }
//                   </div>
//                 </div>

//                 {/* ── Monthly Trend + Recent Transactions side by side ── */}
//                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>

//                   {/* Line Chart */}
//                   <div style={{ background: bg, borderRadius: '14px', padding: '1.5rem', border: `1px solid ${border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
//                     <h3 style={{ color: sub, fontSize: '0.9rem', fontWeight: '600', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Monthly Trend</h3>
//                     <ResponsiveContainer width="100%" height={260}>
//                       <LineChart data={stats.monthlyTrend}>
//                         <CartesianGrid strokeDasharray="3 3" stroke={border} />
//                         <XAxis dataKey="month" tick={{ fill: sub, fontSize: 11 }} />
//                         <YAxis tick={{ fill: sub, fontSize: 11 }} />
//                         <Tooltip formatter={(v) => `₹${v}`} contentStyle={tip} />
//                         <Legend />
//                         <Line type="monotone" dataKey="amount" stroke="#607274" strokeWidth={2.5} dot={{ fill: '#607274', r: 4 }} name="Expenses" />
//                       </LineChart>
//                     </ResponsiveContainer>
//                   </div>

//                   {/* Recent Transactions */}
//                   <div style={{ background: bg, borderRadius: '14px', overflow: 'hidden', border: `1px solid ${border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
//                     <div style={{ padding: '1rem 1.5rem', borderBottom: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                       <h3 style={{ color: sub, fontSize: '0.9rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recent Transactions</h3>
//                       <button onClick={() => setView('expenses')} style={{
//                         background: 'transparent', border: `1px solid ${border}`,
//                         color: sub, padding: '0.3rem 0.8rem',
//                         borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem'
//                       }}>View All →</button>
//                     </div>
//                     <div style={{ flex: 1, overflowY: 'auto' }}>
//                       {stats.recent.length === 0
//                         ? <div style={{ padding: '2rem', textAlign: 'center', color: sub }}>No transactions yet.</div>
//                         : stats.recent.map((exp, i) => (
//                           <div key={exp._id} style={{
//                             display: 'flex', justifyContent: 'space-between', alignItems: 'center',
//                             padding: '0.9rem 1.5rem',
//                             borderBottom: i < stats.recent.length - 1 ? `1px solid ${border}` : 'none',
//                             gap: '0.5rem'
//                           }}>
//                             <div style={{ minWidth: 0, flex: 1 }}>
//                               <div style={{ color: text, fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exp.title}</div>
//                               <div style={{ fontSize: '0.78rem', color: sub, marginTop: '0.15rem', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
//                                 <span style={{ background: darkMode ? '#334155' : '#f1f5f9', padding: '0.1rem 0.45rem', borderRadius: '4px' }}>{exp.category}</span>
//                                 <span>{new Date(exp.expenseDate).toLocaleDateString()}</span>
//                               </div>
//                             </div>
//                             <span style={{ color: '#dc2626', fontWeight: '700', fontSize: '1rem', whiteSpace: 'nowrap' }}>₹{exp.amount}</span>
//                           </div>
//                         ))
//                       }
//                     </div>
//                   </div>

//                 </div>
//               </>
//             }
//           </>
//         )}

//         {/* ────────────── EXPENSES VIEW ────────────── */}
//         {view === 'expenses' && (
//           <>
//             {/* Add / Edit Form */}
//             {showForm && (
//               <div style={{ background: bg, borderRadius: '14px', padding: '1.5rem', marginBottom: '1.5rem', border: `1px solid ${border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
//                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
//                   <h3 style={{ color: text, fontWeight: '700', fontSize: '1rem' }}>
//                     {editId ? '✏️ Edit Expense' : '➕ New Expense'}
//                   </h3>
//                   <button onClick={() => { setShowForm(false); setForm(empty); setEditId(null); }} style={{
//                     background: 'transparent', border: 'none', color: sub, fontSize: '1.3rem', cursor: 'pointer'
//                   }}>✕</button>
//                 </div>

//                 <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
//                   <div>
//                     <label style={{ display: 'block', marginBottom: '0.35rem', color: sub, fontSize: '0.82rem', fontWeight: '500' }}>Title *</label>
//                     <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required style={inp} placeholder="e.g. Zomato Order" />
//                   </div>
//                   <div>
//                     <label style={{ display: 'block', marginBottom: '0.35rem', color: sub, fontSize: '0.82rem', fontWeight: '500' }}>Amount (₹) *</label>
//                     <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required min="0" style={inp} placeholder="e.g. 320" />
//                   </div>
//                   <div>
//                     <label style={{ display: 'block', marginBottom: '0.35rem', color: sub, fontSize: '0.82rem', fontWeight: '500' }}>Category</label>
//                     <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={inp}>
//                       {CATEGORIES.map(c => <option key={c}>{c}</option>)}
//                     </select>
//                   </div>
//                   <div>
//                     <label style={{ display: 'block', marginBottom: '0.35rem', color: sub, fontSize: '0.82rem', fontWeight: '500' }}>Payment Method</label>
//                     <select value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })} style={inp}>
//                       {PAYMENT_METHODS.map(p => <option key={p}>{p}</option>)}
//                     </select>
//                   </div>
//                   <div>
//                     <label style={{ display: 'block', marginBottom: '0.35rem', color: sub, fontSize: '0.82rem', fontWeight: '500' }}>Date</label>
//                     <input type="date" value={form.expenseDate} onChange={e => setForm({ ...form, expenseDate: e.target.value })} style={inp} />
//                   </div>
//                   <div>
//                     <label style={{ display: 'block', marginBottom: '0.35rem', color: sub, fontSize: '0.82rem', fontWeight: '500' }}>Notes</label>
//                     <input type="text" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={inp} placeholder="Optional..." />
//                   </div>
//                   <div style={{ gridColumn: 'span 2', display: 'flex', gap: '0.75rem' }}>
//                     <button type="submit" style={{ flex: 1, padding: '0.7rem', background: '#607274', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.95rem' }}>
//                       {editId ? '✔ Update' : '✔ Add Expense'}
//                     </button>
//                     <button type="button" onClick={() => { setShowForm(false); setForm(empty); setEditId(null); }} style={{ padding: '0.7rem 1.2rem', background: 'transparent', color: sub, border: `1px solid ${border}`, borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>
//                       Cancel
//                     </button>
//                   </div>
//                 </form>
//               </div>
//             )}

//             {/* Search + Filter bar */}
//             <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
//               <input
//                 placeholder="🔍  Search by title or category..."
//                 value={search}
//                 onChange={e => setSearch(e.target.value)}
//                 style={{ ...inp, flex: 1, minWidth: '200px' }}
//               />
//               <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ ...inp, width: '150px' }}>
//                 {FILTER_CATS.map(c => <option key={c}>{c}</option>)}
//               </select>
//             </div>

//             {/* Count */}
//             <div style={{ color: sub, fontSize: '0.82rem', marginBottom: '0.75rem' }}>
//               Showing <strong style={{ color: text }}>{expenses.length}</strong> expense{expenses.length !== 1 ? 's' : ''}
//             </div>

//             {/* List */}
//             <div style={{ background: bg, borderRadius: '14px', overflow: 'hidden', border: `1px solid ${border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
//               {expenses.length === 0
//                 ? (
//                   <div style={{ padding: '4rem', textAlign: 'center', color: sub }}>
//                     <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📭</div>
//                     <div style={{ fontWeight: '500' }}>No expenses found</div>
//                     <div style={{ fontSize: '0.85rem', marginTop: '0.3rem' }}>Click "+ Add Expense" to get started</div>
//                   </div>
//                 )
//                 : expenses.map((exp, i) => (
//                   <div key={exp._id} style={{
//                     display: 'flex', justifyContent: 'space-between', alignItems: 'center',
//                     padding: '1rem 1.5rem',
//                     borderBottom: i < expenses.length - 1 ? `1px solid ${border}` : 'none',
//                     flexWrap: 'wrap', gap: '0.75rem'
//                   }}>
//                     <div style={{ minWidth: 0, flex: 1 }}>
//                       <div style={{ color: text, fontWeight: '600', marginBottom: '0.2rem' }}>{exp.title}</div>
//                       <div style={{ fontSize: '0.78rem', color: sub, display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
//                         <span style={{ background: darkMode ? '#334155' : '#f1f5f9', padding: '0.1rem 0.5rem', borderRadius: '4px' }}>{exp.category}</span>
//                         <span>{exp.paymentMethod || 'Cash'}</span>
//                         <span>·</span>
//                         <span>{new Date(exp.expenseDate).toLocaleDateString()}</span>
//                         {exp.notes && <span>· {exp.notes}</span>}
//                       </div>
//                     </div>
//                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
//                       <span style={{ color: '#dc2626', fontWeight: '700', fontSize: '1.05rem', minWidth: '75px', textAlign: 'right' }}>₹{exp.amount}</span>
//                       <button onClick={() => handleEdit(exp)} style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '0.35rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '500' }}>Edit</button>
//                       <button onClick={() => handleDelete(exp._id)} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '0.35rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '500' }}>Delete</button>
//                     </div>
//                   </div>
//                 ))
//               }
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }



//2 card in 2 rows
// import React, { useEffect, useState, useCallback } from 'react';
// import {
//   PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
//   BarChart, Bar, XAxis, YAxis, CartesianGrid,
//   LineChart, Line, Legend
// } from 'recharts';
// import API from '../api/axios';
// import { useAuth } from '../context/AuthContext';

// const COLORS = ['#76885B','#607274','#B19470','#E6A4B4','#8DDFCB','#D5B4B4','#9A8A78','#C7C8CC'];
// const CATEGORIES = ['All','Food','Transport','Shopping','Health','Entertainment','Bills','Education','Other'];

// export default function Dashboard() {
//   const { darkMode } = useAuth();
//   const [stats, setStats] = useState(null);
//   const [expenses, setExpenses] = useState([]);
//   const [search, setSearch] = useState('');
//   const [filterCat, setFilterCat] = useState('All');

//   const bg = darkMode ? '#1e293b' : '#ffffff';
//   const border = darkMode ? '#334155' : '#e2e8f0';
//   const text = darkMode ? '#e2e8f0' : '#334155';
//   const subText = darkMode ? '#94a3b8' : '#64748b';
//   const inputBg = darkMode ? '#0f172a' : '#f8fafc';

//   useEffect(() => {
//     API.get('/dashboard').then(res => setStats(res.data)).catch(console.error);
//   }, []);

//   const fetchExpenses = useCallback(async () => {
//     try {
//       const params = {};
//       if (search) params.search = search;
//       if (filterCat !== 'All') params.category = filterCat;
//       const res = await API.get('/expenses', { params });
//       setExpenses(res.data);
//     } catch (err) {
//       console.error(err);
//     }
//   }, [search, filterCat]);

//   useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

//   if (!stats) return <div style={{ padding: '2rem', textAlign: 'center', color: subText }}>Loading...</div>;

//   const pieData = Object.entries(stats.categoryBreakdown).map(([name, value]) => ({ name, value }));

//   const card = (title, value, color) => (
//     <div style={{ background: bg, border: `1px solid ${color}40`, borderRadius: '12px', padding: '1.5rem', flex: '1 1 200px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
//       <div style={{ color: subText, fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: '500' }}>{title}</div>
//       <div style={{ fontSize: '2rem', fontWeight: 'bold', color: text }}>
//         {typeof value === 'number' ? `₹${value.toFixed(2)}` : value}
//       </div>
//     </div>
//   );

//   const inputStyle = { padding: '0.6rem', background: inputBg, border: `1px solid ${border}`, borderRadius: '6px', color: text, fontSize: '0.9rem' };
//   const chartTooltip = { background: bg, border: `1px solid ${border}`, borderRadius: '8px', color: text };
//   const axisColor = subText;

//   return (
//     <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
//       <h1 style={{ marginBottom: '1.5rem', color: text, fontWeight: '600' }}>Dashboard</h1>

//       {/* Summary Cards */}
//       <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
//         {card('Total Expenses', stats.total, '#76885B')}
//         {card('This Month', stats.monthly, '#607274')}
//         {card('Recent Transactions', stats.recent.length, '#B19470')}
//       </div>

//       {/* Charts Row */}
//       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>

//         {/* Pie Chart */}
//         <div style={{ background: bg, borderRadius: '12px', padding: '1.5rem', border: `1px solid ${border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
//           <h3 style={{ marginBottom: '1rem', color: subText, fontSize: '1rem', fontWeight: '600' }}>Category-wise Expenses</h3>
//           <ResponsiveContainer width="100%" height={220}>
//             <PieChart>
//               <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
//                 {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
//               </Pie>
//               <Tooltip formatter={(v) => `₹${v}`} contentStyle={chartTooltip} />
//             </PieChart>
//           </ResponsiveContainer>
//         </div>

//         {/* Bar Chart */}
//         <div style={{ background: bg, borderRadius: '12px', padding: '1.5rem', border: `1px solid ${border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
//           <h3 style={{ marginBottom: '1rem', color: subText, fontSize: '1rem', fontWeight: '600' }}>Recent Expenses</h3>
//           <ResponsiveContainer width="100%" height={220}>
//             <BarChart data={stats.recent.map(e => ({ name: e.title.slice(0, 10), amount: e.amount }))}>
//               <CartesianGrid strokeDasharray="3 3" stroke={border} />
//               <XAxis dataKey="name" tick={{ fill: axisColor, fontSize: 11 }} />
//               <YAxis tick={{ fill: axisColor, fontSize: 11 }} />
//               <Tooltip formatter={(v) => `₹${v}`} contentStyle={chartTooltip} />
//               <Bar dataKey="amount" fill="#76885B" radius={[4, 4, 0, 0]} />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>

//         {/* Line Chart — Monthly Trend */}
//         <div style={{ background: bg, borderRadius: '12px', padding: '1.5rem', border: `1px solid ${border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', gridColumn: 'span 2' }}>
//           <h3 style={{ marginBottom: '1rem', color: subText, fontSize: '1rem', fontWeight: '600' }}>Monthly Expense Trend</h3>
//           <ResponsiveContainer width="100%" height={220}>
//             <LineChart data={stats.monthlyTrend}>
//               <CartesianGrid strokeDasharray="3 3" stroke={border} />
//               <XAxis dataKey="month" tick={{ fill: axisColor, fontSize: 11 }} />
//               <YAxis tick={{ fill: axisColor, fontSize: 11 }} />
//               <Tooltip formatter={(v) => `₹${v}`} contentStyle={chartTooltip} />
//               <Legend />
//               <Line type="monotone" dataKey="amount" stroke="#607274" strokeWidth={2} dot={{ fill: '#607274' }} name="Expenses" />
//             </LineChart>
//           </ResponsiveContainer>
//         </div>
//       </div>

//       {/* Search + Filter */}
//       <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
//         <input
//           placeholder="Search expenses by title or category..."
//           value={search}
//           onChange={e => setSearch(e.target.value)}
//           style={{ ...inputStyle, flex: 1, minWidth: '200px' }}
//         />
//         <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ ...inputStyle, width: '160px' }}>
//           {CATEGORIES.map(c => <option key={c}>{c}</option>)}
//         </select>
//       </div>

//       {/* Expense History Table */}
//       <div style={{ background: bg, borderRadius: '12px', overflow: 'hidden', border: `1px solid ${border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
//         <div style={{ padding: '1rem 1.5rem', borderBottom: `1px solid ${border}` }}>
//           <h3 style={{ color: subText, fontSize: '1rem', fontWeight: '600' }}>Expense History</h3>
//         </div>
//         {expenses.length === 0
//           ? <div style={{ padding: '2rem', textAlign: 'center', color: subText }}>No expenses found.</div>
//           : expenses.map((exp, i) => (
//             <div key={exp._id} style={{
//               display: 'flex', justifyContent: 'space-between', alignItems: 'center',
//               padding: '1rem 1.5rem', borderBottom: i < expenses.length - 1 ? `1px solid ${border}` : 'none',
//               flexWrap: 'wrap', gap: '0.5rem'
//             }}>
//               <div style={{ minWidth: 0, flex: 1 }}>
//                 <div style={{ color: text, fontWeight: '500' }}>{exp.title}</div>
//                 <div style={{ fontSize: '0.8rem', color: subText }}>
//                   {exp.category} · {exp.paymentMethod} · {new Date(exp.expenseDate).toLocaleDateString()}
//                   {exp.notes && ` · ${exp.notes}`}
//                 </div>
//               </div>
//               <span style={{ color: darkMode ? '#f87171' : '#475569', fontWeight: 'bold', fontSize: '1.05rem' }}>₹{exp.amount}</span>
//             </div>
//           ))
//         }
//       </div>
//     </div>
//   );
// }