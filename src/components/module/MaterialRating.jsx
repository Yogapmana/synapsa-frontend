import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useSubmitSignal } from '@/hooks/useProgress'
import { ThumbsUp, Meh, ThumbsDown } from 'lucide-react'

const OPTIONS = [
  { value: 1.0, label: 'Paham', icon: ThumbsUp, activeClass: 'feedback-pill-active-success' },
  { value: 0.5, label: 'Agak Bingung', icon: Meh, activeClass: 'feedback-pill-active-warning' },
  { value: 0.0, label: 'Tidak Paham', icon: ThumbsDown, activeClass: 'feedback-pill-active-danger' },
]

export default function MaterialRating({ sessionId, topicId, initialValue, onRate }) {
  const [selected, setSelected] = useState(initialValue || null)
  const { mutate: submitSignal } = useSubmitSignal()

  // Update selected if initialValue is loaded later
  useEffect(() => {
    if (initialValue !== undefined && initialValue !== null) {
      setSelected(initialValue)
    }
  }, [initialValue])

  const handleClick = (option) => {
    setSelected(option.value)

    submitSignal({
      session_id: sessionId,
      topic_id: topicId,
      material_rating: option.value,
    })

    onRate?.({
      session_id: sessionId,
      topic_id: topicId,
      material_rating: option.value,
    })
  }

  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-sm font-semibold text-primary font-label">
        Seberapa paham materinya?
      </p>
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((option) => {
          const Icon = option.icon
          const isActive = selected === option.value
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleClick(option)}
              className={cn(
                'feedback-pill',
                isActive && option.activeClass,
              )}
            >
              <Icon className="size-4" />
              <span>{option.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}