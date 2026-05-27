import React from 'react';
import { 
  AccordionItem, 
  AccordionTrigger, 
  AccordionContent 
} from '@/components/ui/accordion';
import { TopicNode } from './TopicNode';

export function WeekAccordion({ week, topics }) {
  const completedCount = topics.filter(t => t.status === 'completed').length;
  const totalCount = topics.length;

  return (
    <AccordionItem value={`week-${week.week_number}`} className="bg-white border rounded-xl overflow-hidden mb-4">
      <AccordionTrigger className="px-6 py-4 hover:bg-slate-50 transition-colors hover:no-underline">
        <div className="flex items-center justify-between w-full pr-4">
          <div className="flex flex-col items-start gap-1 text-left">
            <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">
              Minggu {week.week_number}
            </span>
            <h3 className="font-semibold text-lg text-slate-900">
              {week.title}
            </h3>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            <span>{completedCount}/{totalCount} selesai</span>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6 pt-2 border-t">
        <div className="flex flex-col gap-3 mt-4">
          {topics.map((topic) => (
            <TopicNode key={topic.id} topic={topic} />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
