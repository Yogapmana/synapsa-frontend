import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Leaf } from 'lucide-react';

const ThinkingIndicator = () => {
  const shouldReduceMotion = useReducedMotion();

  const dotVariants = shouldReduceMotion
    ? {}
    : {
        animate: {
          y: [0, -6, 0],
          opacity: [0.4, 1, 0.4],
        },
        transition: {
          duration: 1.2,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      };

  return (
    <div className="flex gap-3 items-start mb-5">
      <div className="w-9 h-9 rounded-full bg-tertiary/10 border border-tertiary/20 flex items-center justify-center flex-shrink-0">
        <Leaf size={16} className="text-tertiary" />
      </div>
      <div className="bg-surface border border-border rounded-2xl rounded-tl-sm px-5 py-4">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-2 h-2 bg-secondary/60 rounded-full"
              {...dotVariants}
              transition={{
                ...(dotVariants.transition || {}),
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThinkingIndicator;