// sandbox-run.mjs — run claude-harness's CORE action inside an isolated E2B sandbox.
//
// The product's core action is "scaffold a Claude Code harness into a project". Running that
// against a real project mutates that project's filesystem, runs hook shell scripts, and (for
// the verify step) executes the scaffolded code. `sandbox-run` does it in a throwaway E2B
// Firecracker microVM instead of the host: it boots a sandbox, drops a tiny project + this
// repo's bin/init.sh payload into it, runs the scaffolder, and asserts the harness installed.
// That is genuine isolation at a real integration point — exactly where a scaffolder/agent
// should NOT touch the host when it can run untrusted/agent-driven steps in a sandbox.
//
// Uses the official E2B SDK (`e2b`, `Sandbox.create` / `sandbox.commands.run`), the same SDK
// and pattern as Energy's packages/runtime/src/sandbox/container-runner.ts. The E2B_API_KEY is
// read from this repo's .env (loaded by the CLI before calling here).

import { readFileSync, readdirSync, existsSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";
import { logRun } from "./run-log.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");

/**
 * Collect a representative-but-REAL subset of the scaffolder payload to stage in the sandbox,
 * so the actual bin/init.sh runs against actual skills/hooks/rules/templates/examples — not a
 * mock. We cap each dir to keep the upload small while still exercising the real copy logic.
 * Returns a list of { remotePath, content } file writes relative to the sandbox HARNESS dir.
 */
function collectPayload(harnessRemote) {
  const writes = [];
  const add = (absFile, remoteFile) => {
    if (existsSync(absFile)) {
      writes.push({ remotePath: remoteFile, content: readFileSync(absFile, "utf-8") });
    }
  };

  // init.sh itself (the entry point under test) lives at <harness>/bin/init.sh.
  add(join(REPO_ROOT, "bin", "init.sh"), `${harnessRemote}/bin/init.sh`);

  // A couple of real skills (init.sh iterates skills/*/SKILL.md).
  const skillsDir = join(REPO_ROOT, "skills");
  if (existsSync(skillsDir)) {
    for (const s of readdirSync(skillsDir).slice(0, 2)) {
      add(join(skillsDir, s, "SKILL.md"), `${harnessRemote}/skills/${s}/SKILL.md`);
    }
  }
  // A real hook + a real rule (init.sh globs hooks/*.sh and rules/*.md).
  add(join(REPO_ROOT, "hooks", "stop-verify.sh"), `${harnessRemote}/hooks/stop-verify.sh`);
  add(join(REPO_ROOT, "rules", "code-quality.md"), `${harnessRemote}/rules/code-quality.md`);
  // The settings + CLAUDE.md templates init.sh copies.
  add(
    join(REPO_ROOT, "templates", "settings.local.json"),
    `${harnessRemote}/templates/settings.local.json`,
  );
  add(
    join(REPO_ROOT, "templates", "CLAUDE.md.template"),
    `${harnessRemote}/templates/CLAUDE.md.template`,
  );
  add(
    join(REPO_ROOT, "templates", "memory", "MEMORY.md.template"),
    `${harnessRemote}/templates/memory/MEMORY.md.template`,
  );
  add(
    join(REPO_ROOT, "templates", "memory", "LEARNINGS.md.template"),
    `${harnessRemote}/templates/memory/LEARNINGS.md.template`,
  );
  add(
    join(REPO_ROOT, "examples", "cli-tool", "CLAUDE.md"),
    `${harnessRemote}/examples/cli-tool/CLAUDE.md`,
  );
  add(join(REPO_ROOT, "scripts", "verify.sh"), `${harnessRemote}/scripts/verify.sh`);
  return writes;
}

/**
 * Boot an E2B sandbox and run the scaffolder's init inside it.
 *
 * @param {object} [opts]
 * @param {string} [opts.tier="starter"] - which tier's CLAUDE.md example to seed (passes "2" = cli-tool to init.sh).
 * @returns {Promise<{ ok: boolean, sandboxId: string|null, exitCode: number, stdout: string, stderr: string, durationMs: number }>}
 */
export async function sandboxRun(opts = {}) {
  const start = performance.now();
  const apiKey = process.env.E2B_API_KEY;
  if (!apiKey) {
    const r = {
      ok: false,
      sandboxId: null,
      exitCode: 1,
      stdout: "",
      stderr: "E2B_API_KEY not set (expected in .env)",
      durationMs: 0,
    };
    logRun("sandbox-run", { ok: r.ok, reason: "no-api-key" });
    return r;
  }

  // Lazy import so the rest of the CLI works even before the SDK is installed / when offline.
  const { Sandbox } = await import("e2b");

  const harnessRemote = "/home/user/harness";
  const targetRemote = "/home/user/target";
  const payload = collectPayload(harnessRemote);

  let sandbox = null;
  try {
    sandbox = await Sandbox.create({ apiKey, timeoutMs: 120_000 });

    // Stage the REAL scaffolder payload + a throwaway target project inside the sandbox.
    for (const { remotePath, content } of payload) {
      await sandbox.files.write(remotePath, content);
    }
    await sandbox.commands.run(
      `mkdir -p ${targetRemote} && chmod +x ${harnessRemote}/bin/init.sh ${harnessRemote}/hooks/*.sh 2>/dev/null; true`,
    );

    // Run the CORE action: the real bin/init.sh scaffolds a CLI-tool harness (choice "2")
    // into a throwaway target dir, fully isolated in the microVM (no host writes).
    const exec = await sandbox.commands.run(
      `cd ${targetRemote} && echo "2" | bash ${harnessRemote}/bin/init.sh ${targetRemote} 2>&1 || true`,
      { timeoutMs: 60_000 },
    );

    // Verify isolation worked: the harness structure must exist inside the sandbox.
    const verify = await sandbox.commands.run(
      `test -d ${targetRemote}/.claude/skills && test -f ${targetRemote}/.claude/settings.local.json && echo "HARNESS_OK" || echo "HARNESS_MISSING"`,
    );

    const ok = /HARNESS_OK/.test(verify.stdout);
    const result = {
      ok,
      sandboxId: sandbox.sandboxId,
      exitCode: ok ? 0 : 1,
      stdout: (exec.stdout || "") + "\n" + (verify.stdout || ""),
      stderr: exec.stderr || "",
      durationMs: Math.round(performance.now() - start),
    };
    logRun("sandbox-run", {
      ok: result.ok,
      sandboxId: result.sandboxId,
      tier: opts.tier ?? "starter",
      durationMs: result.durationMs,
    });
    return result;
  } catch (err) {
    const result = {
      ok: false,
      sandboxId: sandbox?.sandboxId ?? null,
      exitCode: 1,
      stdout: "",
      stderr: err instanceof Error ? err.message : String(err),
      durationMs: Math.round(performance.now() - start),
    };
    logRun("sandbox-run", { ok: false, error: result.stderr, durationMs: result.durationMs });
    return result;
  } finally {
    if (sandbox) {
      try {
        await sandbox.kill();
      } catch (e) {
        console.warn("[sandbox-run] sandbox cleanup failed:", e.message);
      }
    }
  }
}
