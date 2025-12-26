# Codex Context: resume.jnap.me (NEW SITE) — editorial dossier resume for creative firms (Astro + Vercel)

You are ChatGPT Codex running in a fresh, empty directory.

## 0) Non-negotiables
- This repo deploys to **Vercel** and serves **resume.jnap.me**.
- This repo is ONLY resume.jnap.me. Do NOT create or include:
  - hire.jnap.me (separate one-page router/landing)
  - cv.jnap.me (separate conservative/corporate CV site)
- Build a brand-new site here. You are not editing an existing site in place.

## 1) Reference directory (required)
A separate folder exists in the workspace: `resume-site/`.

You MUST inspect `resume-site/` thoroughly and reuse it for:
- the actual resume content (facts, roles, bullets, dates, links)
- overall section inventory (what sections exist)
- any existing PDF export (if present)
- current CSS class naming (useful for mapping elements)

But: you are building a **new** site in this empty directory with your own structure and styling.

Content rule: do NOT fabricate experience, employers, achievements, titles, degrees, or dates.

## 2) Design anchor + citations (principles, not imitation)
This site should read like an *editorial dossier*—tight, typographic, authored, intentional, with moments of “designed weirdness.”

Primary reference: Wolff Olins’ Lloyd’s work and its underlying system thinking:
- Wolff Olins Lloyd’s project page: https://wolffolins.com/work/lloyds
- Creative Review coverage of the refreshed identity system (type + system + app usage): https://www.creativereview.co.uk/lloyds-design-branding-campaign/
- Transform Magazine coverage mentioning motion system + customized GT Ultra: https://www.transformmagazine.net/articles/2025/the-verdict-wolff-olins-reimagines-lloyds/
- Grilli Type note about customized GT Ultra for Lloyds Bank: https://www.grillitype.com/blog/in-use/lloyds-bank

You are NOT copying Lloyd’s assets. You are translating principles:
- system clarity + hierarchy
- rhythm + negative space
- intentional tension/imbalance that still feels controlled
- typography as the primary interface
- “weirdness” as a deliberate business/design tool (but keep it readable)

## 3) Framework + deployment (Astro on Vercel)
Use **Astro**. Deploy to Vercel.
- Astro’s official Vercel deploy guide: https://docs.astro.build/en/guides/deploy/vercel/
- Astro Vercel integration guide (@astrojs/vercel): https://docs.astro.build/en/guides/integrations-guide/vercel/
- Vercel Astro framework docs: https://vercel.com/docs/frameworks/frontend/astro

Prefer static output unless there is a real reason for SSR.
Keep tooling minimal and documented.

## 4) Experience goal (what the site should *signal*)
This is NOT ATS. It is a calling card for design/media/architecture/advertising firms.
It should signal:
- taste + design literacy (typographic authority, restraint, editorial pacing)
- systems thinking + technical fluency
- comfort in creative culture
- willingness to be “weird,” but never sloppy

## 5) Primary user actions (IMPORTANT)
Primary CTAs (top of page, obvious, not hidden):
1) **Book a call** (external scheduling link)
2) **Download PDF** (local file served from /public)

Email + LinkedIn are not primary. They can exist but should be visually subordinate (e.g., in a quiet utility rail or footer).

Implementation requirement:
- Make call booking URL configurable in one place (e.g., `src/config.ts`).
- If a scheduling URL isn’t available in resume-site, use a placeholder string and clearly mark it in README.

## 6) IA + layout (editorial dossier)
Single page is OK (preferred), but structure it like a dossier:
- Hero:
  - Name
  - One-line role thesis (authored, confident)
  - Two primary CTAs: Book a call / Download PDF
- Dossier sections (order can be tuned):
  - Experience (dominant section; excellent scanability)
  - Selected work / highlights (only if present in resume-site content; otherwise omit)
  - Skills (systematic; avoid gimmicky “5/5 dots” unless it feels editorial)
  - Education / certifications (if present)
  - Tools / platforms (if present)
- Footer: small, quiet contact + location + utility links

## 7) Visual system rules (make it feel designed, not “template”)
Typography:
- Use typography to do the heavy lifting.
- Choose either:
  A) One excellent variable sans with expressive sizing, OR
  B) Serif for headlines + neutral sans for body (editorial feel).
- Keep line length controlled; rhythm is king.
- Use letter-spacing sparingly and intentionally.

Layout + weirdness:
- Use a grid and a spacing system.
- Add 1–2 deliberate “interruptions”:
  - an off-grid pull quote / margin note
  - a big typographic axis shift
  - a surprising section label treatment
But the content must remain readable and scannable.

Color:
- Mostly neutrals + one accent max.
- Avoid glassmorphism / heavy gradients / “SaaS” aesthetic.

Motion:
- Optional, but “yeah be weird.”
- If used, keep it editorial: subtle hover/scroll behavior, no distracting animations.
- Honor `prefers-reduced-motion`.

## 8) Accessibility + craft
- Semantic HTML; correct heading order.
- Keyboard navigation; visible focus states.
- Contrast-safe.
- Fast load.

## 9) Print + PDF
Two requirements:
A) Print stylesheet (`@media print`) that is clean and professional:
   - remove background effects/shadows
   - ensure typography prints well
   - ensure page breaks don’t ruin sections

B) PDF download:
- If resume-site already has a PDF, copy it into this repo’s `public/` and link it.
- If not, generate a PDF export from the new layout OR create a minimal PDF that matches the dossier typographic system (document what you did).

## 10) Deliverables (files)
Create:
- `astro.config.mjs`
- `package.json`
- `src/pages/index.astro`
- `src/styles/global.css` (or similar)
- `src/config.ts` (CTA URLs, PDF filename, etc.)
- `public/` assets (including the PDF)
- `README.md` with:
  - local dev instructions
  - how to deploy on Vercel
  - where to set scheduling URL
  - a short explanation of the typographic + layout system (and the 1–2 “weird” decisions)

## 11) Process you must follow
1) Inspect `resume-site/` fully and summarize:
   - what sections exist
   - what content you’re carrying over
   - what links/assets exist (especially any existing PDF)
2) Propose a concrete layout plan (brief):
   - typographic scale
   - grid + spacing rhythm
   - what the “weird” moments are
3) Implement.
4) Verify:
   - mobile + desktop
   - print output
   - PDF download works
   - Book-a-call CTA works (placeholder OK if necessary)
   - no missing content vs reference

