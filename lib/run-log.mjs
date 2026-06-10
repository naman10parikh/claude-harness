// run-log.mjs — append-only runtime audit trail for claude-harness.
//
// The product (the scaffolder CLI) WRITES one JSON line to logs/runs.jsonl on every
// state-mutating action: a scaffold install, a memory-search query, a sandbox boot.
// This is the observability spine — each line records what happened, when, and the
// cost/size of the action so a run can be audited after the fact. Zero dependencies
// (Node built-ins only); append-only (never truncates/rewrites prior lines).
//
// Pattern ported from Energy's helios `logs/runs.jsonl` (one append per dispatch action).

import { appendFileSync, mkdirSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");

/** Absolute path to this repo's runtime audit log. */
export const RUNS_LOG_PATH = join(REPO_ROOT, "logs", "runs.jsonl");

/**
 * Append one structured event to logs/runs.jsonl.
 *
 * @param {string} action - The action name, e.g. "scaffold-install", "memory-search", "sandbox-run".
 * @param {object} [fields] - Action-specific fields (counts, query, durationMs, exitCode, ...).
 * @param {string} [logPath] - Override target path (used by tests so they don't touch the real log).
 * @returns {object} The record that was written (so callers can inspect/assert it).
 */
export function logRun(action, fields = {}, logPath = RUNS_LOG_PATH) {
  const record = {
    ts: new Date().toISOString(),
    action,
    ...fields,
  };
  try {
    mkdirSync(dirname(logPath), { recursive: true });
    appendFileSync(logPath, JSON.stringify(record) + "\n");
  } catch (err) {
    // Observability must never crash the action it is observing. Warn, don't throw.
    console.warn("[run-log] could not append run record:", err.message);
  }
  return record;
}
