import { create } from 'zustand'

export const SESSION_STATUSES = {
  PROCESSING: 'processing',
  READY: 'ready',
  ACTIVE: 'active',
}

export function hasActiveSession(session) {
  return [
    SESSION_STATUSES.PROCESSING,
    SESSION_STATUSES.READY,
    SESSION_STATUSES.ACTIVE,
  ].includes(session?.status)
}

const SESSION_KEY = 'pla_active_session'

const readStoredSession = () => {
  if (typeof window === 'undefined') return null
  const stored = window.localStorage.getItem(SESSION_KEY)
  if (!stored) return null
  try {
    return JSON.parse(stored)
  } catch {
    return null
  }
}

const persistSession = (session) => {
  if (typeof window === 'undefined') return
  if (session) {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } else {
    window.localStorage.removeItem(SESSION_KEY)
  }
}

export const useLearningStore = create((set, get) => ({
  activeSession: null,
  activeTopic: null,
  streak: 0,

  setActiveSession: (session) => {
    persistSession(session)
    set({ activeSession: session })
  },
  setActiveTopic: (topic) => set({ activeTopic: topic }),
  setStreak: (count) => set({ streak: count }),
}))

if (typeof window !== 'undefined') {
  const storedSession = readStoredSession()
  if (storedSession) {
    useLearningStore.setState({ activeSession: storedSession })
  }
}
