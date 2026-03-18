# claude-harness

**Same model scores 42% with one harness, 78% with another. This is the 78% harness.**

```bash
curl -fsSL https://raw.githubusercontent.com/naman10parikh/claude-harness/main/install.sh | bash
```

claude-harness is a production-grade scaffold for Claude Code that turns it from a capable coding assistant into an autonomous, self-improving engineering partner. Skills, hooks, rules, sub-agents, memory management, and context survival — all pre-configured.

The model is the same. The harness is the difference.

## Before vs After

| | Vanilla Claude Code | With claude-harness |
|---|---|---|
| **Context management** | Degrades silently past 70% usage | Auto-compacts at 80%, writes anchor state, restores after compaction |
| **Session continuity** | Starts fresh each time | Daily logs, handoff docs, auto-switch between sessions |
| **Error recovery** | Retries the same approach | 6-level escalation ladder: learnings → docs → web search → alternative approaches |
| **Quality gates** | None — stops whenever | Blocks stop on uncommitted work, enforces task completion |
| **Skills** | 0 (raw tool calls only) | 36 slash commands for architecture, delegation, debugging, content, deployment |
| **Safety** | Default permissions | Destructive command blocker, protected file guard, audit log |
| **Memory** | Forgotten on context reset | Persistent daily logs, learnings database, structured anchor states |
| **Self-improvement** | None | Analyzes past sessions, extracts patterns, updates its own rules |

## What's Inside

```
.claude/
├── CLAUDE.md                    # Operating manual — identity, principles, protocols
├── settings.local.json          # Hook wiring, env vars, MCP config
├── hooks/                       # 12 lifecycle scripts
│   ├── session-start-context.sh     # Injects full context on session start
│   ├── context-monitor.sh           # Checks for stale plans, bloated memory
│   ├── complete-story-alignment.sh  # North star reminder
│   ├── screenshot-cleanup.sh        # Removes old screenshots (>2h)
│   ├── post-compact-restore.sh      # Re-injects context after compaction
│   ├── pre-compact-memory-flush.sh  # Saves anchor state before context loss
│   ├── stop-verify.sh               # Blocks stop on uncommitted work
│   ├── task-completion-gate.sh      # Blocks stop on active tasks
│   ├── post-push-verify.sh          # Verifies deploy after git push
│   ├── audit-log.sh                 # Append-only JSONL audit trail
│   ├── session-end-log.sh           # Logs session summary to daily file
│   └── worktree-cleanup.sh          # Removes stale agent worktrees
├── skills/                      # 36 slash commands (on-demand, ~70 tokens each)
│   ├── deep-think/                  # Socratic reasoning + adversarial debate
│   ├── self-improve/                # Analyze sessions, extract patterns, update rules
│   ├── troubleshoot/                # 6-level error recovery ladder
│   ├── fractal-delegation/          # CEO pattern: decompose → delegate → monitor
│   ├── architect/                   # Trade-off analysis + system design
│   ├── sprint/                      # Break goals into 2-hour focused chunks
│   ├── harness-review/              # Audit harness quality + token efficiency
│   ├── memory-compression/          # Manage memory files, prevent bloat
│   └── ... (28 more)               # See full list below
├── rules/                       # 6 context-aware rule files
│   ├── typescript.md                # Strict types, Result pattern, no any
│   ├── react.md                     # RSC, Zustand, shadcn/ui, dark mode
│   ├── design.md                    # Warm black, serif+sans pairing, bento grids
│   ├── docs.md                      # Vision doc protection, evidence-backed claims
│   ├── loop-files.md                # Agent file format (SOUL.md, skills/, MEMORY.md)
│   └── agentgrid.md                 # Grid orchestration patterns
├── agents/                      # 7 specialized sub-agents
│   ├── code-reviewer.md            # Quality, security, architecture alignment
│   ├── test-writer.md               # Test generation for platform modules
│   ├── security-reviewer.md         # OWASP Top 10, secrets, injection attacks
│   ├── performance-analyzer.md      # Bottlenecks, memory leaks, bundle size
│   ├── research-agent.md            # Deep research, docs, repo analysis
│   ├── architect.md                 # System design, trade-offs, API review
│   └── loop-auditor.md              # Agent definition quality audit
└── memory/
    ├── MEMORY.md                    # Long-term index (architecture decisions, patterns)
    ├── LEARNINGS.md                 # Append-only mistake/rule database
    └── daily/                       # Daily session logs (executive summaries)
```

