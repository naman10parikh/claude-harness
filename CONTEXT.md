# claude-harness — Session Context

- **What it is:** a CLI scaffolder that installs a Claude Code harness (hooks + skills + rules +
  sub-agents + memory) into any project. The harness is the product.
- **Forged:** 2026-05-25 from Energy (CP103 multi-repo extraction).
- **Status:** shipping. CLI works (`bin/claude-harness.js` → `init` / `verify`). Test suite green
  — **19 tests pass** in `test/install.test.js` (`npm test`). npm package `claude-harness@1.0.0`.
- **Two harnesses, kept separate:** product payload (top-level `bin/ templates/ skills/ rules/
  hooks/ agents/ examples/ scripts/ docs/`) vs this repo's own harness (`.claude/ brain/ identity/
  memory/`). See `CLAUDE.md` → "two harnesses".

## What's next

- Keep the bundled template catalog (skills/rules/hooks) in sync with upstream Energy improvements.
- Expand the tier matrix (starter / pro / expert) and document each tier's payload in `docs/`.

## Deeper docs

- Operating brief + component map: `CLAUDE.md`
- Knowledge-graph hub: `brain/MOC - claude-harness.md`
- End-user guides: `docs/getting-started.md`, `docs/skills-guide.md`, `docs/hooks-guide.md`
- Long-term memory + learnings: `memory/MEMORY.md`, `memory/LEARNINGS.md`
