# Resume Job Application Workflow

This workflow defines how agents can turn a job posting into a reviewed resume packet without inventing facts or submitting applications.

The machine-readable contract is `src/data/job-application-workflow.json`. The current command surface is repo-local JSON:

```bash
npm run career:job-workflow
npm run career:job-normalize -- --job-text="..."
npm run career:fit-report -- --job-text="..."
npm run career:selection-plan -- --job-text="..."
npm run career:review-packet -- --job-text="..."
```

## Operating Boundary

This repo can provide canonical resume facts, role-fit previews, selection plans, review packets, and eventually reviewed PDF exports.

This repo must not submit applications automatically in this slice. Submission requires a later policy for identity use, destination allowlists, claim review, and explicit human approval.

## Workflow Nodes

1. `job_intake`
   Normalize a job posting into source-backed fields: source URL, company, title, location, employment type, description text, and capture timestamp.
   Available through `npm run career:job-normalize`.

2. `fit_scoring`
   Compare the posting to canonical skills, projects, and experience. Missing requirements become gaps, not invented claims.
   Available through `npm run career:fit-report`.

3. `resume_selection`
   Produce an ordered selection plan from existing content references. The worker can rank and exclude content, but it cannot create new facts.
   Available through `npm run career:selection-plan`.

4. `review_packet`
   Prepare a human-reviewable packet with the fit report, selected content, exclusions, and risk flags.
   Available through `npm run career:review-packet`.

5. `pdf_export`
   Generate a tailored PDF only after review approval.

6. `application_submission`
   Deferred. This remains blocked until a separate application submission governance slice exists.

## Agent Contract

Agents should call:

- `npm run career:status`
- `npm run career:profile`
- `npm run career:job-workflow`
- `npm run career:tailor-preview -- --job-text="..."`
- `npm run career:job-normalize -- --job-text="..."`
- `npm run career:fit-report -- --job-text="..."`
- `npm run career:selection-plan -- --job-text="..."`
- `npm run career:review-packet -- --job-text="..."`
- `npm run resume.format.validate-source`
- `npm run resume.format.claim-audit -- --targeted-packet-json='{"source_fact_ids":["identity.name"]}'`

All commands return JSON envelopes and are side-effect free. The review packet is a handoff artifact for humans and later export workers; it is not approval to generate a tailored PDF or submit an application.

Tailored packets must carry `source_fact_ids` from the ranked content returned by `tailor-preview`. Missing IDs, unknown IDs, or private IDs are claim-audit blockers.

## Future ExecPlan Sequence

The next implementation slices should be:

1. `future:resume-pdf-export-worker`
   Produce tailored PDFs from approved selection plans.

2. `future:application-submission-governance`
   Define policy before any application submission worker exists.

3. `future:resume-fit-scoring-v2`
   Replace simple keyword scoring with a richer scorer once the review-packet contract is stable.
