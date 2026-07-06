import { useEffect, useRef } from 'react'
import { useSubmitSignal } from './useProgress'

const INTERVAL_MS = 2 * 60 * 1000 // send every 2 minutes

export function useReadingTracker(sessionId, topicId, estimatedMinutes) {
  const { mutate: submitSignal } = useSubmitSignal()
  const startTimeRef = useRef(Date.now())
  const lastSentRef = useRef(Date.now())
  const ratioSentRef = useRef(false)

  useEffect(() => {
    startTimeRef.current = Date.now()
    lastSentRef.current = Date.now()
    ratioSentRef.current = false

    const sendReadingTime = (isFinal = false) => {
      const now = Date.now()
      // Seconds elapsed since last send (for incremental tracking)
      const incrementSeconds = Math.round((now - lastSentRef.current) / 1000)

      if (incrementSeconds < 10) return

      lastSentRef.current = now

      const payload = {
        session_id: sessionId,
        topic_id: topicId,
        reading_time_seconds: incrementSeconds,
      }

      // Send ratio only once (on first send or final send)
      if (!ratioSentRef.current) {
        const totalElapsed = Math.round((now - startTimeRef.current) / 1000)
        const estimatedSeconds = (estimatedMinutes || 1) * 60
        payload.reading_time_ratio = Math.min(totalElapsed / estimatedSeconds, 1.0)
        ratioSentRef.current = true
      }

      submitSignal(payload)
    }

    // Periodic send every 2 minutes
    const intervalId = setInterval(() => {
      sendReadingTime(false)
    }, INTERVAL_MS)

    const onVisibilityChange = () => {
      if (document.hidden) {
        sendReadingTime(true)
      }
    }

    const onBeforeUnload = () => {
      sendReadingTime(true)
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('beforeunload', onBeforeUnload)

    return () => {
      sendReadingTime(true) // send remaining time on unmount
      clearInterval(intervalId)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('beforeunload', onBeforeUnload)
    }
  }, [sessionId, topicId, estimatedMinutes, submitSignal])

  return { isTracking: true }
}
