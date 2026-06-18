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
export function QuizCard({
  question,
  currentIndex,
  totalQuestions,
  selectedAnswer,
  isRevealed,
  onSelectOption,
  onNext,
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

        {/* Stepped dots — editorial indicator */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalQuestions }).map((_, i) => {
            const isDone = i < currentIndex || (i === currentIndex && isRevealed)
            const isCurrent = i === currentIndex
            return (
              <span
                key={i}
                className={
                  'h-2 rounded-full transition-all duration-300 ' +
                  (isDone
                    ? 'w-6 bg-tertiary'
                    : isCurrent
                    ? 'w-8 bg-tertiary animate-pulse'
                    : 'w-2 bg-border')
                }
                aria-hidden="true"
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