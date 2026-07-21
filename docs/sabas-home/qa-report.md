# QA & acceptance report — Sabaş Home

## Environment
- Revision: homepage build 2026-07-20
- Candidate path: `projects/sabas-home/`
- Date: 2026-07-20
- Technical tester: AI implementer (Claude Code)
- Node: v22.14.0 · OS: Windows 11
- Browser/session: **not available in this environment** — rendered QA is BLOCKED
- Browser availability: **Blocked**

## Traceability and commands
- Strategy: `docs/sabas-home/market-strategy.md`
- Fact/media ledger: `docs/sabas-home/fact-ledger.md`
- Motion blueprint: `docs/sabas-home/motion-blueprint.md`
- Automated commands/results:
  - `node --test tests/template.test.mjs` → **10/10 pass**
  - `node tests/validate-project.mjs --mode=release --root=projects/sabas-home` → **123/123 pass**
  - `node --check` on site.js / showcase.js / ai-proxy.mjs / site-config.js → **all pass**
  - i18n parity: 137 keys × 4 languages, non-empty → **pass**; 120 in-page `data-i18n` keys all resolve → **pass**
  - Live AI proxy: `/api/health` ok; EN/DE/RU `/api/chat` calls returned grounded, guardrailed, in-language replies (DE routed to `gemma4-31b`); price/off-topic requests correctly refused and redirected → **pass**

## Redesign iteration (2026-07-20, after client feedback "not premium")
Client rejected the light photo-hero design. Root causes confirmed by rendered inspection: blurry 798px hero photo upscaled into a portrait crop; milky glass header over sand; 3D canvas muddled over a photo fallback; trust card overlapping the marquee. Redesign applied and re-verified with Edge-headless renders (desktop 1440 full+hero, mobile 390 TR):
- Dark "luxury showroom" hero: ink gradient + gold serif headline; the Three.js scene (re-sculpted slender amphora, dark glossy plinth, low brass halo, scale 0.78) is now the hero centerpiece with compact material chips; animated gradient orbs; scroll cue.
- Header transparent over the dark hero with white logo/links/amber CTA; switches to white glass on scroll; menu-open state forces light header.
- Client photos removed from hero (blur source); retained in About with a warm color-grade overlay, and authentic use elsewhere.
- Trust card now floats over the hero bottom (marquee moved below it — overlap defect fixed). Footer uses generated white-knockout logo (white-box defect fixed).
- `?nomotion` URL switch added (deterministic screenshots + reduced-motion QA hook).
- Post-redesign: release validator 126/126, JS syntax clean, server healthy; desktop + mobile renders visually verified.

## Iteration 3 (2026-07-20) — real maps, parallax band, photography, motion
Per client direction ("show real map, animation everywhere, refero-grade premium, real images"):
- Removed the Three.js showcase entirely (client rejected the procedural vase); replaced with real, licensed 4K photography (Unsplash) — a GSAP hero image stack (parallax main frame + two floating cards + gold ring + glass brand chip) and image-backed "shop-by-room" category tiles (kitchen/furniture/décor/carpet) with hover zoom.
- Store maps now AUTO-LOAD the real Google Maps embed on scroll-into-view (IntersectionObserver, 300px rootMargin) with a spinner + fade-in and grayscale→colour on hover; embed reachability confirmed (HTTP 200). Click fallback retained.
- Added a full-bleed parallax "band" (dusk architectural home) with an editorial statement + amber CTA (new i18n keys bandTitle/bandCta across all 4 languages — parity 139 keys).
- Added animated number counters (20+/5/41) on scroll; richer reveal choreography; all transform/opacity, reduced-motion safe, `?nomotion` QA switch.
- Media register updated (MED-10..15 representative stock, recorded as NOT Sabaş premises). Re-verified: release validator 134/134, i18n parity PASS, rendered desktop (band + stores) and mobile RU inspected.

