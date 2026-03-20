// Core install logic — separated from CLI prompts for testability.

import {
  mkdirSync,
  cpSync,
  existsSync,
  readFileSync,
  writeFileSync,
  readdirSync,
  chmodSync,
  statSync,
} from "fs";
import { join, dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export const HARNESS_ROOT = resolve(__dirname, "..");

// ─── Tier definitions ───
export const TIERS = {
  starter: {
    label: "Starter",
    description: "CLAUDE.md + 2 rules + 1 skill + session hook",
    skills: ["troubleshoot", "validate"],
    hooks: ["session-start-context.sh", "stop-verify.sh"],
    rules: ["code-quality.md"],
    scripts: ["verify.sh"],
    includeMemory: false,
    includeAutoSwitch: false,
  },
  pro: {
    label: "Pro",
    description: "5 skills + 4 hooks + memory + scripts",
    skills: [
      "troubleshoot",
      "validate",
      "deep-think",
      "architect",
      "self-improve",
    ],
    hooks: [
      "session-start-context.sh",
      "stop-verify.sh",
      "pre-compact-memory-flush.sh",
      "session-end-log.sh",
    ],
    rules: ["code-quality.md", "docs.md"],
    scripts: ["verify.sh", "auto-switch.sh"],
    includeMemory: true,
    includeAutoSwitch: false,
  },
  expert: {
    label: "Expert",
    description: "Full Energy-grade harness (everything)",
    skills: null,
    hooks: null,
    rules: null,
    scripts: null,
    includeMemory: true,
    includeAutoSwitch: true,
  },
};

// ─── Helpers ───
function copyDir(src, dest) {
  if (!existsSync(src)) return 0;
  mkdirSync(dest, { recursive: true });
  let count = 0;
  for (const entry of readdirSync(src, { withFileTypes: true })) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);
    if (entry.isDirectory()) {
      count += copyDir(srcPath, destPath);
    } else {
      cpSync(srcPath, destPath);
      count++;
    }
  }
  return count;
}

function copyFile(src, dest) {
  mkdirSync(dirname(dest), { recursive: true });
  cpSync(src, dest);
}

function makeExecutable(dir) {
  if (!existsSync(dir)) return;
  for (const f of readdirSync(dir)) {
    const fp = join(dir, f);
    if (statSync(fp).isFile() && f.endsWith(".sh")) {
      chmodSync(fp, 0o755);
    }
  }
}

function gitCheck(projectDir) {
  try {
    execSync("git rev-parse --is-inside-work-tree", {
      cwd: projectDir,
      stdio: "pipe",
    });
    return true;
  } catch {
    return false;
  }
}

function updateGitignore(projectDir) {
  const gitignorePath = join(projectDir, ".gitignore");
  const additions = [
    "",
    "# claude-harness",
    ".claude/backups/",
    ".claude/anchor-state.md",
    ".claude/last-session-output.md",
  ];

  if (existsSync(gitignorePath)) {
    const content = readFileSync(gitignorePath, "utf-8");
    if (content.includes(".claude/backups/")) return;
    writeFileSync(gitignorePath, content + additions.join("\n") + "\n");
  } else {
    writeFileSync(gitignorePath, additions.slice(1).join("\n") + "\n");
  }
}

function generatePythonRule() {
  return `# Python Code Standards

- Type hints on all function signatures (PEP 484)
- Use \`pydantic\` or \`dataclasses\` for data models
- No bare \`except:\` — always catch specific exceptions
- Use \`pathlib.Path\` over \`os.path\`
- Docstrings on public functions (Google style)
- Use \`ruff\` for linting, \`black\` for formatting
- Files under 400 lines. Break into modules when exceeded.
- Prefer composition over inheritance
- Use \`logging\` module, never \`print()\` for diagnostics
`;
}

