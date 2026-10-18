import { supabase } from '@/supabase/client';
import type {
  ServiceItem,
  WorkerProfile,
  BookingItem,
  PaymentItem,
  MessageItem,
  ReviewItem,
  DisputeItem,
  NotificationItem,
  BookingStage,
} from '@/types/marketplace';
import {
  fetchServices as getServices,
  fetchWorkers as getWorkers,
  fetchBookings as getBookings,
  createBooking as makeBooking,
  updateBookingStage as setBookingStage,
  subscribeToBookings,
} from '@/services/marketplaceService';
import {
  fetchPayments as getPayments,
  createPayment as makePayment,
} from '@/services/paymentService';
import {
  fetchMessages as getMessages,
  sendMessage as pushMessage,
  subscribeToMessages,
  markMessagesAsRead,
  markConversationAsRead,
} from '@/services/chatService';
import {
  fetchReviews as getReviews,
  submitReview as makeReview,
  subscribeToReviews,
  fetchDisputes as getDisputes,
  createDispute as makeDispute,
  subscribeToDisputes,
  uploadDisputeEvidence,
} from '@/services/reviewDisputeService';
import {
  fetchNotifications as getNotifications,
  markNotificationAsRead as readNotification,
} from '@/services/welfareTrainingService';

export const customerService = {
  // Services
  getServices,
  
  // Workers Matching
  getWorkers,
  
  // Bookings
  getBookings,
  createBooking: makeBooking,
  updateBookingStage: setBookingStage,
  subscribeToBookings,
  
  // Payments & Escrow
  getPayments,
  createPayment: makePayment,
  
  // Messages
  getMessages,
  sendMessage: pushMessage,
  subscribeToMessages,
  markMessagesAsRead,
  markConversationAsRead,
  
  // Reviews & Disputes
  getReviews,
  submitReview: makeReview,
  subscribeToReviews,
  getDisputes,
  createDispute: makeDispute,
  subscribeToDisputes,
  uploadDisputeEvidence,
  
  // Notifications
  getNotifications,
  markNotificationAsRead: readNotification,
};

export default customerService;
