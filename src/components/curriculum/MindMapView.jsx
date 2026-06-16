import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import {
  Brain,
  Network,
  ArrowLeft,
  AlertTriangle,
  Sparkles,
  Lightbulb,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import StatusBadge from '@/components/common/StatusBadge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useCurriculumDetail,
  useMindmapData,
} from '@/hooks/useLearning'
import { cn } from '@/lib/utils'

import { RootNode } from './mindmap/RootNode'
import { WeekNode } from './mindmap/WeekNode'
import { TopicNode as ConceptTopicNode } from './mindmap/TopicNode'
import RoadmapMindmapView from './mindmap/RoadmapMindmapView'
import {
  buildOverviewLayout,
  buildWeekDetailLayout,
} from './mindmap/layout'

/**
 * MindMapView (v4) — Two-mode interactive mind map.
 *
 * Modes (driven by ``subMode`` prop, which Curriculum.jsx toggles via a
 * segmented control):
 *
 * 1. ``overview`` — Radial "v3" layout: 1 root, N weeks in a circle, click a
 *    week to drill into a row of topics. Cheap, deterministic.
 * 2. ``concept`` — Layered "Konsep" view: root → week cluster → concept →
 *    topic → resource, auto-laid-out by ELK.js. Click a concept to open a
 *    side panel; click a topic to navigate; click a resource to open the
 *    URL. Cached server-side in ``curricula.concept_graph_json``.
 *
 * Click behavior matrix:
 *   topic (overview mode)    → /module/{id}
 *   week (overview mode)     → drill into that week's detail
 *   concept/topic/resource   → handled by MermaidMindmapView's own
 *                              SVG event delegation (concept sub-mode)
 */

// React Flow v12 node type registry (all kinds for both modes)
const nodeTypes = {
  root: RootNode,
  week: WeekNode,
  'week-large': WeekNode,
  topic: ConceptTopicNode,
}

const defaultEdgeOptions = {
  type: 'smoothstep',
  style: { strokeWidth: 1.5 },
}

export default function MindMapView({ sessionId, courseTitle, subMode: subModeProp }) {
  // Default to concept mode (the new "comprehensive" view) if not specified.
  const [internalSubMode, setInternalSubMode] = useState('concept')
  const subMode = subModeProp || internalSubMode
  const setSubMode = subModeProp ? () => {} : setInternalSubMode

  return (
    <ReactFlowProvider>
      <MindMapViewInner
        sessionId={sessionId}
        courseTitle={courseTitle}
        subMode={subMode}
        onSubModeChange={setSubMode}
      />
    </ReactFlowProvider>
  )
}

