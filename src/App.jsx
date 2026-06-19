import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';

import HomePage      from './pages/HomePage.jsx';
import LoginPage     from './pages/LoginPage.jsx';
import RegisterPage  from './pages/RegisterPage.jsx';
import BrowsePage    from './pages/BrowsePage.jsx';
import TakeQuizPage  from './pages/TakeQuizPage.jsx';
import ResultsPage   from './pages/ResultsPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';

import AdminLayout    from './pages/admin/AdminLayout.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminQuizzes   from './pages/admin/AdminQuizzes.jsx';
import AdminCreateQuiz from './pages/admin/AdminCreateQuiz.jsx';
import AdminEditQuiz  from './pages/admin/AdminEditQuiz.jsx';
import AdminUsers     from './pages/admin/AdminUsers.jsx';
import AdminAttempts  from './pages/admin/AdminAttempts.jsx';

function PageLoader() {
  return (
    <div className="page-loader">
      <div className="spinner spinner-dark" style={{ width: 36, height: 36 }} />
    </div>
  );
}

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />;
  return children;
}

export default function App() {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  return (
    <AuthProvider>
      <BrowserRouter basename={base}>
        <Routes>
          <Route path="/"         element={<HomePage />} />
          <Route path="/browse"   element={<BrowsePage />} />
          <Route path="/login"    element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
          <Route path="/quiz/:id"     element={<ProtectedRoute><TakeQuizPage /></ProtectedRoute>} />
          <Route path="/results/:id"  element={<ProtectedRoute><ResultsPage /></ProtectedRoute>} />
          <Route path="/dashboard"    element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
            <Route index                    element={<AdminDashboard />} />
            <Route path="quizzes"           element={<AdminQuizzes />} />
            <Route path="quizzes/create"    element={<AdminCreateQuiz />} />
            <Route path="quizzes/edit/:id"  element={<AdminEditQuiz />} />
            <Route path="users"             element={<AdminUsers />} />
            <Route path="attempts"          element={<AdminAttempts />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
