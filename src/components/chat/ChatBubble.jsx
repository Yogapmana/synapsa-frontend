import React from 'react';
import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';
import MarkdownRenderer from '@/components/common/MarkdownRenderer';
import SourceAccordion from './SourceAccordion';
import { format } from 'date-fns';

const ChatBubble = ({ message, isAI, sources, timestamp }) => {
  const formattedTime = timestamp ? format(new Date(timestamp), 'HH:mm') : '';

  return (
    <div className={`flex flex-col mb-4 ${isAI ? 'items-start' : 'items-end'}`}>
      <div className={`flex gap-3 max-w-[90%] ${isAI ? 'flex-row' : 'flex-row-reverse'}`}>
        {isAI && (
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-1 border border-primary-200">
            <Leaf size={16} className="text-primary-600" />
          </div>
        )}
        
        <div className="flex flex-col">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`
              p-3 px-4 shadow-sm
              ${isAI 
                ? 'bg-slate-50 text-slate-800 border border-slate-200 rounded-tr-[18px] rounded-br-[18px] rounded-bl-[18px] rounded-tl-[4px] max-w-full' 
                : 'bg-primary-500 text-white border border-primary-600 rounded-tl-[18px] rounded-bl-[18px] rounded-br-[18px] rounded-tr-[4px] max-w-full'
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

          <span className={`text-[10px] mt-1 text-slate-400 font-medium ${isAI ? 'ml-1' : 'mr-1 text-right'}`}>
            {formattedTime}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
