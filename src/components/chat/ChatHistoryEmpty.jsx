import { motion } from 'framer-motion';
import { MessageSquare, BookOpen, FileText, Lightbulb } from 'lucide-react';

/**
 * ChatHistoryEmpty — empty state for the chat history sidebar.
 *
 * Shown when the user has no saved sessions yet. Instead of just
 * "no conversations" (which leaves the user wondering what to do),
 * we offer:
 *   1. A clear explanation of the empty state ("Belum ada percakapan")
 *   2. A nudge to either start a new chat or pick a template
 *   3. Three quick-start templates that mirror the QuickActionCards
 *      on the main panel (same prompts, same colors via tone class)
 *
 * Clicking a template routes through `onTemplateClick(prompt)`,
 * which the parent (`Chat.jsx`) wires to `handleSendMessage`. This
 * means clicking a template in the sidebar:
 *   1. Creates a new session (since none exists)
 *   2. Sends the prompt as the first message
 *   3. The user lands in the new chat with the prompt already sent
 */

const templates = [
  { icon: BookOpen, label: 'Jelaskan topik', prompt: 'Jelaskan [topik] secara detail' },
  { icon: FileText, label: 'Buat ringkasan', prompt: 'Buatkan ringkasan dari teks berikut: ' },
  { icon: Lightbulb, label: 'Brainstorm', prompt: 'Bantu saya brainstorming ide untuk ' },
];

export default function ChatHistoryEmpty({ onTemplateClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex flex-col items-center text-center py-6 px-3"
    >
      {/* Icon — small tertiary-tinted square, mirrors the look
          of the main panel's hero icon (scaled down for the
          sidebar's narrow column). */}
      <div
        className="w-10 h-10 rounded-xl bg-tertiary/10 flex items-center justify-center mb-3"
        aria-hidden="true"
      >
        <MessageSquare className="size-5 text-tertiary" strokeWidth={2.2} />
      </div>

      <h3 className="font-display font-semibold text-sm text-primary mb-1">
        Belum ada percakapan
      </h3>
      <p className="text-[11px] text-secondary mb-4 leading-relaxed max-w-[180px]">
        Mulai chat baru atau pilih template di bawah untuk memulai lebih cepat
      </p>

      {/* Template list — same as the QuickActionCards prompts but
          in a vertical list (better for a narrow column). Each
          button has an icon + label and a left-aligned tertiary
          hover state. */}
      <div className="w-full space-y-1">
        {templates.map((t) => (
          <button
            key={t.label}
            type="button"
            onClick={() => onTemplateClick?.(t.prompt)}
            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-secondary hover:bg-tertiary/5 hover:text-tertiary text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary"
            title={t.prompt}
          >
            <t.icon size={12} className="shrink-0" aria-hidden="true" />
            <span className="truncate font-label font-medium">{t.label}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
