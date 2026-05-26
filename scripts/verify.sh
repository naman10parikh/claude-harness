#!/bin/bash
# Quick setup verification. Run after claude-harness init.

set -e

PROJECT_DIR="${1:-$(pwd)}"
CLAUDE_DIR="$PROJECT_DIR/.claude"
ERRORS=0

echo "=== claude-harness — Setup Verification ==="
echo ""

# 1. CLAUDE.md
echo -n "CLAUDE.md: "
if [ -f "$PROJECT_DIR/CLAUDE.md" ]; then
  LINES=$(wc -l < "$PROJECT_DIR/CLAUDE.md" | tr -d ' ')
  echo "OK ($LINES lines)"
else
  echo "MISSING"
  ERRORS=$((ERRORS + 1))
fi

# 2. Skills
echo -n "Skills: "
SKILL_COUNT=$(find "$CLAUDE_DIR/skills" -name "SKILL.md" -type f 2>/dev/null | wc -l | tr -d ' ')
if [ "$SKILL_COUNT" -gt 0 ]; then
  echo "OK ($SKILL_COUNT skills)"
else
  echo "MISSING (run: claude-harness init)"
  ERRORS=$((ERRORS + 1))
fi

# 3. Hooks
echo -n "Hooks: "
HOOK_COUNT=$(find "$CLAUDE_DIR/hooks" -name "*.sh" -type f 2>/dev/null | wc -l | tr -d ' ')
if [ "$HOOK_COUNT" -gt 0 ]; then
  # Check executable
  NON_EXEC=$(find "$CLAUDE_DIR/hooks" -name "*.sh" -type f ! -perm -111 2>/dev/null | wc -l | tr -d ' ')
  if [ "$NON_EXEC" -gt 0 ]; then
    echo "WARN ($HOOK_COUNT hooks, $NON_EXEC not executable)"
    echo "  Fix: chmod +x $CLAUDE_DIR/hooks/*.sh"
  else
    echo "OK ($HOOK_COUNT hooks, all executable)"
  fi
else
  echo "MISSING"
  ERRORS=$((ERRORS + 1))
fi

# 4. Rules
echo -n "Rules: "
RULE_COUNT=$(find "$CLAUDE_DIR/rules" -name "*.md" -type f 2>/dev/null | wc -l | tr -d ' ')
if [ "$RULE_COUNT" -gt 0 ]; then
  echo "OK ($RULE_COUNT rules)"
else
  echo "MISSING"
  ERRORS=$((ERRORS + 1))
fi

# 5. Settings
echo -n "Settings: "
if [ -f "$CLAUDE_DIR/settings.local.json" ]; then
  if python3 -m json.tool "$CLAUDE_DIR/settings.local.json" >/dev/null 2>&1 || node -e "JSON.parse(require('fs').readFileSync('$CLAUDE_DIR/settings.local.json'))" 2>/dev/null; then
    echo "OK (valid JSON)"
  else
    echo "WARN (exists but may have invalid JSON)"
  fi
else
  echo "MISSING"
  ERRORS=$((ERRORS + 1))
fi

# 6. Memory
echo -n "Memory: "
if [ -d "$PROJECT_DIR/memory" ]; then
  MEM_FILES=$(find "$PROJECT_DIR/memory" -name "*.md" -type f 2>/dev/null | wc -l | tr -d ' ')
  echo "OK ($MEM_FILES files)"
else
  echo "MISSING (run: claude-harness init)"
  ERRORS=$((ERRORS + 1))
fi

# 7. Git
echo -n "Git: "
if git -C "$PROJECT_DIR" rev-parse --git-dir >/dev/null 2>&1; then
  BRANCH=$(git -C "$PROJECT_DIR" branch --show-current 2>/dev/null || echo "detached")
  echo "OK (branch: $BRANCH)"
else
  echo "WARN (not a git repo — consider: git init)"
fi

# 8. Claude Code
echo -n "Claude Code: "
if command -v claude &>/dev/null; then
  VERSION=$(claude --version 2>/dev/null || echo "unknown")
  echo "OK ($VERSION)"
else
  echo "NOT INSTALLED"
  echo "  Install: npm install -g @anthropic-ai/claude-code"
  ERRORS=$((ERRORS + 1))
fi

echo ""
if [ "$ERRORS" -eq 0 ]; then
  echo "All checks passed. Your harness is ready."
else
  echo "$ERRORS check(s) failed. Fix them before starting."
fi

exit $ERRORS
