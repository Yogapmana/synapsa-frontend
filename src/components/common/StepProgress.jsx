import { CheckCircle2, Loader2, Circle } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

/**
 * StepProgress (Phase 2.7)
 *
 * Multi-step progress indicator for long-running pipelines (e.g.
 * AgentLoadingScreen: 5 agents working in sequence). Each step has
 * three states: pending | active | done.
 *
 * Props:
 *  - steps: [{ key, label, description? }]
 *  - currentStep: index of the currently-running step
 *  - failedStep: optional index of a failed step (renders warning)
 *
 * Use this for any "I'm doing multiple things" UX where the user
 * benefits from knowing what's happening.
 */
function StepProgress({ steps = [], currentStep = 0, failedStep = null, className }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <ol
      role="list"
      aria-label="Pipeline progress"
      className={cn('space-y-2', className)}
    >
      {steps.map((step, i) => {
        const isDone = i < currentStep && i !== failedStep;
        const isCurrent = i === currentStep && i !== failedStep;
        const isFailed = i === failedStep;
        const isFuture = i > currentStep && i !== failedStep;

        return (
          <motion.li
            key={step.key}
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.3,
              delay: shouldReduceMotion ? 0 : i * 0.05,
              ease: [0.25, 1, 0.5, 1],
            }}
            className={cn(
              'flex items-start gap-3 rounded-xl px-4 py-3 transition-colors',
              isCurrent && 'bg-tertiary/10 border-l-4 border-tertiary',
              isDone && 'bg-success/5',
              isFailed && 'bg-danger/10 border-l-4 border-danger',
              isFuture && 'opacity-40'
            )}
          >
            <div
              className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                isDone && 'bg-success text-white',
                isCurrent && 'bg-tertiary text-white',
                isFailed && 'bg-danger text-white',
                isFuture && 'bg-secondary/20 text-secondary'
              )}
            >
              {isDone ? (
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              ) : isCurrent ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : isFailed ? (
                <span className="text-xs font-bold" aria-label="Gagal">!</span>
              ) : (
                <span className="text-xs font-semibold">{i + 1}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div
                className={cn(
                  'text-sm font-label font-medium',
                  isDone && 'text-success line-through decoration-success/30',
                  isCurrent && 'text-primary',
                  isFailed && 'text-danger',
                  isFuture && 'text-secondary'
                )}
              >
                {step.label}
              </div>
              {step.description && isCurrent && (
                <div className="text-xs text-secondary mt-0.5">
                  {step.description}
                </div>
              )}
            </div>
            {isCurrent && (
              <span className="sr-only">Sedang berjalan</span>
            )}
            {isFailed && (
              <span className="sr-only">Gagal</span>
            )}
          </motion.li>
        );
      })}
    </ol>
  );
}

export default StepProgress;
