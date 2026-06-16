/**
 * Unit tests for the Mermaid click-delegation helper.
 *
 * The actual MermaidMindmapView is a heavy React component that
 * dynamically imports `mermaid` (~700KB) and renders an SVG. We test
 * only the pure helper that maps clicked SVG text back to a data node
 * — that's the part with non-trivial logic.
 */
import { describe, test, expect } from 'vitest'
import { matchNodeByLabel } from '../mermaidUtils'

const sampleNodes = [
  { id: 'root', kind: 'root', label: 'Pemrograman Jaringan' },
  { id: 'cluster-week-1', kind: 'cluster', label: 'Minggu 1' },
  { id: 'concept-w1-0', kind: 'concept', label: 'Komponen Jaringan' },
  { id: 'topic-t1', kind: 'topic', label: 'Perangkat Keras' },
  { id: 'resource-r1', kind: 'resource', label: '🔗 Modul Jaringan' },
]

describe('matchNodeByLabel', () => {
  test('returns null for empty label', () => {
    expect(matchNodeByLabel('', sampleNodes)).toBeNull()
    expect(matchNodeByLabel(null, sampleNodes)).toBeNull()
    expect(matchNodeByLabel(undefined, sampleNodes)).toBeNull()
  })

  test('returns null for empty / non-array nodes', () => {
    expect(matchNodeByLabel('root', null)).toBeNull()
    expect(matchNodeByLabel('root', undefined)).toBeNull()
    expect(matchNodeByLabel('root', [])).toBeNull()
  })

  test('matches a node by exact label', () => {
    const matched = matchNodeByLabel('Komponen Jaringan', sampleNodes)
    expect(matched).not.toBeNull()
    expect(matched.id).toBe('concept-w1-0')
    expect(matched.kind).toBe('concept')
  })

  test('strips the leading 🔗 resource emoji before matching', () => {
    // Mermaid renders the resource node label as "🔗 Modul Jaringan" in
    // the SVG text element. The data node stores the same string, so
    // the helper should still match (after emoji stripping).
    const matched = matchNodeByLabel('Modul Jaringan', sampleNodes)
    expect(matched).not.toBeNull()
    expect(matched.id).toBe('resource-r1')
  })

  test('strips emoji + whitespace variants', () => {
    // Defensive: even if Mermaid adds extra whitespace around the emoji,
    // the helper should still match.
    const matched = matchNodeByLabel('  🔗  Modul Jaringan  ', sampleNodes)
    expect(matched).not.toBeNull()
    expect(matched.id).toBe('resource-r1')
  })

  test('returns null when no node matches', () => {
    expect(matchNodeByLabel('Nonexistent Concept', sampleNodes)).toBeNull()
  })

  test('skips nodes without a label defensively', () => {
    const nodesWithEmpty = [
      { id: 'broken', kind: 'topic', label: null },
      { id: 'good', kind: 'topic', label: 'T1' },
    ]
    expect(matchNodeByLabel('T1', nodesWithEmpty)).not.toBeNull()
    expect(matchNodeByLabel('T1', nodesWithEmpty).id).toBe('good')
  })

  test('coerces non-string input safely', () => {
    // Mermaid sometimes returns number/boolean labels from custom node
    // types — the helper should still match (after String coercion) and
    // never crash.
    const nodes = [{ id: 'n1', kind: 'topic', label: 42 }]
    // String(42) → "42" so this matches.
    expect(matchNodeByLabel('42', nodes).id).toBe('n1')

    // No label on the node → skipped.
    const nodesMissing = [{ id: 'n1', kind: 'topic' /* no label */ }]
    expect(matchNodeByLabel('42', nodesMissing)).toBeNull()

    // null label on a node → skipped, doesn't crash.
    const nodesNull = [{ id: 'n1', kind: 'topic', label: null }]
    expect(matchNodeByLabel('42', nodesNull)).toBeNull()
  })
})
