import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useLearningStore } from '@/stores/learningStore'
import { useModule, useTopics } from '@/hooks/useLearning'
import { generateModule } from '@/api/learning'
import { Skeleton } from '@/components/ui/skeleton'
import EmptyState from '@/components/common/EmptyState'
import ModuleTopbar from '@/components/module/ModuleTopbar'
import ModuleContent from '@/components/module/ModuleContent'
import ResourceCard from '@/components/module/ResourceCard'
import CourseCard from '@/components/module/CourseCard'
import StickyActionBar from '@/components/module/StickyActionBar'
import ReadingTracker from '@/components/module/ReadingTracker'
import ModuleChatPanel from '@/components/module/ModuleChatSlider'
import { BookOpen, GraduationCap, Loader2 } from 'lucide-react'
import ReadingProgressBar from '@/components/module/ReadingProgressBar'
import { useTranslation } from 'react-i18next'

/**
 * Module page
 *
 * Layout (final):
 *   - Single page scroll, same as every other page in the app.
 *   - The article is on the left (`flex-1` in the main row). The
 *     Tutor AI chat is a persistent right sidebar at 420px — always
 *     visible, no toggle, no FAB. The user can always read AND chat.
 *     This is the standard pattern (Notion AI, Linear AI, Cursor).
 *   - The chat panel is `position: sticky; top: 3.5rem` and
 *     `height: calc(100vh - 3.5rem)` so it stays visible at the top
 *     of the viewport as the user scrolls the article. Long
 *     conversations overflow internally (chat has its own scrollbar).
 *   - The StickyActionBar lives INSIDE the article column, sticky to
 *     the bottom of the viewport. "Tandai Selesai" stays visible.
 */

function ModuleSkeleton() {
  return (
    <div className="mx-auto max-w-[720px] px-4 md:px-6 pt-10 pb-4">
      <div className="space-y-3 mb-8">
        <Skeleton className="h-5 w-32 skeleton-shimmer" />
        <Skeleton className="h-10 w-3/4 skeleton-shimmer" />
      </div>
      <div className="space-y-5">
        <Skeleton className="h-7 w-2/3 skeleton-shimmer" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full skeleton-shimmer" />
          <Skeleton className="h-4 w-5/6 skeleton-shimmer" />
          <Skeleton className="h-4 w-4/6 skeleton-shimmer" />
        </div>
        <Skeleton className="h-40 w-full rounded-xl skeleton-shimmer" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full skeleton-shimmer" />
          <Skeleton className="h-4 w-3/4 skeleton-shimmer" />
        </div>
      </div>
    </div>
  )
}

function GeneratingState() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-tertiary/10 mb-6">
        <Loader2 className="size-8 animate-spin text-tertiary" />
      </div>
      <h2 className="text-xl font-display font-bold tracking-tight text-primary mb-2">
        {t('module.generating_title')}
      </h2>
      <p className="text-secondary max-w-md text-center text-sm leading-relaxed">
        {t('module.generating_desc')}
      </p>
    </div>
  )
}

function ModuleArticle({ module }) {
  const { t } = useTranslation();
  const sources = module.sources ?? []
  const courses = module.courses ?? []

  return (
    <article className="relative mx-auto max-w-[720px] px-4 md:px-6 pt-8 md:pt-10 pb-4">
      {/* Decorative oversized numeral — small enough to NOT overlap content */}
      <span
        aria-hidden="true"
        className="absolute top-2 -left-2 font-display text-[4rem] font-black italic text-tertiary/[0.05] leading-none pointer-events-none select-none hidden md:block"
      >
        ✦
      </span>

      {/* Eyebrow — establishes editorial hierarchy */}
      <div className="mb-3">
        <span className="eyebrow">{t('module.learning_material')}</span>
      </div>

      {/* Article body — title is shown in the sticky topbar above and as
          the first H1 in the markdown body itself. No duplicate H1 here
          (Phase fix — the H1 was rendering twice in a row). */}
      <ModuleContent content={module.content_markdown} topicTitle={module.title} />

      {/* Citations / sources — at the END of the article, not in a sidebar.
          They're part of the reading experience, not a floating rail. */}
      {sources.length > 0 && (
        <section className="mt-16 pt-8 border-t border-border">
          <div className="mb-5">
            <span className="eyebrow">{t('module.reference')}</span>
          </div>
          <h2 className="mb-5 flex items-center gap-2.5 text-xl font-display font-bold text-primary tracking-tight">
            <BookOpen className="size-5 text-tertiary" aria-hidden="true" />
            {t('module.sources_used')}
          </h2>
          <div className="space-y-2.5">
            {sources.map((source, i) => (
              <ResourceCard
                key={`${source.url || source.title}-${i}`}
                source={source}
              />
            ))}
          </div>
        </section>
      )}

      {/* External courses — also at the end, after sources */}
      {courses.length > 0 && (
        <section className="mt-12 pt-8 border-t border-border">
          <div className="mb-5">
            <span className="eyebrow">{t('module.learn_more')}</span>
          </div>
          <h2 className="mb-5 flex items-center gap-2.5 text-xl font-display font-bold text-primary tracking-tight">
            <GraduationCap className="size-5 text-tertiary" aria-hidden="true" />
            {t('module.related_courses')}
          </h2>
          <div className="space-y-2.5">
            {courses.map((course, i) => (
              <CourseCard
                key={`${course.url || course.title}-${i}`}
                course={course}
              />
            ))}
          </div>
        </section>
      )}
    </article>
  )
}

