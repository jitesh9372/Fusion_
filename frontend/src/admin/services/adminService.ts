import { supabase } from '@/supabase/client';
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
  fetchTrainingCourses,
} from '@/services/welfareTrainingService';
import { fetchAdminDashboardStats } from '@/services/adminAnalyticsService';

export const adminService = {
  fetchAdminDashboardStats,
  fetchServices,
  createService,
  toggleServiceActive,
  fetchWorkers,
  verifyWorker,
  fetchBookings,
  fetchPayments,
  fetchDisputes,
  resolveDispute,
  fetchWelfareClaims,
  updateWelfareClaimStatus,
  fetchTrainingCourses,
};

export default adminService;
