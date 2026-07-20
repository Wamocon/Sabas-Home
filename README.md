# WAMOCON Homepage Production Template

A reusable, zero-setup repository for researching, designing, building, and validating production-ready client homepages in plain HTML, CSS, and JavaScript.

## What is included

- `starter/` - complete responsive homepage scaffold with configurable language UI, enquiry-to-WhatsApp handoff, legal-page starters, and accessible motion.
- `webanimation/` - the local motion catalogue and implementation reference.
- `docs/` - market/strategy prompt, production rules, agent workflow, and ISTQB-aligned QA plan.
- `templates/` - client brief, fact ledger, strategy approval, motion blueprint, roadmap schema, and final QA report.
- `skills/homepage-production/` - the project-owned AI workflow skill.
- `tests/` - dependency-free unit and static validation tools.

The supplied [MARYAM homepage](https://wamocon.github.io/Barber-Shop/maryam-barbershop/) informs format and interaction quality only. Client-specific content, assets, claims, branding, and contact details are never copied.

## Start a client project

1. Copy `templates/client-brief.md` and complete all known inputs.
2. Run the research and strategy prompt in `docs/master-project-prompt.md`.
3. Record sources and facts, then obtain strategy approval.
4. Copy `starter/` to `projects/<client-slug>/`.
5. Replace tokens only with verified content and document selected motion IDs.
6. Run technical QA and obtain human acceptance.

PowerShell example:

```powershell
Copy-Item -Recurse -LiteralPath starter -Destination projects\client-slug
Copy-Item -LiteralPath templates\client-brief.md -Destination projects\client-slug\client-brief.md
```

## Preview and test

No packages need to be installed.

```text
node --test tests/template.test.mjs
node tests/validate-project.mjs --mode=starter --root=starter
node tests/serve.mjs --root=starter --port=4173
```

Then open `http://127.0.0.1:4173/`.

For a production candidate:

```text
node tests/validate-project.mjs --mode=release --root=projects/<client-slug>
```

The release validator intentionally fails the untouched starter because it contains explicit `[[...]]` tokens and placeholder media. The homepage itself can also be opened directly from `starter/index.html`; Node is used only for optional automated QA and the local preview server.

## Roadmap workbook requirement

`templates/roadmap.csv` is the editable schema seed. Each real strategy project must export the completed roadmap as `.xlsx` with the same columns: Priority, Action, Goal/KPI, Effort/time estimate, Status, and Responsible. The CSV is not a substitute for the required final workbook.
