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
    return (
      <code
        className={cn(
          'rounded border border-border bg-bg-secondary px-1.5 py-0.5 font-mono text-[0.9em] text-accent-readable',
          className
        )}
        {...props}
      >
        {children}
      </code>
    )
  }

  return (
    <div className="group relative my-6 overflow-hidden rounded-xl border border-border bg-bg-secondary shadow-warm-xs">
      <div className="flex items-center justify-between border-b border-border bg-bg-tertiary/40 px-4 py-2 text-xs text-secondary font-mono">
        <span className="uppercase tracking-wider">{match?.[1] || 'code'}</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          aria-label={copied ? 'Tersalin' : 'Salin kode'}
          className="text-secondary hover:text-tertiary"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? 'Tersalin' : 'Salin'}
        </Button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed font-mono">
        <code className={className} {...props}>
          {children}
        </code>
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
    blockquote: ({ children }) => <blockquote className="my-6 border-l-4 border-tertiary/30 bg-tertiary/5 py-3 pr-4 pl-5 italic text-secondary rounded-r-lg">{children}</blockquote>,
    code: CodeBlock,
    table: ({ children }) => <div className="my-6 w-full overflow-x-auto rounded-lg border"><table className="w-full caption-bottom text-sm">{children}</table></div>,
    th: ({ children }) => <th className="border-b bg-secondary/10 px-4 py-2.5 text-left font-semibold text-primary">{children}</th>,
    td: ({ children }) => <td className="border-b px-4 py-2.5 align-top">{children}</td>,
  }), [])

  return (
    <div className={cn('module-content prose prose-stone max-w-none font-serif-content leading-[1.8]', className)}>
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
