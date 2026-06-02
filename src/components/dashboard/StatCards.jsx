import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export function StatCard({ label, value, subtext }) {
  const shouldReduceMotion = useReducedMotion();
  const hoverProps = shouldReduceMotion ? {} : {
    whileHover: { y: -2, boxShadow: '0 8px 20px rgba(34,197,94,0.2)' },
  };
  const tapProps = shouldReduceMotion ? {} : {
    whileTap: { scale: 0.98 }
  };

  return (
    <motion.div
      variants={item}
      {...hoverProps}
      {...tapProps}
      className="bg-surface border border-[var(--border)] rounded-xl p-5 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary rounded-full" />
      
      <div className="text-[13px] font-medium text-secondary mb-2">
        {label}
      </div>
      <div className="text-[32px] font-bold text-primary leading-none font-variant-numeric: tabular-nums">
        {value}
      </div>
      {subtext && (
        <div className="text-xs text-secondary/70 mt-2 font-medium">
          {subtext}
        </div>
      )}
    </motion.div>
  );
}

export default function StatCards({ stats = [] }) {
  if (!stats.length) return null;
  
  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
    >
      {stats.map((stat, idx) => (
        <StatCard 
          key={idx}
          label={stat.label}
          value={stat.value}
          subtext={stat.subtext}
        />
      ))}
    </motion.div>
  );
}
