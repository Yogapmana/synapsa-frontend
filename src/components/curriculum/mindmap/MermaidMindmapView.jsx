import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  ExternalLink,
  Lightbulb,
  AlertTriangle,
  Sparkles,
  Network,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useMermaidMindmap, useRegenerateMermaidMindmap, useCurriculumDetail } from '@/hooks/useLearning'
import { cn } from '@/lib/utils'
import { ConceptDetailPanel } from './ConceptDetailPanel'
import { matchNodeByLabel } from './mermaidUtils'

/**
 * MermaidMindmapView — dark-themed Mermaid v11 mindmap.
 *
 * Renders a hand-drawn-feeling mind map (root → cluster → concept →
 * topic → resource). The Mermaid v11 ``mindmap`` diagram type
 * gives us the hand-drawn organic edges; per-node ``style <id> fill``
 * directives drive the warm-ivory palette that matches the rest of
 * the app.
 *
 * Click behavior (wired up via SVG event delegation — no `javascript:`
 * URIs, so Mermaid's ``securityLevel: 'strict'`` stays on):
 *   * concept node → open ConceptDetailPanel
 *   * topic node   → navigate to /module/{id}
 *   * resource node → open external URL
 *   * cluster / root → no-op
 *
 * Pan/zoom is hand-rolled (no extra deps) — translate + scale on a
 * transform group. Fits-to-content on first render and on Reset.
 */
