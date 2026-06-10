// load-env.mjs — minimal zero-dependency .env loader.
//
// Reads the repo-root .env (KEY=VALUE lines) and populates process.env for any key not already
// set. Used so `claude-harness sandbox-run` can pick up E2B_API_KEY from this repo's .env
// without adding a dotenv dependency. Never logs values; never overwrites an existing env var.

import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");

/** Load KEY=VALUE pairs from .env into process.env (no overwrite of existing vars). */
export function loadEnv(envPath = join(REPO_ROOT, ".env")) {
  if (!existsSync(envPath)) return;
  let raw;
  try {
    raw = readFileSync(envPath, "utf-8");
  } catch (err) {
    console.warn("[load-env] could not read .env:", err.message);
    return;
  }
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    // Strip surrounding quotes if present.
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (key && process.env[key] === undefined) process.env[key] = val;
  }
}
