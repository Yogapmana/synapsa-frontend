import { motion } from 'framer-motion';
import { MessageSquare, BookOpen, FileText, Lightbulb } from 'lucide-react';

/**
 * ChatHistoryEmpty — empty state for the chat history sidebar.
 *
 * Phase 5.11 — compact & aligned.
 *  - Compact: no long description, just icon + title + templates.
 *  - Templates are flush-aligned with the "Percakapan Baru" button
 *    above (pl-4 pr-0 padding on the parent matches the button
 *    container).
 *  - No animation on the templates list — keeps it feeling static
 *    and "sidebar-like" rather than a feature showcase.
 */

const templates = [
  { icon: BookOpen, label: 'Jelaskan topik', prompt: 'Jelaskan [topik] secara detail' },
  { icon: FileText, label: 'Buat ringkasan', prompt: 'Buatkan ringkasan dari teks berikut: ' },
  { icon: Lightbulb, label: 'Brainstorm', prompt: 'Bantu saya brainstorming ide untuk ' },
];

export default function ChatHistoryEmpty({ onTemplateClick }) {
  return (
    <div className="flex flex-col">
      {/* Header — icon + title (no description to keep compact) */}
      <div className="flex items-center gap-2.5 pb-3">
        <div
          className="size-8 rounded-lg bg-tertiary/10 flex items-center justify-center shrink-0"
          aria-hidden="true"
        >
          <MessageSquare className="size-4 text-tertiary" strokeWidth={2} />
        </div>
        <h3 className="font-display font-semibold text-sm text-primary leading-tight">
          Belum ada percakapan
        </h3>
      </div>

      {/* Template list — flush with the "Percakapan Baru" button.
          Each row is a full-width button (no extra padding inside). */}
      <div className="space-y-0.5 border-t border-border-subtle pt-2">
        <p className="text-[10px] font-label uppercase tracking-widest text-secondary/60 px-1 pb-1.5">
          Template cepat
        </p>
        {templates.map((t) => (
          <button
            key={t.label}
            type="button"
            onClick={() => onTemplateClick?.(t.prompt)}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-secondary hover:bg-tertiary/5 hover:text-tertiary text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary"
            title={t.prompt}
          >
            <t.icon size={13} className="shrink-0" aria-hidden="true" />
            <span className="truncate font-label font-medium">{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}