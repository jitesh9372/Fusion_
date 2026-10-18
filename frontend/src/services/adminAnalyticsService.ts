import { supabase } from '@/lib/supabase';
import type { AdminAnalyticsData } from '@/types/marketplace';
import { fetchWorkers, fetchBookings, fetchServices } from './marketplaceService';
import { fetchPayments } from './paymentService';
import { fetchDisputes } from './reviewDisputeService';

export const fetchAdminDashboardStats = async (): Promise<AdminAnalyticsData> => {
  try {
    // 1. Query live counts directly from Supabase
    const [
      { count: customerCount },
      { count: workerCount },
      { count: verifiedWorkerCount },
      { count: pendingWorkerCount },
      { count: activeBookingsCount },
      { count: completedBookingsCount },
      { count: openDisputesCount },
      { data: paymentsData },
      bookings,
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
      supabase.from('workers').select('*', { count: 'exact', head: true }),
      supabase.from('workers').select('*', { count: 'exact', head: true }).eq('verification_status', 'verified'),
      supabase.from('workers').select('*', { count: 'exact', head: true }).eq('verification_status', 'pending'),
      supabase.from('bookings').select('*', { count: 'exact', head: true }).in('status', ['confirmed', 'in_progress']),
      supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
      supabase.from('disputes').select('*', { count: 'exact', head: true }).in('status', ['open', 'under_review']),
      supabase.from('payments').select('amount, status'),
      fetchBookings(),
    ]);

    const totalCustomers = customerCount ?? 0;
    const totalWorkers = workerCount ?? 0;
    const verifiedWorkers = verifiedWorkerCount ?? 0;
    const pendingVerifications = pendingWorkerCount ?? 0;
    const activeBookings = activeBookingsCount ?? 0;
    const completedBookings = completedBookingsCount ?? 0;
    const openDisputes = openDisputesCount ?? 0;

    const platformRevenue = (paymentsData || [])
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    // Category distribution computed from real bookings
    const categoryCount: Record<string, number> = {};
    (bookings || []).forEach(b => {
      if (b.service_category) {
        categoryCount[b.service_category] = (categoryCount[b.service_category] || 0) + 1;
      }
    });

    const defaultCats = ['Electricity', 'AC Repair', 'Plumbing', 'Cleaning', 'Carpentry', 'Painting'];
    defaultCats.forEach(cat => {
      if (!categoryCount[cat]) categoryCount[cat] = 0;
    });

    const totalCatCount = Object.values(categoryCount).reduce((a, b) => a + b, 0) || 1;
    const categoryDistribution = Object.entries(categoryCount).map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / totalCatCount) * 100),
    }));

    // Demand vs Supply
    const demandVsSupply = defaultCats.map(cat => ({
      category: cat,
      demand: categoryCount[cat] || 0,
      supply: verifiedWorkers,
    }));

    const monthlyRevenue = [
      { month: 'Jan', amount: 0 },
      { month: 'Feb', amount: 0 },
      { month: 'Mar', amount: 0 },
      { month: 'Apr', amount: 0 },
      { month: 'May', amount: 0 },
      { month: 'Current', amount: Math.round(platformRevenue) },
    ];

    return {
      totalCustomers,
      totalWorkers,
      verifiedWorkers,
      activeBookings,
      completedBookings,
      platformRevenue,
      pendingVerifications,
      openDisputes,
      monthlyRevenue,
      categoryDistribution,
      demandVsSupply,
    };
  } catch (err) {
    console.error('[AdminAnalyticsService] Error fetching stats:', err);
    return {
      totalCustomers: 0,
      totalWorkers: 0,
      verifiedWorkers: 0,
      activeBookings: 0,
      completedBookings: 0,
      platformRevenue: 0,
      pendingVerifications: 0,
      openDisputes: 0,
      monthlyRevenue: [],
      categoryDistribution: [],
      demandVsSupply: [],
    };
  }
};
