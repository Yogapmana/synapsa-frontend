import { BookOpen, MessageCircle } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"

export default function ChatHistoryDrawer({
  open,
  onOpenChange,
  topics,
  activeTopicId,
  onTopicSelect,
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[320px] sm:max-w-[320px] bg-surface">
        <SheetHeader className="mb-4">
          <SheetTitle className="flex items-center gap-2 text-primary">
            <MessageCircle className="size-5" />
            Riwayat Topik
          </SheetTitle>
          <SheetDescription className="text-secondary">
            Pilih topik percakapan
          </SheetDescription>
        </SheetHeader>

        {topics.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <BookOpen className="size-10 text-secondary/40" />
            <p className="text-sm text-secondary/70 max-w-[220px]">
              Belum ada topik. Mulai sesi belajar untuk membuat kurikulum.
            </p>
          </div>
        ) : (
          <nav className="flex flex-col gap-1">
            {topics.map((topic) => {
              const isActive = topic.id === activeTopicId
              return (
                <button
                  key={topic.id}
                  onClick={() => onTopicSelect(topic)}
                  className={`
                    flex items-center gap-3 rounded-lg px-3 py-2.5 text-left
                    transition-colors duration-150
                    ${
                      isActive
                        ? "bg-tertiary/10 text-tertiary border-l-2 border-tertiary"
                        : "text-primary hover:bg-neutral"
                    }
                  `}
                >
                  <BookOpen className="size-4 shrink-0 opacity-60" />
                  <span className="font-semibold text-sm truncate">
                    {topic.title}
                  </span>
                </button>
              )
            })}
          </nav>
        )}
      </SheetContent>
    </Sheet>
  )
}