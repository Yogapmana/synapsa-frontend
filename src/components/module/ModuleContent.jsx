import MarkdownRenderer from '@/components/common/MarkdownRenderer'

export default function ModuleContent({ content }) {
  if (!content) {
    return (
      <div className="mx-auto max-w-[720px] py-12 text-center text-muted-foreground">
        Konten modul belum tersedia.
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[720px]">
      <MarkdownRenderer content={content} />
    </div>
  )
}