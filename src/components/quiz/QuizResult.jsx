import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { QUIZ_FEEDBACK } from '@/utils/constants';
import { ConfettiEffect } from './ConfettiEffect';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCompleteTopic } from '@/hooks/useLearning';

export function QuizResult({ result, questions, topicId, sessionId, onRetry }) {
  const navigate = useNavigate();
  const completeTopic = useCompleteTopic();
  const { percentage, correct_answers, total_questions } = result;
  
  const feedback = QUIZ_FEEDBACK.find(
    (f) => percentage >= f.min && percentage <= f.max
  ) || QUIZ_FEEDBACK[QUIZ_FEEDBACK.length - 1];

  const isPassed = percentage >= 75;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-2xl mx-auto space-y-6"
    >
      {isPassed && <ConfettiEffect />}
      
      <Card className="text-center border-none shadow-md overflow-hidden">
        <div className="h-2 w-full bg-neutral" />
        <CardContent className="pt-8 pb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-6 bg-neutral border-4 border-primary-100"
          >
            <div className="text-4xl font-bold text-tertiary">
              {percentage}%
            </div>
          </motion.div>

          <h2 className="text-2xl font-bold text-primary mb-2">{feedback.title}</h2>
          <p className="text-secondary mb-6">{feedback.message}</p>
          
          <div className="inline-flex items-center justify-center px-4 py-2 bg-neutral rounded-full text-primary font-medium mb-8">
            Kamu menjawab benar {correct_answers} dari {total_questions} soal
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate(`/module/${topicId}`)}
              className="w-full"
            >
              Kembali ke Materi
            </Button>
            <Button
              size="lg"
              onClick={async () => {
                if (sessionId) {
                  await completeTopic.mutateAsync({ sessionId, topicId });
                }
                navigate('/curriculum');
              }}
              className="w-full"
            >
              Lanjut Topik Berikutnya
            </Button>
            <Button
              variant="ghost"
              onClick={onRetry}
              className="w-full sm:col-span-2"
            >
              Ulangi Kuis
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-[var(--border)] shadow-sm">
        <CardContent className="p-6">
          <h3 className="font-semibold text-lg text-primary mb-4">Pembahasan Soal</h3>
          
          <div className="space-y-3">
            {questions.map((q, index) => {
              const isCorrect = q.user_answer === q.correct_answer;
              return (
                <Collapsible key={index} className="border border-[var(--border)] rounded-xl overflow-hidden">
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-surface hover:bg-surface transition-colors">
                    <div className="flex items-center gap-3 text-left">
                      {isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-tertiary flex-shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      )}
                      <span className="font-medium text-primary line-clamp-1">
                        Soal {index + 1}: {q.question.substring(0, 50)}...
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-secondary/70" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="p-4 bg-neutral border-t border-[var(--border)]">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-semibold text-secondary mb-1">Pertanyaan:</p>
                        <p className="text-primary">{q.question}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 bg-surface rounded-lg border border-red-100">
                          <p className="text-xs font-semibold text-secondary mb-1">Jawaban Kamu:</p>
                          <p className={isCorrect ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                            {q.user_answer || 'Tidak dijawab'}
                          </p>
                        </div>
                        
                        {!isCorrect && (
                          <div className="p-3 bg-surface rounded-lg border border-green-100">
                            <p className="text-xs font-semibold text-secondary mb-1">Jawaban Benar:</p>
                            <p className="text-green-600 font-medium">{q.correct_answer}</p>
                          </div>
                        )}
                      </div>
                      
                      {q.explanation && (
                        <div className="pt-2">
                          <p className="text-sm font-semibold text-secondary mb-1">Penjelasan:</p>
                          <p className="text-primary text-sm">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
