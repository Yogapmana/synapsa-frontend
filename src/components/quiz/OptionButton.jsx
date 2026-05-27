import { motion, useReducedMotion } from 'framer-motion';
import { Check, X } from 'lucide-react';

export function OptionButton({
  option,
  isSelected,
  isCorrect,
  isRevealed,
  onClick,
  disabled
}) {
  const shouldReduceMotion = useReducedMotion();
  const isCorrectSelected = isSelected && isCorrect;
  const isWrongSelected = isSelected && !isCorrect;
  const isMissedCorrect = !isSelected && isCorrect && isRevealed;

  let buttonClass = 'w-full p-4 mb-3 border-2 rounded-xl text-left transition-colors duration-200 relative flex items-center justify-between ';
  
  if (!isRevealed) {
    buttonClass += 'border-slate-200 hover:border-green-500 hover:bg-green-50 bg-white cursor-pointer';
  } else if (isCorrectSelected || isMissedCorrect) {
    buttonClass += 'border-green-500 bg-green-50 cursor-default';
  } else if (isWrongSelected) {
    buttonClass += `border-red-500 bg-red-50 cursor-default ${!shouldReduceMotion ? 'animate-shake' : ''}`;
  } else {
    buttonClass += 'border-slate-200 bg-slate-50 opacity-60 cursor-default';
  }

  const bounceVariants = shouldReduceMotion ? {} : {
    initial: { scale: 1 },
    bounce: {
      scale: [1, 1.03, 1],
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };

  let animation = "initial";
  if (isRevealed && isCorrectSelected) animation = "bounce";

  return (
    <motion.button
      variants={bounceVariants}
      initial="initial"
      animate={animation}
      onClick={() => !disabled && !isRevealed && onClick()}
      disabled={disabled || isRevealed}
      className={buttonClass}
    >
      <span className="text-slate-800 font-medium">{option}</span>
      
      {isRevealed && (isCorrectSelected || isMissedCorrect) && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={shouldReduceMotion ? { duration: 0 } : {}}
          className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0"
        >
          <Check className="w-4 h-4 text-white" strokeWidth={3} />
        </motion.div>
      )}
      
      {isRevealed && isWrongSelected && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={shouldReduceMotion ? { duration: 0 } : {}}
          className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0"
        >
          <X className="w-4 h-4 text-white" strokeWidth={3} />
        </motion.div>
      )}
    </motion.button>
  );
}
