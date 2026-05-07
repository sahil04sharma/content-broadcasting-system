export default function EmptyState({ title = 'No data', description, icon = '📭', action }) {
  return (
    <div className="card text-center py-12">
      <div className="text-4xl mb-2">{icon}</div>
      <div className="font-semibold">{title}</div>
      {description && <div className="text-sm text-slate-500 mt-1">{description}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