function MindMapViewInner({ sessionId, courseTitle, subMode, onSubModeChange }) {
  const navigate = useNavigate()
  const shouldReduceMotion = useReducedMotion()

  // Overview-mode state — concept mode is now handled by
  // MermaidMindmapView, which manages its own selected-concept state.
  const [selectedWeek, setSelectedWeek] = useState(null)  // null = overview

  // Queries — the "concept" path is now handled by MermaidMindmapView
  // (it hits its own /mermaid-mindmap endpoint). We only fetch
  // overview data here.
  const overviewQuery = useMindmapData(sessionId)
  const detailQuery = useCurriculumDetail(sessionId, { enabled: subMode === 'overview' })
  const { data, isLoading, isError, error } = overviewQuery

  // Layout computation
  // The XYFlow path is only used in "overview" mode now — "concept" mode
  // short-circuits to <MermaidMindmapView /> in the render below, so
  // we only build nodes/edges when the user is in the radial view.
  const { initialNodes, initialEdges, selectedWeekData } = useMemo(() => {
    if (!data) {
      return {
        initialNodes: [],
        initialEdges: [],
        selectedWeekData: null,
      }
    }

    // Radial mode
    if (selectedWeek !== null) {
      const week = data.weeks.find((w) => w.week_number === selectedWeek)
      if (!week) {
        return {
          initialNodes: [],
          initialEdges: [],
          selectedWeekData: null,
        }
      }
      const layout = buildWeekDetailLayout(week, sessionId)
      return {
        initialNodes: layout.nodes,
        initialEdges: layout.edges,
        selectedWeekData: week,
      }
    }
    const layout = buildOverviewLayout(data, { radius: 380 })
    return {
      initialNodes: layout.nodes,
      initialEdges: layout.edges,
      selectedWeekData: null,
    }
  }, [data, selectedWeek, sessionId])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  // Sync nodes/edges when layout input changes
  useEffect(() => {
    setNodes(initialNodes)
    setEdges(initialEdges)
  }, [initialNodes, initialEdges, setNodes, setEdges])

  // ─── Click handlers (overview mode only — concept mode is in MermaidMindmapView) ───
  const handleNodeClick = useCallback(
    (_event, node) => {
      if (node.type === 'week' && !node.data?.isDetail) {
        setSelectedWeek(node.data.weekNumber)
      } else if (node.type === 'topic') {
        navigate(`/module/${node.data.id}`)
      }
    },
    [navigate],
  )

  // ─── Loading state ───
  if (isLoading) {
    return <MindMapSkeleton />
  }

  // ─── Error states ───
  if (isError) {
    const status = error?.response?.status
    if (status === 404) {
      return (
        <MindMapEmpty
          title="Kurikulum belum tersedia"
          description="Peta konsep dibuat setelah kurikulum tersedia. Tunggu pipeline AI Planner selesai, lalu refresh halaman ini."
        />
      )
    }
    return (
      <MindMapEmpty
        variant="danger"
        title="Gagal memuat peta konsep"
        description={error?.message || 'Terjadi kesalahan pada server.'}
        action={
          <Button
            variant="tertiary"
            onClick={() => window.location.reload()}
            className="rounded-xl font-label"
          >
            Muat Ulang
          </Button>
        }
      />
    )
  }

  // Empty-state guard — only the overview (radial) path renders here.
  // Concept mode is delegated to MermaidMindmapView above.
  if (!data || !data.weeks || data.weeks.length === 0) {
    return (
      <MindMapEmpty
        title="Peta konsep belum tersedia"
        description="Kurikulum ini tidak memiliki minggu/topik."
      />
    )
  }

  // The Roadmap view handles its own ReactFlow + ELK pipeline.
  // We render it here and skip the overview-specific XYFlow logic.
  if (subMode === 'concept') {
    return <RoadmapMindmapView sessionId={sessionId} courseTitle={courseTitle} />
  }

  return (
    <div className="card-base p-0 relative overflow-hidden">
      {/* Decorative blobs */}
      <div
        aria-hidden="true"
        className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-tertiary/[0.04] blur-3xl pointer-events-none z-0"
      />
      <div
        aria-hidden="true"
        className="absolute -left-12 -bottom-12 w-40 h-40 rounded-full bg-warning/[0.05] blur-3xl pointer-events-none z-0"
      />

      {/* Header */}
      <MindMapHeader
        data={data}
        courseTitle={courseTitle}
        subMode={subMode}
        onSubModeChange={onSubModeChange}
        selectedWeek={selectedWeek}
        selectedWeekData={selectedWeekData}
        onBackToOverview={() => setSelectedWeek(null)}
      />

      {/* React Flow canvas */}
      <motion.div
        key={subMode}  // remount-on-mode-switch for a clean ELK layout
        initial={shouldReduceMotion ? {} : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="relative w-full h-[620px] bg-surface-0/40"
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          fitView
          fitViewOptions={{
            padding: 0.25,
            minZoom: 0.2,
            maxZoom: 1.4,
          }}
          minZoom={0.15}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
          nodesDraggable
          nodesConnectable={false}
          elementsSelectable
          zoomOnScroll
          panOnScroll
          panOnDrag
          selectionOnDrag={false}
          className="[&_.react-flow__edge-path]:transition-opacity"
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1.5}
            color="rgb(var(--border-default))"
          />
          <Controls
            showInteractive={false}
            className="!shadow-warm-sm !border-border-subtle !rounded-xl overflow-hidden"
            position="bottom-right"
          />
          <MiniMap
            pannable
            zoomable
            nodeColor={(node) => {
              if (node.type === 'root') return 'rgb(var(--tertiary))'
              if (node.type === 'cluster') return 'rgb(var(--surface-1))'
              if (node.type === 'concept') return 'rgb(var(--tertiary) / 0.5)'
              if (node.type === 'resource') return 'rgb(var(--info))'
              if (node.type === 'topic') {
                const s = node.data?.status
                if (s === 'completed') return 'rgb(var(--success))'
                if (s === 'active') return 'rgb(var(--tertiary))'
                return 'rgb(var(--border-default))'
              }
              return 'rgb(var(--border-default))'
            }}
            maskColor="rgb(var(--surface-0) / 0.7)"
            className="!bg-surface-1 !border-border-subtle !rounded-xl"
            position="bottom-left"
          />
        </ReactFlow>
      </motion.div>

      {/* Footer hint */}
      <div className="px-5 md:px-7 py-3 border-t border-border-subtle bg-surface-1/30 text-center">
        <p className="text-xs text-subtle-readable font-label">
          {subMode === 'concept' ? (
            <>
              Klik konsep untuk melihat detail • Klik topik untuk mulai belajar
              {' '}• Klik sumber untuk membuka tautan • Scroll untuk zoom
            </>
          ) : selectedWeek ? (
            'Klik topik untuk mulai belajar • Scroll untuk zoom • Drag untuk menggeser'
          ) : (
            'Klik minggu untuk melihat detail topik • Scroll untuk zoom • Drag untuk menggeser'
          )}
        </p>
      </div>

      {/* Concept detail side panel lives in MermaidMindmapView for the
          concept sub-mode; overview mode doesn't need it. */}
    </div>
  )
}

