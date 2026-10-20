---
name: install-harness
description: Install the claude-harness scaffold into a project without prompts, pick the right tier, and confirm it works. Use when someone asks to "set up the harness", "add claude-harness", or give a repository hooks, skills, rules and memory for Claude Code.
---

# Install the Harness

claude-harness copies a tested `.claude/` setup (skills, hooks, rules, sub-agents, settings) and a
`memory/` folder into a project. This skill installs it in one command and checks the result, so the
next session starts with context loaded and the safety hooks on.

## When to Use

- Someone asks to set up the harness, or to give a project hooks, skills, rules and memory.
- A new repository has no `.claude/` folder yet.
- You want to try the harness on a throwaway copy before a real project.

## Steps

1. **Pick the tier.** `starter` is 2 skills, 2 hooks and 2 rules, for a first look. `pro` adds
   memory, the pre-compaction flush and 5 skills, for daily work. `expert` installs everything. When
   unsure, choose `pro`.
2. **Try it in isolation first (optional).** With `E2B_API_KEY` set, run
   `npx -y -p github:naman10parikh/claude-harness claude-harness sandbox-run --tier pro`. It installs
   the harness inside a fresh E2B microVM and reports whether it worked, without touching this machine.
3. **Install it.** From the project folder, run
   `npx -y -p github:naman10parikh/claude-harness claude-harness init --name <project> --language typescript --tier pro --type web-app`.
   Languages are `typescript`, `python` or `general`; types are `web-app`, `cli-tool` or
   `agent-project`. Add `--force` only when the user agrees to overwrite an existing harness.
4. **Check it.** Run `bash scripts/verify.sh` (or `claude-harness verify`). Every line should pass.
5. **Fill in CLAUDE.md.** Replace the example text with the project's real name, stack, commands and
   rules. The harness loads this file at the start of every session.
6. **Start a session.** Run `claude` and confirm the `=== SESSION CONTEXT ===` block appears.

## Example

Request: "Set up the harness in this Next.js repository."

1. Tier `pro`, language `typescript`, type `web-app`.
2. `claude-harness init --name shop --language typescript --tier pro --type web-app` installs 5
   skills, 6 hooks, 3 rules, memory and 2 scripts.
3. `bash scripts/verify.sh` passes; CLAUDE.md now names the stack and the test command.

## Output

The tier installed, the counts the installer printed, the result of the verify step, and the CLAUDE.md
sections still to fill in.
