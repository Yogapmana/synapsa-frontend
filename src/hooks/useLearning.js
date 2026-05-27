import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { completeTopic, getCurriculum, getModule, getSessions, getTopics, startLearning } from '../api/learning'
import { SESSION_STATUSES, hasActiveSession } from '../stores/learningStore'

const SESSION_STATUS_PRIORITY = {
  [SESSION_STATUSES.READY]: 0,
  [SESSION_STATUSES.PROCESSING]: 1,
  [SESSION_STATUSES.ACTIVE]: 2,
}

function findActiveSession(sessions) {
  if (!Array.isArray(sessions)) {
    return null
  }

  return sessions
    .filter((session) => hasActiveSession(session))
    .sort((a, b) => {
      const priorityA = SESSION_STATUS_PRIORITY[a?.status] ?? Number.POSITIVE_INFINITY
      const priorityB = SESSION_STATUS_PRIORITY[b?.status] ?? Number.POSITIVE_INFINITY

      return priorityA - priorityB
    })[0] || null
}

export function useActiveSession(options = {}) {
  return useQuery({
    queryKey: ['active-session'],
    queryFn: async () => {
      const sessions = await getSessions()
      return findActiveSession(sessions)
    },
    enabled: options.enabled !== false,
  })
}

export function useCurriculum(sessionId) {
  return useQuery({
    queryKey: ['curriculum', sessionId],
    queryFn: () => getCurriculum(sessionId),
    enabled: !!sessionId,
  })
}

export function useTopics(sessionId) {
  return useQuery({
    queryKey: ['topics', sessionId],
    queryFn: () => getTopics(sessionId),
    enabled: !!sessionId,
  })
}

export function useModule(sessionId, topicId) {
  return useQuery({
    queryKey: ['module', topicId],
    queryFn: () => getModule(sessionId, topicId),
    enabled: !!sessionId && !!topicId,
  })
}

export function useCompleteTopic() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ sessionId, topicId }) => completeTopic(sessionId, topicId),
    onSuccess: async (_, variables) => {
      queryClient.removeQueries({ queryKey: ['topics', variables.sessionId] })
      queryClient.removeQueries({ queryKey: ['curriculum', variables.sessionId] })
      queryClient.invalidateQueries({ queryKey: ['module', variables.topicId] })
    },
  })
}

export function useStartLearning() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (config) => startLearning(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-session'] })
    },
  })
}
