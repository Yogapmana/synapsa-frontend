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
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          {greeting}, {username}! <span aria-hidden="true">🌱</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Siap untuk melanjutkan petualangan belajarmu hari ini?
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-3 bg-orange-50 dark:bg-orange-950/30 px-4 py-2.5 rounded-2xl border border-orange-100 dark:border-orange-900/50">
          <motion.div
            initial={shouldReduceMotion ? { scale: 1 } : { scale: 0.8 }}
            animate={shouldReduceMotion ? { scale: 1 } : { scale: [0.8, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
          >
            <Flame className="w-6 h-6 text-orange-500 fill-orange-500" />
          </motion.div>
          <div>
            <div className="text-xs font-medium text-orange-600/80 dark:text-orange-400/80 uppercase tracking-wider">
              Streak
            </div>
            <div className="text-lg font-bold text-orange-700 dark:text-orange-400 leading-none">
              <CountUp value={streak} /> Hari
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-700 min-w-[200px]">
          <div className="flex justify-between items-end mb-2">
            <div>
              <div className="text-xs font-medium text-blue-600/80 dark:text-blue-400/80 uppercase tracking-wider">
                Level {levelInfo.level}
              </div>
              <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                {levelInfo.name}
              </div>
            </div>
            <div className="text-xs font-medium text-gray-500">
              <CountUp value={xp} /> / {levelInfo.max === xp ? 'MAX' : levelInfo.max} XP
            </div>
          </div>
          <Progress value={progressPercent} className="h-2 bg-gray-100 dark:bg-gray-700" />
        </div>
      </div>
    </div>
  );
}
