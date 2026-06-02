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
    <div className="flex flex-col gap-3 py-4">
      <span className="text-sm font-medium text-secondary">Coba tanyakan:</span>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <motion.button
            key={index}
            whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
            whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
            onClick={() => onChipClick(suggestion.text)}
            className="flex items-center gap-2 px-4 py-2 bg-surface border border-[var(--border)] rounded-full text-sm text-primary hover:border-tertiary/40 hover:bg-tertiary/5 hover:text-tertiary transition-colors shadow-sm"
          >
            <suggestion.icon size={14} className="flex-shrink-0" />
            {suggestion.text}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default SuggestionChips;
