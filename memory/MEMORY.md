# claude-harness — Long-Term Memory (index)

> Inherited memory-harness structure from Energy. One line per durable fact.
> Layers: this index → topics/ deep-dives → daily/ logs → archive/ (compressed >30d, never deleted).

## Architecture Decisions

- 2026-05-25 — Distributed as the npm package `claude-harness@1.0.0` (MIT). CLI in
  `bin/claude-harness.js` exposes `init` (interactive scaffold) + `verify` (setup check).
- 2026-05-25 — Payload tiers are starter / pro / expert; project types are web-app / cli-tool /
  agent-project; languages are TypeScript / Python / general.

## Key Patterns

- **Two-harness separation.** Product payload (top-level `bin/ templates/ skills/ rules/ hooks/
  agents/ examples/ scripts/ docs/`, listed in `package.json` `files`) vs this repo's own harness
  (`.claude/ brain/ identity/ memory/`). Tell them apart via `package.json` `files`.
- **The harness is the product.** Output quality comes from the scaffold around the model.

## Technology Choices

- Node `>=18`, ESM (`"type": "module"`). Deps: `commander` (CLI), `@inquirer/prompts` (prompts).
- Tests: `vitest` — 19 tests in `test/install.test.js` (`npm test`).

## People & Resources

- Author/maintainer: the user (`naman10parikh@gmail.com`).
- Repo: https://github.com/naman10parikh/claude-harness (public).

## What NOT to Do

- Do not edit top-level `skills/`/`rules/`/`hooks/` when you mean this repo's `.claude/` — that
  silently changes what users receive.
- Do not commit secrets, personal absolute paths, or internal customer names (public repo).

## Operating Model

- Conventional commits. Files < 400 lines. Test as a USER (dogfood `init` on a temp dir), not just
  "it compiles."

## Topic Files Index

- (none yet — add deep-dives under `topics/` as they are written)
