import { cn } from '@/lib/utils'
import MarkdownRenderer from '@/components/common/MarkdownRenderer'

export default function ModuleContent({ content }) {
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

  return (
    <article className="mx-auto max-w-[720px]">
      <MarkdownRenderer content={content} />
    </article>
  )
}