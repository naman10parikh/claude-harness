#!/bin/bash
# Post-compaction context restore. Fires via SessionStart with "compact" matcher.
# Re-injects critical context after auto-compaction.

set -euo pipefail

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
ANCHOR_FILE="$PROJECT_DIR/.claude/anchor-state.md"
TODAY=$(date '+%Y-%m-%d')
DAILY_FILE="$PROJECT_DIR/memory/daily/$TODAY.md"
TASK_FILE="$PROJECT_DIR/.claude/active-task.md"
HANDOFF_FILE="$PROJECT_DIR/.claude/handoff.md"
SESSION_COUNTER="/tmp/claude-compact-session-count"

echo "=== CONTEXT RESTORED AFTER COMPACTION ==="
echo ""

# 1. Compaction count warning
if [ -f "$SESSION_COUNTER" ]; then
  COUNT=$(cat "$SESSION_COUNTER")
  echo "Compaction count this session: $COUNT"
  if [ "$COUNT" -ge 2 ]; then
    echo ""
    echo "**WARNING: Context compacted ${COUNT} times.**"
    echo "**Write handoff doc and start a new session.**"
  else
    echo "First compaction. Work efficiently to avoid another."
  fi
  echo ""
fi

# 2. Active task
if [ -f "$TASK_FILE" ]; then
  echo "=== ACTIVE TASK (resume this) ==="
  cat "$TASK_FILE"
  echo ""
fi

# 3. Anchor state
if [ -f "$ANCHOR_FILE" ]; then
  echo "=== ANCHOR STATE ==="
  cat "$ANCHOR_FILE"
  echo ""
fi

# 4. Recent daily log
if [ -f "$DAILY_FILE" ]; then
  echo "=== TODAY'S LOG (last 40 lines) ==="
  tail -40 "$DAILY_FILE"
  echo ""
fi

# 5. Handoff doc
if [ -f "$HANDOFF_FILE" ]; then
  echo "=== HANDOFF DOC ==="
  head -60 "$HANDOFF_FILE"
  echo ""
fi

# 6. Uncommitted files
MODIFIED=$(git -C "$PROJECT_DIR" diff --name-only 2>/dev/null | head -15)
if [ -n "$MODIFIED" ]; then
  echo "=== UNCOMMITTED FILES ==="
  echo "$MODIFIED"
  echo ""
fi

# 7. Recent commits
echo "=== RECENT COMMITS ==="
git -C "$PROJECT_DIR" log --oneline -5 2>/dev/null || echo "(none)"
echo ""

# 8. Instructions
echo "=== INSTRUCTIONS ==="
if [ -f "$SESSION_COUNTER" ] && [ "$(cat "$SESSION_COUNTER")" -ge 2 ]; then
  echo "1. Write handoff doc (.claude/handoff.md)"
  echo "2. Commit any uncommitted work"
  echo "3. Tell the user: 'Context degraded — start a new session.'"
else
  echo "1. Read the active task above and resume working"
  echo "2. Use sub-agents for research to preserve context"
  echo "3. Next compaction triggers degradation warning"
fi
echo "=== END RESTORE ==="
