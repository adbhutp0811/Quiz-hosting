import React, { useState, useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { PenLine, BookOpen, LayoutDashboard, LogOut, LogIn, UserPlus, Menu, X } from "lucide-react";
import useStore from "../store/useStore";
import "./Layout.css";

export default function Layout() {
  const currentUser = useStore((s) => s.currentUser);
  const logout = useStore((s) => s.logout);
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (path) =>
    location.pathname === path ? "nav-link active" : "nav-link";

  return (
    <div className="app-shell">
      <header className={`site-header ${scrolled ? "scrolled" : ""}`} role="banner">
        <div className="container header-inner">
          <Link to="/" className="brand" aria-label="Quizly home">
            <span className="brand-mark">Q</span>
            <span className="brand-name">Quizly</span>
          </Link>

          <nav className="desktop-nav" aria-label="Primary navigation">
            <Link to="/quizzes" className={isActive("/quizzes")}>
              <BookOpen size={15} />
              Browse Quizzes
            </Link>
            {currentUser && (
              <>
                <Link to="/create" className={isActive("/create")}>
                  <PenLine size={15} />
                  Create
                </Link>
                <Link to="/dashboard" className={isActive("/dashboard")}>
                  <LayoutDashboard size={15} />
                  Dashboard
                </Link>
              </>
            )}
          </nav>

          <div className="header-actions">
            {currentUser ? (
              <div className="user-cluster">
                <span className="user-greeting">
                  <span className="user-avatar">{currentUser.name.charAt(0).toUpperCase()}</span>
                  <span className="user-name">{currentUser.name.split(" ")[0]}</span>
                </span>
                <button
                  className="btn-ghost"
                  onClick={handleLogout}
                  aria-label="Log out"
                >
                  <LogOut size={15} />
                  <span>Log out</span>
                </button>
              </div>
            ) : (
              <div className="auth-cluster">
                <Link to="/login" className="btn-ghost">
                  <LogIn size={15} />
                  <span>Log in</span>
                </Link>
                <Link to="/register" className="btn-primary-sm">
                  Sign up
                </Link>
              </div>
            )}

            <button
              className="hamburger"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <nav className="mobile-nav animate-fade-in" aria-label="Mobile navigation">
            <Link to="/quizzes" className="mobile-link">Browse Quizzes</Link>
            {currentUser && (
              <>
                <Link to="/create" className="mobile-link">Create Quiz</Link>
                <Link to="/dashboard" className="mobile-link">Dashboard</Link>
              </>
            )}
            {currentUser ? (
              <button className="mobile-link mobile-logout" onClick={handleLogout}>
                Log out
              </button>
            ) : (
              <>
                <Link to="/login" className="mobile-link">Log in</Link>
                <Link to="/register" className="mobile-link mobile-signup">Sign up</Link>
              </>
            )}
          </nav>
        )}
      </header>

      <main className="main-content" id="main-content" tabIndex={-1}>
        <Outlet />
      </main>

      <footer className="site-footer" role="contentinfo">
        <div className="container footer-inner">
          <span className="footer-brand">Quizly</span>
          <span className="footer-copy">
            Craft quizzes. Challenge minds. Learn together.
          </span>
        </div>
      </footer>
    </div>
  );
}
