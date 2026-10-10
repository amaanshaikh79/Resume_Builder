import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import './Footer.css';

interface FooterCol {
  title: string;
  links: Array<{ label: string; to: string; external?: boolean }>;
}

const COLUMNS: FooterCol[] = [
  {
    title: 'Product',
    links: [
      { label: 'Features', to: '/features' },
      { label: 'Templates', to: '/templates' },
      { label: 'Pricing', to: '/pricing' },
      { label: 'ATS Checker', to: '/features' },
      { label: 'AI Writer', to: '/features' },
      { label: 'Resume Analyzer', to: '/features' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Help Center', to: '/help' },
      { label: 'Career Guides', to: '/help' },
      { label: 'Resume Samples', to: '/templates' },
      { label: 'API Docs', to: '/help' },
      { label: 'Changelog', to: '/help' },
      { label: 'Status', to: '/help' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', to: '/about' },
      { label: 'Contact', to: '/contact' },
      { label: 'Careers', to: '/about' },
      { label: 'Partners', to: '/about' },
      { label: 'Press Kit', to: '/about' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Sign in', to: '/login' },
      { label: 'Create account', to: '/register' },
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'My Resumes', to: '/resumes' },
      { label: 'Profile Settings', to: '/profile' },
    ],
  },
];

const SOCIALS = [
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
        <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.55C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.72C24 .77 23.2 0 22.22 0z" />
      </svg>
    ),
  },
  {
    label: 'X',
    href: 'https://x.com',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
        <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23zm-1.16 17.52h1.83L7.08 4.13H5.11l11.97 15.64z" />
      </svg>
    ),
  },
  {
    label: 'GitHub',
    href: 'https://github.com',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
        <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.78 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.69 5.4-5.26 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.68.8.56A10.5 10.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: 'https://youtube.com',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
        <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81zM9.55 15.57V8.43L15.82 12l-6.27 3.57z" />
      </svg>
    ),
  },
];

const Footer: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState('');

  // Hide on auth pages (they are full-screen)
  if (['/login', '/register', '/forgot-password'].includes(location.pathname)) return null;

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!valid) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 5000);
  };

  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="container footer-grid">
          {/* Brand + newsletter */}
          <div className="footer-brand-col">
            <Link to="/" className="footer-brand">
              <span className="brand-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <path d="M9 15l2 2 4-4" />
                </svg>
              </span>
              AI <span className="brand-highlight">Resume</span> Builder
            </Link>

            <p className="footer-tagline">
              Build ATS-winning resumes with AI-powered writing, skill extraction, and job matching — free to start.
            </p>

            <div className="footer-socials">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social"
                  aria-label={s.label}
                >
                  {s.icon}
                </a>
              ))}
            </div>

            <form className="footer-newsletter" onSubmit={handleSubscribe} noValidate>
              <label className="footer-newsletter-label" htmlFor="footer-email">
                Subscribe to our newsletter
              </label>
              <div className="footer-newsletter-row">
                <input
                  id="footer-email"
                  type="email"
                  className="field"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={!!error}
                />
                <button className="btn btn-gradient btn-md" type="submit">
                  Subscribe
                </button>
              </div>
              {error && <p className="field-error-text">{error}</p>}
              {subscribed && <p className="footer-subscribed">✓ You're subscribed! Welcome aboard.</p>}
            </form>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <nav className="footer-col" key={col.title} aria-label={col.title}>
              <h4 className="footer-col-title">{col.title}</h4>
              <ul className="footer-links">
                {col.links.map((link) => (
                  <li key={link.label + link.to}>
                    <Link to={link.to} className="footer-link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p className="footer-copy">© {new Date().getFullYear()} AI Resume Builder. All rights reserved.</p>

          <div className="footer-legal">
            <Link to="/privacy" className="footer-legal-link">Privacy Policy</Link>
            <Link to="/terms" className="footer-legal-link">Terms of Service</Link>
            <Link to="/privacy" className="footer-legal-link">Cookie Policy</Link>
            <Link to="/contact" className="footer-legal-link">Security</Link>
          </div>

          <button className="footer-theme" onClick={toggleTheme} type="button">
            <span aria-hidden="true">{theme === 'light' ? '🌙' : '☀️'}</span>
            <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
