import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { contentService } from '../../services/content.service.js';
import ContentCard from '../../components/ContentCard.jsx';
import { CardSkeleton } from '../../components/Skeleton.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { useDebounce } from '../../hooks/useDebounce.js';

const STATUSES = ['all', 'pending', 'approved', 'rejected'];
const PAGE_SIZE = 12;

export default function AllContent() {
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debounced = useDebounce(search, 250);

  const { data = [], isLoading, isError, error } = useQuery({
    queryKey: ['content', 'all', status, debounced],
    queryFn: () => contentService.list({ status, search: debounced }),
  });

  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
  const pageData = useMemo(() => data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [data, page]);

  // reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [status, debounced]);

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold">All Content</h1>

      <div className="card flex flex-wrap items-center gap-3">
        <input
          className="input max-w-xs"
          placeholder="Search title, subject, teacher…"
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
        <div className="text-xs text-slate-500 ml-auto">{data.length} items</div>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : isError ? (
        <EmptyState icon="⚠️" title="Failed to load" description={error?.message} />
      ) : data.length === 0 ? (
        <EmptyState title="No content" description="Nothing matches your filters." />
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pageData.map((item) => <ContentCard key={item.id} item={item} />)}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button className="btn-secondary" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
              <span className="text-sm">Page {page} / {totalPages}</span>
              <button className="btn-secondary" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
