# Motion blueprint — Sabaş Home

## Source provenance
- Local path: `webanimation/web_animation_reference.html`
- Source ID: `local-web-animation-reference-v1`
- Rules version: `agent14-motion-v3`
- SHA-256 (LF-normalised canonical): `F28DF5A11EB63DA355111BF8E22E0C9D8575FDD9DD35F85BDD54FC01058A50E5`
- Recorded: 2026-07-20

## Engine note (client-directed deviation)
The client explicitly requested **GSAP + ScrollTrigger** and a **Three.js** showcase for a premium "wow" experience. Per CLAUDE.md source priority #1 (the user's current request), motion is implemented with GSAP/ScrollTrigger rather than the catalogue's vanilla demo code, while the **selected patterns, their purposes, and all production/accessibility rules remain catalogue-governed**. GSAP + ScrollTrigger + Three.js are **vendored locally** (`assets/js/vendor/`) — no runtime CDN dependency. Content is visible before JS; all motion is transform/opacity; reveals are gated by `.motion-ready`; reduced-motion disables all of it.

## Selected patterns (1 primary + 4 supporting)

| Role | Pattern ID | Section/control | Purpose | Trigger | Reduced-motion result |
|------|-----------|-----------------|---------|---------|-----------------------|
| Primary | `scroll-reveal-stagger` | About, categories, brands, stores, concierge, contact | Guide reading order; premium sectional rhythm | IntersectionObserver / ScrollTrigger on enter | Final content shown immediately, no movement |
| Supporting | `navigation-underline` | Header nav links | Wayfinding feedback | hover / :focus-visible / active section | Underline static; active state via colour |
| Supporting | `image-zoom-overlay` | About gallery, store media | Focus on real store imagery | hover / in-view | No zoom; static image |
| Supporting | `magnetic-button` | Hero primary/secondary CTAs | Draw eye to conversion action | fine-pointer pointermove (RAF) | No magnetism; normal button |
| Supporting | `parallax-depth` | Hero visual, 3D showcase stage | Restrained depth on hero/showcase | scroll (RAF-throttled) | No parallax; flat layout |

Three.js material showcase is an enhancement of `parallax-depth`/`scroll-reveal-stagger` intent (an interactive depth element). It lazy-initialises only when in view, on a fine-pointer/WebGL-capable device, and with reduced-motion off; otherwise a static image (`hero.jpg`) fallback is shown and all specs remain in the DOM for SEO/accessibility.

## Performance & accessibility decisions
- Content visible before JavaScript: **Yes**
- Motion-ready class gates hidden reveal state: **Yes** (`.motion-ready .reveal`)
- Scroll/pointer work RAF-throttled: **Yes**
- Continuous work pauses while hidden: **Yes** (`visibilitychange` + Three.js render loop stop; GSAP ticker)
- Fine-pointer gate used: **Yes** (`(hover: hover) and (pointer: fine)`)
- Hover mirrored for keyboard: **Yes** (`:focus-visible`)
- Reduced-motion CSS and JS tested: **Yes**
- Layout animation avoided: **Yes** (transform/opacity/custom properties only)

## Rejected patterns
| Pattern ID | Reason |
|---|---|
| `hero-text-scramble-3d`, `glitch-text` | Off-brand for a warm luxury home retailer; distracting |
| `custom-cursor-follower` | Governance advises against replacing the native cursor |
| `loading-entrance` | No artificial loader; hero must be usable immediately |
| `three-dimensional-cards` | Reserved effect; Three.js showcase covers the 3D "wow" more tastefully |
