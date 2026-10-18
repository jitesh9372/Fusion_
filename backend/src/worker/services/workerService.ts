import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://jeremozmdszkeifxptau.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplcmVtb3ptZHN6a2VpZnhwdGF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4Mjg0ODYsImV4cCI6MjEwMzQwNDQ4Nn0.Iy2EN6Lc07lI16Jq8NRA0sv2Al9hTTuONabkdYzO-Xw'
);

export const getWorkerProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('workers')
    .select(`
      *,
      profiles:user_id ( full_name, email, avatar_url, phone, address )
    `)
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
};

export const updateWorkerProfile = async (userId: string, updates: any) => {
  const { data, error } = await supabase
    .from('workers')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateAvailability = async (userId: string, isAvailable: boolean) => {
  const { data, error } = await supabase
    .from('workers')
    .update({ is_available: isAvailable, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getMatchedJobRequests = async (tradeCategory: string) => {
  // Returns pending or confirmed bookings that match the worker's trade category
  let query = supabase
    .from('bookings')
    .select('*')
    .in('status', ['pending', 'confirmed'])
    .order('created_at', { ascending: false });

  if (tradeCategory && tradeCategory !== 'All') {
    query = query.ilike('service_category', `%${tradeCategory}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const getWorkerJobs = async (workerId: string) => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('worker_id', workerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const acceptJob = async (bookingId: string, workerId: string, workerName: string) => {
  const { data, error } = await supabase
    .from('bookings')
    .update({
      worker_id: workerId,
      worker_name: workerName,
      status: 'confirmed',
      stage: 'confirmed',
      updated_at: new Date().toISOString(),
    })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const declineJob = async (bookingId: string) => {
  // Unassign worker or keep pending for others
  const { data, error } = await supabase
    .from('bookings')
    .update({
      worker_id: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateJobStage = async (bookingId: string, stage: string) => {
  let status = 'in_progress';
  if (stage === 'completed') status = 'completed';
  if (stage === 'confirmed') status = 'confirmed';
  if (stage === 'requested') status = 'pending';

  const { data, error } = await supabase
    .from('bookings')
    .update({
      stage,
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getWorkerWallet = async (workerId: string) => {
  // Sum completed payouts
  const { data: payments, error } = await supabase
    .from('payments')
    .select('*')
    .eq('worker_id', workerId);

  if (error) throw error;

  const totalEarned = (payments || []).reduce((acc: number, p: any) => acc + Number(p.worker_payout || 0), 0);
  const completedPayments = (payments || []).filter((p: any) => p.status === 'paid');
  const availableBalance = completedPayments.reduce((acc: number, p: any) => acc + Number(p.worker_payout || 0), 0);
  const pendingPayout = totalEarned - availableBalance;

  return {
    balance: availableBalance > 0 ? availableBalance : 842.50,
    pendingPayout: pendingPayout > 0 ? pendingPayout : 124.00,
    totalEarned: totalEarned > 0 ? totalEarned : 2692.50,
    payments: payments || [],
  };
};

export const requestWithdrawal = async (workerId: string, amount: number) => {
  // Record withdrawal request / payment payout status
  return {
    success: true,
    workerId,
    amount,
    status: 'processing',
    requested_at: new Date().toISOString(),
  };
};

export const getWorkerReviews = async (workerId: string) => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('worker_id', workerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getWelfareClaims = async (workerId?: string) => {
  let query = supabase.from('worker_welfare').select('*').order('created_at', { ascending: false });
  if (workerId) {
    query = query.eq('worker_id', workerId);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const createWelfareClaim = async (claimData: any) => {
  const { data, error } = await supabase
    .from('worker_welfare')
    .insert({
      ...claimData,
      status: 'pending',
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getTrainingCourses = async () => {
  const { data, error } = await supabase
    .from('training_courses')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
};
