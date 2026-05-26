---
name: model-routing
description: Auto-select the right model tier for each task. Route sub-agents to appropriate models. Minimize cost without sacrificing quality.
---

## When to Use

- Breaking a large task into sub-tasks with different complexity levels
- Deciding whether to use a sub-agent or handle directly
- Optimizing API costs

## Model Tiers

### Tier 0 — No Model Needed

Pure code operations: formatting, linting, file copying, git operations, running tests.
Just do it with bash/tools. No AI call needed.

### Tier 1 — Haiku (fast, cheapest)

- Simple text transformations and formatting
- Straightforward search and replace
- Generating boilerplate from clear templates
- Summarizing short documents
- Simple Q&A from loaded context

### Tier 2 — Sonnet (default, balanced)

- Standard coding tasks (implement a function, fix a bug, write tests)
- Multi-file refactoring with clear scope
- Processing articles and extracting insights
- Planning sprint tasks
- Most development work falls here

### Tier 3 — Opus (deep thinking, expensive)

- Architecture decisions with trade-offs
- Security reviews and vulnerability analysis
- Complex multi-system design
- Resolving contradictory requirements
- When Sonnet output isn't good enough after 2 tries

## Decision Tree

```
Is this a mechanical task? -> Tier 0 (no model)
Is the answer obvious from context? -> Tier 1 (Haiku)
Is this standard development work? -> Tier 2 (Sonnet)
Does this require deep reasoning? -> Tier 3 (Opus)
```

## Routing Sub-Agents

- Research agents (gathering info, searching code) -> Haiku or Sonnet
- Implementation agents (writing code, making changes) -> Sonnet
- Review agents (security, architecture, quality) -> Sonnet or Opus
- Planning agents (sprint planning, task breakdown) -> Sonnet

## Cost Reference

| Model      | Input $/MTok | Output $/MTok | When to Use            |
| ---------- | ------------ | ------------- | ---------------------- |
| Haiku 4.5  | $0.80        | $4.00         | Simple tasks           |
| Sonnet 4.6 | $3.00        | $15.00        | 90% of dev work        |
| Opus 4.6   | $15.00       | $75.00        | Architecture, security |

**Rule of thumb:** If a task would take less than 30 seconds of "thinking," it's Haiku. If it needs careful consideration, Sonnet. If you need to reason about multiple interacting systems, Opus.
