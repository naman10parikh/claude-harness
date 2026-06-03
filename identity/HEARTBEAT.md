# claude-harness — Heartbeat

`claude-harness` is a scaffolder CLI, not a long-running daemon, so its "heartbeat" is the set of
checks that keep the shipped payload healthy and in sync with upstream harness improvements.

## Schedule

| Check                         | Frequency                | Action on Anomaly                                        |
| ----------------------------- | ------------------------ | -------------------------------------------------------- |
| Quality gate (`npm test`)     | Every change / pre-push  | Red gate blocks the release — fix additively, re-run     |
| Scaffold eval (`npm run eval`)| Every change / pre-push  | Any failed golden task blocks release — fix, re-run      |
| Payload sync with upstream    | When the upstream harness ships a new skill/rule/hook | Port it into the bundled payload, bump tier docs |
| Leak scan (no secrets/paths)  | Pre-publish              | If a personal path or secret leaks: scrub, re-verify     |
| `.claude/agents/` flatness    | Part of the eval         | If nested in `agents/agents/`: flatten, re-run eval      |

## Health Indicators

- **Healthy:** `npm test` green (19/19), `npm run eval` green (all golden tasks), no leaked
  references in the payload, `.claude/agents/` flat.
- **Warning:** eval passes but a bundled template drifted from upstream, or docs counts are stale.
- **Critical:** test suite or eval red, OR a secret/personal path detected in the payload → block
  the release.

## Recovery

1. Read the failing test / eval output and `memory/LEARNINGS.md` for a known fix.
2. If fixable additively: apply the minimum diff, re-run `npm test` and `npm run eval`.
3. If a leak: scrub the payload (no secrets/personal paths/internal names), re-verify.
4. Log the root cause and the rule that prevents recurrence in `memory/LEARNINGS.md`.

---

> **For forged children:** replace these scaffolder-specific checks with your own project's
> heartbeat (e.g. uptime, queue depth, data freshness). Keep the Schedule / Health / Recovery
> structure; never leave a `{{placeholder}}`.
