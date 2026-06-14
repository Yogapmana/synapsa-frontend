import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { HelpCircle, BookOpen, Lightbulb } from 'lucide-react';

const SuggestionChips = ({ topicTitle, onChipClick }) => {
  const shouldReduceMotion = useReducedMotion();
  const suggestions = [
    { text: `Apa itu ${topicTitle}?`, icon: HelpCircle },
    { text: `Jelaskan ${topicTitle}`, icon: BookOpen },
    { text: `Bagaimana cara kerja ${topicTitle}?`, icon: Lightbulb },
  ];

  return (
    <div className="flex flex-col gap-3">
      <span className="font-label text-xs text-secondary uppercase tracking-wider">
        Coba tanyakan
      </span>
      <div className="flex flex-wrap gap-2.5">
        {suggestions.map((suggestion, index) => (
          <motion.button
            key={index}
            whileHover={shouldReduceMotion ? {} : { scale: 1.03, y: -1 }}
            whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
            onClick={() => onChipClick(suggestion.text)}
            className="flex items-center gap-2 px-4 py-2.5 border border-border bg-surface text-primary rounded-full text-sm hover:border-tertiary hover:text-tertiary hover:bg-tertiary/5 transition-all duration-200 shadow-warm-xs"
          >
            <suggestion.icon size={14} className="flex-shrink-0 opacity-60" />
            <span>{suggestion.text}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default SuggestionChips;