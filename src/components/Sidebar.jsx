import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext.jsx';

const teacherLinks = [
  { to: '/teacher', label: 'Dashboard', icon: '🏠', end: true },
  { to: '/teacher/upload', label: 'Upload Content', icon: '⬆️' },
  { to: '/teacher/my-content', label: 'My Content', icon: '📄' },
];

const principalLinks = [
  { to: '/principal', label: 'Dashboard', icon: '🏠', end: true },
  { to: '/principal/approvals', label: 'Pending Approvals', icon: '✅' },
  { to: '/principal/content', label: 'All Content', icon: '🗂️' },
];

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const links = user?.role === 'principal' ? principalLinks : teacherLinks;

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={clsx(
          'fixed lg:static z-40 inset-y-0 left-0 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transform transition-transform lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="h-16 flex items-center gap-2 px-5 border-b border-slate-200 dark:border-slate-700">
          <div className="w-8 h-8 rounded-md bg-brand-500 grid place-items-center text-white font-bold">C</div>
          <div>
            <div className="font-semibold leading-tight">CBS</div>
            <div className="text-xs text-slate-500 leading-tight">Broadcasting</div>
          </div>
        </div>
        <nav className="p-3 space-y-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              onClick={onClose}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition',
                  isActive
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-100 font-medium'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                )
              }
            >
              <span aria-hidden>{l.icon}</span>
              <span>{l.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-0 inset-x-0 p-4 text-xs text-slate-500 border-t border-slate-200 dark:border-slate-700">
          Signed in as<br />
          <span className="font-medium text-slate-700 dark:text-slate-200">{user?.name}</span>
        </div>
      </aside>
    </>
  );
}
