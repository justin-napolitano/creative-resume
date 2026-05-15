---
id: "20260515-creative-resume-job-targeting-selection-codex-01-execplan"
title: "Implement source-backed job targeting commands"
owner: "agent/codex-01"
created: "2026-05-15T00:00:00Z"
status: executing
base_branch: "initiative/resume-suite-maintenance"
changes:
  - ".agent/execplans/20260515-creative-resume-job-targeting-selection-codex-01-execplan.md"
  - "artifacts/planner/research/remaining-work-graph.json"
  - "docs/career-content-authority.md"
  - "docs/queued-execplans.md"
  - "docs/resume-job-application-workflow.md"
  - "docs/resume-job-targeting-command-surface.md"
  - "package.json"
  - "scripts/career-content-api.mjs"
  - "src/data/content-authority.json"
  - "src/data/job-application-workflow.json"
approve_policy: codeowners
reviewers:
  - "github:justin-napolitano"
finalized_by: ""
finalized_at: ""
finalized_in_pr: ""
initiative_branch: "initiative/resume-suite-maintenance"
initiative_node_id: "initiative-resume-suite-maintenance"
validation:
  tests:
    - name: "career-job-normalize"
      command: "npm run career:job-normalize -- --job-text='Senior analytics engineer role requiring SQL, data modeling, BI, cloud orchestration, and stakeholder communication.' --company='Example Co' --title='Senior Analytics Engineer'"
      expected_exit: 0
    - name: "career-fit-report"
      command: "npm run career:fit-report -- --job-text='Senior analytics engineer role requiring SQL, data modeling, BI, cloud orchestration, and stakeholder communication.' --company='Example Co' --title='Senior Analytics Engineer'"
      expected_exit: 0
    - name: "career-selection-plan"
      command: "npm run career:selection-plan -- --job-text='Senior analytics engineer role requiring SQL, data modeling, BI, cloud orchestration, and stakeholder communication.' --company='Example Co' --title='Senior Analytics Engineer'"
      expected_exit: 0
    - name: "career-review-packet"
      command: "npm run career:review-packet -- --job-text='Senior analytics engineer role requiring SQL, data modeling, BI, cloud orchestration, and stakeholder communication.' --company='Example Co' --title='Senior Analytics Engineer'"
      expected_exit: 0
    - name: "format-claim-audit"
      command: "npm run resume.format.claim-audit -- --targeted-packet-json='{\"source_fact_ids\":[\"identity.name\",\"skill.data-science-platforms.sql\"]}'"
      expected_exit: 0
    - name: "career-status"
      command: "npm run career:status"
      expected_exit: 0
    - name: "remaining-work-graph-check"
      command: "PYTHONPATH=/Users/justin/repos/codex_platform/src /Users/justin/repos/codex_platform/bin/_platform-python -m platform_tools.remaining_work_graph_check --root /Users/justin/repos/creative-resume --branch impl-execplan/resume-job-targeting-selection-plan --execplan /Users/justin/repos/creative-resume/.agent/execplans/20260515-creative-resume-job-targeting-selection-codex-01-execplan.md"
      expected_exit: 0
    - name: "policy-compliance-check"
      command: "bin/policy-compliance-check --execplan-path /Users/justin/repos/creative-resume/.agent/execplans/20260515-creative-resume-job-targeting-selection-codex-01-execplan.md"
      expected_exit: 0
    - name: "policy-compliance-check-platform-module"
      command: "PYTHONPATH=/Users/justin/repos/codex_platform/src /Users/justin/repos/codex_platform/bin/_platform-python -m platform_tools.policy_compliance_check --root /Users/justin/repos/creative-resume --execplan-path /Users/justin/repos/creative-resume/.agent/execplans/20260515-creative-resume-job-targeting-selection-codex-01-execplan.md"
      expected_exit: 0
    - name: "astro-check"
      command: "npm run check"
      expected_exit: 0
tasks:
  - title: "Normalize job posting inputs into deterministic JSON"
    priority: "P1"
  - title: "Emit explainable fit reports from canonical resume facts"
    priority: "P1"
  - title: "Create source-backed resume selection plans"
    priority: "P1"
  - title: "Bundle review packets with claim-audit state and risk flags"
    priority: "P1"
depends_on:
  - "20260514-creative-resume-content-authority-format-implementation-codex-01-execplan"
graph_registration:
  node_id: "rwg-005"
  goal_area: "product"
  queue_position: 4
  conflict_domains:
    - "career-content-api"
    - "resume-job-targeting"
    - "resume-format"
  expected_artifacts:
    - ".agent/execplans/20260515-creative-resume-job-targeting-selection-codex-01-execplan.md"
    - "artifacts/planner/research/remaining-work-graph.json"
    - "docs/career-content-authority.md"
    - "docs/queued-execplans.md"
    - "docs/resume-job-application-workflow.md"
    - "docs/resume-job-targeting-command-surface.md"
    - "package.json"
    - "scripts/career-content-api.mjs"
    - "src/data/content-authority.json"
    - "src/data/job-application-workflow.json"
  implementation_branch: "impl-execplan/resume-job-targeting-selection-plan"
  integration_mode: "via_initiative"
---

## Outcomes & Retrospective

This slice turns the planned job-application workflow into a usable repo-local command surface.

The expected outcome is a target repo that can accept a job posting, produce a structured fit report, create a resume selection plan from existing facts only, and hand a review packet to a human or later export worker.

## Context and Orientation

`src/data/resume.json` remains the canonical content authority. This slice does not add a database, external API, PDF renderer, or submission worker. It adds deterministic JSON commands that the Codex Platform can call through orchestration contracts or later MCP wrappers.

## Plan of Work

1. Add commands for job normalization, fit reports, selection plans, and review packets.
2. Keep all new commands side-effect free.
3. Preserve `source_fact_ids` across ranked content, selection plans, and review packets.
4. Update the machine-readable workflow and authority manifests.
5. Register `rwg-005` in the remaining-work graph and queue mirror.

## Validation and Acceptance

The slice is acceptable when:

- `npm run career:job-normalize` returns normalized job JSON
- `npm run career:fit-report` returns a score, matched requirements, gaps, and evidence refs
- `npm run career:selection-plan` returns selected sections with source fact IDs
- `npm run career:review-packet` returns claim-audit state and risk flags
- `npm run resume.format.claim-audit` accepts selected public fact IDs
- `remaining-work-graph-check` passes for `rwg-005`
- `npm run check` still passes

## Artifacts and Notes

This slice intentionally leaves PDF export and application submission deferred. The next worker should consume an approved review packet rather than reading job text directly.
