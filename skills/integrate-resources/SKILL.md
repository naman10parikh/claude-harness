---
name: integrate-resources
description: Process new resources dropped into resources/unread/. Extracts Claude Code tips, tools, patterns and updates the setup guide, skills, hooks, and knowledge catalog.
---

## Trigger

User says something like "new resources to integrate" or "process unread resources"

## Process

1. List all files in `resources/unread/`
2. For each file:
   a. Read the full content
   b. Extract:
   - Claude Code tips and optimization techniques
   - New tools, plugins, extensions, MCP servers
   - Hooks configurations
   - Slash commands and skill patterns
   - Workflow patterns and best practices
   - Self-improving / open-ended patterns
     c. Categorize findings by type
3. Update the relevant files:
   - `docs/guides/SETUP.md` — add new tips, tools, configurations
   - `.claude/settings.local.json` — add new hooks if applicable
   - `.claude/skills/` — create new skill files if patterns warrant it
   - `.claude/rules/` — add new rules if patterns warrant it
   - `.claude/commands/` — add new commands if patterns warrant it
   - `resources/README.md` — update the catalog with new entries
4. Move processed files to `resources/read/` with date prefix: `YYYY-MM-DD_originalname`
5. Summarize what was extracted and where it was integrated

## Rules

- Never remove existing content — only enhance
- If a tip contradicts existing guidance, flag it for human review
- Prefer concrete, actionable configurations over vague advice
- Always include source attribution in the catalog
- Test any new hook or setting configurations for correctness
