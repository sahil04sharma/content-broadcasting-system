import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { contentService } from '../../services/content.service.js';
import StatCard from '../../components/StatCard.jsx';
import { CardSkeleton } from '../../components/Skeleton.jsx';
import ContentCard from '../../components/ContentCard.jsx';
import EmptyState from '../../components/EmptyState.jsx';

export default function PrincipalDashboard() {
  const stats = useQuery({ queryKey: ['stats', 'principal'], queryFn: () => contentService.stats() });
  const pending = useQuery({ queryKey: ['content', 'pending'], queryFn: () => contentService.list({ status: 'pending' }) });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Principal Overview</h1>
          <p className="text-slate-500 text-sm">Approve or reject teacher content submissions.</p>
        </div>
        <Link to="/principal/approvals" className="btn-primary">Review pending</Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Content" value={stats.data?.total} icon="📦" tone="info" />
        <StatCard label="Pending" value={stats.data?.pending} icon="⏳" tone="pending" />
        <StatCard label="Approved" value={stats.data?.approved} icon="✅" tone="approved" />
        <StatCard label="Rejected" value={stats.data?.rejected} icon="❌" tone="rejected" />
      </div>

      <div>
        <h2 className="font-semibold mb-3">Latest pending</h2>
        {pending.isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : pending.isError ? (
          <EmptyState icon="⚠️" title="Failed to load" description={pending.error?.message} />
        ) : pending.data?.length === 0 ? (
          <EmptyState title="Nothing pending" description="All caught up." />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pending.data.slice(0, 6).map((item) => <ContentCard key={item.id} item={item} />)}
          </div>
        )}
      </div>
    </div>
  );
}
