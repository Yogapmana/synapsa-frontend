import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Leaf, Copy, Check, RefreshCw } from 'lucide-react';
import MarkdownRenderer from '@/components/common/MarkdownRenderer';
import SourceAccordion from './SourceAccordion';
import { format } from 'date-fns';

const ChatBubble = ({ message, isAI, sources, timestamp, isLastAiMessage = false, onRegenerate }) => {
  const [copied, setCopied] = useState(false);
  const formattedTime = timestamp ? format(new Date(timestamp), 'HH:mm') : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className={`group flex flex-col mb-4 ${isAI ? 'items-start' : 'items-end'}`}>
      <div className={`flex gap-3 max-w-[90%] ${isAI ? 'flex-row' : 'flex-row-reverse'}`}>
        {isAI && (
          <div className="w-8 h-8 rounded-full bg-tertiary/10 flex items-center justify-center flex-shrink-0 mt-1 border border-primary-200">
            <Leaf size={16} className="text-tertiary" />
          </div>
        )}
        
        <div className="flex flex-col">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`
              p-3 px-4 shadow-sm
              ${isAI 
                ? 'bg-neutral text-primary border border-[var(--border)] rounded-tr-[18px] rounded-br-[18px] rounded-bl-[18px] rounded-tl-[4px] max-w-full' 
                : 'bg-tertiary text-white border border-tertiary rounded-tl-[18px] rounded-bl-[18px] rounded-br-[18px] rounded-tr-[4px] max-w-full'
              }
            `}
          >
            <div className="text-[14px] leading-relaxed">
              {isAI ? (
                <MarkdownRenderer content={message} />
              ) : (
                <p>{message}</p>
              )}
            </div>
          </motion.div>
          
          {isAI && sources && sources.length > 0 && (
            <SourceAccordion sources={sources} />
          )}

          {isAI && (
            <div className="flex items-center gap-1 mt-1 ml-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-md text-secondary/50 hover:text-secondary hover:bg-neutral/80 transition-colors"
                aria-label="Salin pesan"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
              {isLastAiMessage && onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="p-1.5 rounded-md text-secondary/50 hover:text-secondary hover:bg-neutral/80 transition-colors"
                  aria-label="Regenerasi jawaban"
                >
                  <RefreshCw size={14} />
                </button>
              )}
            </div>
          )}

          <span className={`text-[10px] mt-1 text-secondary/70 font-medium ${isAI ? 'ml-1' : 'mr-1 text-right'}`}>
            {formattedTime}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
