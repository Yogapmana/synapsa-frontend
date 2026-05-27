import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const ThinkingIndicator = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="flex flex-col gap-2 py-2">
      <div className="flex gap-1.5 px-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-primary-400 rounded-full"
            animate={shouldReduceMotion ? {} : {
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      <p className="text-xs text-slate-500 font-medium ml-1">
        PLA sedang berpikir...
      </p>
    </div>
  );
};

export default ThinkingIndicator;
