# claude-harness — Quickstart

`claude-harness` is a CLI scaffolder: it drops a battle-tested Claude Code harness (hooks, skills,
rules, sub-agents, memory) into any project. Same model, ~2x output.

## Use the scaffolder (in your own project)

```bash
# one-off via npx
npx claude-harness init

# or install globally
npm install -g claude-harness
claude-harness init            # interactive: project name, language, tier, project type
claude-harness verify          # check the installed harness is wired correctly
```

`init` writes `.claude/` (skills, hooks, rules, sub-agents, settings) and a `memory/` system into
the current directory, then leaves you to fill in `CLAUDE.md` with your project identity.

## Develop this repo

```bash
git clone https://github.com/naman10parikh/claude-harness.git
cd claude-harness
npm install                       # commander, @inquirer/prompts, vitest
npm test                          # 19 tests in test/install.test.js — must stay green
npm run self-test                 # node bin/claude-harness.js --help
node bin/claude-harness.js init   # dogfood the scaffolder against a temp dir
```

## Where everything lives

- **CLI entry:** `bin/claude-harness.js` (`init`, `verify`)
- **Product payload (what gets installed):** top-level `templates/ skills/ rules/ hooks/ agents/
  examples/ scripts/ docs/`
- **This repo's own harness:** `.claude/ brain/ identity/ memory/`
- **Map of both + commit conventions:** `CLAUDE.md`
- **Knowledge-graph hub:** `brain/MOC - claude-harness.md`
