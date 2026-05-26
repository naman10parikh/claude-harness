---
name: integrate-resources
description: Process new resources in resources/unread/. Extract tips, tools, patterns and update setup, skills, hooks.
---

## When to Use

When new articles, guides, or references are dropped into `resources/unread/`.

## Process

1. List all files in `resources/unread/`
2. For each file:
   a. Read the full content
   b. Extract:
   - Claude Code tips and optimization techniques
   - New tools, plugins, extensions, MCP servers
   - Hook configurations
   - Slash commands and skill patterns
   - Workflow patterns and best practices
     c. Categorize findings by type
3. Update the relevant files:
   - `CLAUDE.md` — add new tips or patterns
   - `.claude/settings.local.json` — add new hooks if applicable
   - `.claude/skills/` — create new skill files if patterns warrant
   - `.claude/rules/` — add new rules if patterns warrant
4. Move processed files to `resources/read/` with date prefix: `YYYY-MM-DD_originalname`
5. Summarize what was extracted and where it was integrated

## Rules

- Never remove existing content — only enhance
- If a tip contradicts existing guidance, flag it for human review
- Prefer concrete, actionable configurations over vague advice
- Always include source attribution
- Test any new hook or setting configurations for correctness
