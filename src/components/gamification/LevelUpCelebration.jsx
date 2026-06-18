import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Sparkles, Trophy, X, ArrowRight } from 'lucide-react';

/**
 * LevelUpCelebration — modal shown when the user crosses a
 * level threshold. Gated by the ``pendingLevelUp`` field in
 * the auth store, which the login + quiz-submit flows set when
 * XP is awarded and ``leveled_up`` is true on at least one
 * event.
 *
 * This is the LEVEL-up counterpart to ``StreakCelebration``
 * (which celebrates a login-streak milestone). The two share
 * the same confetti + spring animation pattern but the copy,
 * icon, and CTA differ.
 *
 * Why a separate component:
 *   - StreakCelebration is per-login; LevelUpCelebration is
 *     rarer (every 100+ XP earned). Different cadence → different
 *     visual weight.
 *   - StreakCelebration uses a flame icon; LevelUp uses a star.
 *     Different metaphors.
 *
 * Visual modes:
 *   - **Standard** (any level-up): star icon + level number +
 *     "Level X! Nama" + recent XP events.
 *   - **No new events to show** (edge case): the level-up still
 *     renders with the level number and the new tier name.
 */
const Confetti = () => {
  // Same confetti pattern as StreakCelebration — gold/sky/violet
  // particles to match the XP/level theme. We avoid framer-motion
  // for these particles (CSS handles it cheaply) and reserve
  // framer for the more meaningful animated elements (icon, CTA).
  const particles = Array.from({ length: 30 });
  const colors = [
    'bg-warning',
    'bg-tertiary',
    'bg-info',
    'bg-success',
  ];
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none"
    >
      {particles.map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.5;
        const duration = 1.8 + Math.random() * 0.8;
        const rotate = Math.random() * 360;
        const color = colors[i % colors.length];
        return (
          <span
            key={i}
            className={`absolute top-0 w-1.5 h-2 rounded-sm ${color}`}
            style={{
              left: `${left}%`,
              animation: `xp-confetti-fall ${duration}s ${delay}s ease-in forwards`,
              transform: `rotate(${rotate}deg)`,
            }}
          />
        );
      })}
      <style>{`
        @keyframes xp-confetti-fall {
          0%   { transform: translateY(-12px) rotate(0deg);   opacity: 1; }
          100% { transform: translateY(380px) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default function LevelUpCelebration({ levelUp, onClose }) {
  // ESC closes the modal — same a11y pattern as StreakCelebration.
  useEffect(() => {
    if (!levelUp) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [levelUp, onClose]);

  return (
    <AnimatePresence>
      {levelUp && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-neutral/60 backdrop-blur-sm"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="level-up-title"
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-surface-1 rounded-2xl border border-border-subtle shadow-warm-xl overflow-hidden p-7"
          >
            <Confetti />

            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup perayaan level up"
              className="absolute top-3.5 right-3.5 z-10 p-2 rounded-lg text-secondary hover:text-primary hover:bg-secondary/10 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="relative flex flex-col items-center text-center">
              {/* ── Hero icon: big star in a warning-tinted gradient
                  square. The level number overlays below. */}
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
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-warning to-tertiary blur-2xl opacity-30" />
                <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-warning via-warning to-tertiary flex items-center justify-center shadow-warm-lg ring-1 ring-white/20">
                  <Star
                    className="w-12 h-12 text-white"
                    fill="currentColor"
                    strokeWidth={1.5}
                  />
                </div>
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.35, type: 'spring', stiffness: 300 }}
                  className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-tertiary text-white flex items-center justify-center shadow-warm-md ring-2 ring-surface-1 text-sm font-display font-bold"
                  aria-hidden="true"
                >
                  {levelUp.new_level}
                </motion.div>
              </motion.div>

              <p className="text-[11px] font-label uppercase tracking-widest text-warning font-bold mb-1.5">
                Level Up!
              </p>
              <h2
                id="level-up-title"
                className="font-display font-bold text-2xl text-primary leading-tight mb-1"
              >
                Sekarang {levelUp.level_name}!
              </h2>
              <p className="text-sm text-secondary max-w-sm leading-relaxed mb-4">
                {levelUp.xp_awarded_total
                  ? `Kamu dapat +${levelUp.xp_awarded_total} XP baru`
                  : 'Selamat atas pencapaian barumu!'}
              </p>

              {/* Per-event breakdown — small chips showing each
                  milestone the user just crossed. Empty if the
                  backend didn't send a per-event list (defensive). */}
              {levelUp.events && levelUp.events.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-1.5 mb-5">
                  {levelUp.events.map((ev, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-warning/10 text-warning text-[11px] font-label font-semibold"
                    >
                      <Sparkles size={10} />
                      Mastery {Math.round(ev.milestone * 100)}% · +{ev.xp} XP
                    </span>
                  ))}
                </div>
              )}

              {/* Primary CTA — "Lanjutkan Belajar" takes them back
                  to where they were. We don't have a router ref
                  here so we use a button that simply dismisses;
                  the dashboard is the most likely landing page. */}
              <motion.button
                type="button"
                onClick={onClose}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-tertiary text-white text-sm font-label font-semibold hover:bg-tertiary-dark transition-colors shadow-warm-sm"
              >
                Lanjutkan Belajar
                <ArrowRight size={15} />
              </motion.button>

              <button
                type="button"
                onClick={onClose}
                className="mt-2 text-xs text-secondary/60 hover:text-secondary font-label transition-colors"
              >
                Tutup
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
