import { motion } from 'framer-motion';
import { Star, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * XpBar — the progress bar that sits inside the XpCard.
 *
 * Two pieces:
 *   1. The bar itself — a horizontal fill with a "shimmer" pass
 *      on first mount (only the first time the user opens the
 *      card during a session — kept simple by always running it).
 *   2. The "to next level" tick + label — visual marker for the
 *      next milestone.
 *
 * The bar fills with `tertiary` and uses a gradient + subtle
 * animation so it doesn't look static. When the user is at
 * max level we render a "Max level!" badge instead.
 */
export default function XpBar({ progressPct, isMaxLevel, levelName, currentLevelXp, nextLevelXp, xpInCurrentLevel, xpToNextLevel }) {
  if (isMaxLevel) {
    return (
      <div className="flex items-center justify-center gap-2 py-2 rounded-xl bg-warning/10 border border-warning/20">
        <Sparkles size={14} className="text-warning" />
        <span className="text-xs font-label font-semibold text-warning">
          Level Maks Tercapai!
        </span>
      </div>
    );
  }

  // Clamp pct to 0-100 just in case.
  const pct = Math.max(0, Math.min(100, progressPct || 0));

  return (
    <div className="space-y-1.5">
      <div
        className="relative h-2.5 rounded-full bg-secondary/15 overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progress ke ${levelName}: ${pct}%`}
      >
        {/* Animated fill. We animate the width via inline style
            with a CSS transition so the fill "fills" smoothly on
            first mount. The motion.div on the inside adds a tiny
            shimmer that travels left-to-right. */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-tertiary to-tertiary-light overflow-hidden"
        >
          {/* Shimmer — a thin diagonal band that sweeps across
              once on mount. Uses framer-motion to drive the
              position. Subtle, not flashy. */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{ duration: 1.4, delay: 0.4, ease: 'easeInOut' }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            aria-hidden="true"
          />
        </motion.div>

        {/* Tick mark at the END of the current level (i.e. the
            "100%" point). Subtle dot so the user can see how
            close they are. */}
        <div
          className="absolute right-0 inset-y-0 w-px bg-primary/15"
          aria-hidden="true"
        />
      </div>
      <div className="flex items-center justify-between text-[10.5px] font-label tabular-nums">
        <span className="text-secondary/70">
          {xpInCurrentLevel} / {nextLevelXp - currentLevelXp} XP
        </span>
        <span
          className={cn(
            'font-semibold',
            pct >= 80 ? 'text-tertiary' : 'text-secondary/80',
          )}
        >
          {pct}%
        </span>
      </div>
    </div>
  );
}
