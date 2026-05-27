import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getQuiz, getQuizHistory, submitQuiz } from '../api/quiz'

export function useQuiz(topicId, numQuestions = 5) {
  return useQuery({
    queryKey: ['quiz', topicId],
    queryFn: () => getQuiz(topicId, numQuestions),
    enabled: !!topicId,
  })
}

export function useSubmitQuiz() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => submitQuiz(data),
    onSuccess: (_, variables) => {
      const sessionId = variables?.sessionId ?? variables?.session_id
      if (sessionId) {
        queryClient.invalidateQueries({ queryKey: ['quiz-results', sessionId] })
      }
    },
  })
}

export function useQuizHistory(sessionId) {
  return useQuery({
    queryKey: ['quiz-results', sessionId],
    queryFn: () => getQuizHistory(sessionId),
    enabled: !!sessionId,
  })
}
