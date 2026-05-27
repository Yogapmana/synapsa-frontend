import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
    <div className="sticky bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-3 sm:flex-row sm:items-center sm:gap-6">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
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
        <Button
          onClick={handleComplete}
          disabled={completing}
          className="shrink-0"
        >
          <CheckCircle2 className="mr-2 size-4" />
          {completing ? 'Menandai...' : 'Tandai Selesai'}
        </Button>
      </div>
    </div>
  )
}