#!/bin/bash
# Pre-compaction memory flush. Fires on PreCompact event.
# Saves anchor state, backup, and daily log before context compression.

set -euo pipefail

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
MEMORY_DIR="$PROJECT_DIR/memory"
DAILY_DIR="$MEMORY_DIR/daily"
BACKUP_DIR="$PROJECT_DIR/.claude/backups"
ANCHOR_FILE="$PROJECT_DIR/.claude/anchor-state.md"
SESSION_COUNTER="/tmp/claude-compact-session-count"
TODAY=$(date '+%Y-%m-%d')
DAILY_FILE="$DAILY_DIR/$TODAY.md"
TIMESTAMP=$(date '+%Y-%m-%dT%H-%M-%S')
BACKUP_FILE="$BACKUP_DIR/pre-compact-$TIMESTAMP.md"

mkdir -p "$DAILY_DIR" "$BACKUP_DIR"

if [ ! -f "$DAILY_FILE" ]; then
  echo "# Session Log — $TODAY" > "$DAILY_FILE"
  echo "" >> "$DAILY_FILE"
fi

# Track compaction count
if [ -f "$SESSION_COUNTER" ]; then
  COUNT=$(cat "$SESSION_COUNTER")
  COUNT=$((COUNT + 1))
else
  COUNT=1
fi
echo "$COUNT" > "$SESSION_COUNTER"

# 1. Create structured backup
{
  echo "# Pre-Compaction Backup — $TIMESTAMP"
  echo "## Compaction #$COUNT this session"
  echo ""
  if [ -f "$PROJECT_DIR/CONTEXT.md" ]; then
    echo "## CONTEXT.md snapshot (first 80 lines)"
    echo '```'
    head -80 "$PROJECT_DIR/CONTEXT.md"
    echo '```'
    echo ""
  fi
  if [ -f "$MEMORY_DIR/MEMORY.md" ]; then
    echo "## MEMORY.md snapshot (first 60 lines)"
    echo '```'
    head -60 "$MEMORY_DIR/MEMORY.md"
    echo '```'
    echo ""
  fi
  echo "## Today's daily log (last 60 lines)"
  echo '```'
  tail -60 "$DAILY_FILE" 2>/dev/null || echo "(empty)"
  echo '```'
  echo ""
  echo "## Git status"
  echo '```'
  cd "$PROJECT_DIR" && git diff --stat HEAD 2>/dev/null || echo "(not a git repo)"
  echo '```'
  echo ""
  echo "## Recent commits (last 5)"
  echo '```'
  cd "$PROJECT_DIR" && git log --oneline -5 2>/dev/null || echo "(none)"
  echo '```'
} > "$BACKUP_FILE"

# 2. Write anchor-state.md
{
  echo "# Anchor State — $TIMESTAMP (Compaction #$COUNT)"
  echo ""
  echo "## Recovery"
  echo ""
  echo "Read backup: \`.claude/backups/pre-compact-$TIMESTAMP.md\`"
  echo "Read daily log: \`memory/daily/$TODAY.md\`"
  echo ""
  echo "## Recent Daily Log (last 40 lines)"
  echo ""
  tail -40 "$DAILY_FILE" 2>/dev/null || echo "(no entries)"
  echo ""
  echo "## Compaction Health"
  echo ""
  if [ "$COUNT" -ge 2 ]; then
    echo "**WARNING: Context compacted $COUNT times. Quality is degrading.**"
    echo "**Write handoff doc and start a new session.**"
  else
    echo "First compaction. Finish current task quickly."
  fi
} > "$ANCHOR_FILE"

# 3. Append marker to daily log
{
  echo ""
  echo "### [AUTO] Context compaction at $(date '+%H:%M:%S')"
  echo "- Backup: .claude/backups/pre-compact-$TIMESTAMP.md"
  echo "- Compaction #$COUNT this session"
  echo ""
} >> "$DAILY_FILE"

# 4. Prune old backups (keep last 10)
ls -t "$BACKUP_DIR"/pre-compact-*.md 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null || true

# 5. Signal for auto-switch
if [ "$COUNT" -ge 2 ]; then
  echo "context-degraded" > "/tmp/claude-session-signal"
  echo "WARNING: Compaction #$COUNT — context degrading. Write handoff."
else
  echo "First compaction. Next triggers degradation warning."
fi

echo "Memory flushed (compaction #$COUNT). Backup: $BACKUP_FILE"
