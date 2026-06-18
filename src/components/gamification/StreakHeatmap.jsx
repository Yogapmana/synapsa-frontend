import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { format, parseISO, startOfWeek, addDays, isSameDay, isToday } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { cn } from '@/lib/utils';

/**
 * StreakHeatmap — GitHub-style 7-row × N/7-col activity grid.
 *
 * Data shape (from `/api/v1/gamification/heatmap`):
 *   {
 *     days: 84,
 *     start_date: 'YYYY-MM-DD',
 *     end_date:   'YYYY-MM-DD',
 *     total_logins, total_active_days,
 *     data: [
 *       { date: 'YYYY-MM-DD', score: 0|1|2|3, logins, activities },
 *       ...
 *     ]
 *   }
 *
 * Score legend:
 *   0 = no login that day             → bg-secondary/15
 *   1 = login only                    → bg-tertiary/25
 *   2 = login + 1-2 activities        → bg-tertiary/55
 *   3 = login + 3+ activities         → bg-tertiary
 *
 * Layout:
 *   - 7 rows (Mon..Sun) aligned so Monday is the top row, matching
 *     GitHub's convention. We compute the day-of-week from each
 *     date in `data` and place it in the right row.
 *   - 12 columns (12 weeks by default). The first column starts at
 *     the Monday on or before `start_date`. Cells outside the
 *     requested range are rendered as invisible (display:none-ish)
 *     so the grid aligns.
 *
 * Interactivity:
 *   - Hover: shows a tooltip with the date and the activity
 *     breakdown ("Login + 2 aktivitas: 1 module, 1 quiz").
 *   - Today: a subtle 1.5px ring so the user can spot it.
 *   - Future dates: not rendered (we always pull the past).
 *
 * Accessibility:
 *   - The grid is a real <table>-like structure with proper
 *     <div role="grid"> + role="gridcell" so screen readers
 *     can navigate it. Each cell has an aria-label describing
 *     the date and the activity level.
 */

const SCORE_CLASSES = {
  0: 'bg-secondary/15',
  1: 'bg-tertiary/25',
  2: 'bg-tertiary/55',
  3: 'bg-tertiary',
};

const SCORE_LABELS = {
  0: 'Tidak ada aktivitas',
  1: 'Login saja',
  2: 'Login + 1–2 aktivitas',
  3: 'Login + 3+ aktivitas',
};

// Which day-of-week labels to show on the left. We show Mon, Wed,
// Fri to keep the column narrow (GitHub does the same).
const DOW_LABELS = {
  1: 'Sen', // Monday
  3: 'Rab', // Wednesday
  5: 'Jum', // Friday
};

