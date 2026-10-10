import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/design-system.css';
import './Marketing.css';
import './Templates.css';

interface Template {
  id: string;
  name: string;
  category: 'modern' | 'professional' | 'creative' | 'academic';
  description: string;
  features: string[];
  bestFor: string;
  gradient: string;
  accent: string;
}

const TEMPLATES: Template[] = [
  {
    id: 'modern', name: 'Modern', category: 'modern',
    description: 'Clean two-column layout with bold color accents and a skills sidebar.',
    features: ['Two-column layout', 'Sidebar skills', 'Color accents', 'Modern typography'],
    bestFor: 'Tech, Startups, Product',
    gradient: 'linear-gradient(135deg, #667eea, #764ba2)', accent: '#667eea',
  },
  {
    id: 'professional', name: 'Professional', category: 'professional',
    description: 'Centered header and strict single-column structure that recruiters know by heart.',
    features: ['Single column', 'Centered header', 'Classic styling', 'Universal appeal'],
    bestFor: 'Corporate, Finance, Legal',
    gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)', accent: '#0ea5e9',
  },
  {
    id: 'minimal', name: 'Minimal', category: 'professional',
    description: 'Content-first design with generous whitespace and understated grey headings.',
    features: ['Minimalist design', 'High readability', 'Clean spacing', 'Elegant fonts'],
    bestFor: 'Design, Architecture, Arts',
    gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)', accent: '#10b981',
  },
  {
    id: 'executive', name: 'Executive', category: 'professional',
    description: 'Serif typography and gold accents built for senior leadership resumes.',
    features: ['Premium styling', 'Leadership focus', 'Achievement highlights', 'Executive summary'],
    bestFor: 'C-Suite, VP, Senior Management',
    gradient: 'linear-gradient(135deg, #fa709a, #fee140)', accent: '#d97706',
  },
  {
    id: 'ats', name: 'ATS Friendly', category: 'professional',
    description: 'Plain headings, standard sections and zero graphics — maximum parseability.',
    features: ['ATS compatible', 'Keyword optimized', 'Standard headings', 'Maximum compatibility'],
    bestFor: 'Large companies, Online portals',
    gradient: 'linear-gradient(135deg, #f093fb, #f5576c)', accent: '#ec4899',
  },
  {
    id: 'creative', name: 'Creative', category: 'creative',
    description: 'Gradient header band and vibrant skill chips that stand out in a stack.',
    features: ['Creative layout', 'Gradient header', 'Portfolio showcase', 'Unique styling'],
    bestFor: 'Designers, Artists, Marketing',
    gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)', accent: '#764ba2',
  },
  {
    id: 'academic', name: 'Academic', category: 'academic',
    description: 'Serif headings and formal structure for research and teaching positions.',
    features: ['Research focus', 'Publications friendly', 'Formal formatting', 'Detailed sections'],
    bestFor: 'Professors, Researchers, PhDs',
    gradient: 'linear-gradient(135deg, #6366f1, #a855f7)', accent: '#4338ca',
  },
];

const FILTERS = [
  { id: 'all', label: 'All templates' },
  { id: 'modern', label: 'Modern' },
  { id: 'professional', label: 'Professional' },
  { id: 'creative', label: 'Creative' },
  { id: 'academic', label: 'Academic' },
];

