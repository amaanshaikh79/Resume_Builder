import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import '../styles/design-system.css';
import './Auth.css';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { info } = useToast();

  React.useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    setSent(true);
    info('Reset link sent', `Check ${email} for instructions.`);
  };

  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="auth-gradient" />
        <div className="auth-shapes">
          <div className="shape shape-1" />
          <div className="shape shape-2" />
          <div className="shape shape-3" />
        </div>
      </div>

      <div className="auth-container">
        <div className="auth-branding">
          <div className="branding-content">
            <div className="brand-logo">
              <div className="logo-icon" aria-hidden="true">🚀</div>
              <h1 className="brand-name">AI Resume Builder</h1>
            </div>
            <h2 className="branding-title">
              Reset your <span className="text-gradient">password</span>
            </h2>
            <p className="branding-description">
              Enter the email associated with your account and we'll send you a secure link to set
              a new password. The link expires in 30 minutes.
            </p>
            <div className="branding-features">
              <div className="feature-item">
                <div className="feature-check">✓</div>
                <span>Secure token-based reset</span>
              </div>
              <div className="feature-item">
                <div className="feature-check">✓</div>
                <span>Expires in 30 minutes</span>
              </div>
              <div className="feature-item">
                <div className="feature-check">✓</div>
                <span>Works on any device</span>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-form-container">
          <div className="auth-card">
            <div className="auth-header">
              <h2 className="auth-title">Forgot your password?</h2>
              <p className="auth-subtitle">
                Remembered it?{' '}
                <Link to="/login" className="auth-link">Back to sign in</Link>
              </p>
            </div>

            {error && (
              <div className="alert alert-error" role="alert">
                <span className="alert-icon">⚠️</span>
                <span className="alert-message">{error}</span>
              </div>
            )}

            {sent ? (
              <div className="reset-sent">
                <div className="reset-sent-icon" aria-hidden="true">✉️</div>
                <h3>Check your inbox</h3>
                <p>
                  We sent a reset link to <strong>{email}</strong>. Didn't receive it? Check spam or
                  try again.
                </p>
                <button className="btn btn-gradient btn-md btn-full" onClick={() => setSent(false)} type="button">
                  Send again
                </button>
                <Link to="/login" className="btn btn-outline btn-md btn-full" style={{ marginTop: '0.75rem' }}>
                  Back to sign in
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label htmlFor="fp-email" className="form-label">Email address</label>
                  <div className="input-wrapper">
                    <span className="input-icon" aria-hidden="true">📧</span>
                    <input
                      type="email"
                      id="fp-email"
                      className="form-input"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-gradient btn-lg btn-full" disabled={loading}>
                  {loading ? 'Sending…' : 'Send reset link'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
