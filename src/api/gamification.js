import api from './client';

/**
 * Gamification API client.
 *
 * Two endpoints:
 *  - ``getHeatmap(days)`` — daily activity for the Streak Heatmap
 *  - ``getXp()`` — current level + total XP + recent events
 *
 * Both are read-only; the write side happens on the backend
 * as a side-effect of mastery updates in quiz.py.
 */

export function getHeatmap(days = 84) {
  return api
    .get('/gamification/heatmap', { params: { days } })
    .then((response) => response.data);
}

export function getXp() {
  return api.get('/gamification/xp').then((response) => response.data);
}
