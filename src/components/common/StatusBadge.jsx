import { cn } from '@/lib/utils'

/**
 * StatusBadge (Phase 2.4)
 *
 * Typed replacement for `<span className="pill pill-{variant}">`.
 * Wraps the existing `.pill` / `.pill-{variant}` / `.pill-{size}` classes
 * so we keep one source of truth for badge styling in globals.css.
 *
 * Variants: success | warning | info | danger | neutral | accent
 * Sizes:    sm (micro) | md (default) | lg (standalone)
 */
const VARIANT_CLASS = {
  success: 'pill-success',
  warning: 'pill-warning',
  info: 'pill-info',
  danger: 'pill-danger',
  neutral: 'pill-neutral',
  accent: 'pill-accent',
};

const SIZE_CLASS = {
  sm: 'pill-sm',
  md: '',
  lg: 'pill-lg',
};

function StatusBadge({
  variant = 'neutral',
  size = 'md',
  icon: Icon,
  children,
  className,
  ...props
}) {
  return (
    <span
      className={cn(
        'pill font-label',
        VARIANT_CLASS[variant],
        SIZE_CLASS[size],
        className
      )}
      {...props}
    >
      {Icon && (
        <Icon
          className={cn(
            size === 'sm' ? 'size-2.5' : size === 'lg' ? 'size-3.5' : 'size-3',
            'shrink-0'
          )}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

export default StatusBadge;
