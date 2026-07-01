import React, { forwardRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

export const PdfExportTemplate = forwardRef(({ module, chatHistory, quizHistory }, ref) => {
  if (!module) return null;

  return (
    <div style={{ display: 'none' }}>
      <div 
        ref={ref} 
        className="p-8 bg-white text-black print-container" 
        style={{ width: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}
      >
        {/* Header */}
        <div className="border-b-2 border-gray-200 pb-4 mb-6 text-center">
          <h1 className="text-3xl font-bold mb-2 text-primary">{module.title}</h1>
          <p className="text-gray-500">Diekspor pada: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div>

        {/* Module Content */}
        <div className="mb-10 page-break-after">
          <h2 className="text-2xl font-bold mb-4 border-b pb-2 text-secondary">Materi Pembelajaran</h2>
          <div className="prose prose-sm max-w-none prose-headings:text-black prose-p:text-gray-800">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
            >
              {module.content_markdown}
            </ReactMarkdown>
          </div>
        </div>

        {/* AI Chat History */}
        {chatHistory && chatHistory.length > 0 && (
          <div className="mb-10 page-break-after">
            <h2 className="text-2xl font-bold mb-4 border-b pb-2 text-secondary">Catatan AI (Tanya Jawab)</h2>
            <div className="flex flex-col gap-4">
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`p-4 rounded-lg ${msg.role === 'user' ? 'bg-gray-100 ml-10 border border-gray-200' : 'bg-blue-50 mr-10 border border-blue-100'}`}>
                  <p className="font-bold text-sm mb-1 text-gray-700">{msg.role === 'user' ? 'Anda' : 'Tutor AI'}</p>
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quiz Summary */}
        {quizHistory && quizHistory.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4 border-b pb-2 text-secondary">Rangkuman Kuis</h2>
            {quizHistory.map((attempt, idx) => (
              <div key={idx} className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="font-bold text-lg mb-2 text-primary">Percobaan {attempt.attempt_number || idx + 1}</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white p-3 rounded shadow-sm">
                    <p className="text-sm text-gray-500">Skor</p>
                    <p className="text-xl font-bold text-green-600">{attempt.score}%</p>
                  </div>
                  <div className="bg-white p-3 rounded shadow-sm">
                    <p className="text-sm text-gray-500">Waktu Pengerjaan</p>
                    <p className="text-xl font-bold">{Math.floor(attempt.time_spent_seconds / 60)}m {attempt.time_spent_seconds % 60}s</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

PdfExportTemplate.displayName = 'PdfExportTemplate';
