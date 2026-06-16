/**
 * Layout utilities for the mind map.
 *
 * Two layout algorithms are implemented:
 *
 * 1. **Radial** — used for the overview. Places 1 root at the center and
 *    N weeks at equal angles around it. Simple trigonometry, no extra deps.
 *
 * 2. **Hierarchical** — used for the week-detail view. Places 1 week at
 *    top-center and N topics in a row below it (with a stagger for
 *    visual interest).
 *
 * Both return ``{ nodes, edges }`` in the shape React Flow v12 expects.
 */
import { MarkerType } from '@xyflow/react'

/**
 * Compute positions for the OVERVIEW (root + N weeks in a circle).
 *
 * @param {Object} data - response from /mindmap-data
 * @param {Object} options
 * @param {number} options.radius - distance from root to each week node
 * @param {number} options.centerX - root x position
 * @param {number} options.centerY - root y position
 */
export function buildOverviewLayout(data, { radius = 420, centerX = 0, centerY = 0 } = {}) {
  if (!data || !data.weeks || data.weeks.length === 0) {
    return { nodes: [], edges: [] }
  }

  const nodes = []
  const edges = []

  // ── Root node (center) ──
  nodes.push({
    id: 'root',
    type: 'root',
    position: { x: centerX, y: centerY },
    data: {
      courseTitle: data.course_title,
      totalWeeks: data.total_weeks,
      totalTopics: data.total_topics,
      completedTopics: data.completed_topics,
    },
    draggable: true,
    selectable: true,
  })

  // ── Week nodes around the root ──
  const weeks = data.weeks
  const total = weeks.length
  // Start at 12 o'clock (top), go clockwise. So subtract PI/2.
  const startAngle = -Math.PI / 2

  weeks.forEach((week, i) => {
    const angle = startAngle + (i * 2 * Math.PI) / total
    const x = centerX + radius * Math.cos(angle)
    const y = centerY + radius * Math.sin(angle)

    nodes.push({
      id: `week-${week.week_number}`,
      type: 'week',
      position: { x, y },
      data: {
        weekNumber: week.week_number,
        title: week.title,
        topicsCount: week.topics.length,
        completedCount: week.completed_count,
        totalDurationMinutes: week.total_duration_minutes,
        activeTopicId: week.active_topic_id,
        isActive: !!week.active_topic_id,
        isCompleted:
          week.topics.length > 0 && week.completed_count === week.topics.length,
        sessionId: data.session_id,
      },
      draggable: true,
      selectable: true,
    })

    edges.push({
      id: `root-to-week-${week.week_number}`,
      source: 'root',
      target: `week-${week.week_number}`,
      type: 'smoothstep',
      animated: !!week.active_topic_id,
      style: {
        stroke: week.active_topic_id
          ? 'rgb(var(--tertiary))'
          : 'rgb(var(--border-default))',
        strokeWidth: 1.5,
        strokeOpacity: week.active_topic_id ? 0.7 : 0.4,
      },
      markerEnd: undefined,
    })
  })

  return { nodes, edges }
}

/**
 * Compute positions for the DETAIL view (1 week + N topics).
 *
 * Layout:
 *   - Week node at the top center
 *   - 5 topic nodes below in a horizontal row, slightly staggered
 *     (alternating Y offset for visual interest)
 *
 * @param {Object} week - one WeekNode from /mindmap-data
 * @param {string} sessionId
 */
export function buildWeekDetailLayout(week, sessionId) {
  if (!week || !week.topics || week.topics.length === 0) {
    return { nodes: [], edges: [] }
  }

  const nodes = []
  const edges = []

  // ── Week node (top) ──
  nodes.push({
    id: `week-${week.week_number}`,
    type: 'week-large',
    position: { x: 0, y: 0 },
    data: {
      weekNumber: week.week_number,
      title: week.title,
      topicsCount: week.topics.length,
      completedCount: week.completed_count,
      totalDurationMinutes: week.total_duration_minutes,
      isDetail: true,
    },
    draggable: true,
    selectable: true,
  })

  // ── Topic nodes below the week ──
  const topics = week.topics
  const colSpacing = 240  // horizontal distance between topics
  const totalWidth = (topics.length - 1) * colSpacing
  const startX = -totalWidth / 2  // center the row

  topics.forEach((topic, i) => {
    // Slight Y stagger for organic feel
    const yOffset = i % 2 === 0 ? 200 : 240
    const x = startX + i * colSpacing

    nodes.push({
      id: `topic-${topic.id}`,
      type: 'topic',
      position: { x, y: yOffset },
      data: {
        id: topic.id,
        title: topic.title,
        weekNumber: topic.week_number,
        dayNumber: topic.day_number,
        status: topic.status,
        durationMinutes: topic.duration_minutes,
        sessionId,
      },
      draggable: true,
      selectable: true,
    })

    edges.push({
      id: `week-${week.week_number}-to-topic-${topic.id}`,
      source: `week-${week.week_number}`,
      target: `topic-${topic.id}`,
      type: 'smoothstep',
      animated: topic.status === 'active',
      style: {
        stroke:
          topic.status === 'completed'
            ? 'rgb(var(--success))'
            : topic.status === 'active'
              ? 'rgb(var(--tertiary))'
              : 'rgb(var(--border-default))',
        strokeWidth: 1.5,
        strokeOpacity: topic.status === 'locked' ? 0.4 : 0.7,
      },
    })
  })

  return { nodes, edges }
}

