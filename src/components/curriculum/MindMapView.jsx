import React from 'react'
import EnhancedMindmapView from './EnhancedMindmapView'

export default function MindMapView({ sessionId, courseTitle }) {
  // Directly render the structured detail (EnhancedMindmapView)
  // as the visual mindmap (ReactFlow) has been removed per user request.
  return (
    <div className="space-y-4">
      <EnhancedMindmapView sessionId={sessionId} />
    </div>
  )
}
