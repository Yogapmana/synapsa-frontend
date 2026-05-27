import { useMutation, useQuery } from '@tanstack/react-query'
import { getTopics } from '../api/learning'
import { evaluateFeedback, submitSignal } from '../api/progress'
import { getQuizHistory } from '../api/quiz'

export function useSubmitSignal() {
  return useMutation({
    mutationFn: (data) => submitSignal(data),
  })
}

export function useEvaluateFeedback() {
  return useMutation({
    mutationFn: ({ sessionId, topicId }) => evaluateFeedback(sessionId, topicId),
  })
}

export function useProgress(sessionId) {
  return useQuery({
    queryKey: ['progress', sessionId],
    queryFn: async () => {
      const [topics, quizResults] = await Promise.all([
        getTopics(sessionId),
        getQuizHistory(sessionId),
      ])

      return {
        topics,
        quizResults,
      }
    },
    enabled: !!sessionId,
  })
}
