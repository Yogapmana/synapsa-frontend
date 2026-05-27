import { create } from 'zustand'

export const useAgentLogStore = create((set) => ({
  logs: [],
  isConnected: false,
  filter: [],

  addLog: (log) =>
    set((state) => ({
      logs: [...state.logs, log],
    })),

  clearLogs: () => set({ logs: [] }),

  setFilter: (agents) => set({ filter: agents }),

  setConnected: (isConnected) => set({ isConnected }),
}))
