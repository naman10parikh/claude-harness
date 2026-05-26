# AGENTS.md — claude-harness orchestration conventions

Conventions for any agent (Claude Code, sub-agents, CI bots) working **on this repo**. This is
not user-facing product documentation — for that see `README.md` and `docs/`.

## Repo layout — what an agent needs to know

This repo has two distinct surfaces. **Never edit one when you mean the other.**

### Product payload (shipped to users — listed in `package.json` `files`)

| Dir          | Role                                                                   |
| ------------ | ---------------------------------------------------------------------- |
| `bin/`       | CLI entry: `claude-harness.js` (commands), `install.js`, `init.sh`     |
| `templates/` | CLAUDE.md template, `settings.local.json`, mission/checkpoint, memory  |
| `skills/`    | Catalog of slash-command skills the scaffolder installs                |
| `rules/`     | Context-aware rule files the scaffolder installs                       |
| `hooks/`     | Lifecycle shell scripts the scaffolder installs                        |
| `agents/`    | Sub-agent definitions the scaffolder installs                          |
| `examples/`  | Sample CLAUDE.md per project type (web-app, cli-tool, agent-project)   |
| `scripts/`   | Helper scripts (`verify.sh`, `auto-switch.sh`) the scaffolder installs |
| `docs/`      | End-user documentation for the scaffolded harness                      |

### This repo's own harness (how agents operate while developing here)

| Dir         | Role                                                                  |
| ----------- | --------------------------------------------------------------------- |
| `.claude/`  | This repo's own skills/rules/hooks/agents/commands + local settings   |
| `brain/`    | Company-brain knowledge graph (Obsidian vault): MOC + ORG notes       |
| `identity/` | Agent-format identity: SOUL, BRAND, HEARTBEAT, MEMORY                 |
| `memory/`   | Long-term memory: MEMORY.md, LEARNINGS.md, daily/, topics/, archive/  |

Other top-level: `test/` (vitest suite), `eval/` (harness evaluation discipline), `.github/`
(CI workflows), `node_modules/` (deps, gitignored).

## Working rules

- **Edit the right surface.** A fix to what users receive goes in top-level `skills/`, `rules/`,
  `hooks/`, `agents/`, `templates/`. A fix to how *you* behave here goes in `.claude/`.
- **Keep tests green.** `npm test` runs 19 tests in `test/install.test.js`. Any change to
  `bin/install.js` or the bundled payload must keep them passing.
- **Self-test the CLI.** Run `node bin/claude-harness.js --help` and, for payload changes, run
  `node bin/claude-harness.js init` against a throwaway dir to confirm the scaffold still installs.
- **Conventional commits.** `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`.
- **Public repo.** No secrets, no personal absolute paths, no internal customer names. Run
  `scrub-public.sh` (Energy tooling) before publishing if brain/memory notes ever cite internal
  paths.

## Sub-agent conventions

Sub-agents defined in `.claude/agents/` (code-reviewer, architect, research-agent, test-writer,
security-reviewer, performance-analyzer, loop-auditor) are for **research and review only** — the
parent agent implements. Sub-agents must not push commits or modify the product payload directly.

## Navigation

Hub: `brain/MOC - claude-harness.md`. Operating brief + full component map: `CLAUDE.md`.
