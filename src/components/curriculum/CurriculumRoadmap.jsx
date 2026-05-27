import React, { useMemo } from 'react';
import { Accordion } from '@/components/ui/accordion';
import { WeekAccordion } from './WeekAccordion';

export function CurriculumRoadmap({ weeks, topics }) {
  const topicsByWeek = useMemo(() => {
    const grouped = {};
    topics.forEach(topic => {
      if (!grouped[topic.week_number]) {
        grouped[topic.week_number] = [];
      }
      grouped[topic.week_number].push(topic);
    });
    
    Object.keys(grouped).forEach(week => {
      grouped[week].sort((a, b) => a.day_number - b.day_number);
    });
    
    return grouped;
  }, [topics]);

  const activeWeekNumber = useMemo(() => {
    const activeTopic = topics.find(t => t.status === 'active' || t.status === 'review');
    return activeTopic ? activeTopic.week_number : (weeks[0]?.week_number || 1);
  }, [topics, weeks]);

  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      <Accordion 
        type="single" 
        collapsible 
        defaultValue={`week-${activeWeekNumber}`}
        className="w-full space-y-4"
      >
        {weeks.map((week) => (
          <WeekAccordion 
            key={week.week_number} 
            week={week} 
            topics={topicsByWeek[week.week_number] || []} 
          />
        ))}
      </Accordion>
    </div>
  );
}
