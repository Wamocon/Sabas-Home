# CLAUDE.md

This repository is a reusable, zero-setup starter for producing client homepages in plain HTML, CSS, and JavaScript. It is not a barber-only project and it does not contain verified facts for any real client.

## Required reading

Before changing a homepage, read these files in order:

1. `skills/homepage-production/SKILL.md`
2. `docs/master-project-prompt.md`
3. `docs/homepage-production-standard.md`
4. `docs/agent-workflow.md`
5. `docs/qa/istqb-test-plan.md`
6. `skills/cleanui/SKILL.md` and `skills/uncodixfy/SKILL.md` as advisory anti-pattern references
7. `webanimation/web_animation_reference.html` before selecting motion

The project-owned homepage-production skill wins when a vendored skill conflicts with the approved client brief, plain-HTML delivery, or the local animation catalogue.

## Source priority

Use this priority when instructions or content disagree:

1. The user's current request and approved client brief
2. Verified primary sources and client-provided material
3. The approved strategy from Tasks 1-5
4. This repository's production standard and homepage-production skill
5. The local animation catalogue
6. The MARYAM page as a structure and interaction reference only
7. Vendored UI skills as advisory references

## Mandatory lifecycle

1. Copy `templates/client-brief.md` into the new client project and complete the known inputs.
2. Run Tasks 1-5 from `docs/master-project-prompt.md`. Do not build the homepage during this strategy phase.
3. Record facts in `templates/fact-ledger.md`, hypotheses as hypotheses, and recommendations as recommendations.
4. Obtain explicit strategy approval using `templates/strategy-approval.md`.
5. Create the content matrix, design system, and `templates/motion-blueprint.md`.
6. Copy `starter/` to `projects/<client-slug>/` and replace only source-backed tokens.
7. Run technical and professional acceptance tests.
8. End the delivery report with the manual approval table from `templates/qa-report.md`. Release is blocked while approval is pending.

## Zero-fabrication rules

- Never invent a business name, service, price, address, phone number, WhatsApp number, opening time, language, rating, review, certification, guarantee, customer count, legal text, or social link.
- Never convert a hypothesis or recommendation into a business fact.
- Leave unknown required values as `[[UPPER_SNAKE_CASE]]` tokens and mark the release `BLOCKED`.
- Omit unknown optional sections instead of filling them with plausible copy.
- Representative, stock, or AI-generated media must not be described as the client's real premises, team, work, or customers.
- Structured data and SEO metadata follow the same evidence rules as visible content.

## Reference homepage

`https://wamocon.github.io/Barber-Shop/maryam-barbershop/` is approved only as a format and interaction reference. Reusable ideas include semantic navigation, hero hierarchy, section rhythm, service presentation, booking-to-WhatsApp flow, trust, location, final CTA, responsive controls, and restrained interaction feedback.

Do not copy its brand, monogram, palette, fonts, text, images, prices, reviews, business claims, contact data, chatbot knowledge base, example-domain metadata, loader, or custom cursor into client projects without separate approval and verification.

## Motion

`webanimation/web_animation_reference.html` is the sole approved motion-code reference. Read its JSON catalogue, choose one primary and two to four supporting pattern IDs, inspect only their anchors, and adapt them to the approved brand. Record the IDs, purpose, source ID/version, local path, optional public URL, and SHA-256 in the motion blueprint and release provenance.

Content must be visible before JavaScript. Motion must respect `prefers-reduced-motion`, avoid layout shift, use transform/opacity/custom properties, throttle scroll or pointer work with `requestAnimationFrame`, and pause continuous work when the document is hidden.

## Commands

No install or build step is required.

```text
node --test tests/template.test.mjs
node tests/validate-project.mjs --mode=starter --root=starter
node tests/serve.mjs --root=starter --port=4173
```

Before a real client release, run:

```text
node tests/validate-project.mjs --mode=release --root=projects/<client-slug>
```

Rendered QA must use the AI agent's Browser capability. Do not add Playwright, a browser package, or browser-test dependencies to this repository. If the Browser is unavailable, mark rendered QA `BLOCKED` and ask the user to restore browser access.

## Definition of done

- Strategy approved; fact ledger and source register complete.
- No unresolved required tokens, dummy values, fabricated claims, or unapproved media.
- Selected motion patterns are documented and reduced-motion behavior passes.
- Static/unit, rendered functional, responsive, accessibility, SEO, and performance checks have evidence.
- Business-owner and prospective-customer acceptance are recorded by named humans.
- The final manual approval row remains pending until a human explicitly approves it.
