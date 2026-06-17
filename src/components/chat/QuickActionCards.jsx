import { motion, useReducedMotion } from 'framer-motion';
import { BookOpen, FileText, Target, Lightbulb, ArrowUpRight } from 'lucide-react';

/**
 * QuickActionCards — 2×2 grid of action cards shown in the Chat
 * empty state. Replaces the older single-row `SuggestionChips` pill
 * layout, which only had 3 items and looked like a list of links
 * rather than affordances.
 *
 * Why a 2×2 grid:
 *   - More visual interest than a single row of pills
 *   - Each card has room for an icon + title + 1-line description,
 *     so users actually understand what the action does
 *   - 4 cards is enough to cover the main use-cases (explain,
 *     summarize, quiz, brainstorm) without overwhelming
 *
 * Interaction:
 *   - Hover: card lifts slightly (y: -2) AND the background gets a
 *     subtle color wash (icon's color, low opacity). The arrow
 *     nudges up-and-right as a directional cue.
 *   - Click: invokes `onActionClick(prompt)` which the parent
 *     (`Chat.jsx`) routes through `handleSendMessage`, creating a
 *     new session if needed and sending the prompt.
 *
 * Each card's `prompt` is intentionally a STARTER (with a
 * placeholder like `[topik]`) — the user can edit it after it's
 * sent, or just hit send as-is. We don't try to be clever about
 * filling in placeholders automatically.
 */

const actions = [
  {
    icon: BookOpen,
    title: 'Jelaskan Konsep',
    description: 'Penjelasan mendalam dengan contoh konkret',
    prompt: 'Jelaskan konsep [topik] secara detail dengan contoh konkret yang mudah dipahami',
    color: 'info',
  },
  {
    icon: FileText,
    title: 'Buat Ringkasan',
    description: 'Ringkas materi panjang jadi poin penting',
    prompt: 'Buatkan ringkasan dari teks atau topik berikut ini: ',
    color: 'success',
  },
  {
    icon: Target,
    title: 'Generate Kuis',
    description: 'Buat kuis interaktif untuk uji pemahaman',
    prompt: 'Buatkan kuis pilihan ganda 5 soal tentang [topik], sertakan kunci jawaban dan penjelasan',
    color: 'warning',
  },
  {
    icon: Lightbulb,
    title: 'Brainstorm Ide',
    description: 'Eksplorasi dan diskusi ide baru',
    prompt: 'Bantu saya brainstorming ide untuk [tujuan]. Berikan 5-7 ide dengan kelebihan dan tantangan masing-masing',
    color: 'tertiary',
  },
];

// Same tone map as CapabilityBadges — keeps the icon/hover wash
// colors consistent with the chips above.
const colorMap = {
  info: { bg: 'bg-info-light', text: 'text-info' },
  success: { bg: 'bg-success-light', text: 'text-success' },
  warning: { bg: 'bg-warning-light', text: 'text-warning' },
  tertiary: { bg: 'bg-tertiary/10', text: 'text-tertiary' },
};

export default function QuickActionCards({ onActionClick }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl mx-auto"
      role="group"
      aria-label="Aksi cepat"
    >
      {actions.map((action, i) => {
        const colors = colorMap[action.color];
        return (
          <motion.button
            key={action.title}
            type="button"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.45 + i * 0.06,
              duration: 0.4,
              ease: [0.16, 1, 0.3, 1],
            }}
            whileHover={shouldReduceMotion ? {} : { y: -2 }}
            whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
            onClick={() => onActionClick?.(action.prompt)}
            className="group relative text-left p-4 rounded-2xl bg-surface border border-border-subtle hover:border-tertiary/40 hover:shadow-warm-md transition-all duration-200 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            aria-label={`${action.title}: ${action.description}`}
          >
            {/* Color wash on hover — uses the action's tone so the
                card "lights up" with the action's color when you
                hover. Opacity transitions 0→30% (subtle, not loud). */}
            <div
              aria-hidden="true"
              className={`absolute inset-0 ${colors.bg} opacity-0 group-hover:opacity-30 transition-opacity duration-300 pointer-events-none`}
            />

            {/* Top edge highlight on hover — a 1px gradient line
                that appears at the top, drawing the eye in. */}
            <div
              aria-hidden="true"
              className={`absolute top-0 left-0 right-0 h-px ${colors.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
            />

            <div className="relative flex items-start gap-3">
              {/* Icon — small colored square with the action's icon.
                  Slight scale-up on hover for a subtle "ready" cue. */}
              <motion.div
                aria-hidden="true"
                whileHover={shouldReduceMotion ? {} : { scale: 1.08, rotate: -3 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className={`shrink-0 w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center`}
              >
                <action.icon size={20} className={colors.text} strokeWidth={2.2} />
              </motion.div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <h3 className="font-display font-semibold text-sm text-primary leading-snug">
                    {action.title}
                  </h3>
                  {/* Arrow — nudges up-right on hover, signals
                      "click to go" without screaming. */}
                  <ArrowUpRight
                    size={14}
                    className="text-secondary/30 group-hover:text-tertiary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200 shrink-0"
                    aria-hidden="true"
                  />
                </div>
                <p className="text-[11.5px] text-secondary leading-relaxed">
                  {action.description}
                </p>
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
