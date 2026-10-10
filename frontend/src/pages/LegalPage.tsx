import React from 'react';
import '../styles/design-system.css';
import './Marketing.css';

interface Section {
  id: string;
  heading: string;
  body: string[];
}

export interface LegalPageProps {
  title: string;
  updated: string;
  intro: string;
  sections: Section[];
}

const LegalPage: React.FC<LegalPageProps> = ({ title, updated, intro, sections }) => (
  <div className="marketing-page">
    <section className="mk-hero" style={{ padding: '3.5rem 0 3rem' }}>
      <div className="container mk-hero-inner">
        <span className="mk-badge">⚖️ Legal</span>
        <h1 className="mk-hero-title">{title}</h1>
        <p className="mk-hero-sub" style={{ marginBottom: 0 }}>Last updated: {updated}</p>
      </div>
    </section>

    <section className="section">
      <div className="container">
        <div className="legal-layout">
          <nav className="legal-toc" aria-label="Table of contents">
            <div className="legal-toc-title">On this page</div>
            {sections.map((s) => (
              <a key={s.id} href={`#${s.id}`}>
                {s.heading}
              </a>
            ))}
          </nav>

          <div className="legal-content">
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.75, fontSize: 'var(--text-sm)' }}>{intro}</p>
            {sections.map((s) => (
              <section key={s.id} id={s.id}>
                <h2>{s.heading}</h2>
                {s.body.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </section>
            ))}
          </div>
        </div>
      </div>
    </section>
  </div>
);

export default LegalPage;
