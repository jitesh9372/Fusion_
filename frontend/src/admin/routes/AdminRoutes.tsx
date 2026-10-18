import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '@/admin/layouts/AdminLayout';
import AdminDashboardPage from '@/admin/pages/AdminDashboardPage';

/**
 * AdminRoutes
 * Handles all admin sub-routes:
 * /admin/dashboard
 * /admin/workers
 * /admin/services
 * /admin/bookings
 * /admin/disputes
 * /admin/welfare
 * /admin/financials
 * /admin/settings
 */
export const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="workers" element={<AdminDashboardPage />} />
        <Route path="customers" element={<AdminDashboardPage />} />
        <Route path="verification" element={<AdminDashboardPage />} />
        <Route path="services" element={<AdminDashboardPage />} />
        <Route path="bookings" element={<AdminDashboardPage />} />
        <Route path="payments" element={<AdminDashboardPage />} />
        <Route path="disputes" element={<AdminDashboardPage />} />
        <Route path="welfare" element={<AdminDashboardPage />} />
        <Route path="analytics" element={<AdminDashboardPage />} />
        <Route path="settings" element={<AdminDashboardPage />} />
        <Route path="financials" element={<AdminDashboardPage />} />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
