import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useSubmitSignal } from '@/hooks/useProgress'

const OPTIONS = [
  { value: 1.0, emoji: '😊', label: 'Paham' },
  { value: 0.5, emoji: '😐', label: 'Agak Bingung' },
  { value: 0.0, emoji: '😕', label: 'Tidak Paham' },
]

export default function MaterialRating({ sessionId, topicId, onRate }) {
  const [selected, setSelected] = useState(null)
  const { mutate: submitSignal } = useSubmitSignal()

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
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-foreground">Seberapa paham materinya?</p>
      <div className="flex gap-2">
        {OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => handleClick(option)}
            className={cn(
              'flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-colors',
              selected === option.value
                ? 'border-primary bg-tertiary/10 text-primary font-medium'
                : 'border-border bg-background text-foreground hover:border-primary/50 hover:bg-tertiary/5',
            )}
          >
            <span className="text-base">{option.emoji}</span>
            <span>{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}