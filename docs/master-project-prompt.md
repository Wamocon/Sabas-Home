# Master market strategy prompt

Use this prompt for each new homepage project. Replace only values that are known from the approved client brief. Leave every other placeholder unchanged and add it to the roadmap as `Waiting for information`.

Website implementation is not part of Tasks 1-5. Complete the strategy and obtain approval before the homepage build begins.

## Required project inputs

### Section 1 - Business and rollout

- Customer/business: `[[CUSTOMER]]`
- Industry: `[[INDUSTRY]]`
- City/region: `[[CITY_OR_REGION]]`
- Extended catchment radius: `[[RADIUS]]`
- Required languages: `[[LANGUAGES]]`
- Main discovery/content channel: `[[MAIN_CHANNEL]]`
- Review platforms: `[[PLATFORMS]]`
- Google Business Profile: `[[NEW_OR_EXISTING_PROFILE]]`
- Existing CI status/reference point: `[[CI_STATUS_AND_REFERENCE]]`
- Photo producibility: `[[QUICKLY_PRODUCIBLE_OR_SLOW_OR_LOW_VISUALITY]]`
- Price transparency expected in the industry: `[[PRICE_TRANSPARENCY]]`

### Section 2 - Verified business facts

Insert the client-provided and independently verified identity, address, contact, service area, opening status, legal entity, current channels, current reviews, team, credentials, and operational facts. Include a source and verification date for every fact. Do not include recommendations here.

### Section 3 - Service portfolio

Insert the complete verified service portfolio, including customer type, delivery mode, recurrence, price if public, margin/priority if provided, geographic reach, prerequisites, and excluded services.

### Section 4 - Known market references

Insert client-named competitors, suspected leaders, known partners/intermediaries, international benchmarks, existing research, and any source URLs. These are leads to verify, not facts to repeat automatically.

## Task 1 - Market analysis

Research the market for `[[INDUSTRY]]` in `[[CITY_OR_REGION]]` and the surrounding area. Derive the final target segments from the verified service portfolio. Evaluate at least these universal archetypes for relevance and make each relevant segment industry-specific:

- Local private customers: price- and proximity-oriented, frequency-driven.
- International residents, second-home owners, or investors, when present: potentially higher demand; language barriers as a purchase hurdle; `[[LANGUAGES]]` as a possible opportunity.
- Commercial/corporate customers: volume business, framework agreements, and reliability before price. Verify relevant examples such as `[[B2B_EXAMPLES]]`.
- Resellers, intermediaries, or partners: recurring B2B business per transaction. Verify relevant examples such as `[[PARTNER_EXAMPLES]]`; omit when irrelevant.
- Premium/enthusiast segment: high-margin and strongly influenced by visual content or `[[MAIN_CHANNEL]]` when supported.

Check local demand drivers as hypotheses, not facts. Verify relevant drivers such as seasonality, tourism, climate/environment, construction or economic development, demography, and legal obligations. Include a current source before using any driver as a strategic argument. Mark unverifiable drivers as `Hypothesis - not verified`.

## Task 2 - Competitive analysis

Identify and verify the biggest/strongest competitors in `[[CITY_OR_REGION]]` and, where relevant, within `[[RADIUS]]`. Cover the entire service portfolio, not only one service. Recheck Section 4 and search for additional competitors, including a possible market leader.

Evaluate every included competitor against all of these criteria:

- Portfolio coverage: full-range supplier or specialist.
- Digital presence: website, Google profile, ratings/stars on `[[PLATFORMS]]`, and `[[MAIN_CHANNEL]]` activity.
- Accessibility/bookability: online appointment, WhatsApp, phone, walk-in, response-time evidence when observable.
- Location/appearance quality: location, accessibility, external image, and waiting comfort where relevant.
- Visible strengths and visible weaknesses, limited to observable evidence.
- Rough price positioning when ascertainable. If public price lists are normal for the industry, actively seek them and cite them.

Do not label a company the market leader without evidence and a stated comparison basis.

## Task 3 - Gap and opportunity analysis

Identify gaps left by the verified competitors. Evaluate, shorten, or extend this list for the industry:

- Missing multilingual service for the Task 1 segments (`[[LANGUAGES]]`).
- Weak online visibility or an absent/unmaintained Google profile.
- Missing or poor reviews on `[[PLATFORMS]]`.
- No online appointment booking or cumbersome contact channels.
- No transparent price list when meaningful for the industry.
- No mobile, pick-up, delivery, or on-site service when operationally possible.
- No subscription, membership, maintenance contract, or framework-agreement model.
- Interchangeable or outdated branding.
- No professional visual content such as before/after, references, work samples, or team proof.

Compare the local market with two international role models:

