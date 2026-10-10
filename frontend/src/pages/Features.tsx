import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/design-system.css';
import './Marketing.css';
import './Features.css';

const FEATURES = [
  { icon: '✨', title: 'AI-Powered Writing', description: 'Generate professional summaries, bullet points and cover letters using advanced AI — trained on resumes that actually got interviews.', color: '#a855f7', detail: 'Choose a tone (professional, confident, friendly), and AI rewrites your duties into measurable achievements. Every suggestion is a draft you approve before it enters your resume.' },
  { icon: '🎯', title: 'ATS Optimization', description: 'Ensure your resume passes Applicant Tracking Systems with our comprehensive analyzer and 0–100 scoring.', color: '#10b981', detail: 'We simulate how Workday, Taleo and Greenhouse parse your file: section detection, keyword coverage, formatting compatibility and readability.' },
  { icon: '🧠', title: 'ML Category Prediction', description: 'Machine learning predicts your job category from your resume text and helps target the right roles.', color: '#3b82f6', detail: 'A classifier trained on 40,000+ resumes across 24 categories returns your top-3 predicted roles with confidence scores.' },
  { icon: '📄', title: 'Professional Templates', description: '7 expertly designed templates for different industries, all tested with recruiters and parsers.', color: '#6366f1', detail: 'Modern, Professional, Minimal, Executive, ATS Friendly, Creative and Academic — switch templates instantly without losing content.' },
  { icon: '📊', title: 'Real-time Analytics', description: 'Get instant feedback on your resume strength with detailed scoring and actionable suggestions.', color: '#f97316', detail: 'Sub-scores for keywords, skills, formatting, experience and readability plus a prioritized fix list.' },
  { icon: '⚡', title: 'Quick Export', description: 'Download your resume as a pixel-perfect PDF instantly with formatting fully preserved.', color: '#eab308', detail: 'Print-optimized CSS renders A4 pages with correct margins, fonts and page breaks — no third-party service needed.' },
  { icon: '🔒', title: 'Secure & Private', description: 'Your data is encrypted in transit and at rest. We never sell or share your information.', color: '#ef4444', detail: 'TLS 1.3 in transit, AES-256 at rest, hardware-key MFA on our systems, and one-click account deletion.' },
  { icon: '👥', title: 'Unlimited Resumes', description: 'Create as many tailored versions as you need for different job applications.', color: '#ec4899', detail: 'Duplicate any resume with one click, tweak it for the role, and keep every version organized and searchable.' },
  { icon: '⏱️', title: 'Auto-Save & Versions', description: 'Never lose your work — changes save automatically with full version history.', color: '#14b8a6', detail: 'Every save creates a restorable version. Undo/redo history lives in the editor for rapid iteration.' },
];

const STEPS = [
  { step: 1, title: 'Sign up', description: 'Create your free account in seconds — no credit card.' },
  { step: 2, title: 'Choose template', description: 'Pick from 7 professional, ATS-safe designs.' },
  { step: 3, title: 'Add content', description: 'Fill in your details or let AI draft them for you.' },
  { step: 4, title: 'Score & download', description: 'Run the ATS check, fix suggestions, export PDF.' },
];

const COMPARE = [
  { label: 'Writing a strong summary', without: '20–40 min of staring at a blank box', with: '10 seconds with AI, edited by you' },
  { label: 'Tailoring to a job description', without: 'Guessing which keywords matter', with: 'Keyword gap analysis against the JD' },
  { label: 'ATS compatibility', without: 'Hope for the best', with: '0–100 score with 5 sub-metrics' },
  { label: 'Skill listing', without: 'Manually scanning old resumes', with: 'Auto-extraction of 200+ skills' },
  { label: 'Multiple versions', without: 'Copy-paste files with (final)_v3 names', with: 'One-click duplicate, fully managed' },
];

const BENEFITS = [
  'AI-powered content generation',
  'ATS-optimized templates',
  'Real-time scoring and feedback',
  'ML-based job matching',
  'Unlimited resume versions',
  'Professional designs',
  'Automatic version history',
  'One-click PDF export',
];

