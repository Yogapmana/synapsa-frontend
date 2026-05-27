import api from './client'

export function getRagMetrics(sessionId) {
  return api.get(`/metrics/rag/${sessionId}`).then((response) => response.data)
}

export function submitUxSurvey({ session_id, ease_of_use, material_relevance, quiz_quality, adaptivity_satisfaction, overall_satisfaction, open_feedback }) {
  return api.post('/metrics/ux', {
    session_id,
    ease_of_use,
    material_relevance,
    quiz_quality,
    adaptivity_satisfaction,
    overall_satisfaction,
    open_feedback,
  }).then((response) => response.data)
}

export function getUxSurveys(sessionId) {
  return api.get(`/metrics/ux/${sessionId}`).then((response) => response.data)
}
