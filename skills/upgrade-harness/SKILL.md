---
name: upgrade-harness
description: Bring a project's installed harness up to the latest claude-harness without losing local edits. Use when someone asks to update or upgrade the harness, to move a project from one tier to another, or when a newer claude-harness ships skills or fixes the project lacks.
---

# Upgrade the Harness

`claude-harness init` writes files once; it does not update them later. A project that installed the
harness months ago misses newer skills and hook fixes, and its own edits (to CLAUDE.md, to a rule,
to a hook) must survive any upgrade. This skill compares the installed harness with a fresh one and
merges file by file.

## When to Use

- Someone asks to update or upgrade the harness.
- The project should move from `starter` to `pro`, or from `pro` to `expert`.
- A newer claude-harness ships a skill or a hook fix the project does not have.

## Steps

1. **Commit first.** Make sure the working tree is clean, so every upgrade change shows in one diff.
2. **Install a fresh copy beside it.** In an empty scratch folder outside the project, run
   `npx -y -p github:naman10parikh/claude-harness claude-harness init --name scratch --language <same> --tier <target> --type <same>`.
3. **Compare.** Run `diff -rq <scratch>/.claude .claude` and `diff -rq <scratch>/scripts scripts`.
   Sort the results into three groups: new files, files that differ, and files only the project has.
4. **Add the new files.** Copy each new skill, hook, rule and script across as it is.
5. **Merge the changed ones.** For each file that differs, read both versions. Keep the project's
   own edits and take the upstream fix. Never overwrite CLAUDE.md or anything under `memory/`.
6. **Keep the project's own files.** Leave files only the project has exactly as they are.
7. **Check it.** Run `bash scripts/verify.sh`, fire the session-start hook once, and review the diff
   before committing.

## Example

Request: "Upgrade this project's harness from starter to pro."

1. A fresh `pro` copy in a scratch folder.
2. The diff shows 3 new skills, 2 new hooks, and a changed `settings.local.json`.
3. The skills and hooks are copied; the settings file is merged by hand to keep the project's own
   PreToolUse rule; verify passes.

## Output

A table of every file added, merged or kept, the verify result, and anything the user should decide.
