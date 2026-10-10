import React from 'react';
import { Modal, ProgressBar, ScoreRing } from '../ui';
import Button from '../Button';
import { ATSAnalysis } from '../../types';

interface Props {
  open: boolean;
  onClose: () => void;
  analysis: ATSAnalysis | null;
  loading: boolean;
  error?: string;
  onRunAgain?: () => void;
  onSaveScore?: (score: number) => void;
}

const SUBSCORES: Array<{ key: keyof ATSAnalysis; label: string }> = [
  { key: 'keywordsScore', label: 'Keywords' },
  { key: 'skillsScore', label: 'Skills' },
  { key: 'formattingScore', label: 'Formatting' },
  { key: 'experienceScore', label: 'Experience' },
  { key: 'readabilityScore', label: 'Readability' },
];

const tone = (v: number) => (v >= 80 ? 'success' : v >= 60 ? 'warning' : 'danger');

export const ATSScoreModal: React.FC<Props> = ({
  open,
  onClose,
  analysis,
  loading,
  error,
  onRunAgain,
  onSaveScore,
}) => {
  const overall = analysis ? Math.round(analysis.overallScore) : 0;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="ATS Compatibility Report"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          {onRunAgain && (
            <Button variant="outline" onClick={onRunAgain} loading={loading}>
              Re-run analysis
            </Button>
          )}
          {analysis && onSaveScore && (
            <Button variant="gradient" onClick={() => onSaveScore(overall)}>
              Save score to resume
            </Button>
          )}
        </>
      }
    >
      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto"
            style={{ borderColor: 'var(--primary-500)' }}
            role="status"
          />
          <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>
            Analyzing your resume against ATS parsing rules…
          </p>
        </div>
      )}

      {!loading && error && (
        <div className="load-error" style={{ padding: '2rem' }}>
          <p>⚠ {error}</p>
          {onRunAgain && (
            <Button size="sm" variant="outline" onClick={onRunAgain}>
              Try again
            </Button>
          )}
        </div>
      )}

      {!loading && !error && analysis && (
        <div>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            <ScoreRing score={overall} size={120} label="Overall ATS Score" stroke={9} />
            <div style={{ flex: 1, minWidth: '220px' }}>
              <div className="demo-label">Verdict</div>
              <p style={{ margin: '0 0 0.75rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                {overall >= 80
                  ? 'Excellent — this resume should pass most applicant tracking systems cleanly.'
                  : overall >= 60
                  ? 'Good foundation, but a few fixes will push this into the pass range.'
                  : 'At risk — several issues may cause your resume to be filtered out. See suggestions below.'}
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span className="badge badge-success">✓ {analysis.strengths.length} strengths</span>
                <span className="badge badge-warning">⚠ {analysis.weaknesses.length} issues</span>
                <span className="badge badge-info">💡 {analysis.suggestions.length} suggestions</span>
              </div>
            </div>
          </div>

          {/* Sub-scores */}
          <div className="demo-score-row" style={{ marginBottom: '1.5rem' }}>
            {SUBSCORES.map((s) => {
              const val = Math.round(Number(analysis[s.key]) || 0);
              return (
                <div key={s.key} className="demo-score">
                  <div
                    className="demo-score-value"
                    style={{ color: val >= 80 ? '#10b981' : val >= 60 ? '#f59e0b' : '#ef4444' }}
                  >
                    {val}
                  </div>
                  <div className="demo-score-label">{s.label}</div>
                  <ProgressBar value={val} tone={tone(val)} size="sm" />
                </div>
              );
            })}
          </div>

          {/* Lists */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <div className="demo-label" style={{ color: '#10b981' }}>Strengths ✓</div>
              <ul className="demo-list">
                {analysis.strengths.map((s, i) => (
                  <li key={i}><span className="ok">✓</span> {s}</li>
                ))}
                {analysis.strengths.length === 0 && <li>No major strengths detected yet.</li>}
              </ul>
            </div>
            <div>
              <div className="demo-label" style={{ color: '#ef4444' }}>Weaknesses ⚠</div>
              <ul className="demo-list">
                {analysis.weaknesses.map((s, i) => (
                  <li key={i}><span className="warn">⚠</span> {s}</li>
                ))}
                {analysis.weaknesses.length === 0 && <li>Nice — no weaknesses flagged.</li>}
              </ul>
            </div>
            <div>
              <div className="demo-label" style={{ color: '#3b82f6' }}>Suggestions 💡</div>
              <ul className="demo-list">
                {analysis.suggestions.map((s, i) => (
                  <li key={i}>💡 {s}</li>
                ))}
                {analysis.suggestions.length === 0 && <li>No further suggestions.</li>}
              </ul>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ATSScoreModal;
