# Skill Catalog

Skills are reusable workflows that Claude loads on demand. Only ~70 tokens of metadata per skill are loaded at startup.

## Included Skills (15)

### Meta (Self-Improvement)

| Skill             | Description                                                       |
| ----------------- | ----------------------------------------------------------------- |
| `/self-improve`   | Analyze past sessions for patterns, update harness automatically  |
| `/deep-think`     | Multi-modal thinking: Socratic, self-critique, adversarial debate |
| `/skill-creator`  | Auto-generate new skills from discovered patterns                 |
| `/harness-review` | Audit a harness for quality, token efficiency, correctness        |
| `/skill-routing`  | How skills scale: progressive disclosure architecture             |

### Planning & Architecture

| Skill            | Description                                              |
| ---------------- | -------------------------------------------------------- |
| `/architect`     | Structured trade-off analysis for architecture decisions |
| `/sprint`        | Break goals into 2-hour chunks with dependency mapping   |
| `/model-routing` | Auto-select the right model tier for each task           |

### Operations

| Skill                  | Description                                     |
| ---------------------- | ----------------------------------------------- |
| `/troubleshoot`        | Multi-layer error recovery ladder (6 levels)    |
| `/validate`            | Check harness setup is internally consistent    |
| `/recover`             | Recovery protocol when things go wrong          |
| `/handoff`             | Write session continuity document               |
| `/memory-compression`  | Production memory management across compactions |
| `/integrate-resources` | Process new resources and extract insights      |
| `/loop-integration`    | Session-scoped cron jobs for monitoring         |

## How Skills Work

1. **Startup:** Claude sees skill names + descriptions (~70 tokens each)
2. **Matching:** When your prompt matches a skill's trigger, Claude loads the full content
3. **Execution:** Claude follows the skill's step-by-step process

## Creating New Skills

```
.claude/skills/{skill-name}/SKILL.md
```

Template:

```markdown
---
name: skill-name
description: One-line description (under 100 chars)
---

## When to Use

- Trigger condition

## Process

### Step 1: Action

What to do.
```

Keep descriptions short — they're always in memory. Put detail in the process section.

## Skill vs Rule vs Hook

- **Skill:** Multi-step workflow, invoked by name or auto-matched
- **Rule:** Context loaded when matching files are edited (glob patterns)
- **Hook:** Shell script triggered by lifecycle events (automatic)
