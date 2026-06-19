import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { UserPlus, Eye, EyeOff, Zap } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username:'', email:'', password:'', confirm:'', role:'user', rollno:'' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = 'Username required';
    else if (form.username.length < 3) e.username = 'At least 3 characters';
    if (!form.email.trim()) e.email = 'Email required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password required';
    else if (form.password.length < 6) e.password = 'At least 6 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    return e;
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await register(form.username, form.email, form.password, form.role, form.rollno);
      navigate('/');
    } catch (err) {
      setErrors({ general: err.response?.data?.error || 'Registration failed' });
    } finally { setLoading(false); }
  };

  const set = (k, v) => { setForm(p => ({...p, [k]: v})); setErrors(p => ({...p, [k]: ''})); };

  return (
    <div className="auth-page">
      <div className="auth-left" style={{ background:'linear-gradient(135deg,#059669,#0891b2)' }}>
        <div className="auth-brand">
          <div className="auth-brand-icon"><Zap size={24} /></div>
          <span className="auth-brand-name">Quizly</span>
        </div>
        <div className="auth-left-content">
          <h1>Join Quizly today!</h1>
          <p>Create your free account and start taking quizzes on hundreds of topics.</p>
          <div className="auth-features">
            {['Free account forever', 'Access all published quizzes', 'Track your learning progress'].map(f => (
              <div key={f} className="auth-feature-item">
                <div className="auth-feature-dot" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card fade-in">
          <div className="auth-card-header">
            <h2>Create Account</h2>
            <p>Choose a role below. Admin access is available only when you explicitly select Admin.</p>
          </div>

          {errors.general && <div className="alert alert-error" style={{ marginBottom:16 }}>{errors.general}</div>}

          <form onSubmit={submit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Username</label>
              <input value={form.username} onChange={e => set('username', e.target.value)}
                className={`form-input ${errors.username ? 'error' : ''}`} placeholder="johndoe" />
              {errors.username && <span className="form-error">{errors.username}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                className={`form-input ${errors.email ? 'error' : ''}`} placeholder="you@example.com" />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="pw-wrap">
                <input type={showPw ? 'text' : 'password'} value={form.password}
                  onChange={e => set('password', e.target.value)}
                  className={`form-input ${errors.password ? 'error' : ''}`} placeholder="Min 6 characters" />
                <button type="button" className="pw-eye" onClick={() => setShowPw(!showPw)}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input type={showPw ? 'text' : 'password'} value={form.confirm}
                onChange={e => set('confirm', e.target.value)}
                className={`form-input ${errors.confirm ? 'error' : ''}`} placeholder="Repeat password" />
              {errors.confirm && <span className="form-error">{errors.confirm}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Roll Number</label>
              <input value={form.rollno} onChange={e => set('rollno', e.target.value)}
                className="form-input" placeholder="e.g. 2024CS001" />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select value={form.role} onChange={e => set('role', e.target.value)} className="form-input">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width:'100%' }} disabled={loading}>
              {loading ? <><div className="spinner" />Creating account...</> : <><UserPlus size={16} />Create Account</>}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
          </p>
          <p className="auth-switch" style={{ marginTop:4 }}>
            <Link to="/" className="auth-link">← Back to Home</Link>
          </p>
        </div>
      </div>

      <style>{`
        .auth-page { display:flex; min-height:100vh; }
        .auth-left { width:420px; padding:40px; display:flex; flex-direction:column; color:white; flex-shrink:0; }
        .auth-brand { display:flex; align-items:center; gap:10px; margin-bottom:auto; }
        .auth-brand-icon { width:40px; height:40px; background:rgba(255,255,255,.2); border-radius:10px; display:flex; align-items:center; justify-content:center; }
        .auth-brand-name { font-size:1.4rem; font-weight:800; }
        .auth-left-content { padding:40px 0; }
        .auth-left-content h1 { font-size:2rem; font-weight:800; margin-bottom:16px; line-height:1.2; }
        .auth-left-content p { opacity:.85; font-size:.95rem; margin-bottom:32px; }
        .auth-features { display:flex; flex-direction:column; gap:12px; }
        .auth-feature-item { display:flex; align-items:center; gap:12px; font-size:.9rem; }
        .auth-feature-dot { width:8px; height:8px; border-radius:50%; background:rgba(255,255,255,.6); flex-shrink:0; }
        .auth-right { flex:1; display:flex; align-items:center; justify-content:center; padding:40px 20px; background:#f8fafc; }
        .auth-card { background:white; border-radius:var(--radius-lg); padding:36px; width:100%; max-width:440px; box-shadow:var(--shadow-lg); border:1px solid var(--gray-200); }
        .auth-card-header { margin-bottom:24px; }
        .auth-card-header h2 { font-size:1.5rem; font-weight:800; }
        .auth-card-header p  { color:var(--gray-500); font-size:.9rem; margin-top:4px; }
        .auth-form { display:flex; flex-direction:column; gap:16px; margin-bottom:20px; }
        .pw-wrap { position:relative; }
        .pw-wrap .form-input { padding-right:44px; }
        .pw-eye { position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; color:var(--gray-400); cursor:pointer; padding:4px; }
        .auth-switch { text-align:center; font-size:.875rem; color:var(--gray-500); }
        .auth-link { color:var(--primary); font-weight:600; }
        .auth-link:hover { text-decoration:underline; }
        @media (max-width:768px) { .auth-left { display:none; } .auth-card { padding:28px 20px; } }
      `}</style>
    </div>
  );
}
