#!/usr/bin/env node

import { program } from "commander";
import { select, input, confirm } from "@inquirer/prompts";
import { existsSync } from "fs";
import { join, resolve } from "path";
import { execSync } from "child_process";
import { install, TIERS } from "./install.js";
import { search as memorySearch, indexStats } from "../lib/memory-search.mjs";
import { logRun } from "../lib/run-log.mjs";
import { loadEnv } from "../lib/load-env.mjs";

// ─── Colors (ANSI escape codes, zero dependencies) ───
const c = {
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  magenta: (s) => `\x1b[35m${s}\x1b[0m`,
};

// ─── Init command ───
async function initCommand(targetDir, options) {
  const projectDir = resolve(targetDir || ".");
  const claudeDir = join(projectDir, ".claude");

  console.log("");
  console.log(c.bold("  claude-harness"));
  console.log(
    c.dim("  Battle-tested Claude Code scaffold. Same model, 2x output."),
  );
  console.log("");

  // Check if already initialized
  if (existsSync(claudeDir) && !options.force) {
    const existing = existsSync(join(claudeDir, "settings.local.json"));
    if (existing) {
      const overwrite = await confirm({
        message: "A harness already exists in this directory. Overwrite?",
        default: false,
      });
      if (!overwrite) {
        console.log(c.yellow("  Aborted. Use --force to skip this check."));
        process.exit(0);
      }
    }
  }

  // Project name
  const dirName = projectDir.split("/").pop() || "my-project";
  const projectName = await input({
    message: "Project name:",
    default: dirName,
  });

  // Language
  const language = await select({
    message: "Primary language:",
    choices: [
      { value: "typescript", name: "TypeScript" },
      { value: "python", name: "Python" },
      { value: "general", name: "General (multi-language)" },
    ],
  });

  // Tier
  const tier = await select({
    message: "Harness level:",
    choices: [
      {
        value: "starter",
        name: `${c.green("Starter")} — ${TIERS.starter.description}`,
      },
      {
        value: "pro",
        name: `${c.cyan("Pro")}     — ${TIERS.pro.description}`,
      },
      {
        value: "expert",
        name: `${c.magenta("Expert")}  — ${TIERS.expert.description}`,
      },
    ],
  });

  // Project type (for CLAUDE.md example selection)
  const projectType = await select({
    message: "Project type:",
    choices: [
      { value: "web-app", name: "Web app (Next.js, React, etc.)" },
      { value: "cli-tool", name: "CLI tool (Node.js CLI)" },
      { value: "agent-project", name: "Agent project (AI agent, LLM app)" },
    ],
  });

  console.log("");
  console.log(c.bold(`  Installing ${TIERS[tier].label} harness...`));
  console.log("");

  const result = install({
    projectDir,
    projectName,
    language,
    tier,
    projectType,
    force: options.force || false,
  });

  const tierConfig = TIERS[tier];

  // ─── Summary ───
  console.log("");
  console.log(
    c.bold(c.green("  Done!")) + ` ${tierConfig.label} harness installed.`,
  );
  console.log("");
  console.log("  What was installed:");
  console.log(
    `    ${c.cyan(String(result.skillCount).padStart(2))} skills      .claude/skills/`,
  );
  console.log(
    `    ${c.cyan(String(result.hookCount).padStart(2))} hooks       .claude/hooks/`,
  );
  console.log(
    `    ${c.cyan(String(result.ruleCount).padStart(2))} rules       .claude/rules/`,
  );
  if (tierConfig.includeMemory) {
    console.log(`    ${c.cyan(" 1")} memory      memory/`);
  }
  console.log(
    `    ${c.cyan(String(result.scriptCount).padStart(2))} scripts     scripts/`,
  );
  console.log("");
  console.log("  Next steps:");
  console.log(
    `    ${c.dim("1.")} Edit ${c.bold("CLAUDE.md")} — fill in project details`,
  );
  console.log(
    `    ${c.dim("2.")} Run  ${c.bold("bash scripts/verify.sh")} — check setup`,
  );
  console.log(
    `    ${c.dim("3.")} Run  ${c.bold("claude")} — hooks activate automatically`,
  );
  console.log("");
  console.log(c.dim("  The harness is the product. Same model, 2x output."));
  console.log("");
}

