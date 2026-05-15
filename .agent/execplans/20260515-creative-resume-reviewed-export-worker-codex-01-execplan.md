---
id: "20260515-creative-resume-reviewed-export-worker-codex-01-execplan"
title: "Implement reviewed targeted export worker"
owner: "agent/codex-01"
created: "2026-05-15T00:00:00Z"
status: executing
base_branch: "initiative/resume-suite-maintenance"
changes:
  - ".agent/execplans/20260515-creative-resume-reviewed-export-worker-codex-01-execplan.md"
  - ".gitignore"
  - "artifacts/planner/research/remaining-work-graph.json"
  - "artifacts/resume/targeted-packets/.gitkeep"
  - "docs/career-content-authority.md"
  - "docs/queued-execplans.md"
  - "docs/resume-format-command-surface.md"
  - "docs/resume-job-application-workflow.md"
  - "docs/resume-job-targeting-command-surface.md"
  - "docs/resume-reviewed-export-worker.md"
  - "package.json"
  - "scripts/career-content-api.mjs"
  - "src/data/content-authority.json"
  - "src/data/job-application-workflow.json"
  - "src/data/resume-format.json"
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
    - name: "career-reviewed-export-approved"
      command: "npm run career:reviewed-export -- --job-text='Senior analytics engineer role requiring SQL, data modeling, BI, cloud orchestration, and stakeholder communication.' --company='Example Co' --title='Senior Analytics Engineer' --approved=true --approved-by='Justin Napolitano' --approval-note='CLI smoke test' --write=true --output=/tmp/creative-reviewed-export.json"
      expected_exit: 0
    - name: "career-reviewed-export-requires-approval"
      command: "npm run career:reviewed-export -- --job-text='Senior analytics engineer role requiring SQL.' --company='Example Co' --title='Senior Analytics Engineer' --output=/tmp/creative-reviewed-export-dry.json"
      expected_exit: 1
    - name: "format-validate-export-targeted"
      command: "npm run resume.format.validate-export -- --profile=targeted_job_application"
      expected_exit: 0
    - name: "career-status"
      command: "npm run career:status"
      expected_exit: 0
    - name: "remaining-work-graph-check"
      command: "PYTHONPATH=/Users/justin/repos/codex_platform/src /Users/justin/repos/codex_platform/bin/_platform-python -m platform_tools.remaining_work_graph_check --root /Users/justin/repos/creative-resume --branch impl-execplan/resume-reviewed-export-worker --execplan /Users/justin/repos/creative-resume/.agent/execplans/20260515-creative-resume-reviewed-export-worker-codex-01-execplan.md"
      expected_exit: 0
    - name: "policy-compliance-check"
      command: "bin/policy-compliance-check --execplan-path /Users/justin/repos/creative-resume/.agent/execplans/20260515-creative-resume-reviewed-export-worker-codex-01-execplan.md"
      expected_exit: 0
    - name: "policy-compliance-check-platform-module"
      command: "PYTHONPATH=/Users/justin/repos/codex_platform/src /Users/justin/repos/codex_platform/bin/_platform-python -m platform_tools.policy_compliance_check --root /Users/justin/repos/creative-resume --execplan-path /Users/justin/repos/creative-resume/.agent/execplans/20260515-creative-resume-reviewed-export-worker-codex-01-execplan.md"
      expected_exit: 0
    - name: "astro-check"
      command: "npm run check"
      expected_exit: 0
tasks:
  - title: "Add approval-gated reviewed export command"
    priority: "P1"
  - title: "Persist reviewed targeted packet artifacts outside tracked JSON"
    priority: "P1"
  - title: "Update workflow and format contracts for reviewed exports"
    priority: "P1"
  - title: "Document the write boundary before PDF generation"
    priority: "P1"
depends_on:
  - "20260515-creative-resume-job-targeting-selection-codex-01-execplan"
graph_registration:
  node_id: "rwg-006"
  goal_area: "product"
  queue_position: 5
  conflict_domains:
    - "career-content-api"
    - "resume-format"
    - "resume-job-targeting"
    - "reviewed-export"
  expected_artifacts:
    - ".agent/execplans/20260515-creative-resume-reviewed-export-worker-codex-01-execplan.md"
    - ".gitignore"
    - "artifacts/planner/research/remaining-work-graph.json"
    - "artifacts/resume/targeted-packets/.gitkeep"
    - "docs/career-content-authority.md"
    - "docs/queued-execplans.md"
    - "docs/resume-format-command-surface.md"
    - "docs/resume-job-application-workflow.md"
    - "docs/resume-job-targeting-command-surface.md"
    - "docs/resume-reviewed-export-worker.md"
    - "package.json"
    - "scripts/career-content-api.mjs"
    - "src/data/content-authority.json"
    - "src/data/job-application-workflow.json"
    - "src/data/resume-format.json"
  implementation_branch: "impl-execplan/resume-reviewed-export-worker"
  integration_mode: "via_initiative"
---

## Outcomes & Retrospective

This slice adds the first write-capable worker in the resume job-application workflow.

The expected outcome is an approval-gated command that writes a reviewed targeted application JSON artifact only after claim audit passes and a human approval is supplied.

## Context and Orientation

`career:review-packet` currently produces a source-backed handoff object, but it is still a read command. Future PDF generation should not consume raw job text. It should consume a reviewed export artifact that records approval and preserves the exact selection plan and source fact IDs.

## Plan of Work

1. Add `career:reviewed-export`.
2. Require `--approved=true` and `--approved-by`.
3. Re-run source fact audit before writing.
4. Write JSON artifacts to `artifacts/resume/targeted-packets/` while ignoring generated packet JSON in Git.
5. Keep PDF generation and application submission disabled.

## Validation and Acceptance

The slice is acceptable when:

- approved reviewed export writes a JSON artifact
- missing approval blocks export
- targeted application profile validates
- `career:status` includes the new command
- `remaining-work-graph-check` passes for `rwg-006`
- `npm run check` still passes

## Artifacts and Notes

This slice intentionally does not generate a tailored PDF. It creates the durable JSON artifact the later PDF worker should consume.
