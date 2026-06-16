/**
 * Pure helpers used by ``MermaidMindmapView`` and its tests.
 *
 * Kept in a separate file (not a sub-component) so they can be unit-tested
 * without rendering React, jsdom, or the heavy mermaid bundle.
 */

/**
 * Match a clicked SVG node to the corresponding data node by label.
 *
 * Mermaid v11 auto-generates node ids that are unstable across renders
 * (e.g. ``flowchart-mindmapNode-1-0``), so the click-handler can't
 * rely on them. Instead we read the rendered SVG ``<text>`` content and
 * find the data node whose ``label`` matches.
 *
 * The leading resource-emoji ``🔗`` (a "link" glyph) is stripped before
 * matching because Mermaid renders it as part of the visible text.
 */
export function matchNodeByLabel(label, nodes) {
  if (!label || !Array.isArray(nodes) || nodes.length === 0) return null
  const cleaned = _stripResourceEmoji(String(label)).trim()
  if (!cleaned) return null
  for (const n of nodes) {
    if (!n || !n.label) continue
    const nodeLabel = _stripResourceEmoji(String(n.label)).trim()
    if (nodeLabel === cleaned) return n
  }
  return null
}

/**
 * Strip the leading ``🔗`` resource glyph (and any surrounding whitespace
 * on either side) from a label. Mermaid v11 preserves the emoji as part
 * of the rendered SVG text, so both the click-delegation input (from
 * the SVG) and the data node's stored label may carry it.
 */
function _stripResourceEmoji(s) {
  // Tolerate any combination of leading whitespace + emoji + whitespace.
  return s.replace(/^\s*🔗\s*/u, '')
}
