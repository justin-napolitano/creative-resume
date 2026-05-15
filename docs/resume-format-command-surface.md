# Resume Format Command Surface

This repo implements the target-side API expected by the platform resume-format contract. The commands are side-effect free and emit JSON envelopes for Codex Platform, MCP wrappers, or future web control panes.

## Commands

```bash
npm run resume.format.status
npm run resume.format.validate-source
npm run resume.format.validate-export -- --profile=web_resume
npm run resume.format.claim-audit -- --targeted-packet-json='{"source_fact_ids":["identity.name"]}'
```

The command IDs match the platform contract:

- `resume.format.status`
- `resume.format.validate-source`
- `resume.format.validate-export`
- `resume.format.claim-audit`

## Source Facts

The command surface derives stable `source_fact_id` values from `src/data/resume.json`.

Examples:

- `identity.name`
- `skill.data-science-platforms.sql`
- `experience.data-engineer-adventhealth.bullet.1`
- `project.heart-failure-quality-metrics-dashboard.bullet.1`

Tailored resume previews now return these IDs with ranked skills, experience, and projects. Any future worker that generates a targeted packet must preserve the IDs so `resume.format.claim-audit` can reject unsupported or private claims before a human review.

## Output Profiles

Profiles live in `src/data/resume-format.json`.

- `web_resume`: public site profile, available now
- `ats_pdf`: parser-friendly PDF profile, backed by `public/resume.pdf`
- `human_pdf`: recruiter/referral PDF profile, backed by `public/resume.pdf`
- `targeted_job_application`: JSON selection packet profile, available now
- `ats_docx`: planned fallback profile, not exported yet

`ats_docx` intentionally reports as planned instead of blocked. The profile is part of the contract so agents know it exists, but this slice does not create a DOCX renderer.
