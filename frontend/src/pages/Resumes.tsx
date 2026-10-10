import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import { ResumeListItem } from '../types';
import { useToast } from '../context/ToastContext';
import { Skeleton, EmptyState, ScoreRing, Badge, ConfirmDialog } from '../components/ui';
import Button from '../components/Button';
import '../styles/design-system.css';
import '../components/Layout.css';
import './Resumes.css';

type SortKey = 'recent' | 'name' | 'score';
type StatusFilter = 'all' | 'complete' | 'draft';
type ViewMode = 'grid' | 'list';

const TEMPLATES: Record<string, string> = {
  modern: 'linear-gradient(135deg,#667eea,#764ba2)',
  professional: 'linear-gradient(135deg,#4facfe,#00f2fe)',
  minimal: 'linear-gradient(135deg,#43e97b,#38f9d7)',
  executive: 'linear-gradient(135deg,#fa709a,#fee140)',
  ats: 'linear-gradient(135deg,#f093fb,#f5576c)',
  creative: 'linear-gradient(135deg,#4facfe,#00f2fe)',
  academic: 'linear-gradient(135deg,#6366f1,#a855f7)',
};

const Resumes: React.FC = () => {
  const [resumes, setResumes] = useState<ResumeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sort, setSort] = useState<SortKey>('recent');
  const [view, setView] = useState<ViewMode>('grid');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [duplicateId, setDuplicateId] = useState<number | null>(null);

  const navigate = useNavigate();
  const { success, error: showError, info } = useToast();

  const load = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await apiService.getResumes();
      setResumes(data);
    } catch (e: any) {
      setLoadError(e?.response?.data?.detail || 'Could not load your resumes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    let list = [...resumes];
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((r) => r.title.toLowerCase().includes(q) || r.template.toLowerCase().includes(q));
    if (statusFilter !== 'all') list = list.filter((r) => r.status === statusFilter);

    if (sort === 'name') list.sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === 'score') list.sort((a, b) => (b.ats_score ?? -1) - (a.ats_score ?? -1));
    else list.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

    return list;
  }, [resumes, query, statusFilter, sort]);

  const handleDelete = async () => {
    if (deleteId === null) return;
    setDeleting(true);
    try {
      await apiService.deleteResume(deleteId);
      setResumes((prev) => prev.filter((r) => r.id !== deleteId));
      success('Resume deleted', 'It has been permanently removed.');
    } catch {
      showError('Delete failed', 'Please try again.');
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const handleDuplicate = async (resume: ResumeListItem) => {
    setDuplicateId(resume.id);
    try {
      const full = await apiService.getResume(resume.id);
      const copy = await apiService.createResume({
        title: `${resume.title} (Copy)`,
        template: full.template,
        resume_data: full.resume_data,
      });
      setResumes((prev) => [
        { ...copy, ats_score: null, predicted_category: null, status: 'draft' } as ResumeListItem,
        ...prev,
      ]);
      success('Resume duplicated', 'A new draft copy has been created.');
    } catch {
      showError('Duplicate failed', 'Please try again.');
    } finally {
      setDuplicateId(null);
    }
  };

  const relativeTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d < 30) return `${d}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className="resumes-page page">
      <div className="container-wide">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">My Resumes</h1>
            <p className="page-subtitle">
              {resumes.length > 0
                ? `${resumes.length} resume${resumes.length === 1 ? '' : 's'} · ${resumes.filter((r) => r.status === 'complete').length} complete`
                : 'Create, analyze and manage your resumes'}
            </p>
          </div>
          <Link to="/resumes/create">
            <Button variant="gradient" size="lg">
              <span aria-hidden="true">+</span> Create New Resume
            </Button>
          </Link>
        </div>

        {/* Toolbar */}
        <div className="resumes-toolbar">
          <div className="toolbar-search">
            <span aria-hidden="true">🔍</span>
            <input
              className="field"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search resumes…"
              aria-label="Search resumes"
            />
          </div>

          <div className="toolbar-filters">
            {(['all', 'complete', 'draft'] as StatusFilter[]).map((s) => (
              <button
                key={s}
                className={`filter-chip ${statusFilter === s ? 'filter-active' : ''}`}
                onClick={() => setStatusFilter(s)}
                type="button"
              >
                {s === 'all' ? 'All' : s === 'complete' ? 'Complete' : 'Drafts'}
              </button>
            ))}
          </div>

          <select
            className="tool-select"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            aria-label="Sort resumes"
          >
            <option value="recent">Recently updated</option>
            <option value="name">Name (A–Z)</option>
            <option value="score">ATS score</option>
          </select>

          <div className="view-toggle" role="group" aria-label="View mode">
            <button
              className={`view-btn ${view === 'grid' ? 'view-active' : ''}`}
              onClick={() => setView('grid')}
              type="button"
              aria-label="Grid view"
            >
              ▦
            </button>
            <button
              className={`view-btn ${view === 'list' ? 'view-active' : ''}`}
              onClick={() => setView('list')}
              type="button"
              aria-label="List view"
            >
              ☰
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className={`resume-grid resume-grid-${view}`}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} height="15rem" />
            ))}
          </div>
        ) : loadError ? (
          <div className="load-error" style={{ padding: '3rem' }}>
            <p>⚠ {loadError}</p>
            <Button variant="outline" onClick={load}>Retry</Button>
          </div>
        ) : filtered.length === 0 ? (
          resumes.length === 0 ? (
            <EmptyState
              title="No resumes yet"
              description="Create your first professional resume. Pick a template, fill in your details, and let AI do the heavy lifting."
              action={
                <Link to="/resumes/create">
                  <Button variant="gradient" size="lg">
                    Create Your First Resume
                  </Button>
                </Link>
              }
            />
          ) : (
            <EmptyState
              title="No matches"
              description="No resumes match your search or filters. Try clearing them."
              action={
                <Button
                  variant="outline"
                  onClick={() => {
                    setQuery('');
                    setStatusFilter('all');
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          )
        ) : (
          <div className={`resume-grid resume-grid-${view}`}>
            {filtered.map((resume) => (
              <article key={resume.id} className="resume-item">
                {/* Preview header */}
                <div
                  className="resume-item-preview"
                  style={{ background: TEMPLATES[resume.template] || TEMPLATES.modern }}
                  onClick={() => navigate(`/resumes/${resume.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(`/resumes/${resume.id}`)}
                >
                  <div className="mini-page" aria-hidden="true">
                    <div className="mini-line w60" />
                    <div className="mini-line w40" />
                    <div className="mini-line w85" />
                    <div className="mini-line w75" />
                    <div className="mini-line w50" />
                  </div>
                  <span className="resume-template-badge">{resume.template}</span>
                </div>

                {/* Body */}
                <div className="resume-item-body">
                  <div className="resume-item-head">
                    <h3
                      className="resume-item-title"
                      onClick={() => navigate(`/resumes/${resume.id}`)}
                    >
                      {resume.title}
                    </h3>
                    <div className="resume-item-menu">
                      <button
                        className="tool-btn"
                        onClick={() => handleDuplicate(resume)}
                        title="Duplicate"
                        aria-label={`Duplicate ${resume.title}`}
                        disabled={duplicateId === resume.id}
                        type="button"
                      >
                        {duplicateId === resume.id ? '…' : '⧉'}
                      </button>
                      <button
                        className="tool-btn"
                        onClick={() => setDeleteId(resume.id)}
                        title="Delete"
                        aria-label={`Delete ${resume.title}`}
                        type="button"
                      >
                        🗑
                      </button>
                    </div>
                  </div>

                  <div className="resume-item-meta">
                    <Badge variant={resume.status === 'complete' ? 'success' : 'warning'} dot>
                      {resume.status}
                    </Badge>
                    {resume.predicted_category && (
                      <Badge variant="primary">{resume.predicted_category}</Badge>
                    )}
                    <span className="resume-item-date">Updated {relativeTime(resume.updated_at)}</span>
                  </div>

                  <div className="resume-item-foot">
                    <div className="resume-item-score">
                      <ScoreRing score={resume.ats_score ?? 0} size={46} label={resume.ats_score != null ? 'ATS' : 'No score'} />
                    </div>
                    <div className="resume-item-actions">
                      <Button size="sm" variant="gradient" onClick={() => navigate(`/resumes/${resume.id}`)}>
                        Open Editor
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => info('Tip', 'Open the editor and click “PDF” to export.')}
                      >
                        Export
                      </Button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete this resume?"
        message="The resume and all its saved versions will be permanently removed. This cannot be undone."
        confirmLabel="Delete"
        loading={deleting}
        onCancel={() => setDeleteId(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default Resumes;
