import { BookOpen, MessageCircle, Clock } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';

export default function ChatHistoryDrawer({
  open,
  onOpenChange,
  topics,
  activeTopicId,
  onTopicSelect,
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[320px] sm:max-w-[320px] bg-surface p-0">
        <SheetHeader className="px-5 pt-6 pb-4 border-b border-border">
          <SheetTitle className="flex items-center gap-2.5 text-primary font-display">
            <div className="w-8 h-8 rounded-lg bg-tertiary/10 flex items-center justify-center">
              <Clock size={16} className="text-tertiary" />
            </div>
            Riwayat Topik
          </SheetTitle>
          <SheetDescription className="text-secondary font-label">
            Pilih topik percakapan
          </SheetDescription>
        </SheetHeader>

        {topics.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-tertiary/10 flex items-center justify-center text-tertiary">
              <BookOpen size={24} />
            </div>
            <p className="text-sm text-secondary max-w-[220px] leading-relaxed">
              Belum ada topik. Mulai sesi belajar untuk membuat kurikulum.
            </p>
          </div>
        ) : (
          <nav className="flex flex-col gap-1 p-3 overflow-y-auto">
            {topics.map((topic) => {
              const isActive = topic.id === activeTopicId;
              return (
                <button
                  key={topic.id}
                  onClick={() => onTopicSelect(topic)}
                  className={`
                    flex items-center gap-3 rounded-xl px-3.5 py-3 text-left
                    transition-all duration-150
                    ${isActive
                      ? 'bg-tertiary/10 text-tertiary border border-tertiary/20 shadow-warm-xs'
                      : 'text-primary hover:bg-neutral border border-transparent'
                    }
                  `}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isActive ? 'bg-tertiary/15' : 'bg-neutral'
                  }`}>
                    <BookOpen size={14} className={isActive ? 'text-tertiary' : 'text-secondary'} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-sm truncate">
                      {topic.title}
                    </span>
                    {isActive && (
                      <span className="text-[11px] text-tertiary font-label mt-0.5">
                        Topik aktif
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        )}
      </SheetContent>
    </Sheet>
  );
}