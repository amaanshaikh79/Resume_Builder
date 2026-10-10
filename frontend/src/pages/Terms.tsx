import React from 'react';
import LegalPage from './LegalPage';

const sections = [
  {
    id: 'acceptance',
    heading: '1. Acceptance of terms',
    body: [
      'By accessing or using AI Resume Builder you agree to be bound by these Terms of Service and all policies referenced within them.',
      'If you do not agree to these terms, do not use the service.',
    ],
  },
  {
    id: 'account',
    heading: '2. Your account',
    body: [
      'You must provide accurate information and keep your credentials secure. You are responsible for all activity under your account.',
      'You must be at least 16 years old to create an account.',
      'One person may not maintain multiple free accounts to circumvent plan limits.',
    ],
  },
  {
    id: 'acceptable-use',
    heading: '3. Acceptable use',
    body: [
      'Do not upload content you do not have the right to use, or that is unlawful, defamatory or infringing.',
      'Do not attempt to probe, scrape, overload or reverse-engineer the service, except via our published API within documented rate limits.',
      'Do not resell or white-label the service without a written partnership agreement.',
    ],
  },
  {
    id: 'ai-content',
    heading: '4. AI-generated content',
    body: [
      'AI suggestions, summaries and bullet points are drafts. You are responsible for reviewing accuracy before submitting a resume to an employer.',
      'AI output may occasionally be inaccurate or resemble existing phrasing. It is provided "as is" without warranty of originality for legal or contractual use.',
    ],
  },
  {
    id: 'billing',
    heading: '5. Plans, billing & refunds',
    body: [
      'Paid plans renew automatically until cancelled. Cancel anytime from Profile → Billing; access continues until the end of the paid period.',
      'We offer a 14-day money-back guarantee on first-time Pro purchases.',
      'Prices may change with 30 days notice; existing subscriptions honour the original price for their current term.',
    ],
  },
  {
    id: 'ip',
    heading: '6. Intellectual property',
    body: [
      'You retain full ownership of the resumes and content you create.',
      'We grant you a worldwide, non-exclusive licence to use the templates and interface solely for creating your own documents.',
      'The AI Resume Builder name, logo, design and codebase are our property and may not be copied without permission.',
    ],
  },
  {
    id: 'disclaimer',
    heading: '7. Disclaimer of warranties',
    body: [
      'The service is provided "as is" and "as available" without warranties of any kind, express or implied.',
      'We do not guarantee that you will receive interviews, job offers, or any particular ATS score outcome.',
    ],
  },
  {
    id: 'liability',
    heading: '8. Limitation of liability',
    body: [
      'To the maximum extent permitted by law, our aggregate liability shall not exceed the amount you paid us in the 12 months preceding the claim.',
      'We are not liable for indirect, incidental or consequential damages including lost profits or lost job opportunities.',
    ],
  },
  {
    id: 'termination',
    heading: '9. Termination',
    body: [
      'You may delete your account at any time from Profile → Settings.',
      'We may suspend or terminate accounts that violate these terms, with notice where practical.',
    ],
  },
  {
    id: 'changes',
    heading: '10. Changes to these terms',
    body: [
      'We may update these terms periodically. Material changes will be announced by email or in-app at least 14 days before taking effect.',
      'Continued use after the effective date constitutes acceptance of the revised terms.',
    ],
  },
  {
    id: 'contact',
    heading: '11. Contact',
    body: ['Questions about these terms: legal@airesumebuilder.dev or via our Contact page.'],
  },
];

const Terms: React.FC = () => (
  <LegalPage
    title="Terms of Service"
    updated="October 7, 2026"
    intro="These terms govern your use of AI Resume Builder. We've kept them as short and clear as we can while protecting both sides."
    sections={sections}
  />
);

export default Terms;