// ─── Verify command ───
async function verifyCommand() {
  const projectDir = process.cwd();
  const verifyScript = join(projectDir, "scripts", "verify.sh");

  if (existsSync(verifyScript)) {
    try {
      execSync(`bash "${verifyScript}"`, { cwd: projectDir, stdio: "inherit" });
    } catch {
      process.exit(1);
    }
  } else {
    console.log(c.bold("  Verifying harness setup...\n"));
    let pass = 0;
    let fail = 0;

    const checks = [
      ["CLAUDE.md", existsSync(join(projectDir, "CLAUDE.md"))],
      [
        ".claude/settings.local.json",
        existsSync(join(projectDir, ".claude", "settings.local.json")),
      ],
      [".claude/skills/", existsSync(join(projectDir, ".claude", "skills"))],
      [".claude/hooks/", existsSync(join(projectDir, ".claude", "hooks"))],
      [".claude/rules/", existsSync(join(projectDir, ".claude", "rules"))],
    ];

    for (const [name, ok] of checks) {
      if (ok) {
        console.log(`  ${c.green("PASS")} ${name}`);
        pass++;
      } else {
        console.log(`  ${c.red("FAIL")} ${name}`);
        fail++;
      }
    }

    console.log(`\n  ${pass} passed, ${fail} failed`);
    if (fail > 0) process.exit(1);
  }
}

// ─── Memory-search command ───
// Queryable BM25 index over THIS repo's own corpus (brain/, docs/, memory/, identity/, MEMORY.md).
async function memorySearchCommand(query, options) {
  const q = Array.isArray(query) ? query.join(" ") : query;
  if (!q || !q.trim()) {
    console.log(c.red("  Usage: claude-harness memory-search <query> [--limit N]"));
    process.exit(1);
  }
  const limit = Number(options.limit) > 0 ? Number(options.limit) : 5;
  const results = memorySearch(q, { limit });

  // Observability: every query is a recorded run.
  logRun("memory-search", { query: q, limit, hits: results.length });

  const stats = indexStats();
  console.log("");
  console.log(
    c.dim(`  indexed ${stats.chunks} chunks across ${stats.files} files`),
  );
  console.log(c.bold(`  memory-search: "${q}"`));
  console.log("");
  if (results.length === 0) {
    console.log(c.yellow("  No matches."));
    console.log("");
    return;
  }
  results.forEach((r, i) => {
    console.log(
      `  ${c.cyan(String(i + 1).padStart(2))}. ${c.bold(r.rel)}:${r.line}  ${c.dim(`(score ${r.score.toFixed(2)})`)}`,
    );
    console.log(`      ${r.snippet}`);
    console.log("");
  });
}

// ─── Sandbox-run command ───
// Runs the scaffolder's CORE action inside an isolated E2B Firecracker microVM.
async function sandboxRunCommand(options) {
  loadEnv(); // pull E2B_API_KEY from this repo's .env (no overwrite of existing env)
  console.log("");
  console.log(c.bold("  sandbox-run") + c.dim(" — scaffolding inside an E2B sandbox..."));
  if (!process.env.E2B_API_KEY) {
    console.log(c.red("  E2B_API_KEY not found in environment or .env."));
    process.exit(1);
  }
  const { sandboxRun } = await import("../lib/sandbox-run.mjs");
  const result = await sandboxRun({ tier: options.tier || "starter" });
  console.log("");
  console.log(c.dim(`  sandbox: ${result.sandboxId ?? "(none)"}  (${result.durationMs}ms)`));
  if (result.stdout) {
    console.log(c.dim("  --- sandbox output (tail) ---"));
    console.log(
      result.stdout
        .trim()
        .split("\n")
        .slice(-12)
        .map((l) => "  " + l)
        .join("\n"),
    );
  }
  if (result.ok) {
    console.log("");
    console.log(c.green("  PASS") + " harness scaffolded successfully inside the sandbox.");
    console.log("");
  } else {
    console.log("");
    console.log(c.red("  FAIL") + ` ${result.stderr || "sandbox run did not verify"}`);
    console.log("");
    process.exit(1);
  }
}

// ─── CLI setup ───
program
  .name("claude-harness")
  .description("Battle-tested Claude Code scaffold. Same model, 2x output.")
  .version("1.0.0");

program
  .command("init [directory]")
  .description("Initialize a Claude Code harness in your project")
  .option("-f, --force", "Overwrite existing harness files")
  .action(initCommand);

program
  .command("verify")
  .description("Check harness setup is correct")
  .action(verifyCommand);

program
  .command("memory-search <query...>")
  .description("Search this repo's own knowledge corpus (BM25 over brain/docs/memory/identity)")
  .option("-l, --limit <n>", "Max results to return", "5")
  .action(memorySearchCommand);

program
  .command("sandbox-run")
  .description("Run the scaffolder's core action inside an isolated E2B sandbox (proves isolation)")
  .option("-t, --tier <tier>", "Tier to scaffold in the sandbox", "starter")
  .action(sandboxRunCommand);

// Default to init if no command given
program.action(async () => {
  await initCommand(".", {});
});

program.parse();
