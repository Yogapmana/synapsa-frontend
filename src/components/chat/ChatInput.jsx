import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ChatInput = ({ onSend, isLoading, placeholder }) => {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  const handleSend = () => {
    if (text.trim() && !isLoading) {
      onSend(text);
      setText('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  return (
    <div className="p-4 bg-white border-t border-slate-100 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
      <div className="max-w-4xl mx-auto flex gap-3 items-end">
        <div className="flex-1 bg-slate-50 rounded-2xl border border-slate-200 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-100 transition-all px-4 py-2">
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full bg-transparent border-none focus:ring-0 text-[14px] resize-none py-1 max-h-[120px]"
            disabled={isLoading}
          />
        </div>
        <Button
          onClick={handleSend}
          disabled={!text.trim() || isLoading}
          className="rounded-full w-10 h-10 p-0 flex-shrink-0 bg-primary-500 hover:bg-primary-600 shadow-sm"
        >
          {isLoading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <Send size={18} />
          )}
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;
