# TOMORROWPROOF — Building Climate Readiness

TOMORROWPROOF is a building-focused climate exposure screening prototype. It helps users describe a building, retrieve historical NASA POWER climate observations for a location, review a transparent preliminary screening signal, and export a CSV test protocol.

## Scientific workflow

1. **Create a building project** in Buildings. Projects are saved in this browser workspace.
2. **Run a building screening** in Building Climate Lab and link it to a saved project. Enter the building type, location/coordinates, construction system, roof type and target year.
3. **Retrieve the historical climate baseline** from NASA POWER (2001–2024): monthly T2M_MAX, RH2M, PRECTOTCORR and ALLSKY_SFC_SW_DWN values for the selected regional grid cell.
4. **Review the preliminary screening signal** and the engineering action checklist. The target-year temperature uplift is a transparent illustrative assumption, not an official projection.
5. **Save and export the test protocol**. A building screening run is saved to Saved Analyses and marks the linked project as Analysed.
6. **Use Trend Detective** for descriptive historical trends in a selected NASA POWER variable, including solar radiation and Azerbaijan city presets. The Regional map shows the selected grid cell; it is not a national hotspot ranking or a statistical-significance test.
7. **Ask the AI Copilot** to interpret the currently saved project and report context. It uses the server-side Groq endpoint.

## Included

- Architecture-inspired public landing page and browser-based demo workspace.
- Dashboard, Buildings/Projects, Saved Analyses, Files & Data, Building Climate Lab, Trend Detective, Regional Trend Map, AI Assistant, and Settings views.
- Interactive Azerbaijan location picking in the Building Climate Lab, Trend Analysis and Regional Trend Map. Click the map or a city marker to set coordinates; the supported city presets include Baku, Sumgait, Ganja, Mingachevir, Shaki, Lankaran, Shirvan and Nakhchivan.
- NASA POWER monthly point observations for maximum, mean and minimum temperature, relative humidity, precipitation, solar radiation and wind speed when selected; the building screening snapshot stores T2M_MAX, RH2M, PRECTOTCORR and ALLSKY_SFC_SW_DWN (2001–2024).
- Preliminary heuristic screening checklist and CSV export.
- Server-side Groq AI Copilot endpoint at `/api/chat` (API key is not exposed to browser code).
- Responsive Saved Analyses layouts, a dedicated Settings & Subscription center with Profile, Preferences, Notifications, Free/Go/Pro Subscription & Billing, Team Members, Security and Integrations tabs, persistent local preferences, and dark-mode styling for the new settings and map surfaces.
- A new illustrative Earth-themed hero visual, a more spacious trend workspace, and a regional-map guide that explains the selected grid cell before any data is fetched.
- Centralized AZ/EN/RU translation dictionaries with Azerbaijani as the default. Locale-aware wording covers the primary navigation, building assessment steps and results, Trend Analysis, Regional Map, Saved Analyses, Settings, login/signup, and AI Copilot. Dataset codes such as T2M_MAX and API environment-variable names intentionally remain unchanged.

## Requirements

- Node.js 18 or newer
- npm

## Run locally

```bash
npm install
cp .env.example .env
# Edit .env and add your own Groq API key
npm run dev
```

Open the local URL printed by Vite. The application starts at the public landing page. The authenticated demo workspace is available after creating a local demo account.

## API-key guide

