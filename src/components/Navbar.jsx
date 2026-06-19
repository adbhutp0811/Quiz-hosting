import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  BookOpen, Menu, X, LogOut, User, LayoutDashboard,
  Shield, ChevronDown, Home, List
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [open, setOpen]     = useState(false);
  const [scroll, setScroll] = useState(false);
  const [dropdown, setDropdown] = useState(false);

  useEffect(() => {
    const fn = () => setScroll(window.scrollY > 10);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => { setOpen(false); setDropdown(false); }, [location]);

  const handleLogout = () => { logout(); navigate('/'); };
  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`navbar ${scroll ? 'scrolled' : ''}`}>
      <div className="nav-inner">
        {/* Logo */}
        <Link to="/" className="nav-logo">
          <div className="logo-icon"><BookOpen size={18} /></div>
          <span>Quizly</span>
        </Link>

        {/* Desktop links */}
        <div className="nav-links hide-mobile">
          <Link to="/"       className={`nav-link ${isActive('/') ? 'active' : ''}`}><Home size={15} />Home</Link>
          <Link to="/browse" className={`nav-link ${isActive('/browse') ? 'active' : ''}`}><List size={15} />Browse Quizzes</Link>
          {isAdmin && (
            <Link to="/admin" className="nav-link admin-link"><Shield size={15} />Admin Panel</Link>
          )}
        </div>

        {/* Right */}
        <div className="nav-right hide-mobile">
          {user ? (
            <div className="user-menu" onClick={() => setDropdown(!dropdown)}>
              <div className="user-avatar">{user.username[0].toUpperCase()}</div>
              <span className="user-name">{user.username}</span>
              {user.role === 'admin' && <span className="badge badge-primary" style={{fontSize:'.65rem'}}>Admin</span>}
              <ChevronDown size={14} className={`chevron ${dropdown ? 'rotated' : ''}`} />
              {dropdown && (
                <div className="dropdown">
                  <Link to="/dashboard" className="dropdown-item"><LayoutDashboard size={15} />Dashboard</Link>
                  {isAdmin && <Link to="/admin" className="dropdown-item"><Shield size={15} />Admin Panel</Link>}
                  <div className="dropdown-divider" />
                  <button onClick={handleLogout} className="dropdown-item danger"><LogOut size={15} />Sign Out</button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display:'flex', gap:'8px' }}>
              <Link to="/login"    className="btn btn-ghost btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="mobile-toggle hide-desktop" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="mobile-menu hide-desktop">
          <Link to="/"       className="mobile-link"><Home size={16} />Home</Link>
          <Link to="/browse" className="mobile-link"><List size={16} />Browse Quizzes</Link>
          {user && <Link to="/dashboard" className="mobile-link"><LayoutDashboard size={16} />Dashboard</Link>}
          {isAdmin && <Link to="/admin"  className="mobile-link admin"><Shield size={16} />Admin Panel</Link>}
          <div className="mobile-divider" />
          {user ? (
            <button onClick={handleLogout} className="mobile-link danger"><LogOut size={16} />Sign Out ({user.username})</button>
          ) : (
            <>
              <Link to="/login"    className="mobile-link"><User size={16} />Sign In</Link>
              <Link to="/register" className="btn btn-primary" style={{margin:'8px 16px'}}>Get Started</Link>
            </>
          )}
        </div>
      )}

      <style>{`
        .navbar {
          position: sticky; top: 0; z-index: 100;
          background: rgba(255,255,255,.9); backdrop-filter: blur(12px);
          border-bottom: 1px solid transparent; transition: all .2s;
        }
        .navbar.scrolled { border-color: var(--gray-200); box-shadow: var(--shadow-sm); }
        .nav-inner { max-width: 1200px; margin: 0 auto; padding: 0 24px; height: 64px; display: flex; align-items: center; gap: 32px; }
        .nav-logo { display: flex; align-items: center; gap: 10px; font-size: 1.25rem; font-weight: 800; color: var(--primary); }
        .logo-icon { width: 34px; height: 34px; background: var(--primary); color: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
        .nav-links { display: flex; align-items: center; gap: 4px; flex: 1; }
        .nav-link { display: flex; align-items: center; gap: 6px; padding: 7px 12px; border-radius: 8px; font-size: .875rem; font-weight: 500; color: var(--gray-600); transition: var(--transition); }
        .nav-link:hover, .nav-link.active { background: var(--gray-100); color: var(--gray-900); }
        .nav-link.admin-link { color: var(--primary); }
        .nav-link.admin-link:hover { background: var(--primary-light); }
        .nav-right { display: flex; align-items: center; gap: 12px; margin-left: auto; }
        .user-menu { position: relative; display: flex; align-items: center; gap: 8px; padding: 6px 12px; border-radius: 999px; cursor: pointer; transition: var(--transition); border: 1.5px solid var(--gray-200); }
        .user-menu:hover { background: var(--gray-50); border-color: var(--gray-300); }
        .user-avatar { width: 28px; height: 28px; border-radius: 50%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-size: .8rem; font-weight: 700; }
        .user-name { font-size: .875rem; font-weight: 600; color: var(--gray-700); }
        .chevron { color: var(--gray-400); transition: transform .2s; }
        .chevron.rotated { transform: rotate(180deg); }
        .dropdown { position: absolute; top: calc(100% + 8px); right: 0; min-width: 200px; background: white; border: 1px solid var(--gray-200); border-radius: var(--radius); box-shadow: var(--shadow-lg); overflow: hidden; animation: scaleIn .15s ease; z-index: 200; }
        .dropdown-item { display: flex; align-items: center; gap: 10px; padding: 10px 16px; font-size: .875rem; font-weight: 500; color: var(--gray-700); transition: var(--transition); width: 100%; border: none; background: none; cursor: pointer; }
        .dropdown-item:hover { background: var(--gray-50); color: var(--gray-900); }
        .dropdown-item.danger { color: var(--danger); }
        .dropdown-item.danger:hover { background: #fef2f2; }
        .dropdown-divider { height: 1px; background: var(--gray-100); margin: 4px 0; }
        .mobile-toggle { background: none; border: none; color: var(--gray-700); padding: 6px; margin-left: auto; }
        .mobile-menu { border-top: 1px solid var(--gray-100); padding: 8px 0 16px; background: white; }
        .mobile-link { display: flex; align-items: center; gap: 10px; padding: 12px 24px; font-size: .9rem; font-weight: 500; color: var(--gray-700); transition: var(--transition); width: 100%; border: none; background: none; cursor: pointer; }
        .mobile-link:hover { background: var(--gray-50); }
        .mobile-link.admin { color: var(--primary); }
        .mobile-link.danger { color: var(--danger); }
        .mobile-divider { height: 1px; background: var(--gray-100); margin: 8px 0; }
      `}</style>
    </nav>
  );
}