// --------------------------------------------------------------------------- //
// Header
// --------------------------------------------------------------------------- //

function MindMapHeader({
  data,
  courseTitle,
  subMode,
  onSubModeChange,
  selectedWeek,
  selectedWeekData,
  onBackToOverview,
}) {
  return (
    <div className="relative z-10 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 p-5 md:p-7 pb-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <StatusBadge variant="accent" size="sm" icon={Brain}>
            Peta Konsep Interaktif
          </StatusBadge>
          <AnimatePresence mode="wait">
            {subMode === 'overview' ? (
              <motion.div
                key="overview-badge"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <StatusBadge variant="success" size="sm" icon={Network}>
                  {data.total_weeks} minggu • {data.total_topics} topik
                </StatusBadge>
              </motion.div>
            ) : (
              <motion.div
                key="concept-badge"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2 flex-wrap"
              >
                <StatusBadge variant="info" size="sm" icon={Lightbulb}>
                  {data.node_count} node • {data.edge_count} relasi
                </StatusBadge>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <h3 className="font-display text-xl md:text-2xl font-semibold text-primary leading-tight">
          {subMode === 'overview' && selectedWeek
            ? selectedWeekData?.title || courseTitle || data.course_title
            : courseTitle || data.course_title}
        </h3>
        <p className="text-secondary text-sm mt-1 max-w-2xl leading-relaxed">
          {subMode === 'concept'
            ? 'Peta konsep terstruktur: minggu → konsep → topik → sumber.'
            : selectedWeek
              ? 'Klik topik untuk mulai belajar.'
              : 'Klik minggu untuk melihat detail topik.'}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0 flex-wrap">
        {/* Sub-mode segmented control — switches between the radial
            overview and the dark-themed Mermaid Konsep view. */}
        <div
          role="tablist"
          aria-label="Pilih mode peta konsep"
          className="inline-flex items-center gap-1 p-1 bg-surface-1 border border-border-subtle rounded-xl"
        >
          <SubModeTab
            active={subMode === 'overview'}
            onClick={() => onSubModeChange('overview')}
            label="Overview"
          />
          <SubModeTab
            active={subMode === 'concept'}
            onClick={() => onSubModeChange('concept')}
            label="Konsep"
          />
        </div>

        {subMode === 'overview' && selectedWeek !== null && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBackToOverview}
            className="rounded-xl font-label"
          >
            <ArrowLeft size={14} />
            Kembali
          </Button>
        )}
        {/* Note: the "Buat Ulang" button for the concept graph lives in
            MermaidMindmapView's own header — that view owns the mutation
            and shows the loading state. */}
      </div>
    </div>
  )
}

function SubModeTab({ active, onClick, label }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-label font-medium',
        'transition-all duration-200 focus:outline-none focus-visible:ring-2',
        'focus-visible:ring-tertiary focus-visible:ring-offset-1',
        active
          ? 'bg-surface-0 text-primary shadow-warm-sm'
          : 'text-secondary hover:text-primary hover:bg-surface-0/50',
      )}
    >
      {label}
    </button>
  )
}

// --------------------------------------------------------------------------- //
// Skeleton / Empty
// --------------------------------------------------------------------------- //

function MindMapSkeleton() {
  return (
    <div className="card-base p-5 md:p-7 space-y-5" aria-busy="true">
      <div className="space-y-2">
        <Skeleton className="h-5 w-40 rounded-full" />
        <Skeleton className="h-7 w-2/3" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <Skeleton className="h-[620px] w-full rounded-2xl" />
    </div>
  )
}

function MindMapEmpty({ title, description, action, variant = 'neutral' }) {
  const toneClass = {
    neutral: 'bg-tertiary/10 text-tertiary',
    danger: 'bg-danger-light text-danger-fg',
  }[variant]
  const Icon = variant === 'danger' ? AlertTriangle : Brain

  return (
    <div className="card-base p-12 text-center">
      <div
        className={cn(
          'mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4',
          toneClass
        )}
      >
        <Icon size={28} />
      </div>
      <h3 className="font-display font-semibold text-xl text-primary">{title}</h3>
      <p className="text-secondary mt-2 max-w-sm mx-auto">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
