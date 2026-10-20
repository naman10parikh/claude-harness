# claude-harness — Quickstart

`claude-harness` copies a tested Claude Code harness (hooks, skills, rules, sub-agents, memory) into
any project.

## Use it (in your own project)

It needs Node.js 18 or later, git and bash. Run the latest from GitHub:

```bash
npx -y -p github:naman10parikh/claude-harness claude-harness init     # asks four questions
npx -y -p github:naman10parikh/claude-harness claude-harness init --name my-app --language typescript --tier pro --type web-app
bash scripts/verify.sh                                                 # check the install
```

`npx claude-harness init` also works, but runs the npm release 1.0.0 from March 2026, which is older
and asks its questions every time.

`init` writes `.claude/` (skills, hooks, rules, sub-agents, settings) and, for `pro` and `expert`, a
`memory/` folder, then leaves you to fill in `CLAUDE.md` with your project's details.

## Develop this repo

```bash
git clone https://github.com/naman10parikh/claude-harness.git
cd claude-harness
pnpm install                      # no build step
pnpm test                         # 19 tests in test/install.test.js
pnpm run eval                     # 23 golden tasks
node bin/claude-harness.js --help
```

## Where everything lives

- **CLI entry:** `bin/claude-harness.js` (`init`, `verify`, `sandbox-run`, `memory-search`)
- **Product payload (what gets installed):** top-level `templates/ skills/ rules/ hooks/ agents/
  examples/ scripts/ docs/`
- **This repo's own harness:** `.claude/ brain/ identity/ memory/`
- **The one source of instructions:** [AGENTS.md](AGENTS.md)
- **Knowledge-graph hub:** `brain/MOC - claude-harness.md`
