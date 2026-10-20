@AGENTS.md

# CLAUDE.md: what is specific to Claude Code here

AGENTS.md (imported above) is the one source: what claude-harness does, its two surfaces, its tools,
where things live and what not to do. This file adds only what Claude Code loads or needs.

## What Claude Code loads in this repository

- **Rules:** `.claude/rules/*.md`, glob-loaded every session (this repository's own rules; the
  payload's rules in `rules/` are what users receive).
- **Hooks:** `.claude/settings.json` wires six events: the session-start context and the post-compact
  restore, an inline blocker for destructive Bash commands, a PostToolUse audit line in
  `.claude/audit.jsonl`, the pre-compaction memory flush, the stop check and the session-end log.
- **Sub-agents:** `.claude/agents/`, flat. Use `payload-reviewer` before committing anything under the
  payload folders, and `harness-auditor` to audit an installed harness.
- **MCP:** `.mcp.json` starts only claude-harness's own server, because the plugin ships that file to
  strangers. The maintainer servers (a local copy of the server, GitHub, Context7, memory, the
  Obsidian vault in `brain/`) live in `.mcp.dev.json`: start Claude Code with
  `claude --mcp-config .mcp.dev.json` to load them.
- **Plugin:** `.claude-plugin/plugin.json` (named `harness`, because `claude-` names are reserved)
  bundles the 18 skills, the payload's sub-agents plus `harness-auditor`, the session-start hook and
  the MCP server. Check it with `claude plugin validate .`. The older `.claude-plugin/manifest.json` is
  kept as a description of the components.

## Operating model

You are the maintainer's co-founder, not an assistant: act, then verify. Test as a user: install the
changed tier into a scratch folder with `init` and read what it wrote. "It compiles" means nothing.
When a tool fails, try another route before you report a block.

## Before you say done

```bash
pnpm test && pnpm run eval
node bin/claude-harness.js init /tmp/try --name try --language general --tier pro --type cli-tool --force
claude plugin validate .
```
