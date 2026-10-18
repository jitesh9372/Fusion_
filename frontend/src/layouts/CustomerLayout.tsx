import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import DashboardNavbar from '@/components/common/DashboardNavbar';
import DashboardSidebar from '@/components/common/DashboardSidebar';
import AuthToast, { useToast } from '@/components/auth/AuthToast';
import FusionChatWidget from '@/components/common/FusionChatWidget';

export const CustomerLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toasts, addToast, dismissToast } = useToast();

  const handleComingSoon = (feature: string) => {
    addToast('info', `${feature} selected.`);
  };

  return (
    <div className="h-screen overflow-hidden bg-[#EEF1EE] text-[#1B2420] flex flex-col font-sans relative">
      <AuthToast toasts={toasts} onDismiss={dismissToast} />

      <DashboardNavbar
        role="customer"
        isMobileMenuOpen={mobileMenuOpen}
        onMobileMenuToggle={() => setMobileMenuOpen(o => !o)}
        onComingSoon={handleComingSoon}
      />

      <div className="flex-1 flex overflow-hidden bg-[#EEF1EE]">
        <DashboardSidebar
          role="customer"
          isMobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#EEF1EE]">
          <Outlet />
        </main>
      </div>

      {/* Floating 3D Spline Chatbot Agent */}
      <FusionChatWidget role="customer" />
    </div>
  );
};

export default CustomerLayout;

