import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BookOpen, ExternalLink } from "lucide-react";

const SourceAccordion = ({ sources }) => {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-2 w-full max-w-2xl">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="sources" className="border-none">
          <AccordionTrigger className="py-1 text-xs text-slate-500 hover:text-slate-700 hover:no-underline transition-colors">
            <div className="flex items-center gap-1.5 font-medium">
              <BookOpen size={12} />
              <span>Lihat Sumber ({sources.length})</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-2 pt-1">
            <div className="flex flex-col gap-1.5 pl-4 border-l-2 border-slate-100">
              {sources.map((source, index) => (
                <div key={index} className="flex flex-col gap-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-700 truncate">
                      {source.title || "Sumber Tanpa Judul"}
                    </span>
                    {source.relevance_score && (
                      <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded-full text-slate-500 font-mono">
                        {(source.relevance_score * 100).toFixed(0)}% relevan
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                      {source.type || "Document"}
                    </span>
                    {source.url && (
                      <a 
                        href={source.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] text-primary-600 hover:underline flex items-center gap-0.5"
                      >
                        Buka <ExternalLink size={8} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default SourceAccordion;
