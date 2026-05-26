# My CLI Tool

## What We're Building

A command-line tool that does one thing well. Fast, minimal dependencies, great error messages.

## Tech Stack

TypeScript strict, Node.js 18+, commander.js, Zod, Vitest

## Code Style

- No `any`. Named exports only. `const` over `let`.
- Files under 400 lines. One command per file.
- Helpful error messages (tell the user what to do, not just what failed).
- Zero-config to start. `npx my-tool` must work.

## How Claude Should Operate

1. Act, don't ask. Only escalate for breaking changes to the public API.
2. Never give up. Try alternative approaches when stuck.
3. Self-improve. Update LEARNINGS.md after each session.
4. One thing at a time. Ship the smallest useful version.
5. Test end-to-end. `npx .` must produce the expected output.

## Skills (15 available)

`/deep-think` `/architect` `/sprint` `/troubleshoot` `/self-improve` `/validate` `/recover` `/handoff` `/memory-compression` `/skill-creator` `/harness-review` `/model-routing` `/integrate-resources` `/skill-routing` `/loop-integration`

## Session Protocol

1. Start: Read this file + memory/daily/ for context.
2. During: Task tracking for multi-step work.
3. End: Update memory, run tests, commit stable work.

## Error Protocol

Never retry same approach 3x. Check LEARNINGS.md first. After every fix: root cause -> LEARNINGS.md.
