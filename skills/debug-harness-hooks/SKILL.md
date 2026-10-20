---
name: debug-harness-hooks
description: Find why a harness hook does not fire, fails, or blocks the wrong thing, and fix it. Use when the session context block is missing, a hook prints an error, a safe command is blocked, or a dangerous one is not.
---

# Debug Harness Hooks

The harness's hooks live in `.claude/hooks/` and are wired in `.claude/settings.local.json` (or
`.claude/settings.json`). Claude Code runs each one at its lifecycle event and passes the event as JSON
on stdin. When a hook misbehaves, the cause is almost always one of four things: a wrong path, a
missing execute bit, a script that exits non-zero, or a matcher that catches too much or too little.

## When to Use

- The `=== SESSION CONTEXT ===` block no longer appears at the start of a session.
- A hook error shows in the transcript, or a session takes seconds longer to start.
- A safe command is blocked, or a destructive one gets through.

## Steps

1. **List what is wired.** Read the `hooks` block in `.claude/settings.local.json` and
   `.claude/settings.json`. Note each event, matcher and command.
2. **Check every path.** Each command must point at a file that exists. Prefer
   `$CLAUDE_PROJECT_DIR/.claude/hooks/<name>.sh` to an absolute path, which breaks when the project
   moves. Run `ls -l .claude/hooks/` and make every script executable with `chmod +x`.
3. **Fire it by hand.** Pipe a sample event into the script and read the exit code:
   `echo '{"hook_event_name":"SessionStart"}' | CLAUDE_PROJECT_DIR="$PWD" bash .claude/hooks/session-start-context.sh; echo "exit $?"`.
   Exit 0 means fine; exit 2 means the hook is blocking on purpose; anything else is a bug.
4. **Read the failure.** Scripts run with `set -euo pipefail`, so one failing command ends the whole
   hook. A pipeline that starts with `git` or `find` fails in a folder without git or without the
   folder it searches; guard it with `|| true`.
5. **Test the matcher.** For a `PreToolUse` blocker, fire it with one command it must block and one it
   must allow, and confirm the exit codes are 2 and 0.
6. **Confirm in a session.** Start `claude` with `--debug` to see each hook run, then fix and repeat.

## Example

Request: "The session context stopped loading after I copied the project."

1. `.claude/settings.local.json` points at the old folder's absolute path.
2. The path is changed to `$CLAUDE_PROJECT_DIR/.claude/hooks/session-start-context.sh`.
3. Fired by hand, the hook prints the context block and exits 0; the next session shows it again.

## Output

Each hook checked (event, path, exit code), the cause found, the fix made, and the result of firing it
again.
