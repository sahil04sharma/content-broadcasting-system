import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { contentService } from '../../services/content.service.js';
import ContentCard from '../../components/ContentCard.jsx';
import { CardSkeleton } from '../../components/Skeleton.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { useDebounce } from '../../hooks/useDebounce.js';

const STATUSES = ['all', 'pending', 'approved', 'rejected'];

export default function MyContent() {
  const { user } = useAuth();
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search, 250);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['content', 'teacher', user.id, status, debounced],
    queryFn: () => contentService.list({ teacherId: user.id, status, search: debounced }),
  });

  const liveUrl = useMemo(() => `${window.location.origin}/live/${user.id}`, [user.id]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-semibold">My Content</h1>
          <p className="text-sm text-slate-500">Public live page: <a className="text-brand-600 underline" href={liveUrl} target="_blank" rel="noreferrer">{liveUrl}</a></p>
        </div>
        <Link to="/teacher/upload" className="btn-primary">+ Upload</Link>
      </div>

      <div className="card flex flex-wrap items-center gap-3">
        <input
          className="input max-w-xs"
          placeholder="Search title or subject…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-1 flex-wrap">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-md text-sm capitalize ${status === s ? 'bg-brand-500 text-white' : 'bg-slate-100 dark:bg-slate-700'}`}
            >{s}</button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : isError ? (
        <EmptyState icon="⚠️" title="Failed to load" description={error?.message} />
      ) : data.length === 0 ? (
        <EmptyState title="No content found" description="Try adjusting filters or upload new content." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((item) => <ContentCard key={item.id} item={item} />)}
        </div>
      )}
    </div>
  );
}
