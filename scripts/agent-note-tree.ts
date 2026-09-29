/**
 * Shared structural source of truth for the Agent Note tree.
 * Portable: resolves .agents/notes from cwd (or AGENT_NOTE_ROOT env).
 */
import { readdirSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

/** Recurse `dir` and return posix-relative `.md` paths prefixed with `prefix`. Node 18 compatible (no fs.globSync). */
function listMd(dir: string, prefix: string): string[] {
  if (!existsSync(dir)) return []
  const out: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name
    if (entry.isDirectory()) out.push(...listMd(resolve(dir, entry.name), rel))
    else if (entry.isFile() && entry.name.endsWith('.md')) out.push(rel)
  }
  return out
}

function resolveAgentNoteRoot(): string {
  if (process.env.AGENT_NOTE_ROOT) return resolve(process.env.AGENT_NOTE_ROOT)
  return resolve(process.cwd(), '.agents/notes')
}

export const agentNoteRoot = resolveAgentNoteRoot()

const AGENT_NOTE_LIFECYCLES = ['proposed', 'implemented', 'rejected', '提案', '生效', '已否决'] as const
export const AGENT_NOTE_CLASSES = ['feature', 'bug-fix', 'simplification', 'architecture', 'process', 'testing', '功能', '修复', '精简', '架构', '流程', '测试'] as const
// Folder name -> canonical lifecycle ID. Chinese aliases are optional and
// purely additive: English folders behave exactly as before, and a repo may
// use either language as long as it sticks to one. AgentNote.lifecycle is
// always the English ID so downstream checks are language-agnostic.
export const LIFECYCLE_DIR_IDS: Record<string, string> = {
  proposed: 'proposed', '提案': 'proposed',
  implemented: 'implemented', '生效': 'implemented',
  rejected: 'rejected', '已否决': 'rejected',
  archived: 'archived', '归档': 'archived',
}
export const CLASS_DIR_IDS: Record<string, string> = {
  feature: 'feature', '功能': 'feature',
  'bug-fix': 'bug-fix', '修复': 'bug-fix',
  simplification: 'simplification', '精简': 'simplification',
  architecture: 'architecture', '架构': 'architecture',
  process: 'process', '流程': 'process',
  testing: 'testing', '测试': 'testing',
}
const ROOT_ALLOWLIST = new Set(['AGENTS.md', 'CLAUDE.md'])

export interface AgentNote {
  lifecycle: string
  rel: string
  date: string
}

export function walkAgentNoteTree(): { notes: AgentNote[]; errors: string[] } {
  const notes: AgentNote[] = []
  const errors: string[] = []
  if (!existsSync(agentNoteRoot)) return { notes, errors }
  for (const entry of readdirSync(agentNoteRoot, { withFileTypes: true })) {
    if (entry.name === 'INDEX.md') {
      errors.push('structure: INDEX.md — centralized Agent Note indexes are forbidden; browse the lifecycle/class tree or search the repository')
      continue
    }
    if (entry.isDirectory() && LIFECYCLE_DIR_IDS[entry.name] === undefined) {
      errors.push(`structure: ${entry.name}/ — unknown lifecycle folder (allowed: proposed/implemented/rejected[/archived], CN: 提案/生效/已否决[/归档])`)
    }
  }
  for (const lifecycle of AGENT_NOTE_LIFECYCLES) {
    for (const match of listMd(resolve(agentNoteRoot, lifecycle), lifecycle).sort()) {
      const segs = match.split('/')
      if (segs.length === 2 && ROOT_ALLOWLIST.has(segs[1] ?? '')) continue
      if (match.endsWith('.zh.md')) continue
      const cls = segs[1]
      const base = segs[2]
      if (segs.length !== 3 || cls === undefined || base === undefined) {
        errors.push(`structure: ${match} — expected {lifecycle}/{class}/file.md (got depth ${segs.length})`)
        continue
      }
      if (CLASS_DIR_IDS[cls] === undefined) {
        errors.push(`structure: ${match} — unknown class folder "${cls}" (allowed: ${AGENT_NOTE_CLASSES.slice(0, 6).join(', ')}; CN: ${AGENT_NOTE_CLASSES.slice(6).join(',')})`)
        continue
      }
      if (!/^\d{4}-\d{2}-\d{2}-.+\.md$/.test(base)) {
        errors.push(`structure: ${match} — filename must be yyyy-mm-dd-topic.md`)
        continue
      }
      notes.push({ lifecycle: LIFECYCLE_DIR_IDS[lifecycle], rel: match, date: base.slice(0, 10) })
    }
  }
  return { notes, errors }
}
