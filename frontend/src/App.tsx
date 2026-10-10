import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Resumes from './pages/Resumes';
import CreateResume from './pages/CreateResume';
import ResumeEditor from './pages/ResumeEditor';
import Features from './pages/Features';
import Templates from './pages/Templates';
import Profile from './pages/Profile';
import Pricing from './pages/Pricing';
import About from './pages/About';
import Contact from './pages/Contact';
import Help from './pages/Help';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import NotFound from './pages/NotFound';

/** Spinner shown while auth state is being restored. */
const FullScreenLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
    <div
      className="animate-spin rounded-full h-14 w-14 border-b-2"
      style={{ borderColor: 'var(--primary-500)' }}
      role="status"
      aria-label="Loading"
    />
  </div>
);

/** Redirects to login (preserving intended destination) when unauthenticated. */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

/** Redirects authenticated users away from auth pages. */
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/features" element={<Features />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/help" element={<Help />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />

        {/* Auth */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />

        {/* Protected */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/resumes"
          element={
            <ProtectedRoute>
              <Resumes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-resume"
          element={<Navigate to="/resumes/create" replace />}
        />
        <Route
          path="/resumes/create"
          element={
            <ProtectedRoute>
              <CreateResume />
            </ProtectedRoute>
          }
        />
        <Route
          path="/resumes/:id"
          element={
            <ProtectedRoute>
              <ResumeEditor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
