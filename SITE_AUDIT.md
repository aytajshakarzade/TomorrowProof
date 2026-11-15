# TOMORROWPROOF — code and functionality audit

**Audit date:** 15 November 2026  
**Scope:** the supplied React/Vite project archive, including `src/App.jsx`, map components/configuration, trend and building assessment calculations, Groq endpoint, browser storage, project scripts and README. This is a source/static audit; a full browser-driven production acceptance test was not possible in this environment.

## Fixes made in this audit

### Map tiles and API-key watermark

- Removed the CARTO light/dark tile URLs from the active map selector. All ordinary map styles use `https://tile.openstreetmap.org/{z}/{x}/{y}.png`; the light and dark variants are visual CSS filters over the same OSM raster tiles.
- Kept the Esri World Imagery satellite layer separately, with attribution.
- Kept visible OSM attribution and added a translated tile-load error notice. A tile/network failure is now reported as a map-load failure, not incorrectly presented as a missing NASA API key.
- `VITE_MAP_TILE_URL` legacy overrides are not used by the app's standard map configuration, preventing an old unkeyed CARTO value from reintroducing the overlay.
- OSM's public tile service is best-effort and has usage policies; it is suitable for development/demo traffic, not a guaranteed high-traffic production map backend. For production use, arrange a contracted map provider or host an appropriate tile service and retain attribution.

### NASA POWER data integrity

- Extracted and tested deterministic helpers for historical trend and building-baseline summaries.
- Fixed the JavaScript `Number(null) === 0` / `Number('') === 0` trap so null, empty, nonnumeric and sentinel values are treated as missing instead of false zero measurements.
- Trend analysis now builds the requested 2001–2024 calendar explicitly. Month records absent from the returned response are represented as missing, rather than disappearing from the denominator silently.
- A trend year is included only if at least 9 of its 12 months are valid. The plot uses annual means and least-squares linear slope. “Relatively stable” means the displayed slope rounds to 0.000 in the selected unit; it is not a significance test.
- Building-screening baselines are calculated by first averaging each year with at least 9 valid months, then averaging qualifying annual means. A minimum of 10 qualifying years is required for a baseline. The saved snapshot keeps all 288 expected monthly slots from 2001–2024, with missing values kept as null.
- The building result and CSV provenance include valid/missing monthly counts per NASA POWER parameter and the number of qualifying years.

## Test and static-validation results

`npm test` runs the dependency-free Node test suite. At this audit stage, **8 tests pass**:

1. Years with fewer than 9 valid monthly records are excluded from annual trend summaries.
2. NASA sentinel values stay missing.
3. Positive, negative and flat synthetic trends are classified consistently with the displayed slope.
4. Only valid six-digit year-month keys count as observations.
5. Null, undefined and empty-string source values are not converted into zero.
6. Entirely absent expected months are counted when an explicit period is supplied.
7. Building baselines average qualifying annual means and return no baseline if fewer than 10 qualifying years exist.
8. The default map configuration uses the keyless OSM URL with OSM attribution, rather than CARTO.

A global TypeScript parser found no syntax diagnostics in 12 JavaScript/JSX files. PostCSS parsed `src/styles.css`; `package.json` and `vercel.json` parsed as JSON; the active map config contains no CARTO tile URL.

**Production build status: not verified.** `npm run build` currently stops with `vite: not found` because npm dependencies are not installed in this workspace. Installation was not possible here because the package registry could not be reached. Browser/mobile tests and live NASA/Groq integration tests therefore remain unverified in this run.

## Functionality and integration audit

