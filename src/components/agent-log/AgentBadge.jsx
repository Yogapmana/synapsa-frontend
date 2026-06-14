import { AGENT_LABELS } from '@/utils/constants'
import { cn } from '@/lib/utils'

const AGENT_STYLES = {
  orchestrator: 'bg-secondary/15 text-secondary',
  planner: 'bg-info/15 text-info-fg',
  researcher: 'bg-tertiary/15 text-tertiary',
  composer: 'bg-warning/15 text-warning-fg',
  tutor: 'bg-success/15 text-success-fg',
}

const agentKeys = Object.keys(AGENT_LABELS)

export default function AgentBadge({ agent }) {
  const label = AGENT_LABELS[agent] ?? agent
  const style = AGENT_STYLES[agent] ?? 'bg-secondary/15 text-secondary'

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold',
        style
      )}
    >
      {label}
    </span>
  )
}

export { agentKeys }