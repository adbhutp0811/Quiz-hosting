import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../api/axios.js';
import { Users, Shield, Trash2, UserPlus, Search, Edit2, X, Check } from 'lucide-react';

export default function AdminUsers() {
  const { user: me } = useAuth();
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating]     = useState(false);
  const [newUser, setNewUser] = useState({ username:'', email:'', password:'', role:'user', rollno:'' });
  const [createErr, setCreateErr]   = useState('');
  const [actionId, setActionId]     = useState(null);

  const load = () => {
    setLoading(true);
    api.get('/admin/users').then(r => { setUsers(r.data); setLoading(false); });
  };
  useEffect(load, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this user and all their data?')) return;
    setActionId(id);
    await api.delete(`/admin/users/${id}`);
    setActionId(null);
    load();
  };

  const handleRoleToggle = async (id, currentRole) => {
    setActionId(id);
    await api.patch(`/admin/users/${id}/role`, { role: currentRole === 'admin' ? 'user' : 'admin' });
    setActionId(null);
    load();
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateErr('');
    if (!newUser.username || !newUser.email || !newUser.password) { setCreateErr('All fields required'); return; }
    setCreating(true);
    try {
      await api.post('/admin/users', newUser);
      setShowCreate(false);
      setNewUser({ username:'', email:'', password:'', role:'user', rollno:'' });
      load();
    } catch (err) {
      setCreateErr(err.response?.data?.error || 'Failed to create user');
    } finally { setCreating(false); }
  };

  const filtered = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const admins = users.filter(u => u.role === 'admin').length;
  const regular = users.filter(u => u.role === 'user').length;

  return (
    <div className="au-wrap fade-in">
      <div className="au-header">
        <div>
          <h1 className="au-title">Users</h1>
          <p className="au-sub">{admins} admin{admins !== 1 ? 's' : ''}, {regular} regular user{regular !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <UserPlus size={16} /> Add User
        </button>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontWeight:700 }}>Create New User</h2>
              <button className="btn btn-icon btn-ghost" onClick={() => setShowCreate(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body" style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                {createErr && <div className="alert alert-error">{createErr}</div>}
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input value={newUser.username} onChange={e => setNewUser(p => ({...p, username: e.target.value}))}
                    className="form-input" placeholder="username" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" value={newUser.email} onChange={e => setNewUser(p => ({...p, email: e.target.value}))}
                    className="form-input" placeholder="user@example.com" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input type="password" value={newUser.password} onChange={e => setNewUser(p => ({...p, password: e.target.value}))}
                    className="form-input" placeholder="Min 6 characters" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Roll Number</label>
                  <input value={newUser.rollno} onChange={e => setNewUser(p => ({...p, rollno: e.target.value}))}
                    className="form-input" placeholder="e.g. 2024CS001" />
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select value={newUser.role} onChange={e => setNewUser(p => ({...p, role: e.target.value}))} className="form-input">
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? <><div className="spinner" />Creating...</> : <><Check size={16} />Create User</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search */}
      <div style={{ position:'relative', maxWidth:'400px' }}>
        <Search size={16} style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'var(--gray-400)' }} />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search users..." className="form-input" style={{ paddingLeft:'38px' }} />
      </div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:'60px' }}>
          <div className="spinner spinner-dark" />
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Roll No</th>
                <th>Role</th>
                <th>Attempts</th>
                <th>Avg Score</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                      <div className="user-av" style={{ background: u.role === 'admin' ? 'var(--primary)' : 'var(--gray-200)', color: u.role === 'admin' ? 'white' : 'var(--gray-600)' }}>
                        {u.username[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight:600, color:'var(--gray-900)' }}>{u.username}</div>
                        {u.id === me?.id && <div style={{ fontSize:'.72rem', color:'var(--primary)' }}>You</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ color:'var(--gray-600)', fontSize:'.875rem' }}>{u.email}</td>
                  <td style={{ color:'var(--gray-600)', fontSize:'.875rem' }}>{u.rollno || '—'}</td>
                  <td>
                    <span className={`badge ${u.role === 'admin' ? 'badge-primary' : 'badge-gray'}`}>
                      {u.role === 'admin' ? <><Shield size={11} />Admin</> : 'User'}
                    </span>
                  </td>
                  <td style={{ fontWeight:600 }}>{u.attempt_count || 0}</td>
                  <td>{u.avg_score ? <span className="badge badge-success">{Math.round(u.avg_score)}%</span> : <span style={{ color:'var(--gray-400)' }}>—</span>}</td>
                  <td style={{ color:'var(--gray-500)', fontSize:'.82rem' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display:'flex', gap:'4px' }}>
                      {u.id !== me?.id && (
                        <>
                          <button className="btn btn-icon btn-ghost btn-sm"
                            onClick={() => handleRoleToggle(u.id, u.role)}
                            disabled={actionId === u.id}
                            data-tooltip={u.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}>
                            {actionId === u.id ? <div className="spinner spinner-dark" style={{width:12,height:12}} />
                              : <Shield size={14} style={{ color: u.role === 'admin' ? 'var(--warning)' : 'var(--primary)' }} />}
                          </button>
                          <button className="btn btn-icon btn-ghost btn-sm"
                            onClick={() => handleDelete(u.id)}
                            disabled={actionId === u.id}
                            data-tooltip="Delete User"
                            style={{ color:'var(--danger)' }}>
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        .au-wrap { display: flex; flex-direction: column; gap: 20px; }
        .au-header { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
        .au-title { font-size: 1.75rem; font-weight: 800; color: var(--gray-900); }
        .au-sub   { color: var(--gray-500); font-size: .875rem; }
        .user-av  { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: .8rem; font-weight: 700; flex-shrink: 0; }
      `}</style>
    </div>
  );
}
