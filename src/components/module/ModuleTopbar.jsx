import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Clock, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ModuleTopbar({ module, curriculum, sessionId }) {
  const [showQuizButton, setShowQuizButton] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollPercent =
        window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)
      setShowQuizButton(scrollPercent >= 0.8)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const weekLabel = module?.week_number
    ? `Minggu ${module.week_number}`
    : 'Minggu ini'
  const estimatedMinutes = module?.estimated_read_minutes ?? 0

  return (
    <div className="sticky top-0 z-30 border-b border-[var(--border)] bg-surface">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
        <nav className="flex items-center gap-1 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <Link
            to={sessionId ? `/curriculum` : '/curriculum'}
            className="transition-colors hover:text-foreground"
          >
            Kurikulum
          </Link>
          <ChevronRight className="size-3.5" />
          <span className="text-muted-foreground">{weekLabel}</span>
          <ChevronRight className="size-3.5" />
          <span className="truncate font-medium text-foreground">
            {module?.title ?? 'Memuat...'}
          </span>
        </nav>

        <div className="flex items-center gap-3">
          {estimatedMinutes > 0 && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="size-3.5" />
              ~{estimatedMinutes} mnt baca
            </span>
          )}

          {showQuizButton && (
            <Button size="sm" asChild>
              <Link to={`/quiz/${module?.topic_id}`}>
                Mulai Kuis
                <ArrowRight className="ml-1 size-3.5" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}