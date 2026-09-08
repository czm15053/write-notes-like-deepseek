/**
 * CLI tool to archive an implemented Agent Note with frozen manifest sealing.
 * Usage: npx tsx scripts/archive-agent-note.ts .agents/notes/implemented/<class>/<filename>.md
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";
import { agentNoteRoot, AGENT_NOTE_CLASSES, walkAgentNoteTree } from "./agent-note-tree.ts";

const targetArg = process.argv[2];
if (!targetArg) {
  console.error("Usage: npx tsx scripts/archive-agent-note.ts <path-to-note>");
  process.exit(1);
}

const targetPath = resolve(process.cwd(), targetArg);
if (!existsSync(targetPath)) {
  console.error(`Error: target note not found at ${targetPath}`);
  process.exit(1);
}

const relToRoot = relative(agentNoteRoot, targetPath).replace(/\\/g, "/");
const segs = relToRoot.split("/");

if (segs[0] !== "implemented" || segs.length !== 3) {
  console.error(`Error: only notes in .agents/notes/implemented/<class>/ can be archived (got: ${relToRoot})`);
  process.exit(1);
}

const [, cls, filename] = segs;
if (!AGENT_NOTE_CLASSES.includes(cls as any)) {
  console.error(`Error: unknown class "${cls}"`);
  process.exit(1);
}

// 1. Read and update content with Archived line
const raw = readFileSync(targetPath, "utf8");
const lines = raw.split("\n");
const statusIdx = lines.findIndex((l) => l === "Status: implemented");
if (statusIdx === -1) {
  console.error("Error: note must contain `Status: implemented` to be archived");
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
// Insert Archived line after Status line if not present
if (!lines.some((l) => l.startsWith("Archived:"))) {
  lines.splice(statusIdx + 1, 0, "", `Archived: ${today}`);
}
const updatedContent = lines.join("\n");

// 2. Determine archived destination
const archivedDir = join(agentNoteRoot, "archived", cls);
mkdirSync(archivedDir, { recursive: true });
const archivedPath = join(archivedDir, filename);

if (existsSync(archivedPath)) {
  console.error(`Error: target archived note already exists at ${archivedPath}`);
  console.error("Refusing to overwrite existing archived note. Please inspect and resolve name collision manually.");
  process.exit(1);
}

writeFileSync(targetPath, updatedContent, "utf8");
renameSync(targetPath, archivedPath);
console.log(`Moved: ${relToRoot} -> archived/${cls}/${filename}`);

// 3. Update archived/manifest.json with SHA-256 seal
const manifestPath = join(agentNoteRoot, "archived", "manifest.json");
interface Manifest {
  version: 1;
  files: Record<string, string>;
}
let manifest: Manifest = { version: 1, files: {} };
if (existsSync(manifestPath)) {
  try {
    manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  } catch (e) {
    console.warn("Warning: existing manifest.json was invalid, creating fresh");
  }
}

const newArchivedRel = `archived/${cls}/${filename}`;
const sha256 = `sha256:${createHash("sha256").update(readFileSync(archivedPath)).digest("hex")}`;
manifest.files[newArchivedRel] = sha256;

// Deterministic sort keys
const sortedFiles = Object.fromEntries(
  Object.entries(manifest.files).sort(([a], [b]) => a.localeCompare(b))
);
writeFileSync(manifestPath, JSON.stringify({ version: 1, files: sortedFiles }, null, 2) + "\n", "utf8");
console.log(`Sealed in archived/manifest.json with hash ${sha256.slice(0, 16)}...`);

// 4. Scan inbound links in active notes
const { notes } = walkAgentNoteTree();
const inboundFound: string[] = [];
for (const note of notes) {
  const noteFullPath = resolve(agentNoteRoot, note.rel);
  const content = readFileSync(noteFullPath, "utf8");
  if (content.includes(filename)) {
    inboundFound.push(note.rel);
  }
}

if (inboundFound.length > 0) {
  console.log("\n[Notice] The following active notes reference the archived note:");
  for (const rel of inboundFound) {
    console.log(`  - ${rel}`);
  }
  console.log("Please review and update their relative markdown links if necessary.");
} else {
  console.log("\nNo active notes reference this archived note.");
}
