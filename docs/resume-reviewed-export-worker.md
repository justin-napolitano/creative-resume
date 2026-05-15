# Resume Reviewed Export Worker

This worker is the first approval-gated write surface in the resume automation flow.

It writes a targeted application JSON artifact only when the packet is source-backed and a human approval is present. It does not generate a PDF and it does not submit an application.

## Command

```bash
npm run career:reviewed-export -- --review-packet=packet.json --approved=true --approved-by="Justin Napolitano" --write=true
```

The command also accepts `--review-packet-json`. For fast local smoke tests it can generate the review packet from job input:

```bash
npm run career:reviewed-export -- --job-text="SQL and BI role" --approved=true --approved-by="Justin Napolitano" --write=true
```

## Approval Gate

Required fields:

- `--approved=true`
- `--approved-by="..."`

Optional fields:

- `--approved-at="2026-05-15T00:00:00Z"`
- `--approval-note="..."`
- `--generated-at="2026-05-15T00:00:00Z"`
- `--output=/tmp/reviewed-export.json`

Without `--write=true`, the command returns a dry-run artifact in the JSON response and writes nothing.

## Output

The default output directory is:

```text
artifacts/resume/targeted-packets/
```

Generated packet JSON files in that directory are ignored by Git. The committed `.gitkeep` file only preserves the directory and allows `resume.format.validate-export -- --profile=targeted_job_application` to validate the profile surface.

The artifact includes:

- normalized job data
- fit report
- selection plan
- claim audit
- approval metadata
- export policy stating that PDF generation and application submission are still disabled

## Blockers

The command blocks when:

- no review packet or job input is provided
- approval is missing
- selected fact IDs are unknown or private
- the review packet claim state is not `source_backed`
- the packet enables application submission

Future PDF workers should consume this reviewed JSON artifact, not raw job text.
