---
id: "20260505-creative-resume-resume-data-contract-codex-01-execplan"
title: "Define resume data authority, export checks, and publish workflow"
owner: "agent/codex-01"
created: "2026-05-07T00:00:00Z"
status: executing
base_branch: "initiative/resume-suite-maintenance"
changes:
  - .agent/execplans/20260505-creative-resume-resume-data-contract-codex-01-execplan.md
  - artifacts/planner/research/remaining-work-graph.json
  - docs/career-content-authority.md
  - docs/queued-execplans.md
  - package.json
  - scripts/career-content-api.mjs
  - src/data/content-authority.json
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
    - name: "career-profile"
      command: "npm run career:profile"
      expected_exit: 0
    - name: "career-sync-preview"
      command: "npm run career:sync-preview -- --target=all"
      expected_exit: 0
    - name: "career-tailor-preview"
      command: "npm run career:tailor-preview -- --job-text='Senior analytics engineer role requiring SQL, data modeling, BI, cloud orchestration, and stakeholder communication.'"
      expected_exit: 0
    - name: "astro-check"
      command: "npm run check"
      expected_exit: 0
tasks:
  - title: "Mark src/data/resume.json as the first canonical career content store"
    priority: "P1"
  - title: "Add a machine-readable content authority manifest"
    priority: "P1"
  - title: "Expose repo-local JSON commands for content status, profile, sync preview, and tailored resume preview"
    priority: "P1"
  - title: "Document the export and publish workflow boundary"
    priority: "P1"
depends_on:
  - "20260505-creative-resume-bootstrap-governed-project-codex-01-execplan"
graph_registration:
  node_id: "rwg-002"
  goal_area: "product"
  implementation_branch: "impl-execplan/20260505-creative-resume-resume-data-contract-codex-01-execplan-codex-01-20260505"
  integration_mode: "via_initiative"
---

## Outcomes & Retrospective

This slice makes the existing resume data usable as the first career-suite content authority.

The expected outcome is a repo-local JSON command surface that Codex Platform and future MCP tools can call before making product edits. The command surface should report content health, expose public profile data, preview downstream sync payloads, and draft a relevance plan for short PDF resumes.

## Context and Orientation

The platform-side career-suite contract says `/Users/justin/repos/creative-resume` owns canonical career content, PDF generation, and resume/CV implementation details. This repo already has `src/data/resume.json`; this slice formalizes that file as the first source of truth and adds a thin API-compatible command surface around it.

This slice does not automate application submission and does not move content into a platform database.

## Plan of Work

1. Add `src/data/content-authority.json` to define the canonical source, public/private field rules, sync targets, and API commands.
2. Add `scripts/career-content-api.mjs` with JSON commands for `status`, `profile`, `sync-preview`, and `tailor-preview`.
3. Add package scripts that provide stable shell entry points.
4. Document the content authority and publish workflow.
5. Mark the target graph node and queue mirror as ready for this implementation branch.

## Validation and Acceptance

The slice is acceptable when:

- `npm run career:status` emits an `ok` JSON envelope
- `npm run career:profile` emits public profile data from `src/data/resume.json`
- `npm run career:sync-preview -- --target=all` emits deterministic target projections
- `npm run career:tailor-preview` ranks existing content without inventing facts
- `npm run check` still passes

## Artifacts and Notes

The command output is intentionally shaped like an API response: `ok`, `status`, `repo_id`, `command`, `blockers`, `artifacts`, and `next_actions` are always present.
