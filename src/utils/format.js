export function formatDateTime(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit',
    });
  } catch { return '—'; }
}

export function getScheduleState(content) {
  if (!content?.startTime || !content?.endTime) return 'unknown';
  const now = Date.now();
  const s = new Date(content.startTime).getTime();
  const e = new Date(content.endTime).getTime();
  if (now < s) return 'scheduled';
  if (now > e) return 'expired';
  return 'active';
}

export function statusColor(status) {
  switch (status) {
    case 'approved': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300';
    case 'pending':  return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300';
    case 'rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';
    default:         return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200';
  }
}

export function scheduleColor(state) {
  switch (state) {
    case 'active':    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300';
    case 'scheduled': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300';
    case 'expired':   return 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200';
    default:          return 'bg-slate-100 text-slate-700';
  }
}
