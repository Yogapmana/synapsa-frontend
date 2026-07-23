import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import { OptionButton } from './OptionButton';
import { QuizFeedback } from './QuizFeedback';

/**
 * QuizCard — the quiz question card.
 *
 * Phase 5.4: rebuilt with editorial treatment.
 *  - Big numeric question counter (replaces the small "Soal X dari Y")
 *  - Visual progress with stepped dots (editorial feel)
 *  - Decorative serif numeral watermark
 *  - Better hierarchy: counter → question → options
 *  - Smooth question transitions with framer-motion
 */
function dotClass(status, isCurrent) {
  // status: 'correct' | 'wrong' | 'pending'
  if (status === 'correct') {
    return 'w-6 bg-success'
  }
  if (status === 'wrong') {
    return 'w-6 bg-danger'
  }
  if (isCurrent) {
    return 'w-8 bg-tertiary animate-pulse'
  }
  return 'w-2 bg-border'
}

export function QuizCard({
  question,
  currentIndex,
  totalQuestions,
  selectedAnswer,
  isRevealed,
  onSelectOption,
  onNext,
  /** per-index: 'correct' | 'wrong' | 'pending' — for progress dots */
  answerStatuses = [],
}) {
  const progressPercent = ((currentIndex + 1) / totalQuestions) * 100;

  return (
    <motion.div
      key={`question-${currentIndex}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-2xl mx-auto relative"
    >
      {/* Editorial progress header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-baseline gap-3">
          <span className="font-display text-5xl font-black italic text-tertiary leading-none tabular-nums">
            {String(currentIndex + 1).padStart(2, '0')}
          </span>
          <span className="text-sm font-label uppercase tracking-widest text-secondary">
            dari {totalQuestions}
          </span>
        </div>

        {/* Stepped dots — green correct, red wrong, pulse current */}
        <div
          className="flex items-center gap-1.5"
          role="list"
          aria-label="Status jawaban per soal"
        >
          {Array.from({ length: totalQuestions }).map((_, i) => {
            const isCurrent = i === currentIndex
            let status = answerStatuses[i] || 'pending'
            // Current question only counts after reveal
            if (isCurrent && !isRevealed) status = 'pending'
            return (
              <span
                key={i}
                role="listitem"
                title={
                  status === 'correct'
                    ? `Soal ${i + 1}: benar`
                    : status === 'wrong'
                    ? `Soal ${i + 1}: salah`
                    : isCurrent
                    ? `Soal ${i + 1}: sedang dikerjakan`
                    : `Soal ${i + 1}: belum dijawab`
                }
                className={
                  'h-2 rounded-full transition-all duration-300 ' +
                  dotClass(status, isCurrent)
                }
                aria-label={
                  status === 'correct'
                    ? `Soal ${i + 1} benar`
                    : status === 'wrong'
                    ? `Soal ${i + 1} salah`
                    : isCurrent
                    ? `Soal ${i + 1} aktif`
                    : `Soal ${i + 1} belum`
                }
              />
            )
          })}
        </div>
      </div>

      {/* Question card */}
      <div className="relative card-hero p-6 md:p-8 overflow-hidden">
        {/* Decorative numeral */}
        <span
          aria-hidden="true"
          className="absolute -top-4 -right-2 font-display text-[7rem] font-black italic text-tertiary/[0.05] leading-none pointer-events-none select-none"
        >
          Q
        </span>

        {/* Progress bar at the top of the card */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-bg-tertiary/40">
          <motion.div
            className="h-full bg-tertiary"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>

        <div className="relative z-10">
          {/* Question text */}
          <div className="prose prose-stone max-w-none mb-7 font-serif-content leading-[1.7]">
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p className="text-lg md:text-xl text-primary font-medium leading-snug">
                    {children}
                  </p>
                ),
                strong: ({ children }) => (
                  <strong className="font-bold text-primary">{children}</strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-tertiary">{children}</em>
                ),
              }}
            >
              {question.question}
            </ReactMarkdown>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {question.options.map((option, index) => (
              <OptionButton
                key={index}
                option={option}
                index={index}
                isSelected={selectedAnswer === option}
                isCorrect={option === question.correct_answer}
                isRevealed={isRevealed}
                onClick={() => onSelectOption(option)}
                disabled={isRevealed}
              />
            ))}
          </div>

          {/* Feedback (revealed) */}
          {isRevealed && (
            <QuizFeedback
              explanation={question.explanation}
              isLastQuestion={currentIndex === totalQuestions - 1}
              onNext={onNext}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}