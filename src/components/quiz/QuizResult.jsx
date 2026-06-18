import { useState, useEffect } from 'react';
import { motion, useReducedMotion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, ChevronDown, ChevronUp, Sparkles, Trophy, RefreshCw, BookOpen } from 'lucide-react';
import { QUIZ_FEEDBACK } from '@/utils/constants';
import { ConfettiEffect } from './ConfettiEffect';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCompleteTopic } from '@/hooks/useLearning';

/**
 * QuizResult — the final score reveal.
 *
 * Phase 5.4: rebuilt with dramatic count-up + editorial framing.
 *  - Animated score counter (count-up from 0 → percentage)
 *  - Distinct verdict per tier (Lulus / Bagus / Lanjutkan)
 *  - Decorative serif numerals as background flourish
 *  - Smooth staggered reveal of all elements
 *  - Bigger celebratory moment for passing
 */
export function QuizResult({ result, questions, topicId, sessionId, onRetry }) {
  const navigate = useNavigate();
  const completeTopic = useCompleteTopic();
  const { percentage, correct_answers, total_questions } = result;
  const shouldReduceMotion = useReducedMotion();

  const feedback =
    QUIZ_FEEDBACK.find((f) => percentage >= f.min && percentage <= f.max) ||
    QUIZ_FEEDBACK[QUIZ_FEEDBACK.length - 1];

  const isPassed = percentage >= 60;

  // Animated score counter
  const count = useMotionValue(0)
  const rounded = useTransform(count, (latest) => Math.round(latest))
  const [displayScore, setDisplayScore] = useState(0)

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayScore(percentage)
      return
    }
    const controls = animate(count, percentage, {
      duration: 1.6,
      ease: [0.16, 1, 0.3, 1],
    })
    const unsub = rounded.on('change', (v) => setDisplayScore(v))
    return () => {
      controls.stop()
      unsub()
    }
  }, [percentage, count, rounded, shouldReduceMotion])

  // Tier color logic
  const tierTone = isPassed
    ? {
        ringColor: 'border-tertiary',
        textGradient: 'text-gradient-tertiary',
        iconBg: 'bg-tertiary/10 text-tertiary',
        icon: Trophy,
        bgClass: 'bg-gradient-to-br from-tertiary/[0.06] via-warning/[0.02] to-transparent',
      }
    : {
        ringColor: 'border-warning',
        textGradient: 'text-gradient-tertiary',
        iconBg: 'bg-warning/15 text-warning-fg',
        icon: BookOpen,
        bgClass: 'bg-gradient-to-br from-warning/[0.06] via-surface to-transparent',
      }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-2xl mx-auto space-y-6 relative"
    >
      {isPassed && <ConfettiEffect />}

      {/* Decorative numeral — the "result page mark" */}
      <span
        aria-hidden="true"
        className="absolute -top-12 -right-4 deco-num deco-num-secondary hidden md:block"
      >
        ✦
      </span>

      {/* Main score card */}
      <Card className={`relative border-none shadow-warm-lg overflow-hidden ${tierTone.bgClass}`}>
        {/* Top accent strip */}
        <div className="h-1.5 w-full bg-tertiary" />

        <CardContent className="pt-10 pb-8 px-6 md:px-10 relative">
          {/* Decorative numeral watermark */}
          <span
            aria-hidden="true"
            className="absolute -top-4 -right-2 font-display text-[10rem] font-black italic text-tertiary/[0.05] leading-none pointer-events-none select-none"
          >
            %
          </span>

          {/* Score circle — animated */}
          <div className="relative mx-auto mb-7 w-fit">
            {/* Animated SVG ring */}
            <svg
              className="absolute -inset-2"
              width="180"
              height="180"
              viewBox="0 0 180 180"
              aria-hidden="true"
            >
              <circle
                cx="90"
                cy="90"
                r="84"
                fill="none"
                stroke="rgb(196, 37, 28)"
                strokeOpacity="0.1"
                strokeWidth="3"
              />
              <motion.circle
                cx="90"
                cy="90"
                r="84"
                fill="none"
                stroke="rgb(196, 37, 28)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 84}
                initial={{ strokeDashoffset: 2 * Math.PI * 84 }}
                animate={{
                  strokeDashoffset: 2 * Math.PI * 84 * (1 - percentage / 100),
                }}
                transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                transform="rotate(-90 90 90)"
              />
            </svg>

            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: 'spring',
                stiffness: 220,
                damping: 18,
                delay: 0.3,
              }}
              className={`relative w-40 h-40 rounded-full flex items-center justify-center bg-surface border-4 ${tierTone.ringColor}`}
            >
              <div className="text-center">
                <div className={`font-display text-5xl font-black leading-none ${tierTone.textGradient} tabular-nums`}>
                  {displayScore}
                </div>
                <div className="font-label text-xs uppercase tracking-widest text-secondary mt-1">
                  persen
                </div>
              </div>
            </motion.div>
          </div>

          {/* Verdict */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="text-center space-y-2.5 mb-7"
          >
            <div className="flex justify-center">
              <span className="eyebrow">
                {isPassed ? 'Selamat!' : 'Hampir!'}
              </span>
            </div>
            <h2 className="text-3xl font-display font-bold text-primary leading-tight tracking-tight">
              {feedback.title}
            </h2>
            <p className="text-secondary max-w-md mx-auto leading-relaxed font-serif-content">
              {feedback.message}
            </p>
          </motion.div>

          {/* Score summary chip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-surface border border-border/60 text-primary text-sm font-medium font-label mb-8 mx-auto w-fit flex"
          >
            <Sparkles className="size-3.5 text-tertiary" />
            Benar {correct_answers} dari {total_questions} soal
          </motion.div>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate(`/module/${topicId}`)}
              className="w-full rounded-xl font-label"
            >
              <BookOpen className="size-4" />
              Kembali ke Materi
            </Button>
            <Button
              size="lg"
              variant="tertiary"
              onClick={async () => {
                if (sessionId) {
                  await completeTopic.mutateAsync({ sessionId, topicId });
                }
                navigate('/curriculum');
              }}
              disabled={!isPassed}
              className="w-full rounded-xl font-label gap-2 shadow-warm-md"
            >
              {isPassed
                ? 'Lanjut Topik Berikutnya'
                : 'Lulus Kuis (Min 60%) untuk Lanjut'}
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={onRetry}
              className="w-full sm:col-span-2 rounded-xl font-label gap-2"
            >
              <RefreshCw className="size-4" />
              Ulangi Kuis
            </Button>
          </motion.div>
        </CardContent>
      </Card>

      {/* Question review */}
      <Card className="border-[var(--border)] shadow-warm-sm">
        <CardContent className="p-6">
          <div className="flex items-baseline justify-between mb-4">
            <h3 className="font-display font-bold text-lg text-primary">
              Pembahasan Soal
            </h3>
            <span className="font-label text-[10px] uppercase tracking-widest text-secondary">
              {questions.length} soal
            </span>
          </div>

          <div className="space-y-2.5">
            {questions.map((q, index) => {
              const isCorrect = q.user_answer === q.correct_answer
              return (
                <Collapsible
                  key={index}
                  className="border border-[var(--border)] rounded-xl overflow-hidden"
                >
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-surface hover:bg-bg-secondary/40 transition-colors">
                    <div className="flex items-center gap-3 text-left min-w-0">
                      {isCorrect ? (
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-success-light">
                          <CheckCircle2 className="w-4 h-4 text-success-fg" />
                        </span>
                      ) : (
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-danger-light">
                          <XCircle className="w-4 h-4 text-danger-fg" />
                        </span>
                      )}
                      <span className="font-label text-xs uppercase tracking-wider text-secondary">
                        Soal {index + 1}
                      </span>
                      <span className="font-medium text-primary line-clamp-1 text-sm">
                        {q.question.substring(0, 50)}
                        {q.question.length > 50 && '…'}
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-secondary/70 shrink-0" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="p-4 bg-neutral border-t border-[var(--border)]">
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-label uppercase tracking-wider text-secondary mb-1">
                          Pertanyaan
                        </p>
                        <p className="text-primary font-serif-content leading-relaxed">
                          {q.question}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div
                          className={`p-3 rounded-lg border ${
                            isCorrect
                              ? 'bg-success-light/50 border-success/30'
                              : 'bg-danger-light/50 border-danger/30'
                          }`}
                        >
                          <p className="text-[10px] font-label uppercase tracking-widest text-secondary mb-1">
                            Jawaban kamu
                          </p>
                          <p
                            className={`font-medium ${
                              isCorrect ? 'text-success-fg' : 'text-danger-fg'
                            }`}
                          >
                            {q.user_answer || 'Tidak dijawab'}
                          </p>
                        </div>

                        {!isCorrect && (
                          <div className="p-3 rounded-lg border bg-success-light/50 border-success/30">
                            <p className="text-[10px] font-label uppercase tracking-widest text-secondary mb-1">
                              Jawaban benar
                            </p>
                            <p className="font-medium text-success-fg">
                              {q.correct_answer}
                            </p>
                          </div>
                        )}
                      </div>

                      {q.explanation && (
                        <div>
                          <p className="text-[10px] font-label uppercase tracking-widest text-secondary mb-1">
                            Penjelasan
                          </p>
                          <p className="text-primary text-sm font-serif-content leading-relaxed">
                            {q.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}