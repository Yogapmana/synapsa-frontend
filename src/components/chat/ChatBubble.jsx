import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Copy, Check, RefreshCw } from 'lucide-react';
import Avatar from '@/components/common/Avatar';
import MarkdownRenderer from '@/components/common/MarkdownRenderer';

import SourceAccordion from './SourceAccordion';
import { format } from 'date-fns';

const ChatBubble = ({ message, isAI, sources, timestamp, isLastAiMessage = false, onRegenerate, rag_faithfulness, rag_answer_relevancy, messageId }) => {
  const [copied, setCopied] = useState(false);
  const shouldReduceMotion = useReducedMotion();
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

  const bubbleVariants = shouldReduceMotion
    ? {}
    : {
        initial: { scale: 0.96, opacity: 0, y: 8 },
        animate: { scale: 1, opacity: 1, y: 0 },
        transition: { duration: 0.25, ease: 'easeOut' },
      };

  return (
    <div className={`group flex flex-col mb-5 ${isAI ? 'items-start' : 'items-end'}`}>
      <div className={`flex gap-3 max-w-[85%] ${isAI ? 'flex-row' : 'flex-row-reverse'}`}>
        {isAI && (
          <Avatar role="tutor" variant="soft" size="sm" />
        )}

        <div className="flex flex-col min-w-0">
          <motion.div
            {...bubbleVariants}
            className={`
              px-4 py-3
              ${isAI
                ? 'bg-surface border border-border rounded-2xl rounded-tl-sm max-w-full shadow-warm-xs'
                : 'bg-tertiary text-white rounded-2xl rounded-tr-sm max-w-full shadow-warm-sm'
              }
            `}
          >
            <div className="text-[14px] leading-relaxed break-words font-serif-content">
              {isAI ? (
                <MarkdownRenderer content={message} />
              ) : (
                <p className="whitespace-pre-wrap">{message}</p>
              )}
            </div>
          </motion.div>

          {isAI && sources && sources.length > 0 && (
            <SourceAccordion sources={sources} />
          )}


          {isAI && (
            <div className="flex items-center gap-1 mt-1.5 ml-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg text-secondary/60 hover:text-secondary hover:bg-neutral/80 transition-colors"
                aria-label="Salin pesan"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
              {isLastAiMessage && onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="p-1.5 rounded-lg text-secondary/60 hover:text-secondary hover:bg-neutral/80 transition-colors"
                  aria-label="Regenerasi jawaban"
                >
                  <RefreshCw size={14} />
                </button>
              )}
            </div>
          )}

          <span className={`text-[11px] mt-1 text-secondary/60 font-label tabular-nums ${isAI ? 'ml-1' : 'mr-1 text-right'}`}>
            {formattedTime}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;