// --------------------------------------------------------------------------- //
// Concept Graph layout (ELK.js auto-layout)
// --------------------------------------------------------------------------- //

/**
 * Fixed node dimensions per kind. The custom node components use these
 * dimensions in their CSS (see ClusterNode/ConceptNode/ResourceNode/TopicNode).
 * Centralized here so layout sizes stay in sync with the components.
 */
const CONCEPT_NODE_DIMS = {
  root: { width: 176, height: 176 },
  cluster: { width: 260, height: 60 },
  concept: { width: 180, height: 72 },
  topic: { width: 220, height: 110 },
  subtopic: { width: 180, height: 60 },
  resource: { width: 150, height: 44 },
}

/**
 * Build a fallback ``data`` object for nodes that don't have a pre-shaped
 * ``data`` field (defensive — the service always supplies one, but this
 * keeps the layout usable if the response shape ever changes).
 */
function _buildFallbackData(original) {
  return {
    label: original.label,
    description: original.description,
    // Topic
    id: original.topic_id,
    title: original.label,
    weekNumber: original.week_number,
    dayNumber: original.day_number,
    status: original.status,
    durationMinutes: original.duration_minutes,
    // Concept
    topicIds: original.topic_ids,
    topicCount: original.topic_count,
    // Cluster
    topicsCount: original.topics_count,
    // Resource
    url: original.url,
    linkType: original.link_type,
    platform: original.platform,
    topicId: original.topic_id,
    // Root
    courseTitle: original.label,
    totalWeeks: original.total_weeks,
    totalTopics: original.total_topics,
    completedTopics: original.completed_topics,
  }
}

/**
 * Build the ELK input graph from a ConceptGraphResponse.
 * Pure function — extracted from buildConceptGraphLayout for testability.
 */
export function buildElkGraphFromResponse(graphData) {
  if (!graphData || !Array.isArray(graphData.nodes) || graphData.nodes.length === 0) {
    return { nodes: [], edges: [] }
  }

  // Find the first concept to link from root (since we remove clusters)
  const concepts = graphData.nodes.filter(n => n.kind === 'concept');
  concepts.sort((a, b) => {
    // sort by week number if available, then by ID
    const wa = a.data?.weekNumber || 0;
    const wb = b.data?.weekNumber || 0;
    if (wa !== wb) return wa - wb;
    return a.id.localeCompare(b.id);
  });
  const firstConceptId = concepts.length > 0 ? concepts[0].id : null;

  const nodes = []
  graphData.nodes.forEach((n) => {
    // Drop cluster nodes for Roadmap layout
    if (n.kind === 'cluster') return;

    const dims = CONCEPT_NODE_DIMS[n.kind] || CONCEPT_NODE_DIMS.topic
    nodes.push({
      id: n.id,
      width: dims.width,
      height: dims.height,
    })
  })

  const edges = []
  ;(graphData.edges || []).forEach((e) => {
    // Drop edges that connect to/from clusters
    if (e.relation === 'root_to_cluster') return;
    if (e.relation === 'cluster_to_concept') return;
    if (e.relation === 'cluster_to_topic') return;
    
    // DROP ALL backend concept_to_concept edges (they cause messy cross-cutting paths)
    if (e.relation === 'concept_to_concept') return;

    edges.push({
      id: e.id,
      sources: [e.source],
      targets: [e.target],
    })
  })

  // Synthetically link root to the first concept
  if (firstConceptId) {
    edges.push({
      id: 'root-to-first-concept',
      sources: ['root'],
      targets: [firstConceptId],
    })
  }

  // Synthetically link ALL concepts in a single sequence (the strict spine)
  for (let i = 0; i < concepts.length - 1; i++) {
    edges.push({
      id: `synthetic-spine-${concepts[i].id}-${concepts[i+1].id}`,
      sources: [concepts[i].id],
      targets: [concepts[i+1].id],
    })
  }

  return { nodes, edges }
}

/**
 * Convert ELK layout output to React Flow v12 nodes/edges shape.
 * Pure function — extracted for testability.
 */
