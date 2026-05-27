import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const SuggestionChips = ({ topicTitle, onChipClick }) => {
  const shouldReduceMotion = useReducedMotion();
  const suggestions = [
    `Apa itu ${topicTitle}?`,
    `Jelaskan ${topicTitle}`,
    `Bagaimana cara kerja ${topicTitle}?`,
  ];

  return (
    <div className="flex flex-wrap gap-2 py-4">
      {suggestions.map((suggestion, index) => (
        <motion.button
          key={index}
          whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
          whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
          onClick={() => onChipClick(suggestion)}
          className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm text-slate-700 hover:border-primary-400 hover:text-primary-700 transition-colors shadow-sm"
        >
          {suggestion}
        </motion.button>
      ))}
    </div>
  );
};

export default SuggestionChips;
