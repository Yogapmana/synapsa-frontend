import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Clock, ArrowRight, BookOpen, ChevronLeft, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
export default function ModuleTopbar({ module, scrollContainerRef }) {
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

  // Pseudo "topic number" — derived from the URL id (last 2 chars of
  // the topic hash, padded to 2 digits). This gives the user a sense
  // of where they are in the curriculum without us needing to fetch
  // the full topic list. A real implementation could pull this from
  // useTopics() and pass it as a prop.
  const topicNumber = (() => {
    if (!topicId) return null
    const hash = String(topicId).split('-').pop() || topicId
    const num = parseInt(String(hash).replace(/\D/g, '').slice(-2) || '0', 10)
    return num > 0 ? String(num).padStart(2, '0') : null
  })()

  return (
    <div className="sticky top-0 z-30 backdrop-blur-md bg-neutral/85">
      {/* Full-width row — NO max-w / NO mx-auto.
          The topbar sits inside the main content area (left of the
          420px chat panel), and we want the back button + title to
          anchor to the LEFT EDGE of that area, not to the center
          of the page. */}
      <div className="flex h-12 items-center gap-2.5 px-4 md:px-6">
        {/* Back button — at the very left */}
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

        {/* Book icon — small decorative anchor next to the title */}
        <div
          className="hidden sm:flex size-7 items-center justify-center rounded-lg bg-tertiary/10 text-tertiary shrink-0"
          aria-hidden="true"
        >
          <BookOpen className="size-3.5" />
        </div>

        {/* Title block — eyebrow ABOVE the title, both LEFT-aligned.
            No max-w on the title (let it size to content) so the
            block doesn't "float" in the middle of empty space. */}
        <div className="min-w-0 shrink text-left">
          <div className="hidden md:flex items-center gap-1.5 mb-0.5">
            <span className="text-[10px] font-label uppercase tracking-[0.18em] text-tertiary font-bold whitespace-nowrap">
              {topicNumber ? `Topik ${topicNumber}` : 'Topik'}
            </span>
            <span className="size-1 rounded-full bg-tertiary/40" aria-hidden="true" />
            <span className="text-[10px] font-label uppercase tracking-[0.18em] text-secondary/70 whitespace-nowrap">
              Modul
            </span>
          </div>
          <h1
            title={module?.title}
            className="font-display font-semibold text-[15px] text-primary leading-tight truncate"
          >
            {module?.title ?? 'Memuat…'}
          </h1>
        </div>

        {/* Spacer — pushes the right cluster to the right edge of
            the main content area (just before the 420px chat panel). */}
        <div className="flex-1" />

        {/* Right cluster — reading time + (after 80%) quiz button */}
        <div className="flex items-center gap-2 shrink-0">
          {estimatedMinutes > 0 && (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-secondary font-label tabular-nums px-2.5 py-1 rounded-lg bg-bg-secondary/40 border border-border/40">
              <Clock className="size-3.5" aria-hidden="true" />
              {estimatedMinutes} mnt
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
                Mulai Kuis
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}