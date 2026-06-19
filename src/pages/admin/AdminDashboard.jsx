import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios.js';
import { Users, BookOpen, BarChart2, Trophy, Plus, TrendingUp, Clock } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:300 }}>
      <div className="spinner spinner-dark" style={{ width:32, height:32 }}/>
    </div>
  );

  const cards = [
    { icon:<Users size={22}/>, label:'Total Users',    value: stats?.totalUsers   || 0, color:'#6366f1', bg:'#e0e7ff', sub:'Registered accounts' },
    { icon:<BookOpen size={22}/>, label:'Total Quizzes', value: stats?.totalQuizzes || 0, color:'#10b981', bg:'#d1fae5', sub:`${stats?.published || 0} published` },
    { icon:<BarChart2 size={22}/>, label:'Total Attempts', value: stats?.totalAttempts || 0, color:'#f59e0b', bg:'#fef3c7', sub:'Quiz submissions' },
    { icon:<Trophy size={22}/>, label:'Avg Score', value: `${stats?.avgScore || 0}%`, color:'#3b82f6', bg:'#dbeafe', sub:'Across all attempts' },
  ];

  return (
    <div className="fade-in">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontSize:'1.5rem', fontWeight:800, color:'var(--gray-900)' }}>Dashboard</h1>
          <p style={{ color:'var(--gray-500)', fontSize:'.875rem', marginTop:4 }}>Overview of your quiz platform</p>
        </div>
        <Link to="/admin/quizzes/create" className="btn btn-primary">
          <Plus size={16}/> Create Quiz
        </Link>
      </div>

      {/* Stat cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:16, marginBottom:32 }}>
        {cards.map(c => (
          <div key={c.label} className="card" style={{ padding:'20px 24px', display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ width:50, height:50, borderRadius:12, background:c.bg, display:'flex', alignItems:'center', justifyContent:'center', color:c.color, flexShrink:0 }}>{c.icon}</div>
            <div>
              <div style={{ fontSize:'1.6rem', fontWeight:900, color:'var(--gray-900)', lineHeight:1 }}>{c.value}</div>
              <div style={{ fontSize:'.82rem', fontWeight:600, color:'var(--gray-700)', marginTop:2 }}>{c.label}</div>
              <div style={{ fontSize:'.75rem', color:'var(--gray-400)' }}>{c.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:24 }}>
        {/* Quick Actions */}
        <div className="card">
          <div className="card-header"><h2 style={{ fontWeight:700, fontSize:'1rem' }}>Quick Actions</h2></div>
          <div className="card-body" style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <Link to="/admin/quizzes/create" className="btn btn-primary" style={{ justifyContent:'flex-start' }}>
              <Plus size={16}/> Create New Quiz
            </Link>
            <Link to="/admin/quizzes" className="btn btn-outline" style={{ justifyContent:'flex-start' }}>
              <BookOpen size={16}/> Manage Quizzes
            </Link>
            <Link to="/admin/users" className="btn btn-outline" style={{ justifyContent:'flex-start' }}>
              <Users size={16}/> Manage Users
            </Link>
            <Link to="/admin/attempts" className="btn btn-outline" style={{ justifyContent:'flex-start' }}>
              <BarChart2 size={16}/> View Attempts
            </Link>
          </div>
        </div>

        {/* Top Quizzes */}
        <div className="card">
          <div className="card-header"><h2 style={{ fontWeight:700, fontSize:'1rem' }}>Top Quizzes</h2></div>
          <div style={{ padding:'8px 0' }}>
            {(stats?.topQuizzes || []).length === 0 ? (
              <div style={{ padding:'24px', textAlign:'center', color:'var(--gray-400)', fontSize:'.875rem' }}>No quizzes yet</div>
            ) : (stats?.topQuizzes || []).map((q, i) => (
              <div key={q.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 20px', borderBottom:'1px solid var(--gray-100)' }}>
                <span style={{ width:24, height:24, borderRadius:'50%', background:'var(--primary-light)', color:'var(--primary)', fontSize:'.72rem', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{i+1}</span>
                <div style={{ flex:1, overflow:'hidden' }}>
                  <div style={{ fontWeight:600, fontSize:'.875rem', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{q.title}</div>
                  <div style={{ fontSize:'.75rem', color:'var(--gray-500)' }}>{q.attempt_count} attempts</div>
                </div>
                <span style={{ fontSize:'.78rem', fontWeight:700, color:'var(--success)' }}>{Math.round(q.avg_score || 0)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Attempts */}
      <div className="card">
        <div className="card-header">
          <h2 style={{ fontWeight:700, fontSize:'1rem' }}>Recent Attempts</h2>
        </div>
        {(stats?.recentAttempts || []).length === 0 ? (
          <div className="empty-state"><p>No attempts yet</p></div>
        ) : (
          <div className="table-wrap" style={{ border:'none', borderRadius:0 }}>
            <table>
              <thead>
                <tr><th>User</th><th>Quiz</th><th>Score</th><th>Result</th><th>Date</th></tr>
              </thead>
              <tbody>
                {(stats?.recentAttempts || []).map(a => (
                  <tr key={a.id}>
                    <td style={{ fontWeight:600 }}>{a.username}</td>
                    <td style={{ color:'var(--gray-600)', fontSize:'.875rem' }}>{a.quiz_title}</td>
                    <td style={{ fontWeight:700, color: a.percentage >= 80 ? 'var(--success)' : a.percentage >= 60 ? 'var(--warning)' : 'var(--danger)' }}>
                      {a.score}/{a.total} ({a.percentage}%)
                    </td>
                    <td><span className={`badge ${a.percentage >= 60 ? 'badge-success' : 'badge-danger'}`}>{a.percentage >= 60 ? 'Passed' : 'Failed'}</span></td>
                    <td style={{ color:'var(--gray-500)', fontSize:'.82rem' }}>{new Date(a.completed_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
