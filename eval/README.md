# eval/ — Harness Evaluation

This harness ships with the same eval discipline it scaffolds for others: the harness IS the product, so changes to it should be measured, not vibed.

## The golden tasks

[`run-eval.mjs`](run-eval.mjs) runs the 23 tasks in [`golden-tasks.json`](golden-tasks.json), binary pass or fail. CI runs them on every push, every pull request and weekly; a red run blocks the merge.

1. **L1, payload invariants (11)** — 18 skills, each with frontmatter; at least 6 hooks, each starting with `#!/bin/bash`; rules and sub-agents present; `.claude/agents/` flat; `llms.txt` and `AGENTS.md` present; no unfilled `{{PLACEHOLDER}}` in `identity/`.
2. **L2, live scaffolds (3)** — the real installer writes the expert, pro and starter tiers into throwaway folders, and the trees are checked file by file. Every hook script a tier's settings name must exist and be executable.
3. **L3, surfaces (9)** — what a user or an agent touches: `init` with flags installs the pro tier with no prompt and logs one line; `init` refuses an unknown tier and will not overwrite a harness without `--force`; the MCP server lists its three tools and its `scaffold_plan` agrees with the installer for every tier; the plugin's session-start hook finishes in a folder without git; the inline blockers an install writes stop `rm -rf /` and a write to `.env` when given the hook event on stdin; the three skills written for the harness are complete; the plugin manifests resolve; memory search answers a plain question.

[`baseline.json`](baseline.json) records the accepted pass count. The scheduled improvement loop (`scripts/improve.mjs`) fails when the count drops below it and writes a proposal either way.

## Running the eval

```bash
pnpm run eval      # the 23 golden tasks
pnpm test          # 19 unit tests of the installer
node bin/claude-harness.js --help
```

## Observer

When you change a template, rule, or hook, ask the eval immune-system questions:

- Did the scaffold output still validate?
- Did any test break?
- Did a project-specific path or name leak into a bundled template? (CI's leak check greps the payload on every push.)

A red eval is a blocked release. Fix it before shipping — same rule this harness scaffolds into every project it creates.
