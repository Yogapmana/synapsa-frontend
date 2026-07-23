import { MessageSquare, BookOpen, FileText, Lightbulb } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { motion, useReducedMotion } from 'framer-motion'

/**
 * ChatHistoryEmpty — calm empty state for the chat history sidebar.
 */
const listStagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 26 },
  },
}

export default function ChatHistoryEmpty({ onTemplateClick }) {
  const { t } = useTranslation()
  const shouldReduceMotion = useReducedMotion()

  const templates = [
    {
      icon: BookOpen,
      label: t('chat.template_explain', 'Explain a topic'),
      prompt: t('chat.template_explain_prompt', 'Explain [topic] in detail'),
    },
    {
      icon: FileText,
      label: t('chat.template_summary', 'Make a summary'),
      prompt: t('chat.template_summary_prompt', 'Summarize the following text: '),
    },
    {
      icon: Lightbulb,
      label: t('chat.template_brainstorm', 'Brainstorm'),
      prompt: t('chat.template_brainstorm_prompt', 'Help me brainstorm ideas for '),
    },
  ]

  return (
    <motion.div
      className="flex flex-col"
      variants={shouldReduceMotion ? undefined : listStagger}
      initial={shouldReduceMotion ? false : 'hidden'}
      animate="show"
    >
      <motion.div
        variants={shouldReduceMotion ? undefined : fadeUp}
        className="flex items-center gap-2.5 px-0.5 pb-3"
      >
        <MessageSquare
          className="size-4 shrink-0 text-secondary/50"
          strokeWidth={1.75}
          aria-hidden="true"
        />
        <h3 className="text-sm font-medium leading-tight text-secondary">
          {t('chat.no_conversations', 'No conversations yet')}
        </h3>
      </motion.div>

      <motion.div variants={shouldReduceMotion ? undefined : fadeUp} className="space-y-0.5 pt-1">
        <p className="px-1 pb-1.5 text-[10px] font-label uppercase tracking-widest text-secondary/45">
          {t('chat.quick_templates', 'Quick templates')}
        </p>
        {templates.map((item) => (
          <motion.button
            key={item.label}
            type="button"
            variants={shouldReduceMotion ? undefined : fadeUp}
            onClick={() => onTemplateClick?.(item.prompt)}
            className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-xs text-secondary transition-colors duration-150 hover:bg-secondary/8 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary/30"
            title={item.prompt}
          >
            <item.icon size={13} className="shrink-0 text-secondary/50" aria-hidden="true" />
            <span className="truncate font-label font-medium">{item.label}</span>
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  )
}
