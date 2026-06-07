// import React, { useEffect, useState, useCallback } from 'react';
// import API from '../api/axios';
// import toast from 'react-hot-toast';
// import { useAuth } from '../context/AuthContext';

// const CATEGORIES = ['Food','Transport','Shopping','Health','Entertainment','Bills','Education','Other'];
// const PAYMENT_METHODS = ['Cash','Card','UPI','Net Banking','Other'];
// const empty = { title: '', amount: '', category: 'Other', paymentMethod: 'Cash', notes: '', expenseDate: '' };

// export default function Expenses() {
//   const { darkMode } = useAuth();
//   const [expenses, setExpenses] = useState([]);
//   const [form, setForm] = useState(empty);
//   const [editId, setEditId] = useState(null);
//   const [search, setSearch] = useState('');
//   const [filterCat, setFilterCat] = useState('All');
//   const [showForm, setShowForm] = useState(false);

//   const bg = darkMode ? '#1e293b' : '#ffffff';
//   const border = darkMode ? '#334155' : '#e2e8f0';
//   const text = darkMode ? '#e2e8f0' : '#334155';
//   const subText = darkMode ? '#94a3b8' : '#64748b';
//   const inputBg = darkMode ? '#0f172a' : '#f8fafc';

//   const inputStyle = { width: '100%', padding: '0.6rem', background: inputBg, border: `1px solid ${border}`, borderRadius: '6px', color: text };

//   const fetchExpenses = useCallback(async () => {
//     try {
//       const params = {};
//       if (search) params.search = search;
//       if (filterCat !== 'All') params.category = filterCat;
//       const res = await API.get('/expenses', { params });
//       setExpenses(res.data);
//     } catch { toast.error('Failed to fetch expenses'); }
//   }, [search, filterCat]);

//   useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!form.title || !form.amount) return toast.error('Title and amount required');
//     try {
//       if (editId) {
//         await API.put(`/expenses/${editId}`, form);
//         toast.success('Updated!');
//       } else {
//         await API.post('/expenses', form);
//         toast.success('Added!');
//       }
//       setForm(empty); setEditId(null); setShowForm(false);
//       fetchExpenses();
//     } catch { toast.error('Failed to save expense'); }
//   };

//   const handleEdit = (exp) => {
//     setForm({
//       title: exp.title, amount: exp.amount, category: exp.category,
//       paymentMethod: exp.paymentMethod || 'Cash',
//       notes: exp.notes || '',
//       expenseDate: exp.expenseDate?.slice(0, 10) || ''
//     });
//     setEditId(exp._id);
//     setShowForm(true);
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm('Delete this expense?')) return;
//     try { await API.delete(`/expenses/${id}`); toast.success('Deleted'); fetchExpenses(); }
//     catch { toast.error('Delete failed'); }
//   };

//   return (
//     <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
//       {/* Header */}
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
//         <h1 style={{ color: text, fontWeight: '600' }}>Expenses</h1>
//         <button onClick={() => { setShowForm(!showForm); setForm(empty); setEditId(null); }}
//           style={{ background: '#76885B', color: '#fff', border: 'none', padding: '0.5rem 1.2rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
//           {showForm ? 'Cancel' : '+ Add Expense'}
//         </button>
//       </div>

//       {/* Form */}
//       {showForm && (
//         <div style={{ background: bg, borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', border: `1px solid ${border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
//           <h3 style={{ marginBottom: '1rem', color: subText, fontWeight: '600' }}>{editId ? 'Edit Expense' : 'New Expense'}</h3>
//           <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>

//             <div>
//               <label style={{ display: 'block', marginBottom: '0.3rem', color: subText, fontSize: '0.85rem' }}>Title *</label>
//               <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required style={inputStyle} />
//             </div>

//             <div>
//               <label style={{ display: 'block', marginBottom: '0.3rem', color: subText, fontSize: '0.85rem' }}>Amount (₹) *</label>
//               <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required style={inputStyle} />
//             </div>

//             <div>
//               <label style={{ display: 'block', marginBottom: '0.3rem', color: subText, fontSize: '0.85rem' }}>Category</label>
//               <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={inputStyle}>
//                 {CATEGORIES.map(c => <option key={c}>{c}</option>)}
//               </select>
//             </div>

//             <div>
//               <label style={{ display: 'block', marginBottom: '0.3rem', color: subText, fontSize: '0.85rem' }}>Payment Method</label>
//               <select value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })} style={inputStyle}>
//                 {PAYMENT_METHODS.map(p => <option key={p}>{p}</option>)}
//               </select>
//             </div>

//             <div>
//               <label style={{ display: 'block', marginBottom: '0.3rem', color: subText, fontSize: '0.85rem' }}>Date</label>
//               <input type="date" value={form.expenseDate} onChange={e => setForm({ ...form, expenseDate: e.target.value })} style={inputStyle} />
//             </div>

//             <div>
//               <label style={{ display: 'block', marginBottom: '0.3rem', color: subText, fontSize: '0.85rem' }}>Notes</label>
//               <input type="text" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={inputStyle} />
//             </div>

//             <div style={{ display: 'flex', alignItems: 'flex-end', gridColumn: 'span 2' }}>
//               <button type="submit" style={{ width: '100%', padding: '0.65rem', background: '#607274', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
//                 {editId ? 'Update Expense' : 'Add Expense'}
//               </button>
//             </div>
//           </form>
//         </div>
//       )}

//       {/* Search + Filter */}
//       <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
//         <input placeholder="Search by title or category..." value={search} onChange={e => setSearch(e.target.value)}
//           style={{ ...inputStyle, flex: 1, minWidth: '200px' }} />
//         <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ ...inputStyle, width: '160px' }}>
//           <option>All</option>
//           {CATEGORIES.map(c => <option key={c}>{c}</option>)}
//         </select>
//       </div>

//       {/* List */}
//       <div style={{ background: bg, borderRadius: '12px', overflow: 'hidden', border: `1px solid ${border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
//         {expenses.length === 0
//           ? <div style={{ padding: '2rem', textAlign: 'center', color: subText }}>No expenses found.</div>
//           : expenses.map((exp, i) => (
//             <div key={exp._id} style={{
//               display: 'flex', justifyContent: 'space-between', alignItems: 'center',
//               padding: '1rem 1.5rem', borderBottom: i < expenses.length - 1 ? `1px solid ${border}` : 'none',
//               flexWrap: 'wrap', gap: '0.75rem'
//             }}>
//               <div style={{ minWidth: 0, flex: 1 }}>
//                 <div style={{ color: text, fontWeight: '500' }}>{exp.title}</div>
//                 <div style={{ fontSize: '0.8rem', color: subText }}>
//                   {exp.category} · {exp.paymentMethod} · {new Date(exp.expenseDate).toLocaleDateString()}
//                   {exp.notes && ` · ${exp.notes}`}
//                 </div>
//               </div>
//               <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
//                 <span style={{ color: darkMode ? '#f87171' : '#475569', fontWeight: 'bold', fontSize: '1.05rem' }}>₹{exp.amount}</span>
//                 <button onClick={() => handleEdit(exp)} style={{ background: '#16a34a', color: 'white', border: 'none', padding: '0.35rem 0.8rem', borderRadius: '5px', cursor: 'pointer', fontSize: '0.85rem' }}>Edit</button>
//                 <button onClick={() => handleDelete(exp._id)} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '0.35rem 0.8rem', borderRadius: '5px', cursor: 'pointer', fontSize: '0.85rem' }}>Delete</button>
//               </div>
//             </div>
//           ))
//         }
//       </div>
//     </div>
//   );
// }