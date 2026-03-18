#!/bin/bash
# Runs before Claude stops to verify work quality.
# Exit code 2 = block stop (stderr shown to Claude).
# Exit code 0 = allow stop.
#
# CIRCUIT BREAKER: If this hook fires >3 times in 60 seconds,
# allow stop to prevent infinite loops (e.g. during rate limits).

set -euo pipefail

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-/Users/naman/energy}"
COUNTER_FILE="/tmp/claude-stop-verify-counter"
WINDOW=60
MAX_FIRES=3  # Lowered from 5 — fail fast to prevent loops

# --- VP bypass: VPs should never be blocked by stop hooks ---
# If running in a VP pane (not CEO), allow stop immediately.
# VP panes have @pane_label set to VP-*, AG-*, OSS-*, Mgr-*, etc.
if [ -n "${TMUX_PANE:-}" ]; then
  PANE_LABEL=$(tmux show-options -p -t "$TMUX_PANE" @pane_label 2>/dev/null | sed 's/@pane_label //' || echo "")
  if echo "$PANE_LABEL" | grep -qiE '^(VP-|AG-|OSS-|Mgr-|Sub-)'; then
    exit 0  # VPs always allowed to stop — CEO handles commits
  fi
fi
# --- End VP bypass ---

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
# --- End circuit breaker ---

# Check: compaction count — if >= 3, ALLOW stop immediately (context is degraded)
SESSION_COUNTER="/tmp/claude-compact-session-count"
if [ -f "$SESSION_COUNTER" ]; then
  COMPACT_COUNT=$(cat "$SESSION_COUNTER")
  if [ "$COMPACT_COUNT" -ge 3 ]; then
    echo "Context compacted ${COMPACT_COUNT}x — allowing stop. Write handoff before exiting." >&2
    rm -f "$COUNTER_FILE"
    exit 0
  fi
fi

# Check: uncommitted SOURCE files (excluding backups, lockfiles, daily logs)
MODIFIED=$(git -C "$PROJECT_DIR" diff --name-only 2>/dev/null | grep -v '.claude/backups/' | grep -v 'pnpm-lock' | grep -v 'memory/daily/' | wc -l | tr -d ' ')
if [ "$MODIFIED" -gt 3 ]; then
  CONTEXT_UPDATED=$(git -C "$PROJECT_DIR" diff --name-only 2>/dev/null | grep -c "CONTEXT.md" || true)
  if [ "$CONTEXT_UPDATED" -eq 0 ]; then
    echo "You have $MODIFIED uncommitted source files. Consider updating CONTEXT.md and committing before stopping." >&2
    exit 2
  fi
fi

# Success — reset counter
rm -f "$COUNTER_FILE"
exit 0
