import React from 'react';
import { RefreshCcw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FeedbackBanner({ message, isVisible, onDismiss }) {
  return (
    <AnimatePresence>
      {isVisible && message && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0, scale: 0.95 }}
          className="mb-8 overflow-hidden"
        >
          <div className="bg-[#fef3c7] dark:bg-amber-900/30 border border-[#fde68a] dark:border-amber-700/50 rounded-xl p-4 flex gap-4 items-start shadow-sm">
            <div className="mt-0.5">
              <RefreshCcw className="w-5 h-5 text-amber-600 dark:text-amber-500" />
            </div>
            
            <div className="flex-1">
              <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200 mb-1">
                Jadwal diperbarui oleh Planner Agent
              </h4>
              <p className="text-sm text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
                {message}
              </p>
            </div>
            
            <button 
              onClick={onDismiss}
              className="text-amber-500 hover:text-amber-700 dark:hover:text-amber-300 transition-colors p-1 rounded-md hover:bg-amber-200/50 dark:hover:bg-amber-800/50"
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
