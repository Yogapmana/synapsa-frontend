import { cn } from '@/lib/utils'
import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getChatSessions, createChatSession, deleteChatSession, sendMessage, getHistory, uploadDocument } from '@/api/chat';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import ChatBubble from '@/components/chat/ChatBubble';
import ChatInput from '@/components/chat/ChatInput';
import WelcomeHero from '@/components/chat/WelcomeHero';
import CapabilityBadges from '@/components/chat/CapabilityBadges';
import ChatHistoryEmpty from '@/components/chat/ChatHistoryEmpty';
import ThinkingIndicator from '@/components/chat/ThinkingIndicator';
import StatusBadge from '@/components/common/StatusBadge';
import Avatar from '@/components/common/Avatar';
import { History, Sparkles, Plus, MessageSquare, MessageCircle, Trash2, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Chat() {
  const queryClient = useQueryClient();
  const { activeChatSessionId, setActiveChatSessionId } = useChatStore();
  const { user } = useAuthStore();
  const scrollRef = useRef(null);
  const messagesEndRef = useRef(null);

  const [uploadToast, setUploadToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Desktop sidebar collapse state — when true, the sidebar shrinks
  // to a narrow icon rail. State is local (not persisted).
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
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
      {/* Top section — h-16, matches the chat header height */}
      <div className="border-b border-border/60 shrink-0 flex items-center h-16 px-4 bg-surface-1">
        <button
          onClick={() => { setActiveChatSessionId(null); setSidebarOpen(false); }}
          className="group flex items-center gap-2 w-full justify-center px-4 py-2.5 bg-tertiary text-white rounded-xl hover:bg-tertiary-light font-medium text-[13px] transition-all duration-200 shadow-warm-sm hover:shadow-warm-md"
        >
          <Plus size={16} className="transition-transform duration-200 group-hover:rotate-90" />
          Percakapan Baru
        </button>
      </div>

      {/* Sessions list */}
      <div className="flex-1 min-h-0 px-3 pt-4 pb-3 overflow-y-auto bg-surface-1">
        {sessions.length === 0 ? (
          <ChatHistoryEmpty onTemplateClick={handleSendMessage} />
        ) : (
          <div className="space-y-0.5">
            {sessions.map(session => (
              <div
                key={session.id}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer group transition-all duration-200 mb-1",
                  activeChatSessionId === session.id
                    ? "bg-surface border border-tertiary/30 text-tertiary font-semibold shadow-sm ring-1 ring-tertiary/10"
                    : "border border-transparent hover:bg-tertiary/[0.04] text-secondary hover:text-primary hover:border-tertiary/10"
                )}
                onClick={() => { setActiveChatSessionId(session.id); setSidebarOpen(false); }}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <MessageCircle size={14} className={cn("shrink-0", activeChatSessionId === session.id ? "text-tertiary" : "text-secondary/60 group-hover:text-tertiary/70")} />
                  <span className="text-[13px] truncate">{session.topic}</span>
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
    <div className="flex h-full bg-transparent overflow-y-auto relative items-start" ref={scrollRef}>

      {/* Mobile Sidebar Overlay */}
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

      {/* Main Chat Area — comes FIRST (left side) */}
      <div className="flex-1 flex flex-col min-w-0 min-h-full relative">
        {/* ── Chat Header */}
        <header className="sticky top-0 px-4 md:px-6 py-3 bg-neutral/85 backdrop-blur-md shadow-[0_1px_0_rgba(58,41,22,0.05)] flex items-center justify-between z-20 shrink-0 h-16">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 text-secondary hover:text-primary rounded-lg hover:bg-secondary/10 transition-colors"
              aria-label="Buka riwayat"
            >
              <Menu size={20} />
            </button>
            <div className="relative shrink-0 hidden sm:block">
              <div className="absolute inset-0 bg-tertiary/20 blur-md rounded-full" />
              <div className="relative flex size-9 items-center justify-center rounded-xl bg-tertiary/10 border border-tertiary/25 text-tertiary shadow-warm-sm">
                <Sparkles className="size-5" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-success border-2 border-surface-1" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2.5">
                <h1 className="font-display font-bold text-[16px] sm:text-lg text-primary tracking-tight leading-none">
                  Tanya PLA Chatbot
                </h1>
                <StatusBadge variant="success" className="flex items-center gap-1.5 hidden sm:flex !py-0.5 !px-2 !text-[10px] shadow-sm">
                  <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                  RAG & Web Search Aktif
                </StatusBadge>
              </div>
              <p className="text-[11px] text-secondary font-label mt-1 truncate">
                Asisten AI General • Jawaban komprehensif
              </p>
            </div>
          </div>
          {/* History toggle — visible on desktop when sidebar is collapsed */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={cn(
              "hidden md:flex items-center justify-center size-9 rounded-lg text-secondary hover:text-primary hover:bg-secondary/10 transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary"
            )}
            title={sidebarCollapsed ? 'Tampilkan riwayat' : 'Sembunyikan riwayat'}
            aria-label={sidebarCollapsed ? 'Tampilkan riwayat' : 'Sembunyikan riwayat'}
          >
            <History size={18} />
          </button>
        </header>

        {/* ── Chat Content ── */}
        <div className="flex-1">
          <div className="max-w-[850px] mx-auto px-4 md:px-6 py-6 min-h-full flex flex-col">

            <AnimatePresence mode="wait">
              {isEmpty ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center text-center py-10"
                >
                  <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-6">
                    <WelcomeHero username={user?.username} />
                    <CapabilityBadges />
                    <div className="flex items-center gap-1.5 text-[11px] text-secondary/60 font-label mt-1">
                      <span
                        className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"
                        aria-hidden="true"
                      />
                      Didukung oleh RAG &amp; Web Search
                    </div>
                  </div>
                </motion.div>
              ) : (
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
                      message="Memikirkan jawaban..."
                    />
                  )}

                  <div ref={messagesEndRef} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Input Area (pinned bottom) ── */}
        <div className="sticky bottom-0 z-20 shrink-0 bg-surface-0/95 backdrop-blur-sm pb-2 pt-2">
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

      {/* Chat History Sidebar — RIGHT side, border-l instead of border-r.
          On mobile, slides in from the right edge. */}
      <aside
        className={cn(
          "fixed md:sticky inset-y-0 md:top-0 right-0 z-30 bg-surface-1 border-l border-[rgba(58,41,22,0.06)] flex flex-col min-h-0 md:shadow-none shadow-warm-lg",
          "transition-all duration-300 ease-in-out",
          "w-72 md:h-[calc(100vh-60px)]",
          sidebarOpen ? "translate-x-0" : "translate-x-full md:translate-x-0",
          // Desktop: collapse to hidden
          sidebarCollapsed && "md:w-0 md:border-l-0 md:overflow-hidden"
        )}
        aria-label="Riwayat percakapan"
      >
        {/* Mobile Header for Sidebar */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-border/60 shrink-0">
          <span className="font-display font-bold text-primary">Riwayat Obrolan</span>
          <button onClick={() => setSidebarOpen(false)} className="p-2 text-secondary hover:text-primary rounded-lg">
            <X size={20} />
          </button>
        </div>
        <SidebarContent />
      </aside>
    </div>
  );
}