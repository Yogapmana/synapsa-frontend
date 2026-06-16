import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Lightbulb,
  AlertTriangle,
  Sparkles,
  Network,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useConceptGraph, useRegenerateConceptGraph, useCurriculumDetail } from '@/hooks/useLearning'
import { cn } from '@/lib/utils'
import { ConceptDetailPanel } from './ConceptDetailPanel'
import { matchNodeByLabel } from './mermaidUtils'

import { Transformer } from 'markmap-lib'
import { Markmap } from 'markmap-view'
import { Toolbar } from 'markmap-toolbar'
import 'markmap-toolbar/dist/style.css'

const transformer = new Transformer()

function buildMarkmapMarkdown(nodes, edges, fallbackCourseTitle) {
  if (!nodes || nodes.length === 0) return '';
  const nodeById = {};
  nodes.forEach(n => { nodeById[n.id] = n; });
  
  const childrenOf = { root: [] };
  nodes.forEach(n => {
    if (n.id !== 'root') childrenOf[n.id] = [];
  });
  
  const topicHasConcept = new Set();
  (edges || []).forEach(e => {
    if (e.relation === 'concept_to_topic') {
      topicHasConcept.add(e.target);
    }
  });

  (edges || []).forEach(e => {
    if (e.relation === 'concept_to_concept') return;
    
    // Skip direct cluster -> topic links if the topic is already under a concept
    if (e.relation === 'cluster_to_topic' && topicHasConcept.has(e.target)) return;

    if (childrenOf[e.source] && childrenOf[e.target]) {
      if (!childrenOf[e.source].includes(e.target)) {
        childrenOf[e.source].push(e.target);
      }
    }
  });

  const getLabel = (n) => {
    if (!n) return '';
    let label = n.label || '';
    if (n.kind === 'cluster') return `M${n.week_number}: ${label}`;
    if (n.kind === 'topic') return `${n.day_number ? n.day_number + '. ' : ''}${label}`;
    if (n.kind === 'resource') return `🔗 ${label}`;
    return label;
  };

  let md = '';
  const walk = (id, depth) => {
    const n = nodeById[id];
    if (!n) return;
    md += `${'#'.repeat(depth)} ${getLabel(n)}\n`;
    
    // Sort children for stability
    const children = childrenOf[id] || [];
    children.sort((a, b) => {
      const na = nodeById[a];
      const nb = nodeById[b];
      const wa = na?.week_number || 0;
      const wb = nb?.week_number || 0;
      if (wa !== wb) return wa - wb;
      const da = na?.day_number || 0;
      const db = nb?.day_number || 0;
      if (da !== db) return da - db;
      return (na?.label || '').localeCompare(nb?.label || '');
    });
    
    children.forEach(childId => walk(childId, depth + 1));
  };
  
  walk('root', 1);
  return md;
}

