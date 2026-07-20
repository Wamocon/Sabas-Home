# Homepage production standard

## Purpose

Create distinct, production-ready client homepages from approved evidence and strategy using plain HTML, CSS, and JavaScript. The starter is a scaffold, not a content source and not a visual theme to repeat unchanged.

## Gates

1. Client brief exists.
2. Tasks 1-5 are complete and sourced.
3. Strategy is approved by a named human.
4. Fact ledger, content matrix, and media register are ready.
5. Design and motion blueprints are approved or explicitly authorised as a prototype.
6. Implementation passes technical QA.
7. Named humans complete owner and prospective-customer acceptance.
8. Manual release approval is recorded.

## Content provenance

Assign every factual content item an ID. Record:

- Content ID
- Exact fact or approved wording
- Source owner and URL/document
- Verification/retrieval date
- Status: Verified, Client approved, Hypothesis, Recommendation, Blocked, or Rejected
- Intended page location
- Notes/expiry where relevant

The page may use only `Verified` or `Client approved` factual content. Recommendations may appear only after explicit client approval. A blank or plausible default is not evidence.

Always verify name, legal entity, address/service area, phone, email, WhatsApp, map destination, services, prices, hours, languages, social links, reviews, ratings, credentials, guarantees, team claims, customer counts, and legal details.

## Media policy

- Record source, creator/owner, licence or permission, retrieval date, subject, usage, and whether the media is actual, representative, stock, or AI-generated.
- Never describe representative, stock, or AI media as the client's real work, location, staff, products, or customers.
- Use approved real media when it passes the quality gate.
- Keep a stable aspect ratio and explicit dimensions to avoid layout shift.
- Eager-load only the likely LCP/hero image; lazy-load below-fold media.
- Reject watermarks, third-party logos, misleading labels, poor crops, low resolution, or material that lowers trust.
- Replace the starter SVG placeholders before release.

## Reference homepage

Reference: `https://wamocon.github.io/Barber-Shop/maryam-barbershop/`

Reusable format ideas:

- Skip link and responsive navigation
- Clear hero identity and primary/secondary action
- Brand story or positioning
- Service experience/process
- Gallery or proof media
- Service/pricing presentation when verified
- Enquiry or booking handoff
- Verified reviews/trust
- Location/hours where relevant
- Final CTA, legal navigation, responsive actions

Never copy its client-specific name, monogram, noir/gold styling, fonts, exact section order, words, images, prices, ratings, testimonials, hours, languages, map data, contact links, example-domain metadata, or chatbot knowledge base. Its source contains placeholder and sample business values; they are not verified facts.

Do not default to its loader or custom cursor. A client homepage must remain usable immediately, with the native cursor and without artificial waiting.

## Information architecture

Derive sections from the approved strategy and primary user journeys. The universal minimum is:

- Semantic header/navigation
- One clear H1 and primary action
- Verified offer or service/value proposition
- Verified trust or evidence when available
- Contact, enquiry, or booking path
- Footer and applicable legal links

Add pricing, reviews, team, gallery, map, FAQ, chat, language switcher, or social proof only when the approved brief supports them. Omit unsupported optional content instead of fabricating filler.

## Visual design

- Create a client-specific design system: palette, typography, spacing, containers, borders, radii, shadows, icon style, media treatment, and interaction timing.
- Respect approved CI before trends or template defaults.
- Keep hero copy concise and source-backed.
- Avoid generic AI patterns: unnecessary pills, eyebrow labels, bento grids, glass shells, soft corporate gradients, oversized radii, filler metrics, decorative copy, fake dashboards, and repeated card stacks.
- Use accessible inline SVG or approved local icons; do not use Unicode characters as functional icons.
- Preserve brand distinction across projects; do not merely swap copy in an unchanged skeleton.

## Plain HTML implementation

