<h1 align="center">
  claude-harness
</h1>

<p align="center">
  <strong>Battle-tested Claude Code scaffold. Same model, 2x output.</strong>
</p>

<p align="center">
  <a href="https://github.com/naman10parikh/claude-harness/stargazers"><img src="https://img.shields.io/github/stars/naman10parikh/claude-harness?style=flat&color=yellow" alt="Stars"></a>
  <a href="https://www.npmjs.com/package/claude-harness"><img src="https://img.shields.io/npm/v/claude-harness?color=blue" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/claude-harness"><img src="https://img.shields.io/npm/dm/claude-harness?color=green" alt="Downloads"></a>
  <a href="https://github.com/naman10parikh/claude-harness/blob/main/LICENSE"><img src="https://img.shields.io/github/license/naman10parikh/claude-harness" alt="License"></a>
  <a href="https://github.com/naman10parikh/claude-harness/actions"><img src="https://img.shields.io/github/actions/workflow/status/naman10parikh/claude-harness/ci.yml?branch=main" alt="CI"></a>
  <a href="https://github.com/naman10parikh/claude-harness/pulls"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen" alt="PRs Welcome"></a>
</p>

<p align="center">
  ~1,200 lines of bash and markdown. No daemon. No server. No dependencies beyond Claude Code.<br>
  <sub>15 skills &middot; 8 hooks &middot; 3 rules &middot; 3 templates &middot; 3 example configs &middot; CI included</sub>
</p>

---