- **NASA POWER:** no API key is required for the public monthly point-data service used here.
- **Map layers:** the standard map uses OpenStreetMap tiles without a key. Light and dark modes are client-side styling of the same OSM map data, and satellite imagery is served by Esri World Imagery with attribution. The app intentionally ignores legacy `VITE_MAP_TILE_URL` values so an old CARTO URL cannot restore the “API KEY REQUIRED” watermark. The OSM tile service is best-effort and has usage limits; keep attribution visible and follow its [tile usage policy](https://operations.osmfoundation.org/policies/tiles/). For production or high traffic, use a contracted provider or host your own tile service rather than depending on the community tile server.
- **Groq AI Copilot:** requires `GROQ_API_KEY` on the server side. This is the only key needed for the standard AI-chat setup.

## Groq AI configuration

Add the following values to `.env` in the project root:

```dotenv
GROQ_API_KEY=your_real_groq_api_key
GROQ_MODEL=openai/gpt-oss-120b
```

The default model is `openai/gpt-oss-120b`. Older `llama-3.3-70b-versatile` values are automatically mapped to the replacement model by the API handler. The Integrations tab in Settings includes the same `.env` steps and a link to the Groq key console. Create `.env` beside `package.json` if it does not already exist; use `.env.example` as the template. NASA POWER monthly request documentation is available [here](https://power.larc.nasa.gov/docs/services/api/temporal/monthly/). Restart the development server after changing `.env`. Keep `.env` private and never commit it. For Vercel deployment, configure `GROQ_API_KEY` and optionally `GROQ_MODEL` in the project's server-side Environment Variables. The `/api/chat` function runs server-side.

If the key is missing, the Copilot returns a clear configuration error; it does not fabricate an AI response. An HTTP 401 means Groq rejected the supplied key: create a new key in the Groq console, paste only the Groq key into `GROQ_API_KEY` (not an OpenAI key and not the word `Bearer`), save `.env` in the project root, and fully stop/restart `npm run dev`. Never share the key in screenshots, chat, or source control.

## Saved analyses and export behavior

New building screenings save the original retrieved monthly NASA POWER observations alongside the screening inputs, calculated indicators, recommendations, scenario assumptions, source metadata, and scientific limitations. Trend reports save annual values and the monthly observations used to aggregate them. Opening a report renders its saved snapshot rather than fetching and recalculating a new result. CSV downloads include stored values and source records. The PDF option opens the browser print dialog so the user can choose “Save as PDF.” Reports are persistent in the current browser profile but are not synchronized or server-backed.

## Scientific transparency and limitations

- NASA POWER values are historical, gridded regional observations. They are not street-level measurements and do not constitute future climate projections.
- The selected future-year temperature uplift is an illustrative stress assumption in this prototype, not an official NASA or CMIP6 projection.
- The screening score is a simple heuristic prioritization signal. It is not calibrated against observed building failures, a probability of failure, engineering approval, a code-compliance result, or certification.
- The regional map is a point/grid-cell explorer, not an administrative-region choropleth or national hotspot ranking. The current prototype does not run a full building-physics simulation, material degradation model, flood model, formal statistical significance test, or validated CMIP6 downscaling workflow. Soil-moisture series are not currently wired into the trend selector. The interface must label planned capabilities separately from implemented capabilities.
- Formal design and safety decisions require validated climate projections, building simulation, material datasheets, applicable local standards, and qualified engineering review. Laboratory claims require accredited testing.

## Settings center behavior

The profile form (including a compressed avatar), language/theme, time-zone and unit preferences, notification-category selections, browser-local team-member drafts, and workspace export are saved in the current browser profile. The Subscription & Billing tab includes three selectable demo tiers: Free (2 projects, 5 reports, 3 climate variables, 3 AI Copilot questions per month), Go (10 projects, 50 reports, all 7 climate variables, 50 AI questions per month), and Pro (unlimited projects/reports and AI questions, all 7 variables, and larger AI context). The selected tier and monthly AI usage are stored in localStorage. Client-side plan limits are applied to project creation, report saving, climate-variable access, and AI Copilot requests. This is only a local demo entitlement system: no checkout/payment provider is connected and client-side limits are not secure server-side enforcement. Do not use it to sell subscriptions until plan checks, quota accounting, authentication and billing are enforced by a trusted backend. The time-zone and unit options are stored but do not currently convert existing report values. Notification toggles are saved preferences; they do not send mail or push notifications. Team additions are local drafts only. The Security tab accurately labels the current browser-local demo authentication rather than claiming to provide MFA or password reset.

## Demo account and data storage

The current login/signup flow is a browser-local demonstration, not production authentication. Language, theme, project and uploaded-file metadata remain browser-local. Saved report snapshots use IndexedDB (including source monthly data) and are migrated from the legacy `tomorrowproof-reports` localStorage key; a localStorage fallback is retained. This is still a single-browser demo workspace, not a server-side database or secure multi-user service, and data does not sync between devices. Do not use it for sensitive information or real customer accounts. Before production, integrate a secure identity provider, server-side password hashing, a database with access controls, backups, and privacy/legal review.

## Build

```bash
npm run build
npm run preview
```


## Latest UX refinement: Unified Climate Explorer

- The former separate **Trend Analysis** and **Regional Trend Map** sidebar items are now one **Climate Explorer** workspace. Legacy `#/hotspots` and `#/detective` links route to the unified explorer.
- The workspace keeps an interactive map and historical trend chart together. The map answers where the selected coordinate is; the chart summarizes the historical time series for the chosen NASA POWER variable.
- Users can choose Azerbaijani locations, select a climate variable, edit coordinates directly, or click the map to set the point. The unified screen explains the role and limitations of each view before data is fetched.
- Building Lab Step 1's evidence card now includes a three-step explanation of location selection, historical NASA POWER data, and the next building-screening step instead of leaving its body mostly blank.
- Typography for navigation, form fields, map controls, result summaries, and helper copy has been increased, with mobile-specific responsive rules.
- Historical observed data, descriptive linear trends, and illustrative future assumptions are kept separate in the UI copy. The explorer does not claim national heatmap coverage, formal statistical significance, or official future projection data.

Validation note: source/static checks are documented in `SITE_AUDIT.md`. A production Vite build must be run in an environment with npm dependencies installed. Do not describe the current browser-local demo as a production multi-user app.


## Tests and audit

Run the dependency-free calculation/configuration tests with:

```bash
npm test
```

See [SITE_AUDIT.md](./SITE_AUDIT.md) for what was verified, what remains a local/demo feature, and the production release checks that still need live browser and service testing. The standard map layer uses OpenStreetMap without a key; light/dark are client-side styles, and satellite imagery uses Esri with attribution. Follow the [OSM tile usage policy](https://operations.osmfoundation.org/policies/tiles/) and choose a contracted/self-hosted tile service for production traffic.
