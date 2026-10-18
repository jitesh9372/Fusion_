import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  fetchServices,
  createService,
  toggleServiceActive,
  fetchWorkers,
  verifyWorker,
  fetchBookings,
} from '@/services/marketplaceService';
import { fetchPayments } from '@/services/paymentService';
import { fetchDisputes, resolveDispute } from '@/services/reviewDisputeService';
import {
  fetchWelfareClaims,
  updateWelfareClaimStatus,
} from '@/services/welfareTrainingService';
import { fetchAdminDashboardStats } from '@/services/adminAnalyticsService';
import AuthToast, { useToast } from '@/components/auth/AuthToast';
import type {
  ServiceItem,
  WorkerProfile,
  BookingItem,
  PaymentItem,
  DisputeItem,
  WelfareClaim,
  AdminAnalyticsData,
  VerificationStatus,
} from '@/types/marketplace';

// Modular Admin Sub-Components
import AdminMetricCards from '@/admin/components/AdminMetricCards';
import AdminWorkersTable from '@/admin/components/AdminWorkersTable';
import AdminServicesManagement from '@/admin/components/AdminServicesManagement';
import AdminDisputesTable from '@/admin/components/AdminDisputesTable';
import AdminWelfareClaimsTable from '@/admin/components/AdminWelfareClaimsTable';
import AdminBookingsMonitor from '@/admin/components/AdminBookingsMonitor';
import AdminFinancialsOverview from '@/admin/components/AdminFinancialsOverview';
// New functional views
import AdminCustomersView from '@/admin/components/AdminCustomersView';
import AdminVerificationView from '@/admin/components/AdminVerificationView';
import AdminAnalyticsView from '@/admin/components/AdminAnalyticsView';
import AdminSettingsView from '@/admin/components/AdminSettingsView';

