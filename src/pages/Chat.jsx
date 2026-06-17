import { cn } from '@/lib/utils'
import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getChatSessions, createChatSession, deleteChatSession, sendMessage, getHistory, uploadDocument } from '@/api/chat';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { useAgentLog } from '@/hooks/useAgentLog';
import ChatBubble from '@/components/chat/ChatBubble';
import ChatInput from '@/components/chat/ChatInput';
import WelcomeHero from '@/components/chat/WelcomeHero';
import CapabilityBadges from '@/components/chat/CapabilityBadges';
import QuickActionCards from '@/components/chat/QuickActionCards';
import ChatHistoryEmpty from '@/components/chat/ChatHistoryEmpty';
import ThinkingIndicator from '@/components/chat/ThinkingIndicator';
import StatusBadge from '@/components/common/StatusBadge';
import Avatar from '@/components/common/Avatar';
import { History, Sparkles, Plus, MessageSquare, Trash2, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Chat() {
  const queryClient = useQueryClient();
  const { activeChatSessionId, setActiveChatSessionId } = useChatStore();
  const { user } = useAuthStore();
  const scrollRef = useRef(null);
  const messagesEndRef = useRef(null);

  const [uploadToast, setUploadToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Agent Log for live thinking info
  const { logs, clearLogs } = useAgentLog(activeChatSessionId);
  
  // Queries
  const { data: sessions = [], isLoading: isSessionsLoading } = useQuery({
    queryKey: ['chat-sessions'],
    queryFn: getChatSessions
  });

  const { data: history = [], isLoading: isHistoryLoading } = useQuery({
    queryKey: ['chat', 'general', activeChatSessionId],
    queryFn: () => getHistory(activeChatSessionId, null),
    enabled: !!activeChatSessionId,
  });

  // Mutations
  const createSessionMutation = useMutation({
    mutationFn: createChatSession,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
      setActiveChatSessionId(data.id);
      setSidebarOpen(false);
    }
  });

  const deleteSessionMutation = useMutation({
    mutationFn: deleteChatSession,
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
      if (activeChatSessionId === deletedId) {
        setActiveChatSessionId(null);
      }
    }
  });

  const sendMutation = useMutation({
    mutationFn: ({ sessionId, content }) => sendMessage({
      session_id: sessionId,
      topic_id: null,
      message: content,
      include_sources: true
    }),
    onMutate: async ({ sessionId, content }) => {
      await queryClient.cancelQueries({ queryKey: ['chat', 'general', sessionId] });
      const previousHistory = queryClient.getQueryData(['chat', 'general', sessionId]);
      
      const optimisticMessage = {
        id: 'optimistic-user',
        role: 'user',
        content,
        created_at: new Date().toISOString()
      };
      
      queryClient.setQueryData(['chat', 'general', sessionId], (old = []) => [...old, optimisticMessage]);
      return { previousHistory, sessionId };
    },
    onError: (err, variables, context) => {
      if (context?.previousHistory) {
        queryClient.setQueryData(['chat', 'general', context.sessionId], context.previousHistory);
      }
      
      // If the session was deleted or not found on the backend, clear the frontend cache
      if (err.response?.status === 404) {
        setActiveChatSessionId(null);
        setUploadToast({ type: 'error', message: 'Sesi percakapan tidak valid. Silakan coba kirim ulang.' });
      } else {
        setUploadToast({ type: 'error', message: err.response?.data?.detail || 'Gagal mengirim pesan (Timeout/Error)' });
      }
      
      setTimeout(() => setUploadToast(null), 4000);
    },
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData(['chat', 'general', context.sessionId], (old = []) => {
        const filtered = old.filter(msg => msg.id !== 'optimistic-user');
        const aiMessage = {
          id: data.message_id || `ai-${Date.now()}`,
          role: 'assistant',
          content: data.response,
          sources: data.sources,
          created_at: new Date().toISOString()
        };
        return [...filtered, aiMessage];
      });
    }
  });

  const uploadMutation = useMutation({
    mutationFn: ({ file, sessionId }) => uploadDocument(file, sessionId, null),
    onSuccess: (data, variables) => {
      setUploadToast({ type: 'success', message: 'Dokumen berhasil diunggah dan diindeks!' });
      setTimeout(() => setUploadToast(null), 4000);
      queryClient.invalidateQueries({ queryKey: ['chat', 'general', variables.sessionId] });
    },
    onError: (err) => {
      setUploadToast({ type: 'error', message: err.response?.data?.detail || 'Gagal mengunggah dokumen' });
      setTimeout(() => setUploadToast(null), 4000);
    }
  });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, sendMutation.isPending]);

  const handleSendMessage = async (content) => {
    let currentSessionId = activeChatSessionId;
    if (!currentSessionId) {
      const newSession = await createSessionMutation.mutateAsync(content.substring(0, 30) + "...");
      currentSessionId = newSession.id;
    }
    clearLogs(); // clear logs for new message
    sendMutation.mutate({ sessionId: currentSessionId, content });
  };

  const handleUploadDocument = async (file) => {
    let currentSessionId = activeChatSessionId;
    if (!currentSessionId) {
      const newSession = await createSessionMutation.mutateAsync("Dokumen Baru");
      currentSessionId = newSession.id;
    }
    uploadMutation.mutate({ file, sessionId: currentSessionId });
  };

  const handleRegenerate = () => {
    const lastUserMessage = [...history].reverse().find(msg => msg.role === 'user');
    if (lastUserMessage && activeChatSessionId) {
      sendMutation.mutate({ sessionId: activeChatSessionId, content: lastUserMessage.content });
    }
  };

  const isEmpty = history.length === 0 && !isHistoryLoading;

  const SidebarContent = () => (
    <>
      <div className="p-4 border-b border-border-subtle shrink-0">
        <button
          onClick={() => { setActiveChatSessionId(null); setSidebarOpen(false); }}
          className="flex items-center gap-2 w-full justify-center px-4 py-2.5 bg-primary text-neutral rounded-xl hover:bg-primary/90 font-medium transition-colors shadow-warm-sm"
        >
          <Plus size={18} />
          Percakapan Baru
        </button>
      </div>
      {/* Sessions list — shows the empty state when there are no
          saved chats (helps the user discover the template prompts
          and understand the column's purpose), or a list of saved
          sessions otherwise. The empty state is rendered in the
          same scroll context as the sessions, so any future
          additions (e.g. "Recent" section) can flow naturally. */}
      <div className="flex-1 min-h-0 p-3 overflow-y-auto">
        {sessions.length === 0 ? (
          <ChatHistoryEmpty onTemplateClick={handleSendMessage} />
        ) : (
          <div className="space-y-1">
            {sessions.map(session => (
          <div
            key={session.id}
            className={cn(
              "flex items-center justify-between p-3 rounded-xl cursor-pointer group transition-all duration-200",
              activeChatSessionId === session.id
                ? "bg-tertiary/10 text-tertiary font-medium ring-1 ring-tertiary/20"
                : "hover:bg-secondary/8 text-secondary hover:text-primary"
            )}
            onClick={() => { setActiveChatSessionId(session.id); setSidebarOpen(false); }}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <MessageSquare size={16} className="shrink-0" />
              <span className="text-sm truncate">{session.topic}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteSessionMutation.mutate(session.id);
              }}
              className="opacity-0 group-hover:opacity-100 hover:text-danger p-1.5 rounded-md hover:bg-danger/10 transition-all shrink-0"
              aria-label={`Hapus percakapan ${session.topic}`}
            >
              <Trash2 size={14} />
            </button>
          </div>
            ))}
          </div>
        )}
      </div>
    </>
  );

  return (
    // Fixed-height chat pattern (same as Slack/Discord/ChatGPT):
    // the page wrapper is exactly viewport-minus-topbar, the header
    // and input are pinned at top/bottom, and the messages area
    // scrolls in the middle.
    //
    // Height: `h-full` (NOT `h-[calc(100vh-60px)]` — that was the
    // root cause of the "double scroll" bug). The parent chain
    // (AppLayout → main → inner content div) is now properly
    // height-constrained, so this Chat root can just fill whatever
    // space the parent gives it. This means: page itself never
    // scrolls, only the messages area does. No more double scroll.
    //
    // Background: `bg-transparent` so the Chat page blends with the
    // AppLayout's `bg-neutral` outer container. The page no longer
    // looks "tempelan" (patched on) — it reads as part of the same
    // surface as the rest of the app.
    <div className="flex h-full bg-transparent overflow-hidden relative">

      {/* Mobile Sidebar Overlay — lighter (was bg-primary/40, now
          bg-neutral/30 + softer blur) so it doesn't darken the cream
          theme too aggressively. */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-neutral/30 backdrop-blur-sm z-20 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Chat History Sidebar — semantic <aside>, transparent bg,
          light border. No shadow on desktop (mobile drawer keeps
          shadow-warm-lg). `min-h-0` is required here so the
          sessions list inside (which uses `flex-1 overflow-y-auto`)
          gets a bounded height — without it, the inner div can't
          scroll because the flex parent refuses to shrink below
          its content size. */}
      <aside
        className={cn(
          "fixed md:static inset-y-0 left-0 z-30 w-72 bg-transparent border-r border-border-subtle flex flex-col min-h-0 md:shadow-none transition-transform duration-300 ease-in-out shadow-warm-lg",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
        aria-label="Riwayat percakapan"
      >
        {/* Mobile Header for Sidebar */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-border-subtle shrink-0">
          <span className="font-display font-bold text-primary">Riwayat Obrolan</span>
          <button onClick={() => setSidebarOpen(false)} className="p-2 text-secondary hover:text-primary rounded-lg">
            <X size={20} />
          </button>
        </div>
        <SidebarContent />
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* ── Chat Header — transparent bg, light border, no shadow.
            Triple-affordance removed: just a thin 1px line below
            separates it from the messages area. */}
        <header className="px-4 md:px-6 py-3 bg-transparent border-b border-border-subtle flex items-center justify-between z-10 shrink-0 h-16">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 text-secondary hover:text-primary rounded-lg hover:bg-secondary/10 transition-colors"
            >
              <Menu size={20} />
            </button>
            <Avatar role="tutor" variant="ring" size="md" label="Avatar PLA Chatbot" />
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2.5">
                <h1 className="font-display font-bold text-lg text-primary tracking-tight">
                  PLA Chatbot
                </h1>
                <StatusBadge variant="success" className="flex items-center gap-1.5 hidden sm:flex">
                  <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                  RAG & Web Search Aktif
                </StatusBadge>
              </div>
            </div>
          </div>
        </header>

        {/* ── Chat Content ── */}
        <div className="flex-1 overflow-y-auto" ref={scrollRef}>
          <div className="max-w-[850px] mx-auto px-4 md:px-6 py-6 min-h-full flex flex-col">

            <AnimatePresence mode="wait">
              {isEmpty ? (
                /* ── Empty State (redesigned) ──
                    Replaces the old single-icon + 3-pill layout with
                    a more visual, premium feel:
                      - WelcomeHero: animated sparkles icon with
                        gradient glow + personalized greeting
                      - CapabilityBadges: 4 chips showing what the
                        bot can do (web search, docs, etc.)
                      - QuickActionCards: 2×2 grid of action cards
                        with hover effects and prompts
                      - Background: subtle tertiary radial glow
                        at top, no harsh borders
                    The user said "buat menarik dan sesuai standar
                    UI/UX" so we lean into the modern AI-chat
                    pattern (Notion AI, Linear AI, Cursor) without
                    breaking the warm cream aesthetic. */
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center text-center py-10 relative"
                >
                  {/* Soft background glow — two large blurred
                      tertiary circles that create a subtle "spotlight"
                      effect behind the hero. `pointer-events-none` so
                      they never block clicks. Opacity 6% so it's
                      barely there but adds depth. */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 overflow-hidden pointer-events-none"
                  >
                    <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-tertiary/[0.06] blur-3xl" />
                    <div className="absolute bottom-[20%] right-[20%] w-[300px] h-[300px] rounded-full bg-tertiary-light/[0.05] blur-3xl" />
                  </div>

                  {/* Content stack — welcome hero, capability
                      badges, action cards, then a small "powered
                      by" footer. `relative` so it sits above the
                      background glow. */}
                  <div className="relative w-full max-w-2xl mx-auto flex flex-col items-center gap-7 md:gap-8">
                    <WelcomeHero username={user?.username} />
                    <CapabilityBadges />
                    <QuickActionCards onActionClick={handleSendMessage} />

                    {/* Powered-by footer — small line with a live
                        dot, like the chat header's status badge.
                        Reinforces the "AI is real" feel. */}
                    <div className="flex items-center gap-1.5 text-[11px] text-secondary/60 font-label">
                      <span
                        className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"
                        aria-hidden="true"
                      />
                      Didukung oleh RAG &amp; Web Search
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* ── Messages ── */
                <motion.div
                  key="messages"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 flex flex-col gap-1"
                >
                  {history.map((msg, index) => {
                    const isLastAi = msg.role === 'assistant' &&
                      index === history.length - 1 &&
                      !sendMutation.isPending;
                    return (
                      <ChatBubble
                        key={msg.id}
                        messageId={msg.id}
                        message={msg.content}
                        isAI={msg.role === 'assistant'}
                        sources={msg.sources}
                        timestamp={msg.created_at}
                        isLastAiMessage={isLastAi}
                        onRegenerate={isLastAi ? handleRegenerate : undefined}
                        rag_faithfulness={msg.rag_faithfulness}
                        rag_answer_relevancy={msg.rag_answer_relevancy}
                      />
                    );
                  })}

                  {sendMutation.isPending && (
                    <ThinkingIndicator
                      message={logs.length > 0 ? logs[logs.length - 1]?.message : "Memikirkan jawaban..."}
                    />
                  )}

                  <div ref={messagesEndRef} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Input Area (pinned bottom) ── */}
        <div className="relative shrink-0">
          <AnimatePresence>
            {uploadToast && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={cn(
                  "absolute -top-12 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-sm font-medium shadow-warm-md z-20 flex items-center gap-2",
                  uploadToast.type === 'success' ? "bg-success/10 text-success border border-success/20" : "bg-danger/10 text-danger border border-danger/20"
                )}
              >
                {uploadToast.type === 'success' ? <Sparkles size={16} /> : null}
                {uploadToast.message}
              </motion.div>
            )}
          </AnimatePresence>

          <ChatInput
            onSend={handleSendMessage}
            onUpload={handleUploadDocument}
            isLoading={sendMutation.isPending || createSessionMutation.isPending}
            isUploading={uploadMutation.isPending}
            placeholder={`Tanya apapun atau unggah dokumen...`}
          />
        </div>
      </div>
    </div>
  );
}