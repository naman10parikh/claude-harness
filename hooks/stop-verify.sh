#!/bin/bash
# Quality gate before Claude stops. Checks for uncommitted work.
# Exit 2 = block stop (stderr shown to Claude). Exit 0 = allow.
# Circuit breaker: allows stop after 3 fires in 60 seconds.

set -euo pipefail

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
COUNTER_FILE="/tmp/claude-stop-verify-counter"
WINDOW=60
MAX_FIRES=3

# --- Circuit breaker ---
NOW=$(date +%s)
if [ -f "$COUNTER_FILE" ]; then
  FIRST_FIRE=$(head -1 "$COUNTER_FILE")
  FIRE_COUNT=$(wc -l < "$COUNTER_FILE" | tr -d ' ')
  AGE=$(( NOW - FIRST_FIRE ))
  if [ "$AGE" -gt "$WINDOW" ]; then
    echo "$NOW" > "$COUNTER_FILE"
  else
    echo "$NOW" >> "$COUNTER_FILE"
    FIRE_COUNT=$(( FIRE_COUNT + 1 ))
    if [ "$FIRE_COUNT" -ge "$MAX_FIRES" ]; then
      rm -f "$COUNTER_FILE"
      exit 0
    fi
  fi
else
  echo "$NOW" > "$COUNTER_FILE"
fi

# Check: compaction count — if >= 3, allow stop
SESSION_COUNTER="/tmp/claude-compact-session-count"
if [ -f "$SESSION_COUNTER" ]; then
  COMPACT_COUNT=$(cat "$SESSION_COUNTER")
  if [ "$COMPACT_COUNT" -ge 3 ]; then
    rm -f "$COUNTER_FILE"
    exit 0
  fi
fi

# Check: uncommitted source files (excluding backups, lockfiles, daily logs)
MODIFIED=$(git -C "$PROJECT_DIR" diff --name-only 2>/dev/null \
  | grep -v '.claude/backups/' \
  | grep -v 'pnpm-lock' \
  | grep -v 'memory/daily/' \
  | wc -l | tr -d ' ')

if [ "$MODIFIED" -gt 3 ]; then
  CONTEXT_UPDATED=$(git -C "$PROJECT_DIR" diff --name-only 2>/dev/null | grep -c "CONTEXT.md" || true)
  if [ "$CONTEXT_UPDATED" -eq 0 ]; then
    echo "You have $MODIFIED uncommitted files. Consider committing before stopping." >&2
    exit 2
  fi
fi

rm -f "$COUNTER_FILE"
exit 0
