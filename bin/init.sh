#!/bin/bash
# claude-harness init — Interactive installer
# Sets up Claude Code harness in your project directory.

set -euo pipefail

HARNESS_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PROJECT_DIR="${1:-$(pwd)}"
CLAUDE_DIR="$PROJECT_DIR/.claude"

echo "claude-harness — Battle-tested Claude Code scaffold"
echo "===================================================="
echo ""
echo "Installing into: $PROJECT_DIR"
echo ""

# Check prerequisites
if ! command -v claude &>/dev/null; then
  echo "Warning: Claude Code CLI not found. Install it first:"
  echo "  npm install -g @anthropic-ai/claude-code"
  echo ""
fi

if ! command -v git &>/dev/null; then
  echo "Error: git is required."
  exit 1
fi

# Ask project type
echo "What type of project is this?"
echo "  1) Web app (Next.js, React, etc.)"
echo "  2) CLI tool (Node.js CLI)"
echo "  3) Agent project (AI agent, LLM app)"
echo ""
read -rp "Choose [1/2/3]: " PROJECT_TYPE

case "$PROJECT_TYPE" in
  1) TYPE="web-app" ;;
  2) TYPE="cli-tool" ;;
  3) TYPE="agent-project" ;;
  *) TYPE="web-app" ;;
esac

echo ""
echo "Setting up $TYPE harness..."
echo ""

# Create directories
mkdir -p "$CLAUDE_DIR/skills" "$CLAUDE_DIR/hooks" "$CLAUDE_DIR/rules" "$CLAUDE_DIR/backups"
mkdir -p "$PROJECT_DIR/memory/daily" "$PROJECT_DIR/resources/unread" "$PROJECT_DIR/resources/read"

# Copy skills
echo "Installing 15 skills..."
for skill_dir in "$HARNESS_DIR/skills"/*/; do
  skill_name=$(basename "$skill_dir")
  mkdir -p "$CLAUDE_DIR/skills/$skill_name"
  cp "$skill_dir/SKILL.md" "$CLAUDE_DIR/skills/$skill_name/SKILL.md"
done

# Copy hooks
echo "Installing 6 hooks..."
cp "$HARNESS_DIR/hooks/"*.sh "$CLAUDE_DIR/hooks/" 2>/dev/null || true
chmod +x "$CLAUDE_DIR/hooks/"*.sh 2>/dev/null || true

# Copy rules
echo "Installing 3 rules..."
cp "$HARNESS_DIR/rules/"*.md "$CLAUDE_DIR/rules/"

# Copy settings template and resolve paths
echo "Configuring hooks in settings.local.json..."
sed "s|\$PROJECT_DIR|$PROJECT_DIR|g" "$HARNESS_DIR/templates/settings.local.json" > "$CLAUDE_DIR/settings.local.json"

# Copy CLAUDE.md template if none exists
if [ ! -f "$PROJECT_DIR/CLAUDE.md" ]; then
  echo "Creating CLAUDE.md template..."
  cp "$HARNESS_DIR/templates/CLAUDE.md.template" "$PROJECT_DIR/CLAUDE.md"
  # Apply example config
  if [ -f "$HARNESS_DIR/examples/$TYPE/CLAUDE.md" ]; then
    cp "$HARNESS_DIR/examples/$TYPE/CLAUDE.md" "$PROJECT_DIR/CLAUDE.md"
  fi
else
  echo "CLAUDE.md already exists — skipping (won't overwrite)."
fi

# Copy memory templates
if [ ! -f "$PROJECT_DIR/memory/MEMORY.md" ]; then
  cp "$HARNESS_DIR/templates/memory/MEMORY.md.template" "$PROJECT_DIR/memory/MEMORY.md"
fi
if [ ! -f "$PROJECT_DIR/memory/LEARNINGS.md" ]; then
  cp "$HARNESS_DIR/templates/memory/LEARNINGS.md.template" "$PROJECT_DIR/memory/LEARNINGS.md"
fi

# Copy scripts
echo "Installing scripts..."
mkdir -p "$PROJECT_DIR/scripts"
cp "$HARNESS_DIR/scripts/auto-switch.sh" "$PROJECT_DIR/scripts/" 2>/dev/null || true
cp "$HARNESS_DIR/scripts/verify.sh" "$PROJECT_DIR/scripts/" 2>/dev/null || true
chmod +x "$PROJECT_DIR/scripts/"*.sh 2>/dev/null || true

# Update .gitignore
if [ -f "$PROJECT_DIR/.gitignore" ]; then
  if ! grep -q ".claude/backups/" "$PROJECT_DIR/.gitignore" 2>/dev/null; then
    echo "" >> "$PROJECT_DIR/.gitignore"
    echo "# claude-harness" >> "$PROJECT_DIR/.gitignore"
    echo ".claude/backups/" >> "$PROJECT_DIR/.gitignore"
    echo ".claude/anchor-state.md" >> "$PROJECT_DIR/.gitignore"
    echo ".claude/last-session-output.md" >> "$PROJECT_DIR/.gitignore"
  fi
fi

echo ""
echo "Done! Installed:"
echo "  15 skills     -> .claude/skills/"
echo "  6 hooks       -> .claude/hooks/"
echo "  3 rules       -> .claude/rules/"
echo "  Hook config   -> .claude/settings.local.json"
echo "  Memory        -> memory/"
echo "  Scripts       -> scripts/"
echo ""
echo "Next steps:"
echo "  1. Edit CLAUDE.md — fill in [PROJECT_NAME] and [FILL_IN] sections"
echo "  2. Run: bash scripts/verify.sh — check your setup"
echo "  3. Start Claude Code: claude"
echo ""
echo "The harness is the product. Same model, 2x output."
