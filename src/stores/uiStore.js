import { create } from 'zustand'

const DESKTOP_BREAKPOINT = 1024

const getInitialSidebarCollapsed = () => {
  if (typeof window === 'undefined') return false
  return window.innerWidth < DESKTOP_BREAKPOINT
}

export const useUIStore = create((set) => ({
  sidebarCollapsed: getInitialSidebarCollapsed(),

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}))