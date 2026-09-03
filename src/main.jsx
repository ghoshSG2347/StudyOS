import React, { Component, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import CompleteProfilePage from './pages/CompleteProfilePage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { registerServiceWorker } from './pwaRegister';

// Register Service Worker for offline asset caching and PWA installation
registerServiceWorker();

/**
 * ErrorBoundary to catch unhandled runtime errors and prevent blank screens.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[StudyOS ErrorBoundary Caught]:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white/[0.04] border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold font-display text-white">Something went wrong</h2>
            <p className="text-sm text-slate-400">
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all"
              >
                Reload Application
              </button>
              <button
                onClick={() => {
                  try {
                    localStorage.clear();
                    sessionStorage.clear();
                  } catch (_) {}
                  window.location.href = '/login';
                }}
                className="w-full py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-400 hover:text-white font-medium text-xs transition-all"
              >
                Clear Local Data & Re-login
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * ProtectedRoute — guards access to the main StudyOS app.
 * Checks authentication session and profile completion (e.g. for Google OAuth users).
 */
function ProtectedRoute({ children }) {
  const { user, profile, profileLoaded, loading } = useAuth();

  // Show pulse loader while session or profile rehydrates
  if (loading || (user && !profileLoaded)) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center animate-pulse shadow-lg shadow-indigo-500/30">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
          </div>
          <p className="text-slate-400 text-xs font-mono animate-pulse">Loading StudyOS…</p>
        </div>
      </div>
    );
  }

  // If not logged in -> redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If logged in via Google OAuth but profile row does not exist yet -> complete profile
  if (!profile) {
    return <Navigate to="/complete-profile" replace />;
  }

  return children;
}

/**
 * Application Routes setup
 */
function AppRouter() {
  return (
    <Routes>
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/register" element={<SignUpPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/complete-profile" element={<CompleteProfilePage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <App />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
