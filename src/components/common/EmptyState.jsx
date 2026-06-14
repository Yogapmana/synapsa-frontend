import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * EmptyState — single source for empty/no-data illustrations (Phase 1.7).
 *
 * Variants:
 *  - default  → page-level (large, centered, with optional CTA)
 *  - card     → inline inside a card (medium)
 *  - inline   → small, next to a list item
 *
 * Replaces 4+ ad-hoc implementations (Module, Curriculum, AgentLog, Metrics).
 */
function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondaryAction,
  variant = 'default',
  className,
}) {
  const sizing =
    variant === 'inline'
      ? { wrap: 'py-6 gap-3', icon: 'size-12', title: 'text-base', desc: 'text-sm' }
      : variant === 'card'
      ? { wrap: 'py-8 gap-4', icon: 'size-14', title: 'text-lg', desc: 'text-sm' }
      : { wrap: 'py-12 gap-4', icon: 'size-20', title: 'text-xl', desc: 'text-sm max-w-sm' };

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex flex-col items-center text-center',
        sizing.wrap,
        className
      )}
    >
      {Icon && (
        <div
          className={cn(
            'flex items-center justify-center rounded-2xl bg-tertiary/10 text-tertiary ring-2 ring-tertiary/15',
            sizing.icon
          )}
        >
          <Icon className="size-1/2" aria-hidden="true" />
        </div>
      )}
      {title && (
        <h3 className={cn('font-display font-semibold text-primary', sizing.title)}>
          {title}
        </h3>
      )}
      {description && (
        <p className={cn('text-secondary leading-relaxed', sizing.desc)}>
          {description}
        </p>
      )}
      {(actionLabel || secondaryLabel) && (
        <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
          {actionLabel && onAction && (
            <Button variant="tertiary" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
          {secondaryLabel && onSecondaryAction && (
            <Button variant="outline" onClick={onSecondaryAction}>
              {secondaryLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export default EmptyState
