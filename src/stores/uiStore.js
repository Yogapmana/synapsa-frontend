import { create } from 'zustand'

const DARK_MODE_KEY = 'pla_dark_mode'
const DESKTOP_BREAKPOINT = 1024

const getInitialSidebarCollapsed = () => {
  if (typeof window === 'undefined') return false
  return window.innerWidth < DESKTOP_BREAKPOINT
}

const getInitialDarkMode = () => {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(DARK_MODE_KEY) === 'true'
}

const applyDarkMode = (enabled) => {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', enabled)
}

const persistDarkMode = (enabled) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(DARK_MODE_KEY, String(enabled))
}

const initialDarkMode = getInitialDarkMode()

if (typeof document !== 'undefined') {
  applyDarkMode(initialDarkMode)
}

export const useUIStore = create((set) => ({
  sidebarCollapsed: getInitialSidebarCollapsed(),
  darkMode: initialDarkMode,

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  toggleDarkMode: () =>
    set((state) => {
      const nextDarkMode = !state.darkMode
      applyDarkMode(nextDarkMode)
      persistDarkMode(nextDarkMode)
      return { darkMode: nextDarkMode }
    }),
}))
