import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import WorkerLayout from '@/layouts/WorkerLayout';
import WorkerDashboardPage from '@/worker/pages/WorkerDashboardPage';

/**
 * WorkerRoutes
 * Handles all 15 worker sub-routes:
 * /worker/dashboard
 * /worker/profile
 * /worker/verification
 * /worker/skills
 * /worker/requests
 * /worker/jobs
 * /worker/availability
 * /worker/earnings
 * /worker/wallet
 * /worker/ratings
 * /worker/welfare
 * /worker/training
 * /worker/messages
 * /worker/notifications
 * /worker/settings
 */
export const WorkerRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<WorkerLayout />}>
        <Route index element={<Navigate to="/worker/dashboard" replace />} />
        <Route path="dashboard" element={<WorkerDashboardPage />} />
        <Route path="profile" element={<WorkerDashboardPage />} />
        <Route path="verification" element={<WorkerDashboardPage />} />
        <Route path="skills" element={<WorkerDashboardPage />} />
        <Route path="requests" element={<WorkerDashboardPage />} />
        <Route path="jobs" element={<WorkerDashboardPage />} />
        <Route path="wallet" element={<WorkerDashboardPage />} />
        <Route path="earnings" element={<Navigate to="/worker/wallet" replace />} />
        <Route path="ratings" element={<WorkerDashboardPage />} />
        <Route path="welfare" element={<WorkerDashboardPage />} />
        <Route path="messages" element={<WorkerDashboardPage />} />
        <Route path="availability" element={<Navigate to="/worker/dashboard" replace />} />
        <Route path="training" element={<Navigate to="/worker/skills" replace />} />
        <Route path="notifications" element={<Navigate to="/worker/dashboard" replace />} />
        <Route path="settings" element={<Navigate to="/worker/profile" replace />} />
        <Route path="*" element={<Navigate to="/worker/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default WorkerRoutes;