export default function MermaidMindmapView({ sessionId, courseTitle }) {
  const navigate = useNavigate()
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 })
  const [selectedConceptId, setSelectedConceptId] = useState(null)
  const [renderError, setRenderError] = useState(null)

  const { data, isLoading, isError, error } = useMermaidMindmap(sessionId)
  const regenerate = useRegenerateMermaidMindmap()
  // Lazily fetch the full curriculum detail when the user opens the
  // concept side panel — keeps the first paint of the mindmap fast.
  const [detailEnabled, setDetailEnabled] = useState(false)
  const detailQuery = useCurriculumDetail(sessionId, { enabled: detailEnabled })

  // ─── Mermaid render lifecycle ─────────────────────────────────────────
  const renderMermaid = useCallback(async (syntax) => {
    if (!syntax || !svgRef.current) return
    setRenderError(null)
    try {
      // Lazy import so the heavy mermaid bundle (~700KB) only loads when
      // the user actually opens the Konsep view. The dynamic import also
      // means we can re-run mermaid.initialize() to pick up any config
      // changes between renders.
      const mermaidModule = await import('mermaid')
      const mermaid = mermaidModule.default

      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        // Default light theme — the per-node ``style <id> fill:...``
        // directives emitted by ConceptGraphService.to_mermaid_syntax
        // do all the per-node coloring, so we don't need a custom
        // ``base`` theme or themeVariables here.
        theme: 'default',
        mindmap: {
          padding: 20,
          maxNodeWidth: 220,
        },
        fontFamily:
          '"Source Sans 3", Inter, system-ui, -apple-system, sans-serif',
        flowchart: { useMaxWidth: false },
        sequence: { useMaxWidth: false },
        gantt: { useMaxWidth: false },
      })

      // Mermaid v11 render() returns { svg, bindFunctions }.
      const id = `mm-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      const { svg } = await mermaid.render(id, syntax)
      if (svgRef.current) {
        svgRef.current.innerHTML = svg
        // Center the rendered SVG inside the container on first load
        fitToContent()
      }
    } catch (err) {
      console.error('[MERMAID] render failed:', err)
      setRenderError(err?.message || 'Gagal merender mindmap')
    }
  }, [])

  // Re-render whenever the syntax changes
  useEffect(() => {
    if (data?.syntax) {
      renderMermaid(data.syntax)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.syntax])

  // ─── Click delegation on the rendered SVG ─────────────────────────────
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const handler = (e) => {
      // Walk up to the nearest <g> node (Mermaid wraps every node in <g class="node ... ">)
      let el = e.target
      while (el && el !== svg && el.tagName !== 'g') {
        el = el.parentNode
      }
      if (!el || el === svg) return
      const id = el.getAttribute('id') || ''
      // Mermaid v11 emits ids like "flowchart-{N}-0" or "mindmapNode-{N}"
      // We pre-set our node ids in the syntax to match a stable pattern:
      //   nodeId = "mm-{kind}-{stable}" — but the easiest path is to look
      //   up the matched node by walking the node text content and
      //   matching it against the data we sent down.
      const label = el.textContent?.trim() || ''
      const matched = matchNodeByLabel(label, data?.nodes || [])
      if (!matched) return
      if (matched.kind === 'concept') {
        setDetailEnabled(true)  // trigger lazy fetch for the panel
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

  // ─── Pan / zoom ───────────────────────────────────────────────────────
  // Wheel = zoom (with Ctrl) or pan (without). Plain mouse drag = pan.
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const onWheel = (e) => {
      e.preventDefault()
      setTransform((t) => {
        if (e.ctrlKey || e.metaKey) {
          const delta = -e.deltaY * 0.0015
          const next = Math.max(0.3, Math.min(3, t.k * (1 + delta)))
          return { ...t, k: next }
        }
        return { ...t, x: t.x - e.deltaX, y: t.y - e.deltaY }
      })
    }
    let dragging = false
    let last = { x: 0, y: 0 }
    const onDown = (e) => {
      // Don't start a drag if the user clicked a node
      if (e.target.closest('.node, .edge, [class*="node"]')) return
      dragging = true
      last = { x: e.clientX, y: e.clientY }
    }
    const onMove = (e) => {
      if (!dragging) return
      setTransform((t) => ({
        ...t,
        x: t.x + (e.clientX - last.x),
        y: t.y + (e.clientY - last.y),
      }))
      last = { x: e.clientX, y: e.clientY }
    }
    const onUp = () => {
      dragging = false
    }
    svg.addEventListener('wheel', onWheel, { passive: false })
    svg.addEventListener('mousedown', onDown)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      svg.removeEventListener('wheel', onWheel)
      svg.removeEventListener('mousedown', onDown)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  function fitToContent() {
    const svg = svgRef.current?.querySelector('svg')
    const container = containerRef.current
    if (!svg || !container) return
    try {
      const bbox = svg.getBBox()
      if (!bbox.width || !bbox.height) return
      const cw = container.clientWidth
      const ch = container.clientHeight
      const pad = 40
      const k = Math.min(
        (cw - pad * 2) / bbox.width,
        (ch - pad * 2) / bbox.height,
        1.5,
      )
      const x = (cw - bbox.width * k) / 2 - bbox.x * k
      const y = (ch - bbox.height * k) / 2 - bbox.y * k
      setTransform({ x, y, k: Math.max(0.3, k) })
    } catch {
      // getBBox can throw if the SVG isn't in the DOM yet — silent.
    }
  }

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

  if (!data || !data.syntax) {
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

  if (data.truncated) {
    return (
      <MindmapEmpty
        title="Peta konsep terlalu besar"
        description={`Sesi ini memiliki ${data.node_count} node — di luar batas yang aman untuk rendering. Gunakan tampilan Overview.`}
      />
    )
  }

  // The selected concept for the side panel
  const selectedConcept = selectedConceptId
    ? (data.nodes || []).find((n) => n.id === selectedConceptId)
    : null

  return (
    <div className="card-base p-0 relative overflow-hidden bg-surface-0/40">
      {/* Decorative gradient blobs */}
      <div
        aria-hidden="true"
        className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-tertiary/10 blur-3xl pointer-events-none z-0"
      />
      <div
        aria-hidden="true"
        className="absolute -left-12 -bottom-12 w-40 h-40 rounded-full bg-info/10 blur-3xl pointer-events-none z-0"
      />

      {/* Header */}
      <Header
        data={data}
        courseTitle={courseTitle}
        onRegenerate={() => regenerate.mutate(sessionId)}
        isRegenerating={regenerate.isPending}
        onFitToContent={fitToContent}
        onZoom={(delta) =>
          setTransform((t) => {
            const k = Math.max(0.3, Math.min(3, t.k + delta))
            return { ...t, k }
          })
        }
        onReset={() => setTransform({ x: 0, y: 0, k: 1 })}
      />

      {/* Mermaid canvas */}
      <div
        ref={containerRef}
        className="relative w-full h-[640px] overflow-hidden bg-surface-0/40 cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'none' }}
      >
        {renderError && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="card-base p-5 max-w-md text-center bg-surface-1/90 border-warning/40 pointer-events-auto">
              <AlertTriangle className="mx-auto text-warning mb-2" size={24} />
              <p className="text-sm text-primary font-medium">Gagal merender mindmap</p>
              <p className="text-xs text-secondary mt-1">{renderError}</p>
            </div>
          </div>
        )}
        <div
          ref={svgRef}
          className="w-full h-full mermaid-canvas"
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`,
            transformOrigin: '0 0',
            transition: 'none',
          }}
        />
      </div>

      {/* Footer hint */}
      <div className="px-5 md:px-7 py-3 border-t border-border-subtle bg-surface-0/40/80 text-center">
        <p className="text-xs text-secondary font-label">
          {t('curriculum.click_instruction', 'Klik konsep untuk melihat detail • Klik topik untuk mulai belajar')}
          {' '}• Klik sumber untuk membuka tautan • Scroll + Ctrl untuk zoom • Drag untuk menggeser
        </p>
      </div>

      {/* Concept detail side panel */}
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

