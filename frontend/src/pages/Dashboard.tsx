import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import apiService from '../services/api';
import { ResumeListItem } from '../types';
import { Skeleton, EmptyState, ScoreRing, Badge, ConfirmDialog, ProgressBar } from '../components/ui';
import Button from '../components/Button';
import '../styles/design-system.css';
import '../components/Layout.css';
import './Dashboard.css';

const TIPS = [
  'Add quantifiable achievements to your resume — numbers and metrics make accomplishments memorable to recruiters.',
  'Mirror the exact keywords from the job description; ATS systems match literal strings, not synonyms.',
  'Keep your resume to one page if you have under 10 years of experience.',
  'Start each bullet with a strong action verb: led, built, reduced, launched, scaled.',
  'Use a standard section heading like "Work Experience" — creative titles confuse parsers.',
  'Save your resume as PDF unless the application specifically asks for Word.',
];

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { success, error: showError } = useToast();

  const [resumes, setResumes] = useState<ResumeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [deleting, setDeleting] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [tipIndex, setTipIndex] = useState(0);

  const loadResumes = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await apiService.getResumes();
      setResumes(data);
    } catch (e: any) {
      setLoadError(e?.response?.data?.detail || 'Could not load your resumes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResumes();
  }, []);

  // Rotate tips
  useEffect(() => {
    const t = setInterval(() => setTipIndex((i) => (i + 1) % TIPS.length), 9000);
    return () => clearInterval(t);
  }, []);

  const stats = useMemo(() => {
    const total = resumes.length;
    const scored = resumes.filter((r) => typeof r.ats_score === 'number');
    const avg = scored.length
      ? Math.round(scored.reduce((s, r) => s + (r.ats_score || 0), 0) / scored.length)
      : 0;
    const complete = resumes.filter((r) => r.status === 'complete').length;
    const categories = new Set(resumes.map((r) => r.predicted_category).filter(Boolean)).size;
    return { total, avg, complete, draft: total - complete, categories };
  }, [resumes]);

  const completion = useMemo(() => {
    let done = 0;
    let total = 4;
    if (resumes.length > 0) done++;
    if (user?.name) done++;
    if (user?.email) done++;
    if (resumes.some((r) => r.ats_score !== null)) done++;
    return Math.round((done / total) * 100);
  }, [resumes, user]);

  const recent = useMemo(
    () =>
      [...resumes]
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 5),
    [resumes]
  );

  const activity = useMemo(() => {
    return [...resumes]
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 6)
      .map((r) => {
        const diff = Date.now() - new Date(r.updated_at).getTime();
        const hrs = Math.floor(diff / 3600000);
        const time =
          hrs < 1
            ? `${Math.max(1, Math.floor(diff / 60000))} min ago`
            : hrs < 24
            ? `${hrs} hour${hrs > 1 ? 's' : ''} ago`
            : `${Math.floor(hrs / 24)} day${Math.floor(hrs / 24) > 1 ? 's' : ''} ago`;
        return {
          id: r.id,
          title: r.status === 'complete' ? 'Resume updated' : 'Draft edited',
          description: r.title,
          time,
          score: r.ats_score,
        };
      });
  }, [resumes]);

  const handleDelete = async (id: number) => {
    setDeleting(id);
    try {
      await apiService.deleteResume(id);
      setResumes((prev) => prev.filter((r) => r.id !== id));
      success('Resume deleted', 'It has been removed from your account.');
    } catch {
      showError('Delete failed', 'Could not delete the resume. Please try again.');
    } finally {
      setDeleting(null);
      setConfirmId(null);
    }
  };

  const quickActions = [
    { icon: '📄', title: 'Create Resume', description: 'Start from a template', action: () => navigate('/resumes/create'), grad: 'linear-gradient(135deg,#a855f7,#ec4899)' },
    { icon: '🗂', title: 'My Resumes', description: 'Manage & edit resumes', action: () => navigate('/resumes'), grad: 'linear-gradient(135deg,#3b82f6,#06b6d4)' },
    { icon: '📊', title: 'Run ATS Check', description: 'Score any resume live', action: () => navigate(resumes[0] ? `/resumes/${resumes[0].id}` : '/resumes/create'), grad: 'linear-gradient(135deg,#10b981,#14b8a6)' },
    { icon: '🎨', title: 'Browse Templates', description: '7 professional designs', action: () => navigate('/templates'), grad: 'linear-gradient(135deg,#f97316,#ef4444)' },
  ];

  const firstName = user?.name || user?.email?.split('@')[0] || 'there';

  return (
    <div className="dashboard-page page">
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <div className="welcome-section">
              <h1 className="dashboard-title">
                Welcome back, <span className="text-gradient">{firstName}</span>! 👋
              </h1>
              <p className="dashboard-subtitle">
                {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} ·
                {' '}Here's what's happening with your resumes
              </p>
            </div>
            <button onClick={() => navigate('/resumes/create')} className="btn btn-gradient btn-lg">
              <span className="btn-icon" aria-hidden="true">+</span>
              <span>Create Resume</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height="7.5rem" />)
          ) : (
            <>
              <div className="stat-card">
                <div className="stat-icon-container"><div className="stat-icon">📄</div></div>
                <div className="stat-content">
                  <div className="stat-value">{stats.total}</div>
                  <div className="stat-label">Total Resumes</div>
                  <div className="stat-change positive">All time</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon-container"><div className="stat-icon">📊</div></div>
                <div className="stat-content">
                  <div className="stat-value">{stats.avg || '—'}</div>
                  <div className="stat-label">Average ATS Score</div>
                  <div className={`stat-change ${stats.avg >= 70 ? 'positive' : 'neutral'}`}>
                    {stats.avg ? (stats.avg >= 70 ? 'Great shape' : 'Room to improve') : 'Run an analysis'}
                  </div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon-container"><div className="stat-icon">✅</div></div>
                <div className="stat-content">
                  <div className="stat-value">{stats.complete}</div>
                  <div className="stat-label">Completed</div>
                  <div className="stat-change neutral">{stats.draft} draft{stats.draft === 1 ? '' : 's'}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon-container"><div className="stat-icon">🎯</div></div>
                <div className="stat-content">
                  <div className="stat-value">{stats.categories || '—'}</div>
                  <div className="stat-label">ML Categories</div>
                  <div className="stat-change neutral">Predicted job families</div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Main grid */}
        <div className="dashboard-grid">
          <div className="dashboard-left">
            {/* Quick actions */}
            <div className="section-card">
              <div className="section-header-bar">
                <h2 className="section-title">Quick Actions</h2>
              </div>
              <div className="quick-actions-grid">
                {quickActions.map((a) => (
                  <div key={a.title} className="quick-action-card" onClick={a.action} role="button" tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter') a.action(); }}>
                    <div className="action-icon" style={{ background: a.grad }}>
                      <span aria-hidden="true">{a.icon}</span>
                    </div>
                    <div className="action-content">
                      <h3 className="action-title">{a.title}</h3>
                      <p className="action-description">{a.description}</p>
                    </div>
                    <div className="action-arrow" aria-hidden="true">→</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent resumes */}
            <div className="section-card">
              <div className="section-header-bar">
                <h2 className="section-title">Recent Resumes</h2>
                <Link to="/resumes" className="btn btn-ghost btn-sm">View All →</Link>
              </div>

              {loading ? (
                <div className="resumes-list">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} height="4.5rem" />
                  ))}
                </div>
              ) : loadError ? (
                <div className="load-error">
                  <p>{loadError}</p>
                  <Button size="sm" variant="outline" onClick={loadResumes}>Retry</Button>
                </div>
              ) : recent.length > 0 ? (
                <div className="resumes-list">
                  {recent.map((resume) => (
                    <div key={resume.id} className="resume-row">
                      <div className="resume-row-icon" aria-hidden="true">📄</div>
                      <div className="resume-row-body" onClick={() => navigate(`/resumes/${resume.id}`)}>
                        <h3 className="resume-row-title">{resume.title}</h3>
                        <div className="resume-row-meta">
                          <Badge variant={resume.status === 'complete' ? 'success' : 'warning'} dot>
                            {resume.status}
                          </Badge>
                          {resume.predicted_category && (
                            <Badge variant="primary">{resume.predicted_category}</Badge>
                          )}
                          <span className="resume-date">
                            {new Date(resume.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="resume-row-score">
                        <ScoreRing score={resume.ats_score ?? 0} size={54} label="ATS" />
                      </div>
                      <div className="resume-row-actions">
                        <Button size="sm" variant="outline" onClick={() => navigate(`/resumes/${resume.id}`)}>
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setConfirmId(resume.id)}
                          aria-label={`Delete ${resume.title}`}
                        >
                          🗑
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No resumes yet"
                  description="Create your first professional resume — it takes less than 8 minutes with AI help."
                  action={
                    <Button variant="gradient" onClick={() => navigate('/resumes/create')}>
                      Create Your First Resume
                    </Button>
                  }
                />
              )}
            </div>

            {/* Score chart */}
            {!loading && resumes.length > 0 && (
              <div className="section-card">
                <div className="section-header-bar">
                  <h2 className="section-title">ATS Scores</h2>
                  <span className="section-hint">Higher is better</span>
                </div>
                <div className="score-chart">
                  {resumes.slice(0, 7).map((r) => {
                    const score = r.ats_score ?? 0;
                    const tone = score >= 80 ? 'var(--success)' : score >= 60 ? 'var(--warning)' : score > 0 ? 'var(--error)' : 'var(--border-strong)';
                    return (
                      <div key={r.id} className="score-chart-item">
                        <div className="score-chart-bar" title={`${r.title}: ${score || 'no score'}`}>
                          <div
                            className="score-chart-fill"
                            style={{ height: `${Math.max(score, 4)}%`, background: tone }}
                          />
                        </div>
                        <div className="score-chart-value" style={{ color: tone }}>
                          {r.ats_score ?? '—'}
                        </div>
                        <div className="score-chart-label">{r.title.split(' ').slice(0, 2).join(' ')}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="dashboard-right">
            {/* Activity */}
            <div className="section-card">
              <div className="section-header-bar">
                <h2 className="section-title">Recent Activity</h2>
              </div>
              {loading ? (
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} height="3.25rem" />
                  ))}
                </div>
              ) : activity.length > 0 ? (
                <div className="activity-list">
                  {activity.map((a) => (
                    <div key={a.id} className="activity-item" onClick={() => navigate(`/resumes/${a.id}`)}>
                      <div className="activity-icon activity-info" aria-hidden="true">✅</div>
                      <div className="activity-content">
                        <h4 className="activity-title">{a.title}</h4>
                        <p className="activity-description">{a.description}</p>
                        <span className="activity-time">{a.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="section-hint">Activity will appear as you work on resumes.</p>
              )}
            </div>

            {/* AI tip */}
            <div className="section-card tips-card">
              <div className="tips-header">
                <div className="tips-icon" aria-hidden="true">💡</div>
                <h3 className="tips-title">Today's Tip</h3>
              </div>
              <p className="tips-content" key={tipIndex}>{TIPS[tipIndex]}</p>
              <Link to="/help" className="btn btn-outline btn-sm">Learn more</Link>
            </div>

            {/* Profile completion */}
            <div className="section-card progress-card">
              <div className="progress-header">
                <h3 className="progress-title">Profile Completion</h3>
                <span className="progress-percentage">{completion}%</span>
              </div>
              <ProgressBar value={completion} showValue={false} />
              <div className="progress-tasks">
                <div className={`task-item ${resumes.length > 0 ? 'completed' : ''}`}>
                  <span className="task-icon">{resumes.length > 0 ? '✓' : '○'}</span>
                  <span className="task-text">Create a resume</span>
                </div>
                <div className={`task-item ${resumes.some((r) => r.ats_score) ? 'completed' : ''}`}>
                  <span className="task-icon">{resumes.some((r) => r.ats_score) ? '✓' : '○'}</span>
                  <span className="task-text">Run an ATS analysis</span>
                </div>
                <div className={`task-item ${user?.name ? 'completed' : ''}`}>
                  <span className="task-icon">{user?.name ? '✓' : '○'}</span>
                  <span className="task-text">Set your full name</span>
                </div>
                <div className={`task-item ${resumes.some((r) => r.status === 'complete') ? 'completed' : ''}`}>
                  <span className="task-icon">{resumes.some((r) => r.status === 'complete') ? '✓' : '○'}</span>
                  <span className="task-text">Finish a resume</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmId !== null}
        title="Delete this resume?"
        message="This will permanently remove the resume and all its saved versions. This action cannot be undone."
        confirmLabel="Delete"
        loading={deleting !== null}
        onCancel={() => setConfirmId(null)}
        onConfirm={() => confirmId !== null && handleDelete(confirmId)}
      />
    </div>
  );
};

export default Dashboard;
