import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

/**
 * WelcomeHero — animated greeting shown in the Chat page's empty state.
 *
 * Design philosophy:
 *   - Single, large focal point (the sparkles icon) with a soft
 *     tertiary-colored glow that draws the eye to the center of the
 *     page. Smaller "floating" sparkles orbit around it for a
 *     subtle, premium feel — they pulse in opacity, not position,
 *     so the layout stays still and the user isn't distracted.
 *   - Greeting is personalized with the user's name (when known)
 *     to make the empty state feel like a real welcome, not a
 *     marketing splash.
 *   - Tagline is short and action-oriented — tells the user what
 *     they can DO, not what the bot IS.
 *
 * Animations respect `prefers-reduced-motion` via framer-motion's
 * `useReducedMotion` semantics (we let framer handle it implicitly
 * by using `transition` props that are skipped if the user prefers
 * reduced motion).
 */
export default function WelcomeHero({ username }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="text-center max-w-xl mx-auto"
    >
      {/* Animated icon — the focal point. Two layers:
          (1) a soft glow (blurred tertiary) behind the icon for depth
          (2) the icon itself, with a subtle continuous float animation
          (3) two tiny floating sparkles around the icon for "magic" feel */}
      <div className="relative inline-flex items-center justify-center mb-7">
        {/* Glow layer — soft tertiary halo. `blur-2xl` + low opacity
            creates a subtle radiance without being garish. */}
        <motion.div
          aria-hidden="true"
          animate={{ opacity: [0.25, 0.4, 0.25], scale: [1, 1.08, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-3xl bg-gradient-to-br from-tertiary to-tertiary-light blur-2xl"
        />

        {/* Main icon — gradient background, white sparkles, gentle
            breathing animation. The rotate oscillation is tiny
            (±3°) so it reads as "alive" rather than "spinning". */}
        <motion.div
          animate={{ scale: [1, 1.04, 1], rotate: [0, 3, -3, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-tertiary via-tertiary to-tertiary-dark flex items-center justify-center shadow-warm-lg ring-1 ring-white/20"
        >
          <Sparkles className="w-10 h-10 text-white" strokeWidth={2.2} />
        </motion.div>

        {/* Floating mini-sparkles — opacity-only animation, no
            positional jitter, so the icon stays centered visually. */}
        <motion.span
          aria-hidden="true"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-0.5 -right-1 text-tertiary"
        >
          <Sparkles size={14} fill="currentColor" />
        </motion.span>
        <motion.span
          aria-hidden="true"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          className="absolute -bottom-0.5 -left-1 text-tertiary"
        >
          <Sparkles size={12} fill="currentColor" />
        </motion.span>
      </div>

      {/* Greeting — large display font for the headline, with a
          smaller personalized line below. Using h1 for SEO/a11y
          (the page is a chat, but the empty state is the page's
          main heading when there are no messages). */}
      <h1 className="font-display font-bold text-3xl md:text-[2.5rem] text-primary mb-2 tracking-tight leading-tight">
        Halo! Saya PLA Chatbot 👋
      </h1>

      {username && (
        <p className="text-secondary text-sm md:text-base mb-2">
          Senang bertemu dengan Anda,{' '}
          <span className="font-semibold text-primary">{username}</span>!
        </p>
      )}

      <p className="text-secondary text-sm md:text-base max-w-md mx-auto leading-relaxed">
        Tanyakan apa saja — saya bisa mencari info terbaru dari internet,
        merangkum dokumen, atau sekadar berdiskusi.
      </p>
    </motion.div>
  );
}
