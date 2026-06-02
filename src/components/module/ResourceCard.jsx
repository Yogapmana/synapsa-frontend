import { FileText, Youtube, GraduationCap, ExternalLink } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

const TYPE_ICONS = {
  article: FileText,
  video: Youtube,
  paper: GraduationCap,
}

const TYPE_LABELS = {
  article: 'Artikel',
  video: 'Video',
  paper: 'Paper',
}

function getDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

export default function ResourceCard({ source }) {
  const Icon = TYPE_ICONS[source.type] || FileText
  const label = TYPE_LABELS[source.type] || 'Sumber'
  const domain = getDomain(source.url)
  const shouldReduceMotion = useReducedMotion()

  const handleOpen = () => {
    if (source.url) {
      window.open(source.url, '_blank', 'noopener,noreferrer')
    }
  }

  const hoverProps = shouldReduceMotion ? {} : {
    whileHover: { y: -2, boxShadow: '0 8px 20px rgba(34,197,94,0.2)' },
    whileTap: { scale: 0.98 }
  }

  return (
    <motion.button
      type="button"
      onClick={handleOpen}
      {...hoverProps}
      className="resource-card group w-full text-left"
    >
      <div className={cn(
        'flex size-10 shrink-0 items-center justify-center rounded-lg',
        source.type === 'video' && 'bg-red-100 text-red-600',
        source.type === 'article' && 'bg-secondary/10 text-secondary',
        source.type === 'paper' && 'bg-secondary/10 text-secondary',
        !TYPE_ICONS[source.type] && 'bg-neutral text-secondary',
      )}>
        <Icon className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-foreground">{source.title}</p>
        <p className="truncate text-xs text-muted-foreground">
          {label}{domain ? ` · ${domain}` : ''}
        </p>
      </div>
      <ExternalLink className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
    </motion.button>
  )
}