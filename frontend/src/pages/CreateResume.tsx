import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import apiService from '../services/api';
import { ResumeData } from '../types';
import { useToast } from '../context/ToastContext';
import Button from '../components/Button';
import '../styles/design-system.css';
import '../components/Layout.css';
import './CreateResume.css';

const TEMPLATES = [
  { id: 'modern', name: 'Modern', description: 'Clean, contemporary design with color accents', best: 'Tech, Startups', grad: 'linear-gradient(135deg,#667eea,#764ba2)' },
  { id: 'professional', name: 'Professional', description: 'Traditional, business-focused layout', best: 'Corporate, Finance', grad: 'linear-gradient(135deg,#4facfe,#00f2fe)' },
  { id: 'minimal', name: 'Minimal', description: 'Simple and elegant, content first', best: 'Design, Arts', grad: 'linear-gradient(135deg,#43e97b,#38f9d7)' },
  { id: 'executive', name: 'Executive', description: 'Sophisticated design for senior roles', best: 'Leadership, VP', grad: 'linear-gradient(135deg,#fa709a,#fee140)' },
  { id: 'ats', name: 'ATS Friendly', description: 'Maximum parseability for tracking systems', best: 'Large enterprises', grad: 'linear-gradient(135deg,#f093fb,#f5576c)' },
  { id: 'creative', name: 'Creative', description: 'Bold gradient header for creative roles', best: 'Designers, Marketing', grad: 'linear-gradient(135deg,#4facfe,#00f2fe)' },
  { id: 'academic', name: 'Academic', description: 'Structured format for research roles', best: 'Professors, PhDs', grad: 'linear-gradient(135deg,#6366f1,#a855f7)' },
];

const emptyResumeData: ResumeData = {
  personal: { fullName: '', title: '', email: '', phone: '', location: '', website: '', linkedin: '', github: '', portfolio: '' },
  summary: '',
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  achievements: [],
  languages: [],
  interests: [],
};

const CreateResume: React.FC = () => {
  const [title, setTitle] = useState('');
  const [selected, setSelected] = useState('modern');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { success } = useToast();
  const [searchParams] = useSearchParams();

  // Support /resumes/create?template=ats deep link from the templates page
  useEffect(() => {
    const t = searchParams.get('template');
    if (t && TEMPLATES.some((x) => x.id === t)) setSelected(t);
  }, [searchParams]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!title.trim()) {
      setError('Please give your resume a name');
      return;
    }
    setLoading(true);
    try {
      const resume = await apiService.createResume({
        title: title.trim(),
        template: selected,
        resume_data: emptyResumeData,
      });
      success('Resume created', 'Now add your details — autosave is on.');
      navigate(`/resumes/${resume.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to create resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-page page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Create New Resume</h1>
            <p className="page-subtitle">Name it, pick a template, and start building — you can switch templates anytime.</p>
          </div>
          <Link to="/resumes" className="btn btn-ghost btn-md">
            ← Back to resumes
          </Link>
        </div>

        <form onSubmit={handleCreate} className="create-layout">
          {/* Step 1 */}
          <section className="create-card">
            <div className="create-step">
              <span className="create-step-num">1</span>
              <div>
                <h2 className="create-step-title">Name your resume</h2>
                <p className="create-step-desc">Use a name that matches the role, e.g. “Frontend Engineer — Stripe”.</p>
              </div>
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="resume-title">
                Resume title <span className="field-required">*</span>
              </label>
              <input
                id="resume-title"
                className={`field ${error ? 'field-error' : ''}`}
                placeholder="e.g. Software Engineer Resume"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
              {error ? (
                <p className="field-error-text">⚠ {error}</p>
              ) : (
                <p className="field-help">You can rename it later from the editor.</p>
              )}
            </div>
          </section>

          {/* Step 2 */}
          <section className="create-card">
            <div className="create-step">
              <span className="create-step-num">2</span>
              <div>
                <h2 className="create-step-title">Choose a template</h2>
                <p className="create-step-desc">All templates are ATS-safe and print-perfect.</p>
              </div>
            </div>

            <div className="create-template-grid">
              {TEMPLATES.map((t) => (
                <div
                  key={t.id}
                  className={`create-template ${selected === t.id ? 'create-template-active' : ''}`}
                  onClick={() => setSelected(t.id)}
                  role="radio"
                  aria-checked={selected === t.id}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelected(t.id);
                    }
                  }}
                >
                  <div className="create-template-preview" style={{ background: t.grad }}>
                    <div className="tpl-mock" aria-hidden="true">
                      <span className="tpl-bar w60" />
                      <span className="tpl-bar w40" />
                      <span className="tpl-bar w85" />
                      <span className="tpl-bar w70" />
                    </div>
                    {selected === t.id && <span className="create-template-check">✓</span>}
                  </div>
                  <div className="create-template-info">
                    <strong>{t.name}</strong>
                    <span>{t.description}</span>
                    <em>Best for: {t.best}</em>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Actions */}
          <div className="create-actions">
            <Button type="button" variant="outline" size="lg" onClick={() => navigate('/resumes')}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient" size="lg" loading={loading}>
              Create & Open Editor →
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateResume;
