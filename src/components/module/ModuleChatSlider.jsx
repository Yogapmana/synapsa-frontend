import { useEffect, useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MessageCircle, Sparkles, Send, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { sendMessage, getHistory } from '@/api/chat'
import ChatBubble from '@/components/chat/ChatBubble'
import ChatInput from '@/components/chat/ChatInput'
import ThinkingIndicator from '@/components/chat/ThinkingIndicator'

/**
 * ModuleChatPanel — sticky right sidebar for the AI tutor.
 *
 * Layout (final):
 *   - `position: sticky; top: 3.5rem` so the panel stays visible at
 *     the top of the viewport (just below the topbar) as the user
 *     scrolls the article. The user explicitly wants the chat to
 *     stay in view while reading — NOT to scroll out of sight.
 *   - Fixed height `calc(100vh - 3.5rem)` so the internal message
 *     area is constrained and gets its own scrollbar (6px wide via
 *     the design system). Long conversations overflow internally;
 *     short ones just leave empty space.
 *   - Header is at the top of the column, input at the bottom (flex
 *     column layout). Both stay visible while messages scroll.
 *   - The article on the left reflows to make room (flex-1 vs the
 *     420px chat column). The page scrolls naturally (1 page
 *     scrollbar).
 *
 * Sticky behavior: the panel sticks to `top: 3.5rem` (below the
 * topbar) as long as the parent (main row) is tall enough. When the
 * user scrolls past the bottom of the main row, the panel scrolls
 * up with it — so it never "floats" past the page footer.
 */

const EXPANDED_WIDTH = 420 // px — full chat panel
const COLLAPSED_WIDTH = 56 // px — narrow icon rail

export default function ModuleChatPanel({ sessionId, topicId, moduleTitle }) {
  const queryClient = useQueryClient()
  const scrollRef = useRef(null)

  // Collapse/expand state. Defaults to expanded (matches the
  // previous always-visible design). When collapsed, the panel
  // shrinks to a narrow icon rail so the article can use the
  // reclaimed space for reading. The user toggles via a chevron
  // button in the header (collapse) or at the top of the rail
  // (expand).
  //
  // State is local — resets on page navigation. If persistence
  // is needed later, lift to useUIStore next to `sidebarCollapsed`.
  const [isCollapsed, setIsCollapsed] = useState(false)

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
    onSuccess: (data) => {
      queryClient.setQueryData(['chat', 'module', topicId], (old = []) => {
        const filtered = old.filter((msg) => msg.id !== 'optimistic-user')
        const aiMessage = {
          id: data.message_id || `ai-${Date.now()}`,
          role: 'assistant',
          content: data.response,
          sources: data.sources,
          created_at: new Date().toISOString(),
        }
        return [...filtered, aiMessage]
      })
    },
  })

  // Auto-scroll to the bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [history, sendMutation.isPending])

  const handleSendMessage = (content) => {
    sendMutation.mutate(content)
  }

  return (
    <motion.aside
      role="complementary"
      aria-label={`Tutor AI untuk ${moduleTitle || 'modul ini'}`}
      aria-expanded={!isCollapsed}
      className={cn(
        'shrink-0',
        'flex flex-col',
        'bg-surface-1',
        // Thin 1px line on the LEFT edge as the only visual separator
        // from the article. No shadow, no border on other sides.
        'border-l border-border-subtle',
        // Sticky to top of viewport (just below the h-14 topbar) so
        // the chat panel stays visible as the user scrolls through
        // long articles. When the user reaches the bottom of the
        // main row, the panel scrolls up with it (no floating
        // past the page footer).
        'sticky top-14',
        // `overflow-hidden` so the inner content (CollapsedRail or
        // full panel) doesn't bleed outside the animated width
        // during the spring transition. Without it, the messages
        // area would briefly extend past the panel border.
        'overflow-hidden',
      )}
      initial={false}
      // Animate the width between the full panel and the icon rail.
      // The spring (320/32) gives a snappy but not jarring motion
      // that matches the rest of the app's transitions.
      animate={{ width: isCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH }}
      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      style={{
        height: 'calc(100vh - 3.5rem)',
      }}
    >
      {isCollapsed ? (
        <CollapsedRail onExpand={() => setIsCollapsed(false)} />
      ) : (
        <>
      {/* Sidebar header — sticks to the top of the column. The
          chevron-right button on the left collapses the panel
          (shrinks it back to the icon rail on the right). */}
      <div
        className={cn(
          'flex items-center gap-2 shrink-0',
          'px-3 py-3 border-b border-border-subtle',
          'bg-surface-1',
        )}
      >
        <button
          type="button"
          onClick={() => setIsCollapsed(true)}
          className={cn(
            'p-1.5 rounded-lg shrink-0',
            'text-secondary hover:text-primary hover:bg-secondary/10',
            'transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary',
          )}
          aria-label="Tutup Tutor AI"
          title="Tutup Tutor AI"
        >
          <ChevronRight size={16} />
        </button>
        <div
          className={cn(
            'flex size-8 items-center justify-center rounded-lg shrink-0',
            'bg-tertiary/15 text-tertiary',
          )}
          aria-hidden="true"
        >
          <Sparkles className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-display font-semibold text-sm text-primary leading-tight truncate">
            Tutor AI
          </h2>
          <p
            className="text-[11px] text-text-muted font-label truncate"
            title={moduleTitle}
          >
            {moduleTitle || 'Modul ini'}
          </p>
        </div>
      </div>

      {/* Chat Messages — internal scroll, so the column stays a fixed
          height (viewport - topbar) and long conversations don't make
          the page super tall. */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 bg-surface-0/30"
      >
        {isLoading ? (
          <div className="flex items-center justify-center text-text-muted text-sm font-label py-12">
            <Sparkles className="size-4 mr-2 animate-pulse" />
            Memuat riwayat chat…
          </div>
        ) : history.length === 0 ? (
          <EmptyChatState />
        ) : (
          <div className="space-y-6">
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
                <div className="rounded-2xl rounded-tl-sm bg-surface-2/60 px-4 py-3 border border-border-subtle">
                  <ThinkingIndicator />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input — at the bottom of the column. */}
      <div className="p-3 border-t border-border-subtle bg-surface-1 shrink-0">
        <ChatInput
          onSend={handleSendMessage}
          isLoading={sendMutation.isPending}
          placeholder="Tanyakan sesuatu…"
          hideUpload={true}
        />
        <p className="mt-1.5 text-[10px] font-label text-text-subtle text-center">
          Shift+Enter untuk baris baru
        </p>
      </div>
        </>
      )}
    </motion.aside>
  )
}

/**
 * CollapsedRail — narrow icon rail shown when the chat panel is
 * collapsed. Just a chevron-left button (to expand) and a centered
 * Sparkles icon + rotated "Tutor AI" label, so the user can still
 * tell where the chat went. Width is `COLLAPSED_WIDTH` (56px).
 *
 * The label is rotated 90° via CSS `writing-mode: vertical-rl` +
 * `transform: rotate(180deg)`. This makes the text read top-to-
 * bottom along the rail, matching the way vertical text is rendered
 * in design tools (Figma "Rotate 90° CCW"). The rotation flip
 * (180°) puts the text in the natural reading orientation (top →
 * bottom, not bottom → top).
 */
function CollapsedRail({ onExpand }) {
  return (
    <div className="flex flex-col h-full items-center">
      {/* Expand button — top of the rail. Chevron points LEFT (←)
          toward where the full panel will appear when expanded. */}
      <button
        type="button"
        onClick={onExpand}
        className={cn(
          'mt-3 p-1.5 rounded-lg shrink-0',
          'text-secondary hover:text-primary hover:bg-secondary/10',
          'transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary',
        )}
        aria-label="Buka Tutor AI"
        title="Buka Tutor AI"
      >
        <ChevronLeft size={16} />
      </button>

      {/* Icon + vertical label — fills the middle of the rail. */}
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <div
          className={cn(
            'size-10 rounded-xl flex items-center justify-center',
            'bg-tertiary/15 text-tertiary',
          )}
          aria-hidden="true"
        >
          <Sparkles size={20} />
        </div>
        <span
          className={cn(
            'text-[10px] font-label font-bold uppercase tracking-widest',
            'text-tertiary select-none',
          )}
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
          Tutor AI
        </span>
      </div>

      {/* Spacer at the bottom mirrors the input area in the expanded
          view, so the icon stays vertically centered regardless of
          the rail's height. */}
      <div className="h-3 shrink-0" aria-hidden="true" />
    </div>
  )
}

function EmptyChatState() {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-12">
      <div
        className={cn(
          'w-14 h-14 rounded-2xl flex items-center justify-center mb-4',
          'bg-tertiary/10 text-tertiary',
        )}
      >
        <MessageCircle size={26} />
      </div>
      <h3 className="font-display font-semibold text-base text-primary mb-2">
        Tanya Tutor AI
      </h3>
      <p className="text-xs text-text-muted font-label leading-relaxed max-w-[280px]">
        Ada bagian yang kurang jelas? Saya siap menjelaskannya lebih detail
        berdasarkan materi yang sedang Anda baca.
      </p>
      <div className="mt-4 flex flex-col gap-2 w-full max-w-[280px]">
        {[
          'Jelaskan lebih detail tentang topik ini',
          'Beri contoh konkret',
          'Ringkas poin-poin utama',
        ].map((suggestion) => (
          <span
            key={suggestion}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg',
              'bg-surface-1 border border-border-subtle',
              'text-[11px] font-label text-text-muted text-left',
            )}
          >
            <Send className="size-2.5 shrink-0" />
            {suggestion}
          </span>
        ))}
      </div>
    </div>
  )
}
