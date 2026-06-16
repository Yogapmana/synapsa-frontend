import React, { useCallback, useEffect, useState } from 'react'
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
  Lightbulb,
  AlertTriangle,
  Sparkles,
  Network,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useConceptGraph, useRegenerateConceptGraph, useCurriculumDetail } from '@/hooks/useLearning'
import { useToast } from "@/hooks/use-toast"
import { cn } from '@/lib/utils'

import { RootNode } from './RootNode'
import { WeekNode } from './WeekNode'
import { TopicNode } from './TopicNode'
import { ConceptNode } from './ConceptNode'
import { ClusterNode } from './ClusterNode'
import { ResourceNode } from './ResourceNode'
import { SubTopicNode } from './SubTopicNode'
import { buildConceptGraphLayout } from './layout'
import { ConceptDetailPanel } from './ConceptDetailPanel'

const nodeTypes = {
  root: RootNode,
  week: WeekNode,
  'week-large': WeekNode,
  topic: TopicNode,
  concept: ConceptNode,
  cluster: ClusterNode,
  resource: ResourceNode,
}

const defaultEdgeOptions = {
  type: 'smoothstep',
  style: { strokeWidth: 1.5 },
}

export default function RoadmapMindmapView({ sessionId, courseTitle }) {
  const navigate = useNavigate()
  const shouldReduceMotion = useReducedMotion()
  const { toast } = useToast()

  const [selectedConceptId, setSelectedConceptId] = useState(null)
  const [renderError, setRenderError] = useState(null)

  const { data, isLoading, isError, error } = useConceptGraph(sessionId)
  const regenerate = useRegenerateConceptGraph()
  const detailQuery = useCurriculumDetail(sessionId)

  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [isLayouting, setIsLayouting] = useState(false)

  useEffect(() => {
    let mounted = true
    if (data && data.nodes && data.nodes.length > 0) {
      setIsLayouting(true)
      buildConceptGraphLayout(data)
        .then((layout) => {
          if (mounted) {
            setNodes(layout.nodes)
            setEdges(layout.edges)
            setIsLayouting(false)
            setRenderError(null)
          }
        })
        .catch((err) => {
          console.error("ELK Layout error:", err)
          if (mounted) {
            setRenderError(err)
            setIsLayouting(false)
          }
        })
    }
    return () => { mounted = false }
  }, [data, setNodes, setEdges])

  const handleNodeClick = useCallback(
    (_event, node) => {
      if (node.type === 'concept') {
        setSelectedConceptId(node.id)
      } else if (node.type === 'topic') {
        if (node.data && node.data.id) {
          if (node.data.status === 'pending' || node.data.status === 'locked') {
            toast({
              title: "Topik Terkunci",
              description: "Selesaikan topik sebelumnya terlebih dahulu untuk membuka topik ini.",
              variant: "default",
            })
          } else {
            navigate(`/module/${node.data.id}`)
          }
        }
      } else if (node.type === 'resource') {
        if (node.data && node.data.url) {
          window.open(node.data.url, '_blank', 'noopener,noreferrer')
        }
      }
    },
    [navigate, toast],
  )

  const handleClosePanel = useCallback(() => {
    setSelectedConceptId(null)
  }, [])

  const handleRegenerate = () => {
    regenerate.mutate(sessionId)
    setSelectedConceptId(null)
    setRenderError(null)
  }

  // ─── Loading state ───
  if (isLoading || isLayouting) {
    return (
      <div className="w-full h-[620px] bg-surface-50 animate-pulse rounded-2xl border border-border-default flex flex-col items-center justify-center space-y-4">
        <Network className="w-12 h-12 text-tertiary/40 animate-bounce" />
        <p className="text-secondary font-medium">Merangkai peta konsep Roadmap...</p>
        <div className="flex gap-2">
          <Skeleton className="w-24 h-8 rounded-full" />
          <Skeleton className="w-32 h-8 rounded-full" />
          <Skeleton className="w-20 h-8 rounded-full" />
        </div>
      </div>
    )
  }

  // ─── Error state ───
  if (isError || renderError) {
    const status = error?.response?.status
    const isGenerating = data?.status === 'generating' || status === 404

    return (
      <div className="w-full h-[620px] bg-surface-50 rounded-2xl border border-border-default flex flex-col items-center justify-center space-y-6 text-center p-8">
        <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center">
          {isGenerating ? (
            <Sparkles className="w-8 h-8 text-warning animate-pulse" />
          ) : (
            <AlertTriangle className="w-8 h-8 text-danger" />
          )}
        </div>
        <div className="max-w-md">
          <h3 className="text-xl font-bold text-primary mb-2">
            {isGenerating ? 'AI Sedang Merangkai Peta' : 'Gagal Memuat Peta Konsep'}
          </h3>
          <p className="text-secondary mb-6">
            {isGenerating
              ? 'Peta konsep sedang dibuat di background. Silakan refresh halaman ini beberapa saat lagi.'
              : (error?.message || renderError?.message || 'Terjadi kesalahan pada server saat merender Roadmap.')}
          </p>
          {!isGenerating && (
            <Button
              variant="tertiary"
              onClick={handleRegenerate}
              disabled={regenerate.isPending}
              className="rounded-xl font-label shadow-sm"
            >
              {regenerate.isPending ? 'Membangun ulang...' : 'Coba Bangun Ulang'}
            </Button>
          )}
        </div>
      </div>
    )
  }

  // Empty state guard
  if (!data || !data.nodes || data.nodes.length === 0) {
    return (
      <div className="w-full h-[620px] bg-surface-50 rounded-2xl border border-border-default flex flex-col items-center justify-center space-y-4 text-center p-8">
        <Lightbulb className="w-12 h-12 text-secondary/40" />
        <div>
          <h3 className="text-lg font-bold text-primary">Belum Ada Data Peta Konsep</h3>
          <p className="text-secondary">AI perlu membuat kurikulum terlebih dahulu.</p>
        </div>
      </div>
    )
  }

  // Find selected concept node data
  const selectedNode = selectedConceptId ? data.nodes.find(n => n.id === selectedConceptId) : null

  return (
    <div className="relative w-full h-[620px] bg-surface-0/40 rounded-b-2xl overflow-hidden flex">
      {/* React Flow canvas */}
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex-1 h-full relative"
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
            maxZoom: 1.5,
          }}
          minZoom={0.1}
          maxZoom={2}
          className="roadmap-flow"
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={2} color="rgba(var(--secondary-rgb), 0.1)" />
          <Controls className="bg-surface-0 border-border-default shadow-md rounded-xl overflow-hidden" />
        </ReactFlow>

        {/* Floating action button to regenerate */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRegenerate}
            disabled={regenerate.isPending}
            className="bg-surface-0/80 backdrop-blur-sm border-border-default shadow-sm text-xs rounded-xl"
          >
            <Sparkles className="w-4 h-4 mr-2 text-warning" />
            {regenerate.isPending ? 'Menyusun ulang...' : 'Susun Ulang AI'}
          </Button>
        </div>
      </motion.div>

      {/* Side Panel for Concept Details */}
      <AnimatePresence>
        {selectedNode && (
          <ConceptDetailPanel
            conceptNode={selectedNode}
            courseTitle={courseTitle}
            allTopics={detailQuery.data?.weeks?.flatMap((w) => w.topics) || []}
            onClose={handleClosePanel}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
