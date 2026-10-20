#!/usr/bin/env node
// claude-harness scaffold eval — Hamel L1 (invariants) + L2 (live scaffold goldens) + L3 (surfaces).
//
// The harness is the product, so changes to it must be measured, not vibed. This eval asserts the
// scaffold's OWN invariants (skill/hook/rule/sub-agent counts, .claude/agents flatness, llms.txt /
// AGENTS.md presence, a filled SOUL.md) and then actually runs the scaffolder into throwaway dirs
// and checks the resulting tree. L3 runs the surfaces a user or an agent touches: the CLI with flags,
// the MCP server, the plugin's session-start hook, the installed blockers, the plugin manifests and
// memory search.
// Zero new dependencies — Node built-ins + this repo's bin/install.js.
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
import { spawnSync } from "child_process";
import { install } from "../bin/install.js";
import { search as memorySearch } from "../lib/memory-search.mjs";

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

// ─── L3: the surfaces a user or an agent touches ───
const CLI = join(ROOT, "bin", "claude-harness.js");
const sh = (cmd, args, opts = {}) =>
  spawnSync(cmd, args, { encoding: "utf-8", stdio: ["ignore", "pipe", "pipe"], ...opts });
const scratch = (fn) => {
  const tmp = mkdtempSync(join(tmpdir(), "ch-eval-l3-"));
  try {
    return fn(tmp);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
};
function mcp(requests) {
  const input = requests.map((r, i) => JSON.stringify({ jsonrpc: "2.0", id: i + 1, ...r })).join("\n") + "\n";
  const out = spawnSync("node", [join(ROOT, "mcp-server.mjs")], { input, encoding: "utf-8" });
  const byId = new Map(
    out.stdout.split("\n").filter(Boolean).map((l) => {
      const m = JSON.parse(l);
      return [m.id, m];
    }),
  );
  return requests.map((_, i) => byId.get(i + 1));
}
const verdict = (problems, okText) => [problems.length === 0, problems.length ? problems.join("; ") : okText];
const FLAGS = ["--name", "eval", "--language", "typescript", "--tier", "pro", "--type", "web-app"];

const surfaces = {
  cliInitNonInteractive: () =>
    scratch((tmp) => {
      const runs = join(tmp, "runs.jsonl");
      const r = sh("node", [CLI, "init", tmp, ...FLAGS], { env: { ...process.env, CLAUDE_HARNESS_RUNS_FILE: runs } });
      const problems = r.status === 0 ? [] : [`exit ${r.status}`];
      for (const rel of [".claude/settings.local.json", ".claude/skills/self-improve/SKILL.md", "memory/MEMORY.md", "CLAUDE.md"])
        if (!existsSync(join(tmp, rel))) problems.push(`missing ${rel}`);
      const lines = existsSync(runs) ? readFileSync(runs, "utf-8").trim().split("\n").map((l) => JSON.parse(l)) : [];
      if (lines.length !== 1 || lines[0].action !== "scaffold-install" || lines[0].skillCount !== 5)
        problems.push(`run log ${JSON.stringify(lines)}`);
      return verdict(problems, "pro tier installed from flags; one scaffold-install line logged");
    }),
  cliRefusesBadInput: () =>
    scratch((tmp) => {
      const env = { ...process.env, CLAUDE_HARNESS_RUNS_FILE: join(tmp, "runs.jsonl") };
      const bad = sh("node", [CLI, "init", tmp, "--tier", "gold"], { env });
      sh("node", [CLI, "init", tmp, ...FLAGS], { env });
      const again = sh("node", [CLI, "init", tmp, ...FLAGS], { env });
      const problems = [];
      if (bad.status !== 1) problems.push(`unknown tier exit ${bad.status}`);
      if (again.status !== 1 || !again.stdout.includes("--force")) problems.push(`second install exit ${again.status}`);
      return verdict(problems, "unknown tier refused; existing harness kept without --force");
    }),
  mcpListsTools: () => {
    const [, list] = mcp([{ method: "initialize", params: {} }, { method: "tools/list", params: {} }]);
    const names = (list?.result?.tools ?? []).map((t) => t.name).sort();
    const want = ["list_tiers", "memory_search", "scaffold_plan"];
    return verdict(JSON.stringify(names) === JSON.stringify(want) ? [] : [`tools ${names.join(",")}`], `tools ${names.join(", ")}`);
  },
  mcpPlanMatchesInstall: () => {
    const tiers = ["starter", "pro", "expert"];
    const args = { language: "typescript", projectType: "web-app" };
    const answers = mcp(tiers.map((tier) => ({ method: "tools/call", params: { name: "scaffold_plan", arguments: { tier, ...args } } })));
    const problems = [];
    tiers.forEach((tier, i) => {
      const planned = Number(/skills:\s+(\d+)/.exec(answers[i]?.result?.content?.[0]?.text ?? "")?.[1]);
      const real = scratch((tmp) => install({ projectDir: tmp, projectName: "p", tier, ...args, quiet: true }).skillCount);
      if (planned !== real) problems.push(`${tier}: plan ${planned}, install ${real}`);
    });
    return verdict(problems, "scaffold_plan agrees with install() for starter, pro and expert");
  },
  hookSurvivesNoGit: () =>
    scratch((tmp) => {
      const r = sh("bash", [join(ROOT, "hooks", "session-start-context.sh")], { cwd: tmp, env: { ...process.env, CLAUDE_PROJECT_DIR: tmp } });
      return verdict(r.status === 0 && r.stdout.includes("=== READY ===") ? [] : [`exit ${r.status}`], "exit 0 in a folder without git");
    }),
  ownSkillsComplete: () => {
    const problems = [];
    for (const s of ["install-harness", "debug-harness-hooks", "upgrade-harness"]) {
      const f = join(ROOT, "skills", s, "SKILL.md");
      const text = existsSync(f) ? readFileSync(f, "utf-8") : "";
      const fm = /^---\n([\s\S]*?)\n---/.exec(text);
      if (!fm || !/^name:\s*\S/m.test(fm[1]) || !/^description:\s*\S/m.test(fm[1])) problems.push(`${s}: frontmatter`);
      for (const h of ["## When to Use", "## Steps", "## Example", "## Output"]) if (!text.includes(h)) problems.push(`${s}: ${h}`);
    }
    return verdict(problems, "install-harness, debug-harness-hooks, upgrade-harness complete");
  },
  pluginWired: () => {
    const read = (rel) => JSON.parse(readFileSync(join(ROOT, rel), "utf-8"));
    const plugin = read(".claude-plugin/plugin.json");
    const market = read(".claude-plugin/marketplace.json");
    const scripts = JSON.stringify(read("hooks/hooks.json")).match(/hooks\/[\w.-]+\.sh/g) ?? [];
    const problems = [];
    // "claude-" names are reserved for Anthropic's own plugins, so the plugin is called "harness".
    if (plugin.name !== "harness") problems.push("plugin name");
    if (market.plugins?.[0]?.source !== "./") problems.push("marketplace source");
    for (const a of plugin.agents ?? []) if (!existsSync(join(ROOT, a))) problems.push(`missing ${a}`);
    for (const s of scripts) if (!existsSync(join(ROOT, s))) problems.push(`missing ${s}`);
    if (!scripts.length) problems.push("no hook script wired");
    return verdict(problems, `plugin resolves: ${(plugin.agents ?? []).length} agents, ${scripts.length} hook script`);
  },
  blockersWork: () =>
    scratch((tmp) => {
      const problems = [];
      const fire = (cmd, event) => spawnSync("bash", ["-c", cmd], { input: JSON.stringify(event), encoding: "utf-8" }).status;
      for (const tier of ["starter", "pro"]) {
        const dir = join(tmp, tier);
        install({ projectDir: dir, projectName: "b", language: "general", tier, projectType: "cli-tool", quiet: true });
        const pre = JSON.parse(readFileSync(join(dir, ".claude", "settings.local.json"), "utf-8")).hooks?.PreToolUse ?? [];
        const cmdFor = (m) => pre.find((h) => h.matcher === m)?.hooks?.[0]?.command;
        const bash = cmdFor("Bash");
        if (!bash) problems.push(`${tier}: no Bash blocker`);
        else {
          if (fire(bash, { tool_name: "Bash", tool_input: { command: "rm -rf / --no-preserve-root" } }) !== 2) problems.push(`${tier}: rm -rf / not blocked`);
          if (fire(bash, { tool_name: "Bash", tool_input: { command: "ls -la" } }) !== 0) problems.push(`${tier}: ls blocked`);
        }
        if (tier === "pro") {
          const file = cmdFor("Write|Edit");
          if (!file) problems.push("pro: no file blocker");
          else {
            if (fire(file, { tool_name: "Write", tool_input: { file_path: join(dir, ".env"), content: "X=1" } }) !== 2) problems.push("pro: .env not blocked");
            if (fire(file, { tool_name: "Write", tool_input: { file_path: join(dir, "src", "a.ts"), content: "x" } }) !== 0) problems.push("pro: src/a.ts blocked");
          }
        }
      }
      return verdict(problems, "Bash blocker stops rm -rf / and allows ls (starter, pro); file blocker stops .env, allows src/ (pro)");
    }),
  memorySearchFinds: () => {
    const hits = memorySearch("pre-compact memory flush anchor state", { limit: 3 });
    return verdict(hits[0]?.rel?.startsWith("docs/") ? [] : [`top hit ${hits[0]?.rel ?? "(none)"}`], `top hit ${hits[0]?.rel}`);
  },
};

console.log("\n=== L3 — surfaces ===");
for (const task of spec.level3_surfaces ?? []) {
  const fn = surfaces[task.check];
  if (!fn) {
    record(task.id, false, `no checker for "${task.check}"`);
    continue;
  }
  try {
    const [ok, detail] = fn();
    record(task.id, ok, detail);
  } catch (err) {
    record(task.id, false, `threw: ${err.message}`);
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
