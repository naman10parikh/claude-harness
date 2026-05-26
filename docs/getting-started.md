# Getting Started

## Prerequisites

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) installed and authenticated
- Bash (macOS/Linux/WSL)
- Git (for session tracking and worktree agents)

## Installation

### Quick Install (Recommended)

```bash
curl -fsSL https://raw.githubusercontent.com/naman10parikh/claude-harness/main/install.sh | bash
```

This:
1. Copies hooks, skills, rules, agents, and memory templates into your project's `.claude/` directory
2. Creates `settings.local.json` with hook wiring and environment variables
3. Creates `memory/` directory with MEMORY.md, LEARNINGS.md, and daily/ subdirectory
4. Does NOT modify your existing CLAUDE.md — you write your own project identity

### Manual Install

```bash
git clone https://github.com/naman10parikh/claude-harness.git
cd claude-harness
./install.sh --target /path/to/your/project
```

### What Gets Installed

```
your-project/
├── .claude/
│   ├── settings.local.json      # Hook wiring + env vars
│   ├── hooks/                   # 12 lifecycle scripts
│   ├── skills/                  # 36 slash commands
│   ├── rules/                   # 6 context-aware rule files
│   └── agents/                  # 7 sub-agent definitions
└── memory/
    ├── MEMORY.md                # Long-term memory index
    ├── LEARNINGS.md             # Mistake/rule database
    └── daily/                   # Daily session logs
```

### What You Write

The installer creates a minimal `CLAUDE.md` if one doesn't exist. Customize it with your project's:

- **Identity** — What the project is, what you're building
- **Tech stack** — Languages, frameworks, databases
- **Code style** — Your conventions, not the harness defaults
- **Principles** — How Claude should operate in your project

The harness provides the *infrastructure* (hooks, skills, memory). You provide the *identity* (CLAUDE.md).

## First Session

After installation, start Claude Code in your project:

```bash
cd your-project
claude
```

On startup, you'll see the session context injection:

```
=== ENERGY PLATFORM — SESSION CONTEXT ===
Date: 2026-03-17

=== CONTEXT HEALTH CHECK ===
[CONTEXT MONITOR] No daily log for 2026-03-17. Will be auto-created.

=== INVENTORY ===
Skills: 36 | Rules: 6 | Sub-agents: 7

=== READY. You are a co-founder with full autonomy. Act accordingly. ===
```

This means all hooks fired successfully. The harness is active.

## Core Workflow

### 1. Session Start (Automatic)

The `session-start-context.sh` hook runs on every session start. It loads:

- Current state from CONTEXT.md
- Today's daily log (if exists)
- Long-term memory from MEMORY.md
- Recent learnings from LEARNINGS.md
- Last 10 git commits
- Unread resources alert
- Git status summary
- Skills/rules/agents inventory count

You don't need to do anything — this happens automatically.

### 2. Working (Skills On-Demand)

Use skills with slash commands:

```
/deep-think         # Before architecture decisions
/troubleshoot       # When stuck on an error
/sprint             # To plan a focused work session
/self-improve       # Weekly: analyze sessions, extract patterns
```

Skills are loaded on-demand. Only ~70 tokens of metadata per skill are in memory at startup. The full skill content loads when you invoke it.

### 3. Context Compaction (Automatic)

When your context hits 80% capacity:

1. **PreCompact hook fires** — writes anchor state, backup, and daily log entry
2. **Claude auto-compacts** — summarizes the conversation
3. **PostCompact hook fires** — re-injects anchor state, active task, daily log, recent commits
4. **You continue working** — the harness bridged the compaction gap

After 2 compactions, the harness enforces a hard stop. Start a new session.

### 4. Session End (Automatic)

The `session-end-log.sh` hook writes a summary to `memory/daily/YYYY-MM-DD.md`. The `worktree-cleanup.sh` hook removes abandoned agent worktrees.

## Verifying the Installation

Check that everything is wired correctly:

```bash
# Hooks present
ls .claude/hooks/
# Should show 12 .sh files

# Skills present
ls .claude/skills/ | wc -l
# Should show 36 directories

# Settings wired
cat .claude/settings.local.json | python3 -m json.tool
# Should show hooks for SessionStart, PreToolUse, PostToolUse, PreCompact, Stop, SessionEnd

# Sub-agents present
ls .claude/agents/
# Should show 7 .md files
```

## Customizing for Your Project

### Disable Hooks You Don't Need

Edit `settings.local.json` and remove hook entries. Common removals:

- `complete-story-alignment.sh` — only relevant if you have a vision doc at `docs/VISION.md`
- `post-push-verify.sh` — only relevant if you deploy via Vercel + GitHub Actions
- `screenshot-cleanup.sh` — only relevant if you use visual testing

### Change the Compaction Threshold

In `settings.local.json`, adjust:

```json
{
  "env": {
    "CLAUDE_AUTOCOMPACT_PCT_OVERRIDE": "80"
  }
}
```

Lower values (70-80) = more frequent but higher-quality compactions.
Higher values (85-95) = less frequent but lower-quality compactions.

Research suggests 80% is the sweet spot (claudefa.st).

### Add Project-Specific Rules

Create `.claude/rules/my-rule.md` with your project's conventions. Rules load automatically based on glob patterns.

### Enable MCP Servers

Edit `settings.local.json`:

```json
{
  "enabledMcpjsonServers": ["github", "context7", "memory"]
}
```

Available servers are defined in `.mcp.json` at your project root.

## Next Steps

- [Skills Guide](skills-guide.md) — How to use, create, and manage skills
- [Hooks Guide](hooks-guide.md) — How every hook works and how to create your own
