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

const TYPE_COLORS = {
  article: 'bg-secondary/10 text-secondary',
  video: 'bg-danger/10 text-danger-fg',
  paper: 'bg-info/10 text-info-fg',
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
  const colorClass = TYPE_COLORS[source.type] || 'bg-secondary/10 text-secondary'
  const domain = getDomain(source.url)
  const shouldReduceMotion = useReducedMotion()

  const handleOpen = () => {
    if (source.url) {
      window.open(source.url, '_blank', 'noopener,noreferrer')
    }
  }

  const hoverProps = shouldReduceMotion ? {} : {
    whileHover: { y: -2 },
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
        colorClass,
      )}>
        <Icon className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-primary">{source.title}</p>
        <p className="truncate text-xs text-secondary font-label">
          {label}{domain ? ` · ${domain}` : ''}
        </p>
      </div>
      <ExternalLink className="size-4 shrink-0 text-secondary/50 transition-colors group-hover:text-tertiary" />
    </motion.button>
  )
}