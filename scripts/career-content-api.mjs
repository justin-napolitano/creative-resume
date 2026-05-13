import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const repoRoot = path.resolve(new URL('..', import.meta.url).pathname);
const resumePath = path.join(repoRoot, 'src/data/resume.json');
const authorityPath = path.join(repoRoot, 'src/data/content-authority.json');
const jobWorkflowPath = path.join(repoRoot, 'src/data/job-application-workflow.json');
const artifactRefs = [
  'src/data/resume.json',
  'src/data/content-authority.json',
  'src/data/job-application-workflow.json',
  'scripts/career-content-api.mjs',
];

const args = process.argv.slice(2);
const command = args.find((arg) => !arg.startsWith('--')) ?? 'status';
const params = Object.fromEntries(
  args
    .filter((arg) => arg.startsWith('--'))
    .map((arg) => {
      const [key, ...rest] = arg.replace(/^--/, '').split('=');
      return [key, rest.length > 0 ? rest.join('=') : 'true'];
    }),
);

const stopWords = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'for',
  'in',
  'of',
  'on',
  'or',
  'the',
  'to',
  'with',
]);

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, 'utf8'));
}

function envelope(commandName, payload = {}, options = {}) {
  const blockers = options.blockers ?? [];
  const ok = blockers.length === 0;
  return {
    ok,
    status: ok ? 'ok' : 'blocked',
    repo_id: 'creative-resume',
    command: commandName,
    blockers,
    artifacts: artifactRefs,
    next_actions: options.next_actions ?? [],
    ...payload,
  };
}

function publicIdentity(resume) {
  const header = resume.header ?? {};
  return {
    name: header.name ?? '',
    location: header.location ?? '',
    email: header.email ?? '',
    github: header.github ?? '',
    github_url: header.github_url ?? '',
    linkedin: header.linkedin ?? '',
    linkedin_url: header.linkedin_url ?? '',
  };
}

function counts(resume) {
  return {
    summary: (resume.summary ?? []).length,
    education: (resume.education ?? []).length,
    skills: (resume.skills ?? []).length,
    experience: (resume.experience ?? []).length,
    projects: (resume.projects ?? []).length,
    publications: (resume.publications ?? []).length,
    skill_highlights: (resume.skill_highlights ?? []).length,
  };
}

function validateAuthority(authority, resume) {
  const blockers = [];
  const requiredHeader = ['name', 'location', 'email', 'github_url', 'linkedin_url'];
  for (const field of requiredHeader) {
    if (!resume.header?.[field]) blockers.push(`missing_header_field:${field}`);
  }
  for (const field of ['summary', 'skills', 'experience', 'projects']) {
    if (!Array.isArray(resume[field]) || resume[field].length === 0) {
      blockers.push(`empty_content_collection:${field}`);
    }
  }
  if (authority.source_path !== 'src/data/resume.json') {
    blockers.push('authority_source_path_mismatch');
  }
  const experienceIds = new Set();
  for (const item of resume.experience ?? []) {
    if (!item.id) blockers.push(`experience_missing_id:${item.title ?? 'unknown'}`);
    if (experienceIds.has(item.id)) blockers.push(`duplicate_experience_id:${item.id}`);
    experienceIds.add(item.id);
  }
  return blockers;
}

function tokenize(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9+#.]+/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2 && !stopWords.has(token));
}

function scoreText(tokens, value) {
  const textTokens = new Set(tokenize(value));
  return tokens.reduce((score, token) => score + (textTokens.has(token) ? 1 : 0), 0);
}

function skillAtoms(resume) {
  return (resume.skills ?? []).flatMap((group) =>
    (group.items ?? []).map((item) => ({
      area: group.area,
      stack: group.stack,
      name: item.name,
      level: item.level,
      years: item.years,
      tags: item.tags ?? [],
      text: [group.area, group.stack, item.name, ...(item.tags ?? [])].join(' '),
    })),
  );
}

function experienceAtoms(resume) {
  return (resume.experience ?? []).map((item) => ({
    id: item.id,
    title: item.title,
    company: item.company,
    dates: [item.start, item.end].filter(Boolean).join(' - '),
    technologies: item.technologies ?? [],
    bullets: item.bullets ?? [],
    text: [item.title, item.company, ...(item.technologies ?? []), ...(item.bullets ?? [])].join(' '),
  }));
}

function projectAtoms(resume) {
  return (resume.projects ?? []).map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    technologies: item.technologies ?? [],
    text: [item.name, item.description, ...(item.technologies ?? [])].join(' '),
  }));
}

function topMatches(tokens, atoms, limit) {
  return atoms
    .map((atom) => ({ ...atom, score: scoreText(tokens, atom.text) }))
    .filter((atom) => atom.score > 0)
    .sort((a, b) => b.score - a.score || String(a.name ?? a.title ?? a.id).localeCompare(String(b.name ?? b.title ?? b.id)))
    .slice(0, limit);
}

async function loadContent() {
  const [resume, authority, jobWorkflow] = await Promise.all([
    readJson(resumePath),
    readJson(authorityPath),
    readJson(jobWorkflowPath),
  ]);
  return { resume, authority, jobWorkflow };
}

