import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useLearningStore } from '@/stores/learningStore'
import { useModule } from '@/hooks/useLearning'
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

export default function Module() {
  const { topicId } = useParams()
  const { activeSession } = useLearningStore()
  const sessionId = activeSession?.id

  const { data: module, isLoading, error, refetch } = useModule(sessionId, topicId)
  const [generating, setGenerating] = useState(false)
  const [generationTriggered, setGenerationTriggered] = useState(false)

  useEffect(() => {
    let interval;
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
      <div className="mx-auto max-w-4xl px-4 py-8">
        {generating ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
            <h2 className="text-xl font-semibold text-slate-800">Menyusun materi untuk Anda...</h2>
            <p className="text-slate-500 max-w-md text-center">
              Tutor AI sedang mengumpulkan dan menyusun materi pembelajaran. 
              Mohon tunggu sebentar (1-2 menit).
            </p>
          </div>
        ) : (
          <>
            <Skeleton className="mb-6 h-8 w-3/4" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </>
        )}
      </div>
    )
  }

  if (error || !module) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <EmptyState
          icon={BookOpen}
          title="Modul tidak ditemukan"
          description="Topik ini belum memiliki konten modul. Coba kembali nanti."
          actionLabel="Kembali ke Kurikulum"
          onAction={() => window.location.href = '/curriculum'}
        />
      </div>
    )
  }

  const sources = module.sources ?? []
  const courses = module.courses ?? []
  const articles = sources.filter((s) => s.type === 'article')
  const videos = sources.filter((s) => s.type === 'video')
  const papers = sources.filter((s) => s.type === 'paper')

  return (
    <div className="flex min-h-screen flex-col">
      <ModuleTopbar module={module} sessionId={sessionId} />

      <ReadingTracker
        sessionId={sessionId}
        topicId={topicId}
        estimatedMinutes={module.estimated_read_minutes}
      />

      <main className="flex-1 pb-32">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <h1 className="mb-8 text-3xl font-bold tracking-tight">{module.title}</h1>

          <ModuleContent content={module.content_markdown} />

          {sources.length > 0 && (
            <section className="mx-auto mt-12 max-w-[720px]">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                <BookOpen className="size-5" />
                Sumber yang Digunakan
              </h2>
              <div className="space-y-3">
                {sources.map((source) => (
                  <ResourceCard key={source.url || source.title} source={source} />
                ))}
              </div>
            </section>
          )}

          {courses.length > 0 && (
            <section className="mx-auto mt-12 max-w-[720px]">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                <GraduationCap className="size-5" />
                Pelajari Lebih Dalam
              </h2>
              <div className="space-y-3">
                {courses.map((course, i) => (
                  <CourseCard key={course.url || course.title || i} course={course} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <StickyActionBar module={module} sessionId={sessionId} topicId={topicId} />
    </div>
  )
}