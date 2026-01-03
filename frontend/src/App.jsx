import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import SignUp from './pages/auth/SignUp';
import Dashboard from './pages/dashboard/Dashboard';
import Profile from './pages/employee/Profile';
import EmployeeList from './pages/employee/EmployeeList';
import AttendanceView from './pages/attendance/AttendanceView';
import LeaveView from './pages/leave/LeaveView';
import PayrollView from './pages/payroll/PayrollView';
import AnalyticsView from './pages/dashboard/AnalyticsView';
import LandingPage from './pages/LandingPage';
import Layout from './components/layout/Layout';

const NotFound = () => <div className="p-10 text-center">404 - Not Found</div>;

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'admin' && user.role !== 'hr') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Layout>{children}</Layout>;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <Routes>
        <Route path="/" element={
          <PublicRoute>
            <LandingPage />
          </PublicRoute>
        } />

        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />

        <Route path="/signup" element={
          <PublicRoute>
            <SignUp />
          </PublicRoute>
        } />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />

        <Route path="/attendance" element={
          <ProtectedRoute>
            <AttendanceView />
          </ProtectedRoute>
        } />

        <Route path="/leave" element={
          <ProtectedRoute>
            <LeaveView />
          </ProtectedRoute>
        } />

        <Route path="/payroll" element={
          <ProtectedRoute>
            <PayrollView />
          </ProtectedRoute>
        } />

        {/* Admin/HR Routes */}
        <Route path="/employees" element={
          <ProtectedRoute adminOnly>
            <EmployeeList />
          </ProtectedRoute>
        } />

        <Route path="/employees/:id" element={
          <ProtectedRoute adminOnly>
            <Profile />
          </ProtectedRoute>
        } />

        <Route path="/analytics" element={
          <ProtectedRoute adminOnly>
            <AnalyticsView />
          </ProtectedRoute>
        } />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
