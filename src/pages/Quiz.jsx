import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuiz, useSubmitQuiz } from '@/hooks/useQuiz';
import { useToast } from '@/hooks/use-toast';
import { useLearningStore } from '@/stores/learningStore';
import { QuizCard } from '@/components/quiz/QuizCard';
import { QuizResult } from '@/components/quiz/QuizResult';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Quiz() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { activeSession } = useLearningStore();
  
  const { data: quizData, isLoading, error, refetch } = useQuiz(topicId, 5);
  const submitQuiz = useSubmitQuiz();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [quizState, setQuizState] = useState('answering');
  const [isRevealed, setIsRevealed] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    if (quizData && !startTime) {
      setStartTime(Date.now());
    }
  }, [quizData, startTime]);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !quizData) {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] items-center justify-center text-center p-4">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Gagal Memuat Kuis</h2>
        <p className="text-slate-600 mb-4">Terjadi kesalahan saat mengambil data kuis.</p>
        <Button onClick={() => refetch()}>Coba Lagi</Button>
      </div>
    );
  }

  const handleSelectOption = (option) => {
    if (isRevealed) return;
    
    const questionId = quizData.questions[currentIndex].id || currentIndex;
    
    setAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));
    
    setIsRevealed(true);
    setQuizState('feedback');
  };

  const handleNext = async () => {
    if (currentIndex < quizData.questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsRevealed(false);
      setQuizState('answering');
    } else {
      await handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setQuizState('submitting');
    const timeSpentSeconds = Math.floor((Date.now() - startTime) / 1000);
    
    const formattedAnswers = quizData.questions.map((q, i) => ({
      question_index: i,
      selected_answer: answers[q.id || i] || ""
    }));

    try {
      const sessionId = activeSession?.id || 'current-session';
      const res = await submitQuiz.mutateAsync({
        session_id: sessionId,
        topic_id: topicId,
        answers: formattedAnswers,
        time_spent_seconds: timeSpentSeconds,
        questions_data: quizData.questions
      });
      
      setQuizResult(res);
      setQuizState('result');
    } catch (err) {
      toast({
        title: "Gagal mengirim kuis",
        description: "Silakan coba beberapa saat lagi.",
        variant: "destructive"
      });
      setQuizState('feedback');
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setAnswers({});
    setQuizState('answering');
    setIsRevealed(false);
    setQuizResult(null);
    setStartTime(Date.now());
    refetch();
  };

  if (quizState === 'result' && quizResult) {
    const formattedQuestions = quizData.questions.map((q, i) => ({
      ...q,
      user_answer: answers[q.id || i] || null
    }));

    return (
      <div className="container py-8 max-w-4xl mx-auto">
        <QuizResult 
          result={quizResult}
          questions={formattedQuestions}
          topicId={topicId}
          sessionId={activeSession?.id}
          onRetry={handleRetry}
        />
      </div>
    );
  }

  const currentQuestion = quizData.questions[currentIndex];

  return (
    <div className="container py-8 max-w-4xl mx-auto flex flex-col items-center">
      {quizState === 'submitting' ? (
        <div className="flex flex-col items-center justify-center space-y-4 py-12">
          <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
          <p className="text-slate-600 font-medium">Menghitung skor...</p>
        </div>
      ) : (
        <QuizCard 
          question={currentQuestion}
          currentIndex={currentIndex}
          totalQuestions={quizData.total_questions || quizData.questions.length}
          selectedAnswer={answers[currentQuestion.id || currentIndex]}
          isRevealed={isRevealed}
          onSelectOption={handleSelectOption}
          onNext={handleNext}
        />
      )}
    </div>
  );
}
