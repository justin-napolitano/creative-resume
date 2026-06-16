# Resume Critical Review

Date: 2026-05-13

This note preserves the blunt critique from the current resume pass so it can be reviewed later before more design or content changes are made.

## Current Read

The resume has strong raw material, but it currently reads like three resumes competing for attention:

- healthcare analytics and data engineering
- media and audience analytics
- founder / small-business automation work

The strongest center is not "AI power user" or "creative technical strategist." It is:

> Analytics engineer who builds operational data pipelines and decision surfaces for healthcare and media teams.

That is specific, credible, and easier for both recruiters and AI screening systems to understand.

## Biggest Problem

The top-line positioning feels too clever. It is trying to sound differentiated before it has made the basic value proposition clear. That creates a gimmicky read, especially around phrases like "decision kits" and broad claims that sound generated.

A stronger direction:

> Analytics engineer building healthcare and media data pipelines that turn messy operational data into dashboards, briefings, and automation leaders can use.

The wording can still improve, but the principle is right: concrete audience, concrete systems, concrete output.

## Highest Risk Areas

- The founder section still risks sounding larger than the actual work. Based on the real context, it should be framed as a small company used to build paid automation projects for a few clients.
- Some skills feel padded or overly abstract. Labels like `Agentic Models`, `LLM Ops 5 yrs`, `Nursing data`, `Performance`, and `Publication` need either stronger proof or removal.
- The healthcare bullets are the strongest evidence on the page. Epic Clarity, Vizient, EDW, Power BI, Synapse, readmissions, heart failure, CFO / CMO reporting, and service-line analytics should carry more of the resume.
- Numeric claims need a defensibility pass. Claims like `$5M platform investment decisions`, `2M+ prospects`, and `10% of 5,000 cold leads` should be sourced, softened, or removed.
- The resume should stop trying to be stylish in the body copy. Style belongs in layout and hierarchy. The words should be direct.

## Recommended Content Moves

1. Tighten the hero into a plain role thesis.
2. Keep `Analytics Engineer` as the public title.
3. Rewrite the founder role as `Founder, Data Automation`.
4. Rebuild the founder bullets around Python jobs, API calls, campaign extraction, email workflow automation, and CRM / spreadsheet cleanup.
5. Prune skill badges down to skills that can be defended in an interview.
6. Make healthcare analytics the spine of the resume, with media analytics as a credible second domain.
7. Keep the mapping/contracts intact, but hide or demote any copy that reads like brand filler.

## Founder Section Direction

Use language closer to:

- Built Python and API automations for small business clients, including campaign data extraction, email workflow automation, and recurring reporting jobs.
- Connected CRM, email, and spreadsheet data sources to reduce manual list-building and follow-up work.
- Used the company as a working lab to learn production Python, API integrations, and data pipeline design through paid client projects.

This is honest, credible, and still valuable. It does not need to pretend to be a large consulting practice.

## Working Standard

Every visible claim should pass four tests:

- Can I explain exactly what I did?
- Can I name the system, dataset, team, or stakeholder involved?
- Can I defend the impact number or scope?
- Would a recruiter understand the claim in under five seconds?

If the answer is no, the line should be rewritten, moved to private notes, or removed from the public resume.

## Files To Review

- `src/data/resume.json`
- `src/data/copy.json`
- `src/data/content-authority.json`
- `src/pages/index.astro`
- `src/styles/global.css`
