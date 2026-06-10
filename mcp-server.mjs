#!/usr/bin/env node
// mcp-server.mjs — claude-harness's OWN MCP server (stdio, JSON-RPC 2.0).
//
// This is NOT the inherited 4-client template in .mcp.json (github/context7/memory/obsidian).
// It is a server this repo ships, exposing this repo's REAL product capabilities as MCP tools:
//
//   - memory_search  : BM25 query over THIS repo's own corpus (lib/memory-search.mjs)
//   - list_tiers     : the real scaffold tiers + what each installs (from bin/install.js TIERS)
//   - scaffold_plan  : dry-run plan of the files a given (tier, language, projectType) install
//                      would produce, by actually running install() into a throwaway temp dir
//
// Protocol: JSON-RPC 2.0 over stdin/stdout (MCP stdio transport). Zero external deps — Node
// built-ins only. Pattern follows plugsmith/src/mcp-server.ts and skillsmith/src/mcp.
// Wired into .mcp.json as the "claude-harness" server.

import * as readline from "node:readline";
import { mkdtempSync, rmSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { search as memorySearch, indexStats } from "./lib/memory-search.mjs";
import { install, TIERS } from "./bin/install.js";

// ─── JSON-RPC helpers ───
function send(obj) {
  process.stdout.write(JSON.stringify(obj) + "\n");
}
function ok(id, result) {
  send({ jsonrpc: "2.0", id, result });
}
function rpcErr(id, code, message) {
  send({ jsonrpc: "2.0", id, error: { code, message } });
}
// MCP tool results are returned as content blocks.
function toolText(id, text) {
  ok(id, { content: [{ type: "text", text }] });
}

// ─── Tool implementations ───
function handleMemorySearch(id, args) {
  const query = typeof args.query === "string" ? args.query : "";
  if (!query.trim()) {
    rpcErr(id, -32602, "memory_search requires a non-empty 'query' string");
    return;
  }
  const limit = Number(args.limit) > 0 ? Number(args.limit) : 5;
  const results = memorySearch(query, { limit });
  const stats = indexStats();
  const lines = [
    `memory_search "${query}" — ${results.length} hit(s) over ${stats.chunks} chunks / ${stats.files} files`,
    "",
    ...results.map(
      (r, i) => `${i + 1}. ${r.rel}:${r.line} (score ${r.score.toFixed(2)})\n   ${r.snippet}`,
    ),
  ];
  toolText(id, lines.join("\n"));
}

function handleListTiers(id) {
  const rows = Object.entries(TIERS).map(([name, t]) => {
    const skills = t.skills === null ? "ALL" : t.skills.length;
    const hooks = t.hooks === null ? "ALL" : t.hooks.length;
    const rules = t.rules === null ? "ALL" : t.rules.length;
    return `- ${name}: ${t.description}\n    skills=${skills} hooks=${hooks} rules=${rules} memory=${t.includeMemory}`;
  });
  toolText(id, "claude-harness tiers:\n" + rows.join("\n"));
}

// Recursively count files under a dir (for the plan summary).
function countFiles(dir) {
  if (!existsSync(dir)) return 0;
  let n = 0;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) n += countFiles(p);
    else n += 1;
  }
  return n;
}

function handleScaffoldPlan(id, args) {
  const tier = ["starter", "pro", "expert"].includes(args.tier) ? args.tier : "pro";
  const language = ["typescript", "python", "general"].includes(args.language)
    ? args.language
    : "general";
  const projectType = ["web-app", "cli-tool", "agent-project"].includes(args.projectType)
    ? args.projectType
    : "cli-tool";

  const tmp = mkdtempSync(join(tmpdir(), "ch-mcp-plan-"));
  try {
    const r = install({
      projectDir: tmp,
      projectName: typeof args.projectName === "string" ? args.projectName : "planned-project",
      language,
      tier,
      projectType,
      quiet: true, // do not pollute the runtime audit log from a dry-run plan
    });
    const totalFiles = countFiles(join(tmp, ".claude")) + (existsSync(join(tmp, "memory")) ? countFiles(join(tmp, "memory")) : 0);
    const summary = [
      `scaffold_plan (tier=${tier}, language=${language}, projectType=${projectType}):`,
      `  skills:  ${r.skillCount}`,
      `  hooks:   ${r.hookCount}`,
      `  rules:   ${r.ruleCount}`,
      `  scripts: ${r.scriptCount}`,
      `  memory:  ${existsSync(join(tmp, "memory")) ? "yes" : "no"}`,
      `  total files written under .claude/ + memory/: ${totalFiles}`,
    ].join("\n");
    toolText(id, summary);
  } catch (e) {
    rpcErr(id, -32000, e instanceof Error ? e.message : String(e));
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

// ─── Tool manifest (returned on tools/list) ───
const TOOLS = [
  {
    name: "memory_search",
    description:
      "BM25 search over claude-harness's own knowledge corpus (brain/, docs/, memory/, identity/, MEMORY.md). Returns the top scored paragraph chunks with file:line.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query." },
        limit: { type: "number", description: "Max results (default 5)." },
      },
      required: ["query"],
    },
  },
  {
    name: "list_tiers",
    description:
      "List the scaffolder's tiers (starter/pro/expert) and what each installs (skill/hook/rule counts, memory).",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "scaffold_plan",
    description:
      "Dry-run plan: report exactly what files a scaffold install would produce for a given tier/language/projectType (runs the real installer into a throwaway temp dir).",
    inputSchema: {
      type: "object",
      properties: {
        tier: { type: "string", enum: ["starter", "pro", "expert"] },
        language: { type: "string", enum: ["typescript", "python", "general"] },
        projectType: { type: "string", enum: ["web-app", "cli-tool", "agent-project"] },
        projectName: { type: "string" },
      },
    },
  },
];

// ─── Main stdio JSON-RPC loop ───
const rl = readline.createInterface({ input: process.stdin });

rl.on("line", (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;

  let msg;
  try {
    msg = JSON.parse(trimmed);
  } catch {
    send({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } });
    return;
  }

  const { id, method, params } = msg;
  const p = params ?? {};

  switch (method) {
    case "initialize":
      ok(id, {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name: "claude-harness", version: "1.0.0" },
      });
      break;

    case "notifications/initialized":
      // notification — no response
      break;

    case "tools/list":
      ok(id, { tools: TOOLS });
      break;

    case "tools/call": {
      const toolName = p.name;
      const toolArgs = p.arguments ?? {};
      if (toolName === "memory_search") handleMemorySearch(id, toolArgs);
      else if (toolName === "list_tiers") handleListTiers(id);
      else if (toolName === "scaffold_plan") handleScaffoldPlan(id, toolArgs);
      else rpcErr(id, -32601, `Unknown tool: ${String(toolName)}`);
      break;
    }

    default:
      if (id !== undefined) rpcErr(id, -32601, `Method not found: ${String(method)}`);
  }
});
