import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CustomerLayout from '@/layouts/CustomerLayout';
import CustomerDashboardPage from '@/customer/pages/CustomerDashboardPage';

/**
 * CustomerRoutes
 * Handles all customer sub-routes:
 * /customer/dashboard
 * /customer/services
 * /customer/workers
 * /customer/bookings
 * /customer/tracking
 * /customer/payments
 * /customer/messages
 * /customer/reviews
 * /customer/disputes
 * /customer/notifications
 * /customer/profile
 */
export const CustomerRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<CustomerLayout />}>
        <Route index element={<Navigate to="/customer/dashboard" replace />} />
        <Route path="dashboard" element={<CustomerDashboardPage />} />
        <Route path="services" element={<CustomerDashboardPage />} />
        <Route path="workers" element={<CustomerDashboardPage />} />
        <Route path="bookings" element={<CustomerDashboardPage />} />
        <Route path="tracking" element={<CustomerDashboardPage />} />
        <Route path="payments" element={<CustomerDashboardPage />} />
        <Route path="messages" element={<CustomerDashboardPage />} />
        <Route path="reviews" element={<CustomerDashboardPage />} />
        <Route path="disputes" element={<CustomerDashboardPage />} />
        <Route path="notifications" element={<CustomerDashboardPage />} />
        <Route path="profile" element={<CustomerDashboardPage />} />
        <Route path="*" element={<Navigate to="/customer/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default CustomerRoutes;
