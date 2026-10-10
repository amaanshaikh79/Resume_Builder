import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import '../styles/design-system.css';
import './Marketing.css';

interface Category {
  icon: string;
  title: string;
  desc: string;
  articles: string[];
}

const CATEGORIES: Category[] = [
  {
    icon: '🚀',
    title: 'Getting Started',
    desc: 'Create your account and build your first resume in minutes.',
    articles: [
      'How to create your first resume',
      'Choosing the right template',
      'Understanding the editor layout',
      'Importing your existing resume',
    ],
  },
  {
    icon: '📝',
    title: 'Building Resumes',
    desc: 'Sections, formatting, templates and export tips.',
    articles: [
      'Adding experience & education',
      'Using the live preview',
      'Reordering and hiding sections',
      'Exporting to PDF correctly',
    ],
  },
  {
    icon: '🤖',
    title: 'AI Features',
    desc: 'Summaries, bullet points, cover letters and skill extraction.',
    articles: [
      'Generating an AI summary',
      'Improving job descriptions with AI',
      'Writing cover letters with AI',
      'How AI credits work',
    ],
  },
  {
    icon: '📊',
    title: 'ATS & Scoring',
    desc: 'Beat applicant tracking systems with real scoring data.',
    articles: [
      'Running an ATS analysis',
      'Understanding your score breakdown',
      'Fixing keyword gaps',
      'Predicting your job category with ML',
    ],
  },
  {
    icon: '⚙️',
    title: 'Account',
    desc: 'Profile, security, preferences and data controls.',
    articles: [
      'Updating your profile',
      'Changing your password',
      'Switching to dark mode',
      'Deleting your account & data',
    ],
  },
  {
    icon: '💳',
    title: 'Billing',
    desc: 'Plans, invoices, refunds and cancellations.',
    articles: [
      'Upgrading to Pro',
      'Cancelling your subscription',
      'Student discounts',
      'Requesting a refund',
    ],
  },
];

const Help: React.FC = () => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<string | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const out: Array<{ cat: string; article: string }> = [];
    CATEGORIES.forEach((c) =>
      c.articles.forEach((a) => {
        if (a.toLowerCase().includes(q) || c.title.toLowerCase().includes(q)) {
          out.push({ cat: c.title, article: a });
        }
      })
    );
    return out.slice(0, 8);
  }, [query]);

  return (
    <div className="marketing-page">
      <section className="mk-hero">
        <div className="container mk-hero-inner">
          <span className="mk-badge">💬 Help Center</span>
          <h1 className="mk-hero-title">
            How can we <span className="text-gradient">help?</span>
          </h1>
          <p className="mk-hero-sub">Search our guides or browse by category. Can't find it? Contact support.</p>

          <div className="help-search">
            <input
              className="field"
              style={{ padding: '0.875rem 1rem', fontSize: 'var(--text-base)', borderRadius: 'var(--radius-full)' }}
              placeholder="Search articles… (e.g. ATS score, cover letter)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search help articles"
            />
          </div>

          {results.length > 0 && (
            <div
              className="help-articles"
              style={{ maxWidth: '36rem', margin: '1rem auto 0', textAlign: 'left' }}
            >
              {results.map((r) => (
                <div className="help-article" key={r.cat + r.article}>
                  <span className="help-article-title">{r.article}</span>
                  <span className="help-article-meta">{r.cat}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="heading-2">Browse by category</h2>
            <p className="section-description">Step-by-step guides for every feature</p>
          </div>

          <div className="help-categories">
            {CATEGORIES.map((c) => (
              <div
                className="help-card"
                key={c.title}
                onClick={() => setOpen(open === c.title ? null : c.title)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setOpen(open === c.title ? null : c.title);
                  }
                }}
              >
                <div className="help-card-icon" aria-hidden="true">{c.icon}</div>
                <div className="help-card-title">{c.title}</div>
                <div className="help-card-desc">{c.desc}</div>

                {open === c.title && (
                  <div className="help-articles" style={{ marginTop: '1rem' }}>
                    {c.articles.map((a) => (
                      <div className="help-article" key={a}>
                        <span className="help-article-title">{a}</span>
                        <span aria-hidden="true">→</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div
            className="contact-card"
            style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}
          >
            <div>
              <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                Still stuck?
              </h3>
              <p style={{ color: 'var(--text-muted)', margin: '0.375rem 0 0', fontSize: 'var(--text-sm)' }}>
                Our support team replies within 24 hours on weekdays.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link to="/contact" className="btn btn-gradient btn-md">
                Contact Support
              </Link>
              <Link to="/features" className="btn btn-outline btn-md">
                Explore Features
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Help;
