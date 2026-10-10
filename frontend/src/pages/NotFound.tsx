import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/design-system.css';
import './Marketing.css';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="marketing-page">
      <div className="notfound">
        <div className="notfound-code">404</div>
        <h1 className="notfound-title">This page went off the grid</h1>
        <p className="notfound-desc">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
        <div className="notfound-actions">
          <Link to="/" className="btn btn-gradient btn-lg">
            <span aria-hidden="true">🏠</span> Back to Home
          </Link>
          <button
            className="btn btn-outline btn-lg"
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Sign in'}
          </button>
        </div>

        <div style={{ marginTop: '2.5rem', width: '100%', maxWidth: '32rem' }}>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-subtle)', marginBottom: '0.75rem' }}>
            Popular destinations
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { to: '/templates', label: 'Templates' },
              { to: '/features', label: 'Features' },
              { to: '/pricing', label: 'Pricing' },
              { to: '/help', label: 'Help Center' },
              { to: '/resumes/create', label: 'Create Resume' },
            ].map((l) => (
              <Link key={l.to} to={l.to} className="badge badge-neutral" style={{ padding: '0.5rem 0.875rem' }}>
                {l.label} →
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
