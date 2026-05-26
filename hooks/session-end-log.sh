#!/bin/bash
# Logs session summary to daily memory file on session end.

set -euo pipefail

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
DAILY_DIR="$PROJECT_DIR/memory/daily"
TODAY=$(date '+%Y-%m-%d')
DAILY_FILE="$DAILY_DIR/$TODAY.md"

mkdir -p "$DAILY_DIR"

MODIFIED=$(git -C "$PROJECT_DIR" diff --name-only 2>/dev/null | wc -l | tr -d ' ')

if [ ! -f "$DAILY_FILE" ]; then
  echo "# Session Log — $TODAY" > "$DAILY_FILE"
  echo "" >> "$DAILY_FILE"
fi

echo "### $(date '+%H:%M') — Session ended" >> "$DAILY_FILE"
echo "- Files modified: $MODIFIED" >> "$DAILY_FILE"
echo "" >> "$DAILY_FILE"
