import { create } from 'zustand'
import { useLearningStore } from './learningStore'
import { useChatStore } from './chatStore'

const TOKEN_KEY = 'pla_token'
const USER_KEY = 'pla_user'

/**
 * Pending streak celebration.
 *
 * Set on every login/register that crosses a day boundary
 * (``is_new_day === true``). Read by ``AppLayout`` which renders
 * the global ``StreakCelebration`` modal. Cleared when the user
 * dismisses the modal.
 *
 * Shape matches the backend's ``StreakInfo`` schema:
 *   { new_streak, longest_streak, is_new_day, milestone }
 * where ``milestone`` is the dict from
 * ``streak_service.STREAK_MILESTONES`` (or null).
 */
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

  try {
    useChatStore.getState().setActiveChatSessionId(null)
  } catch {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('chat-storage')
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
  // Streak celebration state. Null when there's nothing to show.
  // Set by ``login`` when the response includes ``streak.is_new_day``.
  // Cleared by ``clearStreakCelebration`` (called by the modal's
  // onClose, or by logout).
  pendingStreakCelebration: null,
  // Level-up celebration state. Set by the quiz-submit flow (or
  // any other mastery-milestone hook) when ``xp_awarded`` includes
  // a ``leveled_up: true`` event. Cleared by ``clearLevelUp``.
  pendingLevelUp: null,

  /**
   * Sign in. ``streak`` is the optional ``StreakInfo`` from the
   * backend (omit on /refresh which doesn't update streak). When
   * provided and ``is_new_day`` is true, we:
   *   1. sync ``user.current_streak`` into the learning store so
   *      the existing Topbar/Sidebar/Dashboard/GreetingHero/Curriculum
   *      displays (which all read from ``useLearningStore.streak``)
   *      pick up the new value immediately
   *   2. queue a celebration modal via ``pendingStreakCelebration``
   */
  login: (token, user, streak = null) => {
    clearStaleUserData()
    persistSession(token, user)

    // Mirror the streak into learningStore so existing consumers
    // (Topbar badge, Dashboard stat card, etc.) light up without
    // a code change. We read from the user payload first, fall
    // back to the streak metadata, so even a partial login
    // response (no streak field) still updates the UI.
    const newStreak =
      (user && typeof user.current_streak === 'number'
        ? user.current_streak
        : null) ??
      (streak && typeof streak.new_streak === 'number'
        ? streak.new_streak
        : null) ??
      null
    if (newStreak !== null) {
      try {
        useLearningStore.getState().setStreak(newStreak)
      } catch {
        /* non-fatal — the learning store is best-effort */
      }
    }

    set({
      token,
      user,
      isAuthenticated: true,
      // Only queue the celebration when the login actually crossed
      // a day boundary. Same-day re-logins (or refresh-token
      // calls) leave this null and no modal appears.
      pendingStreakCelebration:
        streak && streak.is_new_day ? streak : null,
    })
  },

  logout: () => {
    clearSession()
    clearStaleUserData()
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      pendingStreakCelebration: null,
      pendingLevelUp: null,
    })
  },

  updateToken: (newToken) => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(TOKEN_KEY, newToken)
    set({ token: newToken })
  },

  /** Dismiss the streak celebration modal (one-shot). */
  clearStreakCelebration: () => set({ pendingStreakCelebration: null }),

  /**
   * Queue a level-up celebration. Called by the quiz-submit
   * hook (and any other place that knows XP was just awarded and
   * a level threshold was crossed). ``levelUp`` is the payload
   * the LevelUpCelebration component expects:
   *   { new_level, level_name, xp_awarded_total, events: [...] }
   * ``events`` is optional — a list of milestone events with
   * ``{milestone, xp}`` so the modal can render per-milestone
   * chips.
   */
  setLevelUp: (levelUp) => set({ pendingLevelUp: levelUp }),

  /** Dismiss the level-up modal (one-shot). */
  clearLevelUp: () => set({ pendingLevelUp: null }),

  restoreSession: () => {
    const storedSession = readStoredUser()

    if (!storedSession) {
      get().logout()
      return
    }

    // Restore the streak from the persisted user payload. We do
    // NOT re-trigger a celebration here — restoreSession runs on
    // page reload, not on a fresh login, so the user shouldn't
    // see the modal again.
    const restoredStreak = storedSession.user?.current_streak
    if (typeof restoredStreak === 'number') {
      try {
        useLearningStore.getState().setStreak(restoredStreak)
      } catch {
        /* non-fatal */
      }
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
