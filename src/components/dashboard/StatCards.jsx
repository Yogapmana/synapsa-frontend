/**
 * DEPRECATED — Phase 2.5
 *
 * StatCards was promoted to `components/data/StatCards.jsx` so it can be
 * reused across Dashboard, Metrics, and any future overview page.
 *
 * This re-export keeps the old import path working until all callers
 * migrate. New code should import from `@/components/data/StatCards`.
 */
export { StatCard, StatCards, default } from '../data/StatCards';
