import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLearningStore } from '@/stores/learningStore'
import { useModule, useTopics } from '@/hooks/useLearning'
import { Skeleton } from '@/components/ui/skeleton'
import EmptyState from '@/components/common/EmptyState'
import ModuleTopbar from '@/components/module/ModuleTopbar'
import ModuleContent from '@/components/module/ModuleContent'
import ModuleChatPanel from '@/components/module/ModuleChatSlider'
import { BookOpen, Loader2 } from 'lucide-react'
import ReadingProgressBar from '@/components/module/ReadingProgressBar'
import { useTranslation } from 'react-i18next'

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
        Meracik Materi Remedial...
      </h2>
      <p className="text-secondary max-w-md text-center text-sm leading-relaxed">
        AI Tutor sedang menyusun penjelasan khusus berdasarkan kelemahan Anda di kuis sebelumnya. Mohon tunggu sebentar.
      </p>
    </div>
  )
}

function ModuleArticle({ module }) {
  const { t } = useTranslation();

  return (
    <article className="relative mx-auto max-w-[720px] px-4 md:px-6 pt-8 md:pt-10 pb-4">
      <div className="mb-3">
        <span className="eyebrow">Materi Remedial (Review)</span>
      </div>
      <ModuleContent content={module.remedial_markdown || "*Belum ada materi remedial.*"} topicTitle={`Remedial: ${module.title}`} />
    </article>
  )
}

export default function Remedial() {
  const { t } = useTranslation();
  const { topicId } = useParams()
  const navigate = useNavigate()
  const { activeSession } = useLearningStore()
  const sessionId = activeSession?.id

  const scrollContainerRef = useRef(null)

  const { data: module, isLoading, error, refetch } = useModule(sessionId, topicId)
  const { data: topicsData } = useTopics(sessionId)

  const allTopics = Array.isArray(topicsData) ? topicsData : topicsData?.topics || []
  const currentTopic = allTopics.find(t => t.id === topicId)
  const isLocked = currentTopic?.status === 'locked'

  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    let interval
    // If we have a module but no remedial_markdown, it means the background task is still running.
    if (module && !module.remedial_markdown) {
      setGenerating(true)
      interval = setInterval(() => {
        refetch()
      }, 5000)
    } else if (module && module.remedial_markdown) {
      setGenerating(false)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [module, refetch])

  const moduleTitle = module?.title

  // Match Module layout: article column scrolls independently; Tutor AI
  // stays as a sticky right pane sibling (does not scroll with content).
  return (
    <div className="flex h-full min-h-0 relative items-stretch overflow-hidden">
      <div
        ref={scrollContainerRef}
        className="flex-1 min-w-0 flex flex-col relative overflow-y-auto h-full"
      >
        <ReadingProgressBar scrollContainerRef={scrollContainerRef} />
        <ModuleTopbar module={module} topic={currentTopic} scrollContainerRef={scrollContainerRef} />

        <main className="flex-1 min-w-0">
          {isLoading ? (
            <ModuleSkeleton />
          ) : generating ? (
            <GeneratingState />
          ) : isLocked ? (
            <div className="mx-auto max-w-[720px] px-4 md:px-6 py-16">
              <EmptyState
                icon={BookOpen}
                title={t('module.module_locked')}
                description={t('module.module_locked_desc')}
                actionLabel={t('module.back_to_curriculum')}
                onAction={() => navigate('/curriculum')}
              />
            </div>
          ) : error || !module ? (
            <div className="mx-auto max-w-[720px] px-4 md:px-6 py-16">
              <EmptyState
                icon={BookOpen}
                title={t('module.module_not_found')}
                description={t('module.module_not_found_desc')}
                actionLabel={t('module.back_to_curriculum')}
                onAction={() => navigate('/curriculum')}
              />
            </div>
          ) : (
            <ModuleArticle module={module} />
          )}
        </main>
      </div>

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
