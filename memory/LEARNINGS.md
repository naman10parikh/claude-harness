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

## 2026-10-19 — The session-start hook died in any folder without git

- **What broke:** `hooks/session-start-context.sh` exited 129 in a folder that is not a git repository, cutting off the inventory and anchor sections. It also could not be run by an agent at all: `init` only asked questions, so nothing without a terminal could install the harness.
- **Root cause:** under `set -euo pipefail`, a pipeline whose first command fails (`git diff` outside a repository, `find` on a missing folder) fails the whole assignment and ends the script. `init` had no flags for its four questions.
- **Rule:** guard every `git` or `find` pipeline in a payload hook with `|| true`, and give every interactive command flags for each question. The L3 golden tasks (`hookSurvivesNoGit`, `cliInitNonInteractive`) fail CI if either comes back.

## 2026-10-19 — The inline blockers never blocked anything

- **What broke:** the destructive-command blocker (every tier) and the protected-file blocker (pro, expert) ran `echo "$CLAUDE_TOOL_INPUT" | grep ...`. Claude Code never sets that variable, so grep always saw an empty string and the hooks always allowed the call. The README promised that `rm -rf` would be blocked.
- **Root cause:** the hooks were written against environment variables that do not exist; Claude Code passes the event as JSON on stdin (code.claude.com/docs/en/hooks). Nothing fired the hooks with a real event, so the gap never showed.
- **Rule:** a hook reads its event from stdin, and every blocker ships with a golden task that fires it with a real event and checks the exit code (`blockersWork` in `eval/run-eval.mjs`).
