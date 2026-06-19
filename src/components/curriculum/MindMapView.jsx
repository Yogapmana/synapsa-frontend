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
import EnhancedMindmapView from './EnhancedMindmapView'
import {
  buildOverviewLayout,
  buildWeekDetailLayout,
} from './mindmap/layout'

// React Flow v12 node type registry
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
  // Default to enhanced mode
  const [internalSubMode, setInternalSubMode] = useState('enhanced')
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

  const [selectedWeek, setSelectedWeek] = useState(null)
  const [selectedWeekData, setSelectedWeekData] = useState(null)

  const overviewQuery = useMindmapData(sessionId)
  const { data, isLoading, isError, error } = overviewQuery

  // Layout computation for visual mode
  const { initialNodes, initialEdges } = useMemo(() => {
    if (!data) {
      return { initialNodes: [], initialEdges: [] }
    }
    if (selectedWeek !== null) {
      const week = data.weeks.find((w) => w.week_number === selectedWeek)
      if (!week) return { initialNodes: [], initialEdges: [] }
      const layout = buildWeekDetailLayout(week, sessionId)
      return { initialNodes: layout.nodes, initialEdges: layout.edges }
    }
    const layout = buildOverviewLayout(data, { radius: 380 })
    return { initialNodes: layout.nodes, initialEdges: layout.edges }
  }, [data, selectedWeek, sessionId])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  useEffect(() => {
    setNodes(initialNodes)
    setEdges(initialEdges)
  }, [initialNodes, initialEdges, setNodes, setEdges])

  if (isLoading) return <MindMapSkeleton />

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

  if (!data || !data.weeks || data.weeks.length === 0) {
    return (
      <MindMapEmpty
        title="Peta konsep belum tersedia"
        description="Kurikulum ini tidak memiliki minggu/topik."
      />
    )
  }

  return (
    <div className="space-y-4">
      <SubModeTabBar
        subMode={subMode}
        onSubModeChange={onSubModeChange}
      />

      {subMode === 'enhanced' && (
        <EnhancedMindmapView sessionId={sessionId} />
      )}

      {subMode === 'overview' && (
        <OverviewContent
          data={data}
          courseTitle={courseTitle}
          selectedWeek={selectedWeek}
          setSelectedWeek={setSelectedWeek}
          selectedWeekData={selectedWeekData}
          setSelectedWeekData={setSelectedWeekData}
          shouldReduceMotion={shouldReduceMotion}
          navigate={navigate}
        />
      )}
    </div>
  )
}

function SubModeTabBar({ subMode, onSubModeChange }) {
  return (
    <div
      role="tablist"
      aria-label="Pilih mode peta konsep"
      className="inline-flex items-center gap-1 p-1 bg-surface-1 border border-border-subtle rounded-xl"
    >
      <SubModeTab
        active={subMode === 'enhanced'}
        onClick={() => onSubModeChange('enhanced')}
        label="Detail Terstruktur"
      />
      <SubModeTab
        active={subMode === 'overview'}
        onClick={() => onSubModeChange('overview')}
        label="Mindmap Visual"
      />
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

function OverviewContent({
  data,
  courseTitle,
  selectedWeek,
  setSelectedWeek,
  selectedWeekData,
  setSelectedWeekData,
  shouldReduceMotion,
  navigate,
}) {
  const { nodes, edges } = useMemo(() => {
    if (!data?.weeks?.length) return { nodes: [], edges: [] }
    if (selectedWeek != null) {
      const week = data.weeks.find((w) => w.week_number === selectedWeek)
      if (!week) return { nodes: [], edges: [] }
      return buildWeekDetailLayout(week, data.session_id)
    }
    return buildOverviewLayout(data, { radius: 380 })
  }, [data, selectedWeek])

  const [localNodes, setLocalNodes, onNodesChange] = useNodesState(nodes)
  const [localEdges, setLocalEdges, onEdgesChange] = useEdgesState(edges)
  useEffect(() => { setLocalNodes(nodes) }, [nodes, setLocalNodes])
  useEffect(() => { setLocalEdges(edges) }, [edges, setLocalEdges])

  const handleNodeClick = useCallback(
    (_evt, node) => {
      if (node?.type === 'topic' && node.data?.id) {
        navigate(`/module/${node.data.id}`)
      } else if (node?.type === 'week' && typeof node.data?.weekNumber === 'number' && !node.data?.isDetail) {
        setSelectedWeek(node.data.weekNumber)
        const w = data.weeks.find((wk) => wk.week_number === node.data.weekNumber)
        setSelectedWeekData(w || null)
      }
    },
    [navigate, setSelectedWeek, setSelectedWeekData, data]
  )

  return (
    <div className="card-base p-0 relative overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-tertiary/[0.04] blur-3xl pointer-events-none z-0"
      />
      <div
        aria-hidden="true"
        className="absolute -left-12 -bottom-12 w-40 h-40 rounded-full bg-warning/[0.05] blur-3xl pointer-events-none z-0"
      />

      <div className="relative z-10 p-5 md:p-7 pb-4">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <StatusBadge variant="accent" size="sm" icon={Brain}>
            Peta Konsep Visual
          </StatusBadge>
          <StatusBadge variant="success" size="sm" icon={Network}>
            {data.total_weeks} minggu • {data.total_topics} topik
          </StatusBadge>
          {selectedWeek !== null && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setSelectedWeek(null); setSelectedWeekData(null) }}
              className="rounded-xl font-label ml-auto"
            >
              <ArrowLeft size={14} />
              Kembali
            </Button>
          )}
        </div>
        <h3 className="font-display text-xl md:text-2xl font-semibold text-primary leading-tight">
          {selectedWeek
            ? selectedWeekData?.title || courseTitle || data.course_title
            : courseTitle || data.course_title}
        </h3>
        <p className="text-secondary text-sm mt-1 max-w-2xl leading-relaxed">
          {selectedWeek
            ? 'Klik topik untuk mulai belajar.'
            : 'Klik minggu untuk melihat detail topik.'}
        </p>
      </div>

      <motion.div
        key={selectedWeek ?? 'overview'}
        initial={shouldReduceMotion ? {} : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="relative w-full h-[620px] bg-surface-0/40"
      >
        <ReactFlow
          nodes={localNodes}
          edges={localEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          fitView
          fitViewOptions={{ padding: 0.25, minZoom: 0.2, maxZoom: 1.4 }}
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

      <div className="px-5 md:px-7 py-3 border-t border-border-subtle bg-surface-1/30 text-center">
        <p className="text-xs text-subtle-readable font-label">
          {selectedWeek
            ? 'Klik topik untuk mulai belajar • Scroll untuk zoom • Drag untuk menggeser'
            : 'Klik minggu untuk melihat detail topik • Scroll untuk zoom • Drag untuk menggeser'}
        </p>
      </div>
    </div>
  )
}

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