function statusPayload(resume, authority, jobWorkflow) {
  const blockers = validateAuthority(authority, resume);
  return envelope(
    'status',
    {
      content_authority: {
        source_path: authority.source_path,
        owner_target: authority.owner_target,
        transport: authority.api_surface?.transport ?? '',
        commands: authority.api_surface?.commands ?? [],
      },
      public_identity: publicIdentity(resume),
      counts: counts(resume),
      sync_targets: authority.sync_targets ?? [],
      job_application_workflow: {
        source_path: 'src/data/job-application-workflow.json',
        version: jobWorkflow.version ?? '',
        stage_count: (jobWorkflow.stages ?? []).length,
        automation_boundary: jobWorkflow.automation_boundary ?? {},
      },
    },
    {
      blockers,
      next_actions: blockers.length
        ? [{ action: 'repair_content_authority', reason: 'content_authority_blocked' }]
        : [{ action: 'use_content_api', reason: 'content_authority_ready' }],
    },
  );
}

function profilePayload(resume) {
  return envelope('profile', {
    public_identity: publicIdentity(resume),
    summary: resume.summary ?? [],
    skill_areas: (resume.skills ?? []).map((group) => ({
      area: group.area,
      stack: group.stack,
      item_count: (group.items ?? []).length,
    })),
    latest_experience: (resume.experience ?? []).slice(0, 3).map((item) => ({
      id: item.id,
      title: item.title,
      company: item.company,
      dates: [item.start, item.end].filter(Boolean).join(' - '),
    })),
  });
}

function syncPreviewPayload(resume, authority) {
  const target = params.target ?? 'all';
  const identity = publicIdentity(resume);
  const latestExperience = (resume.experience ?? []).slice(0, 2);
  const projects = (resume.projects ?? []).slice(0, 3);
  const projections = {
    link: {
      label: identity.name,
      primary_url: 'https://resume.jnap.me',
      public_channels: [identity.github_url, identity.linkedin_url].filter(Boolean),
    },
    hire: {
      headline: `${identity.name} - ${resume.header?.location ?? ''}`,
      proof_points: latestExperience.flatMap((item) => (item.bullets ?? []).slice(0, 1)),
      contact: { email: identity.email, linkedin_url: identity.linkedin_url },
    },
    docs: {
      evidence_catalog_seed: [
        ...projects.map((item) => ({ type: 'project', id: item.id, title: item.name })),
        ...(resume.publications ?? []).map((item) => ({ type: 'publication', title: item.title })),
      ],
    },
    resume: {
      source_path: authority.source_path,
      pdf_path: 'public/resume.pdf',
      profile_counts: counts(resume),
    },
  };
  const selected = target === 'all' ? projections : { [target]: projections[target] };
  const blockers = Object.values(selected).some((value) => value === undefined) ? [`unknown_sync_target:${target}`] : [];
  return envelope('sync-preview', { target, projections: selected }, { blockers });
}

function jobWorkflowPayload(jobWorkflow) {
  return envelope(
    'job-workflow',
    {
      workflow: jobWorkflow,
    },
    {
      next_actions: [
        {
          action: 'implement_job_intake_contract',
          reason: 'workflow_contract_ready',
        },
      ],
    },
  );
}

async function readJobText() {
  if (params['job-file']) return fs.readFile(path.resolve(process.cwd(), params['job-file']), 'utf8');
  return params['job-text'] ?? '';
}

async function tailorPreviewPayload(resume) {
  const jobText = await readJobText();
  const blockers = jobText.trim() ? [] : ['job_text_required'];
  const tokens = [...new Set(tokenize(jobText))];
  return envelope(
    'tailor-preview',
    {
      normalized_job: {
        token_count: tokens.length,
        keywords: tokens.slice(0, 30),
      },
      ranked_content: {
        skills: topMatches(tokens, skillAtoms(resume), 12).map(({ text, ...item }) => item),
        experience: topMatches(tokens, experienceAtoms(resume), 4).map(({ text, ...item }) => item),
        projects: topMatches(tokens, projectAtoms(resume), 4).map(({ text, ...item }) => item),
      },
      output_policy: {
        pdf_generated: false,
        human_review_required: true,
        invention_allowed: false,
      },
    },
    {
      blockers,
      next_actions: blockers.length
        ? [{ action: 'provide_job_text', reason: 'tailor_preview_needs_job_posting' }]
        : [{ action: 'review_resume_selection', reason: 'tailor_preview_ready' }],
    },
  );
}

async function main() {
  const { resume, authority, jobWorkflow } = await loadContent();
  let result;
  if (command === 'status') result = statusPayload(resume, authority, jobWorkflow);
  else if (command === 'profile') result = profilePayload(resume);
  else if (command === 'sync-preview') result = syncPreviewPayload(resume, authority);
  else if (command === 'tailor-preview') result = await tailorPreviewPayload(resume);
  else if (command === 'job-workflow') result = jobWorkflowPayload(jobWorkflow);
  else result = envelope(command, {}, { blockers: [`unknown_command:${command}`] });
  console.log(JSON.stringify(result, null, 2));
  process.exitCode = result.ok ? 0 : 1;
}

main().catch((error) => {
  console.error(
    JSON.stringify(
      envelope(command, { error: error.message }, { blockers: ['career_content_api_exception'] }),
      null,
      2,
    ),
  );
  process.exitCode = 1;
});
