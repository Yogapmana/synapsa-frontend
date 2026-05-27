import { motion } from 'framer-motion';

export function QuizFeedback({ explanation, isLastQuestion, onNext }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-100"
    >
      <h4 className="font-semibold text-slate-800 mb-2">Penjelasan:</h4>
      <p className="text-slate-600 mb-6">{explanation}</p>
      
      <button
        onClick={onNext}
        className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors"
      >
        {isLastQuestion ? 'Lihat Hasil' : 'Soal Berikutnya'}
      </button>
    </motion.div>
  );
}
