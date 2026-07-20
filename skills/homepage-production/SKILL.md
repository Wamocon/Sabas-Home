---
name: homepage-production
description: Build or upgrade source-verified, production-ready client homepages from market strategy through plain HTML/CSS/JS implementation, local animation selection, and ISTQB-aligned release QA. Use for any client homepage project in this repository, including research, competitor analysis, content planning, design, motion, booking or WhatsApp flows, multilingual UI, and final acceptance.
---

# Homepage production

Produce a client homepage only after verified strategy approval. Keep research facts, hypotheses, recommendations, placeholders, implementation, and acceptance evidence distinct.

## Load the project rules

Read these repository files completely before acting:

1. `../../docs/master-project-prompt.md`
2. `../../docs/homepage-production-standard.md`
3. `../../docs/agent-workflow.md`
4. `../../docs/qa/istqb-test-plan.md`

Read `../../webanimation/web_animation_reference.html` before defining motion. Read the vendored CleanUI and Uncodixfy skills only as advisory anti-pattern checks. This skill wins when they conflict with plain HTML, approved brand direction, or catalogue-approved transform/opacity motion.

## Run the lifecycle

### 1. Intake

- Copy `../../templates/client-brief.md` into the client project.
- Preserve unresolved values as `[[UPPER_SNAKE_CASE]]`.
- Ask only for information that is required and cannot be verified or safely left blocked.
- Never replace a placeholder with a plausible guess.

### 2. Research and strategy

- Complete Tasks 1-5 from the master prompt in order.
- Use current, directly supporting sources for market and competitor claims.
- Record each claim, source URL/document, retrieval date, evidence excerpt or summary, and status in the fact ledger.
- Mark demand drivers as hypotheses until verified.
- Mark CI, content, bundling, pricing, and positioning ideas as `Recommendation`.
- Create the required roadmap and export the completed client version as `.xlsx`.
- Do not write homepage code during this phase.

### 3. Approval gate

- Complete `../../templates/strategy-approval.md`.
- Start design and implementation only after a named human approves the strategy or explicitly authorizes a prototype with unresolved release blockers.
- Keep any unresolved required value visible in the blocker list.

### 4. Design and content system

- Derive audience, user journeys, information architecture, section order, copy, trust signals, languages, CTA routes, media roles, and SEO scope from approved evidence.
- Treat `https://wamocon.github.io/Barber-Shop/maryam-barbershop/` as a format and interaction reference only.
- Do not copy its brand, palette, fonts, text, images, claims, ratings, prices, contact details, metadata, loader, custom cursor, or chatbot knowledge base.
- Keep visible copy source-backed. Suggestions remain labelled until approved.
- Do not present representative or AI imagery as actual client work, premises, staff, or customers.

### 5. Motion blueprint

- Parse the JSON catalogue in `../../webanimation/web_animation_reference.html`.
- Select one primary and two to four supporting pattern IDs based on brand, content, device, and accessibility needs.
- Inspect and adapt only the matching CSS/JavaScript anchors.
- Record each ID, purpose, trigger, reduced-motion behavior, source ID/version, local path, optional public URL, and current SHA-256 in `../../templates/motion-blueprint.md`.
- Show content before JavaScript. Enable hidden reveal states only after a motion-ready class is present.
- Use transform, opacity, clip-path, or custom properties; avoid layout animation.
- Throttle scroll/pointer work with `requestAnimationFrame`, gate pointer effects to fine pointers, and pause continuous work while hidden.

Default local-service set when the approved brand does not justify expressive motion:

- Primary: `scroll-reveal-stagger`
- Supporting: `navigation-underline`, `image-zoom-overlay`, `magnetic-button`

Do not default to loaders, custom cursors, scramble, glitch, marquee, animated gradients, or 3D cards.

### 6. Plain-HTML implementation

- Copy `../../starter/` to `../../projects/<client-slug>/`.
- Use semantic HTML, local CSS/JS/assets, accessible inline SVG icons, and no mandatory framework or build step.
- Replace tokens only from approved sources.
- Omit unsupported optional sections; do not create fake proof to fill a layout.
- Keep contact and booking honest. If there is no backend, use a verified handoff such as WhatsApp and never claim a form submission succeeded.
- Update metadata, structured data, legal pages, translations, and accessible labels with the same evidence discipline as visible content.

### 7. Test and release

- Build a requirements-to-source-to-test matrix.
- Run `node --test tests/template.test.mjs` and the release validator for the client project.
- Verify rendered desktop, mobile, keyboard, long-language, no-JavaScript, and reduced-motion behavior.
- Test real destinations without submitting messages or personal data.
- Record defects, evidence, retests, residual risk, and environment.
- Require separate named business-owner and prospective-customer acceptance.
- End the report with the manual approval table from `../../templates/qa-report.md`; write nothing after it.

## Use independent roles

When the runtime supports subagents, use the role structure in `../../docs/agent-workflow.md`. Keep research verification, implementation, technical QA, and release approval independent. The implementer must not self-approve the release. If subagents are unavailable, perform explicit sequential role passes and disclose that limitation.

## Release blockers

Block production release for any of the following:

- Unresolved required token, dummy contact, example domain, TODO, or staging metadata
- Unverified claim, review, price, service, language, credential, guarantee, or structured-data value
- Unapproved or misrepresented media
- Broken primary CTA, booking, phone, WhatsApp, form, map, or legal path
- Inaccessible keyboard flow, hidden content, unsafe motion, or unusable mobile layout
- Missing motion provenance or reduced-motion fallback
- Critical/high defect, missing evidence, or pending manual approval
