import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/design-system.css';
import './Home.css';

/** Animated count-up when scrolled into view. */
const CountUp: React.FC<{ to: number; suffix?: string; duration?: number }> = ({
  to,
  suffix = '',
  duration = 1400,
}) => {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          setValue(Math.round(to * eased));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [to, duration]);

  return (
    <span ref={ref}>
      {value}
      {suffix}
    </span>
  );
};

/** Reveal-on-scroll wrapper. */
const Reveal: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({
  children,
  delay = 0,
  className = '',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'reveal-visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const FEATURES = [
  {
    icon: '🤖',
    title: 'AI-Powered Writing',
    description:
      'Generate summaries, bullet points and cover letters that turn duties into measurable achievements.',
    gradient: 'linear-gradient(135deg, #a855f7, #ec4899)',
    to: '/features',
  },
  {
    icon: '🎯',
    title: 'Smart Job Matching',
    description:
      'Paste any job description and get a multi-method match score with concrete fixes to close the gap.',
    gradient: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
    to: '/features',
  },
  {
    icon: '⚡',
    title: 'Skill Extraction',
    description:
      'Automatically detects 200+ technical, soft and domain skills — plus certifications — from your text.',
    gradient: 'linear-gradient(135deg, #f97316, #ef4444)',
    to: '/features',
  },
  {
    icon: '📊',
    title: 'Real ATS Scoring',
    description:
      'Run a live applicant-tracking analysis: keywords, formatting, readability and experience breakdown.',
    gradient: 'linear-gradient(135deg, #10b981, #14b8a6)',
    to: '/features',
  },
  {
    icon: '🎨',
    title: '7 Pro Templates',
    description:
      'Modern, Professional, Minimal, Executive, ATS-Friendly, Creative and Academic — all print-perfect.',
    gradient: 'linear-gradient(135deg, #6366f1, #a855f7)',
    to: '/templates',
  },
  {
    icon: '🚀',
    title: 'Live Preview & Export',
    description:
      'Watch every keystroke render instantly, then export a pixel-perfect PDF in one click.',
    gradient: 'linear-gradient(135deg, #ec4899, #f43f5e)',
    to: '/features',
  },
];

const STEPS = [
  {
    icon: '📝',
    title: 'Enter your info',
    text: 'Fill the guided sections or let our AI extract everything from your existing resume.',
  },
  {
    icon: '🤖',
    title: 'AI enhancement',
    text: 'Get instant summaries, stronger bullets, skill extraction and an ATS score with fixes.',
  },
  {
    icon: '🚀',
    title: 'Download & apply',
    text: 'Export a recruiter-ready PDF and start applying with confidence — usually within 8 minutes.',
  },
];

const TESTIMONIALS = [
  {
    name: 'Sarah Johnson',
    role: 'Software Engineer',
    company: 'Google',
    image: '👩‍💻',
    text: 'The AI resume builder helped me land my dream job at Google. The ML-powered suggestions were incredibly accurate.',
    rating: 5,
  },
  {
    name: 'Michael Chen',
    role: 'Data Scientist',
    company: 'Microsoft',
    image: '👨‍💼',
    text: "The skill extraction feature is mind-blowing. It identified skills I didn't even realize I should highlight!",
    rating: 5,
  },
  {
    name: 'Emily Rodriguez',
    role: 'Product Manager',
    company: 'Amazon',
    image: '👩‍💼',
    text: 'Job matching scores helped me target the right positions. Got 3 offers in 2 weeks!',
    rating: 5,
  },
];

const FAQS = [
  {
    q: 'Is AI Resume Builder really free?',
    a: 'Yes — the free plan includes 3 resumes per month, all 7 templates, basic ATS scoring and 5 AI credits. No credit card required, ever.',
  },
  {
    q: 'How does the ATS score work?',
    a: 'We simulate how real applicant tracking systems parse your file: keyword coverage against the job description, formatting compatibility, section structure, readability and experience relevance — then give you a 0–100 score with specific fixes.',
  },
  {
    q: 'Will AI write things that are not true about me?',
    a: 'Never. AI only rephrases and structures what you provide. Every suggestion lands in a draft state that you review and approve before it enters your resume.',
  },
  {
    q: 'Can I export to PDF?',
    a: 'Yes — one-click PDF export with print-optimized CSS keeps fonts, spacing and section breaks identical to the live preview.',
  },
];

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [demoTab, setDemoTab] = useState<'summary' | 'ats' | 'skills'>('summary');

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="home-page">
      {/* ================= HERO ================= */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-gradient" />
          <div className="hero-shapes">
            <div className="shape shape-1" />
            <div className="shape shape-2" />
            <div className="shape shape-3" />
          </div>
        </div>

        <div className="container hero-content">
          <div className={`hero-text ${isVisible ? 'animate-fadeIn' : ''}`}>
            <div className="hero-badge">
              <span className="badge-icon" aria-hidden="true">✨</span>
              <span>AI-Powered Resume Builder</span>
            </div>

            <h1 className="hero-title">
              Build Your <span className="text-gradient">Dream Career</span> with AI
            </h1>

            <p className="hero-description">
              Create professional, ATS-optimized resumes in minutes with our ML-powered platform.
              Intelligent writing, real ATS scoring and job matching — all in one editor.
            </p>

            <div className="hero-actions">
              {isAuthenticated ? (
                <>
                  <button onClick={() => navigate('/dashboard')} className="btn btn-gradient btn-lg">
                    <span>Go to Dashboard</span>
                    <span className="btn-icon" aria-hidden="true">→</span>
                  </button>
                  <button onClick={() => navigate('/resumes/create')} className="btn btn-outline btn-lg">
                    <span>Create Resume</span>
                    <span className="btn-icon" aria-hidden="true">+</span>
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => navigate('/register')} className="btn btn-gradient btn-lg">
                    <span>Get Started Free</span>
                    <span className="btn-icon" aria-hidden="true">→</span>
                  </button>
                  <button onClick={() => navigate('/features')} className="btn btn-outline btn-lg">
                    <span>See How It Works</span>
                  </button>
                </>
              )}
            </div>

            <p className="hero-note">No credit card required · Free forever plan · Cancel anytime</p>

            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-value"><CountUp to={50} suffix="K+" /></div>
                <div className="stat-label">Resumes Created</div>
              </div>
              <div className="stat-item">
                <div className="stat-value"><CountUp to={95} suffix="%" /></div>
                <div className="stat-label">ATS Pass Rate</div>
              </div>
              <div className="stat-item">
                <div className="stat-value"><CountUp to={200} suffix="+" /></div>
                <div className="stat-label">Skills Tracked</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">24/7</div>
                <div className="stat-label">AI Assistant</div>
              </div>
            </div>
          </div>

          <div className={`hero-visual ${isVisible ? 'animate-slideInRight' : ''}`}>
            <div className="visual-container">
              {/* Floating: AI analysis */}
              <div className="floating-card card-1">
                <div className="card-header-mini">
                  <div className="avatar-mini">🤖</div>
                  <div>
                    <div className="card-title-mini">AI Analysis</div>
                    <div className="card-subtitle-mini">In progress</div>
                  </div>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '75%' }} />
                </div>
                <div className="card-footer-mini">75% Complete</div>
              </div>

              {/* Floating: skills */}
              <div className="floating-card card-2">
                <div className="skill-badge">Python</div>
                <div className="skill-badge">React</div>
                <div className="skill-badge">AWS</div>
                <div className="skill-badge">Docker</div>
              </div>

              {/* Floating: match score */}
              <div className="floating-card card-3">
                <div className="match-score">
                  <div className="score-ring" aria-hidden="true">
                    <svg viewBox="0 0 100 100" width="76" height="76">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="8" />
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke="#4ade80"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 42}
                        strokeDashoffset={2 * Math.PI * 42 * 0.11}
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                    <div className="score-text">89%</div>
                  </div>
                  <div className="score-label">Job Match</div>
                </div>
              </div>

              {/* Main mock resume */}
              <div className="main-visual">
                <div className="resume-preview">
                  <div className="resume-header">
                    <div className="resume-avatar" />
                    <div className="resume-lines">
                      <div className="line line-1" />
                      <div className="line line-2" />
                    </div>
                    <div className="resume-ats-chip">ATS 92</div>
                  </div>
                  <div className="resume-content">
                    <div className="section-bar" />
                    <div className="content-line" />
                    <div className="content-line" />
                    <div className="content-line short" />
                    <div className="section-bar" />
                    <div className="content-line" />
                    <div className="content-line short" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= LOGO STRIP ================= */}
      <section className="logo-strip">
        <div className="container">
          <p className="logo-strip-label">Trusted by candidates hired at</p>
          <div className="logo-strip-items">
            {['Google', 'Microsoft', 'Amazon', 'Meta', 'Stripe', 'Netflix', 'Spotify'].map((c) => (
              <span key={c} className="logo-item">{c}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="features-section section">
        <div className="container">
          <Reveal>
            <div className="section-header">
              <span className="section-eyebrow">⚡ Powerful Features</span>
              <h2 className="heading-2">Everything you need to get hired</h2>
              <p className="section-description">
                Cutting-edge AI and ML, wrapped in an editor that's genuinely pleasant to use.
              </p>
            </div>
          </Reveal>

          <div className="features-grid">
            {FEATURES.map((feature, index) => (
              <Reveal key={feature.title} delay={index * 80}>
                <div className="feature-card" onClick={() => navigate(feature.to)} role="button" tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') navigate(feature.to); }}>
                  <div className="feature-icon" style={{ background: feature.gradient }}>
                    <span aria-hidden="true">{feature.icon}</span>
                  </div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                  <div className="feature-link">Learn more →</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= INTERACTIVE DEMO ================= */}
      <section className="demo-section section">
        <div className="container">
          <Reveal>
            <div className="section-header">
              <span className="section-eyebrow">🔍 See it in action</span>
              <h2 className="heading-2">Real output, not marketing fluff</h2>
              <p className="section-description">
                Here's exactly what our AI produces for each core feature.
              </p>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="demo-panel">
              <div className="demo-tabs" role="tablist">
                {[
                  { id: 'summary', label: '✨ AI Summary' },
                  { id: 'ats', label: '📊 ATS Score' },
                  { id: 'skills', label: '⚡ Skill Extraction' },
                ].map((t) => (
                  <button
                    key={t.id}
                    role="tab"
                    aria-selected={demoTab === t.id}
                    className={`demo-tab ${demoTab === t.id ? 'demo-tab-active' : ''}`}
                    onClick={() => setDemoTab(t.id as typeof demoTab)}
                    type="button"
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="demo-body">
                {demoTab === 'summary' && (
                  <div className="demo-content">
                    <div className="demo-before">
                      <div className="demo-label">Before</div>
                      <p>"Responsible for managing the team and helping with projects."</p>
                    </div>
                    <div className="demo-arrow" aria-hidden="true">→</div>
                    <div className="demo-after">
                      <div className="demo-label demo-label-ai">After ✨</div>
                      <p>
                        "Results-driven lead managing a 7-person cross-functional team, delivering
                        14 projects on time and reducing delivery cycle time by 32% over 3 quarters."
                      </p>
                    </div>
                  </div>
                )}

                {demoTab === 'ats' && (
                  <div className="demo-content demo-content-col">
                    <div className="demo-score-row">
                      {[
                        { label: 'Overall', value: 92, color: '#10b981' },
                        { label: 'Keywords', value: 88, color: '#10b981' },
                        { label: 'Formatting', value: 96, color: '#10b981' },
                        { label: 'Readability', value: 84, color: '#f59e0b' },
                      ].map((s) => (
                        <div key={s.label} className="demo-score">
                          <div className="demo-score-value" style={{ color: s.color }}>{s.value}</div>
                          <div className="demo-score-label">{s.label}</div>
                          <div className="demo-score-bar">
                            <div style={{ width: `${s.value}%`, background: s.color }} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <ul className="demo-list">
                      <li><span className="ok">✓</span> All required sections detected (contact, experience, education, skills)</li>
                      <li><span className="ok">✓</span> Standard headings — parseable by Workday, Taleo, Greenhouse</li>
                      <li><span className="warn">⚠</span> Add 4 missing keywords from the job description</li>
                    </ul>
                  </div>
                )}

                {demoTab === 'skills' && (
                  <div className="demo-content demo-content-col">
                    <div className="demo-label">24 skills detected in 0.4s</div>
                    <div className="demo-skills">
                      {[
                        ['Python', 'technical'], ['React', 'technical'], ['SQL', 'technical'],
                        ['Docker', 'tool'], ['AWS', 'tool'], ['Leadership', 'soft'],
                        ['Stakeholder Mgmt', 'soft'], ['Agile', 'technical'], ['Figma', 'tool'],
                        ['Communication', 'soft'], ['TypeScript', 'technical'], ['CI/CD', 'technical'],
                      ].map(([skill, cat]) => (
                        <span key={skill} className={`demo-skill demo-skill-${cat}`}>
                          {skill}
                        </span>
                      ))}
                      <span className="demo-skill demo-skill-more">+12 more</span>
                    </div>
                    <div className="demo-label" style={{ marginTop: '1rem' }}>Certifications found</div>
                    <div className="demo-skills">
                      <span className="demo-skill demo-skill-cert">AWS Solutions Architect</span>
                      <span className="demo-skill demo-skill-cert">PMP</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="how-it-works-section section">
        <div className="container">
          <Reveal>
            <div className="section-header">
              <span className="section-eyebrow">🧭 Simple process</span>
              <h2 className="heading-2">How it works</h2>
              <p className="section-description">From blank page to ready-to-send PDF in 3 steps</p>
            </div>
          </Reveal>

          <div className="steps-container">
            {STEPS.map((step, i) => (
              <Reveal key={step.title} delay={i * 120}>
                <div className="step-card">
                  <div className="step-number">{i + 1}</div>
                  <div className="step-icon" aria-hidden="true">{step.icon}</div>
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-description">{step.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= TEMPLATES PREVIEW ================= */}
      <section className="section templates-preview-section">
        <div className="container">
          <Reveal>
            <div className="section-header">
              <span className="section-eyebrow">🎨 Templates</span>
              <h2 className="heading-2">Designed to be read by humans and machines</h2>
              <p className="section-description">
                Every template is print-tested and ATS-safe. Pick one, then make it yours.
              </p>
            </div>
          </Reveal>

          <div className="template-scroll">
            {[
              { name: 'Modern', grad: 'linear-gradient(135deg,#667eea,#764ba2)', best: 'Tech & Startups' },
              { name: 'Professional', grad: 'linear-gradient(135deg,#4facfe,#00f2fe)', best: 'Corporate & Finance' },
              { name: 'Minimal', grad: 'linear-gradient(135deg,#43e97b,#38f9d7)', best: 'Design & Arts' },
              { name: 'Executive', grad: 'linear-gradient(135deg,#fa709a,#fee140)', best: 'Senior Leadership' },
            ].map((t, i) => (
              <Reveal key={t.name} delay={i * 90}>
                <div className="template-mini-card" onClick={() => navigate('/templates')} role="button" tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') navigate('/templates'); }}>
                  <div className="template-mini-preview" style={{ background: t.grad }}>
                    <div className="tpl-line w60" />
                    <div className="tpl-line w40" />
                    <div className="tpl-gap" />
                    <div className="tpl-line w90" />
                    <div className="tpl-line w80" />
                    <div className="tpl-line w70" />
                    <div className="tpl-gap" />
                    <div className="tpl-line w85" />
                    <div className="tpl-line w55" />
                  </div>
                  <div className="template-mini-meta">
                    <strong>{t.name}</strong>
                    <span>{t.best}</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="templates-preview-cta">
            <button className="btn btn-outline btn-lg" onClick={() => navigate('/templates')}>
              View all 7 templates →
            </button>
          </div>
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section className="testimonials-section section">
        <div className="container">
          <Reveal>
            <div className="section-header">
              <span className="section-eyebrow">⭐ Success stories</span>
              <h2 className="heading-2">Real people, real offers</h2>
              <p className="section-description">Join thousands of professionals who landed their dream jobs</p>
            </div>
          </Reveal>

          <div className="testimonials-grid">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 100}>
                <div className="testimonial-card">
                  <div className="testimonial-header">
                    <div className="testimonial-avatar" aria-hidden="true">{t.image}</div>
                    <div className="testimonial-info">
                      <div className="testimonial-name">{t.name}</div>
                      <div className="testimonial-role">{t.role} at {t.company}</div>
                    </div>
                  </div>
                  <div className="testimonial-rating" aria-label={`${t.rating} out of 5 stars`}>
                    {'⭐'.repeat(t.rating)}
                  </div>
                  <p className="testimonial-text">"{t.text}"</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PRICING TEASER ================= */}
      <section className="section pricing-teaser">
        <div className="container">
          <Reveal>
            <div className="section-header">
              <span className="section-eyebrow">💳 Pricing</span>
              <h2 className="heading-2">Start free, upgrade when you're ready</h2>
            </div>
          </Reveal>

          <div className="pricing-teaser-grid">
            {[
              { name: 'Free', price: '$0', note: 'forever', features: ['3 resumes/mo', '7 templates', 'Basic ATS score', '5 AI credits'] },
              { name: 'Pro', price: '$9.99', note: '/mo', popular: true, features: ['Unlimited resumes', 'Full ATS analysis', 'Unlimited AI', 'ML predictions'] },
              { name: 'Team', price: '$24.99', note: '/mo', features: ['10 seats', 'Shared templates', 'Team analytics', 'Priority support'] },
            ].map((p) => (
              <div key={p.name} className={`teaser-plan ${p.popular ? 'teaser-plan-popular' : ''}`}>
                {p.popular && <span className="teaser-ribbon">Popular</span>}
                <div className="teaser-name">{p.name}</div>
                <div className="teaser-price">
                  {p.price}<span>{p.note}</span>
                </div>
                <ul>
                  {p.features.map((f) => (
                    <li key={f}><span className="check" aria-hidden="true">✓</span> {f}</li>
                  ))}
                </ul>
                <button
                  className={`btn ${p.popular ? 'btn-gradient' : 'btn-outline'} btn-md btn-full`}
                  onClick={() => navigate('/pricing')}
                >
                  See details
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section className="section">
        <div className="container container-narrow">
          <Reveal>
            <div className="section-header">
              <span className="section-eyebrow">❓ FAQ</span>
              <h2 className="heading-2">Common questions</h2>
            </div>
          </Reveal>

          <div className="faq-list">
            {FAQS.map((item, i) => (
              <div key={i} className={`faq-item ${openFaq === i ? 'faq-open' : ''}`}>
                <button
                  className="faq-question"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                  type="button"
                >
                  <span>{item.q}</span>
                  <span className="faq-chevron" aria-hidden="true">▾</span>
                </button>
                {openFaq === i && <div className="faq-answer">{item.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Build Your Future?</h2>
            <p className="cta-description">
              Join 50,000+ professionals using AI to accelerate their careers
            </p>
            <button
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
              className="btn btn-outline btn-xl cta-btn"
            >
              <span>{isAuthenticated ? 'Go to Dashboard' : 'Start Building Now'}</span>
              <span className="btn-icon" aria-hidden="true">→</span>
            </button>
            <p className="cta-note">✨ No credit card required • Free forever</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
