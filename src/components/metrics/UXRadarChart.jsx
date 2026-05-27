import React, { useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { submitUxSurvey } from '@/api/metrics';
import { useToast } from '@/hooks/use-toast';

const DIMENSIONS = [
  { key: 'ease_of_use', label: 'Ease of Use' },
  { key: 'material_relevance', label: 'Material Relevance' },
  { key: 'quiz_quality', label: 'Quiz Quality' },
  { key: 'adaptivity_satisfaction', label: 'Adaptivity' },
  { key: 'overall_satisfaction', label: 'Overall' },
];

export function UXRadarChart({ data, hasSubmitted, sessionId, onSurveySubmitted }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const [surveyData, setSurveyData] = useState({
    ease_of_use: 3,
    material_relevance: 3,
    quiz_quality: 3,
    adaptivity_satisfaction: 3,
    overall_satisfaction: 3,
    open_feedback: '',
  });

  // Calculate averages for chart
  const getChartData = () => {
    if (!data || data.length === 0) return DIMENSIONS.map(d => ({ subject: d.label, A: 0, fullMark: 5 }));
    
    return DIMENSIONS.map(dim => {
      const sum = data.reduce((acc, curr) => acc + (curr[dim.key] || 0), 0);
      return {
        subject: dim.label,
        A: sum / data.length,
        fullMark: 5
      };
    });
  };

  const chartData = getChartData();

  const handleSliderChange = (key, val) => {
    setSurveyData(prev => ({ ...prev, [key]: val[0] }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await submitUxSurvey({
        session_id: sessionId || 'default-session',
        ...surveyData
      });
      toast({
        title: "Survey submitted",
        description: "Thank you for your feedback!",
      });
      setOpen(false);
      if (onSurveySubmitted) onSurveySubmitted();
    } catch (err) {
      toast({
        title: "Submission failed",
        description: "There was an error submitting the survey.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" tick={{ fill: 'currentColor', fontSize: 10 }} />
            <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fontSize: 10 }} />
            <Radar name="UX" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      
      {!hasSubmitted && (
        <div className="mt-4 flex justify-center">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Isi Survey Sekarang</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>UX Satisfaction Survey</DialogTitle>
                <DialogDescription>
                  Please rate your experience from 1 (Poor) to 5 (Excellent).
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {DIMENSIONS.map(dim => (
                  <div key={dim.key} className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span>{dim.label}</span>
                      <span>{surveyData[dim.key]}</span>
                    </div>
                    <Slider 
                      value={[surveyData[dim.key]]} 
                      min={1} 
                      max={5} 
                      step={1} 
                      onValueChange={(v) => handleSliderChange(dim.key, v)} 
                    />
                  </div>
                ))}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Feedback (Optional)</label>
                  <textarea 
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    rows={3}
                    value={surveyData.open_feedback}
                    onChange={(e) => setSurveyData(prev => ({ ...prev, open_feedback: e.target.value }))}
                    placeholder="Tell us about your experience..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button disabled={isSubmitting} onClick={handleSubmit}>
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
