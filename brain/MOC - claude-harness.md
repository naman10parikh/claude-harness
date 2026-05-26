---
type: moc
status: active
created: 2026-05-25
updated: 2026-05-25
tags: [claude-harness, moc]
source: brain/MOC - claude-harness.md
related: ["[[ORG_CONTEXT]]", "[[ORG_MEMORY]]"]
---

# MOC — claude-harness

Master hub for this repo's brain. `claude-harness` is a **CLI scaffolder** that installs a
battle-tested Claude Code harness into any project — the harness is the product. This map links
every doc and names every top-level folder so nothing is an orphan.

## Company Brain

- [[ORG_CONTEXT]] — what this scaffolder is and the context every agent reads first
- [[ORG_MEMORY]] — what the fleet has learned building and shipping it

## Spine docs (root)

- [`CLAUDE.md`](../CLAUDE.md) — agent operating brief + harness-component map + the two-harness distinction
- [`CONTEXT.md`](../CONTEXT.md) — current state, what's next, deeper-doc pointers
- [`QUICKSTART.md`](../QUICKSTART.md) — install + build/run commands, inline
- [`README.md`](../README.md) — human/OSS front door
- [`AGENTS.md`](../AGENTS.md) — this repo's agent-orchestration conventions

## Non-spine root docs

- [`CONTRIBUTING.md`](../CONTRIBUTING.md) — how to contribute
- [`CODE_OF_CONDUCT.md`](../CODE_OF_CONDUCT.md) — community standards
- [`SECURITY.md`](../SECURITY.md) — vulnerability disclosure
- [`LICENSE`](../LICENSE) — MIT

## Architecture / product

- [[Product - Scaffolder Architecture]] — how `init`/`verify` work, tiers, payload formula
- The product payload (shipped, in `package.json` `files`): `bin/`, `templates/`, `skills/`,
  `rules/`, `hooks/`, `agents/`, `examples/`, `scripts/`, `docs/`
- This repo's own harness: `.claude/`, `brain/`, `identity/`, `memory/`

## Operations — end-user docs (`docs/`)

- [[Docs - Getting Started]] → [`docs/getting-started.md`](../docs/getting-started.md)
- [[Docs - Skills]] → [`docs/skills-guide.md`](../docs/skills-guide.md) + [`docs/SKILLS.md`](../docs/SKILLS.md)
- [[Docs - Hooks]] → [`docs/hooks-guide.md`](../docs/hooks-guide.md) + [`docs/HOOKS.md`](../docs/HOOKS.md)
- [[Docs - Memory System]] → [`docs/MEMORY-SYSTEM.md`](../docs/MEMORY-SYSTEM.md)
- [[Docs - Auto-Switch]] → [`docs/AUTO-SWITCH.md`](../docs/AUTO-SWITCH.md)

## Identity (`identity/`)

- [`identity/SOUL.md`](../identity/SOUL.md), [`identity/BRAND.md`](../identity/BRAND.md),
  [`identity/HEARTBEAT.md`](../identity/HEARTBEAT.md), [`identity/MEMORY.md`](../identity/MEMORY.md)

## Memory (`memory/`)

- [`memory/MEMORY.md`](../memory/MEMORY.md) — long-term memory index
- [`memory/LEARNINGS.md`](../memory/LEARNINGS.md) — append-only error→rule log
- `memory/daily/`, `memory/topics/`, `memory/archive/` — session logs, deep-dives, compressed history

## Decisions

- See [[ORG_MEMORY]] for recorded decisions and patterns.

## Top-level folder index (every folder named)

| Folder         | Surface         | What it is                                                |
| -------------- | --------------- | --------------------------------------------------------- |
| `bin/`         | product payload | CLI entry (`claude-harness.js`, `install.js`, `init.sh`)  |
| `templates/`   | product payload | CLAUDE.md template, settings, memory templates            |
| `skills/`      | product payload | skill catalog the scaffolder installs                     |
| `rules/`       | product payload | rule files the scaffolder installs                        |
| `hooks/`       | product payload | lifecycle hooks the scaffolder installs                   |
| `agents/`      | product payload | sub-agent definitions the scaffolder installs             |
| `examples/`    | product payload | sample CLAUDE.md per project type                         |
| `scripts/`     | product payload | helper scripts (`verify.sh`, `auto-switch.sh`)            |
| `docs/`        | product payload | end-user documentation                                    |
| `.claude/`     | repo's harness  | this repo's own skills/rules/hooks/agents/commands        |
| `brain/`       | repo's harness  | this knowledge graph (Obsidian vault)                     |
| `identity/`    | repo's harness  | agent-format identity files                               |
| `memory/`      | repo's harness  | long-term memory + learnings                              |
| `test/`        | dev             | vitest suite (`install.test.js`, 19 tests)                |
| `eval/`        | dev             | harness evaluation discipline                             |
| `.github/`     | dev             | CI workflows                                              |
| `node_modules/`| dev             | dependencies (gitignored)                                 |
