import api from './client'

export function sendMessage({ session_id, topic_id, message, include_sources }) {
  const payload = {
    session_id,
    message,
    include_sources,
  };
  if (topic_id) {
    payload.topic_id = topic_id;
  }
  return api.post('/chat/message', payload).then((response) => response.data)
}

export function getHistory(sessionId, topicId = null) {
  const params = { session_id: sessionId };
  if (topicId) params.topic_id = topicId;
  return api.get(`/chat/history`, { params }).then((response) => response.data)
}

export function deleteHistory(sessionId, topicId = null) {
  const params = { session_id: sessionId };
  if (topicId) params.topic_id = topicId;
  return api.delete(`/chat/history`, { params }).then((response) => response.data)
}

export function uploadDocument(file, session_id, topic_id = null) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('session_id', session_id);
  if (topic_id) {
    formData.append('topic_id', topic_id);
  }

  return api.post('/chat/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }).then((response) => response.data);
}

export function getRagasSummary(sessionId) {
  return api.get(`/chat/ragas-summary/${sessionId}`).then((response) => response.data);
}

export function getChatSessions() {
  return api.get('/chat/sessions').then((response) => response.data);
}

export function createChatSession(title) {
  return api.post('/chat/sessions', { title }).then((response) => response.data);
}

export function deleteChatSession(sessionId) {
  return api.delete(`/chat/sessions/${sessionId}`).then((response) => response.data);
}

