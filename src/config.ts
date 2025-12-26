import resumeData from '@/data/resume.json';

export type ResumeData = typeof resumeData;

export const resume: ResumeData = resumeData;

export const siteConfig = {
  siteTitle: `${resume.header.name} — Editorial Resume`,
  siteDescription:
    'Systems-led data engineer translating healthcare and media operations into legible analytics for creative leaders.',
  siteUrl: 'https://resume.jnap.me',
  heroThesis:
    'Data engineer translating heart failure quality metrics and media portfolios into legible systems for creative leaders.',
  marginNote: 'Systems-first clarity. Healthcare-grade rigor.',
  bookCallUrl: 'https://cal.com/justin-napolitano-gvu3p3/intro',
  pdfPath: '/resume.pdf',
};

export const utilityLinks = [
  resume.header.email ? { label: 'Email', value: resume.header.email, href: `mailto:${resume.header.email}` } : null,
  resume.header.linkedin_url
    ? { label: 'LinkedIn', value: resume.header.linkedin, href: resume.header.linkedin_url }
    : null,
  resume.header.github_url ? { label: 'GitHub', value: resume.header.github, href: resume.header.github_url } : null,
].filter(Boolean) as Array<{ label: string; value: string; href: string }>;
