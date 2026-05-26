import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { install, TIERS, HARNESS_ROOT } from "../bin/install.js";
import {
  existsSync,
  readFileSync,
  readdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
  mkdirSync,
  statSync,
} from "fs";
import { join } from "path";
import { tmpdir } from "os";

let tmpDir;

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), "ch-test-"));
});

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});

// ─── Tier structure tests ───

describe("starter tier", () => {
  it("creates correct file structure", () => {
    const result = install({
      projectDir: tmpDir,
      projectName: "my-app",
      language: "typescript",
      tier: "starter",
      projectType: "web-app",
      quiet: true,
    });

    expect(result.skillCount).toBe(2);
    expect(result.hookCount).toBe(2);
    expect(result.ruleCount).toBe(2); // code-quality + typescript
    expect(result.scriptCount).toBe(1);

    // Skills
    expect(
      existsSync(join(tmpDir, ".claude/skills/troubleshoot/SKILL.md")),
    ).toBe(true);
    expect(existsSync(join(tmpDir, ".claude/skills/validate/SKILL.md"))).toBe(
      true,
    );
    expect(existsSync(join(tmpDir, ".claude/skills/deep-think"))).toBe(false);

    // Hooks
    expect(
      existsSync(join(tmpDir, ".claude/hooks/session-start-context.sh")),
    ).toBe(true);
    expect(existsSync(join(tmpDir, ".claude/hooks/stop-verify.sh"))).toBe(true);
    expect(
      existsSync(join(tmpDir, ".claude/hooks/pre-compact-memory-flush.sh")),
    ).toBe(false);

    // Rules
    expect(existsSync(join(tmpDir, ".claude/rules/code-quality.md"))).toBe(
      true,
    );
    expect(existsSync(join(tmpDir, ".claude/rules/typescript.md"))).toBe(true);

    // Settings
    expect(existsSync(join(tmpDir, ".claude/settings.local.json"))).toBe(true);

    // CLAUDE.md
    expect(existsSync(join(tmpDir, "CLAUDE.md"))).toBe(true);

    // Scripts
    expect(existsSync(join(tmpDir, "scripts/verify.sh"))).toBe(true);

    // No memory for starter
    expect(existsSync(join(tmpDir, "memory"))).toBe(false);
  });
});

describe("pro tier", () => {
  it("creates correct file structure", () => {
    const result = install({
      projectDir: tmpDir,
      projectName: "pro-app",
      language: "python",
      tier: "pro",
      projectType: "cli-tool",
      quiet: true,
    });

    expect(result.skillCount).toBe(5);
    expect(result.hookCount).toBe(4);
    expect(result.ruleCount).toBe(3); // code-quality + docs + python
    expect(result.scriptCount).toBe(2);

    // Has memory
    expect(existsSync(join(tmpDir, "memory/MEMORY.md"))).toBe(true);
    expect(existsSync(join(tmpDir, "memory/LEARNINGS.md"))).toBe(true);
    expect(existsSync(join(tmpDir, "memory/daily"))).toBe(true);

    // Has auto-switch
    expect(existsSync(join(tmpDir, "scripts/auto-switch.sh"))).toBe(true);

    // Python rule
    expect(existsSync(join(tmpDir, ".claude/rules/python.md"))).toBe(true);
    const pythonRule = readFileSync(
      join(tmpDir, ".claude/rules/python.md"),
      "utf-8",
    );
    expect(pythonRule).toContain("pydantic");
    expect(pythonRule).toContain("ruff");
  });
});

