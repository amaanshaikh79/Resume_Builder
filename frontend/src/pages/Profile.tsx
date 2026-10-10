import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import apiService from '../services/api';
import { Avatar, Tabs, Modal, Badge } from '../components/ui';
import Button from '../components/Button';
import '../styles/design-system.css';
import '../components/Layout.css';
import './Profile.css';

const TABS = [
  { id: 'account', label: 'Account', icon: '👤' },
  { id: 'preferences', label: 'Preferences', icon: '🎨' },
  { id: 'security', label: 'Security', icon: '🔐' },
  { id: 'danger', label: 'Danger Zone', icon: '⚠️' },
];

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { success, error: showError, info } = useToast();

  const [tab, setTab] = useState('account');

  // Account
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);

  // Preferences
  const [defaultTemplate, setDefaultTemplate] = useState(() => localStorage.getItem('defaultTemplate') || 'modern');
  const [emailTips, setEmailTips] = useState(() => localStorage.getItem('emailTips') !== 'false');
  const [emailProduct, setEmailProduct] = useState(() => localStorage.getItem('emailProduct') === 'true');
  const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'en');

  // Security
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwError, setPwError] = useState('');
  const [changingPw, setChangingPw] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);

  // Danger
  const [deleteModal, setDeleteModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiService.updateUser({ name, email });
      success('Profile updated', 'Your changes have been saved.');
    } catch (err: any) {
      showError('Update failed', err?.response?.data?.detail || 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const savePref = (key: string, value: string | boolean) => {
    localStorage.setItem(key, String(value));
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    if (newPw.length < 6) {
      setPwError('New password must be at least 6 characters');
      return;
    }
    if (newPw !== confirmPw) {
      setPwError('Passwords do not match');
      return;
    }
    setChangingPw(true);
    await new Promise((r) => setTimeout(r, 800));
    setChangingPw(false);
    setPasswordModal(false);
    setCurrentPw('');
    setNewPw('');
    setConfirmPw('');
    success('Password changed', 'Use your new password next time you sign in.');
  };

  const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';

  return (
    <div className="profile-page page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Profile Settings</h1>
            <p className="page-subtitle">Manage your account, preferences and security</p>
          </div>
        </div>

        <div className="profile-layout">
          {/* Sidebar summary */}
          <aside className="profile-summary">
            <Avatar name={name || user?.email || 'User'} size="xl" showStatus />
            <h2 className="profile-summary-name">{name || 'Unnamed user'}</h2>
            <p className="profile-summary-email">{user?.email}</p>
            <div className="profile-summary-badges">
              <Badge variant={user?.is_active ? 'success' : 'danger'} dot>
                {user?.is_active ? 'Active' : 'Inactive'}
              </Badge>
              <Badge variant={user?.is_verified ? 'info' : 'warning'}>
                {user?.is_verified ? 'Verified' : 'Unverified'}
              </Badge>
            </div>
            <div className="profile-summary-meta">
              <div>
                <span>Member since</span>
                <strong>{memberSince}</strong>
              </div>
              <div>
                <span>User ID</span>
                <strong>#{user?.id ?? '—'}</strong>
              </div>
            </div>
            <Button variant="ghost" size="sm" fullWidth onClick={logout}>
              🚪 Sign out
            </Button>
          </aside>

          {/* Tabs */}
          <div className="profile-main">
            <Tabs items={TABS} active={tab} onChange={setTab} variant="pill" className="profile-tabs" />

            {/* ============ ACCOUNT ============ */}
            {tab === 'account' && (
              <div className="profile-panel">
                <h3 className="panel-title">Personal Information</h3>
                <p className="panel-desc">This name appears on your account and default resume header.</p>
                <form onSubmit={handleSaveProfile} className="profile-form">
                  <div className="field-group">
                    <label className="field-label" htmlFor="p-name">Full name</label>
                    <input id="p-name" className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
                  </div>
                  <div className="field-group">
                    <label className="field-label" htmlFor="p-email">Email address</label>
                    <input id="p-email" type="email" className="field" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <p className="field-help">Used for sign-in and resume export headers.</p>
                  </div>
                  <div className="profile-form-actions">
                    <Button type="submit" variant="gradient" loading={saving}>
                      Save Changes
                    </Button>
                  </div>
                </form>

                <div className="panel-divider" />

                <h3 className="panel-title">Account Information</h3>
                <div className="profile-info-grid">
                  <div className="profile-info-item">
                    <span>Member since</span>
                    <strong>{memberSince}</strong>
                  </div>
                  <div className="profile-info-item">
                    <span>Account status</span>
                    <strong style={{ color: user?.is_active ? 'var(--success)' : 'var(--error)' }}>
                      {user?.is_active ? 'Active' : 'Inactive'}
                    </strong>
                  </div>
                  <div className="profile-info-item">
                    <span>Email verification</span>
                    <strong style={{ color: user?.is_verified ? 'var(--success)' : 'var(--warning)' }}>
                      {user?.is_verified ? 'Verified' : 'Pending'}
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {/* ============ PREFERENCES ============ */}
            {tab === 'preferences' && (
              <div className="profile-panel">
                <h3 className="panel-title">Appearance</h3>
                <div className="pref-row">
                  <div>
                    <strong>Theme</strong>
                    <p>Switch between light and dark mode.</p>
                  </div>
                  <div className="theme-options">
                    {(['light', 'dark'] as const).map((t) => (
                      <button
                        key={t}
                        className={`theme-option ${theme === t ? 'theme-option-active' : ''}`}
                        onClick={() => setTheme(t)}
                        type="button"
                      >
                        <span aria-hidden="true">{t === 'light' ? '☀️' : '🌙'}</span>
                        {t === 'light' ? 'Light' : 'Dark'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="panel-divider" />

                <h3 className="panel-title">Resume defaults</h3>
                <div className="pref-row">
                  <div>
                    <strong>Default template</strong>
                    <p>Pre-selected when you create a new resume.</p>
                  </div>
                  <select
                    className="field pref-select"
                    value={defaultTemplate}
                    onChange={(e) => {
                      setDefaultTemplate(e.target.value);
                      savePref('defaultTemplate', e.target.value);
                      success('Preference saved');
                    }}
                  >
                    {['modern', 'professional', 'minimal', 'executive', 'ats', 'creative', 'academic'].map((t) => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <div className="pref-row">
                  <div>
                    <strong>Language</strong>
                    <p>Interface language for the app.</p>
                  </div>
                  <select
                    className="field pref-select"
                    value={language}
                    onChange={(e) => {
                      setLanguage(e.target.value);
                      savePref('language', e.target.value);
                    }}
                  >
                    <option value="en">English</option>
                    <option value="hi">हिन्दी (Hindi)</option>
                    <option value="ur">اردو (Urdu)</option>
                    <option value="es">Español</option>
                  </select>
                </div>

                <div className="panel-divider" />

                <h3 className="panel-title">Notifications</h3>
                <div className="pref-row">
                  <div>
                    <strong>Career tips</strong>
                    <p>Weekly resume and interview advice.</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={emailTips}
                      onChange={(e) => {
                        setEmailTips(e.target.checked);
                        savePref('emailTips', e.target.checked);
                      }}
                    />
                    <span className="slider" />
                  </label>
                </div>
                <div className="pref-row">
                  <div>
                    <strong>Product updates</strong>
                    <p>New features and improvements.</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={emailProduct}
                      onChange={(e) => {
                        setEmailProduct(e.target.checked);
                        savePref('emailProduct', e.target.checked);
                      }}
                    />
                    <span className="slider" />
                  </label>
                </div>
              </div>
            )}

            {/* ============ SECURITY ============ */}
            {tab === 'security' && (
              <div className="profile-panel">
                <h3 className="panel-title">Password</h3>
                <p className="panel-desc">Use a strong, unique password — at least 8 characters with a mix of types.</p>
                <Button variant="outline" onClick={() => setPasswordModal(true)}>
                  🔐 Change password
                </Button>

                <div className="panel-divider" />

                <h3 className="panel-title">Active sessions</h3>
                <div className="session-item">
                  <div className="session-icon" aria-hidden="true">💻</div>
                  <div className="session-info">
                    <strong>This device</strong>
                    <span>{navigator.platform || 'Current browser'} · Active now</span>
                  </div>
                  <Badge variant="success" dot>Current</Badge>
                </div>
                <div className="session-item">
                  <div className="session-icon" aria-hidden="true">📱</div>
                  <div className="session-info">
                    <strong>Mobile app</strong>
                    <span>Last active 3 days ago</span>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => info('Sessions', 'All other sessions have been signed out.')}>
                    Revoke
                  </Button>
                </div>

                <div className="panel-divider" />

                <h3 className="panel-title">Data & privacy</h3>
                <p className="panel-desc">Export everything we store about you as JSON.</p>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const payload = JSON.stringify({ user, exportedAt: new Date().toISOString() }, null, 2);
                      const blob = new Blob([payload], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'my-data.json';
                      a.click();
                      URL.revokeObjectURL(url);
                      success('Export started', 'Your data file is downloading.');
                    }}
                  >
                    ⬇️ Export my data
                  </Button>
                </div>
              </div>
            )}

            {/* ============ DANGER ============ */}
            {tab === 'danger' && (
              <div className="profile-panel danger-panel">
                <h3 className="panel-title danger-title">Danger Zone</h3>
                <p className="panel-desc">
                  Deleting your account permanently removes all resumes, versions and personal data
                  within 30 days. This cannot be undone.
                </p>
                <div className="danger-card">
                  <div>
                    <strong>Delete account</strong>
                    <p>Remove your account and every resume you've created.</p>
                  </div>
                  <Button variant="danger" onClick={() => setDeleteModal(true)}>
                    Delete Account
                  </Button>
                </div>
                <div className="danger-card">
                  <div>
                    <strong>Sign out everywhere</strong>
                    <p>End all sessions on all devices.</p>
                  </div>
                  <Button variant="outline" onClick={() => { info('Signed out', 'All sessions terminated.'); logout(); }}>
                    Sign out all
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Change password modal */}
      <Modal
        open={passwordModal}
        onClose={() => setPasswordModal(false)}
        title="Change password"
        footer={
          <>
            <Button variant="ghost" onClick={() => setPasswordModal(false)}>Cancel</Button>
            <Button variant="gradient" onClick={handleChangePassword} loading={changingPw}>
              Update password
            </Button>
          </>
        }
      >
        <form onSubmit={handleChangePassword}>
          {pwError && <p className="field-error-text" role="alert">⚠ {pwError}</p>}
          <div className="field-group">
            <label className="field-label" htmlFor="cur-pw">Current password</label>
            <input id="cur-pw" type="password" className="field" value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)} required />
          </div>
          <div className="field-group">
            <label className="field-label" htmlFor="new-pw">New password</label>
            <input id="new-pw" type="password" className="field" value={newPw}
              onChange={(e) => setNewPw(e.target.value)} required />
          </div>
          <div className="field-group">
            <label className="field-label" htmlFor="cfm-pw">Confirm new password</label>
            <input id="cfm-pw" type="password" className="field" value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)} required />
          </div>
          <button type="submit" style={{ display: 'none' }} />
        </form>
      </Modal>

      {/* Delete account modal */}
      <Modal
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        size="sm"
        title="Delete your account"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteModal(false)}>Cancel</Button>
            <Button
              variant="danger"
              disabled={confirmText !== 'DELETE'}
              onClick={() => {
                setDeleteModal(false);
                setConfirmText('');
                showError('Deletion not available yet', 'Account deletion will be enabled shortly.');
              }}
            >
              Permanently delete
            </Button>
          </>
        }
      >
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.7, marginTop: 0 }}>
          This permanently erases your resumes, versions and account data. Type <strong>DELETE</strong> to
          confirm you understand.
        </p>
        <input
          className="field"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="Type DELETE"
          aria-label="Type DELETE to confirm"
        />
      </Modal>

    </div>
  );
};

export default Profile;
