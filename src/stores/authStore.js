import { create } from 'zustand'
import { useLearningStore } from './learningStore'

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

const clearStaleUserData = () => {
  // Bersihkan state non-auth yang masih terikat user lama supaya
  // akun berikutnya (login/register ulang) tidak mewarisi data sebelumnya.
  try {
    useLearningStore.getState().setActiveSession(null)
  } catch {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('pla_active_session')
    }
  }
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
    // Clear any stale learning-session data from the previous user.
    // Without this, a new user who logs in on the same browser
    // would inherit the previous user's activeSession and be
    // skipped past the Onboarding wizard.
    clearStaleUserData()
    persistSession(token, user)
    set({
      token,
      user,
      isAuthenticated: true,
    })
  },

  logout: () => {
    clearSession()
    clearStaleUserData()
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
