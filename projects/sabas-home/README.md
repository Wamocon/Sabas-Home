# Sabaş Home — homepage

A premium, multilingual (RU · EN · TR · DE) homepage for Sabaş Home, Alanya. Plain
HTML/CSS/JS with GSAP + ScrollTrigger motion, a Three.js material showcase, and a
brand-grounded AI concierge. All content, brands, store maps and Google ratings are
sourced from Sabaş Home; see `../../docs/sabas-home/fact-ledger.md`.

## Run it

Static preview (no assistant):

```
node ../../tests/serve.mjs --root=. --port=4173
```

Full experience with the AI assistant (serves the site and proxies the assistant):

```
node server/ai-proxy.mjs
```

Then open the address printed in your terminal (port 4180). The assistant calls the
same-origin `/api/chat` endpoint; the API key stays server-side.

## AI configuration

Copy `server/config.sample` to `server/.env` and fill in your own credentials. The
`AI_API_KEY` must never be shipped in browser JavaScript. Keep `server/.env` out of
version control (see `.gitignore`) and rotate the key if it has been shared in plain text.

## Structure

- `index.html` — the homepage (hero, about, collections, 3D showcase, brands, stores, AI concierge, contact).
- `assets/css/styles.css` — the design system.
- `assets/js/site-config.js` — the 4-language dictionary and settings.
- `assets/js/site.js` — motion, language switching, WhatsApp handoff, privacy-gated maps, AI chat client.
- `assets/js/showcase.js` — the Three.js material showcase (loaded on demand).
- `server/ai-proxy.mjs` — static server plus grounded AI proxy with brand guardrails.
- `imprint.html`, `privacy.html` — legal pages (statutory particulars await client confirmation).

## Third-party libraries

GSAP, ScrollTrigger and Three.js load from a pinned jsDelivr CDN with Subresource
Integrity. The page is content-first: if these fail to load, all text, links, maps and
the contact path still work. To self-host instead, download the pinned versions into
`assets/js/` and point the script tags and import map at the local files.

## Validate

```
node ../../tests/validate-project.mjs --mode=release --root=.
```
