---
name: troubleshoot
description: Multi-layer error recovery. Uses docs, web search, learnings, and alternative approaches to unblock errors.
---

## When to Use

When any error repeats twice, or when stuck on the same problem for more than 5 minutes.

## Error Recovery Ladder (escalate through levels)

### Level 1: Memory Check (10 seconds)

- Search `memory/LEARNINGS.md` for the error message or pattern
- If found: apply the documented fix immediately

### Level 2: Docs Check (30 seconds)

- Use context7 MCP or web search to query the relevant library's docs
- Look for the specific API or error message

### Level 3: Web Search (1 minute)

- Search for the exact error message + library name
- Look for GitHub issues, Stack Overflow, blog posts
- Extract the fix and apply it

### Level 4: Codebase Search (1 minute)

- Search similar repos for patterns
- Use `Grep` and `Glob` to find how others solved the same problem
- Check if there's an MCP server that handles this

### Level 5: Alternative Approach (2 minutes)

- Step back. Is there a completely different way to achieve the same goal?
- Can you use a different library? Different API? Different pattern?
- The simplest solution that works is the best solution

### Level 6: Escalate (last resort)

- Write a detailed description with:
  - What you're trying to do
  - What you've tried
  - The exact error
  - Relevant code snippets
- Ask the user for guidance or try a different tool

## Rules

1. NEVER retry the exact same approach more than twice
2. ALWAYS check learnings first — you may have solved this before
3. After fixing: add the solution to `memory/LEARNINGS.md`
4. After fixing: check if a skill or hook should be created to prevent recurrence
5. Time-box each level. If 2 minutes pass with no progress, escalate.
6. When searching: be specific. "react hydration mismatch next.js 15" not "react error"
