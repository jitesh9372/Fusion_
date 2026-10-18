import { supabase } from '@/supabase/client';
import {
  fetchBookings,
  updateBookingStatus,
  updateBookingStage,
  fetchWorkerByUserId,
  updateWorkerAvailability,
} from '@/services/marketplaceService';
import { fetchPayments, fetchWorkerWallet, requestWithdrawal } from '@/services/paymentService';
import { fetchMessages, sendMessage } from '@/services/chatService';
import { fetchReviews } from '@/services/reviewDisputeService';
import {
  fetchWelfareClaims,
  submitWelfareClaim,
  fetchTrainingCourses,
  fetchNotifications,
} from '@/services/welfareTrainingService';

export const workerService = {
  fetchBookings,
  updateBookingStatus,
  updateBookingStage,
  fetchWorkerByUserId,
  updateWorkerAvailability,
  fetchPayments,
  fetchWorkerWallet,
  requestWithdrawal,
  fetchMessages,
  sendMessage,
  fetchReviews,
  fetchWelfareClaims,
  submitWelfareClaim,
  fetchTrainingCourses,
  fetchNotifications,
};

export default workerService;
