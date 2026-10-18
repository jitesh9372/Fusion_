import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const rawUrl = process.env.SUPABASE_URL;
const rawServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const isValidUrl = (url?: string): boolean => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const supabaseUrl = isValidUrl(rawUrl) ? rawUrl! : 'https://placeholder.supabase.co';
const supabaseServiceRoleKey = (rawServiceKey && rawServiceKey !== 'your_supabase_service_role_key')
  ? rawServiceKey
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder-service-key';

if (!isValidUrl(rawUrl) || rawServiceKey === 'your_supabase_service_role_key') {
  console.warn(
    '[FUSION Backend] Supabase configuration is missing or placeholder in backend/.env.'
  );
}

/**
 * Supabase admin client — uses the service role key.
 * NEVER expose this client or the service role key to the frontend.
 * Use this only for backend operations that require elevated privileges
 * (e.g., user management, profile creation, role assignment).
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