describe("expert tier", () => {
  it("creates full harness", () => {
    const result = install({
      projectDir: tmpDir,
      projectName: "expert-app",
      language: "general",
      tier: "expert",
      projectType: "agent-project",
      quiet: true,
    });

    expect(result.skillCount).toBe(15);
    expect(result.hookCount).toBe(6);
    // Expert tier ships every bundled rule template (rules: null). The repo
    // bundles 7: agentgrid, code-quality, design, docs, loop-files, react, typescript.
    expect(result.ruleCount).toBe(7);
    expect(result.scriptCount).toBe(2);

    // Has resources directory
    expect(existsSync(join(tmpDir, "resources/unread"))).toBe(true);
    expect(existsSync(join(tmpDir, "resources/read"))).toBe(true);

    // All skills present
    const skills = readdirSync(join(tmpDir, ".claude/skills"));
    expect(skills).toContain("self-improve");
    expect(skills).toContain("deep-think");
    expect(skills).toContain("architect");
    expect(skills).toContain("troubleshoot");
    expect(skills).toContain("skill-creator");

    // All hooks present
    const hooks = readdirSync(join(tmpDir, ".claude/hooks"));
    expect(hooks).toContain("session-start-context.sh");
    expect(hooks).toContain("pre-compact-memory-flush.sh");
    expect(hooks).toContain("post-compact-restore.sh");
    expect(hooks).toContain("context-monitor.sh");
    expect(hooks).toContain("session-end-log.sh");
    expect(hooks).toContain("stop-verify.sh");
  });
});

// ─── CLAUDE.md generation ───

describe("CLAUDE.md", () => {
  it("replaces project name placeholder", () => {
    install({
      projectDir: tmpDir,
      projectName: "My Cool Project",
      language: "typescript",
      tier: "starter",
      projectType: "web-app",
      quiet: true,
    });

    const content = readFileSync(join(tmpDir, "CLAUDE.md"), "utf-8");
    expect(content).not.toContain("[PROJECT_NAME]");
  });

  it("does not overwrite existing CLAUDE.md without force", () => {
    writeFileSync(join(tmpDir, "CLAUDE.md"), "# My existing config\n");

    install({
      projectDir: tmpDir,
      projectName: "test",
      language: "typescript",
      tier: "starter",
      projectType: "web-app",
      quiet: true,
    });

    const content = readFileSync(join(tmpDir, "CLAUDE.md"), "utf-8");
    expect(content).toBe("# My existing config\n");
  });

  it("overwrites existing CLAUDE.md with force", () => {
    writeFileSync(join(tmpDir, "CLAUDE.md"), "# My existing config\n");

    install({
      projectDir: tmpDir,
      projectName: "test",
      language: "typescript",
      tier: "starter",
      projectType: "web-app",
      force: true,
      quiet: true,
    });

    const content = readFileSync(join(tmpDir, "CLAUDE.md"), "utf-8");
    expect(content).not.toBe("# My existing config\n");
  });
});

// ─── Settings generation ───

describe("settings.local.json", () => {
  it("starter has minimal hooks", () => {
    install({
      projectDir: tmpDir,
      projectName: "test",
      language: "typescript",
      tier: "starter",
      projectType: "web-app",
      quiet: true,
    });

    const settings = JSON.parse(
      readFileSync(join(tmpDir, ".claude/settings.local.json"), "utf-8"),
    );
    expect(settings.hooks.SessionStart).toBeDefined();
    expect(settings.hooks.PreToolUse).toBeDefined();
    expect(settings.hooks.Stop).toBeDefined();
    // Starter doesn't have PreCompact or SessionEnd
    expect(settings.hooks.PreCompact).toBeUndefined();
    expect(settings.hooks.SessionEnd).toBeUndefined();
  });

  it("pro has all hooks", () => {
    install({
      projectDir: tmpDir,
      projectName: "test",
      language: "typescript",
      tier: "pro",
      projectType: "web-app",
      quiet: true,
    });

    const settings = JSON.parse(
      readFileSync(join(tmpDir, ".claude/settings.local.json"), "utf-8"),
    );
    expect(settings.hooks.SessionStart).toBeDefined();
    expect(settings.hooks.PreToolUse).toBeDefined();
    expect(settings.hooks.PreCompact).toBeDefined();
    expect(settings.hooks.Stop).toBeDefined();
    expect(settings.hooks.SessionEnd).toBeDefined();
  });

  it("resolves $PROJECT_DIR in paths", () => {
    install({
      projectDir: tmpDir,
      projectName: "test",
      language: "typescript",
      tier: "pro",
      projectType: "web-app",
      quiet: true,
    });

    const raw = readFileSync(
      join(tmpDir, ".claude/settings.local.json"),
      "utf-8",
    );
    expect(raw).not.toContain("$PROJECT_DIR");
    expect(raw).toContain(tmpDir);
  });

  it("includes destructive command blocker", () => {
    install({
      projectDir: tmpDir,
      projectName: "test",
      language: "typescript",
      tier: "starter",
      projectType: "web-app",
      quiet: true,
    });

    const raw = readFileSync(
      join(tmpDir, ".claude/settings.local.json"),
      "utf-8",
    );
    expect(raw).toContain("rm -rf");
    expect(raw).toContain("BLOCKED");
  });
});

