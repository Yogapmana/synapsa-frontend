import { useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { Check, Copy } from 'lucide-react'

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

function MarkdownRenderer({ content, className }) {
  const components = useMemo(() => ({
    blockquote: ({ children }) => <blockquote className="border-l-4 border-primary/40 pl-4 italic text-muted-foreground">{children}</blockquote>,
    code: CodeBlock,
    table: ({ children }) => <div className="my-4 w-full overflow-x-auto rounded-lg border"><table className="w-full caption-bottom text-sm">{children}</table></div>,
    th: ({ children }) => <th className="border-b bg-muted px-3 py-2 text-left font-semibold">{children}</th>,
    td: ({ children }) => <td className="border-b px-3 py-2 align-top">{children}</td>,
  }), [])

  return (
    <div className={cn('module-content prose prose-slate max-w-none', className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]} components={components}>{content}</ReactMarkdown>
    </div>
  )
}

export default MarkdownRenderer
