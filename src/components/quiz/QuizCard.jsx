import ReactMarkdown from 'react-markdown';
import { Progress } from '@/components/ui/progress';
import { OptionButton } from './OptionButton';
import { QuizFeedback } from './QuizFeedback';

export function QuizCard({
  question,
  currentIndex,
  totalQuestions,
  selectedAnswer,
  isRevealed,
  onSelectOption,
  onNext
}) {
  const progressPercent = ((currentIndex + 1) / totalQuestions) * 100;
  
  return (
    <div className="w-full max-w-2xl mx-auto bg-surface rounded-2xl shadow-sm border border-[var(--border)] overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-secondary">
            Soal {currentIndex + 1} dari {totalQuestions}
          </span>
        </div>
        
        <Progress value={progressPercent} className="h-2 mb-8" />
        
        <div className="prose prose-slate max-w-none mb-8">
          <ReactMarkdown>{question.question}</ReactMarkdown>
        </div>
        
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <OptionButton
              key={index}
              option={option}
              isSelected={selectedAnswer === option}
              isCorrect={option === question.correct_answer}
              isRevealed={isRevealed}
              onClick={() => onSelectOption(option)}
              disabled={isRevealed}
            />
          ))}
        </div>
        
        {isRevealed && (
          <QuizFeedback 
            explanation={question.explanation}
            isLastQuestion={currentIndex === totalQuestions - 1}
            onNext={onNext}
          />
        )}
      </div>
    </div>
  );
}
