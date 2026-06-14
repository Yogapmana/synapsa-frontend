import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Flame, BookOpen, Clock, Target } from 'lucide-react';
import { CountUp } from '../dashboard/CountUp';

/**
 * StatCard (Phase 2.5 — promoted to components/data/)
 *
 * Standard card for a single numeric metric on dashboard / overview pages.
 * Previously lived in `components/dashboard/StatCards.jsx`. Now reusable
 * across Dashboard, Metrics, and any future overview surface.
 *
 * Variants:
 *  - flame  → primary/CTA accent
 *  - book   → success (green)
 *  - clock  → warning (amber)
 *  - target → info (blue)
 *
 * Accessibility (Phase 1.10):
 *  - role="group" with aria-label summarizing the metric
 *  - decorative icon marked aria-hidden
 *  - respects prefers-reduced-motion via MotionConfig + useReducedMotion
 */

const ICON_MAP = {
  Flame,
  BookOpen,
  Clock,
  Target,
};

const ICON_BG_MAP = {
  Flame: 'bg-tertiary/10 text-tertiary',
  BookOpen: 'bg-success-light text-success-fg',
  Clock: 'bg-warning-light text-warning-fg',
  Target: 'bg-info-light text-info-fg',
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export function StatCard({ label, value, subtext, icon }) {
  const shouldReduceMotion = useReducedMotion();
  const IconComponent = ICON_MAP[icon] || BookOpen;
  const iconBg = ICON_BG_MAP[icon] || 'bg-secondary/10 text-secondary';

  const hoverProps = shouldReduceMotion
    ? {}
    : { whileHover: { y: -3, transition: { type: 'spring', stiffness: 400, damping: 20 } } };
  const tapProps = shouldReduceMotion ? {} : { whileTap: { scale: 0.98 } };

  return (
    <motion.div
      variants={item}
      {...hoverProps}
      {...tapProps}
      role="group"
      aria-label={`${label}: ${value}${subtext ? `. ${subtext}` : ''}`}
      className="card-base card-hover card-interactive p-5 relative overflow-hidden"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 min-w-0">
          <div className="text-xs font-label uppercase tracking-wider text-secondary">
            {label}
          </div>
          <div
            aria-hidden="true"
            className="text-3xl font-display font-bold text-primary leading-none tabular-nums"
          >
            {typeof value === 'number' ? <CountUp value={value} /> : value}
          </div>
          {subtext && (
            <div className="text-xs text-secondary/70 font-medium truncate">
              {subtext}
            </div>
          )}
        </div>
        <div
          aria-hidden="true"
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}
        >
          <IconComponent className="w-5 h-5" />
        </div>
      </div>
    </motion.div>
  );
}

export function StatCards({ stats = [], className }) {
  if (!stats.length) return null;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className={`grid grid-cols-2 lg:grid-cols-4 gap-4 ${className || ''}`}
    >
      {stats.map((stat, idx) => (
        <StatCard
          key={idx}
          label={stat.label}
          value={stat.value}
          subtext={stat.subtext}
          icon={stat.icon}
        />
      ))}
    </motion.div>
  );
}

export default StatCards;