> **The thesis:** The same model with a different scaffold produces dramatically different results. Jeff Clune's [Darwin Godel Machine](https://arxiv.org/abs/2505.22954) achieved 20% to 50% on SWE-bench by improving the scaffold alone — same model, same weights. Anthropic's own harness engineering shows [10-22 point improvements](https://www.anthropic.com/engineering/swe-bench-sonnet) from scaffold changes. **The harness IS the product.**

---

## Contents

- [Quick Start](#quick-start)
- [Why This Exists](#why-this-exists)
- [What's Inside](#whats-inside)
- [How It Works](#how-it-works)
- [Before and After](#before-and-after)
- [Skills](#skills) — 15 on-demand workflows
  - [Meta (Self-Improvement)](#meta-self-improvement)
  - [Planning & Architecture](#planning--architecture)
  - [Operations](#operations)
- [Hooks](#hooks) — 6 scripts + 2 inline blockers
- [Rules](#rules) — 3 auto-loading rule files
- [Memory System](#memory-system) — Three-tier compaction survival
- [Auto-Switch](#auto-switch) — Autonomous session management
- [Project Structure](#project-structure)
- [Examples](#examples)
- [Docs](#docs)
- [The Self-Improvement Part](#the-self-improvement-part)
- [Contributing](#contributing)
- [License](#license)

---

## Quick Start

```bash
npx claude-harness init
```

Asks your project type (web app, CLI tool, agent project). Copies a tuned `.claude/` directory into your repo. **60 seconds.**

```bash
claude   # Hooks activate automatically. Context loads. Memory persists.
```

Verify your setup:

```bash
bash scripts/verify.sh
```

**Requirements:** Claude Code CLI, git, bash. macOS and Linux.

---

## Why This Exists

Claude Code users spend ~20% of every session re-establishing context. Architecture, coding standards, past debugging decisions — all lost to compaction.

**claude-harness** is 100+ sessions of those scattered improvements packaged into something anyone can install in 60 seconds.

---

## What's Inside

| Component     | Count                | What You Get                                                    |
| ------------- | -------------------- | --------------------------------------------------------------- |
| **Skills**    | 15                   | On-demand workflows (~70 tokens each at startup)                |
| **Hooks**     | 6 scripts + 2 inline | Lifecycle automation (context load, memory flush, quality gate) |
| **Rules**     | 3                    | Auto-loading context for TypeScript, code quality, docs         |
| **Templates** | 3                    | CLAUDE.md, MEMORY.md, LEARNINGS.md starting points              |
| **Scripts**   | 2                    | Setup verification + autonomous session management              |
| **Examples**  | 3                    | Per-project-type configs (web app, CLI, agent)                  |

---

## How It Works

### The Core Loop

```
Session starts ──► SessionStart hook injects context, memory, learnings, git status
       │
       ▼
   You work ──► Rules auto-load when you edit matching files (.ts → TypeScript rules)
       │
       ▼
 Context fills ──► PreCompact hook saves anchor state + backup to disk
       │
       ▼
After compaction ──► PostCompact hook re-injects what was saved
       │
       ▼
 Session ends ──► SessionEnd hook writes summary; Stop hook warns about uncommitted work
       │
       ▼
 Next session ──► SessionStart reads yesterday's summary. Continuity without effort.
```

### The Feature That Changed Everything

The pre-compact memory flush. Claude Code fires a `PreCompact` hook right before compressing your context. A 30-line bash script running at that exact moment saves whatever you need to disk:

```bash
#!/bin/bash
set -euo pipefail
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
DAILY_FILE="$PROJECT_DIR/memory/daily/$(date '+%Y-%m-%d').md"
mkdir -p "$(dirname "$DAILY_FILE")"

echo "### $(date '+%H:%M') -- Pre-compaction flush" >> "$DAILY_FILE"
cat > "$PROJECT_DIR/.claude/anchor-state.md" << EOF
Active task: $(cat "$PROJECT_DIR/.claude/current-task.md" 2>/dev/null || echo "none")
Recent files: $(git -C "$PROJECT_DIR" diff --name-only HEAD~3 2>/dev/null | head -10)
EOF
```

Then `SessionStart` reads `anchor-state.md` back in after compaction. Context survives what would otherwise be permanent amnesia.

---

## Before and After

|                         | Before (Raw Claude Code)                        | After (With Harness)                          |
| ----------------------- | ----------------------------------------------- | --------------------------------------------- |
| **Monday morning**      | Re-explain architecture, standards, recent work | Session loads everything automatically        |
| **After compaction**    | Lost context, re-debug solved issues            | Memory flushed pre-compaction, restored after |
| **Same bug twice**      | Fix it again from scratch                       | LEARNINGS.md consulted first — fix referenced |
| **Forgot to commit**    | Discover at 2am, scramble                       | Stop hook warns before exit                   |
| **rm -rf accident**     | Panic                                           | PreToolUse hook blocks it                     |
| **New team member**     | 2-hour onboarding walkthrough                   | Clone repo, context loads automatically       |
| **Context degradation** | Session quality silently drops                  | Monitor warns, auto-switch restarts fresh     |

---

## Skills

15 on-demand workflows. Each is a markdown file with trigger conditions and step-by-step instructions. Claude reads them when needed (~70 tokens of metadata at startup).

### Meta (Self-Improvement)

| Skill                                               | What It Does                                             |
| --------------------------------------------------- | -------------------------------------------------------- |
| [`/self-improve`](skills/self-improve/SKILL.md)     | Analyze past sessions for patterns, auto-update harness  |
| [`/deep-think`](skills/deep-think/SKILL.md)         | Socratic questioning, self-critique, adversarial debate  |
| [`/skill-creator`](skills/skill-creator/SKILL.md)   | Auto-generate new skills from discovered patterns        |
| [`/harness-review`](skills/harness-review/SKILL.md) | Audit scaffold for quality and token efficiency          |
| [`/skill-routing`](skills/skill-routing/SKILL.md)   | Progressive disclosure architecture for large skill sets |

### Planning & Architecture

| Skill                                             | What It Does                                             |
| ------------------------------------------------- | -------------------------------------------------------- |
| [`/architect`](skills/architect/SKILL.md)         | Structured trade-off analysis for architecture decisions |
| [`/sprint`](skills/sprint/SKILL.md)               | Break goals into 2-hour chunks with dependency mapping   |
| [`/model-routing`](skills/model-routing/SKILL.md) | Auto-select the right model tier for each task           |

### Operations

| Skill                                                         | What It Does                                 |
| ------------------------------------------------------------- | -------------------------------------------- |
| [`/troubleshoot`](skills/troubleshoot/SKILL.md)               | 6-level error recovery ladder                |
| [`/validate`](skills/validate/SKILL.md)                       | Check harness setup is internally consistent |
| [`/recover`](skills/recover/SKILL.md)                         | Recovery protocol when things go wrong       |
| [`/handoff`](skills/handoff/SKILL.md)                         | Write session continuity document            |
| [`/memory-compression`](skills/memory-compression/SKILL.md)   | Memory management across compactions         |
| [`/integrate-resources`](skills/integrate-resources/SKILL.md) | Process new resources and extract insights   |
| [`/loop-integration`](skills/loop-integration/SKILL.md)       | Session-scoped cron jobs for monitoring      |

---

## Hooks

6 lifecycle scripts + 2 inline blockers. Configured in `.claude/settings.local.json`.

| Hook                                                               | Event                  | What It Does                                                     |
| ------------------------------------------------------------------ | ---------------------- | ---------------------------------------------------------------- |
| [`session-start-context.sh`](hooks/session-start-context.sh)       | SessionStart           | Loads CLAUDE.md, memory, learnings, git status, skills inventory |
| [`context-monitor.sh`](hooks/context-monitor.sh)                   | SessionStart           | Health checks: stale plans, memory bloat, uncommitted work       |
| [`pre-compact-memory-flush.sh`](hooks/pre-compact-memory-flush.sh) | PreCompact             | Saves anchor state + backup before context compression           |
| [`post-compact-restore.sh`](hooks/post-compact-restore.sh)         | SessionStart (compact) | Re-injects context after auto-compaction                         |
| [`stop-verify.sh`](hooks/stop-verify.sh)                           | Stop                   | Quality gate: warns about uncommitted work                       |
| [`session-end-log.sh`](hooks/session-end-log.sh)                   | SessionEnd             | Logs session summary to daily memory                             |

**Inline hooks** (no script file, configured in settings.local.json):

- **Destructive Command Blocker** `PreToolUse: Bash` — blocks `rm -rf /`, `sudo rm -rf`, `dd if=/dev`, etc.
- **Protected File Blocker** `PreToolUse: Write|Edit` — prevents accidental edits to lockfiles and `.env`

---

## Rules

3 auto-loading rule files. Claude loads the relevant rule when you edit matching file types.

| Rule                                       | Glob Pattern                     | What It Enforces                                          |
| ------------------------------------------ | -------------------------------- | --------------------------------------------------------- |
| [`typescript.md`](rules/typescript.md)     | `*.ts`, `*.tsx`                  | Strict TS, no `any`, Zod at boundaries, Result pattern    |
| [`code-quality.md`](rules/code-quality.md) | `*.ts`, `*.tsx`, `*.js`, `*.jsx` | Functional components, Tailwind, accessibility, dark mode |
| [`docs.md`](rules/docs.md)                 | `*.md`, `docs/**/*.md`           | Never remove content, concrete examples, evidence-backed  |

---

## Memory System

Three-tier architecture that survives compaction.

```
Tier 1: Bootstrap (always loaded)
├── CLAUDE.md              Project config and operating instructions
└── memory/MEMORY.md       Curated long-term decisions (cap: 500 lines)

Tier 2: On-Demand (loaded when needed)
├── .claude/skills/        Workflows loaded by trigger
└── .claude/rules/         Context loaded by file pattern

Tier 3: Recovery (loaded after compaction)
├── .claude/anchor-state.md     What you were doing pre-compaction
├── .claude/backups/            Full snapshots
├── memory/daily/{date}.md      Session journals
└── memory/LEARNINGS.md         Append-only error patterns
```

Each compaction retains only 20-30% of detail. After 2 compactions, you're working with 4-9% of the original. The memory system ensures critical state always survives.

See [docs/MEMORY-SYSTEM.md](docs/MEMORY-SYSTEM.md) for the full architecture.

---

## Auto-Switch

`scripts/auto-switch.sh` wraps Claude Code in a session loop. When context degrades, it captures state and starts a fresh session with full context injection.

```bash
# Interactive mode (daytime)
./scripts/auto-switch.sh

# Autonomous overnight mode
./scripts/auto-switch.sh --overnight

# Background execution
tmux new-session -d -s work './scripts/auto-switch.sh --overnight'
```

Handles: context degradation (immediate restart), rate limits (60-min wait), crashes (30s retry), normal exit (stop). Max 20 sessions per loop.

See [docs/AUTO-SWITCH.md](docs/AUTO-SWITCH.md) for details.

---

## Project Structure

```
claude-harness/
├── skills/                 # 15 on-demand workflows
│   ├── self-improve/           Analyze sessions, auto-update harness
│   ├── deep-think/             Socratic questioning for hard decisions
│   ├── architect/              Trade-off analysis, second-order effects
│   ├── sprint/                 Break goals into 2-hour focused chunks
│   ├── troubleshoot/           6-level error recovery chain
│   ├── memory-compression/     Manage memory across compactions
│   ├── skill-creator/          Auto-generate new skills from patterns
│   ├── harness-review/         Audit scaffold for efficiency
│   ├── model-routing/          Route tasks to right model tier
│   ├── integrate-resources/    Process new docs into knowledge
│   ├── skill-routing/          Progressive disclosure architecture
│   ├── loop-integration/       Scheduled recurring tasks
│   ├── validate/               Verify setup consistency
│   ├── recover/                Rollback protocol when things break
│   └── handoff/                Session continuity documents
├── hooks/                  # 6 lifecycle scripts
│   ├── session-start-context.sh
│   ├── context-monitor.sh
│   ├── pre-compact-memory-flush.sh
│   ├── post-compact-restore.sh
│   ├── stop-verify.sh
│   └── session-end-log.sh
├── rules/                  # 3 auto-loading rule files
│   ├── typescript.md
│   ├── code-quality.md
│   └── docs.md
├── templates/              # Drop-in config files
│   ├── CLAUDE.md.template
│   ├── settings.local.json
│   └── memory/
│       ├── MEMORY.md.template
│       └── LEARNINGS.md.template
├── scripts/
│   ├── auto-switch.sh          Session loop with auto-restart
│   └── verify.sh               Setup verification
├── examples/               # Per-project-type configs
│   ├── web-app/
│   ├── cli-tool/
│   └── agent-project/
├── docs/
│   ├── HOOKS.md
│   ├── SKILLS.md
│   ├── MEMORY-SYSTEM.md
│   └── AUTO-SWITCH.md
├── bin/
│   └── init.sh                 Interactive installer
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── SECURITY.md
├── LICENSE                     MIT
└── package.json
```

---

## Examples

Three starter configs included:

| Example                                     | Stack                                                | Best For                       |
| ------------------------------------------- | ---------------------------------------------------- | ------------------------------ |
| [`web-app/`](examples/web-app/)             | Next.js, React, Tailwind, shadcn/ui, Supabase, Clerk | Full-stack web applications    |
| [`cli-tool/`](examples/cli-tool/)           | Node.js CLI, commander.js, Zod, zero-config          | Command-line tools and scripts |
| [`agent-project/`](examples/agent-project/) | Claude Agent SDK, structured tool calling, SOUL.md   | AI agent development           |

The installer asks your project type and copies the matching example as your `CLAUDE.md`.

---

## Docs

| Document                                  | What It Covers                                                     |
| ----------------------------------------- | ------------------------------------------------------------------ |
| [HOOKS.md](docs/HOOKS.md)                 | Hook system, lifecycle events, environment variables, custom hooks |
| [SKILLS.md](docs/SKILLS.md)               | Skill catalog, how skills work, creating new skills                |
| [MEMORY-SYSTEM.md](docs/MEMORY-SYSTEM.md) | Three-tier memory, compaction survival, file formats               |
| [AUTO-SWITCH.md](docs/AUTO-SWITCH.md)     | Autonomous session management, exit detection, continuity          |

---

## The Self-Improvement Part

The `/self-improve` skill reads your past session logs and finds patterns:

1. **Questions Claude asks repeatedly** — adds the answer to CLAUDE.md
2. **Rules Claude forgets mid-session** — adds to `.claude/rules/`
3. **Information Claude keeps re-discovering** — promotes to bootstrap memory
4. **Backtracking patterns** — creates a skill that prevents them

Each improvement is small. But they compound. After 10 sessions, your scaffold knows your project's quirks. After 50 sessions, new team members inherit all that institutional knowledge just by cloning the repo.

**The harness improves itself.** That's the whole thesis.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines. We welcome:

- **New skills** — reusable workflows
- **New hooks** — lifecycle automation
- **Bug fixes** — especially cross-platform (macOS + Linux)
- **Better docs** — examples, explanations, tutorials
- **Example configs** — project-type-specific setups

---

## License

[MIT](LICENSE) — use it however you want.

---

<p align="center">
  <sub>Built from 100+ sessions of using Claude Code every day. Powered by <a href="https://github.com/naman10parikh">Energy</a>.</sub>
</p>
