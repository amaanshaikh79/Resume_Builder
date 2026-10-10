import React from 'react';
import LegalPage from './LegalPage';

const sections = [
  {
    id: 'overview',
    heading: '1. Overview',
    body: [
      'This Privacy Policy explains how AI Resume Builder ("we", "us", "our") collects, uses, and protects your information when you use our website and application.',
      'By using the service you agree to the collection and use of information in accordance with this policy.',
    ],
  },
  {
    id: 'collect',
    heading: '2. Information we collect',
    body: [
      'Account data: email address, name and password hash. We never store your password in plain text.',
      'Resume data: the content you enter into the builder, including personal details, experience, education and skills. This is used solely to provide the service to you.',
      'Usage data: pages visited, features used, and performance metrics, collected in aggregate to improve the product.',
    ],
  },
  {
    id: 'use',
    heading: '3. How we use your information',
    body: [
      'To provide, operate and maintain the resume builder, including saving your resumes and versions.',
      'To power AI features such as summary generation, bullet-point suggestions and cover letters, which process your content temporarily and do not use it to train third-party models.',
      'To send service-related notifications, and — only with your consent — product updates and tips.',
    ],
  },
  {
    id: 'sharing',
    heading: '4. Data sharing',
    body: [
      'We do not sell your personal data. Ever.',
      'We share data only with infrastructure providers (hosting, payment processing, email delivery) who are contractually bound to protect it.',
      'We may disclose information if required by law or to protect the rights and safety of our users.',
    ],
  },
  {
    id: 'security',
    heading: '5. Security',
    body: [
      'Data is encrypted in transit using TLS 1.3 and at rest using AES-256.',
      'Access to production systems requires hardware-key multi-factor authentication.',
      'No system is 100% secure, but we monitor, audit and patch continuously.',
    ],
  },
  {
    id: 'rights',
    heading: '6. Your rights',
    body: [
      'You can access, export or delete your data at any time from Profile → Data Controls.',
      'Deleting your account permanently removes your resumes and personal data within 30 days, except where retention is legally required.',
      'You may opt out of marketing emails using the unsubscribe link in any message.',
    ],
  },
  {
    id: 'cookies',
    heading: '7. Cookies',
    body: [
      'We use strictly necessary cookies for authentication and session management.',
      'Preference cookies remember your theme (light/dark) and template selections.',
      'We do not use third-party advertising cookies.',
    ],
  },
  {
    id: 'contact',
    heading: '8. Contact',
    body: [
      'Questions about this policy? Email privacy@airesumebuilder.dev or use our Contact page and we will respond within 30 days.',
    ],
  },
];

const Privacy: React.FC = () => (
  <LegalPage
    title="Privacy Policy"
    updated="October 7, 2026"
    intro="Your resume contains your life's work. We treat it with the seriousness it deserves — this policy is the full, plain-English version of how we handle your data."
    sections={sections}
  />
);

export default Privacy;
