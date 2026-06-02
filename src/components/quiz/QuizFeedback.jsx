import { motion } from 'framer-motion';

export function QuizFeedback({ explanation, isLastQuestion, onNext }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 p-4 rounded-xl bg-neutral border border-[var(--border)]"
    >
      <h4 className="font-semibold text-primary mb-2">Penjelasan:</h4>
      <p className="text-secondary mb-6">{explanation}</p>
      
      <button
        onClick={onNext}
        className="w-full py-3 px-4 bg-tertiary-dark hover:bg-tertiary-dark text-white font-medium rounded-xl transition-colors"
      >
        {isLastQuestion ? 'Lihat Hasil' : 'Soal Berikutnya'}
      </button>
    </motion.div>
  );
}
