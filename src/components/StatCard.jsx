import clsx from 'clsx';

export default function StatCard({ label, value, tone = 'default', icon }) {
  const tones = {
    default: 'text-slate-700 dark:text-slate-200',
    pending: 'text-amber-600',
    approved: 'text-emerald-600',
    rejected: 'text-red-600',
    info: 'text-brand-600',
  };
  return (
    <div className="card flex items-start gap-3">
      {icon && <div className="text-2xl">{icon}</div>}
      <div>
        <div className="text-sm text-slate-500">{label}</div>
        <div className={clsx('text-2xl font-semibold', tones[tone] || tones.default)}>{value ?? '—'}</div>
      </div>
    </div>
  );
}