// --------------------------------------------------------------------------- //
// Header
// --------------------------------------------------------------------------- //

function Header({
  data,
  courseTitle,
  onRegenerate,
  isRegenerating,
  onFitToContent,
  onZoom,
  onReset,
}) {
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
            {data.node_count} node
          </span>
          {isFallback && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-label font-semibold uppercase tracking-widest bg-warning/20 text-warning border border-warning/30">
              <Sparkles size={11} />
              Auto-generated
            </span>
          )}
        </div>
        <h3 className="font-display text-xl md:text-2xl font-semibold text-primary leading-tight">
          {courseTitle || data.course_title}
        </h3>
        <p className="text-secondary text-sm mt-1 max-w-2xl leading-relaxed">
          Peta pikiran dengan struktur: minggu → konsep → topik → sumber. Klik node untuk berinteraksi.
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0 flex-wrap">
        <div className="inline-flex items-center gap-1 p-1 bg-surface-1 border border-border-subtle rounded-xl">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onZoom(-0.15)}
            className="h-7 w-7 p-0 rounded-lg text-secondary hover:text-primary hover:bg-surface-0"
            aria-label="Zoom out"
          >
            <ZoomOut size={14} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onFitToContent}
            className="h-7 w-7 p-0 rounded-lg text-secondary hover:text-primary hover:bg-surface-0"
            aria-label="Fit to content"
          >
            <Maximize2 size={13} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onZoom(0.15)}
            className="h-7 w-7 p-0 rounded-lg text-secondary hover:text-primary hover:bg-surface-0"
            aria-label="Zoom in"
          >
            <ZoomIn size={14} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onReset}
            className="h-7 w-7 p-0 rounded-lg text-secondary hover:text-primary hover:bg-surface-0"
            aria-label="Reset"
          >
            <RotateCcw size={13} />
          </Button>
        </div>
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

// --------------------------------------------------------------------------- //
// Helpers — `matchNodeByLabel` lives in ./mermaidUtils (imported above) so
// it can be unit-tested without booting React/jsdom/mermaid.
// --------------------------------------------------------------------------- //

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
      <div
        className={cn(
          'mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4',
          'bg-tertiary/10 text-tertiary',
        )}
      >
        <Lightbulb size={28} />
      </div>
      <h3 className="font-display font-semibold text-xl text-primary">{title}</h3>
      <p className="text-secondary mt-2 max-w-sm mx-auto">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
