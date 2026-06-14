import { cn } from '@/lib/utils'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { useCompleteTopic } from '@/hooks/useLearning'
import MaterialRating from './MaterialRating'
import SelfAssessment from './SelfAssessment'
import { useSubmitSignal } from '@/hooks/useProgress'

export default function StickyActionBar({ module, sessionId, topicId }) {
  const navigate = useNavigate()
  const completeTopic = useCompleteTopic()
  const submitSignalMutation = useSubmitSignal()
  const [completing, setCompleting] = useState(false)

  const handleRate = (data) => {
    submitSignalMutation.mutate(data)
  }

  const handleAssess = (data) => {
    submitSignalMutation.mutate(data)
  }

  const handleComplete = async () => {
    setCompleting(true)
    try {
      await completeTopic.mutateAsync({ sessionId, topicId })
      navigate(`/quiz/${topicId}`)
    } catch {
      setCompleting(false)
    }
  }

  return (
    <div className="sticky bottom-0 z-40 border-t border-[var(--border)] bg-surface/95 backdrop-blur-md">
      <div className="mx-auto max-w-[720px] px-4 py-4 md:px-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-8">
            <div className="flex-1 space-y-4">
              <MaterialRating
                sessionId={sessionId}
                topicId={topicId}
                onRate={handleRate}
              />
              <SelfAssessment
                sessionId={sessionId}
                topicId={topicId}
                onAssess={handleAssess}
              />
            </div>
          </div>
          <div className="flex justify-end pt-1">
            <button
              onClick={handleComplete}
              disabled={completing}
              className="inline-flex items-center gap-2 rounded-xl bg-tertiary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-tertiary-light active:bg-tertiary-dark disabled:opacity-60 disabled:cursor-not-allowed shadow-warm-sm"
            >
              <CheckCircle2 className="size-4" />
              {completing ? 'Menandai...' : 'Tandai Selesai'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}