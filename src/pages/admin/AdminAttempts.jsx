import React, { useEffect, useState } from 'react';
import api from '../../api/axios.js';
import { BarChart2, Search, TrendingUp, Users, Trophy, BookOpen } from 'lucide-react';

export default function AdminAttempts() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState('all');

  useEffect(() => {
    api.get('/admin/attempts')
      .then(r => setAttempts(r.data))
      .catch(() => setAttempts([]))
      .finally(() => setLoading(false));
  }, []);

  const scoreColor = p => p >= 80 ? '#10b981' : p >= 60 ? '#f59e0b' : '#ef4444';
  const scoreBg    = p => p >= 80 ? '#d1fae5' : p >= 60 ? '#fef3c7' : '#fee2e2';

  const filtered = attempts.filter(a => {
    const matchSearch = a.username.toLowerCase().includes(search.toLowerCase()) ||
      a.quiz_title.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' ? true
      : filter === 'pass' ? a.percentage >= 60
      : a.percentage < 60;
    return matchSearch && matchFilter;
  });

  const avgScore = attempts.length ? Math.round(attempts.reduce((s,a) => s+a.percentage,0) / attempts.length) : 0;
  const passRate = attempts.length ? Math.round((attempts.filter(a => a.percentage >= 60).length / attempts.length) * 100) : 0;

  return (
    <div className="aa-wrap fade-in">
      <div className="aa-header">
        <div>
          <h1 className="aa-title">Attempts</h1>
          <p className="aa-sub">{attempts.length} total quiz attempts</p>
        </div>
      </div>

      {/* Stats */}
      <div className="aa-stats">
        {[
          { icon:<BarChart2 size={20}/>, color:'#6366f1', bg:'#e0e7ff', label:'Total Attempts', val: attempts.length },
          { icon:<TrendingUp size={20}/>, color:'#10b981', bg:'#d1fae5', label:'Average Score',  val: `${avgScore}%` },
          { icon:<Trophy size={20}/>,    color:'#f59e0b', bg:'#fef3c7', label:'Pass Rate (≥60%)', val: `${passRate}%` },
          { icon:<Users size={20}/>,     color:'#3b82f6', bg:'#dbeafe', label:'Unique Users',    val: new Set(attempts.map(a => a.user_id)).size },
        ].map((s, i) => (
          <div key={i} className="aa-stat">
            <div className="aa-stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div>
              <div className="aa-stat-val">{s.val}</div>
              <div className="aa-stat-lbl">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="aa-filters">
        <div style={{ position:'relative', flex:1, maxWidth:'360px' }}>
          <Search size={15} style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'var(--gray-400)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by user or quiz..." className="form-input" style={{ paddingLeft:'36px' }} />
        </div>
        <div className="tabs" style={{ width:'auto' }}>
          {[['all','All'],['pass','Passed'],['fail','Failed']].map(([v,l]) => (
            <button key={v} className={`tab-btn ${filter === v ? 'active' : ''}`} onClick={() => setFilter(v)}>{l}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:'60px' }}>
          <div className="spinner spinner-dark" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <BarChart2 size={40} />
          <h3>No attempts found</h3>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>User</th>
                <th>Quiz</th>
                <th>Score</th>
                <th>Result</th>
                <th>Time</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, i) => (
                <tr key={a.id}>
                  <td style={{ color:'var(--gray-400)', fontSize:'.8rem' }}>{i + 1}</td>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                      <div className="av-sm">{a.username[0].toUpperCase()}</div>
                      <span style={{ fontWeight:600 }}>{a.username}</span>
                    </div>
                  </td>
                  <td style={{ color:'var(--gray-700)', fontSize:'.875rem' }}>{a.quiz_title}</td>
                  <td style={{ fontWeight:700 }}>{a.score}/{a.total}</td>
                  <td>
                    <span className="badge" style={{ background: scoreBg(a.percentage), color: scoreColor(a.percentage) }}>
                      {a.percentage}%
                    </span>
                  </td>
                  <td style={{ color:'var(--gray-500)', fontSize:'.82rem' }}>
                    {a.time_taken > 0 ? `${Math.floor(a.time_taken/60)}m ${a.time_taken%60}s` : '—'}
                  </td>
                  <td style={{ color:'var(--gray-500)', fontSize:'.82rem' }}>
                    {new Date(a.completed_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        .aa-wrap { display: flex; flex-direction: column; gap: 20px; }
        .aa-header { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
        .aa-title { font-size: 1.75rem; font-weight: 800; color: var(--gray-900); }
        .aa-sub   { color: var(--gray-500); font-size: .875rem; }
        .aa-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; }
        .aa-stat  { background: white; border: 1px solid var(--gray-200); border-radius: var(--radius); padding: 18px; display: flex; align-items: center; gap: 14px; box-shadow: var(--shadow-sm); }
        .aa-stat-icon { width: 44px; height: 44px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .aa-stat-val { font-size: 1.4rem; font-weight: 800; color: var(--gray-900); }
        .aa-stat-lbl { font-size: .75rem; color: var(--gray-500); font-weight: 500; }
        .aa-filters { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
        .av-sm { width: 28px; height: 28px; border-radius: 50%; background: var(--primary-light); color: var(--primary); font-size: .75rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
      `}</style>
    </div>
  );
}
