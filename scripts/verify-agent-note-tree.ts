/** Verify tree: lifecycle/class/filename/INDEX. Run: npx tsx scripts/verify-agent-note-tree.ts */
import { walkAgentNoteTree } from "./agent-note-tree.ts";
const { notes, errors } = walkAgentNoteTree();
if (errors.length) { for (const e of errors) console.error(e); process.exit(1); }
console.log(`ok: ${notes.length} note(s) tree verified`);
