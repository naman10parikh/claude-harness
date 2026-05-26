# My Agent Project

## What We're Building

An AI agent that autonomously performs tasks. Uses Claude API with structured tool calling.

## Tech Stack

TypeScript strict, Claude Agent SDK, Zod, pino (logging), Vitest

## Code Style

- No `any`. Named exports only. `const` over `let`.
- Files under 400 lines. One tool per file.
- All tool results validated with Zod schemas.
- Errors must be actionable (tell the agent what to try next).

## How Claude Should Operate

1. Act, don't ask. Only escalate for API keys or model access.
2. Never give up. Agents must self-heal. Build retry logic everywhere.
3. Self-improve. The harness improves itself — same model, better scaffold.
4. One thing at a time. One tool working end-to-end beats five stubs.
5. Test the agent loop. Run the agent, watch it work, fix what breaks.

## Skills (15 available)

`/deep-think` `/architect` `/sprint` `/troubleshoot` `/self-improve` `/validate` `/recover` `/handoff` `/memory-compression` `/skill-creator` `/harness-review` `/model-routing` `/integrate-resources` `/skill-routing` `/loop-integration`

## Agent Architecture

- SOUL.md: Identity and boundaries (human-authored, never auto-modified)
- MEMORY.md: Curated long-term memory (agent-maintained, under 500 lines)
- LEARNINGS.md: Append-only error patterns and fixes
- skills/: On-demand capabilities loaded when needed

## Session Protocol

1. Start: Read this file + memory/daily/ for context.
2. During: Run agent, observe behavior, fix tool failures.
3. End: Update memory, commit stable agent code.

## Error Protocol

Never retry same approach 3x. Check LEARNINGS.md first. After every fix: root cause -> LEARNINGS.md.
