import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Avatar } from './ui/Avatar';
import '../styles/design-system.css';
import './Navbar.css';

type NavLink = { path: string; label: string; protected?: boolean };

const PUBLIC_LINKS: NavLink[] = [
  { path: '/', label: 'Home' },
  { path: '/features', label: 'Features' },
  { path: '/templates', label: 'Templates' },
  { path: '/pricing', label: 'Pricing' },
  { path: '/about', label: 'About' },
];

const AUTH_LINKS: NavLink[] = [
  { path: '/dashboard', label: 'Dashboard', protected: true },
  { path: '/resumes', label: 'My Resumes', protected: true },
  { path: '/templates', label: 'Templates' },
  { path: '/pricing', label: 'Pricing' },
];

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
  }, [location.pathname]);

  // Close profile dropdown on outside click / ESC
  useEffect(() => {
    if (!isProfileMenuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setIsProfileMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsProfileMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [isProfileMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsProfileMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const links = isAuthenticated ? AUTH_LINKS : PUBLIC_LINKS;
  const displayName = user?.name || user?.email?.split('@')[0] || 'User';

  const themeButton = (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      title={theme === 'light' ? 'Dark mode' : 'Light mode'}
      type="button"
    >
      <span className="theme-icon">{theme === 'light' ? '🌙' : '☀️'}</span>
    </button>
  );

  return (
    <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" aria-label="AI Resume Builder home">
          <span className="brand-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <path d="M9 15l2 2 4-4" />
            </svg>
          </span>
          <span className="brand-text">
            AI <span className="brand-highlight">Resume</span> Builder
          </span>
        </Link>

        <div className="navbar-menu">
          {links.map((link) => {
            if (link.protected && !isAuthenticated) return null;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link ${isActive(link.path) ? 'nav-link-active' : ''}`}
              >
                {link.label}
              </Link>
            );
          })}
          {!isAuthenticated && (
            <Link to="/help" className={`nav-link ${isActive('/help') ? 'nav-link-active' : ''}`}>
              Help
            </Link>
          )}
        </div>

        <div className="navbar-actions">
          {themeButton}

          {isAuthenticated ? (
            <>
              <button
                onClick={() => navigate('/resumes/create')}
                className="btn btn-gradient btn-sm nav-cta"
                type="button"
              >
                <span className="btn-icon" aria-hidden="true">+</span>
                <span>New Resume</span>
              </button>

              <div className="profile-menu" ref={profileRef}>
                <button
                  className="profile-trigger"
                  onClick={() => setIsProfileMenuOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={isProfileMenuOpen}
                  type="button"
                >
                  <Avatar name={displayName} size="sm" showStatus />
                  <span className="profile-name">{displayName}</span>
                  <span className={`profile-arrow ${isProfileMenuOpen ? 'profile-arrow-open' : ''}`}>▾</span>
                </button>

                {isProfileMenuOpen && (
                  <>
                    <div className="profile-backdrop" onClick={() => setIsProfileMenuOpen(false)} />
                    <div className="profile-dropdown" role="menu">
                      <div className="dropdown-header">
                        <Avatar name={displayName} size="md" />
                        <div className="dropdown-info">
                          <div className="dropdown-name">{displayName}</div>
                          <div className="dropdown-email">{user?.email}</div>
                        </div>
                      </div>
                      <div className="dropdown-divider" />

                      <Link to="/dashboard" className="dropdown-item" role="menuitem">
                        <span className="item-icon" aria-hidden="true">📊</span>
                        <span>Dashboard</span>
                      </Link>
                      <Link to="/resumes" className="dropdown-item" role="menuitem">
                        <span className="item-icon" aria-hidden="true">📄</span>
                        <span>My Resumes</span>
                      </Link>
                      <Link to="/profile" className="dropdown-item" role="menuitem">
                        <span className="item-icon" aria-hidden="true">⚙️</span>
                        <span>Settings</span>
                      </Link>
                      <Link to="/help" className="dropdown-item" role="menuitem">
                        <span className="item-icon" aria-hidden="true">💬</span>
                        <span>Help Center</span>
                      </Link>

                      <div className="dropdown-divider" />

                      <button onClick={handleLogout} className="dropdown-item dropdown-item-danger" role="menuitem">
                        <span className="item-icon" aria-hidden="true">🚪</span>
                        <span>Sign out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm nav-signin">
                Sign in
              </Link>
              <Link to="/register" className="btn btn-gradient btn-sm nav-cta">
                <span>Get Started</span>
                <span className="btn-icon" aria-hidden="true">→</span>
              </Link>
            </>
          )}
        </div>

        <button
          className={`mobile-menu-btn ${isMobileMenuOpen ? 'is-open' : ''}`}
          onClick={() => setIsMobileMenuOpen((v) => !v)}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMobileMenuOpen}
          type="button"
        >
          <span className="hamburger">
            <span className="line" />
            <span className="line" />
            <span className="line" />
          </span>
        </button>
      </div>

      {isMobileMenuOpen && (
        <>
          <div className="mobile-menu-backdrop" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="mobile-menu">
            <div className="mobile-menu-content">
              <div className="mobile-menu-header">
                <span className="brand-icon" aria-hidden="true">📄</span>
                <span className="brand-text">AI Resume Builder</span>
              </div>

              <div className="mobile-nav-links">
                {links.map((link) => {
                  if (link.protected && !isAuthenticated) return null;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`mobile-nav-link ${isActive(link.path) ? 'mobile-nav-link-active' : ''}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  );
                })}
                <Link to="/contact" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                  Contact
                </Link>
                <Link to="/help" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                  Help Center
                </Link>
              </div>

              <div className="mobile-menu-divider" />

              <div className="mobile-menu-actions">
                <button
                  className="btn btn-ghost btn-md btn-full"
                  onClick={() => {
                    toggleTheme();
                  }}
                  type="button"
                >
                  <span aria-hidden="true">{theme === 'light' ? '🌙' : '☀️'}</span>
                  <span>{theme === 'light' ? 'Dark mode' : 'Light mode'}</span>
                </button>

                {isAuthenticated ? (
                  <>
                    <div className="mobile-user-info">
                      <Avatar name={displayName} size="md" showStatus />
                      <div className="mobile-user-text">
                        <div className="mobile-user-name">{displayName}</div>
                        <div className="mobile-user-email">{user?.email}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        navigate('/resumes/create');
                        setIsMobileMenuOpen(false);
                      }}
                      className="btn btn-gradient btn-md btn-full"
                      type="button"
                    >
                      <span className="btn-icon" aria-hidden="true">+</span>
                      <span>Create Resume</span>
                    </button>

                    <button onClick={handleLogout} className="btn btn-outline btn-md btn-full" type="button">
                      <span aria-hidden="true">🚪</span>
                      <span>Sign out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="btn btn-outline btn-md btn-full"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign in
                    </Link>
                    <Link
                      to="/register"
                      className="btn btn-gradient btn-md btn-full"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span>Get Started</span>
                      <span className="btn-icon" aria-hidden="true">→</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
