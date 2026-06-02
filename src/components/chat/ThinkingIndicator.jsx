import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Leaf } from 'lucide-react';

const ThinkingIndicator = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="flex gap-3 items-center mb-4">
      <div className="w-8 h-8 rounded-full bg-tertiary/10 flex items-center justify-center flex-shrink-0 border border-primary-200">
        <Leaf size={16} className="text-tertiary" />
      </div>
      <div className="flex items-center gap-2">
        <motion.div
          className="w-2 h-2 bg-tertiary/60 rounded-full"
          animate={shouldReduceMotion ? {} : {
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <span className="text-xs text-secondary font-medium">Sedang berpikir...</span>
      </div>
    </div>
  );
};

export default ThinkingIndicator;
