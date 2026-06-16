import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useChatStore = create(
  persist(
    (set) => ({
      activeChatSessionId: null,
      setActiveChatSessionId: (id) => set({ activeChatSessionId: id }),
    }),
    {
      name: 'chat-storage',
    }
  )
);
