import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteHistory, getHistory, sendMessage } from '../api/chat'

export function useChatHistory(topicId, sessionId) {
  return useQuery({
    queryKey: ['chat', topicId],
    queryFn: () => getHistory(topicId, sessionId),
    enabled: !!topicId,
  })
}

export function useSendMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => sendMessage(data),
    onSuccess: (_, variables) => {
      const topicId = variables?.topicId ?? variables?.topic_id
      if (topicId) {
        queryClient.invalidateQueries({ queryKey: ['chat', topicId] })
      }
    },
  })
}

export function useDeleteHistory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ topicId, sessionId }) => deleteHistory(topicId, sessionId),
    onSuccess: (_, variables) => {
      const topicId = variables?.topicId ?? variables?.topic_id
      if (topicId) {
        queryClient.invalidateQueries({ queryKey: ['chat', topicId] })
      }
    },
  })
}
