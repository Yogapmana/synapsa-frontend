import React from 'react';
import { Flame } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { LEVEL_NAMES, LEVEL_THRESHOLDS } from '../../utils/constants';
import { CountUp } from './CountUp';

function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 11) return 'Selamat pagi';
  if (hour < 15) return 'Selamat siang';
  if (hour < 18) return 'Selamat sore';
  return 'Selamat malam';
}

function getLevelInfo(xp) {
  const levels = Object.entries(LEVEL_THRESHOLDS).sort((a, b) => a[0] - b[0]);
  for (const [level, range] of levels) {
    if (xp >= range.min && xp <= range.max) {
      return {
        level: parseInt(level, 10),
        name: LEVEL_NAMES[level],
        min: range.min,
        max: range.max === Infinity ? xp : range.max,
      };
    }
  }
  return { level: 5, name: LEVEL_NAMES[5], min: 1001, max: xp };
}

export default function GreetingHero({ username = 'Pelajar', streak = 0, xp = 0 }) {
  const greeting = getTimeGreeting();
  const levelInfo = getLevelInfo(xp);
  const shouldReduceMotion = useReducedMotion();

  const range = levelInfo.max - levelInfo.min;
  const currentProgress = xp - levelInfo.min;
  const progressPercent =
    range <= 0
      ? 100
      : (levelInfo.max === xp && levelInfo.max !== 0
          ? 100
          : (currentProgress / range) * 100);

  return (
    <div className="page-header">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="page-title">
            {greeting}, {username}
          </h1>
          <p className="page-subtitle">
            Siap untuk melanjutkan petualangan belajarmu hari ini?
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2.5 bg-tertiary/10 px-4 py-2.5 rounded-xl border border-tertiary/20">
            <motion.div
              initial={shouldReduceMotion ? { scale: 1 } : { scale: 0.8 }}
              animate={shouldReduceMotion ? { scale: 1 } : { scale: [0.8, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2, repeatType: 'reverse' }}
            >
              <Flame className="w-5 h-5 text-tertiary fill-tertiary" />
            </motion.div>
            <div>
              <div className="text-[10px] font-label uppercase tracking-wider text-tertiary/80 leading-none">
                Streak
              </div>
              <div className="text-lg font-bold text-tertiary leading-tight">
                <CountUp value={streak} /> Hari
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-surface px-4 py-2.5 rounded-xl border border-[var(--border)] shadow-warm-xs">
            <div>
              <div className="text-[10px] font-label uppercase tracking-wider text-secondary leading-none">
                Level {levelInfo.level}
              </div>
              <div className="text-sm font-semibold text-primary leading-tight">
                {levelInfo.name}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}