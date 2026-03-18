# Skills Guide

Skills are slash commands that teach Claude *when* and *how* to apply specialized reasoning. They're the core mechanism for extending Claude Code's capabilities without consuming permanent context.

## How Skills Work

### Token Economics

- **Startup cost:** ~70 tokens per skill (just the name + description from frontmatter)
- **On-demand cost:** Full skill content loaded only when invoked (typically 200-800 tokens)
- **Compare to MCP:** ~4,200 tokens per MCP server, always loaded

With 36 skills, total startup cost is ~2,500 tokens. The same functionality via MCP servers would cost ~150,000 tokens — 60x more.

### The CSO Pattern (Chief Skill Officer)

Before starting any non-trivial task, scan available skills for a match. If a skill *might* apply, invoke it. The rule: **if you'd skip a skill, ask "am I rationalizing?"**

Key triggers:

| You're doing... | Invoke... |
|---|---|
| Architecture decision | `/architect` or `/deep-think` |
| New feature | `/sprint` to plan it |
| Debugging an error | `/troubleshoot` |
| Working on `.tsx` files | Design rules auto-load (glob pattern) |
| Large multi-file task | `/fractal-delegation` |
| Weekly maintenance | `/self-improve` |
| Processing new articles | `/integrate-resources` |

## Skill Categories

### Meta / Thinking (5 skills)

These change *how* Claude thinks, not what it builds.

#### `/deep-think`

Activates multi-modal reasoning for complex decisions:

1. **Socratic questioning** — What am I actually solving? What assumptions am I making?
2. **Self-critique** — What's the weakest part? What would a skeptic say?
3. **Second-order effects** — What does this force us to also do? What doors does it close?
4. **Third-order effects** — How does this look 6 months out? What will users build on top?
5. **Adversarial red team** — Argue AGAINST your own recommendation

**Use when:** The first answer is probably wrong. Multiple valid approaches exist.

#### `/architect`

System-level trade-off analysis:

- Evaluates complexity, performance, scalability, cost, and developer experience
- Checks precedent (what did Manus/Devin/GenSpark choose?)
- Outputs a structured decision document with options, pros/cons, recommendation, and migration path

**Use when:** You're choosing between technologies, designing APIs, or reviewing schemas.

#### `/self-improve`

Analyzes past session logs for patterns:

- Questions Claude asks repeatedly → adds answers to CLAUDE.md
- Rules Claude forgets → adds to `.claude/rules/`
- Backtracking moments → creates skills to prevent them
- Tool failures → improves error handling

Also maintains a catalog of known error patterns (Vercel state loss, E2B race conditions, SSE timeouts, silent catch blocks, missing circuit breakers).

**Use when:** Weekly maintenance. Or after several sessions with repeated mistakes.

#### `/harness-review`

Audits the harness itself for quality:

- Token efficiency (is CLAUDE.md under 2K tokens?)
- Rule conflicts (do two rules contradict?)
- Skill discoverability (are descriptions clear triggers?)
- Hook correctness (do all scripts exit properly?)

**Use when:** After making changes to the harness. Quarterly review.

#### `/skill-creator`

Auto-generates new skills from patterns discovered by `/self-improve`. The meta-skill that makes the harness self-improving.

**Use when:** A pattern has been confirmed 3+ times and should be codified.

### Workflow (5 skills)

#### `/sprint`

Breaks a large goal into 2-hour focused chunks:

- Identifies dependencies between tasks
- Flags parallelization opportunities
- Creates a task list with priorities

**Use when:** Starting a new feature or project. Planning a work session.

#### `/fractal-delegation`

The CEO operating system for large tasks. Teaches Claude to decompose, delegate, and monitor:

```
CEO (You — Opus) — Decompose, route, delegate, monitor, integrate
    ├── VP Research (sub-agents, Haiku)
    ├── VP Frontend (worktree agent, Sonnet)
    ├── VP Backend (worktree agent, Sonnet)
    └── VP Quality (sub-agents, Sonnet)
```

Four delegation patterns:

| Pattern | When | How |
|---------|------|-----|
| Research Swarm | Need information, not code | 3-5 background sub-agents (Haiku) |
| Worktree Agents | Non-overlapping code changes | Each agent in isolated git worktree |
| Fractal Teams | Large features, 3+ packages | Agents containing sub-agents |
| Directive Swarm | Chairman voice dumps | Full decomposition + parallel execution |

**Use when:** Task would take >15 minutes. Has 2+ independent workstreams.

#### `/troubleshoot`

6-level error recovery escalation:

