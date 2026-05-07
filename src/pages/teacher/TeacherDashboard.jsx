import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext.jsx';
import { contentService } from '../../services/content.service.js';
import StatCard from '../../components/StatCard.jsx';
import { CardSkeleton } from '../../components/Skeleton.jsx';
import ContentCard from '../../components/ContentCard.jsx';
import EmptyState from '../../components/EmptyState.jsx';

export default function TeacherDashboard() {
  const { user } = useAuth();

  const stats = useQuery({
    queryKey: ['stats', 'teacher', user.id],
    queryFn: () => contentService.stats({ teacherId: user.id }),
  });

  const recent = useQuery({
    queryKey: ['content', 'teacher', user.id, 'recent'],
    queryFn: () => contentService.list({ teacherId: user.id }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Welcome, {user.name.split(' ')[0]}</h1>
          <p className="text-slate-500 text-sm">Track and manage your uploaded content.</p>
        </div>
        <Link to="/teacher/upload" className="btn-primary">+ Upload</Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Uploaded" value={stats.data?.total} icon="📦" tone="info" />
        <StatCard label="Pending" value={stats.data?.pending} icon="⏳" tone="pending" />
        <StatCard label="Approved" value={stats.data?.approved} icon="✅" tone="approved" />
        <StatCard label="Rejected" value={stats.data?.rejected} icon="❌" tone="rejected" />
      </div>

      <div>
        <h2 className="font-semibold mb-3">Recent uploads</h2>
        {recent.isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : recent.isError ? (
          <EmptyState icon="⚠️" title="Failed to load" description={recent.error?.message} />
        ) : recent.data?.length === 0 ? (
          <EmptyState title="No uploads yet" description="Upload your first content to get started." action={<Link to="/teacher/upload" className="btn-primary">Upload now</Link>} />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recent.data.slice(0, 6).map((item) => <ContentCard key={item.id} item={item} />)}
          </div>
        )}
      </div>
    </div>
  );
}
