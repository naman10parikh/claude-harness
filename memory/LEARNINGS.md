# claude-harness — LEARNINGS (append-only)

Every error → root cause → rule. Auto-compressed when >500 lines (memory-compress.sh).

## 2026-05-25 — AGENTS.md inherited the wrong schema on extraction

- **What broke:** After forging this repo from Energy (CP103), `AGENTS.md` was the generic WikiMem
  wiki-schema (sha `627eebad…`) — it described `raw/`, `wiki/`, `entities/`, none of which exist
  here.
- **Root cause:** The extraction copied a cross-repo template instead of generating a repo-specific
  orchestration doc.
- **Rule:** On every extraction, regenerate `AGENTS.md` to describe *this* repo's actual dirs and
  conventions; verify `shasum AGENTS.md` ≠ `627eebad3f4bf5f49cfd63195e2b84483032a234`.

## 2026-05-25 — Scaffolder vs repo-harness confusion

- **What broke:** Easy to mistake this repo's bundled top-level `skills/`/`rules/`/`hooks/` (the
  product payload shipped to users) for this repo's own operating config in `.claude/`.
- **Root cause:** Both surfaces use the same directory names, just at different levels.
- **Rule:** If a path is in `package.json` `files`, it is product payload — editing it changes what
  users get. The repo's own harness is only `.claude/`, `brain/`, `identity/`, `memory/`. Documented
  in `CLAUDE.md` and `AGENTS.md`.
