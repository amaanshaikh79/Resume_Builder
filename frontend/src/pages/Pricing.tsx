import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import '../styles/design-system.css';
import './Marketing.css';

interface Plan {
  id: 'free' | 'pro' | 'team';
  name: string;
  tagline: string;
  monthly: number;
  annual: number;
  popular?: boolean;
  features: string[];
  cta: string;
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'Everything you need to get started',
    monthly: 0,
    annual: 0,
    features: [
      '3 resumes per month',
      '7 professional templates',
      'Basic ATS scoring',
      'AI summary (5 credits/mo)',
      'PDF export',
      'Community support',
    ],
    cta: 'Start Free',
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'For serious job seekers',
    monthly: 9.99,
    annual: 7.99,
    popular: true,
    features: [
      'Unlimited resumes & versions',
      'All 7 templates + premium layouts',
      'Full ATS analysis with suggestions',
      'Unlimited AI writing (summary, bullets, cover letters)',
      'ML job category prediction',
      'Job description matching',
      'Skill extraction (200+ skills)',
      'Priority email support',
    ],
    cta: 'Go Pro',
  },
  {
    id: 'team',
    name: 'Team',
    tagline: 'For coaches, universities & teams',
    monthly: 24.99,
    annual: 19.99,
    features: [
      'Everything in Pro',
      'Up to 10 seats',
      'Shared template library',
      'Team analytics dashboard',
      'Brand customization',
      'Bulk resume review',
      'Dedicated success manager',
    ],
    cta: 'Contact Sales',
  },
];

const FAQS = [
  {
    q: 'Is there really a free plan?',
    a: 'Yes. The Free plan gives you 3 resumes per month, all 7 templates, basic ATS scoring and 5 AI credits — forever, no credit card required.',
  },
  {
    q: 'How does the AI credit system work?',
    a: 'Each AI action (summary, bullet points, cover letter) uses 1 credit. Free plans get 5 credits per month; Pro plans are unlimited with fair-use limits.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Absolutely. Cancel in one click from Profile → Billing. You keep Pro features until the end of your billing period.',
  },
  {
    q: 'Do you offer student discounts?',
    a: 'Yes — students get 50% off Pro. Verify your .edu email at checkout to apply the discount automatically.',
  },
  {
    q: 'Is my resume data secure?',
    a: 'All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We never sell or share your information.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'All major credit/debit cards, PayPal, Apple Pay and Google Pay via Stripe.',
  },
];

const Pricing: React.FC = () => {
  const [annual, setAnnual] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const { isAuthenticated } = useAuth();
  const { info } = useToast();
  const navigate = useNavigate();

  const handleSelect = (plan: Plan) => {
    if (plan.id === 'free') {
      navigate(isAuthenticated ? '/dashboard' : '/register');
      return;
    }
    if (plan.id === 'team') {
      navigate('/contact');
      return;
    }
    if (!isAuthenticated) {
      navigate('/register');
      return;
    }
    info('Checkout coming soon', 'Pro billing will be available shortly. Your plan stays free until then.');
  };

  return (
    <div className="marketing-page">
      {/* Hero */}
      <section className="mk-hero">
        <div className="container mk-hero-inner">
          <span className="mk-badge">💳 Simple, transparent pricing</span>
          <h1 className="mk-hero-title">
            Plans that scale with your <span className="text-gradient">ambition</span>
          </h1>
          <p className="mk-hero-sub">
            Start free. Upgrade when you need unlimited AI power. No hidden fees, cancel anytime.
          </p>

          <div className="billing-toggle" role="group" aria-label="Billing period">
            <button
              type="button"
              className={`billing-option ${!annual ? 'billing-active' : ''}`}
              onClick={() => setAnnual(false)}
            >
              Monthly
            </button>
            <button
              type="button"
              className={`billing-option ${annual ? 'billing-active' : ''}`}
              onClick={() => setAnnual(true)}
            >
              Annual <span className="billing-save">Save 20%</span>
            </button>
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="section">
        <div className="container">
          <div className="pricing-grid">
            {PLANS.map((plan) => {
              const price = annual ? plan.annual : plan.monthly;
              return (
                <div key={plan.id} className={`pricing-card ${plan.popular ? 'pricing-popular' : ''}`}>
                  {plan.popular && <div className="pricing-ribbon">Most Popular</div>}
                  <div className="pricing-name">{plan.name}</div>
                  <div className="pricing-tagline">{plan.tagline}</div>
                  <div className="pricing-price">
                    <span className="price-currency">$</span>
                    <span className="price-amount">{price}</span>
                    <span className="price-period">{price === 0 ? '/forever' : '/month'}</span>
                  </div>
                  {annual && price > 0 && (
                    <div className="pricing-billed">Billed ${(price * 12).toFixed(2)} annually</div>
                  )}

                  <button
                    className={`btn ${plan.popular ? 'btn-gradient' : 'btn-outline'} btn-md btn-full`}
                    onClick={() => handleSelect(plan)}
                    type="button"
                  >
                    {plan.cta}
                  </button>

                  <ul className="pricing-features">
                    {plan.features.map((f) => (
                      <li key={f}>
                        <span className="check" aria-hidden="true">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison strip */}
      <section className="section pricing-strip-section">
        <div className="container">
          <div className="pricing-strip">
            <div>
              <h2 className="heading-2" style={{ fontSize: 'var(--text-2xl)' }}>
                All plans include
              </h2>
            </div>
            <div className="pricing-strip-items">
              {['ATS-optimized templates', 'Auto-save & versions', 'Encrypted storage', 'PDF export', 'Mobile friendly', 'No ads'].map(
                (item) => (
                  <span key={item} className="pricing-strip-item">
                    <span className="check" aria-hidden="true">✓</span> {item}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section">
        <div className="container container-narrow">
          <div className="section-header">
            <h2 className="heading-2">Frequently asked questions</h2>
            <p className="section-description">Everything you need to know before choosing a plan</p>
          </div>

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

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Start building for free</h2>
            <p className="cta-description">
              Join 50,000+ professionals who created ATS-optimized resumes with AI
            </p>
            <Link to={isAuthenticated ? '/dashboard' : '/register'}>
              <button className="btn btn-outline btn-xl cta-btn">
                <span>{isAuthenticated ? 'Go to Dashboard' : 'Create Free Account'}</span>
                <span className="btn-icon" aria-hidden="true">→</span>
              </button>
            </Link>
            <p className="cta-note">✨ No credit card required • Free forever plan</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
