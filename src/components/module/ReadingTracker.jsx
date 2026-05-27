import { useReadingTracker } from '@/hooks/useReadingTracker'

export default function ReadingTracker({ sessionId, topicId, estimatedMinutes }) {
  useReadingTracker(sessionId, topicId, estimatedMinutes)
  return null
}
