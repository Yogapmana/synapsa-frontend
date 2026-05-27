import api from './client'

export function getQuiz(topicId, numQuestions) {
  return api.get(`/quiz/${topicId}`, {
    params: { num_questions: numQuestions },
  }).then((response) => response.data)
}

export function submitQuiz({ session_id, topic_id, answers, time_spent_seconds, questions_data }) {
  return api.post('/quiz/submit', {
    session_id,
    topic_id,
    answers,
    time_spent_seconds,
    questions_data,
  }).then((response) => response.data)
}

export function getQuizHistory(sessionId) {
  return api.get(`/quiz/history/${sessionId}`).then((response) => response.data)
}
