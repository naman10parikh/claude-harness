#!/bin/bash
# Injects full project context on session start.
# Loads: CLAUDE.md state, memory, learnings, git status, inventory.

set -euo pipefail

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
CLAUDE_DIR="$PROJECT_DIR/.claude"
TODAY=$(date '+%Y-%m-%d')
DAILY_FILE="$PROJECT_DIR/memory/daily/$TODAY.md"

echo "=== SESSION CONTEXT ==="
echo "Date: $TODAY"
echo ""

# Current state
if [ -f "$PROJECT_DIR/CONTEXT.md" ]; then
  head -20 "$PROJECT_DIR/CONTEXT.md"
fi

echo ""
echo "=== TODAY'S MEMORY ==="
if [ -f "$DAILY_FILE" ]; then
  tail -50 "$DAILY_FILE"
else
  echo "(First session today — no entries yet)"
fi

echo ""
echo "=== LONG-TERM MEMORY ==="
if [ -f "$PROJECT_DIR/memory/MEMORY.md" ]; then
  head -60 "$PROJECT_DIR/memory/MEMORY.md"
fi

echo ""
echo "=== LEARNINGS ==="
if [ -f "$PROJECT_DIR/memory/LEARNINGS.md" ]; then
  tail -30 "$PROJECT_DIR/memory/LEARNINGS.md"
fi

echo ""
echo "=== RECENT COMMITS ==="
git -C "$PROJECT_DIR" log --oneline -10 2>/dev/null || echo "(no git history)"

# Auto-detect unread resources
if [ -d "$PROJECT_DIR/resources/unread" ]; then
  UNREAD_COUNT=$(find "$PROJECT_DIR/resources/unread" -name "*.md" -type f 2>/dev/null | wc -l | tr -d ' ')
  if [ "$UNREAD_COUNT" -gt 0 ]; then
    echo ""
    echo "=== ACTION REQUIRED: $UNREAD_COUNT UNREAD RESOURCES ==="
    find "$PROJECT_DIR/resources/unread" -name "*.md" -type f -exec basename {} \; 2>/dev/null
    echo ">>> Process these with /integrate-resources before starting work."
  fi
fi

# Git status
MODIFIED=$(git -C "$PROJECT_DIR" diff --name-only 2>/dev/null | wc -l | tr -d ' ')
UNTRACKED=$(git -C "$PROJECT_DIR" ls-files --others --exclude-standard 2>/dev/null | wc -l | tr -d ' ')
if [ "$MODIFIED" -gt 0 ] || [ "$UNTRACKED" -gt 0 ]; then
  echo ""
  echo "=== GIT STATUS: $MODIFIED modified, $UNTRACKED untracked ==="
fi

# Skills & tools inventory
echo ""
echo "=== INVENTORY ==="
SKILL_COUNT=$(find "$CLAUDE_DIR/skills" -name "SKILL.md" -type f 2>/dev/null | wc -l | tr -d ' ')
RULE_COUNT=$(find "$CLAUDE_DIR/rules" -name "*.md" -type f 2>/dev/null | wc -l | tr -d ' ')
echo "Skills: $SKILL_COUNT | Rules: $RULE_COUNT"

# Load anchor state if recent (post-compaction recovery)
ANCHOR_FILE="$CLAUDE_DIR/anchor-state.md"
if [ -f "$ANCHOR_FILE" ]; then
  if [ "$(uname)" = "Darwin" ]; then
    ANCHOR_AGE=$(( ($(date +%s) - $(stat -f %m "$ANCHOR_FILE")) / 60 ))
  else
    ANCHOR_AGE=$(( ($(date +%s) - $(stat -c %Y "$ANCHOR_FILE")) / 60 ))
  fi
  if [ "$ANCHOR_AGE" -lt 120 ]; then
    echo ""
    echo "=== POST-COMPACTION ANCHOR STATE (${ANCHOR_AGE}m ago) ==="
    cat "$ANCHOR_FILE"
    echo ">>> Context was recently compacted. Read the anchor state above."
  else
    rm -f "$ANCHOR_FILE"
  fi
fi

# Load last-session-output if recent (auto-switch continuity)
LAST_OUTPUT_FILE="$CLAUDE_DIR/last-session-output.md"
if [ -f "$LAST_OUTPUT_FILE" ]; then
  if [ "$(uname)" = "Darwin" ]; then
    LAST_AGE=$(( ($(date +%s) - $(stat -f %m "$LAST_OUTPUT_FILE")) / 60 ))
  else
    LAST_AGE=$(( ($(date +%s) - $(stat -c %Y "$LAST_OUTPUT_FILE")) / 60 ))
  fi
  if [ "$LAST_AGE" -lt 60 ]; then
    echo ""
    echo "=== LAST SESSION STATE (${LAST_AGE}m ago) ==="
    cat "$LAST_OUTPUT_FILE"
    echo ">>> Resume from where the previous session left off."
  else
    rm -f "$LAST_OUTPUT_FILE"
  fi
fi

echo ""
echo "=== READY ==="