/** Miniature rendered preview mimicking each template layout */
const TemplatePreview: React.FC<{ t: Template }> = ({ t }) => {
  const bar = (w: number, h = 6, color = '#d1d5db') => (
    <span className="tp-bar" style={{ width: `${w}%`, height: h, background: color }} />
  );

  if (t.id === 'modern' || t.id === 'creative') {
    return (
      <div className={`tp tp-2col ${t.id === 'creative' ? 'tp-creative' : ''}`}>
        <div className="tp-header" style={{ background: t.gradient }}>
          <span className="tp-name" />
          <span className="tp-sub" />
        </div>
        <div className="tp-cols">
          <div className="tp-col-main">
            {bar(70, 5, t.accent)}
            {bar(100)}
            {bar(92)}
            {bar(60)}
            <div style={{ height: 8 }} />
            {bar(70, 5, t.accent)}
            {bar(100)}
            {bar(85)}
          </div>
          <div className="tp-col-side">
            {bar(90, 5, t.accent)}
            <div className="tp-chips">
              {Array.from({ length: 6 }).map((_, i) => (
                <span key={i} className="tp-chip" style={{ background: t.accent }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (t.id === 'ats') {
    return (
      <div className="tp tp-single">
        <div className="tp-header tp-header-plain">
          <span className="tp-name" style={{ background: '#111' }} />
          <span className="tp-sub" style={{ background: '#333' }} />
        </div>
        {[0, 1, 2].map((k) => (
          <div key={k} style={{ marginBottom: 10 }}>
            {bar(45, 6, '#111')}
            <div style={{ height: 4 }} />
            {bar(100, 4, '#999')}
            {bar(88, 4, '#999')}
          </div>
        ))}
      </div>
    );
  }

  if (t.id === 'academic') {
    return (
      <div className="tp tp-single tp-academic">
        <div className="tp-header tp-header-center">
          <span className="tp-name" style={{ background: '#1e3a8a' }} />
          <span className="tp-sub" style={{ background: '#60a5fa' }} />
        </div>
        {[0, 1].map((k) => (
          <div key={k} style={{ marginBottom: 10 }}>
            {bar(55, 6, '#1e3a8a')}
            <div style={{ height: 4 }} />
            {bar(100, 4, '#94a3b8')}
            {bar(82, 4, '#94a3b8')}
          </div>
        ))}
      </div>
    );
  }

  if (t.id === 'executive') {
    return (
      <div className="tp tp-single">
        <div className="tp-header" style={{ borderBottom: `3px solid ${t.accent}` }}>
          <span className="tp-name" style={{ background: '#0f172a', height: 12 }} />
          <span className="tp-sub" style={{ background: t.accent }} />
        </div>
        {[0, 1].map((k) => (
          <div key={k} style={{ marginBottom: 10 }}>
            {bar(60, 6, '#0f172a')}
            <div style={{ height: 4 }} />
            {bar(100, 4, '#cbd5e1')}
            {bar(90, 4, '#cbd5e1')}
          </div>
        ))}
      </div>
    );
  }

  // professional / minimal
  return (
    <div className="tp tp-single">
      <div className="tp-header tp-header-center">
        <span className="tp-name" style={{ background: t.id === 'minimal' ? '#4b5563' : '#111' }} />
        <span className="tp-sub" style={{ background: t.accent }} />
      </div>
      {[0, 1].map((k) => (
        <div key={k} style={{ marginBottom: 10 }}>
          {bar(50, 6, '#111')}
          <div style={{ height: 4 }} />
          {bar(100, 4, '#9ca3af')}
          {bar(86, 4, '#9ca3af')}
        </div>
      ))}
    </div>
  );
};

const Templates: React.FC = () => {
  const [filter, setFilter] = useState('all');
  const [preview, setPreview] = useState<Template | null>(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const list = useMemo(
    () => (filter === 'all' ? TEMPLATES : TEMPLATES.filter((t) => t.category === filter)),
    [filter]
  );

  const useTemplate = (t: Template) => {
    navigate(isAuthenticated ? `/resumes/create?template=${t.id}` : '/register');
  };

  return (
    <div className="marketing-page">
      {/* Hero */}
      <section className="mk-hero">
        <div className="container mk-hero-inner">
          <span className="mk-badge">🎨 Professional Templates</span>
          <h1 className="mk-hero-title">
            7 templates that <span className="text-gradient">pass the scan</span>
          </h1>
          <p className="mk-hero-sub">
            Every design is recruiter-reviewed and ATS-tested. Switch between them instantly without
            losing a single word of content.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="section" style={{ paddingBottom: '1.5rem' }}>
        <div className="container">
          <div className="tpl-filters" role="tablist" aria-label="Template categories">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                className={`filter-chip ${filter === f.id ? 'filter-active' : ''}`}
                onClick={() => setFilter(f.id)}
                role="tab"
                aria-selected={filter === f.id}
                type="button"
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section style={{ paddingBottom: '4rem' }}>
        <div className="container">
          <div className="tpl-grid">
            {list.map((t) => (
              <article key={t.id} className="tpl-card">
                <div className="tpl-preview" onClick={() => setPreview(t)} role="button" tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setPreview(t)}>
                  <TemplatePreview t={t} />
                  <span className="tpl-preview-hint">Click to preview</span>
                </div>

                <div className="tpl-body">
                  <div className="tpl-name-row">
                    <h3 className="tpl-name">{t.name}</h3>
                    <span className="badge badge-neutral">{t.category}</span>
                  </div>
                  <p className="tpl-desc">{t.description}</p>

                  <ul className="tpl-features">
                    {t.features.map((f) => (
                      <li key={f}>
                        <span className="check" aria-hidden="true">✓</span> {f}
                      </li>
                    ))}
                  </ul>

                  <div className="tpl-bestfor">
                    <span>Best for</span>
                    <strong>{t.bestFor}</strong>
                  </div>

                  <div className="tpl-actions">
                    <button className="btn btn-gradient btn-md btn-full" onClick={() => useTemplate(t)}>
                      Use This Template
                    </button>
                    <button className="btn btn-ghost btn-md btn-full" onClick={() => setPreview(t)}>
                      Preview
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Create Your Resume?</h2>
            <p className="cta-description">
              Pick a template and start building your professional resume today
            </p>
            <Link to={isAuthenticated ? '/resumes/create' : '/register'}>
              <button className="btn btn-outline btn-xl cta-btn">Get Started Free →</button>
            </Link>
            <p className="cta-note">✨ Free forever plan · No credit card required</p>
          </div>
        </div>
      </section>

      {/* Preview modal */}
      {preview && (
        <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setPreview(null)}>
          <div className="modal-panel modal-lg">
            <div className="modal-header">
              <h3 className="modal-title">{preview.name} template</h3>
              <button className="modal-close" onClick={() => setPreview(null)} aria-label="Close preview">×</button>
            </div>
            <div className="modal-body tpl-modal-body">
              <TemplatePreview t={preview} />
              <div className="tpl-modal-meta">
                <p>{preview.description}</p>
                <p className="tpl-modal-best">Best for: <strong>{preview.bestFor}</strong></p>
                <button className="btn btn-gradient btn-lg" onClick={() => { const t = preview; setPreview(null); useTemplate(t); }}>
                  Use This Template →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Templates;
