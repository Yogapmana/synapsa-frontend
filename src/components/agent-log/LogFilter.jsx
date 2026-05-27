import { useAgentLogStore } from '@/stores/agentLogStore'
import { AGENT_COLORS, AGENT_LABELS } from '@/utils/constants'
import { Button } from '@/components/ui/button'

const agentEntries = Object.entries(AGENT_COLORS)

export default function LogFilter() {
  const filter = useAgentLogStore((s) => s.filter)
  const setFilter = useAgentLogStore((s) => s.setFilter)
  const clearLogs = useAgentLogStore((s) => s.clearLogs)

  const allActive = filter.length === 0 || filter.length === agentEntries.length

  function toggleAgent(agentKey) {
    if (filter.length === 0) {
      setFilter(agentEntries.filter(([k]) => k !== agentKey).map(([k]) => k))
      return
    }
    if (filter.includes(agentKey)) {
      const next = filter.filter((a) => a !== agentKey)
      setFilter(next.length === 0 ? [] : next)
    } else {
      setFilter([...filter, agentKey])
    }
  }

  function selectAll() {
    setFilter([])
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant={allActive ? 'default' : 'outline'}
        size="sm"
        onClick={selectAll}
      >
        Semua
      </Button>

      {agentEntries.map(([key, color]) => {
        const active = filter.length === 0 || filter.includes(key)
        return (
          <Button
            key={key}
            variant={active ? 'default' : 'outline'}
            size="sm"
            className={active ? 'text-white' : ''}
            style={active ? { backgroundColor: color, borderColor: color } : {}}
            onClick={() => toggleAgent(key)}
          >
            {AGENT_LABELS[key]}
          </Button>
        )
      })}

      <Button variant="ghost" size="sm" onClick={clearLogs} className="ml-auto text-muted-foreground">
        Bersihkan log
      </Button>
    </div>
  )
}