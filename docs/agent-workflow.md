# Multi-agent workflow

## Objective

Use enough independent roles to research, verify, build, monitor, and test the entire homepage cycle. Parallel work is allowed inside a stage, but Tasks 1-5 remain ordered and homepage implementation begins only after strategy approval.

## Minimum independent roles

1. **Orchestrator and lifecycle monitor** - owns scope, dependencies, placeholders, requirements-to-source-to-test traceability, handoffs, and release state.
2. **Market researcher** - completes Task 1 with current primary/local sources and labelled hypotheses.
3. **Competitor and benchmark researcher** - completes Task 2 and international benchmark evidence.
4. **Independent source verifier** - checks claims, competitor evidence, prices, dates, identity, and whether conclusions exceed sources.
5. **Strategy and roadmap author** - completes Tasks 3-5 using only verified evidence; labels recommendations; creates the `.xlsx` roadmap.
6. **Content and fact controller** - manages the brief, fact ledger, translations, metadata, legal inputs, and media provenance.
7. **UX/design and motion director** - defines section architecture, design system, media roles, and local-catalogue motion blueprint.
8. **Plain-HTML implementer** - builds the approved design and interactions without promoting placeholders or recommendations to facts.
9. **Technical QA agent** - runs static/unit and rendered system tests; owns defects and retests, not release approval.
10. **Professional acceptance and release auditor** - prepares owner/customer acceptance evidence and keeps manual approval pending for named humans.

Roles may be combined only when tooling or project size requires it. Keep at least these decisions independent:

- Research author versus source verifier
- Implementer versus technical QA
- Technical QA versus final human approval

If the runtime supports subagents, assign bounded tasks and share raw artifacts rather than intended conclusions. If it does not, run explicit sequential role passes and disclose the limitation.

## Stage dependencies

```text
Brief
  -> Task 1 market analysis
  -> Task 2 competitive analysis
  -> Independent verification
  -> Task 3 gaps
  -> Task 4 strategy
  -> Task 5 roadmap (.xlsx)
  -> Strategy approval
  -> Fact/content + UX/design + motion blueprint
  -> Plain HTML implementation
  -> Technical QA and defect retest
  -> Owner acceptance + customer-journey acceptance
  -> Final manual approval
```

Independent research can run in parallel within Tasks 1 and 2. The orchestrator must prevent a later role from treating an unverified observation, hypothesis, recommendation, or template token as fact.

## Required handoff packet

Every stage hands off:

- Requirements and open questions
- Source/fact ledger changes
- Decisions and approvals
- Hypotheses and recommendations kept separate
- Blockers and residual risks
- Files changed
- Tests/evidence completed
- Next role and exit criteria

## Monitoring rules

The orchestrator maintains a traceability table with:

- Requirement ID
- Source/fact ID
- Strategy decision
- Page/content ID
- Motion ID when relevant
- Test case IDs
- Current status and owner

Use only `PASS`, `FAIL`, `BLOCKED`, or `NOT RUN`. Do not hide a missing requirement as `N/A`. Stop release when a P0 risk or approval dependency is open.

## Human boundaries

Agents may research, recommend, implement, test, and assemble evidence. Only a named human may:

- Approve the strategy when required
- Confirm client facts or rights that cannot be independently verified
- Accept owner and prospective-customer UAT
- Mark final manual approval as approved
