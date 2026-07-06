import React, { useRef, useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { getHistory } from '@/api/chat';
import { getQuizHistoryByTopic } from '@/api/quiz';
import { PdfExportTemplate } from './PdfExportTemplate';

import { cn } from '@/lib/utils';

export const PdfExportButton = ({ module, sessionId, topicId, className }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [chatHistory, setChatHistory] = useState(null);
  const [quizHistory, setQuizHistory] = useState(null);
  
  const templateRef = useRef(null);

  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);

    try {
      // Fetch the data if not already fetched
      let currentChat = chatHistory;
      let currentQuiz = quizHistory;
      
      if (!currentChat) {
        currentChat = await getHistory(sessionId, topicId);
        setChatHistory(currentChat);
      }
      
      if (!currentQuiz) {
        const quizData = await getQuizHistoryByTopic(sessionId, topicId);
        // The API returns { topic_id, topic_title, attempts: [...] }
        currentQuiz = quizData?.attempts || [];
        setQuizHistory(currentQuiz);
      }

      // Allow state to propagate and React to render the hidden template
      setTimeout(() => {
        if (!templateRef.current) {
          console.error("Template ref is null");
          setIsExporting(false);
          return;
        }

        const element = templateRef.current;
        const opt = {
          margin: [10, 10, 10, 10], // top, left, bottom, right
          filename: `${module.title} - Synapsa.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf()
          .set(opt)
          .from(element)
          .save()
          .then(() => setIsExporting(false))
          .catch(err => {
            console.error('Error generating PDF:', err);
            setIsExporting(false);
          });
      }, 500); // 500ms delay to ensure the DOM is fully rendered with new state
      
    } catch (error) {
      console.error('Failed to fetch data for export:', error);
      setIsExporting(false);
    }
  };

  return (
    <>
      <button
        onClick={handleExport}
        disabled={isExporting}
        className={cn(
          "flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:text-primary transition-colors disabled:opacity-50",
          className
        )}
      >
        {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
        <span className="hidden sm:inline">{isExporting ? 'Memproses...' : 'Ekspor PDF'}</span>
      </button>

      {/* Hidden template for PDF generation */}
      {(isExporting || chatHistory || quizHistory) && (
        <PdfExportTemplate 
          ref={templateRef} 
          module={module} 
          chatHistory={chatHistory} 
          quizHistory={quizHistory} 
        />
      )}
    </>
  );
};
