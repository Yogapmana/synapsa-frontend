import React, { useMemo } from 'react'
import { Lightbulb, BookOpen, ExternalLink, ListChecks } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

/**
 * ConceptDetailPanel — Radix Sheet side panel that opens when a concept
 * node is clicked. Shows:
 *  - concept label + description
 *  - the list of topics the concept covers (with status badge)
 *  - aggregated resources from those topics
 *
 * Fetches the curriculum detail lazily on first open. Pure presentation
 * after that — no extra state.
 */
const STATUS_LABEL = {
  completed: 'Selesai',
  active: 'Aktif',
  locked: 'Terkunci',
  review: 'Review',
  pending: 'Tertunda',
}

const STATUS_CLASS = {
  completed: 'bg-success-light text-success-fg',
  active: 'bg-tertiary text-white',
  locked: 'bg-surface-1 text-secondary',
  review: 'bg-info-light text-info-fg',
  pending: 'bg-warning-light text-warning-fg',
}

const ICON_BY_LINK_TYPE = {
  video: '🎬',
  paper: '📄',
  course: '🎓',
  source: '🔗',
}

export function ConceptDetailPanel({
  open,
  onOpenChange,
  concept,
  topics,
  resources,
}) {
  // Topics this concept covers (filtered from the full curriculum detail).
  const conceptTopics = useMemo(() => {
    if (!concept || !topics) return []
    const ids = new Set(concept.topicIds || [])
    return topics.filter((t) => ids.has(t.id))
  }, [concept, topics])

  // Resources belonging to those topics.
  const conceptResources = useMemo(() => {
    if (!concept || !resources) return []
    const topicIds = new Set(concept.topicIds || [])
    return resources.filter((r) => topicIds.has(r.topic_id))
  }, [concept, resources])

  if (!concept) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md overflow-y-auto bg-surface-0"
      >
        <SheetHeader className="pb-4 border-b border-border-subtle">
          <div className="flex items-start gap-3">
            <div
              aria-hidden="true"
              className="w-10 h-10 rounded-xl bg-tertiary/10 text-tertiary flex items-center justify-center shrink-0"
            >
              <Lightbulb size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-label uppercase tracking-widest text-subtle-readable mb-1">
                Konsep
              </p>
              <SheetTitle className="font-display text-xl text-primary leading-tight">
                {concept.label}
              </SheetTitle>
            </div>
          </div>
          {concept.description ? (
            <SheetDescription className="text-sm text-secondary leading-relaxed pt-3">
              {concept.description}
            </SheetDescription>
          ) : null}
        </SheetHeader>

        {/* Topics section */}
        <section className="py-5">
          <div className="flex items-center gap-2 mb-3">
            <ListChecks size={14} className="text-secondary" />
            <h3 className="text-xs font-label font-semibold uppercase tracking-wider text-secondary">
              Topik ({conceptTopics.length})
            </h3>
          </div>
          {conceptTopics.length === 0 ? (
            <p className="text-sm text-subtle-readable italic">
              Belum ada topik terkait.
            </p>
          ) : (
            <ul className="space-y-2">
              {conceptTopics.map((t) => (
                <li
                  key={t.id}
                  className="flex items-start gap-2 p-2.5 rounded-xl bg-surface-1/50 hover:bg-surface-1 transition-colors"
                >
                  <BookOpen
                    size={14}
                    className="text-secondary mt-0.5 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-primary leading-snug line-clamp-2">
                      {t.title}
                    </p>
                    <p className="text-[10px] font-label tabular-nums text-subtle-readable mt-0.5">
                      Topik {t.week_number}.{t.day_number}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn(
                      'shrink-0 text-[10px] font-label',
                      STATUS_CLASS[t.status] || STATUS_CLASS.locked,
                    )}
                  >
                    {STATUS_LABEL[t.status] || t.status}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Resources section */}
        <section className="py-5 border-t border-border-subtle">
          <div className="flex items-center gap-2 mb-3">
            <ExternalLink size={14} className="text-secondary" />
            <h3 className="text-xs font-label font-semibold uppercase tracking-wider text-secondary">
              Sumber Belajar ({conceptResources.length})
            </h3>
          </div>
          {conceptResources.length === 0 ? (
            <p className="text-sm text-subtle-readable italic">
              Belum ada sumber untuk topik-topik ini.
            </p>
          ) : (
            <ul className="space-y-2">
              {conceptResources.map((r) => (
                <li key={r.id}>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2 p-2.5 rounded-xl bg-surface-1/50 hover:bg-info-light/40 transition-colors group"
                  >
                    <span
                      aria-hidden="true"
                      className="text-base shrink-0 mt-0.5"
                    >
                      {ICON_BY_LINK_TYPE[r.link_type] || '🔗'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-primary leading-snug line-clamp-2 group-hover:text-info transition-colors">
                        {r.title}
                      </p>
                      <p className="text-[10px] font-label uppercase tracking-wider text-subtle-readable mt-0.5">
                        {r.link_type}
                        {r.platform ? ` • ${r.platform}` : ''}
                      </p>
                    </div>
                    <ExternalLink
                      size={12}
                      className="text-subtle-readable group-hover:text-info shrink-0 mt-0.5"
                    />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      </SheetContent>
    </Sheet>
  )
}
