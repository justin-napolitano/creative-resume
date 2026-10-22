# Brand governance prerequisites

Scope: install missing repo-local board-action and event schemas from the committed Codex Platform contract, then run the public deterministic branch/plan transition reconciler. No application, career fact, font, access-control, protected instruction, finalization or deployment changes.

Reason: registration already wrote rwg-006 and queue, then event logging failed because board-action-api.yaml and board-event-log.schema.yaml were absent. The public transition tool supports initiative_execplan_authorized from existing branch evidence, followed by implementation_branch_publish from the published remote ref. These are agent events, not a human finalization or approval signature.

Source snapshots: Codex Platform committed HEAD contract spec/board-action-api.yaml and spec/board-event-log.schema.yaml (original introduction4c0940a). No original platform worktree edits. Any prerequisite remains reviewable in a separate draft PR. Validation must run board-action-api-check, remaining-work-graph-check and policy-compliance-check using actual repo root and implementation plan. No status/ready field written manually. Roll back prerequisite commit to restore previous blocked metadata.
