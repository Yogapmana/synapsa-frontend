import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLearningStore } from '@/stores/learningStore';
import { sendMessage, getHistory } from '@/api/chat';
import { getTopics } from '@/api/learning';
import ChatBubble from '@/components/chat/ChatBubble';
import ChatInput from '@/components/chat/ChatInput';
import SuggestionChips from '@/components/chat/SuggestionChips';
import ThinkingIndicator from '@/components/chat/ThinkingIndicator';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Info } from 'lucide-react';

export default function Chat() {
  const queryClient = useQueryClient();
  const { activeSession, activeTopic, setActiveTopic } = useLearningStore();
  const scrollRef = useRef(null);
  
  const [currentTopicId, setCurrentTopicId] = useState(activeTopic?.id || null);

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
        id: Date.now(),
        role: 'user',
        content: newMessage,
        created_at: new Date().toISOString()
      };
      
      queryClient.setQueryData(['chat', currentTopicId], (old = []) => [...old, optimisticMessage]);
      
      return { previousHistory };
    },
    onError: (err, newMessage, context) => {
      queryClient.setQueryData(['chat', currentTopicId], context.previousHistory);
    },
    onSuccess: (data) => {
      const aiMessage = {
        id: data.message_id || Date.now() + 1,
        role: 'assistant',
        content: data.response,
        sources: data.sources,
        created_at: new Date().toISOString()
      };
      
      queryClient.setQueryData(['chat', currentTopicId], (old = []) => {
        return [...old, aiMessage];
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

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] bg-slate-50 overflow-hidden">
      {/* Chat Header */}
      <header className="px-6 py-3 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-800">Tanya PLA</h1>
              <Badge className="bg-primary-50 text-primary-700 border-primary-200 hover:bg-primary-50 flex items-center gap-1.5 px-2 py-0.5">
                <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse" />
                RAG Aktif
              </Badge>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-xs text-slate-500">Membahas tentang:</span>
              {topics.length > 0 ? (
                <Select value={currentTopicId} onValueChange={handleTopicChange}>
                  <SelectTrigger className="h-6 border-none bg-transparent p-0 text-xs font-semibold text-primary-600 hover:text-primary-700 focus:ring-0 shadow-none gap-1">
                    <SelectValue placeholder="Pilih Topik" />
                  </SelectTrigger>
                  <SelectContent>
                    {topics.map((topic) => (
                      <SelectItem key={topic.id} value={topic.id} className="text-xs">
                        {topic.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <span className="text-xs font-semibold text-slate-400">
                  Belum ada topik. Mulai sesi belajar untuk membuat kurikulum.
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <Info size={20} />
          </button>
        </div>
      </header>

      {/* Messages List */}
      <ScrollArea ref={scrollRef} className="flex-1 px-4 py-6">
        <div className="max-w-4xl mx-auto flex flex-col min-h-full">
          {history.length === 0 && !isHistoryLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 mt-12">
              <div className="w-16 h-16 bg-primary-100 rounded-3xl flex items-center justify-center text-primary-600 mb-4 shadow-inner">
                <Bot size={32} />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Halo! Ada yang bisa saya bantu?</h2>
              <p className="text-slate-500 text-sm max-w-sm mb-6">
                Saya adalah asisten belajar AI kamu. Tanyakan apa saja tentang topik <b>{currentTopic?.title}</b> untuk memperdalam pemahamanmu.
              </p>
              <SuggestionChips 
                topicTitle={currentTopic?.title || 'topik ini'} 
                onChipClick={handleSendMessage} 
              />
            </div>
          ) : (
            <>
              {history.map((msg) => (
                <ChatBubble
                  key={msg.id}
                  message={msg.content}
                  isAI={msg.role === 'assistant'}
                  sources={msg.sources}
                  timestamp={msg.created_at}
                />
              ))}
              
              {sendMutation.isPending && (
                <div className="mb-4">
                  <div className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-1 border border-primary-200">
                      <Bot size={16} className="text-primary-600" />
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
    </div>
  );
}
