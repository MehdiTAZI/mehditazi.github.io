# Multilingual website — EN / FR

## Scope

Approved: shared Eleventy templates, English at existing URLs, French under
`/fr/`, a compact language switcher, translated content and travel interactions,
localized metadata and a six-page sitemap. The default CV follows the site
language (updated user requirement): English on EN, French on FR.

## Progress

- [x] Inspect the clean checkout and current page structure.
- [x] Extract shared templates and localized content.
- [x] Generate six static pages and page-specific travel translations.
- [x] Add context-preserving language navigation and responsive styling.
- [x] Validate links, metadata, translations and isolated language loading.
- [x] Verify browser flows, mobile rendering, CV downloads and map controls.

## Verification — 2026-10-19

- `npm run validate`: six pages, 238 local links, matching translation keys,
  reciprocal language metadata, six sitemap URLs, unchanged recommendation/logo
  order, all 45 country flags and preserved album URLs/photo lists.
- Chrome/Playwright: all six pages at widths 320, 390, 768, 1024 and 1440 px;
  no horizontal overflow or JavaScript page errors. Actual network requests show
  no map/dictionary on Home or Ventures, and exactly the requested locale module
  on Perspectives.
- Actual language-link clicks preserve `#testimonial` and `?country=MX`; localized
  navigation and the mobile menu remain functional.
- Downloaded EN and FR PDFs have the same SHA-256 as their source resources.
- Default CV correction: both download locations use the page language for the
  target PDF, filename, accessible label and EN/FR badge; checked by the validator.
- Map: Mexico/Mexique, accent-insensitive French search, Americas filter (five
  countries), singular photo counts, Monaco, zoom in/out and reset preserving all
  seven markers.
- Both language versions render without JavaScript; language links still work.
- Visual captures inspected in `output/playwright/` (ignored, local evidence).
- Other browser engines are not installed; Safari/Firefox have not been tested.
- The validation workflow is prepared but has not run on GitHub.

## Maintenance

Edit `src/` and shared assets, then run `npm run validate`. Commit the source and
the generated static outputs together. `npm run dev` serves `_site/` with source
rebuilding, including travel data. Generated files are never hand-edited.

## Publication

Commit, push and integration into `main` were explicitly authorized by the user
on 2026-10-19. At this pre-commit checkpoint, validation is complete and Git
publication is pending. The checkout is already on `main`, so no separate merge
is required. Preserve branch-based static hosting: generated HTML remains at the repository
root, with source templates maintained in `src/`. Build artifacts in `_site/`
can also be deployed by a future dedicated Pages workflow.

The GitHub Pages settings endpoint was unavailable because `gh` has no token;
no hosting settings have been changed.

Local preview: http://127.0.0.1:4173/fr/index.html (temporary Python server).
