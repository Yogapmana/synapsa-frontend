import { cn } from '@/lib/utils'
import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLearningStore } from '@/stores/learningStore';
import { sendMessage, getHistory, uploadDocument } from '@/api/chat';
import { getTopics } from '@/api/learning';
import ChatBubble from '@/components/chat/ChatBubble';
import ChatInput from '@/components/chat/ChatInput';
import SuggestionChips from '@/components/chat/SuggestionChips';
import ThinkingIndicator from '@/components/chat/ThinkingIndicator';
import ChatHistoryDrawer from '@/components/chat/ChatHistoryDrawer';
import StatusBadge from '@/components/common/StatusBadge';
import Avatar from '@/components/common/Avatar';
import { History, BookOpen, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Chat() {
  const queryClient = useQueryClient();
  const { activeSession, activeTopic, setActiveTopic } = useLearningStore();
  const scrollRef = useRef(null);
  const messagesEndRef = useRef(null);

  const [currentTopicId, setCurrentTopicId] = useState(activeTopic?.id ?? null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [uploadToast, setUploadToast] = useState(null);

  const { data: topics = [] } = useQuery({
    queryKey: ['topics', activeSession?.id],
    queryFn: () => getTopics(activeSession?.id),
    enabled: !!activeSession?.id,
  });

  useEffect(() => {
    if (activeTopic?.id) {
      setCurrentTopicId(activeTopic.id);
    }
  }, [activeTopic?.id]);

  const currentTopic = topics.find(t => t.id === currentTopicId) || activeTopic;

  const { data: history = [], isLoading: isHistoryLoading } = useQuery({
    queryKey: ['chat', currentTopicId],
    queryFn: () => getHistory(currentTopicId, activeSession?.id),
    enabled: !!currentTopicId && !!activeSession?.id,
  });

  const sendMutation = useMutation({
    mutationFn: (message) => sendMessage({
      session_id: activeSession?.id,
      topic_id: currentTopicId,
      message,
      include_sources: true
    }),
    onMutate: async (newMessage) => {
      await queryClient.cancelQueries({ queryKey: ['chat', currentTopicId] });
      const previousHistory = queryClient.getQueryData(['chat', currentTopicId]);

      const optimisticMessage = {
        id: 'optimistic-user',
        role: 'user',
        content: newMessage,
        created_at: new Date().toISOString()
      };

      queryClient.setQueryData(['chat', currentTopicId], (old = []) => [...old, optimisticMessage]);

      return { previousHistory };
    },
    onError: (err, newMessage, context) => {
      queryClient.setQueryData(['chat', currentTopicId], (old = []) => {
        return old.filter(msg => msg.id !== 'optimistic-user');
      });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['chat', currentTopicId], (old = []) => {
        const filtered = old.filter(msg => msg.id !== 'optimistic-user')
        const aiMessage = {
          id: data.message_id || `ai-${Date.now()}`,
          role: 'assistant',
          content: data.response,
          sources: data.sources,
          created_at: new Date().toISOString()
        };
        return [...filtered, aiMessage];
      });
    },
  });

  const uploadMutation = useMutation({
    mutationFn: (file) => uploadDocument(file, activeSession?.id, currentTopicId),
    onSuccess: (data) => {
      setUploadToast({ type: 'success', message: 'Dokumen berhasil diunggah dan diindeks!' });
      setTimeout(() => setUploadToast(null), 4000);
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

  const handleSendMessage = (content) => {
    sendMutation.mutate(content);
  };

  const handleUploadDocument = (file) => {
    uploadMutation.mutate(file);
  };

  const handleTopicChange = (topicId) => {
    const topic = topics.find(t => t.id === topicId);
    if (topic) {
      setCurrentTopicId(topicId);
      setActiveTopic(topic);
    }
  };

  const handleRegenerate = () => {
    const lastUserMessage = [...history].reverse().find(msg => msg.role === 'user');
    if (lastUserMessage) {
      sendMutation.mutate(lastUserMessage.content);
    }
  };

  const isEmpty = history.length === 0 && !isHistoryLoading;

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] bg-bg-secondary overflow-hidden">
      {/* ── Chat Header (self-contained, not from Topbar) ── */}
      <header className="px-4 md:px-6 py-3 bg-bg-primary border-b border-border flex items-center justify-between z-10 shadow-warm-xs">
        <div className="flex items-center gap-3">
          <Avatar role="tutor" variant="ring" size="md" label="Avatar PLA Tutor" />
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2.5">
              <h1 className="font-display font-bold text-lg text-primary tracking-tight">
                PLA Tutor
              </h1>
              <StatusBadge variant="success" className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                RAG Aktif
              </StatusBadge>
            </div>
            {currentTopic?.title && (
              <span className="font-label text-xs text-secondary truncate max-w-[240px] mt-0.5">
                Topik: {currentTopic.title}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => setHistoryOpen(true)}
          aria-label="Riwayat topik"
          className="p-2.5 text-secondary hover:text-tertiary hover:bg-tertiary/5 rounded-xl transition-colors"
        >
          <History size={20} />
        </button>
      </header>

      {/* ── Chat Area ── */}
      <div className="flex-1 overflow-y-auto" ref={scrollRef}>
        <div className="max-w-[850px] mx-auto px-4 md:px-6 py-6 min-h-full flex flex-col">

          <AnimatePresence mode="wait">
            {isEmpty ? (
              /* ── Empty State ── */
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex-1 flex flex-col items-center justify-center text-center py-16"
              >
                <div className="w-20 h-20 rounded-2xl bg-tertiary/10 flex items-center justify-center text-tertiary mb-6 ring-2 ring-tertiary/15 shadow-warm-sm">
                  <Sparkles size={36} />
                </div>

                <h2 className="font-display font-bold text-2xl text-primary mb-2">
                  Halo! Saya PLA, asisten belajar kamu 👋
                </h2>
                <p className="text-secondary text-sm max-w-md mb-6 leading-relaxed">
                  Tanyakan apa saja tentang topik ini, dan saya akan membantu kamu memahaminya lebih dalam.
                </p>

                {currentTopic?.title && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-tertiary/5 border border-tertiary/15 rounded-full text-sm font-medium text-tertiary mb-8">
                    <BookOpen size={14} />
                    {currentTopic.title}
                  </div>
                )}

                <SuggestionChips
                  topicTitle={currentTopic?.title || 'topik ini'}
                  onChipClick={handleSendMessage}
                />
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

                {sendMutation.isPending && <ThinkingIndicator />}

                <div ref={messagesEndRef} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Input Area (sticky bottom) ── */}
      <div className="relative">
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
          isLoading={sendMutation.isPending}
          isUploading={uploadMutation.isPending}
          placeholder={`Tanya tentang ${currentTopic?.title || 'topik ini'}...`}
        />
      </div>

      <ChatHistoryDrawer
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        topics={topics}
        activeTopicId={currentTopicId}
        onTopicSelect={(topic) => {
          handleTopicChange(topic.id);
          setHistoryOpen(false);
        }}
      />
    </div>
  );
}