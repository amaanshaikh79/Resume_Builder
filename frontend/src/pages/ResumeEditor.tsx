import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import apiService from '../services/api';
import { Resume, ResumeData, Skill, Language, ATSAnalysis, CategoryPrediction } from '../types';
import { useToast } from '../context/ToastContext';
import { Modal, Tabs, Badge, ConfirmDialog } from '../components/ui';
import Button from '../components/Button';
import ResumePreview from '../components/editor/ResumePreview';
import ATSScoreModal from '../components/editor/ATSScoreModal';
import '../styles/design-system.css';
import '../components/Layout.css';
import './ResumeEditor.css';

const emptyData = (): ResumeData => ({
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
});

const TEMPLATES = [
  { id: 'modern', name: 'Modern' },
  { id: 'professional', name: 'Professional' },
  { id: 'minimal', name: 'Minimal' },
  { id: 'executive', name: 'Executive' },
  { id: 'ats', name: 'ATS Friendly' },
  { id: 'creative', name: 'Creative' },
  { id: 'academic', name: 'Academic' },
];

const TABS = [
  { id: 'personal', label: 'Personal', icon: '👤' },
  { id: 'summary', label: 'Summary', icon: '✍️' },
  { id: 'experience', label: 'Experience', icon: '💼' },
  { id: 'education', label: 'Education', icon: '🎓' },
  { id: 'skills', label: 'Skills', icon: '⚡' },
  { id: 'projects', label: 'Projects', icon: '🚀' },
  { id: 'certifications', label: 'Certs', icon: '🏆' },
  { id: 'achievements', label: 'Wins', icon: '🌟' },
  { id: 'languages', label: 'Languages', icon: '🌐' },
];

const uid = () => Math.random().toString(36).slice(2, 10);

/** Small labelled input used across editor forms */
const Row: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="ed-row">{children}</div>
);

const Field: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  span?: 1 | 2;
}> = ({ label, value, onChange, placeholder, type = 'text', span = 1 }) => (
  <div className={`ed-field ed-span-${span}`}>
    <label>
      <span>{label}</span>
      <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </label>
  </div>
);

const TextAreaField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}> = ({ label, value, onChange, placeholder, rows = 4 }) => (
  <div className="ed-field ed-span-2">
    <label>
      <span>{label}</span>
      <textarea rows={rows} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </label>
  </div>
);

const ResumeEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error: showError, info } = useToast();

  const [resume, setResume] = useState<Resume | null>(null);
  const [data, setData] = useState<ResumeData>(emptyData());
  const [title, setTitle] = useState('');
  const [template, setTemplate] = useState('modern');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [tab, setTab] = useState('personal');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [zoom, setZoom] = useState(1);
  const [previewOpenMobile, setPreviewOpenMobile] = useState(false);

  // Modals
  const [atsOpen, setAtsOpen] = useState(false);
  const [atsLoading, setAtsLoading] = useState(false);
  const [atsAnalysis, setAtsAnalysis] = useState<ATSAnalysis | null>(null);
  const [atsError, setAtsError] = useState('');
  const [jdOpen, setJdOpen] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [mlOpen, setMlOpen] = useState(false);
  const [mlResult, setMlResult] = useState<CategoryPrediction | null>(null);
  const [mlLoading, setMlLoading] = useState(false);
  const [coverOpen, setCoverOpen] = useState(false);
  const [coverForm, setCoverForm] = useState({ jobTitle: '', company: '', jobDescription: '', tone: 'professional' });
  const [coverText, setCoverText] = useState('');
  const [coverLoading, setCoverLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // AI busy flags
  const [aiBusy, setAiBusy] = useState<string | null>(null);

  // History (undo/redo)
  const history = useRef<ResumeData[]>([]);
  const histIndex = useRef(-1);
  const skipHistory = useRef(false);

  /* ---------------- Load ---------------- */
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await apiService.getResume(Number(id));
        if (!mounted) return;
        setResume(r);
        setData(r.resume_data || emptyData());
        setTitle(r.title);
        setTemplate(r.template || 'modern');
        history.current = [r.resume_data || emptyData()];
        histIndex.current = 0;
      } catch (e: any) {
        if (!mounted) return;
        setLoadError(e?.response?.data?.detail || 'Resume not found or you do not have access.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  /* ---------------- Autosave ---------------- */
  // Debounced autosave whenever data/title/template settle
  const update = useCallback((mutator: (draft: ResumeData) => ResumeData) => {
    setData((prev) => {
      const next = mutator(prev);
      if (!skipHistory.current) {
        history.current = [...history.current.slice(0, histIndex.current + 1), next].slice(-30);
        histIndex.current = history.current.length - 1;
      }
      skipHistory.current = false;
      return next;
    });
    setSaveState('saving');
  }, []);

  // Debounced autosave whenever data/title/template settle
  useEffect(() => {
    if (loading || !resume) return;
    setSaveState('saving');
    const t = setTimeout(async () => {
      try {
        await apiService.updateResume(Number(id), { title, template, resume_data: data } as any);
        setSaveState('saved');
        setSavedAt(new Date());
      } catch {
        setSaveState('error');
      }
    }, 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, title, template, loading]);

  const undo = () => {
    if (histIndex.current <= 0) return;
    histIndex.current -= 1;
    skipHistory.current = true;
    setData(history.current[histIndex.current]);
  };

  const redo = () => {
    if (histIndex.current >= history.current.length - 1) return;
    histIndex.current += 1;
    skipHistory.current = true;
    setData(history.current[histIndex.current]);
  };

  /* ---------------- ATS ---------------- */
  const runATS = async (jd?: string) => {
    setAtsOpen(true);
    setAtsLoading(true);
    setAtsError('');
    try {
      const res = await apiService.analyzeATS(data, jd ?? (jobDescription || undefined));
      setAtsAnalysis(res);
    } catch (e: any) {
      setAtsError(e?.response?.data?.detail || 'ATS analysis failed. Please try again.');
    } finally {
      setAtsLoading(false);
    }
  };

  const saveScore = async (score: number) => {
    try {
      await apiService.updateResume(Number(id), { ats_score: score } as any);
      setResume((p) => (p ? { ...p, ats_score: score } : p));
      success('ATS score saved', `${score}/100 saved to your resume.`);
      setAtsOpen(false);
    } catch {
      showError('Could not save score');
    }
  };

  /* ---------------- ML prediction ---------------- */
  const runML = async () => {
    setMlOpen(true);
    setMlLoading(true);
    setMlResult(null);
    try {
      const text = JSON.stringify(data);
      const res = await apiService.predictCategory(text);
      setMlResult(res);
    } catch (e: any) {
      showError('Prediction failed', e?.response?.data?.detail || 'ML model unavailable.');
      setMlOpen(false);
    } finally {
      setMlLoading(false);
    }
  };

  const savePrediction = async () => {
    if (!mlResult) return;
    try {
      await apiService.updateResume(Number(id), {
        predicted_category: mlResult.predicted_category,
        predicted_confidence: mlResult.confidence,
      } as any);
      setResume((p) =>
        p ? { ...p, predicted_category: mlResult.predicted_category, predicted_confidence: mlResult.confidence } : p
      );
      success('Category saved', `${mlResult.predicted_category} saved to your resume.`);
      setMlOpen(false);
    } catch {
      showError('Could not save prediction');
    }
  };

  /* ---------------- Cover letter ---------------- */
  const generateCoverLetter = async () => {
    setCoverLoading(true);
    try {
      const res = await apiService.generateCoverLetter({
        candidateName: data.personal.fullName,
        candidateEmail: data.personal.email,
        resumeData: data,
        jobTitle: coverForm.jobTitle,
        company: coverForm.company,
        jobDescription: coverForm.jobDescription,
        tone: coverForm.tone,
      });
      setCoverText(res.coverLetter);
    } catch (e: any) {
      showError('Cover letter failed', e?.response?.data?.detail || 'AI service unavailable.');
    } finally {
      setCoverLoading(false);
    }
  };

  /* ---------------- AI actions ---------------- */
  const generateSummary = async () => {
    setAiBusy('summary');
    try {
      const res = await apiService.generateSummary({
        jobTitle: data.personal.title || 'Professional',
        experienceLevel: 'mid',
        skills: data.skills.map((s) => s.name).slice(0, 10),
        tone: 'professional',
      });
      update((d) => ({ ...d, summary: res.summary }));
      success('Summary generated', 'Review and edit it before saving.');
    } catch (e: any) {
      showError('AI unavailable', e?.response?.data?.detail || 'Could not generate summary.');
    } finally {
      setAiBusy(null);
    }
  };

  const generateBullets = async (index: number) => {
    const exp = data.experience[index];
    setAiBusy(`bullets-${index}`);
    try {
      const res = await apiService.generateBulletPoints({
        jobTitle: exp.jobTitle,
        company: exp.company,
        description: exp.description || exp.jobTitle,
        count: 4,
      });
      update((d) => ({
        ...d,
        experience: d.experience.map((e, i) =>
          i === index ? { ...e, bulletPoints: [...(e.bulletPoints || []), ...res.bulletPoints] } : e
        ),
      }));
      success('Bullet points added', `${res.bulletPoints.length} suggestions inserted.`);
    } catch (e: any) {
      showError('AI unavailable', e?.response?.data?.detail || 'Could not generate bullets.');
    } finally {
      setAiBusy(null);
    }
  };

  const improveBullet = async (index: number, bulletIndex: number) => {
    const exp = data.experience[index];
    setAiBusy(`improve-${index}-${bulletIndex}`);
    try {
      const res = await apiService.improveExperience({
        jobTitle: exp.jobTitle,
        company: exp.company,
        description: exp.bulletPoints[bulletIndex],
        action: 'improve',
      });
      update((d) => ({
        ...d,
        experience: d.experience.map((e, i) =>
          i === index
            ? { ...e, bulletPoints: e.bulletPoints.map((b, j) => (j === bulletIndex ? res.improvedDescription : b)) }
            : e
        ),
      }));
      success('Bullet improved');
    } catch (e: any) {
      showError('AI unavailable', e?.response?.data?.detail || 'Could not improve bullet.');
    } finally {
      setAiBusy(null);
    }
  };

  /* ---------------- Export ---------------- */
  const exportPDF = () => {
    setPreviewOpenMobile(true);
    setTimeout(() => window.print(), 350);
  };

  const markComplete = async () => {
    try {
      await apiService.updateResume(Number(id), { status: 'complete' } as any);
      setResume((p) => (p ? { ...p, status: 'complete' } : p));
      success('Resume marked complete', 'Great job — it is ready to send.');
    } catch {
      showError('Could not update status');
    }
  };

  /* ---------------- Render helpers ---------------- */
  if (loading) {
    return (
      <div className="editor-page page">
        <div className="editor-loading">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--primary-500)' }} />
          <p>Loading your resume…</p>
        </div>
      </div>
    );
  }

  if (loadError || !resume) {
    return (
      <div className="editor-page page">
        <div className="editor-loading">
          <div style={{ fontSize: '2.5rem' }}>😕</div>
          <p>{loadError || 'Resume not found'}</p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button variant="outline" onClick={() => navigate('/resumes')}>Back to resumes</Button>
            <Button variant="gradient" onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  const saveLabel =
    saveState === 'saving'
      ? 'Saving…'
      : saveState === 'saved'
      ? `Saved ${savedAt ? relativeTime(savedAt) : ''}`
      : saveState === 'error'
      ? 'Save failed — retrying'
      : 'All changes saved';

  return (
    <div className="editor-page">
      {/* Toolbar */}
      <div className="editor-toolbar">
        <div className="toolbar-left">
          <Link to="/resumes" className="toolbar-back" aria-label="Back to resumes">←</Link>
          <input
            className="toolbar-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-label="Resume title"
            placeholder="Untitled Resume"
          />
          <span className={`save-indicator save-${saveState}`} aria-live="polite">
            {saveState === 'saving' ? '●' : saveState === 'error' ? '⚠' : '✓'} {saveLabel}
          </span>
          <Badge variant={resume.status === 'complete' ? 'success' : 'warning'} dot>
            {resume.status}
          </Badge>
        </div>

        <div className="toolbar-right">
          <button className="tool-btn" onClick={undo} title="Undo (all changes kept in history)" type="button">↶</button>
          <button className="tool-btn" onClick={redo} title="Redo" type="button">↷</button>

          <select
            className="tool-select"
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            aria-label="Template"
          >
            {TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>

          <button className="tool-btn tool-btn-label" onClick={() => setJdOpen(true)} type="button">
            📊 <span>ATS Score</span>
          </button>
          <button className="tool-btn tool-btn-label" onClick={runML} type="button">
            🧠 <span>Predict Category</span>
          </button>
          <button className="tool-btn tool-btn-label" onClick={() => setCoverOpen(true)} type="button">
            ✉️ <span>Cover Letter</span>
          </button>
          <button className="tool-btn tool-btn-label" onClick={exportPDF} type="button">
            ⬇️ <span>PDF</span>
          </button>
          <button className="btn btn-gradient btn-sm" onClick={markComplete} type="button">
            Mark Complete
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="editor-body">
        {/* Form panel */}
        <div className="editor-form">
          <div className="editor-tabs-wrap">
            <Tabs items={TABS} active={tab} onChange={setTab} variant="pill" />
          </div>

          <div className="editor-form-body">
            {/* ============ PERSONAL ============ */}
            {tab === 'personal' && (
              <div className="ed-section">
                <h3 className="ed-section-title">Personal Information</h3>
                <Row>
                  <Field label="Full name" value={data.personal.fullName} placeholder="Jane Doe"
                    onChange={(v) => update((d) => ({ ...d, personal: { ...d.personal, fullName: v } }))} />
                  <Field label="Professional title" value={data.personal.title} placeholder="Senior Software Engineer"
                    onChange={(v) => update((d) => ({ ...d, personal: { ...d.personal, title: v } }))} />
                </Row>
                <Row>
                  <Field label="Email" type="email" value={data.personal.email} placeholder="jane@example.com"
                    onChange={(v) => update((d) => ({ ...d, personal: { ...d.personal, email: v } }))} />
                  <Field label="Phone" value={data.personal.phone} placeholder="+1 555 000 1234"
                    onChange={(v) => update((d) => ({ ...d, personal: { ...d.personal, phone: v } }))} />
                </Row>
                <Row>
                  <Field label="Location" value={data.personal.location} placeholder="Bengaluru, India"
                    onChange={(v) => update((d) => ({ ...d, personal: { ...d.personal, location: v } }))} />
                  <Field label="Website" value={data.personal.website || ''} placeholder="janedoe.dev"
                    onChange={(v) => update((d) => ({ ...d, personal: { ...d.personal, website: v } }))} />
                </Row>
                <Row>
                  <Field label="LinkedIn" value={data.personal.linkedin || ''} placeholder="linkedin.com/in/janedoe"
                    onChange={(v) => update((d) => ({ ...d, personal: { ...d.personal, linkedin: v } }))} />
                  <Field label="GitHub" value={data.personal.github || ''} placeholder="github.com/janedoe"
                    onChange={(v) => update((d) => ({ ...d, personal: { ...d.personal, github: v } }))} />
                </Row>
                <Row>
                  <Field label="Portfolio" value={data.personal.portfolio || ''} placeholder="portfolio/janedoe"
                    onChange={(v) => update((d) => ({ ...d, personal: { ...d.personal, portfolio: v } }))} />
                </Row>
              </div>
            )}

            {/* ============ SUMMARY ============ */}
            {tab === 'summary' && (
              <div className="ed-section">
                <div className="ed-section-head">
                  <h3 className="ed-section-title">Professional Summary</h3>
                  <Button size="sm" variant="outline" onClick={generateSummary} loading={aiBusy === 'summary'}>
                    ✨ Generate with AI
                  </Button>
                </div>
                <TextAreaField
                  label="Summary"
                  rows={7}
                  value={data.summary}
                  placeholder="Results-driven professional with X years of experience…"
                  onChange={(v) => update((d) => ({ ...d, summary: v }))}
                />
                <p className="ed-hint">
                  Tip: 3–4 sentences. Lead with your role and years of experience, add 1–2 measurable
                  wins, and end with the value you bring.
                </p>
              </div>
            )}

            {/* ============ EXPERIENCE ============ */}
            {tab === 'experience' && (
              <div className="ed-section">
                <div className="ed-section-head">
                  <h3 className="ed-section-title">Work Experience</h3>
                  <Button
                    size="sm"
                    variant="gradient"
                    onClick={() =>
                      update((d) => ({
                        ...d,
                        experience: [
                          ...d.experience,
                          { id: uid(), jobTitle: '', company: '', location: '', startDate: '', endDate: '', current: false, description: '', bulletPoints: [] },
                        ],
                      }))
                    }
                  >
                    + Add experience
                  </Button>
                </div>

                {data.experience.length === 0 && (
                  <p className="ed-empty">No experience entries yet. Add your most recent role first.</p>
                )}

                {data.experience.map((exp, i) => (
                  <div className="ed-card" key={exp.id || i}>
                    <div className="ed-card-head">
                      <strong>{exp.jobTitle || `Role ${i + 1}`}</strong>
                      <div className="ed-card-actions">
                        <Button size="sm" variant="outline" onClick={() => generateBullets(i)} loading={aiBusy === `bullets-${i}`}>
                          ✨ AI bullets
                        </Button>
                        <button
                          className="tool-btn"
                          aria-label="Remove experience"
                          type="button"
                          onClick={() =>
                            update((d) => ({ ...d, experience: d.experience.filter((_, j) => j !== i) }))
                          }
                        >
                          🗑
                        </button>
                      </div>
                    </div>

                    <Row>
                      <Field label="Job title" value={exp.jobTitle} placeholder="Software Engineer"
                        onChange={(v) => update((d) => ({ ...d, experience: d.experience.map((e, j) => (j === i ? { ...e, jobTitle: v } : e)) }))} />
                      <Field label="Company" value={exp.company} placeholder="Acme Inc."
                        onChange={(v) => update((d) => ({ ...d, experience: d.experience.map((e, j) => (j === i ? { ...e, company: v } : e)) }))} />
                    </Row>
                    <Row>
                      <Field label="Location" value={exp.location} placeholder="Remote"
                        onChange={(v) => update((d) => ({ ...d, experience: d.experience.map((e, j) => (j === i ? { ...e, location: v } : e)) }))} />
                      <Field label="Start date" value={exp.startDate} placeholder="Jan 2022"
                        onChange={(v) => update((d) => ({ ...d, experience: d.experience.map((e, j) => (j === i ? { ...e, startDate: v } : e)) }))} />
                      <Field label="End date" value={exp.endDate} placeholder="Present"
                        onChange={(v) => update((d) => ({ ...d, experience: d.experience.map((e, j) => (j === i ? { ...e, endDate: v } : e)) }))} />
                    </Row>

                    <label className="ed-checkbox">
                      <input
                        type="checkbox"
                        checked={exp.current}
                        onChange={(e) =>
                          update((d) => ({ ...d, experience: d.experience.map((x, j) => (j === i ? { ...x, current: e.target.checked } : x)) }))
                        }
                      />
                      <span>I currently work here</span>
                    </label>

                    <TextAreaField
                      label="Description"
                      rows={3}
                      value={exp.description}
                      placeholder="What you were responsible for…"
                      onChange={(v) => update((d) => ({ ...d, experience: d.experience.map((e, j) => (j === i ? { ...e, description: v } : e)) }))}
                    />

                    {exp.bulletPoints.length > 0 && (
                      <div className="ed-bullets">
                        <span className="ed-bullets-label">Achievement bullets</span>
                        {exp.bulletPoints.map((b, bi) => (
                          <div className="ed-bullet-row" key={bi}>
                            <textarea
                              rows={2}
                              value={b}
                              onChange={(e) =>
                                update((d) => ({
                                  ...d,
                                  experience: d.experience.map((x, j) =>
                                    j === i ? { ...x, bulletPoints: x.bulletPoints.map((y, k) => (k === bi ? e.target.value : y)) } : x
                                  ),
                                }))
                              }
                            />
                            <div className="ed-bullet-actions">
                              <button
                                className="tool-btn"
                                title="Improve with AI"
                                type="button"
                                onClick={() => improveBullet(i, bi)}
                              >
                                ✨
                              </button>
                              <button
                                className="tool-btn"
                                title="Remove bullet"
                                type="button"
                                onClick={() =>
                                  update((d) => ({
                                    ...d,
                                    experience: d.experience.map((x, j) =>
                                      j === i ? { ...x, bulletPoints: x.bulletPoints.filter((_, k) => k !== bi) } : x
                                    ),
                                  }))
                                }
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ============ EDUCATION ============ */}
            {tab === 'education' && (
              <div className="ed-section">
                <div className="ed-section-head">
                  <h3 className="ed-section-title">Education</h3>
                  <Button
                    size="sm"
                    variant="gradient"
                    onClick={() =>
                      update((d) => ({
                        ...d,
                        education: [...d.education, { id: uid(), degree: '', institution: '', location: '', startYear: '', endYear: '', gpa: '', description: '' }],
                      }))
                    }
                  >
                    + Add education
                  </Button>
                </div>

                {data.education.length === 0 && (
                  <p className="ed-empty">No education entries yet.</p>
                )}

                {data.education.map((ed, i) => (
                  <div className="ed-card" key={ed.id || i}>
                    <div className="ed-card-head">
                      <strong>{ed.degree || `Degree ${i + 1}`}</strong>
                      <button
                        className="tool-btn"
                        aria-label="Remove education"
                        type="button"
                        onClick={() => update((d) => ({ ...d, education: d.education.filter((_, j) => j !== i) }))}
                      >
                        🗑
                      </button>
                    </div>
                    <Row>
                      <Field label="Degree" value={ed.degree} placeholder="B.Tech Computer Science"
                        onChange={(v) => update((d) => ({ ...d, education: d.education.map((e, j) => (j === i ? { ...e, degree: v } : e)) }))} />
                      <Field label="Institution" value={ed.institution} placeholder="IIT Bombay"
                        onChange={(v) => update((d) => ({ ...d, education: d.education.map((e, j) => (j === i ? { ...e, institution: v } : e)) }))} />
                    </Row>
                    <Row>
                      <Field label="Location" value={ed.location} placeholder="Mumbai, India"
                        onChange={(v) => update((d) => ({ ...d, education: d.education.map((e, j) => (j === i ? { ...e, location: v } : e)) }))} />
                      <Field label="Start year" value={ed.startYear} placeholder="2016"
                        onChange={(v) => update((d) => ({ ...d, education: d.education.map((e, j) => (j === i ? { ...e, startYear: v } : e)) }))} />
                      <Field label="End year" value={ed.endYear} placeholder="2020"
                        onChange={(v) => update((d) => ({ ...d, education: d.education.map((e, j) => (j === i ? { ...e, endYear: v } : e)) }))} />
                      <Field label="GPA" value={ed.gpa} placeholder="8.9/10"
                        onChange={(v) => update((d) => ({ ...d, education: d.education.map((e, j) => (j === i ? { ...e, gpa: v } : e)) }))} />
                    </Row>
                  </div>
                ))}
              </div>
            )}

            {/* ============ SKILLS ============ */}
            {tab === 'skills' && (
              <SkillsSection
                skills={data.skills}
                onChange={(skills) => update((d) => ({ ...d, skills }))}
              />
            )}

            {/* ============ PROJECTS ============ */}
            {tab === 'projects' && (
              <div className="ed-section">
                <div className="ed-section-head">
                  <h3 className="ed-section-title">Projects</h3>
                  <Button
                    size="sm"
                    variant="gradient"
                    onClick={() =>
                      update((d) => ({
                        ...d,
                        projects: [...d.projects, { id: uid(), name: '', description: '', technologies: [], url: '', github: '', startDate: '', endDate: '' }],
                      }))
                    }
                  >
                    + Add project
                  </Button>
                </div>

                {data.projects.length === 0 && <p className="ed-empty">Show off your work — add a project.</p>}

                {data.projects.map((pr, i) => (
                  <div className="ed-card" key={pr.id || i}>
                    <div className="ed-card-head">
                      <strong>{pr.name || `Project ${i + 1}`}</strong>
                      <button className="tool-btn" aria-label="Remove project" type="button"
                        onClick={() => update((d) => ({ ...d, projects: d.projects.filter((_, j) => j !== i) }))}>
                        🗑
                      </button>
                    </div>
                    <Row>
                      <Field label="Name" value={pr.name} placeholder="AI Resume Parser"
                        onChange={(v) => update((d) => ({ ...d, projects: d.projects.map((e, j) => (j === i ? { ...e, name: v } : e)) }))} />
                      <Field label="Technologies (comma separated)" value={pr.technologies.join(', ')} placeholder="React, FastAPI, Docker"
                        onChange={(v) => update((d) => ({ ...d, projects: d.projects.map((e, j) => (j === i ? { ...e, technologies: v.split(',').map((t) => t.trim()).filter(Boolean) } : e)) }))} />
                    </Row>
                    <TextAreaField label="Description" rows={3} value={pr.description}
                      placeholder="What it does and the impact it had…"
                      onChange={(v) => update((d) => ({ ...d, projects: d.projects.map((e, j) => (j === i ? { ...e, description: v } : e)) }))} />
                    <Row>
                      <Field label="URL" value={pr.url || ''} placeholder="https://project.com"
                        onChange={(v) => update((d) => ({ ...d, projects: d.projects.map((e, j) => (j === i ? { ...e, url: v } : e)) }))} />
                      <Field label="GitHub" value={pr.github || ''} placeholder="github.com/user/repo"
                        onChange={(v) => update((d) => ({ ...d, projects: d.projects.map((e, j) => (j === i ? { ...e, github: v } : e)) }))} />
                    </Row>
                  </div>
                ))}
              </div>
            )}

            {/* ============ CERTIFICATIONS ============ */}
            {tab === 'certifications' && (
              <SimpleRepeat
                title="Certifications"
                empty="Add certifications to boost credibility."
                items={data.certifications}
                addLabel="+ Add certification"
                fields={[
                  { key: 'name', label: 'Name', placeholder: 'AWS Solutions Architect' },
                  { key: 'organization', label: 'Organization', placeholder: 'Amazon Web Services' },
                  { key: 'issueDate', label: 'Issue date', placeholder: 'Mar 2025' },
                  { key: 'credentialId', label: 'Credential ID', placeholder: 'AWS-12345' },
                ]}
                onAdd={(items) => update((d) => ({ ...d, certifications: items }))}
              />
            )}

            {/* ============ ACHIEVEMENTS ============ */}
            {tab === 'achievements' && (
              <SimpleRepeat
                title="Achievements"
                empty="Awards, scholarships, rankings — anything that sets you apart."
                items={data.achievements}
                addLabel="+ Add achievement"
                fields={[
                  { key: 'title', label: 'Title', placeholder: 'Hackathon Winner' },
                  { key: 'description', label: 'Description', placeholder: '1st place among 200 teams' },
                  { key: 'date', label: 'Date', placeholder: '2025' },
                ]}
                onAdd={(items) => update((d) => ({ ...d, achievements: items }))}
              />
            )}

            {/* ============ LANGUAGES ============ */}
            {tab === 'languages' && (
              <LanguagesSection
                languages={data.languages}
                onChange={(languages) => update((d) => ({ ...d, languages }))}
              />
            )}
          </div>
        </div>

        {/* Preview panel */}
        <div className={`editor-preview ${previewOpenMobile ? 'preview-open-mobile' : ''}`}>
          <div className="preview-bar">
            <span className="preview-label">Live Preview</span>
            <div className="preview-controls">
              <button className="tool-btn" onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))} type="button" aria-label="Zoom out">−</button>
              <span className="preview-zoom">{Math.round(zoom * 100)}%</span>
              <button className="tool-btn" onClick={() => setZoom((z) => Math.min(1.4, z + 0.1))} type="button" aria-label="Zoom in">+</button>
              <button className="tool-btn" onClick={() => setZoom(1)} type="button">Reset</button>
              <button className="tool-btn preview-close-btn" onClick={() => setPreviewOpenMobile(false)} type="button">✕</button>
            </div>
          </div>

          <div className="preview-scroll">
            <div className="rp-zoom-wrap rp-print-area" style={{ transform: `scale(${zoom})`, width: `${100 / zoom}%` }}>
              <ResumePreview data={data} template={template} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile preview toggle */}
      <button className="preview-fab" onClick={() => setPreviewOpenMobile(true)} type="button">
        👁 Preview
      </button>

      {/* ============ MODALS ============ */}

      {/* Job description prompt for ATS */}
      <Modal
        open={jdOpen}
        onClose={() => setJdOpen(false)}
        title="ATS analysis — job description (optional)"
        footer={
          <>
            <Button variant="ghost" onClick={() => setJdOpen(false)}>Cancel</Button>
            <Button
              variant="gradient"
              onClick={() => {
                setJdOpen(false);
                runATS();
              }}
            >
              Run analysis
            </Button>
          </>
        }
      >
        <p className="ed-hint" style={{ marginTop: 0 }}>
          Paste the job description to score keyword match against a specific role. Leave empty for a
          general ATS compatibility check.
        </p>
        <textarea
          className="field"
          rows={8}
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job description here…"
        />
        {jobDescription && (
          <Button
            size="sm"
            variant="outline"
            style={{ marginTop: '0.75rem' }}
            onClick={() => {
              setJdOpen(false);
              runATS(jobDescription);
            }}
          >
            Analyze against this JD →
          </Button>
        )}
      </Modal>

      <ATSScoreModal
        open={atsOpen}
        onClose={() => setAtsOpen(false)}
        analysis={atsAnalysis}
        loading={atsLoading}
        error={atsError}
        onRunAgain={() => runATS()}
        onSaveScore={saveScore}
      />

      {/* ML prediction */}
      <Modal
        open={mlOpen}
        onClose={() => setMlOpen(false)}
        title="ML Job Category Prediction"
        footer={
          <>
            <Button variant="ghost" onClick={() => setMlOpen(false)}>Close</Button>
            {mlResult && <Button variant="gradient" onClick={savePrediction}>Save to resume</Button>}
          </>
        }
      >
        {mlLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: 'var(--primary-500)' }} />
            <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Running classifier on your resume…</p>
          </div>
        ) : mlResult ? (
          <div>
            <div className="ml-result-main">
              <div className="ml-category">{mlResult.predicted_category}</div>
              <div className="ml-confidence">
                Confidence: <strong>{Math.round(mlResult.confidence * 100)}%</strong>
              </div>
            </div>
            <div className="demo-label">Top predictions</div>
            <div className="ml-top-list">
              {mlResult.top_predictions.map((p) => (
                <div key={p.category} className="ml-top-row">
                  <span>{p.category}</span>
                  <div className="ml-top-bar">
                    <div style={{ width: `${Math.round(p.confidence * 100)}%` }} />
                  </div>
                  <strong>{Math.round(p.confidence * 100)}%</strong>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Cover letter */}
      <Modal
        open={coverOpen}
        onClose={() => setCoverOpen(false)}
        size="lg"
        title="AI Cover Letter"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCoverOpen(false)}>Close</Button>
            {coverText && (
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(coverText);
                  info('Copied to clipboard');
                }}
              >
                Copy
              </Button>
            )}
            <Button variant="gradient" onClick={generateCoverLetter} loading={coverLoading}>
              {coverText ? 'Regenerate' : 'Generate'}
            </Button>
          </>
        }
      >
        <div className="ed-row">
          <Field label="Job title" value={coverForm.jobTitle} placeholder="Frontend Engineer"
            onChange={(v) => setCoverForm({ ...coverForm, jobTitle: v })} />
          <Field label="Company" value={coverForm.company} placeholder="Stripe"
            onChange={(v) => setCoverForm({ ...coverForm, company: v })} />
        </div>
        <div className="ed-field ed-span-2">
          <label>
            <span>Tone</span>
            <select className="field" value={coverForm.tone} onChange={(e) => setCoverForm({ ...coverForm, tone: e.target.value })}>
              <option value="professional">Professional</option>
              <option value="enthusiastic">Enthusiastic</option>
              <option value="confident">Confident</option>
              <option value="friendly">Friendly</option>
            </select>
          </label>
        </div>
        <div className="ed-field ed-span-2">
          <label>
            <span>Job description</span>
            <textarea rows={5} value={coverForm.jobDescription}
              onChange={(e) => setCoverForm({ ...coverForm, jobDescription: e.target.value })}
              placeholder="Paste the job description for a tailored letter…" />
          </label>
        </div>

        {coverText && (
          <div className="cover-output">
            <div className="demo-label">Generated letter</div>
            <div className="cover-text">{coverText}</div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={deleteConfirm}
        title="Delete resume?"
        message="This cannot be undone."
        confirmLabel="Delete"
        onCancel={() => setDeleteConfirm(false)}
        onConfirm={async () => {
          await apiService.deleteResume(Number(id));
          success('Deleted');
          navigate('/resumes');
        }}
      />
    </div>
  );
};

/* ================= Sub-sections ================= */

const SkillsSection: React.FC<{ skills: Skill[]; onChange: (s: Skill[]) => void }> = ({ skills, onChange }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Skill['category']>('technical');
  const [level, setLevel] = useState<Skill['level']>('intermediate');

  const add = () => {
    if (!name.trim()) return;
    if (skills.some((s) => s.name.toLowerCase() === name.trim().toLowerCase())) return;
    onChange([...skills, { id: uid(), name: name.trim(), category, level }]);
    setName('');
  };

  const grouped = {
    technical: skills.filter((s) => s.category === 'technical'),
    soft: skills.filter((s) => s.category === 'soft'),
    tool: skills.filter((s) => s.category === 'tool'),
    language: skills.filter((s) => s.category === 'language'),
  };

  return (
    <div className="ed-section">
      <div className="ed-section-head">
        <h3 className="ed-section-title">Skills</h3>
        <span className="ed-hint" style={{ margin: 0 }}>{skills.length} added</span>
      </div>

      <div className="ed-skill-adder">
        <input
          className="field"
          value={name}
          placeholder="Add a skill… (e.g. React)"
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          aria-label="Skill name"
        />
        <select className="field" value={category} onChange={(e) => setCategory(e.target.value as Skill['category'])} aria-label="Category">
          <option value="technical">Technical</option>
          <option value="soft">Soft</option>
          <option value="tool">Tool</option>
          <option value="language">Language</option>
        </select>
        <select className="field" value={level} onChange={(e) => setLevel(e.target.value as Skill['level'])} aria-label="Level">
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
          <option value="expert">Expert</option>
        </select>
        <Button variant="gradient" size="md" onClick={add}>Add</Button>
      </div>

      {skills.length === 0 && <p className="ed-empty">No skills yet — add the ones that match your target role.</p>}

      {(['technical', 'soft', 'tool', 'language'] as const).map((cat) =>
        grouped[cat].length ? (
          <div key={cat} className="ed-skill-group">
            <span className="ed-skill-group-title">{cat}</span>
            <div className="ed-skill-chips">
              {grouped[cat].map((s) => (
                <span key={s.id} className="ed-chip" data-level={s.level}>
                  {s.name}
                  <em>{s.level}</em>
                  <button type="button" aria-label={`Remove ${s.name}`} onClick={() => onChange(skills.filter((x) => x.id !== s.id))}>
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>
        ) : null
      )}
    </div>
  );
};

const LanguagesSection: React.FC<{ languages: Language[]; onChange: (l: Language[]) => void }> = ({ languages, onChange }) => {
  const [name, setName] = useState('');
  const [proficiency, setProficiency] = useState<Language['proficiency']>('fluent');

  return (
    <div className="ed-section">
      <div className="ed-section-head">
        <h3 className="ed-section-title">Languages</h3>
      </div>

      <div className="ed-skill-adder">
        <input
          className="field"
          value={name}
          placeholder="e.g. Spanish"
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (!name.trim()) return;
              onChange([...languages, { id: uid(), name: name.trim(), proficiency }]);
              setName('');
            }
          }}
          aria-label="Language"
        />
        <select className="field" value={proficiency} onChange={(e) => setProficiency(e.target.value as Language['proficiency'])}>
          <option value="basic">Basic</option>
          <option value="intermediate">Intermediate</option>
          <option value="fluent">Fluent</option>
          <option value="native">Native</option>
        </select>
        <Button
          variant="gradient"
          onClick={() => {
            if (!name.trim()) return;
            onChange([...languages, { id: uid(), name: name.trim(), proficiency }]);
            setName('');
          }}
        >
          Add
        </Button>
      </div>

      {languages.length === 0 && <p className="ed-empty">Add languages you speak.</p>}

      <div className="ed-skill-chips" style={{ marginTop: '1rem' }}>
        {languages.map((l) => (
          <span key={l.id} className="ed-chip">
            {l.name} <em>{l.proficiency}</em>
            <button type="button" aria-label={`Remove ${l.name}`} onClick={() => onChange(languages.filter((x) => x.id !== l.id))}>
              ✕
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};

interface RepeatField {
  key: string;
  label: string;
  placeholder?: string;
}

const SimpleRepeat: React.FC<{
  title: string;
  empty: string;
  items: any[];
  addLabel: string;
  fields: RepeatField[];
  onAdd: (items: any[]) => void;
}> = ({ title, empty, items, addLabel, fields, onAdd }) => (
  <div className="ed-section">
    <div className="ed-section-head">
      <h3 className="ed-section-title">{title}</h3>
      <Button size="sm" variant="gradient" onClick={() => onAdd([...items, { id: uid(), ...Object.fromEntries(fields.map((f) => [f.key, ''])) }])}>
        {addLabel}
      </Button>
    </div>

    {items.length === 0 && <p className="ed-empty">{empty}</p>}

    {items.map((item, i) => (
      <div className="ed-card" key={item.id || i}>
        <div className="ed-card-head">
          <strong>{item[fields[0].key] || `${title} ${i + 1}`}</strong>
          <button className="tool-btn" type="button" aria-label="Remove" onClick={() => onAdd(items.filter((_, j) => j !== i))}>
            🗑
          </button>
        </div>
        <Row>
          {fields.map((f) => (
            <Field
              key={f.key}
              label={f.label}
              placeholder={f.placeholder}
              value={item[f.key] || ''}
              onChange={(v) => onAdd(items.map((x, j) => (j === i ? { ...x, [f.key]: v } : x)))}
            />
          ))}
        </Row>
      </div>
    ))}
  </div>
);

/* ---------------- utils ---------------- */
function relativeTime(d: Date): string {
  const secs = Math.floor((Date.now() - d.getTime()) / 1000);
  if (secs < 5) return 'just now';
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
}

export default ResumeEditor;
