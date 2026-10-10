import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import '../styles/design-system.css';
import './Marketing.css';

const Contact: React.FC = () => {
  const { success } = useToast();
  const [form, setForm] = useState({ name: '', email: '', subject: 'general', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Please enter your name';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address';
    if (form.message.trim().length < 10) e.message = 'Message must be at least 10 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSending(true);
    // Simulated submission (wire to backend /api/contact when available)
    await new Promise((r) => setTimeout(r, 900));
    setSending(false);
    success('Message sent!', 'Our team will reply within 24 hours.');
    setForm({ name: '', email: '', subject: 'general', message: '' });
  };

  const set = (k: keyof typeof form) => (ev: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: ev.target.value });

  return (
    <div className="marketing-page">
      <section className="mk-hero">
        <div className="container mk-hero-inner">
          <span className="mk-badge">📬 Contact us</span>
          <h1 className="mk-hero-title">
            Let's <span className="text-gradient">talk</span>
          </h1>
          <p className="mk-hero-sub">
            Questions, feedback, partnerships or bugs — we read everything and reply within 24 hours.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="contact-grid">
            {/* Form */}
            <div className="contact-card">
              <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text)' }}>
                Send us a message
              </h2>

              <form onSubmit={handleSubmit} noValidate>
                <div className="field-group">
                  <label className="field-label" htmlFor="c-name">
                    Your name <span className="field-required">*</span>
                  </label>
                  <input
                    id="c-name"
                    className={`field ${errors.name ? 'field-error' : ''}`}
                    value={form.name}
                    onChange={set('name')}
                    placeholder="Jane Doe"
                  />
                  {errors.name && <p className="field-error-text">⚠ {errors.name}</p>}
                </div>

                <div className="field-group">
                  <label className="field-label" htmlFor="c-email">
                    Email <span className="field-required">*</span>
                  </label>
                  <input
                    id="c-email"
                    type="email"
                    className={`field ${errors.email ? 'field-error' : ''}`}
                    value={form.email}
                    onChange={set('email')}
                    placeholder="you@example.com"
                  />
                  {errors.email && <p className="field-error-text">⚠ {errors.email}</p>}
                </div>

                <div className="field-group">
                  <label className="field-label" htmlFor="c-subject">Subject</label>
                  <select id="c-subject" className="field" value={form.subject} onChange={set('subject')}>
                    <option value="general">General question</option>
                    <option value="support">Technical support</option>
                    <option value="billing">Billing</option>
                    <option value="partnership">Partnership</option>
                    <option value="feedback">Feedback</option>
                  </select>
                </div>

                <div className="field-group">
                  <label className="field-label" htmlFor="c-message">
                    Message <span className="field-required">*</span>
                  </label>
                  <textarea
                    id="c-message"
                    className={`field ${errors.message ? 'field-error' : ''}`}
                    rows={6}
                    value={form.message}
                    onChange={set('message')}
                    placeholder="Tell us how we can help…"
                  />
                  {errors.message && <p className="field-error-text">⚠ {errors.message}</p>}
                </div>

                <button className="btn btn-gradient btn-lg btn-full" type="submit" disabled={sending}>
                  {sending ? 'Sending…' : 'Send Message'}
                </button>
              </form>
            </div>

            {/* Info */}
            <div>
              <div className="contact-card">
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text)' }}>Other ways to reach us</h3>
                <div className="contact-info-list">
                  <div className="contact-info-item">
                    <div className="contact-info-icon" aria-hidden="true">📧</div>
                    <div>
                      <div className="contact-info-label">Email</div>
                      <div className="contact-info-value">support@airesumebuilder.dev</div>
                    </div>
                  </div>
                  <div className="contact-info-item">
                    <div className="contact-info-icon" aria-hidden="true">⚡</div>
                    <div>
                      <div className="contact-info-label">Response time</div>
                      <div className="contact-info-value">Under 24 hours (Mon–Fri)</div>
                    </div>
                  </div>
                  <div className="contact-info-item">
                    <div className="contact-info-icon" aria-hidden="true">🏢</div>
                    <div>
                      <div className="contact-info-label">Office</div>
                      <div className="contact-info-value">Bengaluru, India · Remote-first</div>
                    </div>
                  </div>
                  <div className="contact-info-item">
                    <div className="contact-info-icon" aria-hidden="true">💬</div>
                    <div>
                      <div className="contact-info-label">Live chat</div>
                      <div className="contact-info-value">Available on Help Center</div>
                    </div>
                  </div>
                </div>

                <div className="contact-map" role="img" aria-label="Office location map">
                  📍 Map view coming soon
                </div>
              </div>

              <div className="contact-card" style={{ marginTop: '1.25rem' }}>
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem' }}>
                  Bug report?
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.6, margin: 0 }}>
                  Include your browser, the page URL and steps to reproduce. Screenshots speed things
                  up massively — attach them in the message above.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
