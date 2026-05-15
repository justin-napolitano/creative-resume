import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const repoRoot = path.resolve(new URL('..', import.meta.url).pathname);
const resumePath = path.join(repoRoot, 'src/data/resume.json');
const authorityPath = path.join(repoRoot, 'src/data/content-authority.json');
const jobWorkflowPath = path.join(repoRoot, 'src/data/job-application-workflow.json');
const resumeFormatPath = path.join(repoRoot, 'src/data/resume-format.json');
const artifactRefs = [
  'src/data/resume.json',
  'src/data/content-authority.json',
  'src/data/job-application-workflow.json',
  'src/data/resume-format.json',
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
const commandAliases = new Map([
  ['resume.format.status', 'format-status'],
  ['resume.format.validate-source', 'format-validate-source'],
  ['resume.format.validate-export', 'format-validate-export'],
  ['resume.format.claim-audit', 'format-claim-audit'],
]);
const normalizedCommand = commandAliases.get(command) ?? command;

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

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function envelope(commandName, payload = {}, options = {}) {
  const blockers = options.blockers ?? [];
  const warnings = options.warnings ?? [];
  const ok = blockers.length === 0;
  return {
    ok,
    status: ok ? 'ok' : 'blocked',
    repo_id: 'creative-resume',
    command: commandName,
    blockers,
    warnings,
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

function slugify(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function addFact(facts, fact) {
  facts.push({
    evidence_refs: [],
    visibility: 'public',
    ...fact,
  });
}

function sourceFactIndex(resume) {
  const facts = [];
  const header = resume.header ?? {};
  for (const [field, value] of Object.entries(header)) {
    const visibility = field === 'phone' ? 'private' : 'public';
    addFact(facts, {
      id: `identity.${field}`,
      type: field === 'phone' || field === 'email' || field.includes('url') ? 'contact_channels' : 'identity',
      label: field,
      value,
      visibility,
    });
  }
  for (const item of resume.summary ?? []) {
    addFact(facts, {
      id: `summary.${item.id ?? slugify(item.label)}`,
      type: 'professional_summary',
      label: item.label,
      value: item.note,
    });
  }
  for (const item of resume.education ?? []) {
    const id = `education.${slugify(item.institution)}.${slugify(item.degree)}`;
    addFact(facts, {
      id,
      type: 'education',
      label: item.degree,
      value: [item.institution, item.location, item.graduation_date].filter(Boolean).join(' | '),
    });
  }
  for (const group of resume.skills ?? []) {
    for (const item of group.items ?? []) {
      addFact(facts, {
        id: `skill.${group.id ?? slugify(group.area)}.${slugify(item.name)}`,
        type: 'skills',
        label: item.name,
        value: [group.area, group.stack, item.name, ...(item.tags ?? [])].filter(Boolean).join(' | '),
      });
    }
  }
  for (const item of resume.experience ?? []) {
    addFact(facts, {
      id: `experience.${item.id}`,
      type: 'roles',
      label: item.title,
      value: [item.company, item.location, item.start, item.end, ...(item.technologies ?? [])].filter(Boolean).join(' | '),
    });
    for (const [index, bullet] of (item.bullets ?? []).entries()) {
      addFact(facts, {
        id: `experience.${item.id}.bullet.${index + 1}`,
        type: 'roles',
        label: `${item.title} bullet ${index + 1}`,
        value: bullet,
      });
    }
  }
  for (const item of resume.projects ?? []) {
    addFact(facts, {
      id: `project.${item.id}`,
      type: 'projects',
      label: item.name,
      value: [item.context, ...(item.technologies ?? [])].filter(Boolean).join(' | '),
    });
    for (const [index, bullet] of (item.bullets ?? []).entries()) {
      addFact(facts, {
        id: `project.${item.id}.bullet.${index + 1}`,
        type: 'projects',
        label: `${item.name} bullet ${index + 1}`,
        value: bullet,
      });
    }
  }
  for (const item of resume.publications ?? []) {
    addFact(facts, {
      id: `publication.${item.id ?? slugify(item.title)}`,
      type: 'publications',
      label: item.title,
      value: [item.venue, item.year, item.doi, item.url].filter(Boolean).join(' | '),
    });
  }
  return {
    facts,
    byId: new Map(facts.map((fact) => [fact.id, fact])),
  };
}

function factCounts(facts) {
  return facts.reduce((acc, fact) => {
    acc[`${fact.type}_facts`] = (acc[`${fact.type}_facts`] ?? 0) + 1;
    return acc;
  }, {});
}

function validateAuthority(authority, resume, resumeFormat) {
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
  if (resumeFormat.source_path !== authority.source_path) {
    blockers.push('format_source_path_mismatch');
  }
  for (const field of authority.private_fields ?? []) {
    if ((authority.public_fields ?? []).includes(field)) {
      blockers.push(`private_field_marked_public:${field}`);
    }
  }
  const commandSet = new Set(authority.api_surface?.commands ?? []);
  for (const requiredCommand of ['format-status', 'format-validate-source', 'format-validate-export', 'format-claim-audit']) {
    if (!commandSet.has(requiredCommand)) blockers.push(`missing_api_command:${requiredCommand}`);
  }
  const experienceIds = new Set();
  for (const item of resume.experience ?? []) {
    if (!item.id) blockers.push(`experience_missing_id:${item.title ?? 'unknown'}`);
    if (experienceIds.has(item.id)) blockers.push(`duplicate_experience_id:${item.id}`);
    experienceIds.add(item.id);
  }
  const projectIds = new Set();
  for (const item of resume.projects ?? []) {
    if (!item.id) blockers.push(`project_missing_id:${item.name ?? 'unknown'}`);
    if (projectIds.has(item.id)) blockers.push(`duplicate_project_id:${item.id}`);
    projectIds.add(item.id);
  }
  const { facts } = sourceFactIndex(resume);
  const factIds = new Set();
  for (const fact of facts) {
    if (!fact.id) blockers.push(`source_fact_missing_id:${fact.label ?? 'unknown'}`);
    if (factIds.has(fact.id)) blockers.push(`duplicate_source_fact_id:${fact.id}`);
    factIds.add(fact.id);
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
      source_fact_id: `skill.${group.id ?? slugify(group.area)}.${slugify(item.name)}`,
      source_fact_ids: [`skill.${group.id ?? slugify(group.area)}.${slugify(item.name)}`],
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
    source_fact_id: `experience.${item.id}`,
    source_fact_ids: [
      `experience.${item.id}`,
      ...(item.bullets ?? []).map((_bullet, index) => `experience.${item.id}.bullet.${index + 1}`),
    ],
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
    source_fact_id: `project.${item.id}`,
    source_fact_ids: [
      `project.${item.id}`,
      ...(item.bullets ?? []).map((_bullet, index) => `project.${item.id}.bullet.${index + 1}`),
    ],
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
  const [resume, authority, jobWorkflow, resumeFormat] = await Promise.all([
    readJson(resumePath),
    readJson(authorityPath),
    readJson(jobWorkflowPath),
    readJson(resumeFormatPath),
  ]);
  return { resume, authority, jobWorkflow, resumeFormat };
}

function statusPayload(resume, authority, jobWorkflow, resumeFormat) {
  const blockers = validateAuthority(authority, resume, resumeFormat);
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
      resume_format: {
        source_path: resumeFormat.source_path,
        profile_count: (resumeFormat.output_profiles ?? []).length,
        profiles: (resumeFormat.output_profiles ?? []).map((profile) => profile.id),
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

function formatStatusPayload(resume, authority, resumeFormat) {
  const { facts } = sourceFactIndex(resume);
  const plannedProfiles = (resumeFormat.output_profiles ?? [])
    .filter((profile) => profile.implementation_state === 'planned')
    .map((profile) => profile.id);
  return envelope(
    'format-status',
    {
      source_path: resumeFormat.source_path,
      platform_contract: resumeFormat.source_contract ?? {},
      profile_count: (resumeFormat.output_profiles ?? []).length,
      profiles: (resumeFormat.output_profiles ?? []).map((profile) => ({
        id: profile.id,
        preferred_extension: profile.preferred_extension,
        implementation_state: profile.implementation_state,
        validation_gates: profile.validation_gates ?? [],
      })),
      source_fact_count: facts.length,
      source_fact_counts: factCounts(facts),
      public_private_boundary: {
        public_fields: authority.public_fields ?? [],
        private_fields: authority.private_fields ?? [],
      },
    },
    {
      blockers: validateAuthority(authority, resume, resumeFormat),
      warnings: plannedProfiles.map((profile) => `profile_export_planned:${profile}`),
      next_actions: [
        {
          action: 'call_format_validate_source',
          reason: 'source_fact_index_available',
        },
      ],
    },
  );
}

function validateSourcePayload(resume, authority, resumeFormat) {
  const { facts } = sourceFactIndex(resume);
  const privateFacts = facts.filter((fact) => fact.visibility === 'private').map((fact) => fact.id);
  const publicFacts = facts.filter((fact) => fact.visibility === 'public').map((fact) => fact.id);
  const canonicalEntityCoverage = {
    identity: publicFacts.some((id) => id.startsWith('identity.name')),
    contact_channels: publicFacts.some((id) => id.startsWith('identity.email')),
    professional_summary: publicFacts.some((id) => id.startsWith('summary.')),
    roles: publicFacts.some((id) => id.startsWith('experience.')),
    employers: (resume.experience ?? []).every((item) => Boolean(item.company)),
    projects: publicFacts.some((id) => id.startsWith('project.')),
    skills: publicFacts.some((id) => id.startsWith('skill.')),
    education: publicFacts.some((id) => id.startsWith('education.')),
    portfolio_links: Boolean(resume.header?.github_url || resume.header?.linkedin_url),
    evidence_refs: true,
  };
  const blockers = validateAuthority(authority, resume, resumeFormat);
  for (const [entity, covered] of Object.entries(canonicalEntityCoverage)) {
    if (!covered) blockers.push(`canonical_entity_uncovered:${entity}`);
  }
  return envelope(
    'format-validate-source',
    {
      source_path: resumeFormat.source_path,
      canonical_entity_coverage: canonicalEntityCoverage,
      source_fact_count: facts.length,
      source_fact_counts: factCounts(facts),
      private_fact_ids: privateFacts,
      sample_public_fact_ids: publicFacts.slice(0, 12),
    },
    {
      blockers,
      next_actions: blockers.length
        ? [{ action: 'repair_resume_source', reason: 'format_source_blocked' }]
        : [{ action: 'call_format_validate_export', reason: 'format_source_valid' }],
    },
  );
}

async function validateExportPayload(resume, authority, resumeFormat) {
  const profileId = params.profile ?? 'web_resume';
  const profile = (resumeFormat.output_profiles ?? []).find((item) => item.id === profileId);
  const blockers = [];
  const warnings = [];
  if (!profile) blockers.push(`unknown_output_profile:${profileId}`);
  blockers.push(...validateAuthority(authority, resume, resumeFormat));
  const artifactPath = profile?.artifact_path ? path.join(repoRoot, profile.artifact_path) : '';
  const artifactExists = artifactPath ? await pathExists(artifactPath) : false;
  if (profile?.implementation_state === 'available' && profile.artifact_path && !artifactExists) {
    blockers.push(`missing_export_artifact:${profile.artifact_path}`);
  }
  if (profile?.implementation_state === 'planned') {
    warnings.push(`profile_export_planned:${profile.id}`);
  }
  if (profile?.layout_objects_allowed === false && ['ats_docx', 'ats_pdf'].includes(profile.id)) {
    warnings.push('layout_object_scan_pending');
  }
  return envelope(
    'format-validate-export',
    {
      profile: profileId,
      profile_policy: profile ?? null,
      artifact: profile
        ? {
            path: profile.artifact_path,
            exists: artifactExists,
            preferred_extension: profile.preferred_extension,
          }
        : null,
      gates: (profile?.validation_gates ?? []).map((gate) => ({
        id: gate,
        state: gate === 'claim_audit' ? 'available_via_format_claim_audit' : 'source_policy_checked',
      })),
    },
    {
      blockers,
      warnings,
      next_actions: blockers.length
        ? [{ action: 'repair_export_profile', reason: `format_export_blocked:${profileId}` }]
        : [{ action: 'profile_ready_for_agent_use', reason: `format_export_valid:${profileId}` }],
    },
  );
}

function collectFactIds(value, out = new Set()) {
  if (Array.isArray(value)) {
    for (const item of value) collectFactIds(item, out);
  } else if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      if (['source_fact_id', 'fact_id'].includes(key) && typeof item === 'string') out.add(item);
      else if (['source_fact_ids', 'fact_ids', 'selected_fact_ids'].includes(key) && Array.isArray(item)) {
        for (const id of item) {
          if (typeof id === 'string') out.add(id);
        }
      } else {
        collectFactIds(item, out);
      }
    }
  }
  return out;
}

async function readTargetedPacket() {
  if (params['targeted-packet']) return readJson(path.resolve(process.cwd(), params['targeted-packet']));
  if (params['targeted-packet-json']) return JSON.parse(params['targeted-packet-json']);
  return null;
}

async function claimAuditPayload(resume) {
  const packet = await readTargetedPacket();
  const blockers = [];
  if (!packet) blockers.push('targeted_packet_required');
  const { byId } = sourceFactIndex(resume);
  const selectedFactIds = [...collectFactIds(packet)].sort();
  if (packet && selectedFactIds.length === 0) blockers.push('targeted_packet_source_fact_ids_required');
  const unknownFactIds = selectedFactIds.filter((id) => !byId.has(id));
  blockers.push(...unknownFactIds.map((id) => `unknown_source_fact_id:${id}`));
  const privateFactIds = selectedFactIds.filter((id) => byId.get(id)?.visibility === 'private');
  blockers.push(...privateFactIds.map((id) => `private_source_fact_selected:${id}`));
  return envelope(
    'format-claim-audit',
    {
      selected_fact_ids: selectedFactIds,
      selected_fact_count: selectedFactIds.length,
      unknown_fact_ids: unknownFactIds,
      private_fact_ids: privateFactIds,
      claim_state: blockers.length ? 'needs_review' : 'source_backed',
    },
    {
      blockers,
      next_actions: blockers.length
        ? [{ action: 'repair_targeted_packet', reason: 'claim_audit_blocked' }]
        : [{ action: 'human_review_packet', reason: 'claim_audit_source_backed' }],
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
        source_fact_ids_required: true,
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
  const { resume, authority, jobWorkflow, resumeFormat } = await loadContent();
  let result;
  if (normalizedCommand === 'status') result = statusPayload(resume, authority, jobWorkflow, resumeFormat);
  else if (normalizedCommand === 'profile') result = profilePayload(resume);
  else if (normalizedCommand === 'sync-preview') result = syncPreviewPayload(resume, authority);
  else if (normalizedCommand === 'tailor-preview') result = await tailorPreviewPayload(resume);
  else if (normalizedCommand === 'job-workflow') result = jobWorkflowPayload(jobWorkflow);
  else if (normalizedCommand === 'format-status') result = formatStatusPayload(resume, authority, resumeFormat);
  else if (normalizedCommand === 'format-validate-source') result = validateSourcePayload(resume, authority, resumeFormat);
  else if (normalizedCommand === 'format-validate-export') result = await validateExportPayload(resume, authority, resumeFormat);
  else if (normalizedCommand === 'format-claim-audit') result = await claimAuditPayload(resume);
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
