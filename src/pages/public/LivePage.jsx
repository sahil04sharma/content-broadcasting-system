import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { contentService } from '../../services/content.service.js';
import { Skeleton } from '../../components/Skeleton.jsx';

function formatStartsIn(iso) {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return 'starting now';
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `in ${mins} min`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  if (hrs < 24) return rem ? `in ${hrs}h ${rem}m` : `in ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `in ${days}d`;
}

function UpcomingSection({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-3">
        <div className="text-xs uppercase tracking-wider opacity-60">Coming up</div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10">{items.length}</span>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-lg overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm">
            <div className="aspect-video bg-black">
              <img src={item.fileUrl} alt="" loading="lazy" className="w-full h-full object-cover opacity-90" />
            </div>
            <div className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">{item.title}</div>
                  <div className="text-[11px] opacity-60 truncate">{item.subject} · {item.teacherName}</div>
                </div>
                <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-200 font-medium">
                  {formatStartsIn(item.startTime)}
                </span>
              </div>
              <div className="mt-2 text-[10px] opacity-60">
                Starts {new Date(item.startTime).toLocaleString(undefined, { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

export default function LivePage() {
  const { teacherId } = useParams();
  const [index, setIndex] = useState(0);
  const clock = useClock();

  const { data = [], isLoading, isError, error, dataUpdatedAt } = useQuery({
    queryKey: ['live', teacherId],
    queryFn: () => contentService.getActiveForTeacher(teacherId),
    refetchInterval: 15_000,
  });

  const { data: upcoming = [] } = useQuery({
    queryKey: ['live', teacherId, 'upcoming'],
    queryFn: () => contentService.getUpcomingForTeacher(teacherId),
    refetchInterval: 30_000,
  });

  const current = data[index] || null;
  const next = data.length > 1 ? data[(index + 1) % data.length] : null;
  const rotationMs = useMemo(
    () => Math.max(2, Number(current?.rotationDuration || 10)) * 1000,
    [current]
  );

  // clamp index when data shrinks
  useEffect(() => { if (index >= data.length) setIndex(0); }, [data, index]);

  // rotation
  useEffect(() => {
    if (data.length <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % data.length), rotationMs);
    return () => clearInterval(t);
  }, [data.length, rotationMs]);

  // progress bar (re-keyed per slide so it restarts cleanly)
  const progressKey = `${current?.id || 'none'}-${rotationMs}`;
  const startedAtRef = useRef(Date.now());
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    startedAtRef.current = Date.now();
    setProgress(0);
    if (!current || data.length <= 1) return;
    const id = setInterval(() => {
      const pct = Math.min(100, ((Date.now() - startedAtRef.current) / rotationMs) * 100);
      setProgress(pct);
    }, 150);
    return () => clearInterval(id);
  }, [progressKey, current, data.length, rotationMs]);

  const teacherName = current?.teacherName || data[0]?.teacherName;

  return (
    <div className="relative min-h-screen overflow-hidden text-white bg-slate-950">
      {/* Animated gradient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 w-[40rem] h-[40rem] rounded-full bg-brand-600/30 blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-[36rem] h-[36rem] rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-[34rem] h-[34rem] rounded-full bg-cyan-500/20 blur-3xl" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="px-6 py-4 flex items-center justify-between border-b border-white/10 backdrop-blur-md bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-500 grid place-items-center font-bold shadow-lg shadow-brand-500/30">C</div>
            <div>
              <div className="font-semibold leading-tight">Content Broadcast</div>
              {teacherName && <div className="text-xs opacity-70 leading-tight">{teacherName}</div>}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {current && (
              <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-semibold">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
                LIVE
              </span>
            )}
            <div className="hidden sm:block text-right">
              <div className="font-mono text-sm tabular-nums">{clock.toLocaleTimeString()}</div>
              <div className="text-[10px] opacity-60">Updated {new Date(dataUpdatedAt || Date.now()).toLocaleTimeString()}</div>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 grid place-items-center p-4 sm:p-6 lg:p-10">
          {isLoading ? (
            <div className="w-full max-w-5xl space-y-4">
              <Skeleton className="h-8 w-1/3 bg-white/10" />
              <Skeleton className="aspect-video w-full bg-white/10" />
            </div>
          ) : isError ? (
            <div className="text-center">
              <div className="text-4xl mb-3">⚠️</div>
              <div className="text-xl font-semibold">Failed to load broadcast</div>
              <div className="text-sm opacity-70 mt-1">{error?.message}</div>
            </div>
          ) : !current ? (
            <div className="text-center max-w-2xl w-full">
              <div className="text-6xl mb-4 animate-pulse">📺</div>
              <h1 className="text-3xl font-bold">No content available</h1>
              <p className="opacity-70 mt-2">There is no active broadcast right now. Please check back soon.</p>
              <div className="mt-8 text-left">
                <UpcomingSection items={upcoming} />
              </div>
            </div>
          ) : (
            <div className="w-full max-w-6xl">
              {/* Caption */}
              <div className="flex items-end justify-between gap-4 mb-4 flex-wrap">
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 text-xs uppercase tracking-wider">
                    <span>📚</span> {current.subject}
                  </div>
                  <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                    {current.title}
                  </h1>
                  {current.description && (
                    <p className="opacity-80 mt-2 max-w-3xl text-sm sm:text-base">{current.description}</p>
                  )}
                </div>
                <div className="text-right text-xs opacity-70">
                  <div>By <span className="font-medium opacity-100">{current.teacherName}</span></div>
                  <div>{index + 1} of {data.length}</div>
                </div>
              </div>

              {/* Stage */}
              <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black shadow-2xl shadow-black/50">
                <img
                  key={current.id}
                  src={current.fileUrl}
                  alt={current.title}
                  className="w-full max-h-[68vh] object-contain bg-black animate-[fadeIn_0.4s_ease]"
                />
                {/* Rotation progress bar */}
                {data.length > 1 && (
                  <div className="absolute bottom-0 inset-x-0 h-1 bg-white/10">
                    <div
                      className="h-full bg-gradient-to-r from-brand-400 to-fuchsia-400 transition-[width] duration-150 ease-linear"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Now playing strip */}
              {data.length > 1 && (
                <div className="mt-6">
                  <div className="text-xs uppercase tracking-wider opacity-60 mb-2">Now playing</div>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {data.map((item, i) => {
                      const active = i === index;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setIndex(i)}
                          className={`shrink-0 w-40 text-left rounded-lg overflow-hidden border transition ${
                            active
                              ? 'border-brand-400 ring-2 ring-brand-400/50'
                              : 'border-white/10 hover:border-white/30'
                          }`}
                          aria-label={`Show ${item.title}`}
                        >
                          <div className="aspect-video bg-black">
                            <img src={item.fileUrl} alt="" loading="lazy" className="w-full h-full object-cover opacity-90" />
                          </div>
                          <div className="px-2 py-1.5 bg-white/5">
                            <div className="text-xs font-medium truncate">{item.title}</div>
                            <div className="text-[10px] opacity-60 truncate">{item.subject}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Next-up hint (single line) */}
              {next && (
                <div className="mt-3 text-xs opacity-60">
                  Next: <span className="opacity-90 font-medium">{next.title}</span> · {next.subject}
                </div>
              )}

              <UpcomingSection items={upcoming} />
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="px-6 py-3 text-center text-[11px] opacity-60 border-t border-white/10">
          Content Broadcasting System · Auto-refreshes every 15s
        </footer>
      </div>

      {/* keyframes */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.99); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}
