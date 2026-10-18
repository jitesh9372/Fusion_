import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import DashboardNavbar from '@/components/common/DashboardNavbar';
import DashboardSidebar from '@/components/common/DashboardSidebar';
import AuthToast, { useToast } from '@/components/auth/AuthToast';

/**
 * AdminLayout
 * Top-level shell for all Admin views.
 * Uses the same light cream-and-green design as the Customer portal.
 */
export const AdminLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toasts, addToast, dismissToast } = useToast();

  const handleComingSoon = (feature: string) => {
    addToast('info', `${feature} selected.`);
  };

  return (
    <div className="h-screen overflow-hidden bg-[#EEF1EE] text-[#1B2420] flex flex-col font-sans">
      <AuthToast toasts={toasts} onDismiss={dismissToast} />

      <DashboardNavbar
        role="admin"
        isMobileMenuOpen={mobileMenuOpen}
        onMobileMenuToggle={() => setMobileMenuOpen(o => !o)}
        onComingSoon={handleComingSoon}
      />

      <div className="flex-1 flex overflow-hidden bg-[#EEF1EE]">
        <DashboardSidebar
          role="admin"
          isMobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#EEF1EE]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
