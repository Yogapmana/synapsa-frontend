import { motion } from 'framer-motion';
import { Lightbulb, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * QuizFeedback — the explanation reveal after an answer.
 *
 * Phase 5.4: rebuilt with editorial treatment.
 *  - Distinct "Why this matters" framing
 *  - Better hierarchy: header → explanation → CTA
 *  - Tone varies subtly (terracotta accent for explanation block)
 */
export function QuizFeedback({ explanation, isLastQuestion, onNext }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="mt-6 rounded-2xl bg-bg-secondary/50 border border-border/60 overflow-hidden"
    >
      {/* Header strip */}
      <div className="flex items-center gap-2.5 px-5 py-3 bg-tertiary/[0.06] border-b border-tertiary/15">
        <Lightbulb className="size-4 text-tertiary" />
        <span className="eyebrow !text-[10px]">Mengapa?</span>
      </div>

      {/* Explanation */}
      {explanation && (
        <p className="px-5 py-4 text-secondary text-sm leading-relaxed font-serif-content">
          {explanation}
        </p>
      )}

      {/* CTA */}
      <div className="px-5 pb-5">
        <Button
          onClick={onNext}
          variant="tertiary"
          className="w-full rounded-xl font-label gap-2 group"
        >
          {isLastQuestion ? (
            <>
              <CheckCircle2 className="size-4" />
              Lihat Hasil
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </>
          ) : (
            <>
              Soal Berikutnya
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}