---
globs:
  [
    "*.agent/**",
    "agents/**",
    "SOUL.md",
    "HEARTBEAT.md",
    "MEMORY.md",
    "skills/*.md",
    "BRAND.md",
  ]
description: Rules for the agent file format. Use a single AGENT_FORMAT_EXTENSION constant in code — never hardcode the extension.
---

- SOUL.md: Identity → Personality → Boundaries (in that order)
- MEMORY.md: Bootstrap section ≤ 2,000 tokens. Critical facts only. Structure with headers.
- skills/\*.md: One skill per file. Each has: trigger, steps, model tier per step, expected output format.
- HEARTBEAT.md: Cron-like. Each entry: what to check, frequency, action on anomaly.
- BRAND.md: Name rationale, symbolic connection to workflow, tagline, landing page copy.
- ui-template.yaml: Valid types: chat, dashboard, tool-picker, flow-builder, game, custom.
- Agent names are symbolic: one word that represents an element of the workflow being automated.
- When referencing the file format in code, use a single `AGENT_FORMAT_EXTENSION` constant — never hardcode the extension string.