function generateSettingsJson(projectDir, tier) {
  const template = readFileSync(
    join(HARNESS_ROOT, "templates", "settings.local.json"),
    "utf-8",
  );

  if (tier === "starter") {
    const minimal = {
      $schema: "https://json.schemastore.org/claude-code-settings.json",
      env: { CLAUDE_AUTOCOMPACT_PCT_OVERRIDE: "80" },
      hooks: {
        SessionStart: [
          {
            hooks: [
              {
                type: "command",
                command: `${projectDir}/.claude/hooks/session-start-context.sh`,
              },
            ],
          },
        ],
        PreToolUse: [
          {
            matcher: "Bash",
            hooks: [
              {
                type: "command",
                command:
                  "if echo \"$CLAUDE_TOOL_INPUT\" | grep -qE '(rm -rf /|rm -rf ~/|sudo rm -rf|> /dev/sda|mkfs|dd if=/dev)'; then echo 'BLOCKED: Destructive system command detected.' >&2; exit 2; fi",
              },
            ],
          },
        ],
        Stop: [
          {
            hooks: [
              {
                type: "command",
                command: `${projectDir}/.claude/hooks/stop-verify.sh`,
              },
            ],
          },
        ],
      },
    };
    return JSON.stringify(minimal, null, 2);
  }

  return template.replace(/\$PROJECT_DIR/g, projectDir);
}

/**
 * Core install function. Takes resolved options, no prompts.
 * @param {object} opts
 * @param {string} opts.projectDir - Absolute path to target directory
 * @param {string} opts.projectName - Display name
 * @param {string} opts.language - typescript | python | general
 * @param {string} opts.tier - starter | pro | expert
 * @param {string} opts.projectType - web-app | cli-tool | agent-project
 * @param {boolean} [opts.force] - Overwrite existing files
 * @param {boolean} [opts.quiet] - Suppress console output
 * @returns {{ skillCount: number, hookCount: number, ruleCount: number, scriptCount: number }}
 */
