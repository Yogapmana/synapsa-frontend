/**
 * Smoke tests for the mind-map layout algorithm.
 *
 * These are pure-function tests, no React, no DOM, no backend.
 * The layout is the foundation of the visual: a wrong angle would
 * place 12 weeks on top of each other.
 */
import {
  buildOverviewLayout,
  buildWeekDetailLayout,
  buildConceptGraphLayout,
  buildElkGraphFromResponse,
  elkResultToReactFlow,
} from '../layout'
import { vi } from 'vitest'

// Minimal data stand-in for /mindmap-data response
const sampleData = {
  session_id: 'sid-1',
  course_title: 'Data Analyst',
  total_weeks: 3,
  total_topics: 9,
  completed_topics: 1,
  weeks: [
    {
      week_number: 1,
      title: 'Intro',
      total_duration_minutes: 180,
      completed_count: 1,
      active_topic_id: 't1-2',
      topics: [
        { id: 't1-1', title: 'A1', week_number: 1, day_number: 1,
          status: 'completed', duration_minutes: 60 },
        { id: 't1-2', title: 'A2', week_number: 1, day_number: 2,
          status: 'active', duration_minutes: 60 },
        { id: 't1-3', title: 'A3', week_number: 1, day_number: 3,
          status: 'locked', duration_minutes: 60 },
      ],
    },
    {
      week_number: 2,
      title: 'ML',
      total_duration_minutes: 180,
      completed_count: 0,
      active_topic_id: null,
      topics: [],
    },
    {
      week_number: 3,
      title: 'Stats',
      total_duration_minutes: 180,
      completed_count: 0,
      active_topic_id: null,
      topics: [],
    },
  ],
}

describe('buildOverviewLayout', () => {
  test('returns 1 root + N weeks for N weeks input', () => {
    const { nodes } = buildOverviewLayout(sampleData, { radius: 100 })
    // 1 root + 3 weeks = 4 nodes
    expect(nodes).toHaveLength(4)
    expect(nodes[0].id).toBe('root')
    expect(nodes[0].type).toBe('root')
    expect(nodes.slice(1).map((n) => n.type)).toEqual(['week', 'week', 'week'])
  })

  test('places weeks at equal angles around the root (no collision)', () => {
    const { nodes } = buildOverviewLayout(sampleData, { radius: 100 })
    const weekPositions = nodes.slice(1).map((n) => n.position)

    // 3 weeks = 120° apart
    // Verify all positions are distinct
    const unique = new Set(weekPositions.map((p) => `${p.x},${p.y}`))
    expect(unique.size).toBe(3)

    // Verify each is exactly `radius` away from center
    weekPositions.forEach((p) => {
      const dist = Math.sqrt(p.x * p.x + p.y * p.y)
      expect(dist).toBeCloseTo(100, 5)
    })
  })

  test('places first week at 12 o\'clock position (top of circle)', () => {
    // Default centerX=0, centerY=0, radius=100
    // First week should be at (0, -100) — top of circle
    const { nodes } = buildOverviewLayout(sampleData, {
      radius: 100, centerX: 0, centerY: 0,
    })
    const firstWeek = nodes[1]  // index 0 is root
    expect(firstWeek.position.x).toBeCloseTo(0, 5)
    expect(firstWeek.position.y).toBeCloseTo(-100, 5)
  })

  test('creates N edges (one per week) connecting root to week', () => {
    const { edges } = buildOverviewLayout(sampleData)
    expect(edges).toHaveLength(3)
    edges.forEach((e, i) => {
      expect(e.source).toBe('root')
      expect(e.target).toBe(`week-${i + 1}`)
      expect(e.type).toBe('smoothstep')
    })
  })

  test('marks active week edge as animated', () => {
    // Week 1 has active_topic_id, so its edge should be animated
    const { edges } = buildOverviewLayout(sampleData)
    const week1Edge = edges.find((e) => e.target === 'week-1')
    const week2Edge = edges.find((e) => e.target === 'week-2')
    expect(week1Edge.animated).toBe(true)
    expect(week2Edge.animated).toBe(false)
  })

  test('handles empty / missing data gracefully', () => {
    expect(buildOverviewLayout(null).nodes).toEqual([])
    expect(buildOverviewLayout({}).nodes).toEqual([])
    expect(buildOverviewLayout({ weeks: [] }).nodes).toEqual([])
  })
})