const Features: React.FC = () => {
  const [openFeature, setOpenFeature] = useState<number | null>(0);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="marketing-page">
      {/* Hero */}
      <section className="mk-hero">
        <div className="container mk-hero-inner">
          <span className="mk-badge">⚡ Powerful Features</span>
          <h1 className="mk-hero-title">
            Everything you need to get <span className="text-gradient">hired</span>
          </h1>
          <p className="mk-hero-sub">
            Nine integrated tools — AI writing, real ATS scoring, ML predictions and beautiful
            templates — in one editor that stays out of your way.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-outline btn-lg cta-btn" onClick={() => navigate(isAuthenticated ? '/resumes/create' : '/register')}>
              {isAuthenticated ? 'Start Building' : 'Get Started Free'} →
            </button>
            <Link to="/templates" className="btn btn-ghost btn-lg" style={{ color: '#fff' }}>
              Browse Templates
            </Link>
          </div>
        </div>
      </section>

      {/* Feature grid with expandable detail */}
      <section className="section">
        <div className="container">
          <div className="features-full-grid">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className={`full-feature ${openFeature === i ? 'full-feature-open' : ''}`}
                onClick={() => setOpenFeature(openFeature === i ? null : i)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setOpenFeature(openFeature === i ? null : i);
                  }
                }}
              >
                <div className="full-feature-head">
                  <span className="full-feature-icon" style={{ background: `${f.color}1f`, color: f.color }}>
                    {f.icon}
                  </span>
                  <div className="full-feature-text">
                    <h3>{f.title}</h3>
                    <p>{f.description}</p>
                  </div>
                  <span className={`full-feature-chevron ${openFeature === i ? 'open' : ''}`}>▾</span>
                </div>
                {openFeature === i && <div className="full-feature-detail">{f.detail}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* With vs Without */}
      <section className="section compare-section">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">⚖️ The difference</span>
            <h2 className="heading-2">With AI vs without</h2>
            <p className="section-description">Same experience, dramatically different workflow</p>
          </div>

          <div className="compare-table">
            <div className="compare-row compare-head">
              <span>Task</span>
              <span className="compare-without">Without AI</span>
              <span className="compare-with">With AI Resume Builder</span>
            </div>
            {COMPARE.map((row) => (
              <div className="compare-row" key={row.label}>
                <span className="compare-task">{row.label}</span>
                <span className="compare-without">✗ {row.without}</span>
                <span className="compare-with">✓ {row.with}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">🧭 Simple, fast, effective</span>
            <h2 className="heading-2">How it works</h2>
          </div>
          <div className="steps-grid">
            {STEPS.map((item) => (
              <div className="step-box" key={item.step}>
                <div className="step-box-num">{item.step}</div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section benefits-section">
        <div className="container">
          <div className="benefits-layout">
            <div>
              <span className="section-eyebrow">✅ Why choose us</span>
              <h2 className="heading-2" style={{ fontSize: 'var(--text-3xl)', marginBottom: '1.5rem' }}>
                Built for outcomes, not busywork
              </h2>
              <ul className="benefits-list">
                {BENEFITS.map((b) => (
                  <li key={b}>
                    <span className="check" aria-hidden="true">✓</span>
                    {b}
                  </li>
                ))}
              </ul>
              <button className="btn btn-gradient btn-lg" onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')} style={{ marginTop: '1.5rem' }}>
                Get Started Free →
              </button>
            </div>

            <div className="benefits-visual" aria-hidden="true">
              <div className="bv-card">
                <div className="bv-row">
                  <span>ATS Score</span>
                  <strong className="bv-green">92/100</strong>
                </div>
                <div className="bv-bar"><i style={{ width: '92%' }} /></div>
                <div className="bv-row">
                  <span>Keywords</span>
                  <strong>88/100</strong>
                </div>
                <div className="bv-bar"><i style={{ width: '88%' }} /></div>
                <div className="bv-row">
                  <span>Formatting</span>
                  <strong>96/100</strong>
                </div>
                <div className="bv-bar"><i style={{ width: '96%' }} /></div>
                <div className="bv-chips">
                  <span>Python</span><span>React</span><span>AWS</span><span>+21</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Build Your Resume?</h2>
            <p className="cta-description">Join thousands of job seekers who landed their dream jobs</p>
            <Link to={isAuthenticated ? '/dashboard' : '/register'}>
              <button className="btn btn-outline btn-xl cta-btn">
                Start Building Now →
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Features;
