import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jeremozmdszkeifxptau.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplcmVtb3ptZHN6a2VpZnhwdGF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4Mjg0ODYsImV4cCI6MjEwMzQwNDQ4Nn0.Iy2EN6Lc07lI16Jq8NRA0sv2Al9hTTuONabkdYzO-Xw';

/**
 * Centralized Supabase Client for FUSION Platform.
 * Uses strict browser localStorage persistence with PKCE authorization code flow.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: window.localStorage,
  },
});

export default supabase;
