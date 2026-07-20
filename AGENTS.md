# AGENTS.md

This is a generic plain-HTML homepage production repository. Follow `CLAUDE.md` as the root workflow, even when running in Codex or another agent environment.

## Required route

Read `skills/homepage-production/SKILL.md`, then the files it requires. Complete and approve research/strategy Tasks 1-5 before editing a client homepage. Use `starter/` only as a scaffold; never publish its tokens or demo placeholders.

## Non-negotiable gates

- Source every client fact in the fact ledger.
- Keep unknown required values as `[[TOKEN]]`; never guess.
- Treat the MARYAM URL as a layout/interaction reference, not a content source.
- Select motion only from `webanimation/web_animation_reference.html` and record exact pattern IDs.
- Run dependency-free tests plus rendered desktop/mobile QA.
- Require named human owner and customer-journey acceptance.
- End every client delivery report with the manual approval table; nothing follows it.

Do not edit vendored `cleanui` or `uncodixfy` content unless updating the vendor import. Their conflicting absolute rules are advisory; the project-owned homepage-production skill is authoritative.
