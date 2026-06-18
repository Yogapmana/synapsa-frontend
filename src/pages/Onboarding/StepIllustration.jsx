import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * StepIllustration — decorative editorial illustration for each onboarding step.
 *
 * Phase 5.6: gives each step its own personality through a stylized
 * line illustration + decorative numeral. Borrowed from editorial
 * magazine layout — the kind of illustration you'd see in The New
 * Yorker or Wired onboarding screens.
 *
 * Three variants: 'goal' | 'upload' | 'confirm'
 */
export default function StepIllustration({ variant = 'goal', className }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div className={cn('relative w-32 h-32 mx-auto mb-2', className)} aria-hidden="true">
      {/* Decorative oversized numeral behind */}
      <span className="absolute -top-6 -right-4 font-display text-[7rem] font-black italic text-tertiary/[0.08] leading-none pointer-events-none select-none">
        {variant === 'goal' && '01'}
        {variant === 'upload' && '02'}
        {variant === 'confirm' && '03'}
      </span>

      {/* Illustration */}
      <motion.div
        animate={shouldReduceMotion ? {} : { y: [0, -4, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="relative"
      >
        {variant === 'goal' && <GoalIllustration />}
        {variant === 'upload' && <UploadIllustration />}
        {variant === 'confirm' && <ConfirmIllustration />}
      </motion.div>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────── */
/* Step 01 — Goal: a target with an arrow hitting the bullseye.        */
/* ────────────────────────────────────────────────────────────────── */
function GoalIllustration() {
  return (
    <svg viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Outer ring */}
      <circle cx="70" cy="70" r="58" stroke="rgb(196, 37, 28)" strokeOpacity="0.15" strokeWidth="2" fill="none" />
      <circle cx="70" cy="70" r="44" stroke="rgb(196, 37, 28)" strokeOpacity="0.25" strokeWidth="2" fill="none" />
      <circle cx="70" cy="70" r="30" stroke="rgb(196, 37, 28)" strokeOpacity="0.4" strokeWidth="2" fill="none" />
      {/* Bullseye */}
      <circle cx="70" cy="70" r="14" fill="rgb(196, 37, 28)" fillOpacity="0.85" />
      <circle cx="70" cy="70" r="6" fill="rgb(255, 251, 239)" />

      {/* Arrow piercing bullseye */}
      <g transform="rotate(-30 70 70)">
        <line x1="70" y1="70" x2="135" y2="70" stroke="rgb(34, 32, 29)" strokeWidth="2.5" strokeLinecap="round" />
        {/* Arrow head */}
        <polygon points="70,70 78,66 78,74" fill="rgb(34, 32, 29)" />
        {/* Arrow fletching */}
        <line x1="125" y1="64" x2="130" y2="58" stroke="rgb(196, 37, 28)" strokeWidth="2" strokeLinecap="round" />
        <line x1="125" y1="76" x2="130" y2="82" stroke="rgb(196, 37, 28)" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* Decorative sparks around the bullseye */}
      <g opacity="0.6">
        <line x1="40" y1="35" x2="46" y2="41" stroke="rgb(196, 37, 28)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="100" y1="35" x2="94" y2="41" stroke="rgb(196, 37, 28)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="40" y1="105" x2="46" y2="99" stroke="rgb(196, 37, 28)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="100" y1="105" x2="94" y2="99" stroke="rgb(196, 37, 28)" strokeWidth="1.5" strokeLinecap="round" />
      </g>
    </svg>
  )
}

/* ────────────────────────────────────────────────────────────────── */
/* Step 02 — Upload: stack of documents with an upward arrow.         */
/* ────────────────────────────────────────────────────────────────── */
function UploadIllustration() {
  return (
    <svg viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Bottom doc */}
      <rect x="32" y="68" width="58" height="58" rx="4" fill="rgb(247, 241, 227)" stroke="rgb(196, 190, 177)" strokeWidth="1.5" />
      <line x1="40" y1="80" x2="78" y2="80" stroke="rgb(123, 118, 109)" strokeWidth="1.2" opacity="0.5" />
      <line x1="40" y1="88" x2="80" y2="88" stroke="rgb(123, 118, 109)" strokeWidth="1.2" opacity="0.4" />
      <line x1="40" y1="96" x2="74" y2="96" stroke="rgb(123, 118, 109)" strokeWidth="1.2" opacity="0.4" />

      {/* Middle doc */}
      <rect x="44" y="58" width="58" height="58" rx="4" fill="rgb(255, 251, 239)" stroke="rgb(196, 190, 177)" strokeWidth="1.5" />
      <line x1="52" y1="70" x2="90" y2="70" stroke="rgb(123, 118, 109)" strokeWidth="1.2" opacity="0.5" />
      <line x1="52" y1="78" x2="92" y2="78" stroke="rgb(123, 118, 109)" strokeWidth="1.2" opacity="0.4" />
      <line x1="52" y1="86" x2="86" y2="86" stroke="rgb(123, 118, 109)" strokeWidth="1.2" opacity="0.4" />

      {/* Top doc — the active upload */}
      <rect x="56" y="48" width="58" height="58" rx="4" fill="rgb(255, 251, 239)" stroke="rgb(196, 37, 28)" strokeWidth="2" />
      <line x1="64" y1="60" x2="100" y2="60" stroke="rgb(196, 37, 28)" strokeWidth="1.5" opacity="0.6" />
      <line x1="64" y1="68" x2="102" y2="68" stroke="rgb(123, 118, 109)" strokeWidth="1.2" opacity="0.4" />
      <line x1="64" y1="76" x2="96" y2="76" stroke="rgb(123, 118, 109)" strokeWidth="1.2" opacity="0.4" />
      <line x1="64" y1="84" x2="100" y2="84" stroke="rgb(123, 118, 109)" strokeWidth="1.2" opacity="0.4" />

      {/* Upward arrow — "uploading" */}
      <g transform="translate(85, 18)">
        <line x1="0" y1="22" x2="0" y2="6" stroke="rgb(196, 37, 28)" strokeWidth="2.5" strokeLinecap="round" />
        <polygon points="0,0 -5,7 5,7" fill="rgb(196, 37, 28)" />
      </g>

      {/* Sparkles */}
      <g opacity="0.5">
        <circle cx="20" cy="30" r="2" fill="rgb(196, 37, 28)" />
        <circle cx="120" cy="50" r="1.5" fill="rgb(196, 37, 28)" />
        <circle cx="22" cy="115" r="1.5" fill="rgb(196, 37, 28)" />
      </g>
    </svg>
  )
}

/* ────────────────────────────────────────────────────────────────── */
/* Step 03 — Confirm: a checkmark in a sunburst.                       */
/* ────────────────────────────────────────────────────────────────── */
function ConfirmIllustration() {
  const rays = Array.from({ length: 12 }, (_, i) => i * 30)

  return (
    <svg viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Sunburst rays */}
      <g opacity="0.25">
        {rays.map((angle) => (
          <line
            key={angle}
            x1="70"
            y1="70"
            x2="70"
            y2="20"
            stroke="rgb(196, 37, 28)"
            strokeWidth="1.5"
            strokeLinecap="round"
            transform={`rotate(${angle} 70 70)`}
          />
        ))}
      </g>

      {/* Check circle */}
      <circle cx="70" cy="70" r="36" fill="rgb(196, 37, 28)" />
      <circle cx="70" cy="70" r="36" fill="url(#confirm-grad)" />
      <path
        d="M 55 70 L 65 80 L 86 58"
        stroke="rgb(255, 251, 239)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Decorative star */}
      <g transform="translate(110, 30)" opacity="0.7">
        <path
          d="M 0 -6 L 1.5 -1.5 L 6 0 L 1.5 1.5 L 0 6 L -1.5 1.5 L -6 0 L -1.5 -1.5 Z"
          fill="rgb(196, 37, 28)"
        />
      </g>
      <g transform="translate(28, 110)" opacity="0.5">
        <path
          d="M 0 -4 L 1 -1 L 4 0 L 1 1 L 0 4 L -1 1 L -4 0 L -1 -1 Z"
          fill="rgb(196, 37, 28)"
        />
      </g>

      <defs>
        <linearGradient id="confirm-grad" x1="34" y1="34" x2="106" y2="106" gradientUnits="userSpaceOnUse">
          <stop stopColor="rgb(196, 37, 28)" />
          <stop offset="1" stopColor="rgb(154, 30, 22)" />
        </linearGradient>
      </defs>
    </svg>
  )
}