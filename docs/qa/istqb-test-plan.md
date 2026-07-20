# ISTQB-aligned homepage test plan

## Test basis and traceability

Create a requirements-to-source-to-test matrix before implementation. The test basis includes:

- Approved client/project brief and languages
- Verified Tasks 1-5 strategy and roadmap
- Client identity, services, prices, hours, contacts, legal data, media, and rights
- `webanimation/web_animation_reference.html`, its source ID/version/hash, and selected motion IDs
- Approved page architecture, content matrix, interactions, and acceptance criteria
- Accessibility, responsive, SEO, performance, and production-readiness rules
- Open placeholders and missing information

Every test case references at least one requirement. Use `PASS`, `FAIL`, `BLOCKED`, or `NOT RUN`.

## Test levels

1. **Static verification** - files, assets, links, IDs, placeholders, metadata, provenance, and motion manifest.
2. **Component/unit** - pure JavaScript for translation, validation, WhatsApp URL/message, booking summary, and reduced-motion decisions.
3. **Rendered system** - complete browser behavior, responsive UI, keyboard, language, links, forms, motion, console, and resources.
4. **Professional acceptance** - named humans evaluate factual correctness, brand suitability, conversion journey, and client appropriateness.

A technical pass never implies business approval.

## Risk priorities

| Priority | Risk | Release rule |
| --- | --- | --- |
| P0 | Fabricated facts, reviews, prices, credentials, legal text, or misrepresented media | Any failure blocks release |
| P0 | Broken primary CTA, phone, form, WhatsApp, booking, map, or legal journey | Any failure blocks release |
| P0 | Keyboard-inaccessible UI, hidden content, unsafe motion, or unusable mobile layout | Any failure blocks release |
| P0 | Placeholder or example data published as real | Any failure blocks release |
| P1 | Missing translations, overflow, incorrect metadata, console/resource errors, layout shift, or serious performance regression | Fix or obtain documented named-human exception |
| P2 | Minor non-blocking visual/motion inconsistency | Document and obtain approval |

## Automated checks

Run:

```text
node --test tests/template.test.mjs
node tests/validate-project.mjs --mode=release --root=projects/<client-slug>
```

The dependency-free checks cover required files, meaningful HTML, unique IDs, valid local anchors/assets, safe new-tab links, title/description/H1, unresolved tokens, dummy values, placeholder media, translation parity, WhatsApp formatting/encoding, motion IDs, and reduced-motion hooks.

Static checks are heuristics; they do not prove accessibility, visual quality, factual correctness, or performance.

## Test design techniques

- **Equivalence partitioning:** valid/invalid language code, verified/unverified contact route, complete/incomplete form, supported/unsupported motion preference.
- **Boundary values:** 320px layout, long translated labels, empty/maximum practical message length, phone digits at accepted limits, first/last service option.
- **Decision tables:** contact handoff with valid fields + valid number; valid fields + placeholder number; invalid fields; reduced motion + pointer capability.
- **State transitions:** menu closed/open/closed, language A/B/A, form pristine/error/valid/handoff, reveal pending/visible, document visible/hidden.
- **Exploratory session:** owner and customer journeys on desktop and mobile with interruptions and third-party failures.

## Content provenance cases

| ID | Test | Expected result |
| --- | --- | --- |
| PROV-01 | Compare name, address/service area, contact and identity with approved input | At least two identity fields match; nothing guessed |
| PROV-02 | Review services, prices, hours, rating, review count, guarantee, credential, and trust claim | Every value is client-approved or source-verified |
| PROV-03 | Inspect strategy-derived copy | Recommendations remain labelled until approved |
| PROV-04 | Search source/render for unresolved tokens | Required tokens block release; none are silently replaced |
| PROV-05 | Review images, logos, icons, and fonts | Source, rights, role, and verification date recorded |
| PROV-06 | Compare actual, representative, stock, and AI media | Representative media is not presented as actual client evidence |
| PROV-07 | Inspect selected animation records | Every ID exists in the local catalogue and records source/version/hash/purpose |
| PROV-08 | Check lifecycle | Strategy approval predates homepage implementation or explicitly authorises a blocked prototype |

## Accessibility cases

