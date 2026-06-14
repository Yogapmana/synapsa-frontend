import { cn } from '@/lib/utils'
import { User, Bot, Brain, Sparkles, Leaf, Cpu } from 'lucide-react'

/**
 * Avatar (Phase 2.6)
 *
 * Unified avatar primitive for user, AI tutor, and individual agents
 * (Planner, Researcher, Composer, Tutor, Feedback Engine). Replaces
 * 4+ ad-hoc icon containers in Login (`Leaf`), Chat (`Bot`), Loading
 * (`Brain`), Onboarding (`Sparkles`), Sidebar (`user-initial`).
 *
 * Variants (visual style):
 *  - soft   → tinted bg + icon (default for AI/agent)
 *  - solid  → brand color bg, white icon
 *  - ring   → tinted bg + ring + icon (premium feel, for hero states)
 *  - initial → user fallback with first letter of name
 *
 * Sizes: xs | sm | md | lg | xl
 *
 * The `tone` prop picks the color regardless of variant (tertiary by default).
 * Pass `label` to give the avatar a meaningful aria-label (when Icon is provided
 * as a non-decorative role). Default behavior is aria-hidden since avatars are
 * usually accompanied by a name in the same row.
 */

const ICON_MAP = {
  user: User,
  ai: Bot,
  planner: Brain,
  researcher: Sparkles,
  composer: Cpu,
  tutor: Bot,
  feedback: Sparkles,
  leaf: Leaf,
};

const SIZE_CLASS = {
  xs: 'size-6 text-[10px]',
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-12 text-base',
  xl: 'size-16 text-lg',
};

const ICON_SIZE = {
  xs: 'size-3',
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-6',
  xl: 'size-8',
};

const TONE_BG = {
  tertiary: 'bg-tertiary/10 text-tertiary',
  success: 'bg-success-light text-success-fg',
  warning: 'bg-warning-light text-warning-fg',
  info: 'bg-info-light text-info-fg',
  danger: 'bg-danger-light text-danger-fg',
  neutral: 'bg-secondary/10 text-secondary',
};

const TONE_SOLID = {
  tertiary: 'bg-tertiary text-white',
  success: 'bg-success text-white',
  warning: 'bg-warning text-white',
  info: 'bg-info text-white',
  danger: 'bg-danger text-white',
  neutral: 'bg-primary text-surface',
};

const TONE_RING = {
  tertiary: 'bg-tertiary/10 text-tertiary ring-2 ring-tertiary/15',
  success: 'bg-success-light text-success-fg ring-2 ring-success/20',
  warning: 'bg-warning-light text-warning-fg ring-2 ring-warning/20',
  info: 'bg-info-light text-info-fg ring-2 ring-info/20',
  danger: 'bg-danger-light text-danger-fg ring-2 ring-danger/20',
  neutral: 'bg-secondary/10 text-secondary ring-2 ring-secondary/15',
};

const VARIANT_BG = {
  soft: TONE_BG,
  solid: TONE_SOLID,
  ring: TONE_RING,
};

function Avatar({
  variant = 'soft',
  size = 'md',
  tone = 'tertiary',
  role = 'ai',        // agent/role identifier (used to pick icon)
  icon: IconOverride, // explicit icon component override
  name,              // for initial-variant avatars
  label,             // accessible label (otherwise avatar is decorative)
  className,
}) {
  const Icon = IconOverride || ICON_MAP[role] || Bot;
  const isInitial = !Icon && name;

  return (
    <div
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={!label || undefined}
      className={cn(
        'flex items-center justify-center rounded-full font-display font-semibold leading-none shrink-0 select-none',
        SIZE_CLASS[size],
        isInitial ? VARIANT_BG[variant][tone] : VARIANT_BG[variant][tone],
        className
      )}
    >
      {isInitial ? (
        <span className="font-display font-semibold">
          {name.charAt(0).toUpperCase()}
        </span>
      ) : (
        <Icon
          className={cn(ICON_SIZE[size], 'shrink-0')}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

export default Avatar;
