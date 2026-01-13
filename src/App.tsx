/**
 * Kanban App - Main Application Component
 * With Auth, Protected Routes, and Full Routing
 */

import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { ToastProvider } from './components/Toast/Toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { supabase } from './lib/supabase';

// Pages
import { Board } from './components/Board/Board';
import { AdminPage } from './pages/Admin/AdminPage';
import { LoginPage } from './pages/Auth/LoginPage';
import { RegisterPage } from './pages/Auth/RegisterPage';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import LandingPage from './pages/landing/LandingPage';
import { LandingPage as OldLandingPage } from './pages/LandingPage/LandingPage';
import { OnboardingPage } from './pages/Onboarding/OnboardingPage';
import { ProfileSetupPage } from './pages/ProfileSetup/ProfileSetupPage';

import './App.css';

// ===========================
// Protected Route Component
// ===========================
function ProtectedRoute() {
  const { user, loading, needsOnboarding, needsProfileSetup } = useAuth();
  const location = window.location.pathname;

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loader"></div>
        <p>Yükleniyor...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Profile setup takes priority - user must have a name
  if (needsProfileSetup && location !== '/profile-setup') {
    return <Navigate to="/profile-setup" replace />;
  }

  // Redirect to onboarding if needed (but not if already there or in profile setup)
  if (needsOnboarding && location !== '/onboarding' && location !== '/profile-setup') {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}

// ===========================
// Public Route (Redirect if logged in)
// ===========================
function PublicRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loader"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

// ===========================
// Board Wrapper (for route params)
// ===========================

function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();

  if (!boardId) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Board
      boardId={boardId}
      onBack={() => navigate('/dashboard')}
    />
  );
}

// ===========================
// Auth Callback Handler
// ===========================
function AuthCallback() {
  const { user, loading, refreshOrganizations, completeOnboarding } = useAuth();
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const handleInvite = async () => {
      if (!user) {
        setProcessing(false);
        return;
      }

      // Check for invite token in URL
      const params = new URLSearchParams(window.location.search);
      const invitedToOrgId = params.get('invited_to');

      if (invitedToOrgId) {
        try {
          // Add user to the organization
          const { error } = await supabase
            .from('organization_members')
            .insert({
              org_id: invitedToOrgId,
              user_id: user.id,
              role: 'member',
            });

          if (!error) {
            // Refresh organizations and skip onboarding
            await refreshOrganizations();
            completeOnboarding();
          }
        } catch (err) {
          console.error('Failed to process invite:', err);
        }
      }

      setProcessing(false);
    };

    if (!loading && user) {
      handleInvite();
    } else if (!loading) {
      setProcessing(false);
    }
  }, [user, loading, refreshOrganizations, completeOnboarding]);

  if (loading || processing) {
    return (
      <div className="app-loading">
        <div className="loader"></div>
        <p>Giriş yapılıyor...</p>
      </div>
    );
  }

  // If logged in, go to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
}

// ===========================
// Main App Component
// ===========================
function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicRoute />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/old-landing" element={<OldLandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Auth Callback */}
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/profile-setup" element={<ProfileSetupPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/board/:boardId" element={<BoardPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/settings" element={<div>Settings (Coming Soon)</div>} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
