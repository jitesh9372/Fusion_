import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://jeremozmdszkeifxptau.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplcmVtb3ptZHN6a2VpZnhwdGF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4Mjg0ODYsImV4cCI6MjEwMzQwNDQ4Nn0.Iy2EN6Lc07lI16Jq8NRA0sv2Al9hTTuONabkdYzO-Xw'
);

export const getDashboardAnalytics = async () => {
  const [usersRes, workersRes, bookingsRes, paymentsRes] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('workers').select('id', { count: 'exact', head: true }),
    supabase.from('bookings').select('id, total_price, status'),
    supabase.from('payments').select('amount, platform_fee, status'),
  ]);

  const totalUsers = usersRes.count ?? 0;
  const activeWorkers = workersRes.count ?? 0;
  const bookings: any[] = bookingsRes.data || [];
  const payments: any[] = paymentsRes.data || [];

  const grossVolume = payments.reduce((acc: number, p: any) => acc + (p.amount || 0), 0);
  const platformRevenue = payments.reduce((acc: number, p: any) => acc + (p.platform_fee || 0), 0);
  const escrowBalance = payments
    .filter((p: any) => p.status === 'paid' || p.status === 'pending')
    .reduce((acc: number, p: any) => acc + (p.amount || 0), 0);

  return {
    totalUsers,
    activeWorkers,
    totalBookings: bookings.length,
    grossMarketplaceVolume: Math.round(grossVolume * 100) / 100,
    platformRevenue: Math.round(platformRevenue * 100) / 100,
    escrowBalance: Math.round(escrowBalance * 100) / 100,
  };
};

export const getAllWorkers = async () => {
  const { data, error } = await supabase
    .from('workers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const updateWorkerVerification = async (workerId: string, status: string) => {
  const { data, error } = await supabase
    .from('workers')
    .update({ verification_status: status })
    .eq('id', workerId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getAllBookings = async () => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};
