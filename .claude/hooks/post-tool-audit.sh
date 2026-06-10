#!/bin/bash
# post-tool-audit.sh — append-only PostToolUse audit for THIS repo's own Claude Code sessions.
#
# Wired by .claude/settings.json as a PostToolUse hook. On every state-mutating tool call
# (Write/Edit/Bash/NotebookEdit/...) it appends one JSON line to .claude/audit.jsonl recording
# what happened and when. This is the *session-time* twin of the product's runtime audit trail
# (lib/run-log.mjs → logs/runs.jsonl): the product logs scaffold/sandbox/memory-search runs;
# this hook logs the tool calls the maintainer's own agent makes while developing the product.
#
# Pure POSIX append (no `flock` — macOS dev boxes don't ship it, and a single >> append of one
# short line is atomic under O_APPEND on the platforms we run). Never blocks the tool: always
# exits 0. Reads the hook payload from stdin (Claude Code PostToolUse contract) and also honors
# the legacy CLAUDE_TOOL_NAME env var so it runs identically when invoked by hand for testing.

set -uo pipefail

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"
AUDIT_FILE="$PROJECT_DIR/.claude/audit.jsonl"
TIMESTAMP=$(date -u '+%Y-%m-%dT%H:%M:%SZ')

# The PostToolUse payload arrives on stdin as JSON: { "tool_name": "...", "tool_input": {...} }.
PAYLOAD="$(cat 2>/dev/null || true)"

# Resolve the tool name from stdin payload first, then fall back to the env var.
TOOL_NAME="$(printf '%s' "$PAYLOAD" | sed -n 's/.*"tool_name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)"
[ -z "$TOOL_NAME" ] && TOOL_NAME="${CLAUDE_TOOL_NAME:-unknown}"

# Only record state-mutating tools — keep the trail focused (reads/searches are noise).
case "$TOOL_NAME" in
  Write|Edit|MultiEdit|Bash|NotebookEdit|Task) ;;
  *) exit 0 ;;
esac

# Best-effort file path extraction (Write/Edit carry one; Bash usually doesn't).
FILE_PATH="$(printf '%s' "$PAYLOAD" | sed -n 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)"

mkdir -p "$(dirname "$AUDIT_FILE")"
printf '{"ts":"%s","tool":"%s","file":"%s"}\n' "$TIMESTAMP" "$TOOL_NAME" "$FILE_PATH" >> "$AUDIT_FILE"

exit 0
