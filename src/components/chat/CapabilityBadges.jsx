import { motion } from 'framer-motion';
import { Globe, FileText, Languages, Zap } from 'lucide-react';

/**
 * CapabilityBadges — small chip row showing what the bot can do.
 *
 * Phase 5.10 — simplified.
 *  - Compact, clean chips with colored icon circle.
 *  - Stagger animation for entrance.
 */

const capabilities = [
  { icon: Globe, label: 'Web Search', tone: 'info', title: 'Pencarian web real-time' },
  { icon: FileText, label: 'Baca Dokumen', tone: 'success', title: 'Upload PDF/DOCX/TXT' },
  { icon: Languages, label: 'Multi-bahasa', tone: 'warning', title: 'Indonesia & English' },
  { icon: Zap, label: 'Respons Cepat', tone: 'tertiary', title: 'Streaming real-time' },
];

const toneClasses = {
  info: 'bg-info-light text-info',
  success: 'bg-success-light text-success-fg',
  warning: 'bg-warning-light text-warning-fg',
  tertiary: 'bg-tertiary/10 text-tertiary',
};

export default function CapabilityBadges() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.35, ease: 'easeOut' }}
      className="flex flex-wrap items-center justify-center gap-2"
      role="list"
      aria-label="Kemampuan Synapsa Chatbot"
    >
      {capabilities.map((cap, i) => {
        const Icon = cap.icon;
        return (
          <motion.div
            key={cap.label}
            role="listitem"
            title={cap.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + i * 0.04, duration: 0.25, ease: 'easeOut' }}
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
        );
      })}
    </motion.div>
  );
}