export default function Module() {
  const { t } = useTranslation();
  const { topicId } = useParams()
  const { activeSession } = useLearningStore()
  const sessionId = activeSession?.id

  // The Module page is the SCROLL CONTAINER — not the page itself.
  // The AppLayout locks the page at h-screen overflow-hidden so
  // the body never gets a scrollbar. That means sticky elements
  // (the chat panel at top-14, the bottom action bar at bottom-0,
  // the topbar at top-0) need a scrollable ancestor INSIDE the
  // module. This `scrollContainerRef` is attached to the root div
  // and passed to ModuleTopbar so the topbar's 80%-scroll quiz
  // button can read the right `scrollTop` / `scrollHeight` pair
  // (it can't use `window.scrollY` because the body doesn't scroll).
  const scrollContainerRef = useRef(null)

  const { data: module, isLoading, error, refetch } = useModule(sessionId, topicId)
  const { data: topicsData } = useTopics(sessionId)

  const allTopics = Array.isArray(topicsData) ? topicsData : topicsData?.topics || []
  const currentTopic = allTopics.find(t => t.id === topicId)
  const isLocked = currentTopic?.status === 'locked'

  const [generating, setGenerating] = useState(false)
  const [generationTriggered, setGenerationTriggered] = useState(false)

  useEffect(() => {
    let interval
    if (!isLoading && !module && !generating && !generationTriggered && sessionId && topicId && !isLocked) {
      setGenerating(true)
      setGenerationTriggered(true)
      generateModule(sessionId, topicId)
        .then(() => {
          interval = setInterval(() => {
            refetch()
          }, 5000)
        })
        .catch(() => {
          setGenerating(false)
        })
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isLoading, module, generating, generationTriggered, sessionId, topicId, refetch])

  useEffect(() => {
    if (module && generating) {
      setGenerating(false)
    }
  }, [module, generating])

  // The chat panel needs a `module.title` for the topic pill. Only
  // render it once the module is loaded — for loading/locked/error
  // states the page chrome is shown alone.
  const moduleTitle = module?.title

  return (
    <div 
      ref={scrollContainerRef}
      className="flex h-full relative overflow-y-auto items-start"
    >
      {/* Article container — flex-1 takes remaining width. */}
      <div className="flex-1 min-w-0 flex flex-col relative">
        <ReadingProgressBar scrollContainerRef={scrollContainerRef} />
        <ModuleTopbar module={module} scrollContainerRef={scrollContainerRef} />

        <ReadingTracker
          sessionId={sessionId}
          topicId={topicId}
          estimatedMinutes={module?.estimated_read_minutes}
        />

        <main className="flex-1 min-w-0">
          {isLoading || generating ? (
            <>{generating ? <GeneratingState /> : <ModuleSkeleton />}</>
          ) : isLocked ? (
            <div className="mx-auto max-w-[720px] px-4 md:px-6 py-16">
              <EmptyState
                icon={BookOpen}
                title={t('module.module_locked')}
                description={t('module.module_locked_desc')}
                actionLabel={t('module.back_to_curriculum')}
                onAction={() => window.location.href = '/curriculum'}
              />
            </div>
          ) : error || !module ? (
            <div className="mx-auto max-w-[720px] px-4 md:px-6 py-16">
              <EmptyState
                icon={BookOpen}
                title={t('module.module_not_found')}
                description={t('module.module_not_found_desc')}
                actionLabel={t('module.back_to_curriculum')}
                onAction={() => window.location.href = '/curriculum'}
              />
            </div>
          ) : (
            <>
              <ModuleArticle module={module} />
              <StickyActionBar
                module={module}
                sessionId={sessionId}
                topicId={topicId}
              />
            </>
          )}
        </main>
      </div>

      {/* Chat panel — OUTSIDE the article scroll container.
          This lets it be sticky relative to the page viewport
          instead of scrolling with the article. It sits to the
          right of the article and stays in place as the user
          scrolls through the content. */}
      {module && (
        <ModuleChatPanel
          sessionId={sessionId}
          topicId={topicId}
          moduleTitle={moduleTitle}
        />
      )}
    </div>
  )
}
