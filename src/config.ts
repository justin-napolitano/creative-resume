import resumeData from '@/data/resume.json';
import copyData from '@/data/copy.json';

export type ResumeData = typeof resumeData;

export const resume: ResumeData = resumeData;

export type CopyData = typeof copyData;

export const siteCopy: CopyData = copyData;

type SiteConfig = {
  siteTitle: string;
  siteDescription: string;
  siteUrl: string;
  heroThesis: string;
  marginNote: string;
  bookCallUrl: string;
  pdfPath: string;
  pullQuotes: Record<string, string>;
};

export const siteConfig: SiteConfig = {
  siteTitle: `${resume.header.name} — Editorial Resume`,
  siteDescription:
    'Systems-led data engineer who turns healthcare and media operations into legible analytics for creative leadership.',
  siteUrl: 'https://resume.jnap.me',
  heroThesis: siteCopy.hero.thesis,
  marginNote: siteCopy.hero.marginNote,
  bookCallUrl: 'https://cal.com/justin-napolitano-gvu3p3/intro',
  pdfPath: '/resume.pdf',
  pullQuotes: {
    'Data Engineer': 'Epic Clarity → Vizient → CFO briefings, harmonized inside 24h.',
    'Data & Analytics Engineer': 'LLM + CDP stack stitched across Rolling Stone, Billboard, WWD.',
  },
};

export const sectionMeta = [
  { id: 'summary', code: 'PR.01', label: 'Capabilities' },
  { id: 'experience', code: 'EX.01', label: 'Experience' },
  { id: 'work', code: 'WK.02', label: 'Selected work' },
  { id: 'skills', code: 'SK.03', label: 'Systems + tools' },
  { id: 'education', code: 'ED.04', label: 'Education' },
  { id: 'publications', code: 'PB.05', label: 'Publication' },
] as const;

export const sectionNotes: Record<string, string> = {
  summary: '',
  experience: '',
  work: '',
  skills: '',
  education: '',
  publications: '',
};

export const experienceNotes: Record<string, string> = {
  'Data Engineer': 'Azure Data Factory + Synapse landed Epic Clarity extracts into one CFO-ready source within 24 hours.',
  'Business Analyst II': 'SQL + Power BI pipelines kept readmission and heart failure metrics aligned across clinical teams.',
  'Data & Analytics Engineer': 'LLM + CDP stack stitched across Rolling Stone, Billboard, WWD for exec-ready insights.',
  'Independent Data Consultant': 'Implemented CDPs and GCP migrations targeting 2M+ high-value prospects.',
  'Research Assistant': 'Open MySQL human-rights database shared with the International Criminal Court.',
};

export const utilityLinks = [
  resume.header.email ? { label: 'Email', value: resume.header.email, href: `mailto:${resume.header.email}` } : null,
  resume.header.linkedin_url
    ? { label: 'LinkedIn', value: resume.header.linkedin, href: resume.header.linkedin_url }
    : null,
  resume.header.github_url ? { label: 'GitHub', value: resume.header.github, href: resume.header.github_url } : null,
].filter(Boolean) as Array<{ label: string; value: string; href: string }>;
