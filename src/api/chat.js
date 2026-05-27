import api from './client'

export function sendMessage({ session_id, topic_id, message, include_sources }) {
  return api.post('/chat/message', {
    session_id,
    topic_id,
    message,
    include_sources,
  }).then((response) => response.data)
}

export function getHistory(topicId, sessionId) {
  return api.get(`/chat/history/${topicId}`, {
    params: { session_id: sessionId },
  }).then((response) => response.data)
}

export function deleteHistory(topicId, sessionId) {
  return api.delete(`/chat/history/${topicId}`, {
    params: { session_id: sessionId },
  }).then((response) => response.data)
}
