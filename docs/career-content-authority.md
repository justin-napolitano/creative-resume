# Career Content Authority

`src/data/resume.json` is the first canonical store for shared career-suite facts. The content authority manifest at `src/data/content-authority.json` defines which fields are public, which fields are private, which downstream targets consume projections, and which repo-local JSON commands are stable enough for Codex Platform or MCP wrappers to call.

This repo owns the resume content model, PDF generation, and resume/CV export behavior. The platform repo owns orchestration contracts only.

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

## Publish Workflow

The current publish path remains:

1. update `src/data/resume.json`
2. run `npm run career:status`
3. run `npm run career:sync-preview -- --target=all`
4. run `npm run check`
5. run `npm run build`
6. run `npm run pdf` when a refreshed PDF is needed

Tailored resume PDF generation should be added after the content authority has stable validation and after the worker can produce a human-reviewable selection plan.

## Application Automation Boundary

Job polling, job-fit scoring, application packet generation, and application submission are separate later workers. This slice only prepares the content and selection substrate. Automatic submission must remain deferred until there is explicit policy for identity use, claim review, destination allowlists, and human approval.
