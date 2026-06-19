import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/axios.js';
import { Trophy, BookOpen, BarChart2, ArrowRight, LogOut, Zap, Shield } from 'lucide-react';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api.get('/attempts/my/all')
      .then(r => setAttempts(r.data))
      .catch(() => setAttempts([]))
      .finally(() => setLoading(false));
  }, []);

  const avgScore = attempts.length ? Math.round(attempts.reduce((s, a) => s + a.percentage, 0) / attempts.length) : 0;
  const best     = attempts.length ? Math.max(...attempts.map(a => a.percentage)) : 0;

  return (
    <div style={{ minHeight:'100vh', background:'var(--gray-50)' }}>
      <nav style={{ background:'white', borderBottom:'1px solid var(--gray-200)', position:'sticky', top:0, zIndex:100, boxShadow:'var(--shadow-sm)' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 24px', height:64, display:'flex', alignItems:'center', gap:16 }}>
          <Link to="/" style={{ display:'flex', alignItems:'center', gap:10, fontWeight:800, fontSize:'1.1rem' }}>
            <div style={{ width:32, height:32, background:'var(--primary)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', color:'white' }}><Zap size={16}/></div>
            Quizly
          </Link>
          <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:8 }}>
            <Link to="/browse" className="btn btn-ghost btn-sm">Browse</Link>
            {user?.role === 'admin' && <Link to="/admin" className="btn btn-ghost btn-sm"><Shield size={14}/>Admin</Link>}
            <button className="btn btn-ghost btn-sm" onClick={() => { logout(); navigate('/'); }}>
              <LogOut size={14}/>Logout
            </button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'32px 24px' }}>
        <div style={{ marginBottom:32 }}>
          <h1 style={{ fontSize:'1.8rem', fontWeight:800 }}>Welcome back, {user?.username}!</h1>
          <p style={{ color:'var(--gray-500)', marginTop:4 }}>Track your quiz progress and results</p>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:16, marginBottom:32 }}>
          {[
            { icon:<BookOpen size={22}/>, label:'Quizzes Taken', value:attempts.length, color:'#6366f1', bg:'#e0e7ff' },
            { icon:<BarChart2 size={22}/>, label:'Average Score', value:`${avgScore}%`, color:'#10b981', bg:'#d1fae5' },
            { icon:<Trophy size={22}/>, label:'Best Score', value:`${best}%`, color:'#f59e0b', bg:'#fef3c7' },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding:'20px 24px', display:'flex', alignItems:'center', gap:16 }}>
              <div style={{ width:48, height:48, borderRadius:12, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', color:s.color, flexShrink:0 }}>{s.icon}</div>
              <div>
                <div style={{ fontSize:'1.5rem', fontWeight:900, color:'var(--gray-900)' }}>{s.value}</div>
                <div style={{ fontSize:'.8rem', color:'var(--gray-500)', fontWeight:500 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ background:'linear-gradient(135deg,var(--primary),#7c3aed)', borderRadius:'var(--radius-lg)', padding:'28px 32px', marginBottom:32, color:'white', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
          <div>
            <h3 style={{ fontWeight:800, fontSize:'1.1rem', marginBottom:4 }}>Ready for a new challenge?</h3>
            <p style={{ opacity:.85, fontSize:'.9rem' }}>Browse our quiz library and test your knowledge</p>
          </div>
          <Link to="/browse" className="btn" style={{ background:'white', color:'var(--primary)', fontWeight:700 }}>
            Browse Quizzes <ArrowRight size={15}/>
          </Link>
        </div>

        {/* Recent attempts */}
        <div className="card">
          <div className="card-header" style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <h2 style={{ fontWeight:700, fontSize:'1rem' }}>Recent Attempts</h2>
            <Link to="/browse" className="btn btn-ghost btn-sm">Take a Quiz</Link>
          </div>
          {loading ? (
            <div style={{ padding:40, textAlign:'center' }}><div className="spinner spinner-dark" /></div>
          ) : attempts.length === 0 ? (
            <div className="empty-state">
              <BookOpen size={40} style={{ opacity:.2, margin:'0 auto 12px', display:'block' }} />
              <h3>No attempts yet</h3>
              <p>Take your first quiz to see results here</p>
              <Link to="/browse" className="btn btn-primary" style={{ marginTop:16 }}>Browse Quizzes</Link>
            </div>
          ) : (
            <div className="table-wrap" style={{ border:'none', borderRadius:0 }}>
              <table>
                <thead>
                  <tr><th>Quiz</th><th>Category</th><th>Score</th><th>Result</th><th>Date</th><th></th></tr>
                </thead>
                <tbody>
                  {attempts.map(a => (
                    <tr key={a.id}>
                      <td style={{ fontWeight:600, color:'var(--gray-900)' }}>{a.quiz_title}</td>
                      <td><span className="badge badge-primary">{a.category}</span></td>
                      <td style={{ fontWeight:700, color: a.percentage >= 80 ? 'var(--success)' : a.percentage >= 60 ? 'var(--warning)' : 'var(--danger)' }}>
                        {a.score}/{a.total} ({a.percentage}%)
                      </td>
                      <td><span className={`badge ${a.percentage >= 60 ? 'badge-success' : 'badge-danger'}`}>{a.percentage >= 60 ? 'Passed' : 'Failed'}</span></td>
                      <td style={{ color:'var(--gray-500)', fontSize:'.82rem' }}>{new Date(a.completed_at).toLocaleDateString()}</td>
                      <td><Link to={`/results/${a.id}`} className="btn btn-ghost btn-sm">Review</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
