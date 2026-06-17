import { motion } from 'framer-motion';
import { Globe, FileText, Languages, Zap } from 'lucide-react';

/**
 * CapabilityBadges — small chip row showing what the bot can do.
 *
 * Design rationale:
 *   - These are NOT a "feature list" — they're a quick at-a-glance
 *     "what is this thing capable of" reassurance for first-time
 *     users, placed between the greeting and the action cards.
 *   - Each capability uses an existing design-system color tone
 *     (info / success / warning / tertiary) so the visual variety
 *     feels intentional, not random. The colored circle is the
 *     only color element; the chip itself stays neutral so the
 *     page doesn't look like a rainbow.
 *   - Stagger animation (0.06s between each) creates a "popping
 *     in" effect that feels alive without being noisy.
 */

const capabilities = [
  { icon: Globe, label: 'Web Search', tone: 'info', title: 'Pencarian web real-time' },
  { icon: FileText, label: 'Baca Dokumen', tone: 'success', title: 'Upload PDF/DOCX/TXT' },
  { icon: Languages, label: 'Multi-bahasa', tone: 'warning', title: 'Indonesia & English' },
  { icon: Zap, label: 'Respons Cepat', tone: 'tertiary', title: 'Streaming real-time' },
];

// Map design-system tones to the same light/dark pairs used elsewhere
// in the app (e.g. StatCards, RAGASWidget). Keeps the visual language
// consistent across the dashboard.
const toneClasses = {
  info: 'bg-info-light text-info',
  success: 'bg-success-light text-success',
  warning: 'bg-warning-light text-warning',
  tertiary: 'bg-tertiary/10 text-tertiary',
};

export default function CapabilityBadges() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4, ease: 'easeOut' }}
      className="flex flex-wrap items-center justify-center gap-2"
      role="list"
      aria-label="Kemampuan PLA Chatbot"
    >
      {capabilities.map((cap, i) => (
        <motion.div
          key={cap.label}
          role="listitem"
          title={cap.title}
          initial={{ opacity: 0, scale: 0.9, y: 4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.3 + i * 0.06, duration: 0.3, ease: 'easeOut' }}
          className="inline-flex items-center gap-1.5 pl-1.5 pr-3 py-1 rounded-full bg-surface border border-border-subtle shadow-warm-xs"
        >
          <span
            aria-hidden="true"
            className={`w-5 h-5 rounded-full flex items-center justify-center ${toneClasses[cap.tone]}`}
          >
            <cap.icon size={11} strokeWidth={2.5} />
          </span>
          <span className="text-xs text-secondary font-label font-medium">
            {cap.label}
          </span>
        </motion.div>
      ))}
    </motion.div>
  );
}
