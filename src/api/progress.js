import api from './client'

export function submitSignal({ session_id, topic_id, quiz_score, reading_time_ratio, question_frequency, self_assessment, material_rating }) {
  return api.post('/progress/signal', {
    session_id,
    topic_id,
    quiz_score,
    reading_time_ratio,
    question_frequency,
    self_assessment,
    material_rating,
  }).then((response) => response.data)
}

export function evaluateFeedback(sessionId, topicId) {
  return api.post('/progress/evaluate', null, {
    params: { session_id: sessionId, topic_id: topicId },
  }).then((response) => response.data)
}

export function getUserMetrics(sessionId) {
  return api.get(`/progress/user-metrics/${sessionId}`).then(res => res.data)
}