| Area | Current implementation | Gap before production |
|---|---|---|
| Map location picker | Click/tap, Azerbaijan city markers, editable coordinates, light/street/dark/satellite styles | Live tile delivery was not checked from this environment. OSM tile service has no production SLA; Esri imagery usage terms and quota should be reviewed for deployment. |
| NASA POWER | Public monthly point API, 2001–2024 baseline; no key in the standard NASA request | Live service response not verified during this run; failures need network access. It is gridded regional data, not street/building sensor data. |
| Climate trends | Monthly observations, annual aggregation requiring at least 9 valid months, descriptive least-squares slope, CSV with annual summary and original monthly values | No Mann–Kendall test, Sen's slope, confidence interval, seasonality test or CMIP6 projections are implemented. These are not claimed in the UI. Fixed analysis period is 2001–2024. |
| Building screening | NASA POWER historical indicators, monthly source snapshot, coverage counts, saved heuristic checklist and CSV export | Target-year temperature increments are hard-coded illustrative assumptions (not a projection model). Score thresholds are heuristic, not calibrated failure probability, structural-safety judgment or certification. |
| Saved Analyses | IndexedDB snapshots with old localStorage migration and fallback; local report open/delete/compare/export | Browser-local only; no secure user separation, server database, cross-device sync, remote backup or multi-user access control. |
| AI Copilot | `/api/chat` server endpoint; Groq key read from server-side `GROQ_API_KEY`; request length/time limits and localized model instruction | Requires a real valid Groq key and network access. This run could not verify upstream Groq response. Production needs authentication/authorization and rate limiting against abuse. |
| Authentication | Browser-local demo sign-up/sign-in | Not production authentication. Do not use with real customer accounts until a trusted identity provider and server-side authorization are added. |
| Projects / Files | Projects and file metadata persist in local browser storage | Uploaded file contents are not sent to server; there is no server file store, malware scan, permissions or shared workspace. |
| Settings | Profile, language/theme preferences and notifications preferences can be stored locally; Billing and Team tabs disclose local-only behavior | Billing provider, real invitations, mail/push notifications, MFA/password reset and server sessions are not connected. Time-zone and unit preferences do not convert existing values yet. |
| Localization | AZ/EN/RU dictionaries cover the major workflows and selected climate/map/report/settings copy | Not a verified whole-app translation audit. Some legacy/public pages and some building assessment headings/metadata remain hard-coded in English; run full manual language-switch QA before release. |
| Dashboard and regional context | User project/report counts are calculated locally; city markers and fixed reference content are present | Some static regional reference figures/priority scores in `src/data/azerbaijan.js` are snapshot/demo content and are not refreshed automatically. They must be labelled with date/source or replaced with a verified data pipeline before being presented as live indicators. |
| Responsive UI/accessibility | Responsive CSS breakpoints, mobile map controls, semantic labels in core controls | No physical-device/browser matrix test, keyboard-only audit, screen-reader test or WCAG contrast measurement could be run here. |
| Legal/privacy | Navigation links exist | Placeholder hash destinations are not a substitute for approved privacy/terms content. Obtain legal review and publish real privacy/terms/contact pages before production. |

## Recommended production release gate

1. Install dependencies in a networked environment; run `npm ci` (after checking in a lockfile) and `npm run build`.
2. Run Playwright/Cypress or manual browser acceptance tests for login, map layer switching/tile errors, city and point selection, NASA fetch failure/success, missing data, building reports, saved-report persistence, CSV/PDF, and AZ/EN/RU on desktop and mobile.
3. Configure a real secure identity provider and server-side database, implement access controls and backups, and add API rate limits before enabling shared accounts.
4. Keep the illustrative year-uplift clearly labelled until an appropriately validated climate-projection data pipeline is integrated. Have a qualified building engineer review screening thresholds and recommendations.
5. Replace static context figures with versioned, sourced data or label them explicitly as examples with an “as of” date. Complete localization and legal/accessibility reviews.

This project is materially more transparent and its source calculations are better guarded, but it is not yet a production-certified climate-risk or multi-user SaaS system. No source change can substitute for live service verification, representative device testing, validation against an authoritative climate dataset and qualified engineering review.


### Subscription plan tiers (demo only)

- Added Free, Go and Pro cards to Settings → Subscription & Billing with distinct project, saved-report, climate-variable, AI-request and AI-context entitlements.
- Selected plan and monthly AI request count persist in the current browser profile.
- Project creation, report saving, Free climate variable selection and AI Copilot requests respect the selected local plan.
- No prices, checkout or payment processing are implemented. The local quota checks are a UI/demo feature and must be enforced server-side before commercial use.
