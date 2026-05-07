import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import { loginSchema } from '../../utils/validators.js';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      const user = await login(values);
      toast.success(`Welcome, ${user.name}`);
      const dest = location.state?.from?.pathname
        || (user.role === 'principal' ? '/principal' : '/teacher');
      navigate(dest, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = (role) => {
    if (role === 'principal') { setValue('email', 'principal@school.edu'); setValue('password', 'password'); }
    else { setValue('email', 'teacher@school.edu'); setValue('password', 'password'); }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-brand-500 to-brand-700 text-white">
        <div>
          <div className="text-2xl font-bold">CBS</div>
          <div className="opacity-80">Content Broadcasting System</div>
        </div>
        <div>
          <h2 className="text-3xl font-bold leading-tight">Broadcast classroom content effortlessly.</h2>
          <p className="mt-3 opacity-90 max-w-md">
            Teachers upload content, principals approve it, students view live broadcasts on a public page.
          </p>
        </div>
        <div className="text-sm opacity-75">© CBS Demo</div>
      </div>

      <div className="flex items-center justify-center p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="card w-full max-w-md space-y-4">
          <div>
            <h1 className="text-xl font-semibold">Sign in</h1>
            <p className="text-sm text-slate-500">Use demo accounts below or your credentials.</p>
          </div>

          <div>
            <label className="label">Email</label>
            <input className="input" type="email" autoComplete="email" {...register('email')} />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="label">Password</label>
            <input className="input" type="password" autoComplete="current-password" {...register('password')} />
            {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
          </div>

          <button className="btn-primary w-full" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button type="button" className="btn-secondary" onClick={() => fillDemo('teacher')}>Demo Teacher</button>
            <button type="button" className="btn-secondary" onClick={() => fillDemo('principal')}>Demo Principal</button>
          </div>

          <div className="text-xs text-slate-500 text-center">
            Public live page: <code className="px-1 rounded bg-slate-100 dark:bg-slate-700">/live/u_teacher_1</code>
          </div>
        </form>
      </div>
    </div>
  );
}
