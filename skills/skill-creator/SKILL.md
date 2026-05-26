---
name: skill-creator
description: Auto-generate new skills from learnings and repeated patterns. The meta-skill that makes the harness self-improving.
---

## When to Use

- After discovering a repeatable pattern across 2+ sessions
- When the user explicitly approves a workflow ("always do X")
- When LEARNINGS.md has 3+ entries about the same topic
- When a sub-agent finds a new capability worth capturing

## Process

### 1. Source Mining

Scan these sources for skill candidates:

- `memory/LEARNINGS.md` — repeated corrections = skill gaps
- `memory/MEMORY.md` — confirmed patterns = skill candidates
- `memory/daily/*.md` — workflows that worked = codify them
- Session transcript — what did the user approve? correct? praise?

### 2. Skill Candidate Evaluation

| Axis            | Question                                       | Threshold               |
| --------------- | ---------------------------------------------- | ----------------------- |
| **Frequency**   | How often would this skill be triggered?       | 2+ times/week           |
| **Complexity**  | Does it need multi-step instructions?          | 3+ steps                |
| **Error-prone** | Do we keep getting it wrong without the skill? | 2+ mistakes             |
| **Reusable**    | Does it apply across projects?                 | Cross-project preferred |

Score >= 3/4 axes: create the skill.

### 3. Skill Template

```markdown
---
name: { skill-name }
description: { one-line description, under 100 chars }
---

## When to Use

- {trigger condition 1}
- {trigger condition 2}

## Process

### Step 1: {Action}

{What to do, what to check}

### Step 2: {Action}

{What to do, what to check}

## Output

- {What the skill produces}
- {How to verify it worked}
```

### 4. Skill Creation Checklist

1. Write `SKILL.md` to `.claude/skills/{skill-name}/SKILL.md`
2. Description must be under 100 chars (for ~70 token routing)
3. Add trigger patterns that skill-routing can match
4. If the skill involves code patterns, include inline examples
5. If the skill involves external tools, document the setup
6. Update CLAUDE.md skills count

### 5. Skill Categories

| Category    | Purpose                    | Examples                               |
| ----------- | -------------------------- | -------------------------------------- |
| **Build**   | Code generation patterns   | app-factory, component scaffolding     |
| **Meta**    | Self-improvement, research | self-improve, deep-think               |
| **Ops**     | Setup, deployment, infra   | mcp-setup, secrets-setup               |
| **Capture** | Knowledge capture          | transcript-to-insight, resource-digest |

### 6. Evals (Testing Skills)

For each skill, define test cases:

```markdown
## Evals

### Test 1: {scenario}

- **Prompt:** "{test input that should trigger the skill}"
- **Expected:** {description of correct output}
```

Evals check that:

- The skill triggers when it should (no false negatives)
- The skill doesn't trigger when it shouldn't (no false positives)
- Output quality meets the bar

## Verification

After creating a skill:

- Confirm it appears in skill count
- Confirm skill-routing can find it with relevant keywords
- Confirm the description fits in ~70 tokens
- Write at least 2 evals per skill
