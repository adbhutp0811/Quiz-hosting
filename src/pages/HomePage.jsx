import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/axios.js';
import { Zap, BookOpen, Trophy, Users, ArrowRight, Star, Clock, Shield, LogOut, LayoutDashboard } from 'lucide-react';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-inner">
        <Link to="/" className="nav-brand">
          <div className="nav-brand-icon"><Zap size={18} /></div>
          <span>Quizly</span>
        </Link>
        <div className="nav-links hide-mobile">
          <Link to="/browse" className="nav-link">Browse Quizzes</Link>
          {user && <Link to="/dashboard" className="nav-link">Dashboard</Link>}
          {user?.role === 'admin' && <Link to="/admin" className="nav-link nav-admin"><Shield size={14} />Admin</Link>}
        </div>
        <div className="nav-actions hide-mobile">
          {user ? (
            <>
              <span className="nav-user">Hi, {user.username}</span>
              <button className="btn btn-ghost btn-sm" onClick={() => { logout(); navigate('/'); }}>
                <LogOut size={15} />Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}
        </div>
        <button className="nav-hamburger hide-desktop" onClick={() => setMenuOpen(!menuOpen)}>
          <span /><span /><span />
        </button>
      </div>
      {menuOpen && (
        <div className="nav-mobile-menu">
          <Link to="/browse" className="nmm-link" onClick={() => setMenuOpen(false)}>Browse Quizzes</Link>
          {user && <Link to="/dashboard" className="nmm-link" onClick={() => setMenuOpen(false)}>Dashboard</Link>}
          {user?.role === 'admin' && <Link to="/admin" className="nmm-link" onClick={() => setMenuOpen(false)}>Admin Panel</Link>}
          {user ? (
            <button className="nmm-link" style={{ textAlign:'left', background:'none', border:'none', color:'var(--danger)' }}
              onClick={() => { logout(); navigate('/'); setMenuOpen(false); }}>Logout</button>
          ) : (
            <>
              <Link to="/login" className="nmm-link" onClick={() => setMenuOpen(false)}>Sign In</Link>
              <Link to="/register" className="nmm-link" style={{ color:'var(--primary)', fontWeight:700 }} onClick={() => setMenuOpen(false)}>Create Account</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [stats, setStats]     = useState({ quizzes: 0, attempts: 0, users: 0 });

  useEffect(() => {
    api.get('/quizzes')
      .then(r => {
        const items = Array.isArray(r.data) ? r.data : (r.data?.quizzes || []);
        setQuizzes(items.slice(0, 6));
      })
      .catch(() => {});

    if (user?.role === 'admin') {
      api.get('/admin/stats')
        .then(r => {
          setStats({
            quizzes: r.data.totalQuizzes || 0,
            attempts: r.data.totalAttempts || 0,
            users: r.data.totalUsers || 0,
          });
        })
        .catch(() => {});
    }
  }, [user?.role]);

  const diffColor = { Easy:'#10b981', Medium:'#f59e0b', Hard:'#ef4444' };

  return (
    <div className="home-page">
      <Navbar />

      {/* Hero */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-badge"><Star size={12} />The #1 Quiz Platform</div>
          <h1 className="hero-title">Learn, Test &amp; <span className="hero-accent">Master</span> Any Topic</h1>
          <p className="hero-sub">Create and take quizzes on any subject. Get instant feedback, track your progress, and challenge yourself every day.</p>
          <div className="hero-btns">
            <Link to="/browse" className="btn btn-primary btn-lg">
              <BookOpen size={18} />Browse Quizzes
            </Link>
            {!user && (
              <Link to="/register" className="btn btn-outline btn-lg">
                Get Started Free <ArrowRight size={16} />
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link to="/admin" className="btn btn-outline btn-lg">
                <Shield size={16} />Admin Panel
              </Link>
            )}
          </div>
          <div className="hero-stats">
            <div className="hero-stat"><span className="hs-num">{stats.quizzes}+</span><span className="hs-label">Quizzes</span></div>
            <div className="hero-stat-div" />
            <div className="hero-stat"><span className="hs-num">{stats.attempts}+</span><span className="hs-label">Attempts</span></div>
            <div className="hero-stat-div" />
            <div className="hero-stat"><span className="hs-num">{stats.users}+</span><span className="hs-label">Users</span></div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section">
        <div className="section-inner">
          <div className="section-header">
            <h2>How It Works</h2>
            <p>Three simple steps to start learning</p>
          </div>
          <div className="steps-grid">
            {[
              { n:'01', icon:<BookOpen size={24}/>, title:'Browse Quizzes', desc:'Explore our library of quizzes across dozens of categories and difficulty levels.' },
              { n:'02', icon:<Zap size={24}/>, title:'Take a Quiz', desc:'Answer questions one by one with multiple-choice options. No time pressure unless you want it.' },
              { n:'03', icon:<Trophy size={24}/>, title:'See Your Score', desc:'Get instant results with detailed feedback on every question you answered.' },
            ].map(s => (
              <div key={s.n} className="step-card">
                <div className="step-num">{s.n}</div>
                <div className="step-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Quizzes */}
      {quizzes.length > 0 && (
        <section className="section section-gray">
          <div className="section-inner">
            <div className="section-header">
              <h2>Featured Quizzes</h2>
              <p>Popular quizzes to get you started</p>
            </div>
            <div className="quiz-grid">
              {quizzes.map(q => (
                <div key={q.id} className="quiz-card">
                  <div className="qc-top">
                    <span className="badge badge-primary">{q.category}</span>
                    <span className="qc-diff" style={{ color: diffColor[q.difficulty] || '#6b7280' }}>{q.difficulty}</span>
                  </div>
                  <h3 className="qc-title">{q.title}</h3>
                  <p className="qc-desc">{q.description}</p>
                  <div className="qc-meta">
                    <span><BookOpen size={13} />{q.question_count} questions</span>
                    {q.time_limit > 0 && <span><Clock size={13} />{q.time_limit} min</span>}
                    <span><Users size={13} />{q.attempt_count} attempts</span>
                  </div>
                  <Link to={user ? `/quiz/${q.id}` : '/login'} className="btn btn-primary" style={{ width:'100%', marginTop:'auto' }}>
                    {user ? 'Take Quiz' : 'Sign in to Take'} <ArrowRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
            <div style={{ textAlign:'center', marginTop:32 }}>
              <Link to="/browse" className="btn btn-outline btn-lg">View All Quizzes <ArrowRight size={16} /></Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      {!user && (
        <section className="cta-section">
          <div className="section-inner" style={{ textAlign:'center' }}>
            <h2>Ready to start learning?</h2>
            <p>Join thousands of learners. Create your free account today.</p>
            <div style={{ display:'flex', gap:12, justifyContent:'center', marginTop:28, flexWrap:'wrap' }}>
              <Link to="/register" className="btn btn-primary btn-lg">Create Free Account</Link>
              <Link to="/browse" className="btn btn-outline btn-lg" style={{ color:'white', borderColor:'rgba(255,255,255,.4)' }}>Browse Quizzes</Link>
            </div>
          </div>
        </section>
      )}

      <footer className="home-footer">
        <div className="section-inner">
          <div className="footer-inner">
            <div className="footer-brand">
              <div className="nav-brand-icon" style={{ background:'var(--primary)' }}><Zap size={16} /></div>
              <span style={{ fontWeight:800, fontSize:'1rem' }}>Quizly</span>
            </div>
            <p style={{ color:'var(--gray-500)', fontSize:'.875rem' }}>© 2024 Quizly. Built for learners everywhere.</p>
          </div>
        </div>
      </footer>

      <style>{`
        .home-page { min-height:100vh; }

        /* Navbar */
        .navbar { position:sticky; top:0; z-index:100; background:white; border-bottom:1px solid var(--gray-200); transition:box-shadow .2s; }
        .navbar.scrolled { box-shadow:var(--shadow-md); }
        .nav-inner { max-width:1200px; margin:0 auto; padding:0 24px; height:64px; display:flex; align-items:center; gap:24px; }
        .nav-brand { display:flex; align-items:center; gap:10px; font-size:1.2rem; font-weight:800; color:var(--gray-900); }
        .nav-brand-icon { width:34px; height:34px; background:var(--primary); border-radius:8px; display:flex; align-items:center; justify-content:center; color:white; }
        .nav-links { display:flex; align-items:center; gap:4px; }
        .nav-link { padding:6px 12px; border-radius:6px; font-size:.875rem; font-weight:500; color:var(--gray-600); transition:var(--transition); display:flex; align-items:center; gap:6px; }
        .nav-link:hover { background:var(--gray-100); color:var(--gray-900); }
        .nav-admin { color:var(--primary); font-weight:700; }
        .nav-actions { display:flex; align-items:center; gap:8px; margin-left:auto; }
        .nav-user { font-size:.875rem; font-weight:600; color:var(--gray-700); }
        .nav-hamburger { display:flex; flex-direction:column; gap:5px; background:none; border:none; padding:8px; margin-left:auto; }
        .nav-hamburger span { width:22px; height:2px; background:var(--gray-700); border-radius:1px; }
        .nav-mobile-menu { border-top:1px solid var(--gray-100); padding:12px 16px; display:flex; flex-direction:column; gap:2px; }
        .nmm-link { padding:10px 12px; border-radius:8px; font-size:.9rem; font-weight:500; color:var(--gray-700); cursor:pointer; }
        .nmm-link:hover { background:var(--gray-100); }

        /* Hero */
        .hero { background:linear-gradient(135deg,#f8faff 0%,#eef2ff 100%); padding:80px 24px; }
        .hero-inner { max-width:760px; margin:0 auto; text-align:center; }
        .hero-badge { display:inline-flex; align-items:center; gap:6px; background:var(--primary-light); color:var(--primary-dark); font-size:.78rem; font-weight:700; padding:6px 14px; border-radius:999px; margin-bottom:20px; text-transform:uppercase; letter-spacing:.06em; }
        .hero-title { font-size:clamp(2rem,5vw,3.2rem); font-weight:900; line-height:1.15; color:var(--gray-900); margin-bottom:20px; }
        .hero-accent { color:var(--primary); }
        .hero-sub { font-size:1.1rem; color:var(--gray-600); max-width:560px; margin:0 auto 32px; line-height:1.7; }
        .hero-btns { display:flex; gap:12px; justify-content:center; flex-wrap:wrap; margin-bottom:48px; }
        .hero-stats { display:flex; align-items:center; justify-content:center; gap:24px; }
        .hero-stat { text-align:center; }
        .hs-num { display:block; font-size:1.8rem; font-weight:900; color:var(--primary); line-height:1; }
        .hs-label { font-size:.8rem; color:var(--gray-500); font-weight:500; }
        .hero-stat-div { width:1px; height:40px; background:var(--gray-200); }

        /* Sections */
        .section { padding:72px 24px; }
        .section-gray { background:var(--gray-50); }
        .section-inner { max-width:1200px; margin:0 auto; }
        .section-header { text-align:center; margin-bottom:48px; }
        .section-header h2 { font-size:clamp(1.5rem,3vw,2rem); font-weight:800; color:var(--gray-900); margin-bottom:8px; }
        .section-header p  { color:var(--gray-500); font-size:1rem; }

        /* Steps */
        .steps-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:24px; }
        .step-card { background:white; border-radius:var(--radius-lg); padding:32px 24px; border:1px solid var(--gray-200); box-shadow:var(--shadow-sm); text-align:center; transition:var(--transition); }
        .step-card:hover { transform:translateY(-4px); box-shadow:var(--shadow-md); }
        .step-num { font-size:2.5rem; font-weight:900; color:var(--primary-light); line-height:1; margin-bottom:16px; }
        .step-icon { width:56px; height:56px; background:var(--primary-light); border-radius:14px; display:flex; align-items:center; justify-content:center; color:var(--primary); margin:0 auto 16px; }
        .step-card h3 { font-size:1.1rem; font-weight:700; margin-bottom:8px; }
        .step-card p  { color:var(--gray-500); font-size:.9rem; line-height:1.6; }

        /* Quiz grid */
        .quiz-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:20px; }
        .quiz-card { background:white; border-radius:var(--radius-lg); border:1px solid var(--gray-200); padding:24px; display:flex; flex-direction:column; gap:12px; box-shadow:var(--shadow-sm); transition:var(--transition); }
        .quiz-card:hover { transform:translateY(-3px); box-shadow:var(--shadow-md); }
        .qc-top { display:flex; align-items:center; justify-content:space-between; }
        .qc-diff { font-size:.78rem; font-weight:700; }
        .qc-title { font-size:1rem; font-weight:700; color:var(--gray-900); line-height:1.3; }
        .qc-desc { font-size:.85rem; color:var(--gray-500); line-height:1.5; flex:1; }
        .qc-meta { display:flex; align-items:center; gap:12px; font-size:.78rem; color:var(--gray-500); flex-wrap:wrap; }
        .qc-meta span { display:flex; align-items:center; gap:4px; }

        /* CTA */
        .cta-section { background:linear-gradient(135deg,var(--primary),#7c3aed); padding:80px 24px; color:white; }
        .cta-section h2 { font-size:clamp(1.5rem,3vw,2rem); font-weight:800; margin-bottom:12px; }
        .cta-section p  { opacity:.85; font-size:1rem; }

        /* Footer */
        .home-footer { background:var(--gray-900); padding:32px 24px; }
        .footer-inner { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px; }
        .footer-brand { display:flex; align-items:center; gap:10px; color:white; }
      `}</style>
    </div>
  );
}
