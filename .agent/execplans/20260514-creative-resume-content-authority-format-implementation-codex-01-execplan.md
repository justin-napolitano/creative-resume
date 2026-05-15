---
id: "20260514-creative-resume-content-authority-format-implementation-codex-01-execplan"
title: "Implement resume format command surface"
owner: "agent/codex-01"
created: "2026-05-14T00:00:00Z"
status: executing
base_branch: "initiative/resume-suite-maintenance"
changes:
  - ".agent/execplans/20260514-creative-resume-content-authority-format-implementation-codex-01-execplan.md"
  - "artifacts/planner/research/remaining-work-graph.json"
  - "docs/career-content-authority.md"
  - "docs/queued-execplans.md"
  - "docs/resume-format-command-surface.md"
  - "docs/resume-job-application-workflow.md"
  - "package.json"
  - "scripts/career-content-api.mjs"
  - "src/data/content-authority.json"
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
    - name: "career-status"
      command: "npm run career:status"
      expected_exit: 0
    - name: "format-status"
      command: "npm run resume.format.status"
      expected_exit: 0
    - name: "format-validate-source"
      command: "npm run resume.format.validate-source"
      expected_exit: 0
    - name: "format-validate-export-web"
      command: "npm run resume.format.validate-export -- --profile=web_resume"
      expected_exit: 0
    - name: "format-claim-audit"
      command: "npm run resume.format.claim-audit -- --targeted-packet-json='{\"source_fact_ids\":[\"identity.name\",\"skill.data-science-platforms.sql\"]}'"
      expected_exit: 0
    - name: "career-tailor-preview"
      command: "npm run career:tailor-preview -- --job-text='Senior analytics engineer role requiring SQL, data modeling, BI, cloud orchestration, and stakeholder communication.'"
      expected_exit: 0
    - name: "remaining-work-graph-check"
      command: "PYTHONPATH=/Users/justin/repos/codex_platform/src /Users/justin/repos/codex_platform/bin/_platform-python -m platform_tools.remaining_work_graph_check --root /Users/justin/repos/creative-resume --branch impl-execplan/jnap-resume-content-authority-format-implementation --execplan /Users/justin/repos/creative-resume/.agent/execplans/20260514-creative-resume-content-authority-format-implementation-codex-01-execplan.md"
      expected_exit: 0
    - name: "policy-compliance-check"
      command: "bin/policy-compliance-check --execplan-path .agent/execplans/20260514-creative-resume-content-authority-format-implementation-codex-01-execplan.md"
      expected_exit: 0
    - name: "policy-compliance-check-platform-module"
      command: "PYTHONPATH=/Users/justin/repos/codex_platform/src /Users/justin/repos/codex_platform/bin/_platform-python -m platform_tools.policy_compliance_check --root /Users/justin/repos/creative-resume --execplan-path /Users/justin/repos/creative-resume/.agent/execplans/20260514-creative-resume-content-authority-format-implementation-codex-01-execplan.md"
      expected_exit: 0
    - name: "astro-check"
      command: "npm run check"
      expected_exit: 0
tasks:
  - title: "Add target-local resume format profile contract"
    priority: "P1"
  - title: "Expose platform-compatible format commands"
    priority: "P1"
  - title: "Add source fact IDs to tailored previews and claim audit"
    priority: "P1"
  - title: "Document target-side format command surface"
    priority: "P1"
depends_on:
  - "20260505-creative-resume-resume-job-application-workflow-codex-01-execplan"
graph_registration:
  node_id: "rwg-004"
  goal_area: "product"
  queue_position: 3
  conflict_domains:
    - "career-content-api"
    - "resume-format"
    - "resume-job-targeting"
  expected_artifacts:
    - ".agent/execplans/20260514-creative-resume-content-authority-format-implementation-codex-01-execplan.md"
    - "artifacts/planner/research/remaining-work-graph.json"
    - "docs/career-content-authority.md"
    - "docs/queued-execplans.md"
    - "docs/resume-format-command-surface.md"
    - "docs/resume-job-application-workflow.md"
    - "package.json"
    - "scripts/career-content-api.mjs"
    - "src/data/content-authority.json"
    - "src/data/resume-format.json"
  implementation_branch: "impl-execplan/jnap-resume-content-authority-format-implementation"
  integration_mode: "via_initiative"
---

## Outcomes & Retrospective

This slice implements the target-side command surface expected by the platform resume-format contract.

The expected outcome is a resume repo that can report format readiness, validate canonical source facts, validate named output profiles, and audit targeted job-application packets against stable `source_fact_id` values.

## Context and Orientation

The platform owns the reusable resume-format contract. This repo owns resume content, generated artifacts, and target-local validation commands. The current resume source is still `src/data/resume.json`; this slice adds `src/data/resume-format.json` as the local projection of output profile rules.

## Plan of Work

1. Add target-local format profile data for ATS PDF, human PDF, web resume, targeted packet JSON, and planned ATS DOCX.
2. Extend `scripts/career-content-api.mjs` with `resume.format.*` aliases.
3. Build stable source fact IDs from the existing resume JSON.
4. Add claim-audit behavior for targeted packets.
5. Document the command surface and update the target graph/queue.

## Validation and Acceptance

The slice is acceptable when:

- `npm run resume.format.status` reports the profile inventory
- `npm run resume.format.validate-source` reports a valid source fact index
- `npm run resume.format.validate-export -- --profile=web_resume` validates the public site profile
- `npm run resume.format.claim-audit` rejects unknown/private claims and accepts source-backed fact IDs
- `npm run career:tailor-preview` includes source fact IDs
- `remaining-work-graph-check` passes for `rwg-004`
- `npm run check` still passes

## Artifacts and Notes

This slice does not implement DOCX generation or automatic application submission. `ats_docx` is listed as a planned profile so agents can reason about it without assuming it is currently exportable.
