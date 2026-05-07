import { memo } from 'react';
import { StatusBadge, ScheduleBadge } from './StatusBadge.jsx';
import { formatDateTime, getScheduleState } from '../utils/format.js';

function ContentCardImpl({ item, actions }) {
  const state = getScheduleState(item);
  return (
    <div className="card flex flex-col gap-3">
      <div className="aspect-video w-full overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-700">
        {item.fileUrl ? (
          <img src={item.fileUrl} alt={item.title} loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full grid place-items-center text-slate-400 text-sm">No preview</div>
        )}
      </div>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-semibold truncate">{item.title}</div>
          <div className="text-xs text-slate-500">{item.subject} · {item.teacherName}</div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <StatusBadge status={item.status} />
          <ScheduleBadge state={state} />
        </div>
      </div>
      {item.description && <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">{item.description}</p>}
      <div className="text-xs text-slate-500">
        <div>Start: {formatDateTime(item.startTime)}</div>
        <div>End: {formatDateTime(item.endTime)}</div>
        <div>Rotation: {item.rotationDuration}s</div>
      </div>
      {item.status === 'rejected' && item.rejectionReason && (
        <div className="text-xs rounded-md bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-2">
          <strong>Rejection reason:</strong> {item.rejectionReason}
        </div>
      )}
      {actions && <div className="flex gap-2 pt-1">{actions}</div>}
    </div>
  );
}

export default memo(ContentCardImpl);