- Use semantic landmarks: header, nav, main, section/article as appropriate, and footer.
- Provide a skip link, logical headings, visible focus, keyboard-operable controls, and understandable labels/errors.
- Keep HTML usable without JavaScript. JavaScript enhances navigation, language, motion, and handoff behavior.
- Keep local CSS, JavaScript, fonts, and assets where feasible. Document unavoidable third-party dependencies and failure behavior.
- Do not claim form success without a working delivery path. When using WhatsApp handoff, validate the E.164 number and URL-encode the message.
- External links opened in a new tab require `rel="noopener noreferrer"`.
- Use real button elements for actions and links for navigation.
- Avoid `href="#"`, `javascript:void(0)`, empty controls, and click handlers on non-interactive elements.

## Multilingual behavior

- Required languages come from the approved brief, not from the starter.
- Translation dictionaries must have identical keys and no silent mixed-language fallback.
- Switching language updates visible copy, `<html lang>`, accessible names, form labels/errors, booking summary, CTA labels, legal navigation, and WhatsApp content.
- Test long German/Russian or the longest required language for overflow.
- If multilingual SEO is required, create crawlable language URLs and correct `hreflang`; JavaScript text replacement alone is not multilingual SEO.

## Motion from the local reference

Source: `webanimation/web_animation_reference.html`.

1. Parse its JSON catalogue.
2. Select one primary and two to four supporting pattern IDs.
3. State a content, comprehension, navigation, media, or conversion purpose for each.
4. Inspect the matching anchors; adapt the concept rather than copying the demo page.
5. Record local path, source ID, rules version, selected IDs, optional public URL, and SHA-256.

Production rules:

- Content is visible by default. Add hidden reveal styles only after JavaScript sets a motion-ready class.
- Hero identity and primary action are visible immediately.
- Use transform, opacity, clip-path, or custom properties; do not animate layout dimensions.
- Use one-shot observers for reveals and unobserve after entry.
- Throttle scroll/pointer work through `requestAnimationFrame` and use passive listeners.
- Gate pointer response with `(hover: hover) and (pointer: fine)` and preserve the native cursor.
- Pause continuous work when `document.hidden`.
- Mirror hover feedback with `:focus-visible`; do not hide information behind hover.
- Under `prefers-reduced-motion: reduce`, stop loops, parallax, cursor effects, marquee, and reveal movement; show final content immediately and set smooth scrolling to auto.

The demo file is a catalogue and teaching reference, not production code to copy wholesale.

## Accessibility and resilient behavior

- Target WCAG 2.2 AA for content and interactions.
- Verify keyboard order, focus visibility, overlay close/return-focus behavior, form labels/errors, names/roles/states, contrast, 200% zoom, and 320px reflow.
- Keep touch targets comfortably sized and separated.
- Ensure navigation and primary contact remain usable when fonts, maps, widgets, images, or JavaScript fail.
- Do not use motion as the only way to communicate state.

## SEO and performance

- Use a unique verified title and description, one meaningful H1, logical headings, and consistent visible/business data.
- Add canonical, Open Graph, structured data, and production URLs only when verified.
- Never ship `.example`, localhost, staging, `noindex`, tokenised, or sample metadata.
- Ensure structured data exactly matches visible verified facts.
- Set image dimensions, responsive sources, modern formats, and sensible loading priority.
- Recommended production targets: LCP at or below 2.5 seconds, CLS at or below 0.1, and INP at or below 200 ms under the recorded lab conditions.
- Treat lab measurements as evidence, not a guarantee of field performance.

## Required project record

Each client folder must include:

- `client-brief.md`
- `fact-ledger.md`
- `strategy-approval.md`
- `motion-blueprint.md`
- Media/source register or equivalent fact-ledger entries
- `qa-report.md`
- Final roadmap `.xlsx`

## Release rule

No Critical or High defect may remain. Any unresolved required token, unverified fact, unapproved media, broken conversion path, inaccessible interaction, missing reduced-motion behavior, absent evidence, or pending manual approval blocks production release.
