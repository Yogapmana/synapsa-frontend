import { create } from 'zustand'

const TOKEN_KEY = 'pla_token'
const USER_KEY = 'pla_user'

const persistSession = (token, user) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(TOKEN_KEY, token)
  window.localStorage.setItem(USER_KEY, JSON.stringify(user))
}

const clearSession = () => {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(TOKEN_KEY)
  window.localStorage.removeItem(USER_KEY)
}

const readStoredUser = () => {
  if (typeof window === 'undefined') return null

  const token = window.localStorage.getItem(TOKEN_KEY)
  const userRaw = window.localStorage.getItem(USER_KEY)

  if (!token || !userRaw) return null

  try {
    const user = JSON.parse(userRaw)
    if (!user?.id || !user?.username || !user?.email) return null
    return { token, user }
  } catch {
    return null
  }
}

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: (token, user) => {
    persistSession(token, user)
    set({
      token,
      user,
      isAuthenticated: true,
    })
  },

  logout: () => {
    clearSession()
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    })
  },

  updateToken: (newToken) => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(TOKEN_KEY, newToken)
    set({ token: newToken })
  },

  restoreSession: () => {
    const storedSession = readStoredUser()

    if (!storedSession) {
      get().logout()
      return
    }

    set({
      token: storedSession.token,
      user: storedSession.user,
      isAuthenticated: true,
    })
  },
}))

if (typeof window !== 'undefined') {
  const storedSession = readStoredUser()
  if (storedSession) {
    useAuthStore.setState({
      token: storedSession.token,
      user: storedSession.user,
      isAuthenticated: true,
    })
  }
}
