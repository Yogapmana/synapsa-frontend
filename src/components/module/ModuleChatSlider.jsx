import { useEffect, useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  MessageCircle,
  Sparkles,
  Send,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  Lightbulb,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { sendMessage, getHistory } from '@/api/chat'
import ChatBubble from '@/components/chat/ChatBubble'

import ThinkingIndicator from '@/components/chat/ThinkingIndicator'
import { useTranslation } from 'react-i18next'

/**
 * ModuleChatPanel — sticky right sidebar for the AI tutor.
 *
 * Phase 5.8 redesign — editorial treatment to match the rest of Synapsa:
 *  - Header is structured as: avatar → title block → collapse button
 *    (collapse now sits at the FAR RIGHT, where users expect it).
 *  - Top of header has a thin terracotta accent strip + "TUTOR · AI"
 *    eyebrow (matches the new eyebrow system used elsewhere).
 *  - The empty state now has:
 *      • gradient mesh backdrop (matches Dashboard hero)
 *      • bigger, more prominent avatar (Tutor icon in soft terracotta)
 *      • editorial eyebrow + larger display title
 *      • suggestion chips that look CLICKABLE (with hover state and
 *        a proper send icon), not just static labels
 *  - Messages area has subtle warm wash, scrollable.
 *  - Input has a clear "send" button styled to match Chat empty state.
 */

const EXPANDED_WIDTH = 420
const COLLAPSED_WIDTH = 56

export default function ModuleChatPanel({ sessionId, topicId, moduleTitle }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient()
  const scrollRef = useRef(null)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [draftValue, setDraftValue] = useState('')
  const textareaRef = useRef(null)

  const SUGGESTED_PROMPTS = [
    {
      label: t('module.tutor_suggestion_1'),
      icon: Lightbulb,
    },
    {
      label: t('module.tutor_suggestion_2'),
      icon: MessageCircle,
    },
    {
      label: t('module.tutor_suggestion_3'),
      icon: Sparkles,
    },
  ];

  const { data: history = [], isLoading } = useQuery({
    queryKey: ['chat', 'module', topicId],
    queryFn: () => getHistory(sessionId, topicId),
    enabled: !!sessionId && !!topicId,
  })

  const sendMutation = useMutation({
    mutationFn: (message) =>
      sendMessage({
        session_id: sessionId,
        topic_id: topicId,
        message,
        include_sources: true,
      }),
    onMutate: async (newMessage) => {
      await queryClient.cancelQueries({ queryKey: ['chat', 'module', topicId] })
      const previousHistory = queryClient.getQueryData(['chat', 'module', topicId])

      const optimisticMessage = {
        id: 'optimistic-user',
        role: 'user',
        content: newMessage,
        created_at: new Date().toISOString(),
      }

      queryClient.setQueryData(['chat', 'module', topicId], (old = []) => [
        ...old,
        optimisticMessage,
      ])

      return { previousHistory }
    },
    onError: () => {
      queryClient.setQueryData(['chat', 'module', topicId], (old = []) =>
        old.filter((msg) => msg.id !== 'optimistic-user')
      )
    },
    onSuccess: (data, newMessage) => {
      queryClient.setQueryData(['chat', 'module', topicId], (old = []) => {
        const filtered = old.filter((msg) => msg.id !== 'optimistic-user')
        
        const userMessage = {
          id: `user-${Date.now()}`,
          role: 'user',
          content: newMessage,
          created_at: new Date().toISOString(),
        }
        
        const aiMessage = {
          id: data.message_id || `ai-${Date.now()}`,
          role: 'assistant',
          content: data.response,
          sources: data.sources,
          created_at: new Date().toISOString(),
        }
        return [...filtered, userMessage, aiMessage]
      })
    },
  })

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [history, sendMutation.isPending])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`
    }
  }, [draftValue])

  const handleSendMessage = (content) => {
    if (!content?.trim()) return
    sendMutation.mutate(content)
  }

  // Click a suggestion → send it immediately
  const handleSuggestionClick = (label) => {
    handleSendMessage(label)
  }

  return (
    <motion.aside
      role="complementary"
      aria-label={`Tutor AI untuk ${moduleTitle || 'modul ini'}`}
      aria-expanded={!isCollapsed}
      className={cn(
        'shrink-0 flex flex-col bg-surface-1 border-l border-tertiary/20',
        'sticky top-0 self-stretch overflow-hidden h-[calc(100vh-60px)]'
      )}
      initial={false}
      animate={{ width: isCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH }}
      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
    >
      {isCollapsed ? (
        <CollapsedRail onExpand={() => setIsCollapsed(false)} />
      ) : (
        <>
          {/* ─── HEADER ─── */}
          <div className="relative shrink-0 bg-surface-1 border-b border-tertiary/20">
            <div className="flex items-center gap-2.5 px-3 py-2">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="absolute inset-0 bg-tertiary/20 blur-md rounded-full" />
                <div className="relative flex size-7 items-center justify-center rounded-xl bg-tertiary/10 border border-tertiary/25 text-tertiary">
                  <Sparkles className="size-3.5" />
                </div>
                {/* Online dot */}
                <span
                  aria-hidden="true"
                  className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-success border-2 border-surface-1"
                />
              </div>

              {/* Title block */}
              <div className="min-w-0 flex-1">
                <h2 className="font-display font-bold text-[14px] text-primary leading-tight truncate">
                  {t('module.tutor_title')}
                </h2>
                <p
                  className="text-[11px] text-secondary font-label truncate mt-0.5"
                  title={moduleTitle}
                >
                  {moduleTitle}
                </p>
              </div>

              {/* Collapse button — moved to the FAR RIGHT (where users expect it) */}
              <button
                type="button"
                onClick={() => setIsCollapsed(true)}
                className={cn(
                  'flex size-8 items-center justify-center rounded-lg shrink-0',
                  'text-secondary hover:text-primary hover:bg-secondary/10',
                  'transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary'
                )}
                aria-label="Sembunyikan Tutor AI"
                title="Sembunyikan Tutor AI"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* ─── MESSAGES ─── */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-5 bg-surface-0/30"
          >
            {isLoading ? (
              <div className="flex items-center justify-center text-text-muted text-sm font-label py-12">
                <Sparkles className="size-4 mr-2 animate-pulse" />
              </div>
            ) : history.length === 0 ? (
              <EmptyChatState
                moduleTitle={moduleTitle}
                onSuggestionClick={handleSuggestionClick}
                disabled={sendMutation.isPending}
                suggestedPrompts={SUGGESTED_PROMPTS}
              />
            ) : (
              <div className="space-y-5">
                {history.map((msg, idx) => {
                  const isLastAi =
                    msg.role === 'assistant' &&
                    idx === history.length - 1 &&
                    !sendMutation.isPending
                  return (
                    <ChatBubble
                      key={msg.id || idx}
                      messageId={msg.id}
                      message={msg.content}
                      isAI={msg.role === 'assistant'}
                      sources={msg.sources}
                      timestamp={msg.created_at}
                      isLastAiMessage={isLastAi}
                      rag_faithfulness={msg.rag_faithfulness}
                      rag_answer_relevancy={msg.rag_answer_relevancy}
                    />
                  )
                })}
                {sendMutation.isPending && (
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-tertiary to-tertiary-light flex items-center justify-center text-white shadow-warm-sm">
                      <Sparkles size={14} />
                    </div>
                    <div className="rounded-2xl rounded-tl-sm bg-surface-2/60 px-4 py-3 border border-[rgba(58,41,22,0.06)]">
                      <ThinkingIndicator />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ─── INPUT ─── */}
          <div className="px-3 py-2 border-t border-tertiary/20 bg-surface-1 shrink-0">
            <div className="flex items-end gap-2 bg-surface border border-[rgba(58,41,22,0.06)] rounded-2xl px-3 py-2 focus-within:border-tertiary focus-within:ring-2 focus-within:ring-tertiary/20 transition-all shadow-warm-xs">
              <textarea
                rows={1}
                value={draftValue}
                onChange={(e) => setDraftValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    if (draftValue.trim()) {
                      handleSendMessage(draftValue)
                      setDraftValue('')
                    }
                  }
                }}
                placeholder={t('module.tutor_input_placeholder')}
                disabled={sendMutation.isPending}
                className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-[13px] text-primary placeholder:text-secondary/50 resize-none py-1 max-h-[100px] leading-relaxed [&::-webkit-scrollbar]:hidden"
                ref={textareaRef}
              />
              <button
                onClick={() => {
                  if (draftValue.trim()) {
                    handleSendMessage(draftValue)
                    setDraftValue('')
                  }
                }}
                disabled={!draftValue.trim() || sendMutation.isPending}
                aria-label="Kirim pesan"
                className="bg-tertiary text-white rounded-full p-2 hover:bg-tertiary-light disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 flex-shrink-0 shadow-sm"
              >
                {sendMutation.isPending
                  ? <span className="size-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin block" />
                  : <Send size={14} />}
              </button>
            </div>
          </div>
        </>
      )}
    </motion.aside>
  )
}

/* ────────────────────────────────────────────────────────────────── */

function CollapsedRail({ onExpand }) {
  return (
    <div className="flex flex-col h-full items-center">
      <button
        type="button"
        onClick={onExpand}
        className={cn(
          'mt-3 p-1.5 rounded-lg shrink-0',
          'text-secondary hover:text-primary hover:bg-secondary/10',
          'transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary'
        )}
        aria-label="Buka Tutor AI"
        title="Buka Tutor AI"
      >
        <ChevronLeft size={16} />
      </button>

      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <div
          className={cn(
            'size-10 rounded-xl flex items-center justify-center',
            'bg-tertiary/15 text-tertiary'
          )}
          aria-hidden="true"
        >
          <Sparkles size={20} />
        </div>
        <span
          className={cn(
            'text-[10px] font-label font-bold uppercase tracking-widest',
            'text-tertiary select-none'
          )}
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
          Tutor AI
        </span>
      </div>

      <div className="h-3 shrink-0" aria-hidden="true" />
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────── */

function EmptyChatState({ moduleTitle, onSuggestionClick, disabled, suggestedPrompts }) {
  const { t } = useTranslation();
  return (
    <div className="relative flex flex-col items-center text-center px-4 py-8 overflow-hidden">
      {/* Soft gradient backdrop — matches the rest of the app's hero treatment */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 gradient-mesh-warm opacity-40"
      />

      {/* Decorative oversized numeral — tiny, doesn't overlap */}
      <span
        aria-hidden="true"
        className="absolute -top-2 -right-2 font-display text-[4rem] font-black italic text-tertiary/[0.06] leading-none pointer-events-none select-none"
      >
        ✦
      </span>

      {/* Avatar — big, prominent, with glow */}
      <div className="relative mb-4">
        <div
          aria-hidden="true"
          className="absolute inset-0 -m-3 bg-tertiary/15 blur-2xl rounded-full"
        />
        <div className="relative flex size-16 items-center justify-center rounded-2xl bg-tertiary/10 border-2 border-tertiary/25 text-tertiary shadow-warm-sm">
          <MessageCircle className="size-7" strokeWidth={1.5} />
        </div>
        {/* Live indicator dot */}
        <span
          aria-hidden="true"
          className="absolute -bottom-0.5 -right-0.5 flex size-3.5 items-center justify-center"
        >
          <span className="absolute inline-flex h-full w-full rounded-full bg-success/40 animate-ping" />
          <span className="relative inline-flex size-2.5 rounded-full bg-success border-2 border-surface-1" />
        </span>
      </div>

      {/* Title block */}
      <p className="eyebrow !text-[10px] mb-1">{t('module.tutor_welcome')}</p>
      <h3 className="font-display font-bold text-lg text-primary leading-tight tracking-tight mb-1.5">
        {t('module.tutor_name')}
      </h3>
      <p className="text-[12px] text-secondary font-serif-content leading-relaxed max-w-[300px]">
        {t('module.tutor_intro')}{' '}
        <span className="text-primary font-medium italic">
          {moduleTitle}
        </span>
        .
      </p>

      {/* Suggested prompts — actually clickable */}
      <div className="mt-5 w-full space-y-2">
        <p className="text-[10px] font-label uppercase tracking-widest text-secondary/70 mb-2">
          {t('module.tutor_try_ask')}
        </p>
        {suggestedPrompts.map(({ label, icon: Icon }) => (
          <button
            key={label}
            type="button"
            disabled={disabled}
            onClick={() => onSuggestionClick?.(label)}
            className={cn(
              'group w-full inline-flex items-center gap-2.5 px-3 py-2.5 rounded-xl',
              'bg-surface-1 border border-[rgba(58,41,22,0.06)]',
              'text-left text-[12px] font-label text-secondary',
              'transition-all duration-150',
              'hover:border-tertiary/40 hover:bg-tertiary/[0.04] hover:text-primary',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-[rgba(58,41,22,0.06)]'
            )}
          >
            <span
              className={cn(
                'flex size-7 shrink-0 items-center justify-center rounded-lg',
                'bg-tertiary/10 text-tertiary',
                'transition-transform duration-200 group-hover:scale-105'
              )}
            >
              <Icon className="size-3.5" />
            </span>
            <span className="flex-1 leading-snug">{label}</span>
            <Send
              className={cn(
                'size-3 shrink-0 text-secondary/40',
                'transition-all duration-200 group-hover:text-tertiary group-hover:translate-x-0.5'
              )}
            />
          </button>
        ))}
      </div>
    </div>
  )
}