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

export function uploadDocument(file, session_id, topic_id) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('session_id', session_id);
  formData.append('topic_id', topic_id);

  return api.post('/chat/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }).then((response) => response.data);
}

export function getRagasSummary(sessionId) {
  return api.get(`/chat/ragas-summary/${sessionId}`).then((response) => response.data);
}

