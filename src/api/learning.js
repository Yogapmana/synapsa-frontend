import api from './client'

export function startLearning({ topic, duration_weeks, level, hours_per_day, language }) {
  return api.post('/learning/start', {
    topic,
    duration_weeks,
    level,
    hours_per_day,
    language,
  }).then((response) => response.data)
}

export function getSessions() {
  return api.get('/learning/sessions').then((response) => response.data)
}

export function getSession(sessionId) {
  return api.get(`/learning/${sessionId}`).then((response) => response.data)
}

export function getCurriculum(sessionId) {
  return api.get(`/learning/${sessionId}/curriculum`).then((response) => response.data)
}

export function getTopics(sessionId) {
  return api.get(`/learning/${sessionId}/topics`).then((response) => response.data)
}

export function getModule(sessionId, topicId) {
  return api.get(`/learning/${sessionId}/modules/${topicId}`).then((response) => response.data)
}

export function completeTopic(sessionId, topicId) {
  return api.patch(`/learning/${sessionId}/topics/${topicId}/complete`).then((response) => response.data)
}

export function generateModule(sessionId, topicId) {
  return api.post(`/modules/${topicId}/generate?session_id=${sessionId}`).then((response) => response.data)
}
