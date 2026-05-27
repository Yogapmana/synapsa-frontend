import api from './client'

export function login(email, password) {
  const body = new URLSearchParams({
    username: email,
    password,
  })

  return api.post('/auth/login', body, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  }).then((response) => response.data)
}

export function register({ username, email, password }) {
  return api.post('/auth/register', { username, email, password })
    .then((response) => response.data)
}

export function getMe() {
  return api.get('/auth/me').then((response) => response.data)
}
