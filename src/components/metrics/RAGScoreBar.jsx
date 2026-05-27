import React from 'react';
import { Progress } from '@/components/ui/progress';

export function RAGScoreBar({ metrics }) {
  if (!metrics) return null;

  const getColor = (score) => {
    if (score >= 0.8) return 'bg-green-500';
    if (score >= 0.6) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const data = [
    { label: 'Faithfulness', value: metrics.faithfulness || 0 },
    { label: 'Answer Relevancy', value: metrics.answer_relevancy || 0 },
    { label: 'Context Recall', value: metrics.context_recall || 0 },
    { label: 'Context Precision', value: metrics.context_precision || 0 },
    { label: 'Answer Correctness', value: metrics.answer_correctness || 0 },
  ];

  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="font-medium">{item.label}</span>
            <span>{item.value.toFixed(2)}</span>
          </div>
          <Progress 
            value={item.value * 100} 
            indicatorClassName={getColor(item.value)} 
          />
        </div>
      ))}
    </div>
  );
}