export const AdminDashboardPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  // Admin uses path-based routing: /admin/:tab
  const pathTab = location.pathname.replace(/^\/admin\/?/, '').split('/')[0];
  const activeTab = pathTab || searchParams.get('tab') || 'dashboard';


  const { user } = useAuth();
  const { toasts, addToast, dismissToast } = useToast();

  // ─── Domain Data States ───────────────────────────────────────────────────
  const [analytics, setAnalytics] = useState<AdminAnalyticsData | null>(null);
  const [workers, setWorkers] = useState<WorkerProfile[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [disputes, setDisputes] = useState<DisputeItem[]>([]);
  const [welfareClaims, setWelfareClaims] = useState<WelfareClaim[]>([]);

  // ─── Search & Filter States ───────────────────────────────────────────────
  const [workerSearch, setWorkerSearch] = useState('');
  const [bookingFilter, setBookingFilter] = useState('all');

  // ─── Modals & New Service Form ────────────────────────────────────────────
  const [newServiceModalOpen, setNewServiceModalOpen] = useState(false);
  const [serviceTitle, setServiceTitle] = useState('');
  const [serviceCategory, setServiceCategory] = useState('Electricity');
  const [servicePrice, setServicePrice] = useState('50.00');
  const [serviceDesc, setServiceDesc] = useState('');

  // ─── Load All Admin Data ──────────────────────────────────────────────────
  useEffect(() => {
    const loadAll = async () => {
      const [stats, wrk, srv, bkg, pay, dsp, wlf] = await Promise.all([
        fetchAdminDashboardStats(),
        fetchWorkers(),
        fetchServices(),
        fetchBookings(),
        fetchPayments(),
        fetchDisputes(),
        fetchWelfareClaims(),
      ]);

      setAnalytics(stats);
      setWorkers(wrk);
      setServices(srv);
      setBookings(bkg);
      setPayments(pay);
      setDisputes(dsp);
      setWelfareClaims(wlf);
    };

    loadAll();
  }, []);

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleUpdateWorkerVerification = async (
    workerId: string,
    status: VerificationStatus
  ) => {
    const success = await verifyWorker(workerId, status);
    if (success) {
      setWorkers(prev =>
        prev.map(w => (w.id === workerId ? { ...w, verification_status: status } : w))
      );
      addToast(
        status === 'verified' ? 'success' : 'info',
        `Worker status updated to: ${status.toUpperCase()}`
      );
    }
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(servicePrice);
    try {
      const newService = await createService({
        title: serviceTitle,
        category: serviceCategory,
        base_price: isNaN(price) ? 50 : price,
        description: serviceDesc,
        duration_mins: 60,
        icon: 'wrench',
        active: true,
      });

      if (newService) {
        setServices(prev => [newService, ...prev]);
        setNewServiceModalOpen(false);
        setServiceTitle('');
        setServiceDesc('');
        addToast('success', `Service "${newService.title}" created in marketplace catalog.`);
      }
    } catch (err: any) {
      addToast('error', 'Failed to create service: ' + err.message);
    }
  };

  const handleToggleService = async (serviceId: string, currentActive: boolean) => {
    const success = await toggleServiceActive(serviceId, !currentActive);
    if (success) {
      setServices(prev =>
        prev.map(s => (s.id === serviceId ? { ...s, active: !currentActive } : s))
      );
      addToast(
        'info',
        !currentActive ? 'Service enabled for customers.' : 'Service disabled from catalog.'
      );
    }
  };

  const handleResolveDispute = async (
    disputeId: string,
    resolution: 'resolved' | 'dismissed'
  ) => {
    const success = await resolveDispute(
      disputeId,
      resolution === 'resolved' ? 'Escrow refunded to customer.' : 'Escrow awarded to artisan.'
    );
    if (success) {
      setDisputes(prev =>
        prev.map(d => (d.id === disputeId ? { ...d, status: resolution } : d))
      );
      addToast('success', `Dispute ${resolution}: Escrow settlement released.`);
    }
  };

  const handleUpdateClaimStatus = async (
    claimId: string,
    status: 'approved' | 'rejected'
  ) => {
    const success = await updateWelfareClaimStatus(claimId, status);
    if (success) {
      setWelfareClaims(prev =>
        prev.map(c => (c.id === claimId ? { ...c, status } : c))
      );
      addToast(
        status === 'approved' ? 'success' : 'info',
        `Welfare grant ${status.toUpperCase()} by Cooperative Executive.`
      );
    }
  };

  return (
    <>
      <AuthToast toasts={toasts} onDismiss={dismissToast} />

      <div className="space-y-8 max-w-7xl mx-auto pb-20">
        {/* TAB 1: EXECUTIVE DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-10">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#1B2420]">
                Cooperative Governance Overview
              </h1>
              <p className="text-xs text-[#3A423E]/80">
                Real-time marketplace volume, live artisan audits, and escrow liquidity.
              </p>
            </div>

            <AdminMetricCards analytics={analytics} />

            {/* Quick Workers Verification Table */}
            <AdminWorkersTable
              workers={workers.slice(0, 5)}
              workerSearch={workerSearch}
              setWorkerSearch={setWorkerSearch}
              onUpdateVerification={handleUpdateWorkerVerification}
            />
          </div>
        )}

        {/* TAB 2: ARTISANS DIRECTORY */}
        {activeTab === 'workers' && (
          <AdminWorkersTable
            workers={workers}
            workerSearch={workerSearch}
            setWorkerSearch={setWorkerSearch}
            onUpdateVerification={handleUpdateWorkerVerification}
          />
        )}

        {/* TAB 3: SERVICES CATALOG */}
        {activeTab === 'services' && (
          <AdminServicesManagement
            services={services}
            newServiceModalOpen={newServiceModalOpen}
            setNewServiceModalOpen={setNewServiceModalOpen}
            serviceTitle={serviceTitle}
            setServiceTitle={setServiceTitle}
            serviceCategory={serviceCategory}
            setServiceCategory={setServiceCategory}
            servicePrice={servicePrice}
            setServicePrice={setServicePrice}
            serviceDesc={serviceDesc}
            setServiceDesc={setServiceDesc}
            onCreateService={handleCreateService}
            onToggleService={handleToggleService}
          />
        )}

        {/* TAB 4: DISPUTES ARBITRATION */}
        {activeTab === 'disputes' && (
          <AdminDisputesTable
            disputes={disputes}
            onResolveDispute={handleResolveDispute}
          />
        )}

        {/* TAB 5: WELFARE FUND */}
        {activeTab === 'welfare' && (
          <AdminWelfareClaimsTable
            claims={welfareClaims}
            onUpdateClaimStatus={handleUpdateClaimStatus}
          />
        )}

        {/* TAB 6: BOOKINGS MONITOR */}
        {activeTab === 'bookings' && (
          <AdminBookingsMonitor
            bookings={bookings}
            bookingFilter={bookingFilter}
            setBookingFilter={setBookingFilter}
          />
        )}

        {/* TAB 7: FINANCIAL LEDGER */}
        {activeTab === 'financials' && (
          <AdminFinancialsOverview payments={payments} />
        )}

        {/* TAB 8: PAYMENTS & TREASURY */}
        {activeTab === 'payments' && (
          <AdminFinancialsOverview payments={payments} />
        )}

        {/* TAB 9: CUSTOMER DIRECTORY */}
        {activeTab === 'customers' && (
          <AdminCustomersView />
        )}

        {/* TAB 10: VERIFICATION QUEUE */}
        {activeTab === 'verification' && (
          <AdminVerificationView />
        )}

        {/* TAB 11: DEEP ANALYTICS */}
        {activeTab === 'analytics' && (
          <AdminAnalyticsView />
        )}

        {/* TAB 12: ECOSYSTEM POLICIES & SETTINGS */}
        {activeTab === 'settings' && (
          <AdminSettingsView />
        )}
      </div>
    </>
  );
};

export default AdminDashboardPage;
