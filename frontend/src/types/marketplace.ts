/**
 * FUSION Marketplace & Ecosystem Data Types
 */

export interface ServiceItem {
  id: string;
  title: string;
  category: string;
  icon: string;
  description: string;
  base_price: number;
  duration_mins: number;
  active: boolean;
  created_at?: string;
}

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export interface WorkerCertificate {
  id: string;
  name: string;
  issuer: string;
  issue_date?: string;
  file_url: string;
}

export interface WorkerProfile {
  id: string;
  user_id: string;
  full_name?: string;
  email?: string;
  avatar_url?: string;
  trade_category: string;
  bio: string;
  hourly_rate: number;
  experience_years: number;
  verification_status: VerificationStatus;
  is_available: boolean;
  rating: number;
  total_jobs: number;
  service_areas: string[];
  skills?: string[];
  certificates?: WorkerCertificate[];
  id_document_url?: string;
  certificate_url?: string;
}

export interface CustomerProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone?: string | null;
  address?: string | null;
  avatar_url?: string | null;
  role: string;
  created_at: string;
  total_bookings?: number;
  total_spent?: number;
}

export type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
export type BookingStage = 'requested' | 'confirmed' | 'dispatched' | 'in_progress' | 'completed';

export interface BookingItem {
  id: string;
  customer_id: string;
  worker_id?: string | null;
  service_id: string;
  service_title: string;
  service_category: string;
  status: BookingStatus;
  stage: BookingStage;
  scheduled_date: string;
  scheduled_time: string;
  address: string;
  /** GPS latitude stored when customer confirms address (never displayed raw) */
  latitude?: number | null;
  /** GPS longitude stored when customer confirms address (never displayed raw) */
  longitude?: number | null;
  total_price: number;
  notes?: string;
  customer_name: string;
  worker_name?: string;
  created_at: string;
  updated_at?: string;
}

export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'disputed';

export interface PaymentItem {
  id: string;
  booking_id: string;
  customer_id: string;
  worker_id?: string | null;
  service_title?: string;
  amount: number;
  platform_fee: number;
  worker_payout: number;
  status: PaymentStatus;
  payment_method: string;
  created_at: string;
}

export interface MessageItem {
  id: string;
  booking_id?: string | null;
  sender_id: string;
  receiver_id: string;
  sender_name: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface ReviewItem {
  id: string;
  booking_id: string;
  customer_id: string;
  worker_id: string;
  customer_name: string;
  rating: number;
  comment: string;
  created_at: string;
  // Enriched display fields
  service_title?: string;
  worker_name?: string;
  worker_avatar?: string;
  worker_trade?: string;
}

export type DisputeStatus = 'open' | 'under_review' | 'resolved' | 'dismissed';

export interface DisputeItem {
  id: string;
  booking_id: string;
  raised_by: string;
  raised_by_name: string;
  reason: string;
  description?: string;
  evidence_urls?: string[];
  status: DisputeStatus;
  resolution_notes?: string | null;
  created_at: string;
  updated_at?: string;
  // Enriched display fields
  service_title?: string;
  worker_name?: string;
  worker_avatar?: string;
  booking_amount?: number;
  booking_date?: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'booking' | 'payment';
  is_read: boolean;
  link?: string;
  created_at: string;
}

export interface WelfareClaim {
  id: string;
  worker_id: string;
  worker_name?: string;
  claim_type: string;
  amount_requested: number;
  amount?: number;
  status: 'pending' | 'approved' | 'disbursed' | 'rejected';
  description: string;
  created_at?: string;
}

export interface TrainingCourse {
  id: string;
  title: string;
  category: string;
  duration_hours: number;
  modules_count: number;
  description: string;
  instructor?: string;
  badge_reward: string;
  progress_percent?: number;
  completed?: boolean;
}

export interface AdminAnalyticsData {
  totalCustomers: number;
  totalWorkers: number;
  verifiedWorkers: number;
  activeBookings: number;
  completedBookings: number;
  platformRevenue: number;
  pendingVerifications: number;
  openDisputes: number;
  totalUsers?: number;
  activeWorkers?: number;
  totalBookings?: number;
  grossMarketplaceVolume?: number;
  escrowBalance?: number;
  monthlyRevenue: { month: string; amount: number }[];
  categoryDistribution: { category: string; count: number; percentage: number }[];
  demandVsSupply: { category: string; demand: number; supply: number }[];
}
