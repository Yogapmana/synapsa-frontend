import { useState, useCallback } from 'react'
import { useAgentLogStore } from '@/stores/agentLogStore'
import { AGENT_LABELS } from '@/utils/constants'
import { cn } from '@/lib/utils'
import { Search, X, RefreshCw } from 'lucide-react'

const AGENT_KEYS = Object.keys(AGENT_LABELS)
const LEVEL_OPTIONS = [
  { key: 'INFO', label: 'Info' },
  { key: 'WARNING', label: 'Warning' },
  { key: 'ERROR', label: 'Error' },
]
const DATE_OPTIONS = [
  { key: 'all', label: 'Semua waktu' },
  { key: 'today', label: 'Hari ini' },
  { key: 'yesterday', label: 'Kemarin' },
  { key: 'week', label: '7 hari terakhir' },
]

export default function LogFilter({ onSearchChange, onLevelFilterChange, onDateFilterChange, autoRefresh, onToggleAutoRefresh }) {
  const filter = useAgentLogStore((s) => s.filter)
  const setFilter = useAgentLogStore((s) => s.setFilter)
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState([])
  const [dateFilter, setDateFilter] = useState('all')

  const allActive = filter.length === 0 || filter.length === AGENT_KEYS.length

  function toggleAgent(agentKey) {
    if (filter.length === 0) {
      setFilter(AGENT_KEYS.filter((k) => k !== agentKey))
      return
    }
    if (filter.includes(agentKey)) {
      const next = filter.filter((a) => a !== agentKey)
      setFilter(next.length === 0 ? [] : next)
    } else {
      setFilter([...filter, agentKey])
    }
  }

  function toggleLevel(level) {
    setLevelFilter((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    )
  }

  function handleSearchChange(e) {
    setSearch(e.target.value)
    onSearchChange?.(e.target.value)
  }

  function handleLevelChange(level) {
    toggleLevel(level)
    const next = levelFilter.includes(level)
      ? levelFilter.filter((l) => l !== level)
      : [...levelFilter, level]
    onLevelFilterChange?.(next)
  }

  function handleDateChange(key) {
    setDateFilter(key)
    onDateFilterChange?.(key)
  }

  function resetFilters() {
    setFilter([])
    setSearch('')
    setLevelFilter([])
    setDateFilter('all')
    onSearchChange?.('')
    onLevelFilterChange?.([])
    onDateFilterChange?.('all')
  }

  const hasActiveFilters = filter.length > 0 || search || levelFilter.length > 0 || dateFilter !== 'all'

  return (
    <div className="space-y-3">
      {/* Search + Auto-refresh row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Cari log..."
            className="w-full rounded-lg border border-border bg-surface pl-9 pr-3 py-2 text-sm text-primary placeholder:text-secondary/60 focus:outline-none focus:ring-2 focus:ring-tertiary/30 focus:border-tertiary/50 transition-colors"
          />
        </div>
        <button
          onClick={onToggleAutoRefresh}
          className={cn(
            'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
            autoRefresh
              ? 'border-tertiary/30 bg-tertiary/10 text-tertiary'
              : 'border-border bg-surface text-secondary hover:text-primary hover:border-border-strong'
          )}
          title={autoRefresh ? 'Auto-refresh aktif' : 'Aktifkan auto-refresh'}
        >
          <RefreshCw
            size={14}
            className={cn(autoRefresh && 'animate-spin')}
            style={autoRefresh ? { animationDuration: '3s' } : undefined}
          />
          <span className="hidden sm:inline">Auto</span>
        </button>
      </div>

      {/* Agent type pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-label text-xs uppercase tracking-wider text-secondary mr-1">Agent</span>
        <button
          onClick={() => setFilter([])}
          className={cn(
            'pill transition-colors',
            allActive
              ? 'bg-tertiary text-white'
              : 'border border-border bg-surface text-primary hover:border-border-strong'
          )}
        >
          Semua
        </button>
        {AGENT_KEYS.map((key) => {
          const active = filter.length === 0 || filter.includes(key)
          return (
            <button
              key={key}
              onClick={() => toggleAgent(key)}
              className={cn(
                'pill transition-colors',
                active
                  ? 'bg-tertiary text-white'
                  : 'border border-border bg-surface text-primary hover:border-border-strong'
              )}
            >
              {AGENT_LABELS[key]}
            </button>
          )
        })}
      </div>

      {/* Level pills + Date range */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-label text-xs uppercase tracking-wider text-secondary mr-1">Level</span>
        {LEVEL_OPTIONS.map(({ key, label }) => {
          const active = levelFilter.includes(key)
          return (
            <button
              key={key}
              onClick={() => handleLevelChange(key)}
              className={cn(
                'pill transition-colors',
                active
                  ? key === 'INFO'
                    ? 'bg-info text-white'
                    : key === 'WARNING'
                    ? 'bg-warning text-white'
                    : 'bg-danger text-white'
                  : 'border border-border bg-surface text-primary hover:border-border-strong'
              )}
            >
              {label}
            </button>
          )
        })}

        <span className="mx-2 h-4 w-px bg-border" />

        <span className="font-label text-xs uppercase tracking-wider text-secondary mr-1">Waktu</span>
        {DATE_OPTIONS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handleDateChange(key)}
            className={cn(
              'pill transition-colors',
              dateFilter === key
                ? 'bg-tertiary text-white'
                : 'border border-border bg-surface text-primary hover:border-border-strong'
            )}
          >
            {label}
          </button>
        ))}

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="ml-auto flex items-center gap-1 text-xs text-secondary hover:text-tertiary transition-colors"
          >
            <X size={12} />
            Reset Filter
          </button>
        )}
      </div>
    </div>
  )
}