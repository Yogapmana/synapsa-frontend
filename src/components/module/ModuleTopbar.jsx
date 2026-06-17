import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, ArrowRight, BookOpen, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * ModuleTopbar — sticky top bar for the module reading page.
 *
 * Phase fix (post-`tempelan` redesign):
 *   - Removed the white card background (`bg-surface/95`) and the
 *     `border-b` so the topbar no longer reads as a separate "card"
 *     glued onto the page. The topbar now blends with the cream page
 *     background.
 *   - Removed the reading progress bar (red/gray 1px line) at the
 *     bottom — the user reported it as "gk perlu ada garis merah" (no
 *     need for the red line). Progress is already shown in the
 *     Curriculum page's MindMap; duplicating it on every module page
 *     is unnecessary chrome.
 *   - Kept a very subtle `backdrop-blur` for readability when content
 *     scrolls under it (frosted-glass effect, no solid color).
 *   - The topbar is now just the back button, the title, the time
 *     pill, and the "Mulai Kuis" button (after 80% scroll) — nothing
 *     else, nothing more.
 */
export default function ModuleTopbar({ module, scrollContainerRef }) {
  const [showQuizButton, setShowQuizButton] = useState(false)

  // Listen to the Module page's own scroll container (NOT window).
  // After the AppLayout change, the page body never scrolls — the
  // Module root does. So `window.scrollY` would always be 0 and the
  // "Mulai Kuis" button would never appear. We attach the scroll
  // listener to the ref'd container instead, and use its
  // `scrollTop` / `scrollHeight` for the percentage calc.
  //
  // The effect re-runs when the ref changes (it doesn't, in practice,
  // but we cover the case anyway) and cleans up the listener on
  // unmount or ref change.
  useEffect(() => {
    const el = scrollContainerRef?.current
    if (!el) return

    const handleScroll = () => {
      const scrollable = el.scrollHeight - el.clientHeight
      if (scrollable <= 0) {
        // Nothing to scroll — short module. Don't show the button
        // (the user is already "at 100%" but the bottom action bar
        // is the primary CTA in that case).
        setShowQuizButton(false)
        return
      }
      const scrollPercent = el.scrollTop / scrollable
      setShowQuizButton(scrollPercent >= 0.8)
    }

    handleScroll() // run once on mount in case the user lands at the bottom
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [scrollContainerRef])

  const estimatedMinutes = module?.estimated_read_minutes ?? 0

  return (
    <div className="sticky top-0 z-30 backdrop-blur-sm">
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
    </div>
  )
}
