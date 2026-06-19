import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/axios.js';
import { Search, BookOpen, Clock, Users, ArrowRight, Zap, LogOut, Shield, Filter } from 'lucide-react';

const CATEGORIES  = ['All','General','Programming','Geography','Science','History','Math','Language','Sports','Entertainment'];
const DIFFICULTIES = ['All','Easy','Medium','Hard'];

export default function BrowsePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [quizzes, setQuizzes]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [category, setCategory]   = useState('All');
  const [difficulty, setDifficulty] = useState('All');

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (category !== 'All')   params.category   = category;
    if (difficulty !== 'All') params.difficulty  = difficulty;
    if (search.trim())        params.search      = search.trim();
    api.get('/quizzes', { params }).then(r => setQuizzes(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [search, category, difficulty]);

  const diffColor = { Easy:'#10b981', Medium:'#f59e0b', Hard:'#ef4444' };

  return (
    <div style={{ minHeight:'100vh', background:'var(--gray-50)' }}>
      {/* Navbar */}
      <nav style={{ background:'white', borderBottom:'1px solid var(--gray-200)', position:'sticky', top:0, zIndex:100, boxShadow:'var(--shadow-sm)' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 24px', height:64, display:'flex', alignItems:'center', gap:16 }}>
          <Link to="/" style={{ display:'flex', alignItems:'center', gap:10, fontWeight:800, fontSize:'1.1rem' }}>
            <div style={{ width:32, height:32, background:'var(--primary)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', color:'white' }}><Zap size={16}/></div>
            Quizly
          </Link>
          <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:8 }}>
            {user?.role === 'admin' && <Link to="/admin" className="btn btn-ghost btn-sm"><Shield size={14}/>Admin</Link>}
            {user ? (
              <>
                <Link to="/dashboard" className="btn btn-ghost btn-sm">Dashboard</Link>
                <button className="btn btn-ghost btn-sm" onClick={() => { logout(); navigate('/'); }}><LogOut size={14}/>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'32px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom:32 }}>
          <h1 style={{ fontSize:'1.8rem', fontWeight:800, marginBottom:8 }}>Browse Quizzes</h1>
          <p style={{ color:'var(--gray-500)' }}>Discover quizzes across all topics and difficulty levels</p>
        </div>

        {/* Filters */}
        <div style={{ background:'white', borderRadius:'var(--radius)', border:'1px solid var(--gray-200)', padding:20, marginBottom:24, display:'flex', gap:16, flexWrap:'wrap', alignItems:'flex-end' }}>
          <div style={{ flex:1, minWidth:200 }}>
            <label className="form-label" style={{ marginBottom:6, display:'block' }}>Search</label>
            <div style={{ position:'relative' }}>
              <Search size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--gray-400)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} className="form-input"
                style={{ paddingLeft:38 }} placeholder="Search quizzes..." />
            </div>
          </div>
          <div style={{ minWidth:160 }}>
            <label className="form-label" style={{ marginBottom:6, display:'block' }}>Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="form-input">
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ minWidth:140 }}>
            <label className="form-label" style={{ marginBottom:6, display:'block' }}>Difficulty</label>
            <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="form-input">
              {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>

        {/* Results count */}
        <p style={{ fontSize:'.875rem', color:'var(--gray-500)', marginBottom:20 }}>
          {loading ? 'Loading...' : `${quizzes.length} quiz${quizzes.length !== 1 ? 'zes' : ''} found`}
        </p>

        {/* Grid */}
        {loading ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:20 }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ background:'white', borderRadius:'var(--radius)', border:'1px solid var(--gray-200)', padding:24, height:220 }}>
                <div className="skeleton" style={{ height:20, width:'60%', marginBottom:12 }} />
                <div className="skeleton" style={{ height:16, width:'100%', marginBottom:8 }} />
                <div className="skeleton" style={{ height:16, width:'80%', marginBottom:24 }} />
                <div className="skeleton" style={{ height:38, width:'100%' }} />
              </div>
            ))}
          </div>
        ) : quizzes.length === 0 ? (
          <div className="empty-state">
            <BookOpen size={48} style={{ opacity:.2, margin:'0 auto 16px', display:'block' }} />
            <h3>No quizzes found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:20 }}>
            {quizzes.map(q => (
              <div key={q.id} style={{ background:'white', borderRadius:'var(--radius)', border:'1px solid var(--gray-200)', padding:24, display:'flex', flexDirection:'column', gap:12, boxShadow:'var(--shadow-sm)', transition:'var(--transition)' }}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='var(--shadow-md)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='var(--shadow-sm)'; }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <span className="badge badge-primary">{q.category}</span>
                  <span style={{ fontSize:'.78rem', fontWeight:700, color: diffColor[q.difficulty] || '#6b7280' }}>{q.difficulty}</span>
                </div>
                <h3 style={{ fontSize:'1rem', fontWeight:700, lineHeight:1.3 }}>{q.title}</h3>
                <p style={{ fontSize:'.85rem', color:'var(--gray-500)', lineHeight:1.5, flex:1 }}>{q.description}</p>
                <div style={{ display:'flex', gap:12, fontSize:'.78rem', color:'var(--gray-500)', flexWrap:'wrap' }}>
                  <span style={{ display:'flex', alignItems:'center', gap:4 }}><BookOpen size={13}/>{q.question_count} questions</span>
                  {q.time_limit > 0 && <span style={{ display:'flex', alignItems:'center', gap:4 }}><Clock size={13}/>{q.time_limit} min</span>}
                  <span style={{ display:'flex', alignItems:'center', gap:4 }}><Users size={13}/>{q.attempt_count} taken</span>
                </div>
                <Link to={user ? `/quiz/${q.id}` : '/login'}
                  className="btn btn-primary" style={{ width:'100%', marginTop:'auto' }}>
                  {user ? 'Take Quiz' : 'Sign in to Take'} <ArrowRight size={14}/>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