## Iteration 4 (2026-07-20) — warm luxury theme, de-dashed copy, modern UI
- Removed all em-dashes from visible copy (site-config 61, index 15, legal 10) via context-aware replacement; re-verified 0 remain; i18n parity held at 139 keys × 4.
- Palette re-themed from cold navy/white to a warm luxury-atelier system: espresso ink (#241c15), porcelain/bone backgrounds (#fbf8f3 / #f4ece0), brass gold (#b89968), muted teal secondary; warmed 20 hardcoded cool rgba values and grad-ink/grad-sunset gradients; header glass warmed.
- Added modern "wow" elements: full-page film-grain texture (SVG feTurbulence, soft-light 5%), hero pointer-tracking amber spotlight (fine-pointer, RAF, native cursor preserved), plus the existing counters/parallax band/floating cards.
- Rendered verification (Edge headless, 1440 hero + full page): warm hero, cream editorial sections, image tiles, dusk parallax band, and REAL Google maps confirmed rendering in the store cards. Release validator 134/134.

## Iteration 5 (2026-07-20) — smooth scroll, motion depth, design-audit fixes
Ran a 6-lens adversarial design-audit workflow (39 agents) over rendered desktop+mobile frames; 23 findings verified. Also proved (via CDP + a `?debug` width readout) that the apparent mobile hero "clipping" was a **screenshot artifact** — Edge headless renders the layout viewport at ~504px for a 390px window; `document.scrollWidth ≤ innerWidth` at all widths = zero real overflow. Applied the highest-leverage fixes:
- **Lenis smooth scroll** (CDN + SRI, 12.7KB) synced with GSAP ticker + ScrollTrigger; smooth in-page anchor navigation via `lenis.scrollTo`; disabled under reduced-motion; `data-lenis-prevent` on the chat log; maps stay interactive. Verified live: `gsap:Y lenis:Y on:Y ST:Y`, no console errors.
- **`.section-alt` background was never styled** (referenced in HTML, missing in CSS) — added; restores tonal rhythm (white/sand alternation), the single biggest fix for the "flat/sparse" feel.
- **Hero cursor-reactive depth parallax** on the layered image cards (hs-main/a/b/ring/chip at different depths) + spotlight, native cursor preserved; replaced the continuous float.
- **Brand cells → engraved gallery plates** (paper gradient, display serif, brass corner ticks on hover). **Category tiles → solid amber/brass icon medallions** + stronger dual top/bottom scrims + taller tiles.
- **`--muted` darkened** to #7a6a54 for WCAG AA on the warm backgrounds; tightened global section rhythm; robust `.wrap` gutters (padding-based).
- Added a guarded `?debug` viewport diagnostic (inert without the param).
- Release validator 134/134, i18n parity 139×4, JS clean.

## Iteration 6 (2026-07-21) — Turkish primary + pinned horizontal "shop by room" scroller
- **Turkish is now the primary language**: `defaultLanguage: "tr"`, `<html lang="tr">`, Turkish `<title>`/meta/OG + `og:locale` alternates, TR-first language switcher. Converted 150 static `data-i18n` texts in index.html to Turkish (pulled from the verified TR dictionary) so the page is Turkish pre-JS and for crawlers. Removed browser-language auto-detect so TR loads by default for everyone; visitors switch manually (remembered via localStorage) or deep-link `?lang=ru|en|de`. 0 em-dashes; parity 139×4.
- **Pinned horizontal "shop by room" scroller** replaces the static category grid: 5 cinematic panels (4 categories + a CTA panel) with real photography, amber medallions, serif titles, "Markalar →" links and an amber progress bar. Desktop pins the section and scrolls the track sideways (GSAP ScrollTrigger + `gsap.matchMedia`, reverts cleanly < 900px); mobile/no-JS falls back to native scroll-snap swipe. Verified: `gsap:Y lenis:Y on:Y ST:Y`, no console errors, `scrollWidth ≤ innerWidth`.
- Release validator 140/140 (added anchors/assets from the scroller), i18n parity 139×4, JS clean.

## Iteration 7 (2026-07-21) — ScrambleText, metallic wordmark, real 3D PBR configurator
Implemented the three expert techniques the client referenced:
- **GSAP ScrambleText**: upgraded GSAP to 3.13.0 (plugins now free) with SRI; eyebrow labels scramble-decode into place on scroll-in (reduced-motion safe).
- **Polished-metal wordmark**: hero headline now uses a brass metallic `background-clip:text` gradient (dark→bright→dark) with an animated highlight sweep; the 3D section heading uses a chrome/silver variant. Visually confirmed in rendered capture.
- **Real 3D product configurator (Three.js + PBR + HDRI + DRACO)**: a dedicated dark section loads a CC0 PBR velvet sofa (Khronos GlamVelvetSofa) lit by a CC0 Poly Haven studio HDRI (RGBELoader→PMREM), OrbitControls to drag-rotate, 5 swatches that recolour the velvet in real time, technical badges (PBR·HDRI·DRACO·410KB) and copy kept in the DOM for SEO/accessibility, plus an honest "representative visualisation, not a specific product" label (4 languages). The model was **DRACO+WebP compressed 3.15MB→410KB** via gltf-transform. Lazy-loaded, DPR-capped, paused off-screen/hidden, disposes; falls back to a real sofa photo on reduced-motion / no-WebGL.
- **Verification limitation (disclosed):** headless SwiftShader cannot render the PMREM-HDRI PBR scene, so the 3D render itself could not be captured in this environment (it shows the graceful fallback photo there). Everything up to the GPU render was verified: model 410KB + HDRI 1.6MB served (200), DRACO decoder reachable (200), all four Three.js addon modules resolve (200) and import 'three' via the import map, module syntax clean, no console errors. It renders on a real GPU browser; the client should confirm on their machine.
- Release validator 142/142, i18n parity 140×4, 0 em-dashes, JS clean.

## Iteration 8 (2026-07-21) — Turkish/Cyrillic/German glyph-clipping fix
Client reported hero headline glyphs clipped in Turkish (ğ breve + g descender). Root cause: the hero H1 lines use `overflow:hidden` as the GSAP reveal mask, which clipped ascenders/descenders/diacritics that extend past the tight line box (ğ, ş/ç cedilla, g/y descenders; also Cyrillic у/ц/р and German ß/äöü). Fix: expanded the clip box with `padding: 0.16em 0.02em 0.22em` and pulled it back with matching negative margins so no glyph is clipped and the layout/reveal are unchanged. Audited every other `overflow:hidden` container — all hold text with sufficient padding buffers, no other masks clip text. Verified in rendered captures across **TR, RU and DE** heroes plus all Turkish sections (headings, scroller panels, brand plates, band, stores, 3D badges/notes): no clipping remains. Release validator 142/142.

## Defects and retests
| Defect ID | Severity | Requirement/test | User-visible result | Fix/owner | Retest |
| --- | --- | --- | --- | --- | --- |
| D-01 | Low | RELEASE-TOKENS heuristic flagged `[0]` subscripts | none (false positive) | rewrote to `.at()`; libs moved to pinned CDN | PASS |
| D-02 | Info | Hero image is 798×449 (client asset) | slightly soft on large screens | replace with higher-res photography (roadmap) | Open (client) |

## Residual risk / open items (BLOCKED — not fabricated)
- Rendered desktop/mobile/keyboard/contrast/Lighthouse QA not executed (no Browser capability). **P1 BLOCKED.**
- Exact opening hours, prices, warranty/return/delivery terms, verified review counts, and legal imprint particulars await client confirmation. **P0/P1 Waiting for information.**
- Google star ratings verified via JS-rendering proxy on 2026-07-20; client should re-confirm from Google Business Profile (ratings drift over time).

## Professional acceptance
- Business-owner reviewer/name/date: Pending
- Business-owner decision: Pending
- Prospective-customer reviewer/name/date: Pending
- Prospective-customer decision: Pending
- Accepted residual risks: to be recorded by named human

Nothing may follow the table below in the final delivery report.

| Gate | Status | Evidence / notes | Human reviewer decision |
| --- | --- | --- | --- |
| Requirements and provenance | PASS | fact-ledger + strategy complete, sourced |  |
| Dependency-free static and unit tests | PASS | 123/123 release + 10/10 unit |  |
| Functional interactions | PASS (rendered click-through BLOCKED) | AI live-tested; WhatsApp/form/validation unit-tested |  |
| Accessibility | PASS at code level; rendered BLOCKED | landmarks, skip link, :focus-visible, aria, reduced-motion |  |
| Responsive UI and language overflow | NOT RUN (rendered) | breakpoints authored; needs browser check |  |
| Animation and reduced motion | PASS at code level; rendered BLOCKED | motion-ready gating, RAF, reduced-motion, visibility pause |  |
| Links, forms, WhatsApp, and legal pages | PASS (static) | all refs resolve, noopener, verified WhatsApp, legal pages present |  |
| SEO, console, resources, and performance | PASS (static); field BLOCKED | unique title/desc, one H1, canonical, OG, JSON-LD |  |
| Business-owner acceptance | PENDING |  | Name/date: |
| Prospective-customer acceptance | PENDING |  | Name/date: |
| **FINAL MANUAL APPROVAL — please review all evidence and select one** | **PENDING** | Release is prohibited while pending | [ ] APPROVED [ ] REJECTED — Name/date: |
