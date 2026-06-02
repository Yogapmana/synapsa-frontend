import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLearningStore } from '@/stores/learningStore';
import { sendMessage, getHistory } from '@/api/chat';
import { getTopics } from '@/api/learning';
import ChatBubble from '@/components/chat/ChatBubble';
import ChatInput from '@/components/chat/ChatInput';
import SuggestionChips from '@/components/chat/SuggestionChips';
import ThinkingIndicator from '@/components/chat/ThinkingIndicator';
import ChatHistoryDrawer from '@/components/chat/ChatHistoryDrawer';
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, History, BookOpen } from 'lucide-react';

export default function Chat() {
  const queryClient = useQueryClient();
  const { activeSession, activeTopic, setActiveTopic } = useLearningStore();
  const scrollRef = useRef(null);
  
  const [currentTopicId, setCurrentTopicId] = useState(activeTopic?.id || null);
  const [historyOpen, setHistoryOpen] = useState(false);

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

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [history, sendMutation.isPending]);

  const handleSendMessage = (content) => {
    sendMutation.mutate(content);
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

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] bg-neutral overflow-hidden">
      {/* Chat Header */}
      <header className="px-6 py-3 bg-surface border-b border-[var(--border)] flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setHistoryOpen(true)} 
            aria-label="Riwayat topik" 
            className="p-2 text-secondary/70 hover:text-tertiary hover:bg-tertiary/5 rounded-full transition-colors"
          >
            <History size={20} />
          </button>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-primary">Tanya PLA</h1>
              <Badge className="bg-tertiary/5 text-tertiary border-primary-200 hover:bg-tertiary/5 flex items-center gap-1.5 px-2 py-0.5">
                <span className="w-1.5 h-1.5 bg-tertiary rounded-full animate-pulse" />
                RAG Aktif
              </Badge>
            </div>
            <span className="text-sm font-medium text-tertiary truncate max-w-[200px]">
              {currentTopic?.title || 'Pilih topik'}
            </span>
          </div>
        </div>
      </header>

      {/* Messages List */}
      <ScrollArea ref={scrollRef} className="flex-1 px-4 py-6">
        <div className="max-w-3xl mx-auto flex flex-col min-h-full">
          {history.length === 0 && !isHistoryLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 mt-16 bg-surface/50">
              <div className="w-20 h-20 bg-tertiary/10 rounded-2xl flex items-center justify-center text-tertiary mb-5 ring-2 ring-tertiary/20 shadow-inner">
                <Bot size={36} />
              </div>
              <h2 className="text-xl font-bold text-primary mb-2">Halo! Saya PLA, asisten belajar kamu 👋</h2>
              <p className="text-secondary text-sm max-w-sm mb-4">
                Tanyakan apa saja tentang topik di bawah ini, dan saya akan membantu kamu memahaminya lebih dalam.
              </p>
              {currentTopic?.title && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-tertiary/5 border border-tertiary/20 rounded-full text-sm font-medium text-tertiary mb-6">
                  <BookOpen size={14} />
                  {currentTopic.title}
                </div>
              )}
              <SuggestionChips 
                topicTitle={currentTopic?.title || 'topik ini'} 
                onChipClick={handleSendMessage} 
              />
            </div>
          ) : (
            <>
              {history.map((msg, index) => {
                const isLastAi = msg.role === 'assistant' && 
                  index === history.length - 1 && 
                  !sendMutation.isPending;
                return (
                  <ChatBubble
                    key={msg.id}
                    message={msg.content}
                    isAI={msg.role === 'assistant'}
                    sources={msg.sources}
                    timestamp={msg.created_at}
                    isLastAiMessage={isLastAi}
                    onRegenerate={isLastAi ? handleRegenerate : undefined}
                  />
                );
              })}
              
              {sendMutation.isPending && (
                <div className="mb-4">
                  <div className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-full bg-tertiary/10 flex items-center justify-center flex-shrink-0 mt-1 border border-primary-200">
                      <Bot size={16} className="text-tertiary" />
                    </div>
                    <ThinkingIndicator />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <ChatInput 
        onSend={handleSendMessage} 
        isLoading={sendMutation.isPending} 
        placeholder={`Tanya tentang ${currentTopic?.title || 'topik ini'}...`}
      />

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