1. **Memory check** (10s) — Search LEARNINGS.md for the error
2. **Docs check** (30s) — Query context7 MCP for library docs
3. **Web search** (1m) — Search for the exact error message
4. **Codebase search** (1m) — Find how others solved it
5. **Alternative approach** (2m) — Step back, find a different way
6. **Manual prompt** (last resort) — Write a detailed prompt for Claude.ai

Rules: Never retry the same approach 3x. Always check learnings first. After fixing, add the solution to LEARNINGS.md.

**Use when:** Any error repeats twice. Stuck on the same problem for >5 minutes.

#### `/memory-compression`

Manages memory files to prevent bloat:

- Compresses MEMORY.md when it exceeds size limits
- Archives old learnings entries
- Maintains the daily log structure

**Use when:** Context monitor warns about bloated memory files.

#### `/loop-integration`

Session-scoped cron jobs via CronCreate/CronList/CronDelete:

- Max 50 tasks, 3-day expiry
- Fires between turns (when REPL is idle)
- Use cases: build monitoring, test polling, PR babysitting

**Use when:** Need recurring checks during a session.

### Building (5 skills)

| Skill | Purpose |
|-------|---------|
| `/agent-runtime` | Build agent runtime adapters (Claude Agent SDK + E2B sandboxes) |
| `/heartbeat` | Set up agent health monitoring (cron-like checks) |
| `/app-factory` | Scaffold web/mobile apps from templates |
| `/secrets-setup` | Configure 1Password CLI + direnv for secrets |
| `/memory-compression` | Manage agent memory files and prevent bloat |

### Utility (12 skills)

| Skill | Purpose |
|-------|---------|
| `/integrate-resources` | Process articles dropped into `resources/unread/` |
| `/trending-data` | Collect trending AI/agent data from HN, GitHub, Reddit, X |
| `/repo-scout` | Scout GitHub repos for relevant patterns |
| `/transcript-capture` | Extract transcripts from YouTube and X threads |
| `/mcp-setup` | Install MCP servers from catalog |
| `/skill-routing` | Progressive disclosure for large skill libraries |
| `/model-routing` | Auto-select the right model per task |
| `/test-visual` | Browser-based visual testing |
| `/playwright-test` | Playwright automation for web apps |
| `/21st-sdk` | 21st.dev UI components |
| `/ecosystem-reference` | Directory of Claude Code ecosystem repos |
| `/cli-anything` | Generate CLIs so Claude can control any app |

### Operational (9 skills)

| Skill | Purpose |
|-------|---------|
| `/darwin-loop` | Autonomous CEO execution loop |
| `/ceo-workflow` | Deterministic CEO workflow for recursive companies |
| `/ceo-launch` | Launch CEO in separate tmux session |
| `/fractal-delegation` | CEO operating system (see above) |
| `/chairman-feedback` | Process voice dumps into tasks |
| `/content-launch` | Content distribution pipeline |
| `/x-content-engine` | X/Twitter content with multi-persona review |
| `/agentgrid-orchestrate` | Cross-pane Claude Code orchestration |
| `/frontend-design` | Production-grade UI generation |

## Creating Your Own Skills

### Anatomy of a Skill

```
.claude/skills/
└── my-skill/
    └── SKILL.md
```

```markdown
---
name: my-skill
description: When to use this (trigger conditions, not capabilities)
---

## When to Use

- Bullet list of trigger conditions
- Be specific: "When deploying to staging" not "For deployments"

## Process

### Step 1: Name

What to do, with concrete examples.

### Step 2: Name

Continue the process.

## Output Format

What the skill should produce (optional but helpful).
```

### Key Principles

1. **Description = trigger, not capability.** The description tells Claude *when* to activate the skill, not what it does. "When any error repeats twice" is better than "Helps debug errors."

2. **Keep it under 800 tokens.** Skills that are too long defeat the purpose. If your skill is complex, break it into steps and let Claude's reasoning fill the gaps.

3. **Include concrete examples.** Don't say "search for the error" — say "Search LEARNINGS.md for the exact error message."

4. **Reference specific files.** "Read `memory/LEARNINGS.md`" is better than "check the learnings database."

5. **Don't duplicate CLAUDE.md.** Skills extend CLAUDE.md, they don't repeat it. If something belongs in CLAUDE.md (always-on context), put it there instead.

### Testing a Skill

After creating a skill, verify it appears in the startup inventory:

```bash
claude
# Check the === INVENTORY === line
# Skills: N should increase by 1
```

Then invoke it:

```
/my-skill
```

If the skill doesn't activate, check:
- Is the `SKILL.md` file in the right directory? (`.claude/skills/my-skill/SKILL.md`)
- Does the frontmatter have `name` and `description` fields?
- Is the description a clear trigger condition?
