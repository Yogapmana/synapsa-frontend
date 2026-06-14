import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, ArrowRight, BookOpen, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCurriculum, useTopics } from '@/hooks/useLearning'

/**
 * ModuleTopbar — sticky top bar for the module reading page.
 *
 * Phase fix (post-redesign):
 *   - Removed the "Kurikulum › Minggu X › Module" breadcrumb (too noisy,
 *     duplicated the page-header info, made the page feel "tidak nyatu").
 *   - Now shows just the module title (centered or right-aligned) plus
 *     a "Mulai Kuis" button that appears after 80% scroll, plus a thin
 *     progress bar at the bottom.
 *   - Back-to-curriculum moved to a subtle icon button on the far left
 *     (more discoverable, less noisy than text breadcrumb).
 */

export default function ModuleTopbar({ module, sessionId }) {
  const [showQuizButton, setShowQuizButton] = useState(false)
  const { data: curriculumData } = useCurriculum(sessionId)
  const { data: topicsData } = useTopics(sessionId)

  useEffect(() => {
    const handleScroll = () => {
      const scrollPercent =
        window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)
      setShowQuizButton(scrollPercent >= 0.8)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const curriculumJson = curriculumData?.curriculum_json || {}
  const weeks = curriculumJson.weeks || []
  const weekNumber = module?.week_number ?? module?.week ?? 1
  const currentWeek = weeks.find((w) => (w.week_number ?? w.week) === weekNumber)

  const topics = Array.isArray(topicsData) ? topicsData : topicsData?.topics || []
  const weekTopics = topics.filter(
    (t) => (t.week_number ?? t.week) === weekNumber
  )
  const topicIndex = weekTopics.findIndex(
    (t) => t.topic_id === module?.topic_id || t.id === module?.topic_id
  )
  const topicPosition = topicIndex >= 0 ? topicIndex + 1 : 0
  const totalWeekTopics = weekTopics.length

  const estimatedMinutes = module?.estimated_read_minutes ?? 0

  return (
    <div className="sticky top-0 z-30 border-b border-[var(--border)] bg-surface/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[860px] items-center justify-between gap-3 px-4 md:px-6">
        {/* Back to curriculum (icon-only, more compact than breadcrumb) */}
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

        {/* Module title (truncated for narrow viewports) */}
        <div className="flex-1 min-w-0 flex items-center gap-2.5">
          <BookOpen className="size-4 text-tertiary shrink-0 hidden sm:block" aria-hidden="true" />
          <span
            title={module?.title}
            className="font-display font-semibold text-sm text-primary truncate"
          >
            {module?.title ?? 'Memuat…'}
          </span>
        </div>

        {/* Right: time + quiz button */}
        <div className="flex items-center gap-2 shrink-0">
          {estimatedMinutes > 0 && (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-secondary font-label tabular-nums">
              <Clock className="size-3.5" aria-hidden="true" />
              {estimatedMinutes} mnt
            </span>
          )}

          {showQuizButton && module?.topic_id && (
            <Button
              size="sm"
              variant="tertiary"
              asChild
              className="rounded-xl font-label"
            >
              <Link to={`/quiz/${module.topic_id}`}>
                Mulai Kuis
                <ArrowRight className="ml-1 size-3.5" />
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Reading progress bar (single source of truth — no duplicate in article header) */}
      {totalWeekTopics > 0 && topicPosition > 0 && (
        <div className="mx-auto max-w-[860px] px-4 md:px-6 pb-2">
          <div
            className="h-1 rounded-full bg-secondary/20 overflow-hidden"
            role="progressbar"
            aria-valuenow={topicPosition}
            aria-valuemin={0}
            aria-valuemax={totalWeekTopics}
            aria-label={`Topik ${topicPosition} dari ${totalWeekTopics}`}
          >
            <div
              className="h-full rounded-full bg-tertiary transition-all duration-500"
              style={{ width: `${(topicPosition / totalWeekTopics) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
