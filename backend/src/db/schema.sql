-- ==============================================================================
-- FUSION DATABASE SCHEMA — FULL 3-ROLE ECOSYSTEM
-- ==============================================================================
-- Run this script in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- It configures all tables, custom enums, RLS policies, automated triggers,
-- and seeds the initial service catalogue and training courses.
-- ==============================================================================

-- 1. Custom Enum Types
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('customer', 'worker', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'refunded', 'disputed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE verification_status AS ENUM ('unverified', 'pending', 'verified', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  address TEXT,
  role user_role NOT NULL DEFAULT 'customer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Services Catalogue
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  icon TEXT NOT NULL,
  description TEXT NOT NULL,
  base_price NUMERIC(10, 2) NOT NULL DEFAULT 49.00,
  duration_mins INT NOT NULL DEFAULT 60,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Worker Profiles Table
CREATE TABLE IF NOT EXISTS public.workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  trade_category TEXT NOT NULL,
  bio TEXT,
  hourly_rate NUMERIC(10, 2) NOT NULL DEFAULT 35.00,
  experience_years INT NOT NULL DEFAULT 3,
  verification_status verification_status NOT NULL DEFAULT 'pending',
  is_available BOOLEAN NOT NULL DEFAULT true,
  rating NUMERIC(3, 2) NOT NULL DEFAULT 4.8,
  total_jobs INT NOT NULL DEFAULT 0,
  service_areas TEXT[] DEFAULT ARRAY['Central District', 'North Bay', 'Downtown'],
  id_document_url TEXT,
  certificate_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  worker_id UUID REFERENCES public.workers(id) ON DELETE SET NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE RESTRICT,
  service_title TEXT NOT NULL,
  service_category TEXT NOT NULL,
  status booking_status NOT NULL DEFAULT 'pending',
  stage TEXT NOT NULL DEFAULT 'requested', -- requested, confirmed, dispatched, in_progress, completed
  scheduled_date DATE NOT NULL DEFAULT CURRENT_DATE,
  scheduled_time TEXT NOT NULL DEFAULT '10:00 AM',
  address TEXT NOT NULL,
  total_price NUMERIC(10, 2) NOT NULL DEFAULT 50.00,
  notes TEXT,
  customer_name TEXT,
  worker_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  worker_id UUID REFERENCES public.workers(id) ON DELETE SET NULL,
  amount NUMERIC(10, 2) NOT NULL,
  platform_fee NUMERIC(10, 2) NOT NULL DEFAULT 5.00,
  worker_payout NUMERIC(10, 2) NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  payment_method TEXT NOT NULL DEFAULT 'Credit Card (Stripe)',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  worker_id UUID REFERENCES public.workers(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. Disputes Table
CREATE TABLE IF NOT EXISTS public.disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  raised_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  raised_by_name TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open', -- open, under_review, resolved, dismissed
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- info, success, warning, booking, payment
  is_read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 11. Worker Welfare Fund Claims
CREATE TABLE IF NOT EXISTS public.worker_welfare (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID REFERENCES public.workers(id) ON DELETE CASCADE,
  worker_name TEXT NOT NULL,
  claim_type TEXT NOT NULL, -- Healthcare Support, Equipment Repair, Emergency Mutual Aid, Tool Subsidy
  amount_requested NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, disbursed, rejected
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 12. Vocational Training & Certification Courses
CREATE TABLE IF NOT EXISTS public.training_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  duration_hours INT NOT NULL DEFAULT 4,
  modules_count INT NOT NULL DEFAULT 6,
  description TEXT NOT NULL,
  instructor TEXT NOT NULL DEFAULT 'FUSION Cooperative Academy',
  badge_reward TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 13. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_welfare ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_courses ENABLE ROW LEVEL SECURITY;

-- 14. RLS Policies
-- Profiles
DROP POLICY IF EXISTS "Public read profiles" ON public.profiles;
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Services
DROP POLICY IF EXISTS "Public read services" ON public.services;
CREATE POLICY "Public read services" ON public.services FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage services" ON public.services;
CREATE POLICY "Admins manage services" ON public.services FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Workers
DROP POLICY IF EXISTS "Public read workers" ON public.workers;
CREATE POLICY "Public read workers" ON public.workers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Workers manage own worker profile" ON public.workers;
CREATE POLICY "Workers manage own worker profile" ON public.workers FOR ALL USING (user_id = auth.uid());

-- Bookings
DROP POLICY IF EXISTS "Users read own bookings" ON public.bookings;
CREATE POLICY "Users read own bookings" ON public.bookings FOR SELECT USING (
  customer_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.workers WHERE workers.id = bookings.worker_id AND workers.user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

DROP POLICY IF EXISTS "Customers insert bookings" ON public.bookings;
CREATE POLICY "Customers insert bookings" ON public.bookings FOR INSERT WITH CHECK (customer_id = auth.uid());

DROP POLICY IF EXISTS "Participants update bookings" ON public.bookings;
CREATE POLICY "Participants update bookings" ON public.bookings FOR UPDATE USING (
  customer_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.workers WHERE workers.id = bookings.worker_id AND workers.user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Payments
DROP POLICY IF EXISTS "Users read own payments" ON public.payments;
CREATE POLICY "Users read own payments" ON public.payments FOR SELECT USING (
  customer_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.workers WHERE workers.id = payments.worker_id AND workers.user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Messages
DROP POLICY IF EXISTS "Users read own messages" ON public.messages;
CREATE POLICY "Users read own messages" ON public.messages FOR SELECT USING (
  sender_id = auth.uid() OR receiver_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

DROP POLICY IF EXISTS "Users insert messages" ON public.messages;
CREATE POLICY "Users insert messages" ON public.messages FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Reviews
DROP POLICY IF EXISTS "Public read reviews" ON public.reviews;
CREATE POLICY "Public read reviews" ON public.reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Customers insert reviews" ON public.reviews;
CREATE POLICY "Customers insert reviews" ON public.reviews FOR INSERT WITH CHECK (customer_id = auth.uid());

-- Disputes
DROP POLICY IF EXISTS "Users read own disputes" ON public.disputes;
CREATE POLICY "Users read own disputes" ON public.disputes FOR SELECT USING (
  raised_by = auth.uid() OR
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

DROP POLICY IF EXISTS "Users insert disputes" ON public.disputes;
CREATE POLICY "Users insert disputes" ON public.disputes FOR INSERT WITH CHECK (raised_by = auth.uid());

DROP POLICY IF EXISTS "Admins update disputes" ON public.disputes;
CREATE POLICY "Admins update disputes" ON public.disputes FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Notifications
DROP POLICY IF EXISTS "Users read own notifications" ON public.notifications;
CREATE POLICY "Users read own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users update own notifications" ON public.notifications;
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE USING (user_id = auth.uid());

-- Training Courses & Welfare
DROP POLICY IF EXISTS "Public read training" ON public.training_courses;
CREATE POLICY "Public read training" ON public.training_courses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Workers manage welfare" ON public.worker_welfare;
CREATE POLICY "Workers manage welfare" ON public.worker_welfare FOR ALL USING (
  EXISTS (SELECT 1 FROM public.workers WHERE workers.id = worker_welfare.worker_id AND workers.user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- 15. Automated Trigger for New User Signup (with automatic admin assignment for administrator26@gmail.com)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  assigned_role user_role := 'customer';
  raw_role TEXT;
BEGIN
  -- Check if administrator email
  IF LOWER(NEW.email) = 'administrator26@gmail.com' THEN
    assigned_role := 'admin';
  ELSE
    raw_role := LOWER(COALESCE(NEW.raw_user_meta_data->>'role', 'customer'));
    IF raw_role = 'worker' THEN
      assigned_role := 'worker';
    ELSIF raw_role = 'admin' THEN
      assigned_role := 'admin';
    ELSE
      assigned_role := 'customer';
    END IF;
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'FUSION User'),
    assigned_role
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = CASE WHEN LOWER(NEW.email) = 'administrator26@gmail.com' THEN 'admin' ELSE profiles.role END,
    updated_at = timezone('utc'::text, now());

  -- If worker, create initial worker row
  IF assigned_role = 'worker' THEN
    INSERT INTO public.workers (user_id, trade_category, bio, hourly_rate, experience_years, verification_status)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'trade_category', 'Electricity / Electrical'),
      'Certified skilled trade professional on FUSION Cooperative.',
      45.00,
      4,
      'verified'
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 16. Seed Initial 9 Core Services Catalogue
INSERT INTO public.services (title, category, icon, description, base_price, duration_mins) VALUES
  ('⚡ Electricity / Electrician', 'Electricity', 'Zap', 'Wiring repair, circuit breaker maintenance, light fixture installation, and emergency power restoration.', 55.00, 60),
  ('❄️ AC Repair & Service', 'AC Repair', 'Snowflake', 'Complete air conditioner diagnostic, gas refilling, filter deep-cleaning, and cooling coil repair.', 65.00, 90),
  ('🎨 Painter', 'Painting', 'Paintbrush', 'Interior and exterior wall painting, waterproof primer coating, plaster patch-up, and texture design.', 45.00, 120),
  ('🧹 Cleaning', 'Cleaning', 'Sparkles', 'Deep home sanitization, kitchen and bathroom scrub, floor polishing, and post-renovation cleanup.', 40.00, 120),
  ('🔧 Plumbing', 'Plumbing', 'Wrench', 'Leak detection, pipe replacement, drain unclogging, water heater installation, and tap repair.', 50.00, 60),
  ('🪚 Carpenter', 'Carpentry', 'Hammer', 'Custom furniture repair, door lock installation, kitchen cabinet fixing, and wood restoration.', 48.00, 90),
  ('🌳 Gardening', 'Gardening', 'Trees', 'Lawn mowing, hedge trimming, weed removal, plant fertilizing, and landscape maintenance.', 38.00, 60),
  ('🚗 Driver', 'Driving', 'Car', 'Personal city chauffeur, outstation transport, corporate travel, and temporary vehicle driver.', 35.00, 60),
  ('🏠 Appliance Repair', 'Appliance Repair', 'Wrench', 'Refrigerator, washing machine, microwave, and dishwasher troubleshooting and spare part replacement.', 55.00, 90)
ON CONFLICT DO NOTHING;

-- 17. Seed Initial Vocational Training Courses
INSERT INTO public.training_courses (title, category, duration_hours, modules_count, description, badge_reward) VALUES
  ('High-Voltage Safety & Modern Circuitry', 'Electricity', 6, 8, 'Advanced troubleshooting of modern home electrical systems and safety protocols.', 'Master Electrician Safety Badge'),
  ('Eco-Friendly Refrigerants & HVAC Optimization', 'AC Repair', 5, 7, 'Next-generation HVAC maintenance adhering to environmental green cooling standards.', 'Certified HVAC Specialist'),
  ('Advanced Hydro-Piping & Leak Prevention', 'Plumbing', 4, 6, 'Diagnostic acoustic leak detection and modern PEX plumbing installations.', 'Certified Master Plumber'),
  ('Precision Finish Carpentry & Joinery', 'Carpentry', 8, 10, 'Fine woodworking techniques, concealed hinge installations, and structural repairs.', 'Craftsman Finish Master')
ON CONFLICT DO NOTHING;
