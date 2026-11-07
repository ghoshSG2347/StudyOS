import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '@/pages/LandingPage';
import { AuthShell } from '@/components/auth/AuthShell';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import WorkspacePage from '@/pages/WorkspacePage';
import OnboardingPage from '@/pages/OnboardingPage';
import { GlobalCursor } from '@/components/GlobalCursor';
import { IS_DEMO_MODE } from '@/lib/demo';

export default function App() {
  return (
    <BrowserRouter>
      {/* Global StudyOS Custom Pointer */}
      <GlobalCursor />

      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Authentication Routes */}
        <Route path="/auth/sign-in" element={<AuthShell mode="sign-in" />} />
        <Route path="/auth/sign-up" element={<AuthShell mode="sign-up" />} />

        {/* Post-Registration Profile Onboarding */}
        <Route path="/auth/onboarding" element={<OnboardingPage />} />
        <Route path="/onboarding" element={<Navigate to="/auth/onboarding" replace />} />

        {/* Convenient redirects */}
        <Route path="/auth" element={<Navigate to="/auth/sign-in" replace />} />
        <Route path="/signin" element={<Navigate to="/auth/sign-in" replace />} />
        <Route path="/signup" element={<Navigate to="/auth/sign-up" replace />} />

        {/* Temporary Frontend Demo Routes (bypasses Better Auth when IS_DEMO_MODE=true) */}
        {IS_DEMO_MODE ? (
          <>
            <Route path="/workspace/demo" element={<WorkspacePage />} />
            <Route path="/workspace/demo/profile" element={<WorkspacePage initialActivity="profile" />} />
            <Route path="/workspace/demo/:syllabusId" element={<WorkspacePage />} />
          </>
        ) : (
          <>
            <Route path="/workspace/demo" element={<Navigate to="/auth/sign-in" replace />} />
            <Route path="/workspace/demo/profile" element={<Navigate to="/auth/sign-in" replace />} />
            <Route path="/workspace/demo/:syllabusId" element={<Navigate to="/auth/sign-in" replace />} />
          </>
        )}

        {/* Protected Workspace Routes (guarded by Better Auth session) */}
        <Route
          path="/workspace"
          element={
            <ProtectedRoute>
              <WorkspacePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/workspace/profile"
          element={
            <ProtectedRoute>
              <WorkspacePage initialActivity="profile" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/workspace/:syllabusId"
          element={
            <ProtectedRoute>
              <WorkspacePage />
            </ProtectedRoute>
          }
        />

        {/* Fallback to Landing Page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
