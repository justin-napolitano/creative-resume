# resume.jnap.me — editorial dossier

Astro single-page resume that reframes the `resume-site/` content into an editorial dossier for creative firms. Typography leans on Fraunces + Space Grotesk, with a controlled grid and two intentional "weird" interruptions (rotated systems note + section code overlays) to nod to Wolff Olins' Lloyd's project without copying it.

## Stack
- [Astro 5](https://astro.build) static output (Vercel friendly)
- TypeScript + module aliasing for cleaner imports
- Playwright-powered PDF export to keep `/public/resume.pdf` synced with the live layout
- Single CSS system in `src/styles/global.css` with embedded print + motion rules
- Systems section has layout + view toggles (grid vs. column stack for highlights; accordion/table/badges/tabs/timeline for the catalog).

## Getting started
```bash
npm install        # or make install
npm run dev        # start Astro locally on http://localhost:4321
npm run build      # production build into ./dist
npm run preview    # serve the build (used for PDF export)
```

`make` wrappers are included for parity (`make dev`, `make build`, `make pdf`, etc.).

## Content + configuration
- All resume facts live in `src/data/resume.json` (copied directly from the provided `resume-site/`). Do not edit them inline in the markup.
- CTA + site metadata live in `src/config.ts`. Update `bookCallUrl` there if the scheduling link changes.
- The hero "Download PDF" button serves `public/resume.pdf`. Regenerate it whenever the site changes (see below) so Vercel ships the current print.

## Generating the PDF
```bash
make pdf
```
That command runs `npm run build`, launches `astro preview`, and uses Playwright to print the hosted page into `public/resume.pdf`. Commit the regenerated PDF alongside any layout/content change. If you haven’t installed the Playwright browsers yet, run `npx playwright install` once before `make pdf`.

## Deploying to Vercel
1. Push to GitHub and import the repo in Vercel.
2. Framework preset: **Astro**.
3. Build command: `npm run build`; Output directory: `dist`.
4. Ensure `public/resume.pdf` is committed so the CTA stays live.

## Typographic + layout system
- Fraunces headlines use optical-size variations layered over Space Grotesk body copy to echo editorial dossiers.
- 12-column-inspired grid with alternating spans for Experience vs. detail rails.
- Section codes offset in the margin and the rotated hero systems-note are the two intentional "weird" moves.
- Skill meters visualize years of experience (normalized across the full catalog) instead of raw numerals only.
- Print styles strip shadows/backgrounds, remove CTA buttons, reveal URLs, add a masthead, and include page numbers.

## Verification checklist
- ✅ Book-a-call CTA hits `https://cal.com/justin-napolitano-gvu3p3/intro`.
- ✅ Download PDF points to `/resume.pdf` (regenerate via `make pdf`).
- ✅ Experience, projects, skills, education, and publication match `resume-site/` content.
- ✅ Layout responds across mobile/desktop + print.
