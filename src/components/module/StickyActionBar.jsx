import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, Sparkles } from 'lucide-react'
import { useSubmitSignal } from '@/hooks/useProgress'
import { useQuery } from '@tanstack/react-query'
import { getTopicSignals } from '@/api/progress'
import { cn } from '@/lib/utils'
import MaterialRating from './MaterialRating'
import SelfAssessment from './SelfAssessment'
import { PdfExportButton } from './PdfExportButton'

/**
 * StickyActionBar — bottom action bar for the module reading page.
 *
 * Phase fix (post-`tempelan` redesign):
 *   - Tanya Tutor button was removed from the bar — the chat is now
 *     triggered by a floating action button (FAB) on the right side of
 *     the page.
 *   - The "feedback card" (MaterialRating + SelfAssessment) and action 
 *     buttons are stacked vertically.
 */
export default function StickyActionBar({ module, sessionId, topicId }) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const submitSignalMutation = useSubmitSignal()
  const [completing, setCompleting] = useState(false)

  // Fetch previously saved signals (if any) so state doesn't reset when revisiting
  const { data: initialSignals } = useQuery({
    queryKey: ['topic-signals', sessionId, topicId],
    queryFn: () => getTopicSignals(sessionId, topicId),
    enabled: !!sessionId && !!topicId,
    staleTime: 5 * 60 * 1000,
  })

  const handleRate = (data) => {
    submitSignalMutation.mutate(data)
  }

  const handleAssess = (data) => {
    submitSignalMutation.mutate(data)
  }

  const handleComplete = () => {
    navigate(`/quiz/${topicId}?session=${sessionId}`)
  }

  return (
    <div
      className={cn(
        'relative z-30 mt-12',
        'pt-6 pb-4 md:pb-5',
      )}
    >
      <div className="mx-auto max-w-[720px] px-4 md:px-6">
        <div
          className={cn(
            // Use flex-col to stack feedback on top and buttons on bottom
            'flex flex-col gap-6',
            'rounded-2xl border border-border-subtle/60 bg-surface-1/85 backdrop-blur-md',
            'shadow-warm-sm p-4 md:p-6',
          )}
        >
          {/* TOP — feedback widgets */}
          <div className="flex flex-col space-y-5">
            <MaterialRating
              sessionId={sessionId}
              topicId={topicId}
              initialValue={initialSignals?.material_rating}
              onRate={handleRate}
            />
            <div className="h-px bg-border-subtle/50" aria-hidden="true" />
            <SelfAssessment
              sessionId={sessionId}
              topicId={topicId}
              initialValue={initialSignals?.self_assessment}
              onAssess={handleAssess}
            />
          </div>

          {/* BOTTOM — primary action: Tandai Selesai & Export PDF */}
          <div className="flex flex-col gap-3 pt-4 border-t border-border-subtle/50">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <PdfExportButton 
                  module={module} 
                  sessionId={sessionId} 
                  topicId={topicId} 
                  className="w-full h-[48px]" 
                />
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <button
                  onClick={handleComplete}
                  disabled={completing}
                  className={cn(
                    'inline-flex items-center justify-center gap-2 rounded-xl',
                    'bg-tertiary px-5 h-[48px] w-full',
                    'text-sm font-semibold text-white font-label',
                    'transition-colors hover:bg-tertiary-dark active:bg-tertiary-dark',
                    'disabled:opacity-60 disabled:cursor-not-allowed',
                    'shadow-warm-sm hover:shadow-warm-md whitespace-nowrap',
                  )}
                >
                  <CheckCircle2 className="size-4" />
                  {completing ? t('module.loading', 'Memuat…') : t('module.continue_to_quiz', 'Lanjut ke Kuis')}
                </button>
              </div>
            </div>
            <p className="text-[11px] font-label text-text-subtle text-center leading-tight">
              Lalu otomatis ke kuis
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
