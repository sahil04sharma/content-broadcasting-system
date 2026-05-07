import clsx from 'clsx';
import { statusColor, scheduleColor } from '../utils/format.js';

export function StatusBadge({ status }) {
  return <span className={clsx('badge', statusColor(status))}>{status}</span>;
}

export function ScheduleBadge({ state }) {
  return <span className={clsx('badge', scheduleColor(state))}>{state}</span>;
}
