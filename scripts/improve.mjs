#!/usr/bin/env node
// The scheduled self-improvement loop (dsip.json `loop.steps`). It is deterministic: no model, no
// secret, no network beyond the package registry. It never commits, pushes or merges; a person reviews
// the proposal it writes and merges any change.
//   review   run the evals and count passing cases
//   extract  compare the count with eval/baseline.json (a drop is a regression)
//   propose  list failing cases and outdated dependencies, write logs/improve/latest.{md,json}
//   try      on a CI runner only, apply the in-range updates and rerun the tests and evals
// `validate` and `ship` happen in a pull request: CI runs the tests and evals, a person merges.
// Exit 1 on a regression, else 0.  Run: pnpm improve
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CONFIG = {
  name: "Claude Harness",
  pm: "pnpm", // the package manager that runs update, test and eval
  evalCmd: ["node", ["eval/run-eval.mjs"]], // prints "=== eval summary: P/T passed ===" and one line per FAIL
  baseline: join(ROOT, "eval", "baseline.json"),
  outDir: join(ROOT, "logs", "improve"),
};

function run(cmd, args) {
  return spawnSync(cmd, args, { cwd: ROOT, encoding: "utf8", shell: process.platform === "win32" });
}

function review() {
  const [cmd, args] = CONFIG.evalCmd;
  const res = run(cmd, args);
  const out = res.stdout || "";
  const m = /eval summary: (\d+)\/(\d+) passed/.exec(out);
  if (!m) return { passed: 0, failed: 0, failures: [`eval run printed no summary (exit ${res.status})`] };
  const failures = out.split("\n").filter((l) => /^\s*FAIL\s/.test(l)).map((l) => l.trim().replace(/^FAIL\s+/, ""));
  return { passed: Number(m[1]), failed: Number(m[2]) - Number(m[1]), failures };
}

const newer = (a, b) => {
  const [x, y] = [a, b].map((v) => String(v).split(/[.-]/).slice(0, 3).map(Number));
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return (x[i] || 0) > (y[i] || 0);
  return false;
};

function outdated() {
  const args = CONFIG.pm === "pnpm" ? ["outdated", "--format", "json"] : ["outdated", "--json"];
  const res = run(CONFIG.pm, args); // exits 1 when anything is outdated
  try {
    const rows = JSON.parse(res.stdout || "{}");
    return Object.entries(rows)
      .map(([pkg, v]) => ({ pkg, current: v.current, wanted: v.wanted, latest: v.latest, deprecated: !!v.isDeprecated }))
      .filter((d) => d.current && (d.deprecated || newer(d.latest, d.current))); // skip uninstalled optional peers
  } catch {
    return [];
  }
}

// try: only on a CI runner (a throwaway VM), apply the in-range updates and rerun the tests and evals.
function trial(deps) {
  const inRange = deps.filter((d) => d.wanted && d.wanted !== d.current);
  if (process.env.CI !== "true" || !inRange.length) return null;
  const ok = [["update"], ["test"], ["run", "eval"]].every((args) => run(CONFIG.pm, args).status === 0);
  return { tried: inRange.map((d) => `${d.pkg}@${d.wanted}`), ok };
}

const base = existsSync(CONFIG.baseline) ? JSON.parse(readFileSync(CONFIG.baseline, "utf8")) : { evals_passed: 0 };
const evals = review();
const regression = evals.failed > 0 || evals.passed < (base.evals_passed ?? 0);
const deps = outdated();
const tried = trial(deps);
const proposals = [
  ...(tried
    ? [`In-range updates (${tried.tried.join(", ")}) were tried on the CI runner: tests and evals ${tried.ok ? "pass, so run `${CONFIG.pm} update` in a pull request" : "fail, so keep the current versions"}.`]
    : []),
  ...evals.failures.map((f) => `Fix the failing eval: ${f}`),
  ...(evals.passed > (base.evals_passed ?? 0) && !evals.failed
    ? [`Raise eval/baseline.json evals_passed from ${base.evals_passed} to ${evals.passed}.`]
    : []),
  ...deps.map((d) =>
    d.deprecated
      ? `Replace ${d.pkg}: the registry marks ${d.current} as deprecated.`
      : `Upgrade ${d.pkg} from ${d.current ?? "none"} to ${d.latest} (wanted ${d.wanted}), then run the tests and evals.`,
  ),
];
const report = {
  repo: CONFIG.name,
  ran: new Date().toISOString(),
  evals: { passed: evals.passed, failed: evals.failed, baseline: base.evals_passed ?? 0 },
  regression,
  trial: tried,
  proposals,
};
mkdirSync(CONFIG.outDir, { recursive: true });
writeFileSync(join(CONFIG.outDir, "latest.json"), JSON.stringify(report, null, 2) + "\n");
const md = [
  `# ${CONFIG.name} improvement proposal`,
  "",
  `Ran ${report.ran}. Evals: ${evals.passed} passed, ${evals.failed} failed (baseline ${report.evals.baseline}).`,
  regression ? "**Regression: do not merge anything until the evals are green again.**" : "No regression.",
  "",
  "## Proposals",
  "",
  ...(proposals.length ? proposals.map((p, i) => `${i + 1}. ${p}`) : ["Nothing to propose today."]),
  "",
  "A person reviews this list. The loop never merges a change.",
].join("\n");
writeFileSync(join(CONFIG.outDir, "latest.md"), md + "\n");
console.log(md);
process.exit(regression ? 1 : 0);
