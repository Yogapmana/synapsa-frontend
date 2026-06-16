import { cn } from '@/lib/utils'
import MarkdownRenderer from '@/components/common/MarkdownRenderer'

/**
 * Strip a leading H1 from the markdown body if it duplicates the topic
 * title shown in the sticky topbar. Without this guard, the markdown
 * starts with `# Topic Title` and renders a second H1 right below the
 * one shown in the topbar — looks like a duplicated heading (bug report:
 * "Why Architecture Matters" appeared twice in a row).
 *
 * We match the title case-insensitively and tolerate any leading
 * whitespace. If the first non-blank line isn't an H1 (or the H1 doesn't
 * match the title), we leave the content alone.
 *
 * Exported for unit testing — the regex logic has several edge cases
 * (case, whitespace, leading blank lines, multiple `#` prefixes) that
 * we want covered.
 */
export function stripLeadingH1(markdown, title) {
  if (!markdown || !title) return markdown
  const lines = markdown.split('\n')
  let firstContentIdx = 0
  while (firstContentIdx < lines.length && !lines[firstContentIdx].trim()) {
    firstContentIdx += 1
  }
  if (firstContentIdx >= lines.length) return markdown
  const firstLine = lines[firstContentIdx]
  // Match a leading H1 (one or more `#` followed by the title text).
  // We only strip when the entire H1 text === title (after trim).
  const m = firstLine.match(/^#\s+(.+?)\s*$/)
  if (!m) return markdown
  if (m[1].trim().toLowerCase() === title.trim().toLowerCase()) {
    return [...lines.slice(0, firstContentIdx), ...lines.slice(firstContentIdx + 1)].join('\n').trimStart()
  }
  return markdown
}

export default function ModuleContent({ content, topicTitle }) {
  if (!content) {
    return (
      <div className="mx-auto max-w-[720px] py-16 text-center">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-secondary/10">
          <svg className="size-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h.375a.375.375 0 01.375.375v.375a.375.375 0 01-.375.375H8.25m0 0h-.375a.375.375 0 01-.375-.375v-.375a.375.375 0 01.375-.375H8.25m0 0V9.75m0 0h.375a.375.375 0 01.375.375v.375a.375.375 0 01-.375.375H8.25m0 0V6.75" />
          </svg>
        </div>
        <p className="text-secondary font-label">
          Konten modul belum tersedia.
        </p>
      </div>
    )
  }

  // Strip the leading H1 if it duplicates the topic title (shown in the
  // sticky topbar). Defense-in-depth — also removes the H1 in Module.jsx
  // was removed, but this catches the case where the markdown itself
  // starts with the title.
  const cleaned = stripLeadingH1(content, topicTitle)

  return (
    <article className="mx-auto max-w-[720px]">
      <MarkdownRenderer content={cleaned} />
    </article>
  )
}