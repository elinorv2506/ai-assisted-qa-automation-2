---
name: exploratory-charter
description: Formats an exploratory testing charter and findings template from a feature and a risk. Use when the user asks for an exploratory charter, session plan, or findings sheet — or supplies a feature plus a risk for manual exploration. Does not explore, test, or invent scenarios; only applies the format.
---

# Exploratory Charter

Format-only. The human supplies the thinking (feature + risk); this skill
keeps the charter and findings layout consistent.

## When to use

- User names a **feature** and a **risk** for manual exploratory testing
- Triggers: "exploratory charter", "session charter", "findings template",
  "charter for …"

## When NOT to use

- Live UI gap discovery → **explore-and-generate**
- Jira ticket → Gherkin plan → **jira-ticket-to-gherkin**
- Running tests or filing bugs

## Procedure

1. **Collect inputs** — Require **feature** (area under test) and **risk**
   (what might go wrong or what to learn). Ask only if one is missing.

2. **Emit the charter** — Copy the template below; fill **Feature**, **Risk**,
   and **Mission** only. Leave every other field blank or as `_fill in_`.
   Do **not** add test ideas, heuristics, or pursuit notes — the human owns
   that thinking.

3. **Emit the findings template** — Copy the findings template below with
   empty rows. Do **not** pre-fill findings.

## Charter template

```markdown
# Exploratory Charter

| Field | Value |
|-------|-------|
| Feature | {feature} |
| Risk | {risk} |
| Mission | Explore {feature} with focus on {risk} |
| Time box | _fill in_ |
| Tester | _fill in_ |
| Date | _fill in_ |

## In scope
-

## Out of scope
-

## Notes to pursue
-
```

## Findings template

```markdown
# Exploratory Findings

| Field | Value |
|-------|-------|
| Charter | {feature} — {risk} |
| Session | _date / duration_ |
| Tester | _fill in_ |

## Findings

| # | Type | Summary | Steps / evidence | Severity | Follow-up |
|---|------|---------|------------------|----------|-----------|
| 1 | bug / question / note | | | | |

## Deferred
-

## Session wrap-up
- [ ] Risk explored enough to decide next step
- [ ] Follow-ups logged (Jira / test plan / defer)
```

## Guardrails

- **Format only** — no browser, no specs, no invented scenarios
- **One charter per invocation**
- Findings table stays empty until the human fills it after the session
