#!/bin/bash
# Auto Chat-Switch Wrapper
# Wraps Claude Code in a session loop. When context degrades,
# captures state and starts a fresh session with full context.
#
# Usage:
#   ./scripts/auto-switch.sh              # Interactive mode
#   ./scripts/auto-switch.sh --overnight  # Autonomous mode
#   ./scripts/auto-switch.sh --dry-run    # Preview

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

LOG_DIR="$PROJECT_DIR/.claude/overnight-logs"
SIGNAL_FILE="/tmp/claude-session-signal"
LAST_OUTPUT_FILE="$PROJECT_DIR/.claude/last-session-output.md"
HANDOFF_FILE="$PROJECT_DIR/.claude/handoff.md"

mkdir -p "$LOG_DIR"

TIMESTAMP=$(date +%Y-%m-%dT%H-%M-%S)
LOG_FILE="$LOG_DIR/auto-switch-$TIMESTAMP.log"
MAX_SESSIONS=20
SESSION_COUNT=0
MODE="${1:---interactive}"

log() {
  local msg="[$(date '+%H:%M:%S')] $1"
  echo "$msg" | tee -a "$LOG_FILE"
}

cleanup() {
  rm -f "$SIGNAL_FILE"
  rm -f "/tmp/claude-compact-session-count"
}

build_resume_prompt() {
  local prompt="Resume session. Read CLAUDE.md for context."
  prompt+=$'\n\n'

  if [ -f "$LAST_OUTPUT_FILE" ]; then
    prompt+="## Last Session State"
    prompt+=$'\n'
    prompt+="$(cat "$LAST_OUTPUT_FILE")"
    prompt+=$'\n\n'
  fi

  if [ -f "$HANDOFF_FILE" ]; then
    if [ "$(uname)" = "Darwin" ]; then
      local handoff_age=$(( ($(date +%s) - $(stat -f %m "$HANDOFF_FILE")) / 60 ))
    else
      local handoff_age=$(( ($(date +%s) - $(stat -c %Y "$HANDOFF_FILE")) / 60 ))
    fi
    if [ "$handoff_age" -lt 30 ]; then
      prompt+="Handoff doc was written ${handoff_age}m ago. Resume from it."
      prompt+=$'\n'
    fi
  fi

  if [ "$MODE" = "--overnight" ]; then
    prompt+=$'\nResume autonomous work. Continue from handoff.\n'
  else
    prompt+=$'\nAuto-switched due to context degradation. Full context re-injected.\n'
  fi

  echo "$prompt"
}

detect_exit_reason() {
  local session_log="$1"
  local exit_code="$2"

  if [ -f "$SIGNAL_FILE" ]; then
    cat "$SIGNAL_FILE"
    rm -f "$SIGNAL_FILE"
    return
  fi

  if grep -qi "rate limit\|usage limit\|token limit" "$session_log" 2>/dev/null; then
    echo "rate-limited"
    return
  fi

  if grep -qi "handoff written\|context compacted" "$session_log" 2>/dev/null; then
    echo "context-degraded"
    return
  fi

  if [ "$exit_code" -ne 0 ]; then
    echo "crash:$exit_code"
    return
  fi

  echo "normal"
}

# === Main Loop ===

log "=== Auto-Switch Started (mode: $MODE) ==="

if [ "$MODE" = "--dry-run" ]; then
  log "DRY RUN — would start Claude Code in session loop"
  build_resume_prompt
  exit 0
fi

cleanup

while [ $SESSION_COUNT -lt $MAX_SESSIONS ]; do
  SESSION_COUNT=$((SESSION_COUNT + 1))
  SESSION_LOG="$LOG_DIR/session-${SESSION_COUNT}-$(date +%H%M%S).log"

  log "--- Session $SESSION_COUNT / $MAX_SESSIONS ---"

  PROMPT=$(build_resume_prompt)

  set +e
  claude -p "$PROMPT" --effort max 2>&1 | tee "$SESSION_LOG"
  EXIT_CODE=$?
  set -e

  REASON=$(detect_exit_reason "$SESSION_LOG" "$EXIT_CODE")
  log "Exit reason: $REASON"

  case "$REASON" in
    "context-degraded")
      log "Context degraded — starting fresh..."
      rm -f "/tmp/claude-compact-session-count"
      sleep 3
      continue
      ;;
    "rate-limited")
      log "Rate limited — waiting 60 minutes..."
      sleep 3600
      continue
      ;;
    crash:*)
      log "Crash — waiting 30s before retry..."
      sleep 30
      continue
      ;;
    "normal")
      log "Session completed normally."
      break
      ;;
    *)
      log "Unknown reason: $REASON"
      break
      ;;
  esac
done

log "=== Auto-Switch Finished ($SESSION_COUNT sessions) ==="
