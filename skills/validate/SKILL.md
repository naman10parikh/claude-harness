---
name: validate
description: Validate the Claude Code harness setup is internally consistent. Checks skills, hooks, rules, memory, and CLAUDE.md.
---

## When to Use

- After initial setup with `claude-harness init`
- After adding new skills or hooks
- When something seems broken or misconfigured
- Periodically (weekly) as a health check

## Validation Checklist

### 1. CLAUDE.md Health

- [ ] File exists at project root
- [ ] Under 2,000 tokens (roughly 80 lines)
- [ ] No conflicting instructions
- [ ] Skills count matches actual skills directory
- [ ] Referenced files/paths exist

### 2. Skills Integrity

- [ ] Every skill has a `SKILL.md` with valid frontmatter (name, description)
- [ ] Descriptions are under 100 chars
- [ ] No duplicate skill names
- [ ] Skills referenced in CLAUDE.md actually exist on disk

### 3. Hooks Configuration

- [ ] `settings.local.json` exists and is valid JSON
- [ ] All hook scripts referenced in settings exist on disk
- [ ] Hook scripts are executable (`chmod +x`)
- [ ] Hook scripts use `$PROJECT_DIR` (not hardcoded paths)
- [ ] `set -euo pipefail` at the top of each hook script

### 4. Rules Check

- [ ] Rules in `.claude/rules/` have valid glob patterns in frontmatter
- [ ] No contradicting rules
- [ ] Glob patterns match intended file types

### 5. Memory Structure

- [ ] `memory/` directory exists
- [ ] `memory/MEMORY.md` exists (even if empty template)
- [ ] `memory/LEARNINGS.md` exists (even if empty template)
- [ ] `memory/daily/` directory exists

### 6. Environment

- [ ] Node.js >= 18 installed
- [ ] Claude Code CLI installed (`claude --version`)
- [ ] Git repository initialized
- [ ] `.env` exists (if needed) and is in `.gitignore`

## Process

1. Run through each checklist section
2. Report findings as PASS/WARN/FAIL
3. For failures: provide the exact fix command
4. For warnings: explain what might break

## Output Format

```
[PASS] CLAUDE.md exists (74 lines, ~1,800 tokens)
[PASS] 15 skills found, all with valid frontmatter
[WARN] memory/LEARNINGS.md is empty — will populate over time
[FAIL] hooks/session-start-context.sh is not executable
  Fix: chmod +x .claude/hooks/session-start-context.sh
```
