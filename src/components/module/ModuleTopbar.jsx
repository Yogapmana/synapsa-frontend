import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Clock, ArrowRight, BookOpen, ChevronLeft, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'

/**
 * ModuleTopbar — sticky top bar for the module reading page.
 *
 * Phase 5.8 (post-feedback) — refined:
 *  - Title is firmly LEFT-aligned next to the back button. It is
 *    never centered (the user explicitly asked).
 *  - Eyebrow "MATERI · 01" sits above the title for editorial
 *    hierarchy (only shown on wider viewports so it doesn't crowd
 *    the topbar on mobile).
 *  - Module number is derived from URL position (last segment),
 *    so users see "Topik 02" → they're 2nd of their session.
 *  - Reading time pill moved to far right, before the "Mulai Kuis"
 *    action button (only after 80% scroll).
 *  - Background uses a soft warm wash (bg-neutral/85) with blur
 *    so the topbar reads as a clear "header" without being a
 *    hard card glued on the page.
 */
export default function ModuleTopbar({ module, topic, scrollContainerRef }) {
  const { t } = useTranslation();
  const [showQuizButton, setShowQuizButton] = useState(false)
  const { topicId } = useParams()

  useEffect(() => {
    const el = scrollContainerRef?.current
    if (!el) return

    const handleScroll = () => {
      const scrollable = el.scrollHeight - el.clientHeight
      if (scrollable <= 0) {
        setShowQuizButton(false)
        return
      }
      const scrollPercent = el.scrollTop / scrollable
      setShowQuizButton(scrollPercent >= 0.8)
    }

    handleScroll()
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [scrollContainerRef])

  const estimatedMinutes = module?.estimated_read_minutes ?? 0

  // Topic number in "week.day" format (e.g. "1.1", "2.3")
  const topicNumber = (() => {
    const wk = topic?.week_number
    const dy = topic?.day_number
    if (wk != null && dy != null) return `${wk}.${dy}`
    return null
  })()

  return (
    <div className="sticky top-0 z-20 backdrop-blur-md bg-neutral/85 pt-2 md:pt-3">
      <div className="flex h-14 items-center gap-2.5 px-4 md:px-6 pb-2">
        {/* Back button */}
        <Link
          to="/curriculum"
          aria-label="Kembali ke kurikulum"
          className={cn(
            'flex items-center justify-center size-9 rounded-xl shrink-0',
            'text-secondary hover:text-primary hover:bg-secondary/10',
            'transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary'
          )}
        >
          <ChevronLeft size={18} />
        </Link>

        {/* Book icon */}
        <div
          className="hidden sm:flex size-7 items-center justify-center rounded-lg bg-tertiary/10 text-tertiary shrink-0"
          aria-hidden="true"
        >
          <BookOpen className="size-3.5" />
        </div>

        {/* Title block */}
        <div className="min-w-0 shrink text-left">
          <div className="hidden md:flex items-center gap-1.5 mb-0.5">
            <span className="text-[10px] font-label uppercase tracking-[0.18em] text-tertiary font-bold whitespace-nowrap">
              {topicNumber ? t('module.topic_number', { number: topicNumber, defaultValue: `Topic ${topicNumber}` }) : t('module.topic', 'Topic')}
            </span>
            <span className="size-1 rounded-full bg-tertiary/40" aria-hidden="true" />
            <span className="text-[10px] font-label uppercase tracking-[0.18em] text-secondary/70 whitespace-nowrap">
              {t('module.module')}
            </span>
          </div>
          <h1
            title={module?.title}
            className="font-display font-semibold text-[15px] text-primary leading-tight truncate"
          >
            {module?.title ?? t('module.loading')}
          </h1>
        </div>

        {/* Spacer — pushes the right cluster to the right edge of
            the article column (before the resizable Tutor AI pane). */}
        <div className="flex-1" />

        {/* Right cluster — reading time + (after 80%) quiz button */}
        <div className="flex items-center gap-2 shrink-0">

          {estimatedMinutes > 0 && (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-secondary font-label tabular-nums px-2.5 py-1 rounded-lg bg-bg-secondary/40 border border-border/40">
              <Clock className="size-3.5" aria-hidden="true" />
              {estimatedMinutes} {t('module.mins')}
            </span>
          )}

          {showQuizButton && module?.topic_id && (
            <Button
              size="sm"
              variant="tertiary"
              asChild
              className="rounded-xl font-label gap-1.5 shadow-warm-sm group"
            >
              <Link to={`/quiz/${module.topic_id}`}>
                <Sparkles className="size-3.5" />
                {t('module.start_quiz')}
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}