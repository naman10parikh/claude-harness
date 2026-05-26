---
name: skill-routing
description: How skills scale without bloating context. Progressive disclosure architecture for large skill libraries.
---

## Three-Level Loading

1. **Level 1 (startup):** Only YAML frontmatter loaded (~70-100 tokens per skill). Claude sees name + description.
2. **Level 2 (on-demand):** Full SKILL.md content loaded when Claude determines the skill is relevant.
3. **Level 3 (supporting files):** Additional files loaded only when the skill explicitly references them.

## Rules for Progressive Disclosure

- `.claude/rules/` files use **glob patterns** — loaded ONLY when matching files are touched.
- Example: `typescript.md` with `globs: ["*.ts", "*.tsx"]` only loads when editing TypeScript.
- This means you can have 100 rules and Claude only sees the 2-3 relevant ones.

## MCP Tool Search

When MCP servers exceed ~10% of context:

- Enable: `ENABLE_TOOL_SEARCH=auto:5` (5% threshold)
- Effect: Tool schemas loaded on demand instead of upfront
- Supported on Sonnet 4+, Opus 4+

## Skill Organization Pattern

```
.claude/skills/
├── architect/SKILL.md       # System design (loaded when planning)
├── sprint/SKILL.md          # Sprint planning (loaded when planning work)
├── deep-think/SKILL.md      # Reasoning (loaded for complex problems)
├── self-improve/SKILL.md    # Meta-improvement (loaded for optimization)
├── troubleshoot/SKILL.md    # Error recovery (loaded on errors)
└── skill-routing/SKILL.md   # THIS FILE (loaded when discussing skills)
```

## Key Principle

CLAUDE.md stays under 2K tokens. Skills are the overflow valve — anything too detailed for CLAUDE.md becomes a skill. Claude discovers skills by name/description and loads them when needed. 50 skills at ~70 tokens each = 3,500 tokens of metadata while actual content (100K+ tokens) loads only on demand.

## When to Create a New Skill vs. Rule vs. Hook

- **Skill:** Reusable workflow invoked by name. Example: `/architect` for system design.
- **Rule:** Context-specific instructions activated by file pattern. Example: "When editing \*.test.ts, always use Vitest."
- **Hook:** Automated action on lifecycle event. Example: format code after write.
