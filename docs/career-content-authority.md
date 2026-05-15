# Career Content Authority

`src/data/resume.json` is the first canonical store for shared career-suite facts. The content authority manifest at `src/data/content-authority.json` defines which fields are public, which fields are private, which downstream targets consume projections, and which repo-local JSON commands are stable enough for Codex Platform or MCP wrappers to call.

This repo owns the resume content model, PDF generation, and resume/CV export behavior. The platform repo owns orchestration contracts only.

`src/data/resume-format.json` is the target-local projection of the platform resume format contract. It lists the output profiles this repo can validate for agents: ATS PDF, human PDF, web resume, targeted job application packets, and the planned ATS DOCX fallback.

## JSON Command Surface

The first API surface is a repo-local command:

```bash
node scripts/career-content-api.mjs status
```

Every command emits a JSON envelope with:

- `ok`
- `status`
- `repo_id`
- `command`
- `blockers`
- `artifacts`
- `next_actions`

Supported commands:

- `status`: validates the content authority and returns counts, public identity, and sync targets
- `profile`: returns the public profile and high-level resume inventory
- `sync-preview --target=all`: previews deterministic downstream payloads for `resume`, `docs`, `hire`, and `link`
- `tailor-preview --job-text="..."`: ranks existing skills, experience, and projects against a job posting without generating a PDF or inventing facts
- `job-normalize --job-text="..."`: normalizes a posting into deterministic job fields, keywords, and detected requirement terms
- `fit-report --job-text="..."`: scores job overlap against canonical resume facts and exposes gaps
- `selection-plan --job-text="..."`: creates a source-backed section plan for `targeted_job_application`
- `review-packet --job-text="..."`: bundles normalized job data, fit report, selection plan, claim audit, and risk flags
- `reviewed-export --review-packet=packet.json --approved=true --approved-by="..." --write=true`: writes an approved targeted application JSON artifact
- `format-status`: returns output profiles, source-fact counts, and format contract pointers
- `format-validate-source`: validates canonical resume content and source fact IDs
- `format-validate-export --profile=web_resume`: validates one output profile against current source and artifacts
- `format-claim-audit --targeted-packet-json='{"source_fact_ids":["identity.name"]}'`: checks selected fact IDs in a targeted packet

## Publish Workflow

The current publish path remains:

1. update `src/data/resume.json`
2. run `npm run career:status`
3. run `npm run career:sync-preview -- --target=all`
4. run `npm run resume.format.status`
5. run `npm run resume.format.validate-source`
6. run `npm run resume.format.validate-export -- --profile=web_resume`
7. run `npm run career:review-packet -- --job-text="..."` before any targeted application use
8. run `npm run career:reviewed-export -- --review-packet=packet.json --approved=true --approved-by="..." --write=true` after human review
9. run `npm run check`
10. run `npm run build`
11. run `npm run pdf` when a refreshed PDF is needed

Tailored resume PDF generation should consume a reviewed `review-packet` after the selection plan and claim audit pass.

## Application Automation Boundary

Job polling, job-fit scoring, application packet generation, and application submission are separate later workers. This slice only prepares the content and selection substrate. Automatic submission must remain deferred until there is explicit policy for identity use, claim review, destination allowlists, and human approval.
