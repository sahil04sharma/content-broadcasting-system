import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-4 sm:px-6 gap-3">
      <button onClick={onMenuClick} className="lg:hidden btn-ghost p-2" aria-label="Open menu">☰</button>
      <div className="flex-1">
        <h1 className="text-base sm:text-lg font-semibold capitalize">{user?.role} Portal</h1>
      </div>
      <button onClick={toggle} className="btn-ghost" aria-label="Toggle theme" title="Toggle theme">
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
      <div className="hidden sm:flex items-center gap-2 text-sm">
        <div className="w-8 h-8 rounded-full bg-brand-500 text-white grid place-items-center font-medium">
          {user?.name?.[0]}
        </div>
        <span className="hidden md:inline">{user?.name}</span>
      </div>
      <button onClick={handleLogout} className="btn-secondary">Logout</button>
    </header>
  );
}