export function install(opts) {
  const {
    projectDir,
    projectName,
    language,
    tier,
    projectType,
    force = false,
    quiet = false,
  } = opts;
  const claudeDir = join(projectDir, ".claude");
  const tierConfig = TIERS[tier];
  const log = quiet ? () => {} : (msg) => console.log(msg);

  // ─── Create directories ───
  mkdirSync(join(claudeDir, "skills"), { recursive: true });
  mkdirSync(join(claudeDir, "hooks"), { recursive: true });
  mkdirSync(join(claudeDir, "rules"), { recursive: true });
  mkdirSync(join(claudeDir, "backups"), { recursive: true });

  if (tierConfig.includeMemory) {
    mkdirSync(join(projectDir, "memory", "daily"), { recursive: true });
  }
  if (tier === "expert") {
    mkdirSync(join(projectDir, "resources", "unread"), { recursive: true });
    mkdirSync(join(projectDir, "resources", "read"), { recursive: true });
  }

  // ─── Copy skills ───
  const skillsSrc = join(HARNESS_ROOT, "skills");
  let skillCount = 0;
  if (tierConfig.skills === null) {
    skillCount = copyDir(skillsSrc, join(claudeDir, "skills"));
  } else {
    for (const skill of tierConfig.skills) {
      const src = join(skillsSrc, skill);
      if (existsSync(src)) {
        copyDir(src, join(claudeDir, "skills", skill));
        skillCount++;
      }
    }
  }
  log(`  + ${skillCount} skills -> .claude/skills/`);

  // ─── Copy hooks ───
  const hooksSrc = join(HARNESS_ROOT, "hooks");
  let hookCount = 0;
  if (tierConfig.hooks === null) {
    for (const f of readdirSync(hooksSrc)) {
      if (f.endsWith(".sh")) {
        copyFile(join(hooksSrc, f), join(claudeDir, "hooks", f));
        hookCount++;
      }
    }
  } else {
    for (const hook of tierConfig.hooks) {
      const src = join(hooksSrc, hook);
      if (existsSync(src)) {
        copyFile(src, join(claudeDir, "hooks", hook));
        hookCount++;
      }
    }
  }
  makeExecutable(join(claudeDir, "hooks"));
  log(`  + ${hookCount} hooks -> .claude/hooks/`);

  // ─── Copy rules ───
  const rulesSrc = join(HARNESS_ROOT, "rules");
  let ruleCount = 0;
  if (tierConfig.rules === null) {
    for (const f of readdirSync(rulesSrc)) {
      if (f.endsWith(".md")) {
        copyFile(join(rulesSrc, f), join(claudeDir, "rules", f));
        ruleCount++;
      }
    }
  } else {
    for (const rule of tierConfig.rules) {
      const src = join(rulesSrc, rule);
      if (existsSync(src)) {
        copyFile(src, join(claudeDir, "rules", rule));
        ruleCount++;
      }
    }
  }

  // Add language-specific rule
  if (language === "typescript") {
    const tsRule = join(rulesSrc, "typescript.md");
    if (
      existsSync(tsRule) &&
      !existsSync(join(claudeDir, "rules", "typescript.md"))
    ) {
      copyFile(tsRule, join(claudeDir, "rules", "typescript.md"));
      ruleCount++;
    }
  } else if (language === "python") {
    writeFileSync(join(claudeDir, "rules", "python.md"), generatePythonRule());
    ruleCount++;
  }
  log(`  + ${ruleCount} rules -> .claude/rules/`);

  // ─── Generate settings.local.json ───
  const settingsContent = generateSettingsJson(projectDir, tier);
  writeFileSync(join(claudeDir, "settings.local.json"), settingsContent);

  // ─── CLAUDE.md ───
  if (!existsSync(join(projectDir, "CLAUDE.md")) || force) {
    const examplePath = join(
      HARNESS_ROOT,
      "examples",
      projectType,
      "CLAUDE.md",
    );
    const templatePath = join(HARNESS_ROOT, "templates", "CLAUDE.md.template");
    let claudeContent;

    if (existsSync(examplePath)) {
      claudeContent = readFileSync(examplePath, "utf-8");
    } else {
      claudeContent = readFileSync(templatePath, "utf-8");
    }

    claudeContent = claudeContent
      .replace(/\[PROJECT_NAME\]/g, projectName)
      .replace(/\[SKILL_COUNT\]/g, String(skillCount));

    writeFileSync(join(projectDir, "CLAUDE.md"), claudeContent);
  }

  // ─── Memory templates ───
  if (tierConfig.includeMemory) {
    const memoryDir = join(projectDir, "memory");
    if (!existsSync(join(memoryDir, "MEMORY.md"))) {
      copyFile(
        join(HARNESS_ROOT, "templates", "memory", "MEMORY.md.template"),
        join(memoryDir, "MEMORY.md"),
      );
    }
    if (!existsSync(join(memoryDir, "LEARNINGS.md"))) {
      copyFile(
        join(HARNESS_ROOT, "templates", "memory", "LEARNINGS.md.template"),
        join(memoryDir, "LEARNINGS.md"),
      );
    }
  }

  // ─── Scripts ───
  const scriptsSrc = join(HARNESS_ROOT, "scripts");
  let scriptCount = 0;
  if (tierConfig.scripts === null) {
    for (const f of readdirSync(scriptsSrc)) {
      if (f.endsWith(".sh")) {
        mkdirSync(join(projectDir, "scripts"), { recursive: true });
        copyFile(join(scriptsSrc, f), join(projectDir, "scripts", f));
        scriptCount++;
      }
    }
  } else {
    for (const script of tierConfig.scripts) {
      const src = join(scriptsSrc, script);
      if (existsSync(src)) {
        mkdirSync(join(projectDir, "scripts"), { recursive: true });
        copyFile(src, join(projectDir, "scripts", script));
        scriptCount++;
      }
    }
  }
  if (scriptCount > 0) {
    makeExecutable(join(projectDir, "scripts"));
  }

  // ─── .gitignore update ───
  if (gitCheck(projectDir)) {
    updateGitignore(projectDir);
  }

  return { skillCount, hookCount, ruleCount, scriptCount };
}
