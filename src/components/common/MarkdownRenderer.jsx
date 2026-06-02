import { useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { Check, Copy, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function CodeBlock({ inline, className, children, ...props }) {
  const [copied, setCopied] = useState(false)
  const match = /language-(\w+)/.exec(className || '')
  const code = String(children).replace(/\n$/, '')

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  if (inline) {
    return <code className={cn('rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em]', className)} {...props}>{children}</code>
  }

  return (
    <div className="group relative my-4 overflow-hidden rounded-lg border bg-muted/40">
      <div className="flex items-center justify-between border-b bg-background/80 px-4 py-2 text-xs text-muted-foreground">
        <span>{match?.[1] || 'code'}</span>
        <Button type="button" variant="ghost" size="sm" onClick={handleCopy}>
          {copied ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}
          {copied ? 'Tersalin' : 'Salin'}
        </Button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-6">
        <code className={className} {...props}>{children}</code>
      </pre>
    </div>
  )
}

function ImageLightbox({ src, alt, isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
        onClick={onClose}
        aria-label="Close lightbox"
      >
        <X size={32} />
      </button>
      <img
        src={src}
        alt={alt || 'Ilustrasi'}
        className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
      {alt && (
        <p className="absolute bottom-4 left-0 right-0 text-center text-white/80 text-sm">
          {alt}
        </p>
      )}
    </div>
  )
}

function PollinationsImage({ src, alt }) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  return (
    <>
      <figure
        className="my-8 group cursor-zoom-in"
        onClick={() => setIsLightboxOpen(true)}
      >
        <img
          src={src}
          alt={alt || 'Ilustrasi'}
          className="w-full rounded-xl shadow-lg border bg-surface transition-transform duration-300 group-hover:scale-[1.02] group-hover:shadow-xl"
          loading="lazy"
        />
        {alt && alt !== 'Ilustrasi' && (
          <figcaption className="mt-2 text-center text-sm text-muted-foreground italic">
            {alt}
          </figcaption>
        )}
      </figure>
      <ImageLightbox
        src={src}
        alt={alt}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
      />
    </>
  )
}

function ContentWithImages({ content, className }) {
  const segments = useMemo(() => {
    if (!content) return []

    const imageRegex = /!\[([^\]]*)\]\((https:\/\/(image|gen)\.pollinations\.ai\/image\/[^)]+\?[^)]+)\)/g
    const parts = []
    let lastIndex = 0
    let match
    let idx = 0

    while ((match = imageRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: content.slice(lastIndex, match.index)
        })
      }
      parts.push({
        type: 'image',
        alt: match[1],
        src: match[2],
        key: `img-${idx++}`
      })
      lastIndex = match.index + match[0].length
    }

    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.slice(lastIndex)
      })
    }

    return parts
  }, [content])

  const components = useMemo(() => ({
    blockquote: ({ children }) => <blockquote className="border-l-4 border-primary/40 pl-4 italic text-muted-foreground">{children}</blockquote>,
    code: CodeBlock,
    table: ({ children }) => <div className="my-4 w-full overflow-x-auto rounded-lg border"><table className="w-full caption-bottom text-sm">{children}</table></div>,
    th: ({ children }) => <th className="border-b bg-muted px-3 py-2 text-left font-semibold">{children}</th>,
    td: ({ children }) => <td className="border-b px-3 py-2 align-top">{children}</td>,
  }), [])

  return (
    <div className={cn('module-content prose prose-slate max-w-none', className)}>
      {segments.map((segment, i) => {
        if (segment.type === 'image') {
          return <PollinationsImage key={segment.key} src={segment.src} alt={segment.alt} />
        }
        return (
          <ReactMarkdown
            key={i}
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={components}
          >
            {segment.content}
          </ReactMarkdown>
        )
      })}
    </div>
  )
}

function MarkdownRenderer({ content, className }) {
  return <ContentWithImages content={content} className={className} />
}

export default MarkdownRenderer
