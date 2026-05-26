---
name: architect
description: Make architectural decisions with structured trade-off analysis. Loads project context and debates approaches using Socratic thinking.
---

## Context Loading

Read your project's architecture docs before making decisions:

1. Main architecture document (TLDR section)
2. Technical design docs for the relevant subsystem

## Decision Protocol

1. **State the question clearly** — one sentence.
2. **List 3+ approaches** — each with:
   - Pros (why this works)
   - Cons (what breaks at scale)
   - Precedent (who does this already?)
3. **Second-order thinking** — what happens when this scales 100x? 1000x?
4. **Third-order thinking** — how does this affect the overall system?
5. **Recommend one approach** with clear justification.
6. **Name what you're sacrificing** — every choice has a cost. State it.

## Reference Patterns

- Harness > model (same model, different scaffold: 42% vs 78%)
- Bootstrap memory under 2,000 tokens (always loaded)
- Progressive disclosure (load skills on demand, not upfront)
- Model routing by step complexity (cheap for parsing, expensive for architecture)
