# AI-Era Resume Research Brief

Date: 2026-05-13

This brief summarizes what makes a strong resume when recruiters, applicant tracking systems, and AI-assisted hiring workflows are all part of the market. The goal is not to trick AI. The goal is to make true career evidence easier for machines and humans to parse.

## Working Thesis

A good AI-era resume is a structured evidence document. It should be plain enough for parsing systems, specific enough for recruiters, and sourced enough that an agent can tailor it without inventing facts.

The modern resume should optimize for:

- semantic clarity
- role-specific language
- defensible claims
- compact evidence
- provenance for every tailored version

## What Has Changed

AI has increased the value of explicit structure. Recruiters are using more AI-assisted workflows, and LinkedIn's 2025 recruiting research frames AI and skills-based hiring as major shifts in talent acquisition. That means resumes need to expose skills in context, not just list tools.

AI has also increased the risk of generic language. If a resume sounds like an LLM wrote it, the writing may be polished but less trustworthy. The best answer is not more clever copy. It is clear claims tied to real systems, outcomes, and stakeholders.

AI screening remains imperfect. EEOC guidance on employment tests and selection procedures is a reminder that screening tools are still selection procedures with legal and fairness risk. Candidates cannot assume these tools are fair, transparent, or context-aware. The practical response is to make the resume easy to parse and hard to misread.

## What Has Not Changed

The work experience section still matters most. CareerOneStop's resume guidance treats work experience as the critical section and recommends role-relevant responsibilities, accomplishments, job-posting keywords, concrete context, outcomes, and numbers where available.

Strong bullets still need action, context, and result. MIT career guidance uses the same basic pattern: start with a strong action, describe the relevant task using role language, and explain the outcome.

Employers still evaluate broad career readiness, not only tool use. NACE's career readiness competencies include communication, critical thinking, leadership, professionalism, teamwork, technology, and career/self-development. For this resume, that means technical bullets should also show stakeholder judgment, communication, and operational impact.

## Practical Rules

1. Use standard section names.
   Use headings like `Experience`, `Skills`, `Projects`, and `Education`. Save experimental labels for the website layer, not the ATS/PDF layer.

2. Keep one canonical fact base.
   Tailored resumes should pull from `src/data/resume.json` and related contract files. Do not let an AI rewrite create facts that are not in the career record.

3. Tailor language, not reality.
   Use exact job-description terms when they truthfully map to existing work. If a posting says `Power BI`, `Epic Clarity`, `Synapse`, or `Python automation`, those terms should appear near the proof.

4. Prefer evidence over adjectives.
   Replace "strategic", "innovative", "data-driven", and other generic claims with the system, data source, audience, and decision supported.

5. Quantify only what can be defended.
   Numbers are valuable, but false precision is worse than no number. Use approximate language when the scope is real but not audited.

6. Separate designed web resume from ATS export.
   The website can have visual personality. The downloadable/plain resume should use predictable hierarchy, readable text, and minimal layout tricks.

7. Preserve provenance.
   Every bullet should be traceable to a source node, prior role, project, or private note. This enables agentic tailoring without hallucination.

8. Run the interview test.
   If a line would be awkward to explain in a live interview, rewrite it before publishing.

## Implications For This Resume

The resume should move away from clever thesis copy and toward clear positioning:

> Analytics engineer building healthcare and media data pipelines that turn operational data into dashboards, briefings, and automation leaders can use.

The strongest public track is healthcare analytics plus media analytics. The founder work should be honest and compact: small-business data brokering, Python/API automation, campaign extraction, email workflow automation, and CRM/spreadsheet cleanup.

Skill badges should be treated as evidence tags, not decoration. If a skill does not map to a specific role, project, or bullet, it should stay private until it has proof.

## Research Tool Seed Questions

These are useful prompts for the research agent once we start running this toolchain against itself:

- What terms appear most often in current `Analytics Engineer`, `Healthcare Data Engineer`, and `BI Engineer` postings?
- Which of the current resume claims map cleanly to those terms?
- Which claims are likely to be read as inflated, vague, or AI-generated?
- Which bullets contain defensible evidence and which require private source notes?
- What is the best taxonomy for skills across healthcare analytics, BI engineering, data automation, and AI evaluation?
- How should the web resume and ATS/PDF resume differ without creating conflicting facts?

## Source Notes

- CareerOneStop Resume Guide, Work Experience: work history should make relevant qualifications easy to find, use keywords from the job posting, and include context, outcomes, and numbers where possible. https://cloudfront.careeronestop.org/JobSearch/Resumes/ResumeGuide/work-experience.aspx
- CareerOneStop Resume Guide, Top Portion: headline and summary should highlight top skills and accomplishments related to the job, using job-posting keywords. https://cloudfront.careeronestop.org/JobSearch/Resumes/ResumeGuide/top-portion-of-resume.aspx
- CareerOneStop Resume Guide, Formatting: resume formats should preserve clear summary, skills, and work-history structure. https://cloudfront.careeronestop.org/JobSearch/Resumes/ResumeGuide/formatting.aspx
- NACE Career Readiness Competencies: employers use shared competency language including communication, critical thinking, leadership, professionalism, teamwork, technology, and career/self-development. https://www.naceweb.org/career-readiness/competencies/career-readiness-defined/
- MIT Career Advising, Writing About Skills: strong resume bullets combine action, relevant task language, and outcome. https://capd.mit.edu/resources/resumes-writing-about-your-skills/
- LinkedIn Future of Recruiting 2025: LinkedIn reports AI is reshaping recruiting workflows and increasing emphasis on skills-based hiring. https://business.linkedin.com/talent-solutions/resources/future-of-recruiting
- EEOC Employment Tests and Selection Procedures: screening and selection tools can create legal risk if they disproportionately exclude protected groups without job-related justification. https://www.eeoc.gov/laws/guidance/employment-tests-and-selection-procedures
- Career-Aware Resume Tailoring via Multi-Source RAG with Provenance Tracking, 2026 preprint: an emerging resume-tailoring architecture uses a career vault, provenance tracking, confidence scoring, and review loops, matching the direction of this repo's content-authority model. https://arxiv.org/abs/2605.05257
