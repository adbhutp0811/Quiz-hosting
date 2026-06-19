import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { LogIn, Eye, EyeOff, Zap } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) { setError('Both fields are required'); return; }
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-brand-icon"><Zap size={24} /></div>
          <span className="auth-brand-name">Quizly</span>
        </div>
        <div className="auth-left-content">
          <h1>Welcome back!</h1>
          <p>Sign in to access your quizzes, track your progress, and challenge yourself with new topics.</p>
          <div className="auth-features">
            {['Take quizzes on any topic', 'Track your scores and progress', 'Compete and improve daily'].map(f => (
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
            <h2>Sign In</h2>
            <p>Enter your credentials to continue</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={submit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))}
                className="form-input" placeholder="you@example.com" autoComplete="email" />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="pw-wrap">
                <input type={showPw ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm(p => ({...p, password: e.target.value}))}
                  className="form-input" placeholder="••••••••" autoComplete="current-password" />
                <button type="button" className="pw-eye" onClick={() => setShowPw(!showPw)}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width:'100%' }} disabled={loading}>
              {loading ? <><div className="spinner" />Signing in...</> : <><LogIn size={16} />Sign In</>}
            </button>
          </form>

          <p className="auth-switch">
            {"Don't have an account? "}<Link to="/register" className="auth-link">Create one free</Link>
          </p>
          <p className="auth-switch" style={{ marginTop: 4 }}>
            <Link to="/" className="auth-link">← Back to Home</Link>
          </p>
        </div>
      </div>

      <style>{`
        .auth-page { display:flex; min-height:100vh; }
        .auth-left { width:420px; background:linear-gradient(135deg,#4f46e5,#7c3aed); padding:40px; display:flex; flex-direction:column; color:white; flex-shrink:0; }
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
        .auth-card-header h2 { font-size:1.5rem; font-weight:800; color:var(--gray-900); }
        .auth-card-header p  { color:var(--gray-500); font-size:.9rem; margin-top:4px; }
        .auth-form { display:flex; flex-direction:column; gap:16px; margin-bottom:20px; }
        .pw-wrap { position:relative; }
        .pw-wrap .form-input { padding-right:44px; }
        .pw-eye { position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; color:var(--gray-400); cursor:pointer; padding:4px; }
        .auth-switch { text-align:center; font-size:.875rem; color:var(--gray-500); }
        .auth-link { color:var(--primary); font-weight:600; }
        .auth-link:hover { text-decoration:underline; }
        @media (max-width:768px) {
          .auth-left { display:none; }
          .auth-card { padding:28px 20px; }
        }
      `}</style>
    </div>
  );
}
