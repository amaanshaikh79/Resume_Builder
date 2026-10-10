import React from 'react';
import { ResumeData } from '../../types';
import './ResumePreview.css';

const has = (v?: string) => !!v && v.trim().length > 0;

interface Props {
  data: ResumeData;
  template: string;
  /** Section visibility toggles (default all visible) */
  hidden?: string[];
  scale?: number;
}

const SECTION_ORDER = ['summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'achievements', 'languages'];

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="rp-section-title">{children}</h3>
);

const formatDate = (v?: string) => {
  if (!has(v)) return '';
  const d = new Date(v!);
  if (isNaN(d.getTime())) return v!;
  return d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
};

export const ResumePreview: React.FC<Props> = ({ data, template = 'modern', hidden = [], scale = 1 }) => {
  const tpl = `rp rp-${template}`;
  const show = (key: string) => !hidden.includes(key);
  const p = data.personal || ({} as ResumeData['personal']);

  const contactLine = [
    p.email,
    p.phone,
    p.location,
    p.website,
    p.linkedin,
    p.github,
    p.portfolio,
  ]
    .filter(has)
    .join('  •  ');

  const renderSection = (key: string) => {
    if (!show(key)) return null;
    switch (key) {
      case 'summary':
        return has(data.summary) ? (
          <section className="rp-section" key={key}>
            <SectionTitle>Professional Summary</SectionTitle>
            <p className="rp-summary">{data.summary}</p>
          </section>
        ) : null;

      case 'experience':
        return data.experience?.length ? (
          <section className="rp-section" key={key}>
            <SectionTitle>Work Experience</SectionTitle>
            {data.experience.map((exp, i) => (
              <div className="rp-entry" key={exp.id || i}>
                <div className="rp-entry-head">
                  <div>
                    <div className="rp-entry-title">{has(exp.jobTitle) ? exp.jobTitle : 'Job Title'}</div>
                    <div className="rp-entry-sub">
                      {has(exp.company) ? exp.company : 'Company'}
                      {has(exp.location) ? ` · ${exp.location}` : ''}
                    </div>
                  </div>
                  <div className="rp-entry-date">
                    {formatDate(exp.startDate) || 'Start'} — {exp.current ? 'Present' : formatDate(exp.endDate) || 'End'}
                  </div>
                </div>
                {has(exp.description) && <p className="rp-entry-desc">{exp.description}</p>}
                {exp.bulletPoints?.filter(has).length > 0 && (
                  <ul className="rp-bullets">
                    {exp.bulletPoints.filter(has).map((b, j) => (
                      <li key={j}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </section>
        ) : null;

      case 'education':
        return data.education?.length ? (
          <section className="rp-section" key={key}>
            <SectionTitle>Education</SectionTitle>
            {data.education.map((ed, i) => (
              <div className="rp-entry" key={ed.id || i}>
                <div className="rp-entry-head">
                  <div>
                    <div className="rp-entry-title">{has(ed.degree) ? ed.degree : 'Degree'}</div>
                    <div className="rp-entry-sub">
                      {has(ed.institution) ? ed.institution : 'Institution'}
                      {has(ed.location) ? ` · ${ed.location}` : ''}
                    </div>
                  </div>
                  <div className="rp-entry-date">
                    {has(ed.startYear) ? ed.startYear : 'Start'} — {has(ed.endYear) ? ed.endYear : 'End'}
                  </div>
                </div>
                {has(ed.gpa) && <p className="rp-entry-desc">GPA: {ed.gpa}</p>}
                {has(ed.description) && <p className="rp-entry-desc">{ed.description}</p>}
              </div>
            ))}
          </section>
        ) : null;

      case 'skills':
        return data.skills?.length ? (
          <section className="rp-section" key={key}>
            <SectionTitle>Skills</SectionTitle>
            <div className="rp-skills">
              {data.skills.map((s, i) => (
                <span className="rp-skill" key={s.id || i} data-level={s.level} data-category={s.category}>
                  {s.name}
                </span>
              ))}
            </div>
          </section>
        ) : null;

      case 'projects':
        return data.projects?.length ? (
          <section className="rp-section" key={key}>
            <SectionTitle>Projects</SectionTitle>
            {data.projects.map((pr, i) => (
              <div className="rp-entry" key={pr.id || i}>
                <div className="rp-entry-head">
                  <div>
                    <div className="rp-entry-title">{has(pr.name) ? pr.name : 'Project'}</div>
                    <div className="rp-entry-sub">
                      {pr.technologies?.length ? pr.technologies.join(', ') : ''}
                    </div>
                  </div>
                  <div className="rp-entry-date">
                    {formatDate(pr.startDate)} {has(pr.endDate) ? `— ${formatDate(pr.endDate)}` : ''}
                  </div>
                </div>
                {has(pr.description) && <p className="rp-entry-desc">{pr.description}</p>}
                {(has(pr.url) || has(pr.github)) && (
                  <p className="rp-entry-links">
                    {[pr.url, pr.github].filter(has).join('  •  ')}
                  </p>
                )}
              </div>
            ))}
          </section>
        ) : null;

      case 'certifications':
        return data.certifications?.length ? (
          <section className="rp-section" key={key}>
            <SectionTitle>Certifications</SectionTitle>
            <ul className="rp-list">
              {data.certifications.map((c, i) => (
                <li key={c.id || i}>
                  <strong>{has(c.name) ? c.name : 'Certification'}</strong>
                  {has(c.organization) ? ` — ${c.organization}` : ''}
                  {has(c.issueDate) ? ` (${c.issueDate})` : ''}
                </li>
              ))}
            </ul>
          </section>
        ) : null;

      case 'achievements':
        return data.achievements?.length ? (
          <section className="rp-section" key={key}>
            <SectionTitle>Achievements</SectionTitle>
            <ul className="rp-list">
              {data.achievements.map((a, i) => (
                <li key={a.id || i}>
                  <strong>{has(a.title) ? a.title : 'Achievement'}</strong>
                  {has(a.description) ? ` — ${a.description}` : ''}
                </li>
              ))}
            </ul>
          </section>
        ) : null;

      case 'languages':
        return data.languages?.length ? (
          <section className="rp-section" key={key}>
            <SectionTitle>Languages</SectionTitle>
            <div className="rp-skills">
              {data.languages.map((l, i) => (
                <span className="rp-skill" key={l.id || i}>
                  {l.name} · {l.proficiency}
                </span>
              ))}
            </div>
          </section>
        ) : null;

      default:
        return null;
    }
  };

  const header = (
    <header className="rp-header">
      <div className="rp-identity">
        <h1 className="rp-name">{has(p.fullName) ? p.fullName : 'Your Name'}</h1>
        {has(p.title) && <div className="rp-title">{p.title}</div>}
      </div>
      {contactLine && <div className="rp-contact">{contactLine}</div>}
    </header>
  );

  // Executive / Academic get a slightly different header treatment
  const needsTwoCol = template === 'modern' || template === 'creative';

  if (needsTwoCol) {
    const sidebarKeys = ['skills', 'languages', 'certifications'];
    return (
      <div className={`${tpl}`} style={{ fontSize: `${scale}em` }}>
        {header}
        <div className="rp-columns">
          <div className="rp-main-col">{SECTION_ORDER.filter((k) => !sidebarKeys.includes(k)).map(renderSection)}</div>
          <aside className="rp-side-col">{sidebarKeys.map(renderSection)}</aside>
        </div>
      </div>
    );
  }

  return (
    <div className={tpl} style={{ fontSize: `${scale}em` }}>
      {header}
      <div className="rp-single">{SECTION_ORDER.map(renderSection)}</div>
    </div>
  );
};

export default ResumePreview;
