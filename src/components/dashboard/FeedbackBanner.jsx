import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Repeat, BookOpen, Zap, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';

/**
 * FeedbackBanner — the adaptive learning feedback callout.
 *
 * Phase 5.3: rebuilt with editorial treatment.
 *  - Distinct tone (success/warning/info) per action
 *  - Decorative serif italic quote/eyebrow for personality
 *  - Inline action chips for quick navigation
 *  - Smooth enter/exit animation
 */

const ACTION_CONFIG = {
  repeat: {
    eyebrow: 'Pemahaman perlu ditingkatkan',
    icon: Repeat,
    tone: 'warning',
    bgClass: 'bg-gradient-to-br from-warning/[0.08] via-warning/[0.03] to-transparent',
    borderClass: 'border-warning/30',
    iconBg: 'bg-warning/15 text-warning-fg',
    accentText: 'text-warning-fg',
  },
  review: {
    eyebrow: 'Sesi review ditambahkan',
    icon: BookOpen,
    tone: 'info',
    bgClass: 'bg-gradient-to-br from-info/[0.08] via-info/[0.03] to-transparent',
    borderClass: 'border-info/30',
    iconBg: 'bg-info/15 text-info-fg',
    accentText: 'text-info-fg',
  },
  accelerate: {
    eyebrow: 'Anda sangat cepat!',
    icon: Zap,
    tone: 'success',
    bgClass: 'bg-gradient-to-br from-success/[0.08] via-success/[0.03] to-transparent',
    borderClass: 'border-success/30',
    iconBg: 'bg-success-light text-success-fg',
    accentText: 'text-success-fg',
  },
};

export default function FeedbackBanner({
  title,
  message,
  action,
  isVisible,
  onDismiss,
  onAction,
}) {
  const config = action ? ACTION_CONFIG[action] : null;

  return (
    <AnimatePresence>
      {isVisible && config && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8, height: 0, marginTop: 0, paddingTop: 0, paddingBottom: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className={`relative overflow-hidden rounded-2xl border ${config.borderClass} ${config.bgClass} p-5 md:p-6`}
        >
          {/* Decorative numeral */}
          <span
            aria-hidden="true"
            className={`absolute -top-3 -right-2 font-display text-6xl font-black italic leading-none pointer-events-none select-none ${config.accentText} opacity-[0.06]`}
          >
            ✦
          </span>

          <div className="relative flex items-start gap-4">
            {/* Icon */}
            <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${config.iconBg}`}>
              <config.icon className="size-5" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className={`eyebrow !text-[10px] mb-1 ${config.accentText}`}>
                {config.eyebrow}
              </p>
              <h3 className="font-display font-bold text-lg text-primary leading-tight mb-1">
                {title}
              </h3>
              <p className="text-sm text-secondary leading-relaxed font-serif-content">
                {message}
              </p>

              {onAction && (
                <div className="mt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onAction}
                    className={`rounded-lg ${config.accentText} hover:bg-surface/40 font-label gap-1 pl-0`}
                  >
                    Lanjut sekarang
                    <ChevronRight className="size-3.5" />
                  </Button>
                </div>
              )}
            </div>

            {/* Dismiss */}
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Tutup notifikasi"
              className="flex size-7 shrink-0 items-center justify-center rounded-lg text-secondary/60 hover:text-primary hover:bg-surface/60 transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}