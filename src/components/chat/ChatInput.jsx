import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Paperclip, Mic } from 'lucide-react';

const ChatInput = ({ onSend, onUpload, isLoading, isUploading, placeholder, hideUpload = false }) => {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

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

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onUpload) {
      onUpload(file);
      e.target.value = '';
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  const canSend = text.trim() && !isLoading;

  return (
    // Transparent outer wrapper so the page bg (cream) shows through —
    // matches the rest of the Chat page and the AppLayout's bg-neutral.
    // The inner textarea card (below) keeps its own bg-surface so the
    // input is visually distinct from the page.
    <div className="px-4 md:px-6 py-3 bg-transparent border-t border-border-subtle">
      <div className="max-w-[850px] mx-auto">
        <div className="flex items-end gap-2 bg-surface border border-border-subtle rounded-2xl px-4 py-2.5 focus-within:border-tertiary focus-within:ring-2 focus-within:ring-tertiary/20 transition-all shadow-warm-xs">
          {!hideUpload && (
            <>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.txt,.md"
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || isLoading}
                className="p-1.5 text-secondary/40 hover:text-secondary disabled:opacity-50 transition-colors flex-shrink-0 mb-0.5"
                aria-label="Lampirkan file"
                tabIndex={-1}
              >
                {isUploading ? <Loader2 className="animate-spin text-tertiary" size={18} /> : <Paperclip size={18} />}
              </button>
            </>
          )}

          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-[14px] text-primary placeholder:text-secondary/50 resize-none py-1 max-h-[120px] leading-relaxed"
            disabled={isLoading}
          />

          {/* Mic button (dummy) */}
          <button
            className="p-1.5 text-secondary/40 hover:text-secondary transition-colors flex-shrink-0 mb-0.5"
            aria-label="Input suara"
            tabIndex={-1}
          >
            <Mic size={18} />
          </button>

          <button
            onClick={handleSend}
            disabled={!canSend}
            aria-label="Kirim pesan"
            className="bg-tertiary text-white rounded-full p-2.5 hover:bg-tertiary-light disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 flex-shrink-0 mb-0.5 shadow-sm"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>

        <p className="text-[11px] text-secondary/40 text-right mt-1.5 pr-1 font-label">
          Shift+Enter untuk baris baru
        </p>
      </div>
    </div>
  );
};

export default ChatInput;