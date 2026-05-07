# Queued ExecPlans

Canonical source: `artifacts/planner/research/remaining-work-graph.json`

## Active Initiative

- `initiative-resume-suite-maintenance`
  - branch: `initiative/resume-suite-maintenance`
  - status: `decision_gated`
  - note: initiative container; execution occurs through child ExecPlan slices

## Queue

1. `20260505-creative-resume-resume-data-contract-codex-01-execplan`
   - status: `completed`
   - node: `rwg-002`
   - goal: define resume data authority, export checks, and publish workflow
   - implementation branch: `impl-execplan/20260505-creative-resume-resume-data-contract-codex-01-execplan-codex-01-20260505`
   - completion ref: `merged:pr-23`

2. `20260505-creative-resume-resume-job-application-workflow-codex-01-execplan`
   - status: `ready`
   - node: `rwg-003`
   - goal: plan resume update flow for job-application targeting
   - implementation branch: `impl-execplan/20260505-creative-resume-resume-job-application-workflow-codex-01-execplan-codex-01-20260505`

## Mirror Metadata

- canonical_last_graph_action_id: `rwg-action-20260507-002-promote_ready-rwg-003`
- canonical_ready_order: `20260505-creative-resume-resume-job-application-workflow-codex-01-execplan`
- projection_authority: `projection_only`

## Queue Discipline

Queued ExecPlans are not active merely because they are listed here. They become active only when:

- a branch is created for the slice
- the ExecPlan exists and validates
- all blocking dependencies are satisfied
- the slice is not held by review or decision gates

Implementation execution should occur on a dedicated `impl-execplan/*` branch and merge back into `initiative/resume-suite-maintenance`.

## Relationship to the Graph

This queue is a human-readable mirror of `artifacts/planner/research/remaining-work-graph.json` and `remaining-work-graph-check`. If the two disagree, the canonical artifact and validator are authoritative.
