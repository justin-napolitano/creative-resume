# Design QA

final result: passed

Compared the exact approved 08-index-simplified-no-marks.png Resume panel with actual desktop and mobile captures in one combined image: implementation-evidence/resume-final/resume-brand-comparison.png. The board supplies the visual direction; the complete career content and existing navigation remain source-owned. This is not a claim of pixel-identical placeholder copy.

The actual pages match the text-only 22px Resume masthead, 28px serif name, 16px body, warm paper #F4F0E8, ink #25251F, fine stone rules and restrained dark slate. No title character, decorative photo, oversized display heading or large blue area remains. Focused name/navigation regions and the full content hierarchy were inspected alongside the reference. No actionable P0, P1 or P2 visual mismatch remains.

Browser captures at 390, 768, 1440 and 320 CSS pixels use deviceScaleFactor 1. Both pages have zero horizontal overflow at those widths and visible 2px Tab focus. A supplementary actual CSS zoom of 2 at 1440px retains wrapping, navigation and no horizontal overflow; this is a CSS zoom test, not native browser chrome zoom automation. No JavaScript errors occurred. Ink, dark slate and muted text combinations exceed AA contrast on their actual paper/dark backgrounds.

Canonical interactions: the Experience anchor works, the skill graph renders 97 nodes, and No Thanks persists denied analytics consent and dismisses its notice. Legacy interactions: the theme control cycles light/dark/auto correctly. Both download routes return application/pdf. No contact, login or account writes were performed.

Print review: compact print-only spacing and static Arial/Georgia fallbacks preserve readable native text extraction. The canonical exporter prints its existing public skill DOM as a semantic text list. All 19 experience bullets per source remain verbatim; private phone is absent in both exports, and legacy email remains absent. Native PDFKit extraction, direct CoreGraphics rendering and an independent Ghostscript check were inspected. PDFKit thumbnail optimizations produced rendering artifacts that were absent in direct rendering; release review relies on the latter. No blank first page or clipped source text remains.

Evidence: implementation-evidence/browser-qa/2026-10-22T18-57-29-961Z and implementation-evidence/resume-final contain captures, keyboard/DOM checks, supplementary interactions, PDF hashes and extracted text. All screen changes since capture are print-only. The canonical complete public record is six pages; the distinct legacy record is five pages.

P3 follow-up: a shorter targeted PDF would require explicit source selection. No facts were removed to compress this visual rollout, and no ATS certification is claimed.


## Green refinement: current acceptance

final result: passed

Compared the approved 08 reference and actual desktop/320px mobile captures again, applying the user's explicit green-color override to the earlier slate palette. Layout and typography remain as previously approved. Shared accents: forest #356349, hover #244b36, sage #e2ecdf, secondary #4e6550 and fine rule #cfd9c8. Body remains ink/paper. Existing role/capability labels and secondary copy receive the emphasis; no facts or arbitrary words were inserted.

Actual 1440/768/390/320 captures have no horizontal overflow and no JS errors. Real mouse hover, keyboard focus and native selected-name states are captured separately in implementation-evidence/green-resumes, including legacy dark mode. Focus outline is 2px forest. Contrast: forest/paper 6.09:1, secondary/paper 5.60:1, dark green/sage 8.10:1; dark-mode pale green/ink 9.62:1 and pale hover/dark sage 8.21:1. No P0/P1/P2 visual findings remain. The existing legacy theme control stays in place.

Both PDFs were regenerated from their own public DOM on unused ports 4664/4665. Native PDFKit text extraction confirms all19 source experience bullets, correct contact privacy and unchanged page counts; direct CoreGraphics page5 inspected for text continuity and clipping. Canonical export now rejects occupied loopback ports before launch and checks preview child/source identity. An occupied4384 check rejected with EADDRINUSE and preserved the PDF bytes; the earlier4384 attempt was discarded. No production deployment is part of this change.


## Readability refinement: current acceptance

final result: passed

Compared actual public before1440/390 PNGs in implementation-evidence/readability-before with actual after1440/320/mobile captures in readability-resumes/after, retaining the approved08 hierarchy and applying the latest user override. Warm white #FCFBF8, deep ink #202820 longcopy,16px body/26.4px line-height,28px serifname and firmer1px #A8B8A1 rules preserve the layout while improving reading contrast. Green remains on links, short role/date/skill labels and interaction states. Ink/warmwhite contrast14.64:1; forest/warmwhite6.69:1. Legacy dark mode retains nearwhite longcopy and pale green labels. No P0/P1/P2 visual findings remain.

Actual320/390/768/1440 captures have no horizontal overflow or JS errors. Hover/focus/native selection remain visible; CSSzoom2 at1440 remains within document width. Normal wheel scrolling succeeds. Computed html canvas forest#356349, body nearwhite#FCFBF8 with min-height100svh, overscroll-behavior:auto and overflow-y:visible; theme-color is forest. No fake scrolling or scroll blocking added. Headless Chromium does not establish Safari elastic-bounce appearance; that specific native behavior remains unverified.

Own-DOM PDFs retain6/5pages, all19 experience bullets per source, hidden private phones and legacy hidden email. Native PDFKit extraction and direct CoreGraphics page5 inspected; monochrome print remains readable. No career JSON, privacy flag, URL or functional-control edits. Deploy only after coordinator PNG review.
