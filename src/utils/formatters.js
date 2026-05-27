const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const numberFormatter = new Intl.NumberFormat('id-ID');

function isValidDate(value) {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

function parseDate(dateStr) {
  const date = new Date(dateStr);
  return isValidDate(date) ? date : null;
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function formatDate(dateStr) {
  const date = parseDate(dateStr);
  return date ? dateFormatter.format(date) : '';
}

export function formatDuration(minutes) {
  const totalMinutes = Number(minutes);
  if (!Number.isFinite(totalMinutes)) return '';
  if (totalMinutes < 60) return `${numberFormatter.format(totalMinutes)} mnt`;

  const hours = totalMinutes / 60;
  const rounded = Math.round(hours * 10) / 10;
  return `${Number.isInteger(rounded) ? rounded.toFixed(0) : rounded} jam`;
}

export function formatScore(score) {
  const value = Number(score);
  if (!Number.isFinite(value)) return '';
  return `${Math.round(value * 100)}%`;
}

export function formatRelativeTime(dateStr) {
  const date = parseDate(dateStr);
  if (!date) return '';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor((startOfDay(now) - startOfDay(date)) / 86400000);

  if (diffMinutes < 60) {
    if (diffMinutes <= 0) return 'Baru saja';
    return `${diffMinutes} mnt lalu`;
  }

  if (diffDays === 0) {
    return `${diffHours} jam lalu`;
  }

  if (diffDays === 1) {
    return 'Kemarin';
  }

  return `${diffDays} hari lalu`;
}

export function formatNumber(num) {
  const value = Number(num);
  if (!Number.isFinite(value)) return '';
  return numberFormatter.format(value);
}
