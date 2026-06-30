import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Flame, Sparkles, Trophy, X, ArrowRight, MoveRight } from 'lucide-react';

/**
 * StreakCelebration — modal shown after the user's first login of
 * a calendar day (gated by ``authStore.pendingStreakCelebration``).
 *
 * Two visual modes:
 *  1. **Milestone mode** — when the new streak hits a threshold
 *     (3, 7, 14, 30, 50, 100, 365). Big celebratory header,
 *     the milestone icon front and center, and a "Lanjutkan!"
 *     button that takes them to the dashboard.
 *  2. **Standard mode** — for normal day-over-day logins. Smaller,
 *     calmer layout: just a flame icon, the new streak count, and
 *     a "Lanjut Belajar" button. Encouraging without being loud.
 *
 * Why two modes: a milestone (e.g. day 7) is a reward and should
 * feel like one. A regular day-2 login is a habit-reinforcer and
 * shouldn't compete for attention with the milestone modal.
 *
 * Confetti is rendered as a lightweight CSS-only particle effect
 * (no extra deps). It runs once on mount and stops on unmount.
 */

const Confetti = () => {
  // 24 particles with randomized position, color, and rotation.
  // Each is a small div with a CSS animation that fades out and
  // falls. We avoid framer-motion here because the particles are
  // pure decoration and CSS handles this kind of thing cheaply.
  const particles = Array.from({ length: 24 });
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none"
    >
      {particles.map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.4;
        const duration = 1.6 + Math.random() * 0.8;
        const rotate = Math.random() * 360;
        const colors = [
          'bg-tertiary',
          'bg-warning',
          'bg-success',
          'bg-info',
        ];
        const color = colors[i % colors.length];
        return (
          <span
            key={i}
            className={`absolute top-0 w-1.5 h-2 rounded-sm ${color}`}
            style={{
              left: `${left}%`,
              animation: `streak-confetti-fall ${duration}s ${delay}s ease-in forwards`,
              transform: `rotate(${rotate}deg)`,
            }}
          />
        );
      })}
      <style>{`
        @keyframes streak-confetti-fall {
          0%   { transform: translateY(-12px) rotate(0deg);   opacity: 1; }
          100% { transform: translateY(360px) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default function StreakCelebration({ streak, onClose }) {
  const { t } = useTranslation();
  // Defensive: if we get a null streak (e.g. component renders
  // before authStore is ready), bail out cleanly via the parent
  // AnimatePresence.
  const milestone = streak?.milestone;
  const isMilestone = !!milestone;

  // ESC closes the modal — standard a11y expectation.
  useEffect(() => {
    if (!streak) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [streak, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-neutral/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="streak-celebration-title"
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.92 }}
        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-md bg-surface rounded-[2rem] border border-border-subtle shadow-warm-xl overflow-hidden ${
          isMilestone ? 'p-7' : 'p-6'
        }`}
      >
        {/* Confetti only on milestone days — saves cycles on the
            regular day-2/day-3 logins that happen most often. */}
        {isMilestone && <Confetti />}

        {/* Close button — top right. Visible on both modes. */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup perayaan streak"
          className="absolute top-3.5 right-3.5 z-10 p-2 rounded-lg text-secondary hover:text-primary hover:bg-secondary/10 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="relative flex flex-col items-center text-center">
          {/* ── Hero icon ── */}
          {isMilestone ? (
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: 'spring',
                stiffness: 280,
                damping: 18,
                delay: 0.1,
              }}
              className="relative mb-5"
            >
              {/* Glow behind the milestone icon — same pattern as
                  WelcomeHero. Big radial gradient for a sense of
                  "this is special". */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-tertiary to-tertiary-light blur-2xl opacity-30" />
              <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-tertiary via-tertiary to-tertiary-dark flex items-center justify-center shadow-warm-lg ring-1 ring-white/20">
                <span className="text-5xl leading-none" aria-hidden="true">
                  {milestone.icon}
                </span>
              </div>
              {/* Tiny trophy on the corner — extra reward cue */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.35, type: 'spring', stiffness: 300 }}
                className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-warning text-white flex items-center justify-center shadow-warm-md ring-2 ring-surface-1"
                aria-hidden="true"
              >
                <Trophy size={16} strokeWidth={2.4} />
              </motion.div>
            </motion.div>
          ) : (
            // Standard mode — smaller, calmer flame.
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 280, damping: 18 }}
              className="relative mb-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-tertiary/15 to-tertiary/5 flex items-center justify-center"
            >
              <Flame
                className="w-8 h-8 text-tertiary"
                fill="currentColor"
                strokeWidth={1.5}
              />
              {/* Pulse ring — subtle heartbeat to signal "alive" */}
              <motion.span
                aria-hidden="true"
                animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
                transition={{ duration: 1.8, repeat: Infinity }}
                className="absolute inset-0 rounded-2xl border-2 border-tertiary"
              />
            </motion.div>
          )}

          {/* ── Title & copy ── */}
          {isMilestone ? (
            <>
              <p className="text-[11px] font-label uppercase tracking-widest text-tertiary font-bold mb-1.5">
                Pencapaian Terbuka
              </p>
              <h2
                id="streak-celebration-title"
                className="font-display font-bold text-2xl text-primary leading-tight mb-1"
              >
                {milestone.name}!
              </h2>
              <p className="text-sm text-secondary max-w-sm leading-relaxed mb-1">
                {milestone.description}
              </p>
              <div className="flex items-center gap-2 mt-3 mb-5">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-tertiary/10 text-tertiary text-xs font-label font-semibold">
                  <Flame size={11} fill="currentColor" />
                  Streak {streak.new_streak} hari
                </span>
                {streak.longest_streak > streak.new_streak && (
                  <span className="text-[11px] text-secondary/70 font-label">
                    Rekor: {streak.longest_streak} hari
                  </span>
                )}
              </div>
            </>
          ) : (
            <>
              <h2
                id="streak-celebration-title"
                className="font-display font-bold text-xl text-primary leading-tight mb-1"
              >
                Streak {streak.new_streak} hari!
              </h2>
              <p className="text-sm text-secondary max-w-xs leading-relaxed mb-5">
                Login berturut-turut. Pertahankan sampai besok untuk
                menambah streak!
              </p>
            </>
          )}

          {/* ── Primary CTA ── */}
          <motion.button
            type="button"
            onClick={onClose}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-tertiary text-white text-sm font-label font-semibold hover:bg-tertiary-dark transition-colors shadow-warm-sm"
          >
            {isMilestone ? (
              <>
                <Sparkles size={15} />
                {t('gamification.continue', 'Lanjutkan!')}
              </>
            ) : (
              <>
                {t('gamification.continue_learning', 'Lanjut Belajar')}
                <ArrowRight size={15} />
              </>
            )}
          </motion.button>

          {/* Secondary dismiss — quiet text button. On milestone
              days, this is redundant with the primary CTA, but
              on standard days it's a fast way to skip the modal
              for users who don't want the interruption. */}
          <button
            type="button"
            onClick={onClose}
            className="mt-2 text-xs text-secondary/60 hover:text-secondary font-label transition-colors"
          >
            {t('common.close', 'Tutup')}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Re-export AnimatePresence so the parent can wrap with it.
export { AnimatePresence };
