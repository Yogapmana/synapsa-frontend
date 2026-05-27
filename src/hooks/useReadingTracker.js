import { useEffect, useRef } from 'react'
import { useSubmitSignal } from './useProgress'

export function useReadingTracker(sessionId, topicId, estimatedMinutes) {
  const { mutate: submitSignal } = useSubmitSignal()
  const startTimeRef = useRef(Date.now())
  const sentRef = useRef(false)

  useEffect(() => {
    startTimeRef.current = Date.now()
    sentRef.current = false

    const sendReadingTime = () => {
      if (sentRef.current) return

      const elapsedSeconds = Math.round((Date.now() - startTimeRef.current) / 1000)
      
      if (elapsedSeconds < 10) return

      const estimatedSeconds = (estimatedMinutes || 1) * 60
      const ratio = Math.min(elapsedSeconds / estimatedSeconds, 1.0)

      sentRef.current = true
      
      submitSignal({
        session_id: sessionId,
        topic_id: topicId,
        reading_time_ratio: ratio,
      })
    }

    const onVisibilityChange = () => {
      if (document.hidden) {
        sendReadingTime()
      }
    }

    const onBeforeUnload = () => {
      sendReadingTime()
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('beforeunload', onBeforeUnload)

    return () => {
      sendReadingTime()
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('beforeunload', onBeforeUnload)
    }
  }, [sessionId, topicId, estimatedMinutes, submitSignal])

  return { isTracking: !sentRef.current }
}
