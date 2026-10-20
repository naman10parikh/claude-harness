# AGENTS.md: Claude Harness

> The one set of instructions for every coding agent (Codex, Cursor, OpenCode, Copilot, Claude Code,
> Gemini CLI) and for people. `CLAUDE.md` and `GEMINI.md` import this file. The brain hub is
> [`brain/MOC - claude-harness.md`](./brain/MOC%20-%20claude-harness.md).

## What it does

`claude-harness` copies a tested Claude Code setup into any project: skills, lifecycle hooks (context
at session start, a memory flush before compaction, a check before stopping), rules, sub-agents,
settings and a `memory/` folder. It comes in three tiers: `starter` (2 skills, 2 hooks), `pro` (5
skills, 4 hooks, memory) and `expert` (everything). The idea behind it: the same model does better
work inside a better harness, so the harness is the product.

## Two surfaces: never edit one when you mean the other

| Surface | Paths | Who it is for |
| --- | --- | --- |
| **The payload** (listed in `package.json` `files`) | `bin/ templates/ skills/ rules/ hooks/ agents/ examples/ scripts/ docs/` | Copied into other people's projects by `init` |
| **This repository's own harness** | `.claude/ brain/ identity/ memory/` | How agents behave while developing claude-harness |

A change to top-level `skills/` changes what every user receives; a change to `.claude/skills/`
changes how you behave here. When in doubt, check `package.json` `files`.

## Its tools and how to call them

**Command line.** Run `npx -y -p github:naman10parikh/claude-harness claude-harness <command>` for
the latest code. `npx claude-harness` runs the npm release 1.0.0 (March 2026), which is older.

| Command | What it does |
| --- | --- |
| `init [dir] [--name n] [--language l] [--tier t] [--type p] [--force]` | Install the harness. With all four flags it asks nothing; any flag left out is asked for. Without a terminal it will not overwrite an existing harness unless `--force`. |
| `verify` | Check an installed harness (runs `scripts/verify.sh` when present). |
| `sandbox-run [--tier t]` | Install the harness inside a fresh E2B microVM and confirm it worked. Needs `E2B_API_KEY`. |
| `memory-search <query...> [--limit n]` | BM25 search over this repository's own notes (brain/, docs/, memory/, identity/). |
| `--help`, `--version` | Help and version. |

Values: `--language typescript|python|general`, `--tier starter|pro|expert`,
`--type web-app|cli-tool|agent-project`. Every install, search and sandbox run appends a line to
`logs/runs.jsonl` (or to `CLAUDE_HARNESS_RUNS_FILE`).

**MCP server.** `npx -y -p github:naman10parikh/claude-harness claude-harness-mcp` speaks JSON-RPC
over stdio.

| Tool | What it does |
| --- | --- |
| `list_tiers` | The three tiers and what each installs. |
| `scaffold_plan` | Preview an install: runs the real installer into a throwaway folder and reports the counts (`tier`, `language`, `projectType`). |
| `memory_search` | BM25 search over this repository's own notes (`query`, optional `limit`). |

**Skills.** 18 in [`skills/`](skills/): 15 general harness skills (self-improve, deep-think,
architect, troubleshoot, validate and more) and 3 written for the harness itself:
`install-harness`, `debug-harness-hooks` and `upgrade-harness`.

**Sub-agents.** In `.claude/agents/`: `harness-auditor` (audits an installed harness: what fires, what
is broken, what it costs at session start) and `payload-reviewer` (reviews a payload change before it
ships), plus a general toolkit: `architect`, `code-reviewer`, `loop-auditor`, `performance-analyzer`,
`research-agent`, `security-reviewer`, `test-writer`. The payload's own copies of the general seven
live in `agents/`. They read and report; the parent edits.

## Where things live

| Path | What lives here |
| --- | --- |
| `bin/claude-harness.js`, `bin/install.js`, `bin/init.sh` | The CLI, the installer (tiers, copy logic, settings) and the bash installer CI runs. |
| `mcp-server.mjs` | The MCP server. |
| `lib/` | Memory search, the run log, the E2B sandbox runner, a small `.env` loader. |
| `skills/`, `hooks/`, `rules/`, `agents/`, `templates/`, `examples/`, `scripts/`, `docs/` | The payload. `hooks/hooks.json` wires the plugin's session-start hook. |
| `test/`, `eval/` | 19 unit tests and 22 golden tasks (L1 payload invariants, L2 live scaffolds, L3 surfaces). |
| `identity/`, `memory/`, `brain/` | SOUL, BRAND, HEARTBEAT and MEMORY; long-term memory and append-only LEARNINGS; the Obsidian brain. |
| `.claude/` | This repository's own harness: rules, skills, hooks, agents, settings. |
| `.claude-plugin/`, `gemini-extension.json`, `.well-known/agent-card.json` | Claude Code plugin (named `harness`), Gemini CLI extension, A2A agent card. |
| `dsip.json`, `scripts/improve.mjs`, `.github/workflows/` | The self-improvement contract, its loop, CI (structure, leaks, tests, golden tasks) and the daily loop. |

## Build, test, run

```bash
pnpm install          # Node >= 18; no build step
pnpm test             # 19 unit tests of the installer
pnpm run eval         # 22 golden tasks
pnpm improve          # the self-improvement loop; writes logs/improve/latest.md
node bin/claude-harness.js init /tmp/try --name try --language general --tier starter --type cli-tool
```

Never claim a change works until `pnpm test` and `pnpm run eval` are green and you have installed the
changed tier into a scratch folder and read what it wrote.

## Editing rules

- **Counts move together.** A new skill, hook or rule in the payload changes the counts in
  `test/install.test.js`, `eval/golden-tasks.json`, `.github/workflows/ci.yml`, `docs/` and the README.
- **Hooks are portable.** Start with `#!/bin/bash`, use `$CLAUDE_PROJECT_DIR`, and guard `git` and
  `find` pipelines with `|| true`: hooks run under `set -euo pipefail` in folders you do not control.
- **No leaks in the payload.** No secrets, home-folder paths, internal project names or personal
  email. CI's leak check scans the payload folders on every push.
- **Additive.** Never delete a user's files; `init` writes CLAUDE.md and memory files only when they
  are missing (or with `--force`).

## Commit grammar

```
feat(skill):    a new or changed capability
feat(employee): an agent-role or persona change
feat(company):  a repository-wide structural change
fix: / docs: / refactor: / test: / chore:  conventional commits
```

## Memory and brain

- A new durable decision: one line in [memory/MEMORY.md](./memory/MEMORY.md) under the right header.
- An error fixed: a root-cause entry in [memory/LEARNINGS.md](./memory/LEARNINGS.md), ending in a rule.
- Anything worth finding later: link it from the [MOC](./brain/MOC%20-%20claude-harness.md).

## What not to do

- Never edit the payload when you mean `.claude/`, or the reverse.
- Never print, log or commit `E2B_API_KEY` or any other key.
- Never let a hook block a user's session for a reason it does not print.
- Never ship a count, tier or file list in the docs that the installer does not produce.
