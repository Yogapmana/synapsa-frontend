import { useState, useCallback, useEffect } from 'react'
import { Slider } from '@/components/ui/slider'
import { useSubmitSignal } from '@/hooks/useProgress'
import { useDebounce } from '@/hooks/useDebounce'

const LABELS = ['Tidak yakin sama sekali', 'Kurang yakin', 'Cukup yakin', 'Yakin', 'Sangat yakin']

export default function SelfAssessment({ sessionId, topicId, onAssess }) {
  const [value, setValue] = useState(3)
  const debouncedValue = useDebounce(value, 500)
  const { mutate: submitSignal } = useSubmitSignal()

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
    (newValue) => {
      setValue(newValue[0])
    },
    [],
  )

  const handleCommit = useCallback(
    (newValue) => {
      const v = newValue[0]
      onAssess?.({
        session_id: sessionId,
        topic_id: topicId,
        self_assessment: v / 5,
      })
    },
    [sessionId, topicId, onAssess],
  )

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-foreground">
        Seberapa yakin kamu memahami ini?
      </p>
      <div className="flex items-center gap-4">
        <Slider
          value={[value]}
          min={1}
          max={5}
          step={1}
          onValueChange={handleChange}
          onValueCommit={handleCommit}
          className="flex-1"
          aria-label="Self assessment slider"
        />
        <span className="w-6 text-center text-lg font-bold text-primary">{value}</span>
      </div>
      <p className="text-xs text-muted-foreground">{LABELS[value - 1]}</p>
    </div>
  )
}