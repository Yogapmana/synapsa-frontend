import { AGENT_COLORS, AGENT_LABELS } from '@/utils/constants'

const agentKeys = Object.keys(AGENT_COLORS)

export default function AgentBadge({ agent }) {
  const color = AGENT_COLORS[agent] ?? '#6b7280'
  const label = AGENT_LABELS[agent] ?? agent

  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold text-white"
      style={{ backgroundColor: color }}
    >
      {label}
    </span>
  )
}

export { agentKeys }