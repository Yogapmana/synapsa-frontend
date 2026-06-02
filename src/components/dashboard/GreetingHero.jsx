import React from 'react';
import { Flame } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { LEVEL_NAMES, LEVEL_THRESHOLDS } from '../../utils/constants';
import { Progress } from '../ui/progress';
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
  const progressPercent = levelInfo.max === xp && levelInfo.max !== 0 ? 100 : (currentProgress / range) * 100;

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          {greeting}, {username}! <span aria-hidden="true">🌱</span>
        </h1>
        <p className="text-secondary">
          Siap untuk melanjutkan petualangan belajarmu hari ini?
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-3 bg-tertiary/10 px-4 py-2.5 rounded-2xl border border-tertiary/20">
          <motion.div
            initial={shouldReduceMotion ? { scale: 1 } : { scale: 0.8 }}
            animate={shouldReduceMotion ? { scale: 1 } : { scale: [0.8, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
          >
            <Flame className="w-6 h-6 text-tertiary fill-tertiary" />
          </motion.div>
          <div>
            <div className="text-xs font-medium text-tertiary/80 uppercase tracking-wider">
              Streak
            </div>
            <div className="text-lg font-bold text-tertiary leading-none">
              <CountUp value={streak} /> Hari
            </div>
          </div>
        </div>

        <div className="bg-surface px-4 py-2.5 rounded-2xl border border-[var(--border)] min-w-[200px]">
          <div className="flex justify-between items-end mb-2">
            <div>
              <div className="text-xs font-medium text-secondary/80 uppercase tracking-wider">
                Level {levelInfo.level}
              </div>
              <div className="text-sm font-bold text-primary">
                {levelInfo.name}
              </div>
            </div>
            <div className="text-xs font-medium text-secondary">
              <CountUp value={xp} /> / {levelInfo.max === xp ? 'MAX' : levelInfo.max} XP
            </div>
          </div>
          <Progress value={progressPercent} className="h-2 bg-neutral" />
        </div>
      </div>
    </div>
  );
}
