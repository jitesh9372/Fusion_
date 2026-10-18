import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://jeremozmdszkeifxptau.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplcmVtb3ptZHN6a2VpZnhwdGF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4Mjg0ODYsImV4cCI6MjEwMzQwNDQ4Nn0.Iy2EN6Lc07lI16Jq8NRA0sv2Al9hTTuONabkdYzO-Xw'
);

export const getServices = async () => {
  const { data, error } = await supabase.from('services').select('*').eq('active', true);
  if (error) throw error;
  return data;
};

export const getWorkersByTrade = async (tradeCategory?: string) => {
  let query = supabase.from('workers').select('*').eq('verification_status', 'verified');
  if (tradeCategory && tradeCategory !== 'All') {
    query = query.ilike('trade_category', `%${tradeCategory}%`);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const getCustomerBookings = async (customerId: string) => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const createCustomerBooking = async (bookingData: any) => {
  const { data, error } = await supabase
    .from('bookings')
    .insert(bookingData)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateBookingStage = async (bookingId: string, stage: string) => {
  const { data, error } = await supabase
    .from('bookings')
    .update({ stage, updated_at: new Date().toISOString() })
    .eq('id', bookingId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getCustomerPayments = async (customerId: string) => {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};
