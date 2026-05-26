#!/bin/bash
# Context health check on session start.
# Checks: stale plans, memory bloat, uncommitted work, missing daily logs.

set -euo pipefail

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
TODAY=$(date '+%Y-%m-%d')
WARNINGS=""

# 1. Check for stale plan
PLAN_FILE="$PROJECT_DIR/.claude/plan.md"
if [ -f "$PLAN_FILE" ]; then
  if [ "$(uname)" = "Darwin" ]; then
    PLAN_AGE=$(( ($(date +%s) - $(stat -f %m "$PLAN_FILE")) / 3600 ))
  else
    PLAN_AGE=$(( ($(date +%s) - $(stat -c %Y "$PLAN_FILE")) / 3600 ))
  fi
  if [ "$PLAN_AGE" -gt 24 ]; then
    WARNINGS="$WARNINGS\n[HEALTH] plan.md is ${PLAN_AGE}h old. Review or archive it."
  fi
fi

# 2. Check uncommitted file count
UNCOMMITTED_COUNT=$(git -C "$PROJECT_DIR" diff --name-only 2>/dev/null | wc -l | tr -d ' ')
if [ "$UNCOMMITTED_COUNT" -gt 50 ]; then
  WARNINGS="$WARNINGS\n[HEALTH] $UNCOMMITTED_COUNT uncommitted files. Consider committing stable work."
fi

# 3. Check memory file sizes
if [ -f "$PROJECT_DIR/memory/MEMORY.md" ]; then
  MEMORY_SIZE=$(wc -l < "$PROJECT_DIR/memory/MEMORY.md")
  if [ "$MEMORY_SIZE" -gt 100 ]; then
    WARNINGS="$WARNINGS\n[HEALTH] MEMORY.md is $MEMORY_SIZE lines. Consider compressing."
  fi
fi

if [ -f "$PROJECT_DIR/memory/LEARNINGS.md" ]; then
  LEARNINGS_SIZE=$(wc -l < "$PROJECT_DIR/memory/LEARNINGS.md")
  if [ "$LEARNINGS_SIZE" -gt 150 ]; then
    WARNINGS="$WARNINGS\n[HEALTH] LEARNINGS.md is $LEARNINGS_SIZE lines. Consider archiving."
  fi
fi

# 4. Check daily log exists
DAILY_FILE="$PROJECT_DIR/memory/daily/$TODAY.md"
if [ ! -f "$DAILY_FILE" ]; then
  WARNINGS="$WARNINGS\n[HEALTH] No daily log for $TODAY. Will be auto-created."
fi

# 5. Check CONTEXT.md staleness
if [ -f "$PROJECT_DIR/CONTEXT.md" ]; then
  if [ "$(uname)" = "Darwin" ]; then
    CONTEXT_AGE=$(( ($(date +%s) - $(stat -f %m "$PROJECT_DIR/CONTEXT.md")) / 3600 ))
  else
    CONTEXT_AGE=$(( ($(date +%s) - $(stat -c %Y "$PROJECT_DIR/CONTEXT.md")) / 3600 ))
  fi
  if [ "$CONTEXT_AGE" -gt 48 ]; then
    WARNINGS="$WARNINGS\n[HEALTH] CONTEXT.md not modified in ${CONTEXT_AGE}h. Consider updating."
  fi
fi

if [ -n "$WARNINGS" ]; then
  echo -e "\n=== CONTEXT HEALTH CHECK ===$WARNINGS"
fi
