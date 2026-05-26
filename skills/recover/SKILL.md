---
name: recover
description: Recovery protocol when things go wrong. Shows recent changes, offers revert options, re-loads context.
---

## When to Use

- After a failed deployment
- After accidentally breaking something
- When Claude's context seems corrupted or confused
- After a crash or unexpected exit
- When you need to undo recent changes

## Recovery Steps

### Step 1: Assess Damage

```bash
# What changed recently?
git diff --stat HEAD
git log --oneline -5

# Are there uncommitted changes?
git status

# What's in the backup?
ls -la .claude/backups/ | tail -5
```

### Step 2: Context Recovery

1. Read `.claude/anchor-state.md` if it exists (last pre-compaction snapshot)
2. Read `memory/daily/{today}.md` for session history
3. Read `.claude/backups/` for the most recent backup
4. Read `.claude/handoff.md` if it exists (session bridge)

### Step 3: Decide Recovery Strategy

| Situation         | Action                                 |
| ----------------- | -------------------------------------- |
| Bad commit        | `git revert HEAD`                      |
| Uncommitted mess  | `git stash` (save) or `git checkout .` |
| Broken hook       | Check `.claude/settings.local.json`    |
| Corrupted memory  | Restore from `.claude/backups/`        |
| Context confusion | Re-read CLAUDE.md + anchor-state.md    |
| Failed deploy     | Check CI logs, rollback if needed      |

### Step 4: Verify Recovery

- [ ] `git status` is clean (or intentionally dirty)
- [ ] Build passes
- [ ] Tests pass
- [ ] CLAUDE.md is readable and correct
- [ ] Memory files are intact

### Step 5: Post-Mortem

After recovery, answer:

1. What broke?
2. Root cause? (not symptoms)
3. Rule to prevent recurrence? (add to LEARNINGS.md)
