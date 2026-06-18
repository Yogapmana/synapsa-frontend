import { cn } from '@/lib/utils'

/**
 * Decorative oversized serif numeral — the "secret sauce" of the
 * PLA editorial aesthetic. Used as a background flourish in hero
 * sections, feature cards, and section dividers.
 *
 * Borrowed from print magazine layout — these oversized italic
 * numbers (8-12rem) at 4-8% opacity add a layer of "designed
 * detail" that separates a hand-crafted layout from a template.
 *
 * Usage:
 *   <DecoNumerals number="01" position="top-right" />
 *   <DecoNumerals number="02" position="bottom-left" tone="secondary" />
 */
export default function DecoNumerals({
  number,
  position = 'top-right',
  tone = 'primary',
  className,
  ariaHidden = true,
}) {
  const positions = {
    'top-right': 'top-[-2rem] right-[-1rem]',
    'top-left': 'top-[-2rem] left-[-1rem]',
    'bottom-right': 'bottom-[-3rem] right-[-1rem]',
    'bottom-left': 'bottom-[-3rem] left-[-1rem]',
    'center-right': 'top-1/2 -translate-y-1/2 right-[-2rem]',
    'center-left': 'top-1/2 -translate-y-1/2 left-[-2rem]',
  }

  return (
    <span
      aria-hidden={ariaHidden}
      className={cn(
        'deco-num select-none',
        tone === 'secondary' && 'deco-num-secondary',
        positions[position],
        className
      )}
    >
      {number}
    </span>
  )
}