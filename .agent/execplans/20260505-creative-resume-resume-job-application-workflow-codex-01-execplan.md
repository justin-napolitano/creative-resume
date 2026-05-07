---
id: "20260505-creative-resume-resume-job-application-workflow-codex-01-execplan"
title: "Plan resume update flow for job-application targeting"
owner: "agent/codex-01"
created: "2026-05-07T00:00:00Z"
status: executing
base_branch: "initiative/resume-suite-maintenance"
changes:
  - .agent/execplans/20260505-creative-resume-resume-job-application-workflow-codex-01-execplan.md
  - artifacts/planner/research/remaining-work-graph.json
  - docs/queued-execplans.md
  - docs/resume-job-application-workflow.md
  - package.json
  - scripts/career-content-api.mjs
  - src/data/content-authority.json
  - src/data/job-application-workflow.json
approve_policy: codeowners
reviewers:
  - "github:justin-napolitano"
initiative_branch: "initiative/resume-suite-maintenance"
initiative_node_id: "initiative-resume-suite-maintenance"
validation:
  tests:
    - name: "career-status"
      command: "npm run career:status"
      expected_exit: 0
    - name: "career-job-workflow"
      command: "npm run career:job-workflow"
      expected_exit: 0
    - name: "career-tailor-preview"
      command: "npm run career:tailor-preview -- --job-text='Senior analytics engineer role requiring SQL, data modeling, BI, cloud orchestration, and stakeholder communication.'"
      expected_exit: 0
    - name: "remaining-work-graph-check"
      command: "/Users/justin/repos/codex_platform/bin/remaining-work-graph-check --root /Users/justin/repos/creative-resume --branch impl-execplan/20260505-creative-resume-resume-job-application-workflow-codex-01-execplan-codex-01-20260505 --execplan /Users/justin/repos/creative-resume/.agent/execplans/20260505-creative-resume-resume-job-application-workflow-codex-01-execplan.md"
      expected_exit: 0
    - name: "astro-check"
      command: "npm run check"
      expected_exit: 0
tasks:
  - title: "Add machine-readable job application workflow contract"
    priority: "P1"
  - title: "Expose a repo-local JSON command for agents to discover the workflow"
    priority: "P1"
  - title: "Document workflow nodes, approval gates, and future ExecPlan sequence"
    priority: "P1"
  - title: "Keep application submission explicitly deferred"
    priority: "P1"
depends_on:
  - "20260505-creative-resume-resume-data-contract-codex-01-execplan"
graph_registration:
  node_id: "rwg-003"
  goal_area: "product"
  implementation_branch: "impl-execplan/20260505-creative-resume-resume-job-application-workflow-codex-01-execplan-codex-01-20260505"
  integration_mode: "via_initiative"
---

## Outcomes & Retrospective

This slice defines the first job-application targeting workflow for the resume repo.

The expected outcome is a machine-readable workflow contract and a stable JSON command that agents can call before attempting any resume tailoring or future application work.

## Context and Orientation

The previous slice made `src/data/resume.json` the first central career content authority and added a side-effect-free JSON command surface. This slice sits one level above that: it describes how a job posting becomes a fit report, resume selection plan, review packet, and eventually a reviewed PDF.

Application submission is intentionally out of scope.

## Plan of Work

1. Add `src/data/job-application-workflow.json` with workflow stages, inputs, outputs, risk flags, and future API routes.
2. Add `job-workflow` to `scripts/career-content-api.mjs` and `package.json`.
3. Document the workflow nodes and future ExecPlan sequence.
4. Promote `rwg-003` to ready on this implementation branch.

## Validation and Acceptance

The slice is acceptable when:

- `npm run career:status` includes the job workflow summary
- `npm run career:job-workflow` emits the machine-readable workflow contract
- `npm run career:tailor-preview` still ranks existing facts only
- `remaining-work-graph-check` passes for this branch and ExecPlan
- `npm run check` still passes

## Artifacts and Notes

The workflow intentionally has no write commands. Future write commands must land behind explicit review gates and artifact paths.