describe('buildWeekDetailLayout', () => {
  test('places 1 week-large + N topics for the selected week', () => {
    const week = sampleData.weeks[0]
    const { nodes } = buildWeekDetailLayout(week, 'sid-1')
    // 1 week + 3 topics = 4 nodes
    expect(nodes).toHaveLength(4)
    expect(nodes[0].type).toBe('week-large')
    expect(nodes.slice(1).map((n) => n.type)).toEqual(['topic', 'topic', 'topic'])
  })

  test('uses the provided sessionId in topic data', () => {
    const week = sampleData.weeks[0]
    const { nodes } = buildWeekDetailLayout(week, 'sid-xyz')
    nodes.slice(1).forEach((n) => {
      expect(n.data.sessionId).toBe('sid-xyz')
    })
  })

  test('center-aligns the row of topics (mean x is 0)', () => {
    const week = sampleData.weeks[0]
    const { nodes } = buildWeekDetailLayout(week, 'sid-1')
    const topicXs = nodes.slice(1).map((n) => n.position.x)
    const mean = topicXs.reduce((a, b) => a + b, 0) / topicXs.length
    expect(mean).toBeCloseTo(0, 5)
  })

  test('stagger pattern alternates topic Y position', () => {
    // 3 topics: i=0 → y=200, i=1 → y=240, i=2 → y=200
    const week = sampleData.weeks[0]
    const { nodes } = buildWeekDetailLayout(week, 'sid-1')
    const topicYs = nodes.slice(1).map((n) => n.position.y)
    expect(topicYs).toEqual([200, 240, 200])
  })

  test('creates one edge per topic connecting week to topic', () => {
    const week = sampleData.weeks[0]
    const { edges } = buildWeekDetailLayout(week, 'sid-1')
    expect(edges).toHaveLength(3)
    edges.forEach((e) => {
      expect(e.source).toBe('week-1')
      expect(e.target).toMatch(/^topic-/)
    })
  })

  test('marks the active topic edge as animated', () => {
    // Week 1 has t1-2 as active. The edge to that topic should be animated.
    const week = sampleData.weeks[0]
    const { edges } = buildWeekDetailLayout(week, 'sid-1')
    const activeEdge = edges.find((e) => e.target === 'topic-t1-2')
    const completedEdge = edges.find((e) => e.target === 'topic-t1-1')
    expect(activeEdge.animated).toBe(true)
    expect(completedEdge.animated).toBe(false)
  })

  test('handles empty topics gracefully', () => {
    const emptyWeek = { week_number: 99, title: 'Empty', topics: [] }
    const { nodes, edges } = buildWeekDetailLayout(emptyWeek, 'sid-1')
    expect(nodes).toEqual([])
    expect(edges).toEqual([])
  })
})

// --------------------------------------------------------------------------- //
// Concept graph layout
// --------------------------------------------------------------------------- //

const sampleConceptGraph = {
  session_id: 'sid-1',
  course_title: 'Data Analyst',
  generated_at: '2026-06-15T00:00:00Z',
  model: 'llama-3.3-70b-versatile',
  cached: false,
  build_seconds: 1.2,
  node_count: 5,
  edge_count: 4,
  nodes: [
    { id: 'root', kind: 'root', label: 'Data Analyst', data: { courseTitle: 'Data Analyst' } },
    {
      id: 'cluster-week-1',
      kind: 'cluster',
      label: 'Minggu 1',
      week_number: 1,
      data: { weekNumber: 1, title: 'Pengenalan', topicsCount: 2 },
    },
    {
      id: 'concept-w1-0',
      kind: 'concept',
      label: 'SQL',
      description: 'Structured query language for relational databases',
      topic_count: 2,
      data: { label: 'SQL', description: '...', topicIds: ['t1', 't2'], topicCount: 2, weekNumber: 1 },
    },
    {
      id: 'topic-t1',
      kind: 'topic',
      label: 'Dasar SQL',
      topic_id: 't1',
      week_number: 1,
      day_number: 1,
      status: 'active',
      duration_minutes: 60,
      data: { id: 't1', title: 'Dasar SQL', weekNumber: 1, dayNumber: 1, status: 'active' },
    },
    {
      id: 'resource-r1',
      kind: 'resource',
      label: 'SQL Tutorial',
      url: 'https://example.com/sql',
      link_type: 'video',
      platform: 'youtube',
      topic_id: 't1',
      data: { title: 'SQL Tutorial', url: 'https://example.com/sql', linkType: 'video' },
    },
  ],
  edges: [
    { id: 'e1', source: 'root', target: 'cluster-week-1', relation: 'root_to_cluster', weight: 0.6 },
    { id: 'e2', source: 'cluster-week-1', target: 'concept-w1-0', relation: 'cluster_to_concept', weight: 0.7 },
    { id: 'e3', source: 'concept-w1-0', target: 'topic-t1', relation: 'concept_to_topic', weight: 0.8 },
    { id: 'e4', source: 'topic-t1', target: 'resource-r1', relation: 'topic_to_resource', weight: 0.5 },
  ],
}

describe('buildElkGraphFromResponse', () => {
  test('produces one ELK node per backend node with fixed dimensions', () => {
    const { nodes } = buildElkGraphFromResponse(sampleConceptGraph)
    // Cluster node is dropped, so 5 - 1 = 4 nodes
    expect(nodes).toHaveLength(4)
    const kinds = nodes.map((n) => n.id)
    expect(kinds).toEqual(['root', 'concept-w1-0', 'topic-t1', 'resource-r1'])
  })

  test('converts edges to ELK sources/targets format', () => {
    const { edges } = buildElkGraphFromResponse(sampleConceptGraph)
    // Cluster edges and concept_to_concept edges are dropped, leaving 3 edges
    expect(edges).toHaveLength(3)
    edges.forEach((e) => {
      expect(Array.isArray(e.sources)).toBe(true)
      expect(Array.isArray(e.targets)).toBe(true)
    })
  })

  test('handles empty/missing graph gracefully', () => {
    expect(buildElkGraphFromResponse(null).nodes).toEqual([])
    expect(buildElkGraphFromResponse({}).nodes).toEqual([])
    expect(buildElkGraphFromResponse({ nodes: [], edges: [] }).nodes).toEqual([])
  })
})