export function elkResultToReactFlow(elkResult, originalGraph) {
  const lookup = new Map()
  for (const n of originalGraph.nodes || []) {
    lookup.set(n.id, n)
  }

  const nodes = (elkResult.children || []).map((elkNode) => {
    const original = lookup.get(elkNode.id) || {}
    const dims = CONCEPT_NODE_DIMS[original.kind] || CONCEPT_NODE_DIMS.topic
    const node = {
      id: elkNode.id,
      type: original.kind || 'topic',
      position: { x: elkNode.x || 0, y: elkNode.y || 0 },
      // Prefer the original node's `data` object (the service pre-shapes
      // it per-kind). Fall back to a generic bag keyed off snake_case
      // backend fields if no data was provided.
      data: original.data && Object.keys(original.data).length > 0
        ? original.data
        : _buildFallbackData(original),
      draggable: true,
      selectable: true,
    }
    // Cluster nodes with children need explicit width/height on the node
    // itself so React Flow's parent bounding box is correct.
    if (original.kind === 'cluster') {
      node.style = { width: elkNode.width || dims.width, height: elkNode.height || dims.height }
    }
    return node
  })

  const edges = (elkResult.edges || []).map((elkEdge) => {
    if (elkEdge.id === 'root-to-first-concept') {
      return {
        id: elkEdge.id,
        source: elkEdge.sources[0],
        target: elkEdge.targets[0],
        type: 'smoothstep',
        style: { stroke: 'rgb(var(--tertiary))', strokeWidth: 2, strokeOpacity: 0.8 },
        data: { relation: 'root_to_concept', weight: 1.0 },
      }
    }
    if (elkEdge.id.startsWith('synthetic-spine-')) {
      return {
        id: elkEdge.id,
        source: elkEdge.sources[0],
        target: elkEdge.targets[0],
        type: 'smoothstep',
        style: { stroke: 'rgb(var(--tertiary))', strokeWidth: 2, strokeOpacity: 0.8 },
        data: { relation: 'concept_to_concept', weight: 1.0 },
      }
    }
    const originalEdge = (originalGraph.edges || []).find((e) => e.id === elkEdge.id) || {}
    const isConceptToConcept = originalEdge.relation === 'concept_to_concept'
    return {
      id: elkEdge.id,
      source: elkEdge.sources[0],
      target: elkEdge.targets[0],
      type: 'smoothstep',
      style: isConceptToConcept
        ? {
            stroke: 'rgb(var(--tertiary))',
            strokeWidth: 2,
            strokeOpacity: 0.8,
          }
        : {
            stroke: 'rgb(var(--border-default))',
            strokeWidth: 1.5,
            strokeOpacity: 0.6,
          },
      data: { relation: originalEdge.relation, weight: originalEdge.weight ?? 1.0 },
    }
  })

  return { nodes, edges }
}

/**
 * Compute positions for the CONCEPT GRAPH view (root + clusters + concepts +
 * topics + resources) using ELK.js layered layout.
 *
 * Pure-ish: ELK itself is async, so this returns a Promise. The split into
 * ``buildElkGraphFromResponse`` + ``elkResultToReactFlow`` keeps the shape
 * transformation testable without a real ELK instance.
 *
 * @param {Object} graphData - ConceptGraphResponse payload
 * @param {Object} [options]
 * @param {Object} [options.elk] - Injectable ELK instance (for tests)
 * @param {Object} [options.layoutOptions] - Extra ELK layout options
 */
export async function buildConceptGraphLayout(graphData, options = {}) {
  if (!graphData || !Array.isArray(graphData.nodes) || graphData.nodes.length === 0) {
    return { nodes: [], edges: [] }
  }

  // Lazy import ELK so the radial "Overview" view doesn't pay for it.
  const { elk } = options.elk
    ? { elk: options.elk }
    : await import('./elk').then((m) => ({ elk: m.elk }))

  const elkGraph = buildElkGraphFromResponse(graphData)
  if (elkGraph.nodes.length === 0) {
    return { nodes: [], edges: [] }
  }

  const layoutOptions = {
    algorithm: 'layered',
    direction: 'DOWN',
    'elk.layered.spacing.nodeNodeBetweenLayers': '60',
    'elk.spacing.nodeNode': '60',
    'elk.layered.crossingMinimization.semiInteractive': 'true',
    'elk.aspectRatio': '1.0',
    'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
    'elk.edgeRouting': 'ORTHOGONAL',
    'elk.portConstraints': 'FREE',
    ...(options.layoutOptions || {}),
  }

  const elkInput = {
    id: 'root',
    layoutOptions,
    children: elkGraph.nodes,
    edges: elkGraph.edges,
  }

  const elkResult = await elk.layout(elkInput)
  return elkResultToReactFlow(elkResult, graphData)
}
