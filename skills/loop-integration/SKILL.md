---
name: loop-integration
description: Scheduled task integration. Session-scoped cron jobs via CronCreate/CronList/CronDelete for monitoring and automation.
---

## When to Use

When you need: cron jobs, scheduled tasks, periodic checks, monitoring loops, polling, reminders, recurring tasks.

## Key Constraints

- **Session-scoped**: tasks die when Claude Code exits
- **Max 50 tasks** per session
- **3-day expiry** for recurring tasks
- **Fires between turns** (not during a response)
- **Local timezone** for all cron expressions
- For durable scheduling: use GitHub Actions or Desktop scheduled tasks

## Tools Available

| Tool         | Purpose                                              |
| ------------ | ---------------------------------------------------- |
| `CronCreate` | Schedule task: cron expression + prompt + recur flag |
| `CronList`   | List all tasks with IDs, schedules, prompts          |
| `CronDelete` | Cancel task by 8-char ID                             |

## Interval Syntax (via /loop)

- `/loop 5m check the build` — every 5 minutes
- `/loop 2h run tests` — every 2 hours
- `/loop check status` — defaults to every 10 minutes
- Supports: `s` (seconds), `m` (minutes), `h` (hours), `d` (days)

## Common Use Cases

### Development Workflow

1. **Build monitoring**: `/loop 5m check if the deploy finished`
2. **Test polling**: `/loop 10m run tests and report failures`
3. **PR babysitting**: `/loop 15m check PR #N status and CI results`
4. **Memory consolidation**: `/loop 1h compress today's daily log entries`

### Agent Runtime

1. **Heartbeat monitoring**: Every 5 min — check health
2. **Memory compaction**: Every 6h — compress memory
3. **Proactive intelligence**: Daily — morning briefing prep

## Cron Expression Reference

| Expression    | Meaning         |
| ------------- | --------------- |
| `*/5 * * * *` | Every 5 minutes |
| `0 * * * *`   | Every hour      |
| `0 9 * * *`   | Daily at 9am    |
| `0 9 * * 1-5` | Weekdays at 9am |
| `0 */6 * * *` | Every 6 hours   |

## Steps

1. Identify what needs periodic execution
2. Choose interval (how fast does the state change?)
3. Write the prompt (can invoke other skills)
4. CronCreate with appropriate schedule
5. Verify with CronList
6. Monitor results, adjust interval as needed
