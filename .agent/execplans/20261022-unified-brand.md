---
id: "20261022-unified-brand"
title: "Apply approved Index Simplified resume presentation"
owner: "agent/codex"
created: "2026-10-22T00:00:00Z"
status: draft
base_branch: "initiative/resume-suite-maintenance"
changes:
  - "scripts/export-pdf.mjs"
  - "public/resume.pdf"
  - "package.json"
  - "README.md"
  - "docs/pdf-export-evidence.md"
  - "src/styles/global.css"
  - "src/pages/index.astro"
  - "docs/branding-2026-10-22.md"
  - "design-qa.md"
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
    - name: "policy-compliance-check"
      command: "bin/policy-compliance-check --execplan-path /Users/justin/repos/brand-review/swarm/creative-resume/.agent/execplans/20261022-unified-brand.md"
      expected_exit: 0
    - name: "astro-check"
      command: "npm run check"
      expected_exit: 0
    - name: "production-build"
      command: "npm run build"
      expected_exit: 0
tasks:
  - title: "Apply approved restrained tokens and responsive layout"
    priority: "P1"
depends_on: []
graph_registration:
  node_id: "rwg-006"
  goal_area: "product"
  queue_position: 5
  conflict_domains:
    - "resume-presentation"
  expected_artifacts:
    - "src/styles/global.css"
    - "src/pages/index.astro"
    - "docs/branding-2026-10-22.md"
    - "design-qa.md"
  implementation_branch: "impl-execplan/unified-brand-2026-10-22"
  integration_mode: "via_initiative"
---

## Outcomes & Retrospective

Apply issue #32 and the pinned littlelink brand contract ae3e9062d8e06a1158af74a29cbd8b549d82b3e2. User authorized implementation and deployment; finalization fields remain empty until actual review. No career fact changes.

## Context and Orientation

src/data/resume.json remains canonical. Legacy PDF pit/resume.pdf differs from canonical facts; never copy it over JSON. Preserve export URLs and interactions. Shared reference: /Users/justin/repos/brand-review/2026-10-22/08-index-simplified-no-marks.png.

## Plan of Work

1. Register scope and preserve data, routes, analytics consent, skill controls and public/private boundaries.
2. Apply text-only masthead, compact serif name, warm paper, neutral rules, no decorative imagery or title symbols.
3. Run existing source/export, Astro check and build. Review screenshot and print when authorized browser available.
4. Open draft implementation PR against initiative; report blocked QA honestly. Do not mark plan finalized or merge with pending gates.

## Validation and Acceptance

Run npm run check, npm run build, npm run resume.format.validate-source and npm run resume.format.validate-export -- --profile=web_resume. Browser QA must cover 320/390/768/1440 widths, keyboard, zoom and existing skill controls before release.

## Recovery

Revert focused presentation commit; no migration, runtime service, dependency, credential or integration change.

## Artifacts and Notes

Plan registration wrote rwg-006 and queue, then failed board_action_api_invalid in event logging; pending coordinator reconciliation. Browser QA unavailable until authorized browser fallback. No finalization asserted.

## Canonical export follow-up

User approved Chromium fallback. Re-export public/resume.pdf from actual built DOM/JSON, preserve private phone flags, use print-only static font fallback and stable linear skill text for selectable PDF output. Default npm pdf now builds and exports local public source instead of fetching conflicting pit facts. Validate all experience bullets and public/private contacts, native page rendering, responsive/key/zoom/theme/consent behavior. No career-source edits or human finalization asserted.
