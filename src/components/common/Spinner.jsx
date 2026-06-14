import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Spinner (Phase 2.7)
 *
 * The standard indeterminate spinner for in-button / inline loading.
 * Use this for action feedback (button submission, mutation pending).
 *
 * Do NOT use Spinner for:
 *  - Page-level loading → use <Skeleton> or <PageLoader>
 *  - Multi-step pipeline → use <StepProgress>
 *
 * Sizes: xs (12px) | sm (16px) | md (20px, default) | lg (28px) | xl (40px)
 */
const SIZE_CLASS = {
  xs: 'size-3',
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-7',
  xl: 'size-10',
};

const TEXT_SIZE = {
  xs: 'text-xs',
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg',
};

function Spinner({ size = 'md', label, tone = 'tertiary', className }) {
  return (
    <span
      role="status"
      aria-live="polite"
      className={cn('inline-flex items-center gap-2', className)}
    >
      <Loader2
        aria-hidden="true"
        className={cn('animate-spin', SIZE_CLASS[size], `text-${tone}`)}
      />
      {label && (
        <span className={cn('font-label text-secondary', TEXT_SIZE[size])}>
          {label}
        </span>
      )}
      {!label && <span className="sr-only">Memuat…</span>}
    </span>
  );
}

export default Spinner;