| ID | Test | Expected result |
| --- | --- | --- |
| A11Y-01 | Inspect title, language, landmarks and headings | Correct language, one H1, logical structure |
| A11Y-02 | Inspect images/decorative media | Useful alt for informative media; empty alt for decorative media |
| A11Y-03 | Navigate by keyboard only | All functions reachable, visible focus, logical order, no trap |
| A11Y-04 | Operate menu, language and form; press Escape where applicable | Correct names/states; close and focus restoration |
| A11Y-05 | Submit incomplete form | Visible labels and understandable errors without losing valid input |
| A11Y-06 | Inspect names, roles and states | Accurate accessible control semantics |
| A11Y-07 | Measure contrast | WCAG AA for text, controls, links, focus and states |
| A11Y-08 | Test 200% zoom and 320px reflow | No lost content/function or two-dimensional page scroll |
| A11Y-09 | Disable/block JavaScript | Core identity, content and contact route remain understandable |

## Responsive matrix

Test at least:

- 320x568
- 390x844
- 768x1024
- 1024x768
- 1440x900
- One mobile landscape viewport

Check horizontal overflow, clipping, overlap, dialog/menu bounds, sticky coverage, image crops, touch targets, long-language wrapping, and first-viewport comprehension. Capture desktop, mobile, longest-language, open-menu/form-error, and reduced-motion evidence.

## Motion cases

- Every selected pattern has a purpose and matches its recorded ID.
- Content is visible if JavaScript or `IntersectionObserver` fails.
- One-shot reveals do not repeatedly distract.
- No layout dimensions animate; no scrollbar jitter or unexpected layout shift.
- Scroll/pointer work is RAF-throttled and continuous work pauses when hidden.
- Pointer effects are gated to fine pointers; keyboard and touch retain equivalent information.
- With reduced motion, loops/parallax/marquee/reveal movement stop and final content is immediately visible.

## Links, forms, WhatsApp, language, and legal

- Navigation anchors land at the correct visible heading.
- Phone, email, map, social, legal, and external destinations match verified inputs.
- External destinations are opened during manual QA; do not send a message or personal data.
- Forms validate required fields and never claim delivery without a working route.
- WhatsApp uses the verified E.164 number and a URL-encoded selected-language message.
- Language switching updates visible text, `<html lang>`, accessible labels, errors, summary, CTA, legal navigation, and handoff content.
- Translation dictionaries contain identical non-empty keys.
- Separate crawlable URLs and `hreflang` are tested when multilingual SEO is required.
- Imprint/privacy pages are non-empty, client-correct, and linked.

## SEO, console, resources, and performance

- Unique verified title and description; one H1; logical headings.
- Canonical, social metadata and structured data use verified production URLs/content only.
- No `.example`, localhost, staging, `noindex`, tokenised, or sample metadata.
- No relevant console errors, broken resources, mixed content, or unexpected requests.
- Core contact path survives third-party map/font/widget failure.
- Images have dimensions, appropriate loading priority, responsive sizing, and production formats.
- Record lab conditions and target LCP <= 2.5s, CLS <= 0.1, INP <= 200ms.

## Professional acceptance

### Business owner

The named owner/reviewer confirms identity, services, prices, hours, contact, legal details, photos, claims, and brand presentation. They confirm representative/AI media is not misrepresented.

### Prospective customer

The named reviewer confirms the first viewport explains who, what, where, and the primary action; a visitor can understand services, switch language, and reach the contact/booking handoff without confusion.

## Evidence record

Record revision, date, tester, browser/version, OS, URL, viewports, automated output, screenshots, console/resource results, provenance audit, keyboard/zoom/contrast observations, performance conditions, defects, retests, residual risk, and named acceptance decisions in `qa-report.md`.

## Entry criteria

- A testable candidate, requirements, languages, fact ledger, blockers, and motion blueprint exist.

## Exit criteria

- Automated checks pass.
- Every P0 case passes.
- No Critical/High defect remains.
- P1 exception has explicit named-human acceptance.
- Required rendered evidence exists.
- Owner and customer acceptance are recorded.
- Final manual approval is completed by a named human.

The final results table from `templates/qa-report.md` must be the literal last item of the delivery report. The AI must not preselect approval.
