import React from 'react';
import { RefreshCcw, X, Target, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FeedbackBanner({ title, message, action, isVisible, onDismiss }) {
  let Icon = RefreshCcw;
  let bgClass = "bg-tertiary/5 border-tertiary/20";
  let textClass = "text-tertiary";
  
  if (action === "repeat" || action === "review") {
    Icon = AlertTriangle;
    bgClass = "bg-amber-500/10 border-amber-500/20";
    textClass = "text-amber-600";
  } else if (action === "accelerate") {
    Icon = Target;
    bgClass = "bg-emerald-500/10 border-emerald-500/20";
    textClass = "text-emerald-600";
  }

  return (
    <AnimatePresence>
      {isVisible && message && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0, scale: 0.95 }}
          className="mb-8 overflow-hidden"
        >
          <div className={`border rounded-xl p-4 flex gap-4 items-start shadow-sm ${bgClass}`}>
            <div className="mt-0.5">
              <Icon className={`w-5 h-5 ${textClass}`} />
            </div>
            
            <div className="flex-1">
              <h4 className={`text-sm font-bold mb-1 ${textClass}`}>
                {title || "Jadwal diperbarui oleh Planner Agent"}
              </h4>
              <p className="text-sm text-secondary leading-relaxed">
                {message}
              </p>
            </div>
            
            <button 
              onClick={onDismiss}
              className="text-tertiary hover:text-tertiary transition-colors p-1 rounded-md hover:bg-amber-200/50"
              aria-label="Tutup pesan"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