export default function StreakHeatmap({ data, isLoading }) {
  // Hover state — which cell is the user currently hovering?
  // We keep the cell's `index` into `data` (or -1 for none) so
  // the tooltip can be positioned next to the right cell.
  const [hoverIndex, setHoverIndex] = useState(-1);

  // Build a lookup: date string → day record. This makes the
  // grid rendering loop O(1) per cell instead of O(N).
  const byDate = useMemo(() => {
    const m = new Map();
    (data?.data || []).forEach((d) => m.set(d.date, d));
    return m;
  }, [data]);

  // Build the grid: 7 rows × ceil(days/7) cols. Each cell is
  // either a real day (matched via byDate) or a placeholder
  // (leading days before start_date's Monday).
  const grid = useMemo(() => {
    if (!data?.start_date) return null;
    const start = parseISO(data.start_date);
    const end = parseISO(data.end_date);
    // Find the Monday on or before `start`. date-fns weekStartsOn=1
    // (Monday) is the default in our date-fns config; if not,
    // we explicitly compute it here.
    const startMonday = startOfWeek(start, { weekStartsOn: 1 });
    const totalDays = Math.ceil((end - startMonday) / 86_400_000) + 1;
    const cols = Math.ceil(totalDays / 7);
    const cells = [];
    for (let c = 0; c < cols; c++) {
      const col = [];
      for (let r = 0; r < 7; r++) {
        const date = addDays(startMonday, c * 7 + r);
        const iso = format(date, 'yyyy-MM-dd');
        const inRange = date >= start && date <= end;
        col.push({ date, iso, inRange, record: byDate.get(iso) });
      }
      cells.push(col);
    }
    return { cells, cols, startMonday, end };
  }, [data, byDate]);

  // Group columns by month for the top label row. We render
  // a month name above the first column of each new month.
  const monthMarkers = useMemo(() => {
    if (!grid) return [];
    const markers = [];
    let lastMonth = -1;
    grid.cells.forEach((col, i) => {
      const firstDate = col[0].date;
      const m = firstDate.getMonth();
      if (m !== lastMonth) {
        markers.push({ col: i, label: format(firstDate, 'MMM', { locale: idLocale }) });
        lastMonth = m;
      }
    });
    return markers;
  }, [grid]);

  if (isLoading || !grid) {
    return (
      <div
        role="status"
        aria-label="Memuat heatmap streak"
        className="h-28 rounded-lg bg-secondary/5 animate-pulse"
      />
    );
  }

  return (
    <div className="space-y-2">
      {/* Month label row — sits above the first column of each new month.
          Aligned to the grid (offset by the day-of-week label column). */}
      <div
        className="grid items-end text-[10px] text-secondary/70 font-label uppercase tracking-wider"
        style={{
          gridTemplateColumns: `2rem repeat(${grid.cols}, minmax(0, 1fr))`,
          columnGap: '3px',
        }}
      >
        <div />
        {Array.from({ length: grid.cols }).map((_, i) => {
          const marker = monthMarkers.find((m) => m.col === i);
          return (
            <div key={i} className="h-3 leading-3">
              {marker ? marker.label : ''}
            </div>
          );
        })}
      </div>

      {/* The actual grid: 7 rows × cols columns. We use a CSS grid
          for the rows (1fr per row) and a flex layout per row so
          the cells distribute evenly. Each row corresponds to a
          day of week (Mon..Sun). */}
      <div
        role="grid"
        aria-label="Heatmap aktivitas login 12 minggu terakhir"
        className="space-y-[3px]"
      >
        {[0, 1, 2, 3, 4, 5, 6].map((rowIdx) => {
          // rowIdx 0 = Monday ... 6 = Sunday.
          // date-fns getDay() returns 0=Sun..6=Sat, so we use
          // (rowIdx + 1) % 7 to map to date-fns.
          const dow = (rowIdx + 1) % 7;
          return (
            <div
              key={rowIdx}
              role="row"
              className="grid items-center"
              style={{
                gridTemplateColumns: `2rem repeat(${grid.cols}, minmax(0, 1fr))`,
                columnGap: '3px',
              }}
            >
              {/* Day-of-week label on the left. Only show Mon,
                  Wed, Fri to keep the column narrow. */}
              <div
                className="text-[10px] text-secondary/60 font-label uppercase tabular-nums pr-1.5 text-right"
                aria-hidden="true"
              >
                {DOW_LABELS[dow] || ''}
              </div>

              {grid.cells.map((col, colIdx) => {
                const cell = col[rowIdx];
                if (!cell.inRange) {
                  // Placeholder for days before start_date's Monday
                  // (or after end_date) — render empty so the grid
                  // stays aligned but it carries no semantics.
                  return <div key={colIdx} className="h-3" aria-hidden="true" />;
                }
                const record = cell.record;
                const score = record?.score ?? 0;
                const flatIdx = data?.data
                  ? data.data.findIndex((d) => d.date === cell.iso)
                  : -1;
                const isHovered = hoverIndex === flatIdx;
                const today = isToday(cell.date);
                return (
                  <div
                    key={colIdx}
                    role="gridcell"
                    tabIndex={0}
                    aria-label={`${format(cell.date, 'EEEE, d MMMM yyyy', { locale: idLocale })}: ${SCORE_LABELS[score]}`}
                    onMouseEnter={() => setHoverIndex(flatIdx)}
                    onMouseLeave={() => setHoverIndex(-1)}
                    onFocus={() => setHoverIndex(flatIdx)}
                    onBlur={() => setHoverIndex(-1)}
                    className={cn(
                      'h-3 rounded-[3px] transition-all duration-150 cursor-default',
                      SCORE_CLASSES[score],
                      today && 'ring-1.5 ring-primary/60 ring-offset-0',
                      isHovered && 'scale-110 ring-1 ring-primary/70 z-10 relative',
                    )}
                  />
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Legend — "Kurang ░░  ░▒  ▒▒  ▓▓  Lebih" */}
      <div className="flex items-center justify-end gap-1.5 text-[10px] text-secondary/60 font-label pt-1">
        <span>Kurang</span>
        {[0, 1, 2, 3].map((s) => (
          <span
            key={s}
            className={cn('inline-block h-2.5 w-2.5 rounded-[2px]', SCORE_CLASSES[s])}
            aria-hidden="true"
          />
        ))}
        <span>Lebih</span>
      </div>

      {/* Hover tooltip — absolutely positioned, follows the
          hovered cell. We keep it simple: a small card with the
          date, score label, and breakdown. */}
      <HoverTooltip
        hoverIndex={hoverIndex}
        data={data}
      />
    </div>
  );
}

/**
 * HoverTooltip — small floating card showing the hovered day's
 * date, activity level, and a breakdown. Rendered inside the
 * StreakHeatmap tree (not portaled) so it inherits the layout
 * and there's no z-index war with other tooltips.
 */
function HoverTooltip({ hoverIndex, data }) {
  if (hoverIndex < 0 || !data?.data?.[hoverIndex]) return null;
  const cell = data.data[hoverIndex];
  const date = parseISO(cell.date);
  const dateLabel = format(date, 'EEEE, d MMM yyyy', { locale: idLocale });
  const scoreLabel = SCORE_LABELS[cell.score];

  return (
    <motion.div
      role="tooltip"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.12 }}
      className="text-xs rounded-lg border border-border-subtle bg-surface-1 shadow-warm-md px-3 py-2 mt-2 inline-flex flex-col gap-0.5"
    >
      <p className="font-label font-semibold text-primary capitalize">{dateLabel}</p>
      <p className="text-secondary">
        {cell.logins > 0
          ? `${cell.logins} login · ${cell.activities} aktivitas`
          : 'Tidak ada aktivitas'}
      </p>
      <p className="text-[10px] text-secondary/60 font-label uppercase tracking-wider">
        {scoreLabel}
      </p>
    </motion.div>
  );
}
