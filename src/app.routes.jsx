import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AppLayout from './layouts/AppLayout.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import TeacherDashboard from './pages/teacher/TeacherDashboard.jsx';
import UploadContent from './pages/teacher/UploadContent.jsx';
import MyContent from './pages/teacher/MyContent.jsx';
import PrincipalDashboard from './pages/principal/PrincipalDashboard.jsx';
import PendingApprovals from './pages/principal/PendingApprovals.jsx';
import AllContent from './pages/principal/AllContent.jsx';
import LivePage from './pages/public/LivePage.jsx';
import NotFound from './pages/NotFound.jsx';

export default function AppRoutes() {
  const { user } = useAuth();

  const homeRedirect = !user
    ? '/login'
    : user.role === 'principal'
    ? '/principal'
    : '/teacher';

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={user ? <Navigate to={homeRedirect} replace /> : <LoginPage />} />
      <Route path="/live/:teacherId" element={<LivePage />} />

      {/* Teacher */}
      <Route element={<ProtectedRoute roles={['teacher']} />}>
        <Route element={<AppLayout />}>
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/teacher/upload" element={<UploadContent />} />
          <Route path="/teacher/my-content" element={<MyContent />} />
        </Route>
      </Route>

      {/* Principal */}
      <Route element={<ProtectedRoute roles={['principal']} />}>
        <Route element={<AppLayout />}>
          <Route path="/principal" element={<PrincipalDashboard />} />
          <Route path="/principal/approvals" element={<PendingApprovals />} />
          <Route path="/principal/content" element={<AllContent />} />
        </Route>
      </Route>

      {/* Fallbacks */}
      <Route path="/" element={<Navigate to={homeRedirect} replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
