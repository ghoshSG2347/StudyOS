import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import CompleteProfilePage from './pages/CompleteProfilePage.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';

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
      <Route path="/login" element={<LoginPage />} />
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
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
