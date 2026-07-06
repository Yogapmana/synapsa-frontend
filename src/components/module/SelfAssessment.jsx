import { useState, useCallback, useEffect } from 'react'
import { useSubmitSignal } from '@/hooks/useProgress'
import { useDebounce } from '@/hooks/useDebounce'

const LABELS = ['Tidak yakin sama sekali', 'Kurang yakin', 'Cukup yakin', 'Yakin', 'Sangat yakin']

export default function SelfAssessment({ sessionId, topicId, initialValue, onAssess }) {
  // Convert 0-1 ratio from backend to 1-5 slider value, default to 3
  const defaultVal = initialValue !== undefined && initialValue !== null 
    ? Math.round(initialValue * 5) 
    : 3;
    
  const [value, setValue] = useState(defaultVal)
  const debouncedValue = useDebounce(value, 500)
  const { mutate: submitSignal } = useSubmitSignal()

  useEffect(() => {
    if (initialValue !== undefined && initialValue !== null) {
      // Don't override if user already changed it (we can just trust initial load here)
      setValue(Math.round(initialValue * 5) || 1)
    }
  }, [initialValue])

  useEffect(() => {
    if (debouncedValue) {
      submitSignal({
        session_id: sessionId,
        topic_id: topicId,
        self_assessment: debouncedValue / 5,
      })
    }
  }, [debouncedValue, sessionId, topicId, submitSignal])

  const handleChange = useCallback(
    (e) => {
      setValue(Number(e.target.value))
    },
    [],
  )

  const handleCommit = useCallback(
    (e) => {
      const v = Number(e.target.value)
      onAssess?.({
        session_id: sessionId,
        topic_id: topicId,
        self_assessment: v / 5,
      })
    },
    [sessionId, topicId, onAssess],
  )

  const percentage = ((value - 1) / 4) * 100

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-primary font-label">
          Seberapa yakin kamu memahami ini?
        </p>
        <span className="text-sm font-bold text-tertiary">{value}/5</span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={value}
          onChange={handleChange}
          onMouseUp={handleCommit}
          onTouchEnd={handleCommit}
          className="confidence-slider"
          aria-label="Self assessment slider"
          style={{
            background: `linear-gradient(to right, rgb(var(--tertiary)) 0%, rgb(var(--tertiary)) ${percentage}%, rgb(var(--bg-secondary)) ${percentage}%, rgb(var(--bg-secondary)) 100%)`,
          }}
        />
        <div className="mt-1.5 flex justify-between px-0.5">
          {LABELS.map((label, i) => (
            <span
              key={i}
              className={`text-[10px] font-label transition-colors ${
                value === i + 1 ? 'text-tertiary font-semibold' : 'text-secondary/60'
              }`}
            >
              {i + 1}
            </span>
          ))}
        </div>
      </div>
      <p className="text-xs text-secondary font-label">
        {LABELS[value - 1]}
      </p>
    </div>
  )
}