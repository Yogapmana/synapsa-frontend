import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

/**
 * Abstract Concept Graph wireframe — pure SVG nodes/edges in brand tones.
 * Used as a hero stage backdrop and as a mini visual inside the bento card.
 */
export default function ConceptGraphWireframe({
  className,
  compact = false,
  animated = true,
}) {
  const shouldReduceMotion = useReducedMotion()
  const reduce = shouldReduceMotion || !animated

  // Node positions in a 400×320 viewBox
  const nodes = compact
    ? [
        { id: 'a', cx: 80, cy: 90, r: 14, label: 'Topik' },
        { id: 'b', cx: 200, cy: 50, r: 18, label: 'Konsep' },
        { id: 'c', cx: 320, cy: 100, r: 14, label: 'Modul' },
        { id: 'd', cx: 140, cy: 200, r: 12, label: 'Kuis' },
        { id: 'e', cx: 260, cy: 220, r: 16, label: 'Tutor' },
      ]
    : [
        { id: 'a', cx: 70, cy: 100, r: 16, label: 'Topik' },
        { id: 'b', cx: 180, cy: 45, r: 20, label: 'Konsep A' },
        { id: 'c', cx: 310, cy: 70, r: 14, label: 'Sub-bab' },
        { id: 'd', cx: 360, cy: 180, r: 18, label: 'Modul' },
        { id: 'e', cx: 240, cy: 240, r: 15, label: 'Kuis' },
        { id: 'f', cx: 100, cy: 230, r: 13, label: 'Tutor' },
        { id: 'g', cx: 200, cy: 150, r: 22, label: 'Inti' },
      ]

  const edges = compact
    ? [
        ['a', 'b'],
        ['b', 'c'],
        ['a', 'd'],
        ['b', 'e'],
        ['d', 'e'],
        ['c', 'e'],
      ]
    : [
        ['a', 'b'],
        ['b', 'c'],
        ['c', 'd'],
        ['d', 'e'],
        ['e', 'f'],
        ['f', 'a'],
        ['g', 'a'],
        ['g', 'b'],
        ['g', 'c'],
        ['g', 'd'],
        ['g', 'e'],
        ['g', 'f'],
      ]

  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]))

  return (
    <div className={cn('relative w-full select-none', className)} aria-hidden="true">
      <svg
        viewBox={compact ? '0 0 400 280' : '0 0 400 320'}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
      >
        {/* Soft ambient glow behind graph */}
        <defs>
          <radialGradient id="graph-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#C4251C" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#C4251C" stopOpacity="0" />
          </radialGradient>
          <filter id="node-soft" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <ellipse
          cx="200"
          cy={compact ? 140 : 160}
          rx="160"
          ry="110"
          fill="url(#graph-glow)"
        />

        {/* Edges */}
        {edges.map(([from, to], i) => {
          const a = nodeMap[from]
          const b = nodeMap[to]
          if (!a || !b) return null
          return (
            <motion.line
              key={`${from}-${to}`}
              x1={a.cx}
              y1={a.cy}
              x2={b.cx}
              y2={b.cy}
              stroke="#C4251C"
              strokeWidth="1.25"
              strokeDasharray="4 6"
              initial={reduce ? false : { opacity: 0 }}
              animate={reduce ? { opacity: 0.22 } : { opacity: 0.22 }}
              transition={{ duration: 0.6, delay: 0.15 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
            />
          )
        })}

        {/* Nodes */}
        {nodes.map((node, i) => {
          const isCore = node.id === 'g' || (!compact && node.label === 'Inti')
          return (
            <motion.g
              key={node.id}
              initial={reduce ? false : { opacity: 0, scale: 0.6 }}
              animate={reduce ? {} : { opacity: 1, scale: 1 }}
              transition={{
                duration: 0.45,
                delay: 0.35 + i * 0.07,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{ transformOrigin: `${node.cx}px ${node.cy}px` }}
            >
              {/* Outer ring */}
              <circle
                cx={node.cx}
                cy={node.cy}
                r={node.r + 6}
                fill="#FFFBEF"
                stroke="#C4251C"
                strokeWidth="1"
                strokeOpacity={isCore ? 0.35 : 0.15}
              />
              {/* Core fill */}
              <circle
                cx={node.cx}
                cy={node.cy}
                r={node.r}
                fill={isCore ? '#C4251C' : '#FFFBEF'}
                stroke={isCore ? '#9A1E16' : '#C4BEB1'}
                strokeWidth="1.5"
                filter="url(#node-soft)"
              />
              {/* Label */}
              <text
                x={node.cx}
                y={node.cy + node.r + 14}
                textAnchor="middle"
                className="font-label"
                fill="#7B766D"
                fontSize="10"
                letterSpacing="0.04em"
              >
                {node.label}
              </text>
            </motion.g>
          )
        })}
      </svg>
    </div>
  )
}
