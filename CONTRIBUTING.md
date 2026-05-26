# Contributing to claude-harness

We welcome contributions from anyone who wants to improve their Claude Code workflow.

## What to Contribute

- **New skills** — reusable workflows that save time (see `skills/` for examples)
- **New hooks** — lifecycle automation (see `hooks/` for examples)
- **Bug fixes** — especially cross-platform compatibility (macOS + Linux)
- **Documentation** — better examples, clearer explanations
- **Example configs** — project-type-specific setups (add to `examples/`)

## How to Contribute

1. Fork the repo
2. Create a feature branch (`git checkout -b add-my-skill`)
3. Make your changes
4. Test on both macOS and Linux if possible
5. Submit a PR with a clear description

## Adding a Skill

Create `skills/{skill-name}/SKILL.md` with this structure:

```markdown
---
name: skill-name
description: One-line description (under 100 chars)
---

## When to Use

- Trigger condition 1
- Trigger condition 2

## Process

### Step 1: Action

What to do.

### Step 2: Action

What to do.
```

Keep descriptions short — Claude Code loads them at startup (~70 tokens each).

## Adding a Hook

1. Create script in `hooks/` (bash-compatible, no zsh-isms)
2. Use `$PROJECT_DIR` for paths (set by init.sh)
3. Document in `docs/HOOKS.md`
4. Add to `templates/settings.local.json`

## Code Style

- Bash scripts: `set -euo pipefail`, quote variables, no bashisms beyond bash 4
- Markdown: no trailing whitespace, one blank line between sections
- No hardcoded paths — use `$PROJECT_DIR` and `$CLAUDE_DIR`

## Reporting Issues

Open a GitHub issue with:

- Your OS (macOS version, Linux distro)
- Claude Code version
- What you expected vs what happened
- Relevant hook/skill output