export default function MarkmapMindmapView({ sessionId, courseTitle }) {
  const navigate = useNavigate()
  const svgRef = useRef(null)
  const mmRef = useRef(null)
  const toolbarRef = useRef(null)
  
  const [selectedConceptId, setSelectedConceptId] = useState(null)
  const [renderError, setRenderError] = useState(null)

  const { data, isLoading, isError, error } = useConceptGraph(sessionId)
  const regenerate = useRegenerateConceptGraph()
  
  const [detailEnabled, setDetailEnabled] = useState(false)
  const detailQuery = useCurriculumDetail(sessionId, { enabled: detailEnabled })

  // ─── Markmap render lifecycle ─────────────────────────────────────────
  useEffect(() => {
    if (!svgRef.current || !data?.nodes) return
    setRenderError(null)
    
    try {
      const md = buildMarkmapMarkdown(data.nodes, data.edges, courseTitle)
      const { root } = transformer.transform(md)
      
      if (!mmRef.current) {
        mmRef.current = Markmap.create(svgRef.current, {
          autoFit: true,
          style: (id) => `
            .markmap-node text { fill: rgb(var(--primary)); font-family: Inter, sans-serif; font-weight: 500; }
            .markmap-node circle { fill: rgb(var(--surface-0)); stroke: rgb(var(--tertiary)); stroke-width: 2px; }
            .markmap-link { stroke: rgb(var(--border-default)); stroke-width: 1.5px; }
          `
        }, root)
        
        // Add toolbar
        if (toolbarRef.current) {
          toolbarRef.current.innerHTML = ''
          const { el } = Toolbar.create(mmRef.current)
          // Add custom classes to toolbar if needed
          el.className = cn(el.className, 'absolute bottom-4 right-4 !z-10 shadow-warm-md rounded-xl overflow-hidden')
          toolbarRef.current.appendChild(el)
        }
      } else {
        mmRef.current.setData(root)
        mmRef.current.fit()
      }
    } catch (err) {
      console.error('[MARKMAP] render failed:', err)
      setRenderError(err?.message || 'Gagal merender mindmap')
    }
  }, [data, courseTitle])

  // ─── Click delegation on the rendered SVG ─────────────────────────────
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    
    const handler = (e) => {
      let el = e.target
      
      // Let markmap handle circle clicks (expand/collapse)
      if (el.tagName === 'circle') return
      
      while (el && el !== svg && !el.classList?.contains('markmap-node')) {
        el = el.parentNode
      }
      if (!el || el === svg) return
      
      const label = el.textContent?.trim() || ''
      const matched = matchNodeByLabel(label, data?.nodes || [])
      
      if (!matched) return
      
      if (matched.kind === 'concept') {
        setDetailEnabled(true)
        setSelectedConceptId(matched.id)
      } else if (matched.kind === 'topic') {
        navigate(`/module/${matched.topic_id}`)
      } else if (matched.kind === 'resource') {
        const url = matched.url
        if (url) window.open(url, '_blank', 'noopener,noreferrer')
      }
    }
    
    svg.addEventListener('click', handler)
    return () => svg.removeEventListener('click', handler)
  }, [data, navigate])

  // ─── States ───────────────────────────────────────────────────────────
  if (isLoading) return <MindmapSkeleton />

  if (isError) {
    const status = error?.response?.status
    return (
      <MindmapEmpty
        title="Kurikulum belum tersedia"
        description={
          status === 404
            ? 'Peta konsep dibuat setelah kurikulum tersedia. Tunggu pipeline AI Planner selesai, lalu refresh halaman ini.'
            : error?.message || 'Terjadi kesalahan pada server.'
        }
      />
    )
  }

  if (!data || !data.nodes || data.nodes.length === 0) {
    return (
      <MindmapEmpty
        title="Peta konsep belum tersedia"
        description="Konsep akan dibuat setelah kurikulum tersedia."
        action={
          <Button
            variant="tertiary"
            onClick={() => regenerate.mutate(sessionId)}
            disabled={regenerate.isPending}
            className="rounded-xl font-label"
          >
            {regenerate.isPending ? 'Membuat…' : 'Buat Peta Konsep'}
          </Button>
        }
      />
    )
  }

  const selectedConcept = selectedConceptId
    ? (data.nodes || []).find((n) => n.id === selectedConceptId)
    : null

  return (
    <div className="card-base p-0 relative overflow-hidden bg-surface-0/40">
      <div aria-hidden="true" className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-tertiary/10 blur-3xl pointer-events-none z-0" />
      <div aria-hidden="true" className="absolute -left-12 -bottom-12 w-40 h-40 rounded-full bg-info/10 blur-3xl pointer-events-none z-0" />

      <Header
        data={data}
        courseTitle={courseTitle}
        onRegenerate={() => regenerate.mutate(sessionId)}
        isRegenerating={regenerate.isPending}
      />

      {/* Markmap canvas */}
      <div className="relative w-full h-[640px] overflow-hidden bg-surface-0/40 cursor-grab active:cursor-grabbing" style={{ touchAction: 'none' }}>
        {renderError && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="card-base p-5 max-w-md text-center bg-surface-1/90 border-warning/40 pointer-events-auto">
              <AlertTriangle className="mx-auto text-warning mb-2" size={24} />
              <p className="text-sm text-primary font-medium">Gagal merender mindmap</p>
              <p className="text-xs text-secondary mt-1">{renderError}</p>
            </div>
          </div>
        )}
        
        <svg ref={svgRef} className="w-full h-full" />
        
        {/* Toolbar Container */}
        <div ref={toolbarRef} className="absolute bottom-4 right-4" />
      </div>

      <div className="px-5 md:px-7 py-3 border-t border-border-subtle bg-surface-0/40/80 text-center">
        <p className="text-xs text-secondary font-label">
          Klik konsep untuk melihat detail • Klik topik untuk mulai belajar
          {' '}• Klik sumber untuk membuka tautan • Scroll untuk zoom • Drag untuk menggeser
        </p>
      </div>

      <ConceptDetailPanel
        open={!!selectedConcept}
        onOpenChange={(open) => {
          if (!open) setSelectedConceptId(null)
        }}
        concept={
          selectedConcept
            ? {
                id: selectedConcept.id,
                label: selectedConcept.label,
                description: selectedConcept.description,
                topicIds: selectedConcept.data?.topicIds || [],
              }
            : null
        }
        topics={detailQuery.data?.topics || []}
        resources={[]}
      />
    </div>
  )
}

