/**
 * Enforce Agent Note headers, lifecycle-specific sections, alternatives.
 * Run: npx tsx scripts/verify-agent-note-format.ts
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { agentNoteRoot, walkAgentNoteTree } from "./agent-note-tree.ts";

const FORMAT_ADOPTED = "2026-07-05";
const GRANDFATHER = "<!-- agent-note-format: alternatives-not-recorded (pre-format Agent Note) -->";
const LEGACY_MARKERS = ["XXX: legacy ADR/RFC body format", "XXX: legacy ADR/Agent Note body format"];
const STATUS: Record<string, RegExp> = {
  proposed: /^Status: proposed$/,
  implemented: /^Status: implemented$/,
  rejected: /^Status: rejected — .+$/,
};
const REQUIRED: Record<string, string[]> = {
  proposed: ["## Proposal", "## Acceptance criteria", "## Risks"],
  implemented: ["## Decision", "## Consequences"],
  rejected: ["## Proposal"],
};
const BANNED_IMPLEMENTED = /^## (?:Proposal\b|Plan\b|Migration plan\b|Acceptance criteria\b)/i;

const { notes, errors } = walkAgentNoteTree();
for (const note of notes) {
  const fail = (msg: string) => { errors.push(`format: ${note.rel} — ${msg}`); };
  const raw = readFileSync(resolve(agentNoteRoot, note.rel), "utf8");
  const lines = raw.split("\n");
  let inFence = false;
  const prose = lines.filter((l) => { if (l.startsWith("```")) { inFence = !inFence; return false; } return !inFence; });
  if (!/^# Agent Note: \S/.test(lines[0] ?? "")) fail("line 1 must be `# Agent Note: <title>`");
  if (lines[1] !== "") fail("line 2 must be blank");
  const re = STATUS[note.lifecycle];
  if (re && !re.test(lines[2] ?? "")) fail(`line 3 must match ${note.lifecycle} status grammar (${String(re)})`);
  if (lines[3] !== "") fail("line 4 must be blank");
  // single Status line
  const statusCount = prose.filter((l) => l.startsWith("Status:")).length;
  if (statusCount !== 1) fail("Status: line must appear exactly once");
  const h2s = prose.filter((l) => l.startsWith("## ")).map((l) => l.trimEnd());
  if (h2s[0] !== "## Problem") fail(`first section must be ## Problem (got ${JSON.stringify(h2s[0] ?? "<none>")})`);
  for (const h of REQUIRED[note.lifecycle] ?? []) if (!h2s.includes(h)) fail(`missing ${h}`);
  if (note.lifecycle === "implemented") for (const h of h2s.filter((x) => BANNED_IMPLEMENTED.test(x))) fail(`banned in implemented: ${h}`);
  const hasAlt = h2s.includes("## Alternatives considered");
  const hasGrandfather = prose.includes(GRANDFATHER);
  if (hasAlt && hasGrandfather) fail("has both ## Alternatives considered and grandfather comment — drop the comment");
  if (!hasAlt && !hasGrandfather) fail("missing ## Alternatives considered");
  if (hasGrandfather && note.date >= FORMAT_ADOPTED) fail("grandfather comment only valid before " + FORMAT_ADOPTED);
  if (prose.some((l) => LEGACY_MARKERS.some((m) => l.includes(m)))) fail("retired legacy-format debt marker");
}
if (errors.length) { for (const e of errors) console.error(e); process.exit(1); }
console.log(`ok: ${notes.length} note(s) verified`);
