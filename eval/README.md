# eval/ — Harness Evaluation

This harness ships with the same eval discipline it scaffolds for others: the harness IS the product, so changes to it should be measured, not vibed.

## What to evaluate

`claude-harness` is a scaffolder CLI. Its quality bar is:

1. **Scaffold integrity** — `node bin/claude-harness.js` produces a complete, valid harness (CLAUDE.md, rules/, skills/, hooks/, memory/) for each of the three tiers (minimal / standard / full).
2. **No regressions** — every bundled hook, skill, and rule template stays syntactically valid and free of project-specific references.
3. **Self-test** — `pnpm test` (Vitest) stays green.

## Running the eval

```bash
# Unit + integration tests (the canonical gate)
pnpm test

# Smoke test the CLI end to end
node bin/claude-harness.js --help
node bin/claude-harness.js --version
```

## Observer

When you change a template, rule, or hook, ask the eval immune-system questions:

- Did the scaffold output still validate?
- Did any test break?
- Did a project-specific path or name leak into a bundled template? (Run a grep before publishing.)

A red eval is a blocked release. Fix it before shipping — same rule this harness scaffolds into every project it creates.
