import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
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
        Mengumpulkan Studi Kasus (Deep Dive)...
      </h2>
      <p className="text-secondary max-w-md text-center text-sm leading-relaxed">
        Berdasarkan performa sempurna Anda, AI Tutor sedang menyiapkan tantangan lanjutan. Mohon tunggu sebentar.
      </p>
    </div>
  )
}

function ModuleArticle({ module }) {
  return (
    <article className="relative mx-auto max-w-[720px] px-4 md:px-6 pt-8 md:pt-10 pb-4">
      <div className="mb-3">
        <span className="eyebrow text-amber-500 font-bold">Materi Pengayaan (Deep Dive)</span>
      </div>
      <ModuleContent content={module.deep_dive_markdown || "*Belum ada materi pengayaan.*"} topicTitle={`Deep Dive: ${module.title}`} />
    </article>
  )
}

export default function DeepDive() {
  const { t } = useTranslation();
  const { topicId } = useParams()
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
    if (module && !module.deep_dive_markdown) {
      setGenerating(true)
      interval = setInterval(() => {
        refetch()
      }, 5000)
    } else if (module && module.deep_dive_markdown) {
      setGenerating(false)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [module, refetch])

  const moduleTitle = module?.title

  return (
    <div 
      ref={scrollContainerRef}
      className="flex h-full relative overflow-y-auto items-start"
    >
      <div className="flex-1 min-w-0 flex flex-col relative">
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
            </>
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
