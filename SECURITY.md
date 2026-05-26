# Security Policy

## Scope

claude-harness consists of bash scripts, markdown files, and JSON configuration. It has no runtime dependencies, no network calls, and no daemon processes. The attack surface is limited to the shell scripts that run as Claude Code hooks.

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 1.0.x   | Yes       |

## Reporting a Vulnerability

If you discover a security issue, please report it responsibly:

1. **Do not** open a public GitHub issue for security vulnerabilities
2. Email: Open a private security advisory via [GitHub Security Advisories](https://github.com/naman10parikh/claude-harness/security/advisories/new)
3. Include: description of the vulnerability, steps to reproduce, and potential impact

We will respond within 72 hours and work with you to understand and address the issue.

## What to Look For

Since claude-harness runs shell scripts in your development environment, pay attention to:

- **Command injection** in hook scripts (e.g., unsanitized `$CLAUDE_TOOL_INPUT`)
- **Path traversal** in file operations (e.g., `..` in project paths)
- **Unquoted variables** in bash that could cause word splitting
- **Leaked secrets** in log files or backups (memory/daily/, .claude/backups/)

## Security Design Principles

1. All hook scripts use `set -euo pipefail` for strict error handling
2. The destructive command blocker prevents dangerous system commands
3. The protected file blocker prevents accidental `.env` modifications
4. Backup files are gitignored by default (`.claude/backups/`)
5. No network calls are made by any hook or script
6. No data is sent to external services
