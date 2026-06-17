import api from './client'

export function startLearning(data) {
  const formData = new FormData();
  formData.append('topic', data.topic);
  formData.append('duration_weeks', data.duration_weeks);
  formData.append('level', data.level);
  formData.append('hours_per_day', data.hours_per_day);
  formData.append('language', data.language || 'id');
  
  // Append files if they exist
  if (data.files && data.files.length > 0) {
    data.files.forEach(file => {
      formData.append('files', file);
    });
  }

  return api.post('/learning/start', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }).then((response) => response.data);
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
