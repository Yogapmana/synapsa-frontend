import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, Lock, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * ProgressRing (Phase polish)
 *
 * SVG circular progress with a centered stat. Used as the hero element
 * on the Curriculum page to make "6/36 topics done" feel tangible.
 *
 * Props:
 *  - value: 0-1 progress (0.17 for 17%)
 *  - size: outer diameter in px (default 160)
 *  - strokeWidth: ring thickness (default 10)
 *  - label / sublabel: rendered in the center
 *  - tone: 'tertiary' (default, brand red) | 'success' (all done)
 */
export function ProgressRing({
  value = 0,
  size = 160,
  strokeWidth = 10,
  label,
  sublabel,
  tone = 'tertiary',
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.max(0, Math.min(1, value)));
  const shouldReduceMotion = useReducedMotion();
  const strokeColor =
    tone === 'success' ? 'rgb(22, 101, 52)' : 'rgb(196, 37, 28)';

  return (
    <div className="relative inline-flex" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgb(var(--border))"
          strokeWidth={strokeWidth}
          opacity={0.4}
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={shouldReduceMotion ? { strokeDashoffset: offset } : { strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: shouldReduceMotion ? 0 : 1.2, ease: [0.4, 0, 0.2, 1] }}
          style={{ filter: 'drop-shadow(0 0 6px rgba(196, 37, 28, 0.25))' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label && (
          <div className="font-display text-3xl font-bold text-primary tabular-nums leading-none">
            {label}
          </div>
        )}
        {sublabel && (
          <div className="text-xs font-label uppercase tracking-wider text-secondary mt-1.5">
            {sublabel}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProgressRing;
