import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/design-system.css';
import './Marketing.css';

const TEAM = [
  { name: 'Amaan Khan', role: 'Founder & CEO', bio: 'Ex-Google recruiter. Believes every candidate deserves an unfair advantage.', avatar: '👨‍💼' },
  { name: 'Sara Patel', role: 'Head of ML', bio: 'PhD in NLP. Trained the category prediction model on 40K+ resumes.', avatar: '👩‍💻' },
  { name: 'David Okafor', role: 'Product Design', bio: 'Designs calm, fast interfaces that make building resumes actually enjoyable.', avatar: '🧑‍🎨' },
  { name: 'Mei Lin', role: 'ATS Engineer', bio: 'Reverse-engineered 30+ applicant tracking systems so yours always passes.', avatar: '👩‍🔬' },
];

const VALUES = [
  { icon: '🎯', title: 'Outcomes over features', text: 'We measure success in interviews landed, not buttons shipped.' },
  { icon: '🔒', title: 'Privacy by default', text: 'Your resume is yours. Encrypted, never sold, deletable in one click.' },
  { icon: '⚡', title: 'Fast & delightful', text: 'Sub-second autosave, instant preview, zero waiting around.' },
  { icon: '🧠', title: 'AI that assists, not replaces', text: 'You stay in control. AI drafts, you decide what ships.' },
];

const About: React.FC = () => (
  <div className="marketing-page">
    <section className="mk-hero">
      <div className="container mk-hero-inner">
        <span className="mk-badge">🌍 About us</span>
        <h1 className="mk-hero-title">
          We're on a mission to end the <span className="text-gradient">invisible resume</span>
        </h1>
        <p className="mk-hero-sub">
          75% of resumes are rejected by software before a human ever sees them. We fix that with
          AI that understands both algorithms and people.
        </p>
      </div>
    </section>

    {/* Story */}
    <section className="section">
      <div className="container">
        <div className="about-story">
          <div>
            <h2 className="heading-2" style={{ fontSize: 'var(--text-3xl)' }}>Our story</h2>
            <p className="about-body">
              It started with a simple frustration: brilliant people were getting rejected by
              software, not recruiters. After reviewing thousands of applications internally, we
              realized the problem wasn't talent — it was formatting, keywords, and structure.
            </p>
            <p className="about-body">
              So we built the tool we wished existed: a resume builder with a real ATS simulator,
              an ML model trained on 40,000+ resumes across 24 job categories, and AI writing that
              turns "responsible for X" into achievements recruiters actually remember.
            </p>
            <p className="about-body">
              Today, more than 50,000 professionals in 120 countries use AI Resume Builder to
              turn their experience into interviews.
            </p>
            <Link to="/register" className="btn btn-gradient btn-md" style={{ marginTop: '0.5rem' }}>
              Join them — it's free <span className="btn-icon">→</span>
            </Link>
          </div>

          <div className="about-visual">
            {[
              { icon: '📊', title: 'ATS pass rate', value: '+64% average improvement' },
              { icon: '⚡', title: 'Time to first draft', value: 'Under 8 minutes' },
              { icon: '🧠', title: 'Category prediction', value: '78% model accuracy' },
              { icon: '🎯', title: 'Interview rate', value: '3.2× more callbacks' },
            ].map((row) => (
              <div className="about-visual-row" key={row.title}>
                <span style={{ fontSize: '1.5rem' }} aria-hidden="true">{row.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: 'var(--text-sm)' }}>{row.title}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>{row.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>

    {/* Stats */}
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="container">
        <div className="stats-band">
          {[
            { v: '50K+', l: 'Resumes created' },
            { v: '120', l: 'Countries' },
            { v: '24', l: 'Job categories' },
            { v: '78%', l: 'ML accuracy' },
          ].map((s) => (
            <div className="stat-block" key={s.l}>
              <div className="stat-block-value">{s.v}</div>
              <div className="stat-block-label">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Values */}
    <section className="section" style={{ background: 'var(--surface-2)', borderBlock: '1px solid var(--border)' }}>
      <div className="container">
        <div className="section-header">
          <h2 className="heading-2">What we believe</h2>
          <p className="section-description">Four principles that shape every decision we make</p>
        </div>
        <div className="help-categories">
          {VALUES.map((v) => (
            <div className="help-card" key={v.title}>
              <div className="help-card-icon" aria-hidden="true">{v.icon}</div>
              <div className="help-card-title">{v.title}</div>
              <div className="help-card-desc">{v.text}</div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Team */}
    <section className="section">
      <div className="container">
        <div className="section-header">
          <h2 className="heading-2">Meet the team</h2>
          <p className="section-description">A small team obsessed with your next job offer</p>
        </div>
        <div className="team-grid">
          {TEAM.map((m) => (
            <div className="team-card" key={m.name}>
              <div style={{ fontSize: '3rem' }} aria-hidden="true">{m.avatar}</div>
              <div className="team-name">{m.name}</div>
              <div className="team-role">{m.role}</div>
              <p className="team-bio">{m.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="cta-section">
      <div className="container">
        <div className="cta-content">
          <h2 className="cta-title">Want to build with us?</h2>
          <p className="cta-description">We're hiring engineers, designers and ML folks who care about careers.</p>
          <Link to="/contact">
            <button className="btn btn-outline btn-xl cta-btn">
              Get in touch <span className="btn-icon">→</span>
            </button>
          </Link>
        </div>
      </div>
    </section>
  </div>
);

export default About;
