import { FileText, Youtube, GraduationCap, ExternalLink, Play, X } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { getYouTubeEmbedUrl, getYouTubeVideoId } from '@/lib/youtube'

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

export default function ResourceCard({ source, activeVideoUrl, onToggleVideo }) {
  const videoId = getYouTubeVideoId(source.url)
  const embedUrl = getYouTubeEmbedUrl(source.url)
  const isYouTube = Boolean(embedUrl)
  const isVideoOpen = isYouTube && activeVideoUrl === videoId
  const sourceType = isYouTube ? 'video' : source.type
  const Icon = TYPE_ICONS[sourceType] || FileText
  const label = TYPE_LABELS[sourceType] || 'Sumber'
  const colorClass = TYPE_COLORS[sourceType] || 'bg-secondary/10 text-secondary'
  const domain = getDomain(source.url)
  const shouldReduceMotion = useReducedMotion()

  const hoverProps = shouldReduceMotion
    ? {}
    : {
        whileHover: { y: -2 },
        whileTap: { scale: 0.98 },
      }

  const handleOpen = () => {
    if (source.url) {
      window.open(source.url, '_blank', 'noopener,noreferrer')
    }
  }

  const handleToggleVideo = () => {
    onToggleVideo?.(isVideoOpen ? null : videoId)
  }

  return (
    <motion.div
      {...hoverProps}
      className={cn(
        'resource-card group w-full flex-col cursor-default',
        isVideoOpen && 'border-tertiary/50',
      )}
    >
      {isYouTube ? (
        <div className="flex w-full min-w-0 items-start gap-3">
          <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg', colorClass)}>
            <Icon className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-primary">{source.title || 'Video YouTube'}</p>
            <p className="truncate text-xs text-secondary font-label">
              {label}{domain ? ` · ${domain}` : ''}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleToggleVideo}
                aria-expanded={isVideoOpen}
                aria-controls={`youtube-player-${videoId}`}
                className="inline-flex items-center gap-1.5 rounded-md bg-tertiary px-2.5 py-1.5 text-xs font-label font-semibold text-white transition-colors hover:bg-tertiary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary"
              >
                {isVideoOpen ? <X className="size-3.5" /> : <Play className="size-3.5 fill-current" />}
                {isVideoOpen ? 'Tutup video' : 'Putar di sini'}
              </button>
              <button
                type="button"
                onClick={handleOpen}
                className="inline-flex items-center gap-1 text-xs font-label text-secondary transition-colors hover:text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary"
              >
                <ExternalLink className="size-3.5" />
                Buka di YouTube
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleOpen}
          className="flex w-full min-w-0 items-start gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary"
        >
          <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg', colorClass)}>
            <Icon className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-primary">{source.title}</p>
            <p className="truncate text-xs text-secondary font-label">
              {label}{domain ? ` · ${domain}` : ''}
            </p>
          </div>
          <ExternalLink className="size-4 shrink-0 text-secondary/50 transition-colors group-hover:text-tertiary" />
        </button>
      )}

      {isYouTube && isVideoOpen && (
        <motion.div
          id={`youtube-player-${videoId}`}
          initial={shouldReduceMotion ? false : { opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="mt-3 w-full overflow-hidden rounded-xl bg-primary shadow-warm-sm"
        >
          <div className="relative aspect-video w-full">
            <iframe
              src={embedUrl}
              title={`Video: ${source.title || 'YouTube'}`}
              className="absolute inset-0 h-full w-full"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
