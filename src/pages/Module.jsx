import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useLearningStore } from '@/stores/learningStore'
import { useModule, useCurriculum, useTopics } from '@/hooks/useLearning'
import { generateModule } from '@/api/learning'
import { Skeleton } from '@/components/ui/skeleton'
import EmptyState from '@/components/common/EmptyState'
import ModuleTopbar from '@/components/module/ModuleTopbar'
import ModuleContent from '@/components/module/ModuleContent'
import ResourceCard from '@/components/module/ResourceCard'
import CourseCard from '@/components/module/CourseCard'
import StickyActionBar from '@/components/module/StickyActionBar'
import ReadingTracker from '@/components/module/ReadingTracker'
import { BookOpen, GraduationCap, Loader2 } from 'lucide-react'

/**
 * Module page (Phase fix)
 *
 * What changed:
 *   - Removed the right-side Sumber/Kursus panel (sticky aside) — it was
 *     causing the page to feel "tidak nyatu" (disconnected). The Sumber
 *     section is now a single, full-width block AT THE END of the
 *     article (citations belong with the article, not floating in a rail).
 *   - Removed the duplicate progress bar in the article header — the
 *     sticky topbar is now the single source of truth for reading progress.
 *   - Removed the "Minggu X · level · X menit" meta line (it was duplicating
 *     info already in the topbar or not adding value). The article now
 *     starts cleanly with the title.
 *   - Slightly widened reading container (max-w-[860px] on the topbar,
 *     max-w-[720px] for body text — the optimal for long-form reading).
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
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-tertiary/10 mb-6">
        <Loader2 className="size-8 animate-spin text-tertiary" />
      </div>
      <h2 className="text-xl font-display font-bold tracking-tight text-primary mb-2">
        Menyusun materi untuk Anda…
      </h2>
      <p className="text-secondary max-w-md text-center text-sm leading-relaxed">
        Tutor AI sedang mengumpulkan dan menyusun materi pembelajaran.
        Mohon tunggu sebentar (1-2 menit).
      </p>
    </div>
  )
}

export default function Module() {
  const { topicId } = useParams()
  const { activeSession } = useLearningStore()
  const sessionId = activeSession?.id

  const { data: module, isLoading, error, refetch } = useModule(sessionId, topicId)

  const [generating, setGenerating] = useState(false)
  const [generationTriggered, setGenerationTriggered] = useState(false)

  useEffect(() => {
    let interval
    if (!isLoading && !module && !generating && !generationTriggered && sessionId && topicId) {
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

  if (isLoading || generating) {
    return (
      <div className="flex min-h-screen flex-col">
        <ModuleTopbar module={null} sessionId={sessionId} />
        <main className="flex-1 pb-32">
          {generating ? <GeneratingState /> : <ModuleSkeleton />}
        </main>
      </div>
    )
  }

  if (error || !module) {
    return (
      <div className="flex min-h-screen flex-col">
        <ModuleTopbar module={null} sessionId={sessionId} />
        <main className="flex-1 pb-32">
          <div className="mx-auto max-w-[720px] px-4 md:px-6 py-16">
            <EmptyState
              icon={BookOpen}
              title="Modul tidak ditemukan"
              description="Topik ini belum memiliki konten modul. Coba kembali nanti."
              actionLabel="Kembali ke Kurikulum"
              onAction={() => window.location.href = '/curriculum'}
            />
          </div>
        </main>
      </div>
    )
  }

  const sources = module.sources ?? []
  const courses = module.courses ?? []

  return (
    <div className="flex min-h-screen flex-col">
      <ModuleTopbar module={module} sessionId={sessionId} />

      <ReadingTracker
        sessionId={sessionId}
        topicId={topicId}
        estimatedMinutes={module.estimated_read_minutes}
      />

      <main className="flex-1 pb-48">
        <article className="mx-auto max-w-[720px] px-4 md:px-6 pt-8 md:pt-10 pb-4">
          {/* Article header — clean, just the title */}
          <header className="mb-8 md:mb-10">
            <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-primary leading-tight">
              {module.title}
            </h1>
          </header>

          {/* Article body */}
          <ModuleContent content={module.content_markdown} />

          {/* Citations / sources — at the END of the article, not in a sidebar.
              They're part of the reading experience, not a floating rail. */}
          {sources.length > 0 && (
            <section className="mt-16 pt-8 border-t border-border">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-display font-semibold text-primary">
                <BookOpen className="size-5 text-tertiary" aria-hidden="true" />
                Sumber yang Digunakan
              </h2>
              <div className="space-y-2.5">
                {sources.map((source) => (
                  <ResourceCard
                    key={source.url || source.title}
                    source={source}
                  />
                ))}
              </div>
            </section>
          )}

          {/* External courses — also at the end, after sources */}
          {courses.length > 0 && (
            <section className="mt-12 pt-8 border-t border-border">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-display font-semibold text-primary">
                <GraduationCap className="size-5 text-tertiary" aria-hidden="true" />
                Pelajari Lebih Dalam
              </h2>
              <div className="space-y-2.5">
                {courses.map((course, i) => (
                  <CourseCard
                    key={course.url || course.title || i}
                    course={course}
                  />
                ))}
              </div>
            </section>
          )}
        </article>
      </main>

      <StickyActionBar module={module} sessionId={sessionId} topicId={topicId} />
    </div>
  )
}