## Philosophy

**The harness IS the product. Models are commodities.**

Every foundation model vendor ships the same basic capabilities. The difference between a 42% score and a 78% score isn't the model — it's the scaffold around it:

- **Skills** teach Claude *when* to apply specialized reasoning (Socratic debate for architecture, escalation ladders for errors, delegation matrices for large tasks)
- **Hooks** automate lifecycle management (flush memory before compaction, restore context after, verify deploys, block premature stops)
- **Rules** enforce consistency without burning context (only loaded when relevant files are touched — a `.tsx` file loads design rules, not TypeScript rules)
- **Sub-agents** offload research to cheaper models, preserving the orchestrator's context window
- **Memory** survives context resets — daily logs, learnings database, anchor states that bridge compaction events

This is the same insight behind Energy's AutoLab: the nightly improvement engine that tunes the harness, not the model.

## Components at a Glance

### Hooks (12 lifecycle scripts)

| Hook | Event | What It Does |
|------|-------|-------------|
| session-start-context | SessionStart | Loads CONTEXT.md, memory, learnings, git status, inventory, terminal context |
| context-monitor | SessionStart | Warns on stale plans, bloated memory, missing daily logs |
| complete-story-alignment | SessionStart | Reminds about the north star vision document |
| screenshot-cleanup | SessionStart | Deletes screenshots older than 2 hours |
| post-compact-restore | SessionStart (compact) | Re-injects anchor state, active task, daily log after compaction |
| pre-compact-memory-flush | PreCompact | Writes anchor state, backup, daily log entry, tracks compaction count |
| destructive-blocker | PreToolUse (Bash) | Blocks `rm -rf /`, `sudo rm -rf`, `dd`, `mkfs` |
| protected-file-guard | PreToolUse (Write/Edit) | Blocks writes to `.env`, `pnpm-lock.yaml`, `package-lock.json` |
| post-push-verify | PostToolUse (Bash) | Checks deploy workflow after `git push` |
| audit-log | PostToolUse | Appends state-changing tool calls to `.claude/audit.jsonl` |
| stop-verify | Stop | Blocks stop if >3 uncommitted source files without CONTEXT.md update |
| task-completion-gate | Stop | Blocks stop if active task file exists and isn't marked done |
| session-end-log | SessionEnd | Writes session summary to daily log |
| worktree-cleanup | SessionEnd | Prunes abandoned agent worktrees |

### Skills (36 slash commands)

Skills are loaded on-demand (~70 tokens of metadata at startup, full content only when invoked). Compare to MCP servers which consume ~4,200 tokens always-on.

**Meta / Thinking:**

| Skill | What It Does |
|-------|-------------|
| `/deep-think` | Socratic questioning → self-critique → second-order effects → adversarial red team |
| `/architect` | Trade-off analysis with precedent research (what did Manus/Devin/GenSpark choose?) |
| `/self-improve` | Analyze past sessions for repeated mistakes, extract rules, update harness |
| `/harness-review` | Audit harness quality, token efficiency, rule conflicts |
| `/skill-creator` | Auto-generate new skills from discovered patterns |

**Workflow:**

| Skill | What It Does |
|-------|-------------|
| `/sprint` | Break goals into 2-hour focused chunks with dependencies |
| `/fractal-delegation` | CEO pattern: decompose work → delegate to sub-agents → monitor → integrate |
| `/troubleshoot` | 6-level error recovery: learnings → docs → web search → codebase → alternatives → manual |
| `/memory-compression` | Compress and manage memory files, prevent bloat |
| `/loop-integration` | Session-scoped cron jobs for recurring tasks |