- `[[BENCHMARK_1_NAME_AND_URL_AND_FIT]]`
- `[[BENCHMARK_2_NAME_AND_URL_AND_FIT]]`

You may select better benchmarks when justified. Prefer brands that segment by use case instead of listing only products/services and that use hard trust indicators such as guarantees, certifications, customer numbers, or standards instead of unsupported marketing phrases.

## Task 4 - Strategy for market leadership

Develop a concrete, prioritised recommendation for how `[[CUSTOMER]]` could become the leading choice in `[[CITY_OR_REGION]]`. Do not describe a recommendation as an existing capability.

### A. Digital presence

Recommend creating or optimising the Google Business Profile according to Section 1. For location-based, walk-in businesses, evaluate whether Maps visibility for `[[INDUSTRY]] near me` should outrank the website. For deadline-based or B2B businesses, justify a different weighting.

### B. Ratings and trust

Design an everyday process for obtaining the first or additional real reviews on `[[PLATFORMS]]`, tailored to transaction frequency. Examples may include a QR card at handover or a consent-based WhatsApp follow-up. Never recommend bought, incentivised-without-disclosure, or fake reviews.

### C. Brand and CI

If no binding CI exists, recommend a consistent colour and visual system based on `[[CI_STATUS_AND_REFERENCE]]` while allowing a cleaner modern reinterpretation. If a CI exists, recommend consistent application rather than reinvention. Cover relevant carriers such as `[[CI_CARRIERS]]` (for example facade/sign, clothing, vehicles, price list, social grid, business cards, or offer PDFs).

### D. Content and image strategy

Use the Section 1 photo-producibility switch:

- Quickly producible: define who records what, when, format, consent, storage, and selection. Use AI imagery only as a clearly recorded interim launch asset.
- Slowly producible: recommend realistic representative or AI-generated imagery by service area, recorded internally as AI-generated, plus a process for replacing it with real work.
- Low visuality: prioritise testimonials, team, certificates, process, standards, and other verified trust content.

Representative or AI imagery must never be presented as real client projects, people, premises, or customers.

### E. Differentiation

Name the verified gap and the exact recommended measure with which `[[CUSTOMER]]` could fill it.

### F. Portfolio bundling and price positioning

Recommend cross-service packages that competitors do not visibly offer. Where appropriate, recommend subscriptions, memberships, maintenance plans, or corporate framework agreements. Mark all new packages and prices as `Recommendation` until approved.

### G. Local visibility and SEO

Recommend how `[[LANGUAGES]]` should be used in the future website, Google profile posts, and `[[MAIN_CHANNEL]]` content. Justify language priority from Task 1. Distinguish human-facing language switching from crawlable multilingual SEO URLs.

## Task 5 - Roadmap

Create a prioritised step-by-step roadmap with rough time estimates and a clear split between:

- `Immediately implementable`
- `Waiting for information`

Include open items such as `[[OPEN_POINTS]]` without guessing. Create the final roadmap as an `.xlsx` workbook with one action per row and these columns:

1. Priority
2. Action
3. Goal/KPI
4. Effort/time estimate
5. Status (`Immediately implementable` or `Waiting for information`)
6. Responsible

Use `templates/roadmap.csv` only as a schema seed; the final client deliverable must be `.xlsx`.

## Mandatory rules

### Zero fabrication

- Use verified facts from Sections 1-4 and current cited research only.
- Label CI, content, package, pricing, name, channel, and positioning ideas as recommendations.
- Include local market figures and demand drivers only with a directly supporting source.
- Do not invent missing facts to complete a table.

### Placeholders

If a placeholder remains open, keep it unchanged and add it to the roadmap as `Waiting for information`. Do not infer a value merely because it is common in the industry.

### Source quality

Prefer primary sources, official profiles, official price lists, registries, local statistics, and directly observable channels. State retrieval dates. Separate observation from inference.

### Questions

Before finalising the strategy and roadmap, ask concise, numbered questions only for missing information that materially changes Tasks 1-5. If it remains unanswered, preserve the placeholder and blocker.

### Self-check

Confirm before submission:

1. Tasks 1-5 are complete.
2. Every competitor includes all Task 2 criteria or an explicit `Not publicly ascertainable` result.
3. Every factual claim is supported.
4. Recommendations and hypotheses are labelled.
5. The roadmap exists as `.xlsx`.
6. Open placeholders are listed as waiting for information.
7. The final results table appears last and requests manual review and approval.

## Agent and testing requirements

- Use enough independent roles to research, verify, build, monitor, and test the full cycle; follow `docs/agent-workflow.md`.
- Apply ISTQB-aligned technical component/unit tests and professional acceptance tests; follow `docs/qa/istqb-test-plan.md`.
- After homepage implementation, show the final results table as the literal last output item and leave the manual approval row pending for a named human.
