import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * OptionButton — quiz answer choice.
 *
 * Phase 5.4: rebuilt with editorial treatment.
 *  - Larger letter chips (A, B, C, D) on the left for visual anchor
 *  - Smooth border + bg transitions, no harsh greens/reds
 *  - Bounce-on-reveal for correct answer
 *  - Subtle shake for wrong (using prefers-reduced-motion check)
 *  - Better hover/focus affordances
 */
export function OptionButton({
  option,
  index,
  isSelected,
  isCorrect,
  isRevealed,
  onClick,
  disabled,
}) {
  const shouldReduceMotion = useReducedMotion();
  const isCorrectSelected = isSelected && isCorrect;
  const isWrongSelected = isSelected && !isCorrect;
  const isMissedCorrect = !isSelected && isCorrect && isRevealed;

  const letter = String.fromCharCode(65 + index); // A, B, C, D...

  let stateClass =
    'border-border bg-surface text-primary hover:border-tertiary/40 hover:bg-tertiary/[0.03] cursor-pointer';

  if (isRevealed) {
    if (isCorrectSelected || isMissedCorrect) {
      stateClass =
        'border-tertiary bg-tertiary/[0.06] text-primary cursor-default ring-1 ring-tertiary/30';
    } else if (isWrongSelected) {
      stateClass =
        'border-danger/40 bg-danger/[0.04] text-primary cursor-default';
    } else {
      stateClass =
        'border-border bg-bg-secondary/40 text-secondary/70 opacity-70 cursor-default';
    }
  }

  const revealVariants = shouldReduceMotion
    ? {}
    : {
        initial: { scale: 1 },
        reveal: {
          scale: [1, 1.015, 1],
          transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
        },
      };

  const shakeVariants = shouldReduceMotion
    ? {}
    : {
        shake: {
          x: [0, -6, 6, -4, 4, 0],
          transition: { duration: 0.4 },
        },
      };

  let animation = 'initial';
  if (isRevealed && (isCorrectSelected || isMissedCorrect)) animation = 'reveal';
  if (isRevealed && isWrongSelected) animation = 'shake';

  return (
    <motion.button
      variants={{ ...revealVariants, ...shakeVariants }}
      initial="initial"
      animate={animation}
      onClick={() => !disabled && !isRevealed && onClick()}
      disabled={disabled || isRevealed}
      className={cn(
        'group w-full p-4 md:p-5 rounded-2xl border-2 text-left transition-all duration-200 relative flex items-center gap-3.5',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
        stateClass
      )}
    >
      {/* Letter chip — A, B, C, D */}
      <span
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-xl font-display font-bold text-sm transition-all duration-200',
          isRevealed && (isCorrectSelected || isMissedCorrect) && 'bg-tertiary text-white',
          isRevealed && isWrongSelected && 'bg-danger text-white',
          !isRevealed && isSelected && 'bg-tertiary text-white',
          !isRevealed && !isSelected && 'bg-bg-secondary text-secondary group-hover:bg-tertiary/10 group-hover:text-tertiary'
        )}
      >
        {letter}
      </span>

      {/* Option text */}
      <span className="flex-1 font-medium leading-relaxed">{option}</span>

      {/* Right indicator — correct check or wrong X */}
      {isRevealed && (isCorrectSelected || isMissedCorrect) && (
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { type: 'spring', stiffness: 400, damping: 18 }
          }
          className="flex size-7 shrink-0 items-center justify-center rounded-full bg-tertiary text-white shadow-warm-sm"
        >
          <Check className="size-4" strokeWidth={3} />
        </motion.span>
      )}

      {isRevealed && isWrongSelected && (
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { type: 'spring', stiffness: 400, damping: 18 }
          }
          className="flex size-7 shrink-0 items-center justify-center rounded-full bg-danger text-white shadow-warm-sm"
        >
          <X className="size-4" strokeWidth={3} />
        </motion.span>
      )}
    </motion.button>
  );
}