**Building:**

| Skill | What It Does |
|-------|-------------|
| `/agent-runtime` | Build agent runtime adapters (Claude Agent SDK + E2B sandboxes) |
| `/app-factory` | Scaffold web and mobile apps from templates |
| `/frontend-design` | Generate distinctive, production-grade UIs (anti-generic-AI aesthetics) |
| `/secrets-setup` | Configure 1Password CLI + direnv for secrets management |
| `/heartbeat` | Set up agent health monitoring |

**Utility:**

| Skill | What It Does |
|-------|-------------|
| `/integrate-resources` | Process articles/docs dropped into `resources/unread/` |
| `/trending-data` | Collect trending AI/agent data from HN, GitHub, Reddit, X |
| `/repo-scout` | Scout GitHub repos for patterns relevant to your project |
| `/transcript-capture` | Extract transcripts from YouTube videos and X threads |
| `/mcp-setup` | Self-install MCP servers from catalog |

### Sub-Agents (7 specialists)

| Agent | Model | Role | Tools |
|-------|-------|------|-------|
| code-reviewer | Sonnet | Quality, security, architecture review | Read, Glob, Grep |
| test-writer | Sonnet | Generate test suites | All tools |
| security-reviewer | Sonnet | OWASP Top 10, secrets, injection | All tools |
| performance-analyzer | Sonnet | Bottlenecks, memory leaks, bundle size | All tools |
| research-agent | Sonnet | Deep research, docs, repo analysis | All tools |
| architect | Sonnet | System design, trade-offs, API review | Read, Glob, Grep, WebSearch |
| loop-auditor | Sonnet | Agent definition quality audit | All tools |

### Rules (6 context-aware files)

Rules are loaded via glob patterns — they only activate when you're working on matching files, keeping context lean:

| Rule | Triggers On | Key Constraints |
|------|------------|----------------|
| typescript.md | `*.ts` files | Strict types, no `any`, Result pattern, files < 400 lines |
| react.md | `*.tsx` files | RSC, Zustand, shadcn/ui, dark mode, Poppins font |
| design.md | `*.tsx`, `*.css` files | Warm black (#141312), serif+sans pairing, bento grids, no emoji icons |
| docs.md | `*.md` files | Never remove vision doc content, evidence-backed claims |
| loop-files.md | Agent format files | SOUL.md structure, MEMORY.md < 2K tokens, one skill per file |
| agentgrid.md | Grid operations | CLI-first, raw tmux as fallback only |

## Key Concepts

### Context Compaction Survival

Claude Code compacts (summarizes) your conversation when it gets too long. Each compaction retains only 20-30% of detail. After 2 compactions, only 4-9% survives.

The harness solves this with a 3-stage pipeline:

1. **PreCompact hook** — Before compaction, writes an anchor state (what you're doing, what files are modified, active tasks) and a full backup to `.claude/backups/`
2. **PostCompact hook** — After compaction, re-injects the anchor state, active task, daily log, and recent commits directly into context
3. **Hard stop at 2 compactions** — Signals the user to start a fresh session. Handoff doc bridges the gap.

### Auto-Switch (24/7 Operation)

The `auto-switch.sh` script wraps Claude in a session loop:

1. Claude runs until it hits compaction limit, rate limit, or crash
2. Script captures final state to `.claude/last-session-output.md`
3. Starts a fresh `claude --continue` session
4. SessionStart hook detects and injects the last session output

Run it overnight: `tmux new-session -d -s overnight './scripts/auto-switch.sh --overnight'`

### Self-Improvement Loop (AutoLab for Tooling)

The `/self-improve` skill analyzes past session logs for:

- Repeated mistakes → adds rules to prevent them
- Forgotten patterns → promotes to CLAUDE.md
- Backtracking moments → creates skills to shortcut them
- Tool failures → improves error handling in hooks

Each improvement compounds. Over weeks, the harness gets dramatically better at your specific project.

### Fractal Delegation (CEO Pattern)

For large tasks (>15 minutes, 2+ parallel workstreams), the `/fractal-delegation` skill teaches Claude to:

1. Decompose the task into independent workstreams
2. Spawn sub-agents for research (cheap Haiku model)
3. Launch worktree agents for code changes (Sonnet)
4. Monitor progress, integrate results, resolve conflicts
5. Commit stable checkpoints

Model routing: Opus for orchestration, Sonnet for code, Haiku for research. 60-90% cost reduction on simple tasks.

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` | `80` | Trigger compaction earlier for higher-quality summaries |
| `CLAUDE_CODE_TASK_LIST_ID` | — | Shared task list ID across terminals |
| `CLAUDE_TERMINAL_CONTEXT` | — | Per-terminal context loading (earning, content, spark, platform) |
| `CLAUDE_CODE_ENABLE_EXPERIMENTAL_AGENT_TEAMS` | `1` | Enable multi-agent worktree teams |
| `MAX_THINKING_TOKENS` | `63999` | Extended thinking budget |

### MCP Servers

The harness is configured to selectively enable MCP servers (not all — each costs ~4,200 tokens):

- **github** — Repository operations
- **context7** — Library documentation lookup
- **memory** — Persistent memory across sessions

### File Structure

```
memory/
├── MEMORY.md        # Architecture decisions, technology choices (index file)
├── LEARNINGS.md     # Append-only: mistakes made, rules learned
└── daily/
    └── 2026-03-17.md  # Today's session log (executive summary)
```

## Customization

### Adding a Skill

Create `.claude/skills/my-skill/SKILL.md`:

```markdown
---
name: my-skill
description: When to use this skill (NOT what it does — that's the content)
---

## When to Use

- Describe the trigger conditions

## Process

1. Step 1
2. Step 2

## Output Format

What the skill should produce
```

### Adding a Rule

Create `.claude/rules/my-rule.md`:

```markdown
- Rule 1: Be specific and actionable
- Rule 2: One rule per line
- Rule 3: Include the WHY, not just the WHAT
```

Rules are loaded based on glob patterns in `settings.local.json`. To limit a rule to specific files:

```json
{
  "matcher": "*.py",
  "hooks": [{ "type": "command", "command": "cat .claude/rules/python.md" }]
}
```

### Adding a Sub-Agent

Create `.claude/agents/my-agent.md`:

```markdown
---
name: my-agent
description: What this agent specializes in
model: sonnet
allowed-tools: ["Read", "Glob", "Grep"]
---

You are a [role]. Your job is to [task].

DO NOT IMPLEMENT. Report findings to the parent agent.
```

### Adding a Hook

Add to `settings.local.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "/path/to/your/hook.sh"
          }
        ]
      }
    ]
  }
}
```

Hook events: `SessionStart`, `PreToolUse`, `PostToolUse`, `PreCompact`, `Stop`, `SessionEnd`, `Notification`.

## Research

The harness engineering approach is backed by research:

- **Scaffolding > model swaps**: Same Claude Sonnet scores 42% on SWE-bench with minimal scaffolding, 78% with optimized harness (OpenHands study)
- **Context degradation at 70%**: Anthropic internal data shows quality drops when context utilization exceeds 70% of the window
- **Compaction retains 20-30%**: Each auto-compaction pass loses 70-80% of detail. After 2 compactions, only 4-9% of the original context survives (measured empirically across 96 sessions)
- **Skills vs MCP token cost**: A skill description consumes ~70 tokens at startup. An MCP server consumes ~4,200 tokens always-on. Skills are 60x more efficient.
- **Early compaction = better summaries**: Triggering compaction at 80% (vs default 90%) produces higher-quality summaries because the model has more headroom for the summarization pass (claudefa.st research)

## License

MIT
