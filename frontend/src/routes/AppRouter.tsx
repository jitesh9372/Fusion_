import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import AuthLayout from '@/components/auth/AuthLayout';
import SignInPage from '@/pages/auth/SignInPage';
import SignUpPage from '@/pages/auth/SignUpPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import VerifyEmailPage from '@/pages/auth/VerifyEmailPage';
import AuthCallbackPage from '@/pages/auth/AuthCallbackPage';
import UnauthorizedPage from '@/pages/UnauthorizedPage';

import CustomerRoutes from '@/customer/routes/CustomerRoutes';
import WorkerRoutes from '@/worker/routes/WorkerRoutes';
import AdminRoutes from '@/admin/routes/AdminRoutes';

import ProtectedRoute from '@/routes/ProtectedRoute';
import PublicOnlyRoute from '@/routes/PublicOnlyRoute';
import RoleRoute from '@/routes/RoleRoute';

/**
 * AppRouter
 * Top-level application routing table with direct role-based modular routes.
 * Clean, standard nested child routes for authentication.
 */
export const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Root redirect to sign in */}
      <Route path="/" element={<Navigate to="/auth/signin" replace />} />

      {/* OAuth Callback route */}
      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      {/* Public Authentication routes */}
      <Route
        path="/auth"
        element={
          <PublicOnlyRoute>
            <AuthLayout />
          </PublicOnlyRoute>
        }
      >
        <Route index element={<Navigate to="/auth/signin" replace />} />
        <Route path="signin" element={<SignInPage />} />
        <Route path="signup" element={<SignUpPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route path="verify-email" element={<VerifyEmailPage />} />
      </Route>

      {/* Customer Module (Role Protected) */}
      <Route
        path="/customer/*"
        element={
          <RoleRoute allowedRole="customer">
            <CustomerRoutes />
          </RoleRoute>
        }
      />

      {/* Worker Module (Role Protected) */}
      <Route
        path="/worker/*"
        element={
          <RoleRoute allowedRole="worker">
            <WorkerRoutes />
          </RoleRoute>
        }
      />

      {/* Admin Module (Role Protected) */}
      <Route
        path="/admin/*"
        element={
          <RoleRoute allowedRole="admin">
            <AdminRoutes />
          </RoleRoute>
        }
      />

      {/* Access Restricted Page */}
      <Route
        path="/unauthorized"
        element={
          <ProtectedRoute>
            <UnauthorizedPage />
          </ProtectedRoute>
        }
      />

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/auth/signin" replace />} />
    </Routes>
  );
};

export default AppRouter;
