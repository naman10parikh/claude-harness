# claude-harness — Agent Operating Brief

## What this repo is

`claude-harness` is a **CLI scaffolder**. It installs a battle-tested Claude Code harness
(`.claude/` hooks + skills + rules + sub-agents, plus a `memory/` system) into any project so
that the same model produces roughly 2x the useful output. The product is the scaffold itself:
"the harness is the product." The published artifact is the npm package `claude-harness` whose
`bin/claude-harness.js` runs `init` (interactive scaffold) and `verify` (setup check).

## CRITICAL — two harnesses live in this repo. Keep them separate.

This repo plays two roles at once. Do not conflate them.

1. **The PRODUCT: bundled scaffolder templates** (top-level, shipped in npm `files`).
   These are the *payload* the scaffolder copies into other people's projects. They are
   intentionally at the repo root and are NOT this repo's own operating config.
   - `bin/` — the CLI entry (`claude-harness.js`, `install.js`, `init.sh`)
   - `templates/` — CLAUDE.md template, settings, checkpoint/mission templates, memory templates
   - `skills/` — the catalog of slash-command skills the scaffolder installs
   - `rules/` — the context-aware rule files the scaffolder installs
   - `hooks/` — the lifecycle shell scripts the scaffolder installs
   - `agents/` — the sub-agent definitions the scaffolder installs
   - `examples/` — sample CLAUDE.md files per project type (web-app, cli-tool, agent-project)
   - `scripts/` — helper scripts (`verify.sh`, `auto-switch.sh`) the scaffolder installs
   - `docs/` — end-user documentation for the scaffolded harness

2. **This repo's OWN harness** (how Claude operates *when working on this repo*).
   These configure the agent editing claude-harness itself. Treat THESE as the operating config.
   - `.claude/` — this repo's own skills/rules/hooks/agents/commands for development here
   - `brain/` — this repo's company-brain knowledge graph (Obsidian vault; MOC + ORG notes)
   - `identity/` — this repo's agent-format identity files (SOUL, BRAND, HEARTBEAT, MEMORY)
   - `memory/` — this repo's long-term memory (MEMORY.md, LEARNINGS.md, daily/topics/archive)

Rule of thumb: if a path is listed in `package.json` `files`, it is **product payload**
(role 1). If it is `.claude/`, `brain/`, `identity/`, or `memory/`, it is **this repo's own
harness** (role 2). A change to a top-level `skills/` file changes what users get; a change to
`.claude/skills/` changes how you behave while developing here.

## Harness components (the scaffolder's payload formula)

What `claude-harness init` installs into a target project (tiers: starter / pro / expert):

| Component         | Source dir (this repo) | Installs to (target)        |
| ----------------- | ---------------------- | --------------------------- |
| Skills            | `skills/`              | `.claude/skills/`           |
| Hooks             | `hooks/`               | `.claude/hooks/`            |
| Rules             | `rules/`               | `.claude/rules/`            |
| Sub-agents        | `agents/`              | `.claude/agents/`           |
| Settings          | `templates/`           | `.claude/settings.local.json` |
| Memory            | `templates/memory/`    | `memory/`                   |
| Helper scripts    | `scripts/`             | `scripts/`                  |
| CLAUDE.md starter | `templates/` + `examples/` | `CLAUDE.md`             |

## How you operate (when developing this repo)

You are a co-founder, not an assistant. Act with full autonomy. Only escalate for API keys or
business decisions. Test as a USER (run the CLI, don't just compile it).

## Rules

- No `any` in JavaScript/TypeScript. Strict mode where applicable.
- Files under 400 lines.
- Conventional commits (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`).
- Public repo: never commit secrets, personal paths, or internal customer names.

## Build / test / verify

```bash
npm install                      # install deps (commander, @inquirer/prompts, vitest)
npm test                         # vitest run — 19 tests in test/install.test.js
npm run self-test                # node bin/claude-harness.js --help (smoke test the CLI)
node bin/claude-harness.js init  # dogfood: run the scaffolder interactively
```

## Skills, sub-agents, error protocol (this repo's own harness)

- **Skills:** `.claude/skills/` — on-demand, ~70 tokens each. Key: `/deep-think`, `/architect`,
  `/troubleshoot`, `/self-improve`.
- **Sub-agents:** `.claude/agents/` — code-reviewer, architect, research-agent, test-writer,
  security-reviewer, performance-analyzer, loop-auditor.
- **Error protocol:** never retry the same approach 3x. After every error ask: what broke? root
  cause? rule to prevent recurrence? → append to `memory/LEARNINGS.md`.

## Navigation

The knowledge graph hub is [`brain/MOC - claude-harness.md`](brain/MOC%20-%20claude-harness.md).
Current state and next steps live in [`CONTEXT.md`](CONTEXT.md). The human/OSS front door is
[`README.md`](README.md). Agent-orchestration conventions for this repo are in
[`AGENTS.md`](AGENTS.md).
