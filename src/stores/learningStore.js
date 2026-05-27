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

export const useLearningStore = create((set) => ({
  activeSession: null,
  activeTopic: null,
  streak: 0,

  setActiveSession: (session) => set({ activeSession: session }),
  setActiveTopic: (topic) => set({ activeTopic: topic }),
  setStreak: (count) => set({ streak: count }),
}))
