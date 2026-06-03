#!/usr/bin/env node
// claude-harness scaffold eval — Hamel L1 (invariants) + L2 (live scaffold goldens).
//
// The harness is the product, so changes to it must be measured, not vibed. This eval asserts the
// scaffold's OWN invariants (skill/hook/rule/sub-agent counts, .claude/agents flatness, llms.txt /
// AGENTS.md presence, a filled SOUL.md) and then actually runs the scaffolder into throwaway dirs
// and checks the resulting tree. Zero new dependencies — Node built-ins + this repo's bin/install.js.
//
// Run: npm run eval   (or: node eval/run-eval.mjs)
// Exit 0 = all golden tasks pass (release unblocked). Exit 1 = a red eval (release blocked).

import {
  existsSync,
  readFileSync,
  readdirSync,
  mkdtempSync,
  rmSync,
  statSync,
} from "fs";
import { join, dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { tmpdir } from "os";
import { install } from "../bin/install.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const spec = JSON.parse(
  readFileSync(join(__dirname, "golden-tasks.json"), "utf-8"),
);

// ─── result accounting ───
let passed = 0;
let failed = 0;
const failures = [];

function record(id, ok, detail) {
  if (ok) {
    passed++;
    console.log(`  PASS  ${id}${detail ? ` — ${detail}` : ""}`);
  } else {
    failed++;
    failures.push(`${id}: ${detail}`);
    console.log(`  FAIL  ${id} — ${detail}`);
  }
}

function compare(op, actual, expected) {
  if (op === "eq") return actual === expected;
  if (op === "gte") return actual >= expected;
  if (op === "gt") return actual > expected;
  throw new Error(`unknown op: ${op}`);
}

// ─── invariant computers (read straight from the repo payload) ───
function listDirs(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);
}

function listFiles(dir, ext) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isFile() && (!ext || e.name.endsWith(ext)))
    .map((e) => e.name);
}

const checks = {
  skillCount: () => listDirs(join(ROOT, "skills")).length,
  everySkillHasFrontmatter: () =>
    listDirs(join(ROOT, "skills")).every((s) => {
      const f = join(ROOT, "skills", s, "SKILL.md");
      return existsSync(f) && readFileSync(f, "utf-8").startsWith("---");
    }),
  hookCount: () => listFiles(join(ROOT, "hooks"), ".sh").length,
  everyHookHasShebang: () =>
    listFiles(join(ROOT, "hooks"), ".sh").every((h) =>
      readFileSync(join(ROOT, "hooks", h), "utf-8").startsWith("#!/bin/bash"),
    ),
  ruleCount: () => listFiles(join(ROOT, "rules"), ".md").length,
  agentCount: () => listFiles(join(ROOT, "agents"), ".md").length,
  // The forge double-nest bug created .claude/agents/agents/. Assert it's absent.
  claudeAgentsFlat: () => !existsSync(join(ROOT, ".claude", "agents", "agents")),
  llmsTxtExists: () => existsSync(join(ROOT, "llms.txt")),
  agentsMdExists: () => existsSync(join(ROOT, "AGENTS.md")),
  soulFilled: () => {
    const f = join(ROOT, "identity", "SOUL.md");
    if (!existsSync(f)) return false;
    return !/\{\{[A-Z][A-Z0-9_]*\}\}/.test(readFileSync(f, "utf-8"));
  },
  identityNoPlaceholders: () => {
    const dir = join(ROOT, "identity");
    if (!existsSync(dir)) return false;
    return listFiles(dir, ".md").every(
      (f) => !/\{\{[A-Z][A-Z0-9_]*\}\}/.test(readFileSync(join(dir, f), "utf-8")),
    );
  },
};

// ─── L1: invariants ───
console.log("\n=== L1 — scaffold invariants ===");
for (const task of spec.level1_invariants) {
  const fn = checks[task.check];
  if (!fn) {
    record(task.id, false, `no checker for "${task.check}"`);
    continue;
  }
  const actual = fn();
  const ok = compare(task.op, actual, task.expected);
  record(task.id, ok, `${task.check}=${JSON.stringify(actual)} (${task.op} ${JSON.stringify(task.expected)})`);
}

// ─── L2: live scaffold goldens ───
console.log("\n=== L2 — live scaffold goldens ===");
for (const task of spec.level2_scaffold_goldens) {
  const tmp = mkdtempSync(join(tmpdir(), "ch-eval-"));
  try {
    const result = install({
      projectDir: tmp,
      projectName: "eval-target",
      language: task.language,
      tier: task.tier,
      projectType: task.projectType,
      quiet: true,
    });

    const e = task.expect;
    const problems = [];

    if (typeof e.skillCount === "number" && result.skillCount !== e.skillCount)
      problems.push(`skillCount=${result.skillCount} (want ${e.skillCount})`);
    if (typeof e.hookCountGte === "number" && result.hookCount < e.hookCountGte)
      problems.push(`hookCount=${result.hookCount} (want >=${e.hookCountGte})`);

    for (const rel of e.files || [])
      if (!existsSync(join(tmp, rel))) problems.push(`missing ${rel}`);
    for (const rel of e.absentFiles || [])
      if (existsSync(join(tmp, rel))) problems.push(`should be absent: ${rel}`);
    for (const rel of e.noJunk || [])
      if (existsSync(join(tmp, rel))) problems.push(`junk leaked: ${rel}`);

    record(
      task.id,
      problems.length === 0,
      problems.length === 0
        ? `${task.tier} tier scaffolded clean`
        : problems.join("; "),
    );
  } catch (err) {
    record(task.id, false, `threw: ${err.message}`);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

// ─── summary ───
const total = passed + failed;
console.log(`\n=== eval summary: ${passed}/${total} passed ===`);
if (failed > 0) {
  console.log("RED EVAL — release blocked. Failures:");
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}
console.log("GREEN — scaffold invariants hold; release unblocked.");
process.exit(0);
