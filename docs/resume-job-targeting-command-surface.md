# Resume Job Targeting Command Surface

This repo now exposes a side-effect-free JSON workflow for turning a job posting into a source-backed resume selection plan.

The workflow is intentionally conservative: it does not create new claims, generate a PDF, or submit an application. It only normalizes the posting, scores overlap against `src/data/resume.json`, selects existing source facts, and emits a human-review packet.

## Commands

```bash
npm run career:job-normalize -- --job-text="..." --company="..." --title="..."
npm run career:fit-report -- --job-text="..."
npm run career:selection-plan -- --job-text="..."
npm run career:review-packet -- --job-text="..."
```

Every command emits the standard envelope:

- `ok`
- `status`
- `repo_id`
- `command`
- `blockers`
- `warnings`
- `artifacts`
- `next_actions`

## Workflow

1. `job-normalize`
   Accepts `--job-text`, `--job-file`, or `--job-json` and returns a normalized posting with deterministic `source_id`, keywords, and detected requirement terms.

2. `fit-report`
   Scores the normalized posting against canonical summary, skill, experience, and project facts. Missing terms become explicit gaps.

3. `selection-plan`
   Produces a section-by-section plan for `targeted_job_application`. Every selected item carries `source_fact_ids`.

4. `review-packet`
   Runs the selection through the same source-fact boundary as `resume.format.claim-audit`, then returns risk flags and the review policy.

## Input Modes

Text input:

```bash
npm run career:review-packet -- --job-text="Senior analytics engineer role requiring SQL and BI"
```

Structured input:

```bash
npm run career:review-packet -- --job-json='{"company":"Example Co","title":"Analytics Engineer","source_url":"https://example.com/job","description_text":"SQL, BI, data modeling"}'
```

File input:

```bash
npm run career:review-packet -- --job-file=fixtures/job-posting.json
```

The structured fields are:

- `source_url`
- `source_id`
- `company`
- `title`
- `location`
- `employment_type`
- `description_text`
- `captured_at`

`description_text` is required. Missing source URL, company, title, or capture timestamp are warnings so a quick exploratory fit report can still run.

## Agent Boundary

Agents may call these commands to inspect fit and prepare a packet. They must not treat a packet as approved.

Allowed:

- compare a posting to canonical facts
- show evidence-backed matches and gaps
- select existing fact IDs
- prepare a review packet for a human

Blocked:

- inventing claims
- exporting private fields
- generating a tailored PDF without approval
- submitting applications

The next durable step is a reviewed export worker that consumes `review-packet` output after approval.
