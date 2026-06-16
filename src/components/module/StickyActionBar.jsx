import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Sparkles } from 'lucide-react'
import { useCompleteTopic } from '@/hooks/useLearning'
import { useSubmitSignal } from '@/hooks/useProgress'
import { cn } from '@/lib/utils'
import MaterialRating from './MaterialRating'
import SelfAssessment from './SelfAssessment'

/**
 * StickyActionBar — bottom action bar for the module reading page.
 *
 * Phase fix (post-`tempelan` redesign):
 *   - Tanya Tutor button was removed from the bar — the chat is now
 *     triggered by a floating action button (FAB) on the right side of
 *     the page, and the chat panel slides in from the right (see
 *     FloatingChatButton + ModuleChatSlider).
 *   - The "feedback card" (MaterialRating + SelfAssessment) is now a
 *     single visual unit on the LEFT, with a subtle bg + soft border —
 *     no more disjointed pills floating in white space.
 *   - "Tandai Selesai" is the sole primary action on the RIGHT,
 *     right-aligned. Cleaner hierarchy: feedback (left) → action (right).
 *   - The bar no longer has a hard top border that cuts the page; it
 *     uses a soft top shadow that visually integrates with the cream
 *     background instead of creating a separate "card".
 */
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
    <div
      className={cn(
        'sticky bottom-0 z-30',
        // Soft separation from the page — gradient fade up, no hard border.
        'bg-gradient-to-t from-surface-0 via-surface-0/95 to-surface-0/0',
        'pt-6 pb-4 md:pb-5',
      )}
    >
      <div className="mx-auto max-w-[720px] px-4 md:px-6">
        <div
          className={cn(
            // Single cohesive card for the feedback + action row.
            'flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-5',
            'rounded-2xl border border-border-subtle/60 bg-surface-1/85 backdrop-blur-md',
            'shadow-warm-sm p-4 md:p-5',
          )}
        >
          {/* LEFT — feedback widgets grouped in a single visual unit */}
          <div className="flex-1 min-w-0 space-y-4">
            <MaterialRating
              sessionId={sessionId}
              topicId={topicId}
              onRate={handleRate}
            />
            <div className="h-px bg-border-subtle/50" aria-hidden="true" />
            <SelfAssessment
              sessionId={sessionId}
              topicId={topicId}
              onAssess={handleAssess}
            />
          </div>

          {/* RIGHT — primary action: Tandai Selesai.
              The Tanya Tutor button is gone — chat is opened via the
              FloatingChatButton on the right side of the page. */}
          <div className="flex sm:flex-col sm:items-stretch gap-2 shrink-0">
            <button
              onClick={handleComplete}
              disabled={completing}
              className={cn(
                'inline-flex items-center justify-center gap-2 rounded-xl',
                'bg-tertiary px-5 py-2.5 md:px-6 md:py-3',
                'text-sm font-semibold text-white font-label',
                'transition-colors hover:bg-tertiary-dark active:bg-tertiary-dark',
                'disabled:opacity-60 disabled:cursor-not-allowed',
                'shadow-warm-sm hover:shadow-warm-md whitespace-nowrap',
              )}
            >
              <CheckCircle2 className="size-4" />
              {completing ? 'Menandai…' : 'Tandai Selesai'}
            </button>
            <p className="hidden sm:block text-[11px] font-label text-text-subtle text-center leading-tight">
              Lalu otomatis ke kuis
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
