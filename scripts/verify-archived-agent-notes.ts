/**
 * Verify frozen archived Agent Notes: exact head layout, manifest.json seals,
 * append-only extension vs a git baseline (skipped gracefully without git).
 * Usage:
 *   npx tsx scripts/verify-archived-agent-notes.ts          # verify only
 *   npx tsx scripts/verify-archived-agent-notes.ts --write  # verify, then seal unsealed files
 * Env: AGENT_NOTE_ARCHIVE_BASE_REF (default HEAD) — git ref the manifest is compared against.
 */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { agentNoteRoot } from "./agent-note-tree.ts";

const isWrite = process.argv.includes("--write");
const errors: string[] = [];
const warnings: string[] = [];
const fail = (msg: string) => { errors.push(msg); };

// --- collect archived files (skip accidental .zh.md); English and Chinese archive folders both accepted
const ARCHIVE_DIRS = ["archived", "归档"];
const files: string[] = [];
function scan(dir: string, prefix: string) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) scan(full, prefix);
    else if (entry.isFile() && entry.name.endsWith(".md") && !entry.name.endsWith(".zh.md")) {
      files.push(`${prefix}/${relative(join(agentNoteRoot, prefix), full).split("\\").join("/")}`);
    }
  }
}
for (const dir of ARCHIVE_DIRS) {
  if (existsSync(join(agentNoteRoot, dir))) scan(join(agentNoteRoot, dir), dir);
}

// --- head layout: L1 title / L2 blank / L3 Status / L4 Archived / L5 blank
const TITLE_RE = /^# Agent Note[:：] ?\S|^# 决策笔记[:：] ?\S/;
const ARCHIVED_RE = /^Archived: \d{4}-\d{2}-\d{2}$|^归档于[:：]\d{4}-\d{2}-\d{2}$/;
const LIVE_STATUS_RE = /^Status: implemented$|^状态[:：] ?(?:implemented|已实现|生效)$/;
for (const key of files) {
  const lines = readFileSync(join(agentNoteRoot, key), "utf8").replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n").split("\n");
  const rel = key.split("/").slice(1).join("/");
  if (!TITLE_RE.test(lines[0] ?? "")) fail(`${key} — line 1 must be \`# Agent Note: <title>\``);
  if (lines[1] !== "") fail(`${key} — line 2 must be blank`);
  if (!LIVE_STATUS_RE.test(lines[2] ?? "")) fail(`${key} — line 3 must be \`Status: implemented\``);
  if (!ARCHIVED_RE.test(lines[3] ?? "")) fail(`${key} — line 4 must be \`Archived: YYYY-MM-DD\` immediately below Status`);
  if (lines[4] !== "") fail(`${key} — line 5 must be blank after Archived`);
}

// --- manifest seals
const manifestPath = join(agentNoteRoot, "archived", "manifest.json");
interface Manifest { version: 1; files: Record<string, string>; }
let manifest: Manifest = { version: 1, files: {} };
if (existsSync(manifestPath)) {
  try {
    manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  } catch {
    fail("archived/manifest.json exists but is not valid JSON");
  }
} else if (files.length > 0 && !isWrite) {
  fail("archived/manifest.json missing — run with --write to seal existing archived notes");
}

const sealOf = (relFromRoot: string) =>
  `sha256:${createHash("sha256").update(readFileSync(join(agentNoteRoot, relFromRoot))).digest("hex")}`;

for (const key of files) {
  const entry = manifest.files[key];
  if (!entry) {
    if (isWrite) {
      manifest.files[key] = sealOf(key);
    } else {
      fail(`${key} — missing seal in manifest.json (run with --write)`);
    }
  } else if (entry !== sealOf(key)) {
    fail(`${key} — seal mismatch: archived note was modified after sealing (frozen notes must never change)`);
  }
}
for (const key of Object.keys(manifest.files)) {
  if (!existsSync(join(agentNoteRoot, key))) fail(`${key} — sealed entry has no file on disk`);
}

// --- append-only vs git baseline (skipped without git)
const repoRoot = (() => {
  try {
    return execFileSync("git", ["rev-parse", "--show-toplevel"], { cwd: agentNoteRoot, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }).trim();
  } catch {
    return null;
  }
})();
if (repoRoot) {
  const baseRef = process.env.AGENT_NOTE_ARCHIVE_BASE_REF || "HEAD";
  const manifestRel = relative(repoRoot, manifestPath).split("\\").join("/");
  let baselineRaw: string | null = null;
  try {
    baselineRaw = execFileSync("git", ["show", `${baseRef}:${manifestRel}`], { cwd: repoRoot, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] });
  } catch {
    // manifest absent at baseline — nothing to compare
  }
  if (baselineRaw !== null) {
    try {
      const baseline = JSON.parse(baselineRaw) as Manifest;
      for (const [key, seal] of Object.entries(baseline.files ?? {})) {
        if (manifest.files[key] !== seal) {
          fail(`${key} — seal added/changed/removed relative to ${baseRef}; archived seals are append-only`);
        }
      }
    } catch {
      fail(`archived/manifest.json at ${baseRef} was not valid JSON`);
    }
  }
} else {
  warnings.push("not a git repository — append-only check skipped (seal hashes still verified against disk)");
}

if (errors.length) {
  for (const e of errors) console.error(`archived: ${e}`);
  process.exit(1);
}

if (isWrite) {
  const sorted = Object.fromEntries(Object.entries(manifest.files).sort(([a], [b]) => a.localeCompare(b)));
  // manifest always lives under archived/; create it even for Chinese-only trees (归档/)
  mkdirSync(join(agentNoteRoot, "archived"), { recursive: true });
  writeFileSync(manifestPath, JSON.stringify({ version: 1, files: sorted }, null, 2) + "\n", "utf8");
}

for (const w of warnings) console.warn(`warning: ${w}`);
console.log(`ok: ${files.length} archived note(s) verified, ${Object.keys(manifest.files).length} seal(s) in manifest`);