// ─── Language-specific rules ───

describe("language rules", () => {
  it("adds typescript.md for TypeScript projects", () => {
    install({
      projectDir: tmpDir,
      projectName: "test",
      language: "typescript",
      tier: "starter",
      projectType: "web-app",
      quiet: true,
    });

    expect(existsSync(join(tmpDir, ".claude/rules/typescript.md"))).toBe(true);
    expect(existsSync(join(tmpDir, ".claude/rules/python.md"))).toBe(false);
  });

  it("generates python.md for Python projects", () => {
    install({
      projectDir: tmpDir,
      projectName: "test",
      language: "python",
      tier: "starter",
      projectType: "web-app",
      quiet: true,
    });

    expect(existsSync(join(tmpDir, ".claude/rules/python.md"))).toBe(true);
    expect(existsSync(join(tmpDir, ".claude/rules/typescript.md"))).toBe(false);
  });

  it("adds no language rule for general", () => {
    install({
      projectDir: tmpDir,
      projectName: "test",
      language: "general",
      tier: "starter",
      projectType: "web-app",
      quiet: true,
    });

    expect(existsSync(join(tmpDir, ".claude/rules/python.md"))).toBe(false);
    expect(existsSync(join(tmpDir, ".claude/rules/typescript.md"))).toBe(false);
  });
});

// ─── Hook executability ───

describe("hook scripts", () => {
  it("are executable", () => {
    install({
      projectDir: tmpDir,
      projectName: "test",
      language: "typescript",
      tier: "expert",
      projectType: "web-app",
      quiet: true,
    });

    const hooksDir = join(tmpDir, ".claude/hooks");
    for (const file of readdirSync(hooksDir)) {
      if (file.endsWith(".sh")) {
        const mode = statSync(join(hooksDir, file)).mode;
        // Check user execute bit
        expect(mode & 0o100).toBeTruthy();
      }
    }
  });
});

// ─── Tier constants ───

describe("TIERS export", () => {
  it("has all three tiers", () => {
    expect(Object.keys(TIERS)).toEqual(["starter", "pro", "expert"]);
  });

  it("starter has limited skills", () => {
    expect(TIERS.starter.skills).toHaveLength(2);
    expect(TIERS.starter.includeMemory).toBe(false);
  });

  it("expert has null (all) for skills/hooks/rules", () => {
    expect(TIERS.expert.skills).toBeNull();
    expect(TIERS.expert.hooks).toBeNull();
    expect(TIERS.expert.rules).toBeNull();
  });
});

// ─── Idempotency ───

describe("idempotency", () => {
  it("can run twice without errors", () => {
    install({
      projectDir: tmpDir,
      projectName: "test",
      language: "typescript",
      tier: "pro",
      projectType: "web-app",
      quiet: true,
    });

    // Running again should not throw
    const result = install({
      projectDir: tmpDir,
      projectName: "test",
      language: "typescript",
      tier: "pro",
      projectType: "web-app",
      force: true,
      quiet: true,
    });

    expect(result.skillCount).toBe(5);
  });
});

// ─── HARNESS_ROOT ───

describe("HARNESS_ROOT", () => {
  it("points to a directory with skills/hooks/rules", () => {
    expect(existsSync(join(HARNESS_ROOT, "skills"))).toBe(true);
    expect(existsSync(join(HARNESS_ROOT, "hooks"))).toBe(true);
    expect(existsSync(join(HARNESS_ROOT, "rules"))).toBe(true);
  });
});
