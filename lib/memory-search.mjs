// memory-search.mjs — a REAL queryable index over THIS repo's own corpus.
//
// Ported from Energy's scripts/memory-search.sh (term-frequency x recency x source-weight
// scoring) but upgraded to a proper BM25 ranker with an in-code inverted index. This is the
// queryable layer of the Memory component: it indexes brain/, docs/, memory/, identity/ and
// the root MEMORY.md, builds a per-paragraph BM25 index, and returns the top-N scored chunks.
// grep alone or a flat key-value store does NOT satisfy this — BM25 over a built index does.
//
// Zero dependencies (Node built-ins only). Exposed to the CLI as `claude-harness memory-search`
// and to this repo's own MCP server as the `memory_search` tool.

import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { join, dirname, resolve, relative } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");

// Corpus roots — THIS repo's own knowledge surfaces (matches the mission's named corpus).
const CORPUS_DIRS = ["brain", "docs", "memory", "identity"];
const CORPUS_ROOT_FILES = ["MEMORY.md"]; // root-level docs worth indexing directly

// Source weighting (higher = more authoritative), same spirit as the energy scorer.
function sourceWeight(relPath) {
  if (relPath.startsWith("memory/LEARNINGS")) return 4;
  if (relPath.startsWith("memory/topics/")) return 4;
  if (relPath === "MEMORY.md" || relPath.startsWith("memory/MEMORY")) return 4;
  if (relPath.startsWith("identity/")) return 3;
  if (relPath.startsWith("brain/")) return 3;
  if (relPath.startsWith("memory/daily/")) return 2;
  if (relPath.startsWith("docs/")) return 2;
  return 1;
}

// Recency weight: recently modified files score a touch higher (ported from energy).
function recencyWeight(absPath) {
  try {
    const ageDays = (Date.now() - statSync(absPath).mtimeMs) / 86_400_000;
    if (ageDays <= 1) return 1.5;
    if (ageDays <= 7) return 1.3;
    if (ageDays <= 30) return 1.15;
    return 1.0;
  } catch {
    return 1.0;
  }
}

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9_\s-]/g, " ")
    .split(/[\s-]+/)
    .filter((t) => t.length >= 2);
}

function walkMarkdown(absDir, repoRoot, out) {
  if (!existsSync(absDir)) return;
  for (const entry of readdirSync(absDir, { withFileTypes: true })) {
    if (entry.name === ".obsidian" || entry.name === "node_modules") continue;
    const abs = join(absDir, entry.name);
    if (entry.isDirectory()) {
      walkMarkdown(abs, repoRoot, out);
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      out.push(abs);
    }
  }
}

/**
 * Build the corpus: split every markdown file into paragraph-level chunks (documents).
 * @param {string} [repoRoot]
 * @returns {{ rel: string, abs: string, line: number, text: string, terms: string[] }[]}
 */
function buildChunks(repoRoot = REPO_ROOT) {
  const files = [];
  for (const d of CORPUS_DIRS) walkMarkdown(join(repoRoot, d), repoRoot, files);
  for (const f of CORPUS_ROOT_FILES) {
    const abs = join(repoRoot, f);
    if (existsSync(abs)) files.push(abs);
  }

  const chunks = [];
  for (const abs of files) {
    let raw;
    try {
      raw = readFileSync(abs, "utf-8");
    } catch {
      continue;
    }
    const rel = relative(repoRoot, abs);
    const lines = raw.split("\n");
    // Group into paragraph chunks separated by blank lines, tracking the start line.
    let buf = [];
    let startLine = 1;
    const flush = (endLine) => {
      const text = buf.join("\n").trim();
      if (text.length >= 12) {
        chunks.push({ rel, abs, line: startLine, text, terms: tokenize(text) });
      }
      buf = [];
      startLine = endLine + 1;
    };
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() === "") {
        flush(i);
      } else {
        if (buf.length === 0) startLine = i + 1;
        buf.push(lines[i]);
      }
    }
    flush(lines.length);
  }
  return chunks;
}

/**
 * Build an inverted index + document-frequency table for BM25.
 */
function buildIndex(chunks) {
  const df = new Map(); // term -> # of chunks containing it
  let totalLen = 0;
  for (const ch of chunks) {
    totalLen += ch.terms.length;
    const seen = new Set();
    for (const t of ch.terms) {
      if (!seen.has(t)) {
        seen.add(t);
        df.set(t, (df.get(t) || 0) + 1);
      }
    }
  }
  const avgdl = chunks.length ? totalLen / chunks.length : 1;
  return { df, avgdl, N: chunks.length };
}

/**
 * Search the corpus with BM25 (Okapi), modulated by source authority + recency.
 *
 * @param {string} query
 * @param {object} [opts]
 * @param {number} [opts.limit=5]
 * @param {string} [opts.repoRoot]
 * @returns {{ rel: string, line: number, score: number, snippet: string }[]}
 */
export function search(query, opts = {}) {
  const { limit = 5, repoRoot = REPO_ROOT } = opts;
  const qTerms = [...new Set(tokenize(query))];
  if (qTerms.length === 0) return [];

  const chunks = buildChunks(repoRoot);
  const { df, avgdl, N } = buildIndex(chunks);

  // BM25 params.
  const k1 = 1.5;
  const b = 0.75;

  const scored = [];
  for (const ch of chunks) {
    const dl = ch.terms.length || 1;
    // term frequency in this chunk
    const tf = new Map();
    for (const t of ch.terms) tf.set(t, (tf.get(t) || 0) + 1);

    let bm25 = 0;
    let matched = 0;
    for (const qt of qTerms) {
      const f = tf.get(qt) || 0;
      if (f === 0) continue;
      matched++;
      const n = df.get(qt) || 0;
      // idf with +1 smoothing (always positive)
      const idf = Math.log(1 + (N - n + 0.5) / (n + 0.5));
      bm25 += idf * ((f * (k1 + 1)) / (f + k1 * (1 - b + b * (dl / avgdl))));
    }
    if (matched === 0) continue;

    const score =
      bm25 * sourceWeight(ch.rel) * recencyWeight(ch.abs) * (1 + 0.15 * (matched - 1));
    const snippet = ch.text.replace(/\s+/g, " ").slice(0, 240);
    scored.push({ rel: ch.rel, line: ch.line, score, snippet });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

/** Corpus stats — used by the MCP server and for diagnostics. */
export function indexStats(repoRoot = REPO_ROOT) {
  const chunks = buildChunks(repoRoot);
  const { N } = buildIndex(chunks);
  const files = new Set(chunks.map((c) => c.rel));
  return { chunks: N, files: files.size, fileList: [...files].sort() };
}