function Header({ data, courseTitle, onRegenerate, isRegenerating }) {
  const isFallback = data?.model === 'fallback'
  return (
    <div className="relative z-10 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 p-5 md:p-7 pb-4 bg-surface-0/40/60 border-b border-border-subtle">
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-label font-semibold uppercase tracking-widest bg-tertiary/20 text-tertiary border border-tertiary/30">
            <Network size={11} />
            Peta Konsep
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-label font-semibold uppercase tracking-widest bg-surface-1 text-secondary border border-border-subtle">
            {data?.nodes?.length || 0} node
          </span>
          {isFallback && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-label font-semibold uppercase tracking-widest bg-warning/20 text-warning border border-warning/30">
              <Sparkles size={11} />
              Auto-generated
            </span>
          )}
        </div>
        <h3 className="font-display text-xl md:text-2xl font-semibold text-primary leading-tight">
          {courseTitle || data?.course_title}
        </h3>
        <p className="text-secondary text-sm mt-1 max-w-2xl leading-relaxed">
          Peta pikiran dengan struktur: minggu → konsep → topik → sumber. Klik node untuk berinteraksi.
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0 flex-wrap">
        <Button
          variant="ghost"
          size="sm"
          onClick={onRegenerate}
          disabled={isRegenerating}
          className="rounded-xl font-label text-secondary hover:text-primary hover:bg-surface-1"
        >
          <Sparkles size={14} />
          {isRegenerating ? 'Membuat…' : 'Buat Ulang'}
        </Button>
      </div>
    </div>
  )
}

function MindmapSkeleton() {
  return (
    <div className="card-base p-5 md:p-7 space-y-5 bg-surface-0/40" aria-busy="true">
      <div className="space-y-2">
        <Skeleton className="h-5 w-40 rounded-full bg-surface-1" />
        <Skeleton className="h-7 w-2/3 bg-surface-1" />
        <Skeleton className="h-4 w-3/4 bg-surface-1" />
      </div>
      <Skeleton className="h-[640px] w-full rounded-2xl bg-surface-1" />
    </div>
  )
}

function MindmapEmpty({ title, description, action }) {
  return (
    <div className="card-base p-12 text-center">
      <div className={cn('mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4', 'bg-tertiary/10 text-tertiary')}>
        <Lightbulb size={28} />
      </div>
      <h3 className="font-display font-semibold text-xl text-primary">{title}</h3>
      <p className="text-secondary mt-2 max-w-sm mx-auto">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
