import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import '../styles/design-system.css';
import './Auth.css';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  const { register } = useAuth();
  const { info } = useToast();
  const navigate = useNavigate();

  const handleSocial = (provider: string) =>
    info(`${provider} sign-up`, 'Social sign-up will be available shortly. Use email & password for now.');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!agreedToTerms) {
      setError('Please agree to the Terms of Service');
      return;
    }

    setLoading(true);

    try {
      await register(email, password, fullName);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = (pass: string): { strength: string; color: string; width: string } => {
    if (pass.length === 0) return { strength: '', color: '', width: '0%' };
    if (pass.length < 6) return { strength: 'Weak', color: '#ef4444', width: '33%' };
    if (pass.length < 10) return { strength: 'Medium', color: '#f59e0b', width: '66%' };
    return { strength: 'Strong', color: '#10b981', width: '100%' };
  };

  const strength = passwordStrength(password);

  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="auth-gradient"></div>
        <div className="auth-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>

      <div className="auth-container">
        {/* Left Side - Branding */}
        <div className="auth-branding">
          <div className="branding-content">
            <div className="brand-logo">
              <div className="logo-icon">🚀</div>
              <h1 className="brand-name">AI Resume Builder</h1>
            </div>
            
            <h2 className="branding-title">
              Start building your <span className="text-gradient">dream career</span> today
            </h2>
            
            <p className="branding-description">
              Join 50,000+ professionals using AI to create winning resumes and land their dream jobs faster.
            </p>

            <div className="branding-features">
              <div className="feature-item">
                <div className="feature-check">✓</div>
                <span>Free Forever Plan</span>
              </div>
              <div className="feature-item">
                <div className="feature-check">✓</div>
                <span>No Credit Card Required</span>
              </div>
              <div className="feature-item">
                <div className="feature-check">✓</div>
                <span>AI-Powered Tools</span>
              </div>
              <div className="feature-item">
                <div className="feature-check">✓</div>
                <span>Instant Job Matching</span>
              </div>
            </div>

            <div className="testimonial-mini">
              <div className="testimonial-avatar-mini">👨‍💼</div>
              <div className="testimonial-content-mini">
                <p className="testimonial-text-mini">
                  "Landed my dream job at Google within 2 weeks of using this platform!"
                </p>
                <p className="testimonial-author-mini">- Michael Chen, Software Engineer</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Register Form */}
        <div className="auth-form-container">
          <div className="auth-card">
            <div className="auth-header">
              <h2 className="auth-title">Create your account</h2>
              <p className="auth-subtitle">
                Already have an account?{' '}
                <Link to="/login" className="auth-link">
                  Sign in here
                </Link>
              </p>
            </div>

            {error && (
              <div className="alert alert-error">
                <span className="alert-icon">⚠️</span>
                <span className="alert-message">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="fullName" className="form-label">
                  Full name
                </label>
                <div className="input-wrapper">
                  <span className="input-icon">👤</span>
                  <input
                    type="text"
                    id="fullName"
                    className="form-input"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email address
                </label>
                <div className="input-wrapper">
                  <span className="input-icon">📧</span>
                  <input
                    type="email"
                    id="email"
                    className="form-input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    className="form-input"
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="input-action"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {password && (
                  <div className="password-strength">
                    <div className="strength-bar">
                      <div 
                        className="strength-fill" 
                        style={{ width: strength.width, backgroundColor: strength.color }}
                      ></div>
                    </div>
                    <span className="strength-text" style={{ color: strength.color }}>
                      {strength.strength}
                    </span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm password
                </label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    className="form-input"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  className="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                />
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--neutral-700)' }}>
                  I agree to the{' '}
                  <a href="#" className="auth-link">Terms of Service</a> and{' '}
                  <a href="#" className="auth-link">Privacy Policy</a>
                </span>
              </label>

              <button
                type="submit"
                className="btn btn-gradient btn-lg btn-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-small"></span>
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create account</span>
                    <span className="btn-icon">→</span>
                  </>
                )}
              </button>
            </form>

            <div className="auth-divider">
              <span>Or sign up with</span>
            </div>

            <div className="social-buttons">
              <button className="social-btn" type="button" onClick={() => handleSocial('Google')}>
                <svg className="social-icon" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Google</span>
              </button>

              <button className="social-btn" type="button" onClick={() => handleSocial('GitHub')}>
                <svg className="social-icon" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span>GitHub</span>
              </button>

              <button className="social-btn" type="button" onClick={() => handleSocial('LinkedIn')}>
                <svg className="social-icon" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <span>LinkedIn</span>
              </button>
            </div>

            <p className="auth-footer">
              By creating an account, you agree to our{' '}
              <Link to="/terms" className="footer-link">Terms</Link> and have read and acknowledge the{' '}
              <Link to="/privacy" className="footer-link">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