describe('elkResultToReactFlow', () => {
  test('returns React Flow-shaped nodes with position set from ELK output', () => {
    const elkResult = {
      children: [
        { id: 'root', x: 0, y: 0, width: 176, height: 176 },
        { id: 'cluster-week-1', x: 300, y: 0, width: 260, height: 60 },
        { id: 'concept-w1-0', x: 700, y: 50, width: 180, height: 72 },
      ],
      edges: [{ id: 'e1', sources: ['root'], targets: ['cluster-week-1'] }],
    }
    const { nodes, edges } = elkResultToReactFlow(elkResult, sampleConceptGraph)
    expect(nodes).toHaveLength(3)
    expect(nodes[0].position).toEqual({ x: 0, y: 0 })
    expect(nodes[1].position).toEqual({ x: 300, y: 0 })
    expect(nodes[1].type).toBe('cluster')  // kind is preserved
    expect(edges[0].source).toBe('root')
    expect(edges[0].target).toBe('cluster-week-1')
  })

  test('sets cluster nodes explicit width/height for React Flow parent bounding box', () => {
    const elkResult = {
      children: [
        { id: 'cluster-week-1', x: 100, y: 100, width: 280, height: 80 },
      ],
      edges: [],
    }
    const { nodes } = elkResultToReactFlow(elkResult, sampleConceptGraph)
    const cluster = nodes.find((n) => n.id === 'cluster-week-1')
    expect(cluster.style).toEqual({ width: 280, height: 80 })
  })

  test('concept-to-concept edges get highlight style; structural edges get default', () => {
    const graphWithCross = {
      ...sampleConceptGraph,
      edges: [
        ...sampleConceptGraph.edges,
        { id: 'e5', source: 'concept-w1-0', target: 'concept-w1-0', relation: 'concept_to_concept', weight: 0.3 },
      ],
    }
    const elkResult = {
      children: sampleConceptGraph.nodes.map((n, i) => ({ id: n.id, x: i * 100, y: 0, width: 100, height: 50 })),
      edges: [
        { id: 'e1', sources: ['root'], targets: ['cluster-week-1'] },
        { id: 'e5', sources: ['concept-w1-0'], targets: ['concept-w1-0'] },
      ],
    }
    const { edges } = elkResultToReactFlow(elkResult, graphWithCross)
    const structural = edges.find((e) => e.id === 'e1')
    const crossConcept = edges.find((e) => e.id === 'e5')
    expect(structural.style.stroke).toBe('rgb(var(--border-default))')
    expect(crossConcept.style.stroke).toBe('rgb(var(--tertiary))')
  })

  test('preserves the relation label in edge data', () => {
    const elkResult = {
      children: [],
      edges: [{ id: 'e1', sources: ['root'], targets: ['cluster-week-1'] }],
    }
    const { edges } = elkResultToReactFlow(elkResult, sampleConceptGraph)
    expect(edges[0].data.relation).toBe('root_to_cluster')
    expect(edges[0].data.weight).toBe(0.6)
  })
})

describe('buildConceptGraphLayout', () => {
  test('returns {nodes, edges} via injected stub ELK', async () => {
    // Stub ELK that just returns the input graph with positions
    const stubElk = {
      layout: vi.fn(async (graph) => ({
        children: graph.children.map((n, i) => ({
          ...n,
          x: i * 200,
          y: 0,
        })),
        edges: graph.edges,
      })),
    }
    const { nodes, edges } = await buildConceptGraphLayout(sampleConceptGraph, {
      elk: stubElk,
    })
    expect(nodes).toHaveLength(4)
    expect(edges).toHaveLength(3)
    expect(stubElk.layout).toHaveBeenCalledTimes(1)
  })

  test('returns empty result for empty graph', async () => {
    const stubElk = { layout: vi.fn() }
    const { nodes, edges } = await buildConceptGraphLayout(
      { nodes: [], edges: [] },
      { elk: stubElk },
    )
    expect(nodes).toEqual([])
    expect(edges).toEqual([])
    expect(stubElk.layout).not.toHaveBeenCalled()
  })

  test('passes layered algorithm and DOWN direction to ELK by default', async () => {
    const stubElk = {
      layout: vi.fn(async (graph) => ({ children: graph.children, edges: graph.edges })),
    }
    await buildConceptGraphLayout(sampleConceptGraph, { elk: stubElk })
    const input = stubElk.layout.mock.calls[0][0]
    expect(input.layoutOptions.algorithm).toBe('layered')
    expect(input.layoutOptions.direction).toBe('DOWN')
  })
})
