import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="card text-center max-w-md">
        <div className="text-5xl mb-3">🧭</div>
        <h1 className="text-xl font-semibold">Page not found</h1>
        <p className="text-slate-500 mt-1">The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn-primary mt-4 inline-flex">Go home</Link>
      </div>
    </div>
  );
}
