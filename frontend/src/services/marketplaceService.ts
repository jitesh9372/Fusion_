import { supabase } from '@/lib/supabase';
import type {
  ServiceItem,
  WorkerProfile,
  WorkerCertificate,
  BookingItem,
  BookingStatus,
  BookingStage,
  VerificationStatus,
} from '@/types/marketplace';

// ─── Initial Seed / Mock Fallback Data ───────────────────────────────────────
export const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: 'srv-1',
    title: '⚡ Electricity / Electrician',
    category: 'Electricity',
    icon: 'Zap',
    description: 'Wiring diagnostics, circuit breaker repair, short circuit fixes, fixture installs, and emergency power restoration.',
    base_price: 55.0,
    duration_mins: 60,
    active: true,
  },
  {
    id: 'srv-2',
    title: '❄️ AC Repair & Service',
    category: 'AC Repair',
    icon: 'Snowflake',
    description: 'Compressor check, eco-gas refilling, multi-point filter sanitization, cooling coil maintenance, and duct cleaning.',
    base_price: 65.0,
    duration_mins: 90,
    active: true,
  },
  {
    id: 'srv-3',
    title: '🎨 Painter',
    category: 'Painting',
    icon: 'Paintbrush',
    description: 'Interior/exterior coating, moisture sealant, crack repair, texture art, waterproof primer, and wallpaper application.',
    base_price: 45.0,
    duration_mins: 120,
    active: true,
  },
  {
    id: 'srv-4',
    title: '🧹 Cleaning',
    category: 'Cleaning',
    icon: 'Sparkles',
    description: 'Deep residential sanitization, steam carpet cleaning, kitchen degreasing, bathroom scrubbing, and post-event cleanup.',
    base_price: 40.0,
    duration_mins: 120,
    active: true,
  },
  {
    id: 'srv-5',
    title: '🔧 Plumbing',
    category: 'Plumbing',
    icon: 'Wrench',
    description: 'High-pressure leak detection, drain jetting, faucet & valve replacement, water heater installation, and pipe rerouting.',
    base_price: 50.0,
    duration_mins: 60,
    active: true,
  },
  {
    id: 'srv-6',
    title: '🪚 Carpenter',
    category: 'Carpentry',
    icon: 'Hammer',
    description: 'Custom furniture repair, concealed hinge fixing, door lock replacement, acoustic wall panelling, and wood restoration.',
    base_price: 48.0,
    duration_mins: 90,
    active: true,
  },
  {
    id: 'srv-7',
    title: '🌳 Gardening',
    category: 'Gardening',
    icon: 'Trees',
    description: 'Lawn aerating & mowing, precision hedge trimming, botanical fertilizing, automated sprinkler fixes, and weed treatment.',
    base_price: 38.0,
    duration_mins: 60,
    active: true,
  },
  {
    id: 'srv-8',
    title: '🚗 Driver',
    category: 'Driving',
    icon: 'Car',
    description: 'Professional city chauffeur, airport drop-off, inter-city conveyance, and corporate personal transportation.',
    base_price: 35.0,
    duration_mins: 60,
    active: true,
  },
  {
    id: 'srv-9',
    title: '🏠 Appliance Repair',
    category: 'Appliance Repair',
    icon: 'Cpu',
    description: 'Refrigerator cooling fixes, washing machine motor repair, microwave magnetron check, and dishwasher maintenance.',
    base_price: 55.0,
    duration_mins: 90,
    active: true,
  },
  {
    id: 'srv-10',
    title: '🛡️ Home Security Installation',
    category: 'Security',
    icon: 'ShieldCheck',
    description: 'CCTV camera setup, motion sensor installation, smart lock programming, alarm system wiring, and intercom setup.',
    base_price: 80.0,
    duration_mins: 120,
    active: true,
  },
  {
    id: 'srv-11',
    title: '🏗️ Home Renovation',
    category: 'Renovation',
    icon: 'Hammer',
    description: 'Full or partial home renovation: flooring, false ceiling, kitchen remodelling, bathroom tiling, and interior makeovers.',
    base_price: 150.0,
    duration_mins: 240,
    active: true,
  },
  {
    id: 'srv-12',
    title: '💻 Computer & IT Support',
    category: 'IT Support',
    icon: 'Cpu',
    description: 'Laptop repair, data recovery, network setup, router configuration, virus removal, and OS reinstallation.',
    base_price: 50.0,
    duration_mins: 60,
    active: true,
  },
  {
    id: 'srv-13',
    title: '🚿 Bathroom Deep Clean',
    category: 'Cleaning',
    icon: 'Sparkles',
    description: 'Anti-bacterial grout cleaning, mold treatment, tile polishing, drain unclogging, and sanitizer fogging.',
    base_price: 35.0,
    duration_mins: 90,
    active: true,
  },
  {
    id: 'srv-14',
    title: '🛁 Water Tank Cleaning',
    category: 'Plumbing',
    icon: 'Wrench',
    description: 'Overhead and underground tank scrubbing, sediment flushing, chlorination treatment, and outlet valve inspection.',
    base_price: 45.0,
    duration_mins: 90,
    active: true,
  },
  {
    id: 'srv-15',
    title: '🌡️ Pest Control',
    category: 'Pest Control',
    icon: 'ShieldCheck',
    description: 'Cockroach, termite, rodent, and bed bug extermination using certified chemicals. Pre and post-treatment inspection included.',
    base_price: 60.0,
    duration_mins: 90,
    active: true,
  },
];

export const INITIAL_WORKERS: WorkerProfile[] = [
  {
    id: 'wrk-1',
    user_id: 'usr-w1',
    full_name: 'Marcus Vance',
    email: 'marcus.vance@worker.fusion.app',
    trade_category: 'Electricity',
    bio: 'Master Electrician with 9+ years experience specializing in smart grid home installations and high-voltage circuit restoration.',
    hourly_rate: 55.0,
    experience_years: 9,
    verification_status: 'verified',
    is_available: true,
    rating: 4.95,
    total_jobs: 142,
    service_areas: ['Central District', 'North Bay', 'Downtown'],
  },
  {
    id: 'wrk-2',
    user_id: 'usr-w2',
    full_name: 'Elena Rostova',
    email: 'elena.rostova@worker.fusion.app',
    trade_category: 'AC Repair',
    bio: 'Certified HVAC & refrigeration technician. Fast diagnostics, eco-friendly refrigerants, and complete system restoration.',
    hourly_rate: 65.0,
    experience_years: 7,
    verification_status: 'verified',
    is_available: true,
    rating: 4.88,
    total_jobs: 98,
    service_areas: ['Westside', 'Metro Hub', 'Tech Corridor'],
  },
  {
    id: 'wrk-3',
    user_id: 'usr-w3',
    full_name: 'Devon Reed',
    email: 'devon.reed@worker.fusion.app',
    trade_category: 'Plumbing',
    bio: 'Precision plumber experienced in residential leak detection, hydro-jet drain clearing, and complete copper/PEX rerouting.',
    hourly_rate: 50.0,
    experience_years: 6,
    verification_status: 'verified',
    is_available: true,
    rating: 4.92,
    total_jobs: 114,
    service_areas: ['Downtown', 'South Bay', 'Greenfield'],
  },
  {
    id: 'wrk-4',
    user_id: 'usr-w4',
    full_name: 'Sarah Chen',
    email: 'sarah.chen@worker.fusion.app',
    trade_category: 'Painting',
    bio: 'Architectural coating artisan and texture specialist with flawless finish track record across residential and commercial estates.',
    hourly_rate: 45.0,
    experience_years: 5,
    verification_status: 'verified',
    is_available: false,
    rating: 4.85,
    total_jobs: 76,
    service_areas: ['Central District', 'Highland Park'],
  },
  {
    id: 'wrk-5',
    user_id: 'usr-w5',
    full_name: 'Tariq Al-Mansoor',
    email: 'tariq.m@worker.fusion.app',
    trade_category: 'Carpentry',
    bio: 'Guild-trained finish carpenter specializing in custom cabinetry, door alignment, concealed hardware, and hardwood restoration.',
    hourly_rate: 48.0,
    experience_years: 8,
    verification_status: 'verified',
    is_available: true,
    rating: 4.91,
    total_jobs: 129,
    service_areas: ['East Hills', 'Downtown', 'North Bay'],
  },
  {
    id: 'wrk-6',
    user_id: 'usr-w6',
    full_name: 'Kavita Patel',
    email: 'kavita.p@worker.fusion.app',
    trade_category: 'Cleaning',
    bio: 'Eco-certified sanitation lead specializing in medical-grade deep cleaning, hypoallergenic sanitization, and moving prep.',
    hourly_rate: 40.0,
    experience_years: 4,
    verification_status: 'verified',
    is_available: true,
    rating: 4.97,
    total_jobs: 210,
    service_areas: ['Metro Hub', 'Greenfield', 'South Bay'],
  },
  {
    id: 'wrk-7',
    user_id: 'usr-w7',
    full_name: 'Mateo Silva',
    email: 'mateo.silva@worker.fusion.app',
    trade_category: 'Gardening',
    bio: 'Landscape horticulturist and master arborist with organic garden soil enrichment and automated drip irrigation expertise.',
    hourly_rate: 38.0,
    experience_years: 6,
    verification_status: 'verified',
    is_available: true,
    rating: 4.93,
    total_jobs: 88,
    service_areas: ['Greenfield', 'Highland Park', 'South Bay'],
  },
  {
    id: 'wrk-8',
    user_id: 'usr-w8',
    full_name: 'Liam Vance',
    email: 'liam.vance@worker.fusion.app',
    trade_category: 'Driving',
    bio: 'Executive chauffeur with defensive driving master certification, spotless safety record, and luxury fleet experience.',
    hourly_rate: 35.0,
    experience_years: 10,
    verification_status: 'verified',
    is_available: true,
    rating: 4.99,
    total_jobs: 340,
    service_areas: ['Downtown', 'Metro Hub', 'Airport Corridor'],
  },
  {
    id: 'wrk-9',
    user_id: 'usr-w9',
    full_name: 'Aiden Brooks',
    email: 'aiden.brooks@worker.fusion.app',
    trade_category: 'Appliance Repair',
    bio: 'Precision electronics tech specializing in smart refrigerator logic boards, washing machine inverter motors, and induction ranges.',
    hourly_rate: 55.0,
    experience_years: 8,
    verification_status: 'verified',
    is_available: true,
    rating: 4.94,
    total_jobs: 165,
    service_areas: ['Central District', 'East Hills', 'North Bay'],
  },
];

export const INITIAL_BOOKINGS: BookingItem[] = [
  {
    id: 'bk-101',
    customer_id: 'usr-cust-1',
    worker_id: 'wrk-1',
    service_id: 'srv-1',
    service_title: '⚡ Electricity / Electrician',
    service_category: 'Electricity',
    status: 'in_progress',
    stage: 'in_progress',
    scheduled_date: new Date().toISOString().split('T')[0],
    scheduled_time: '02:00 PM',
    address: 'Bandra Kurla Complex (BKC), Bandra East, Mumbai, Maharashtra 400051',
    latitude: 19.0657,
    longitude: 72.8687,
    total_price: 55.0,
    notes: 'Main circuit breaker diagnostic and high-voltage circuit safety test.',
    customer_name: 'Alexander Cross',
    worker_name: 'Marcus Vance',
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'bk-102',
    customer_id: 'usr-cust-1',
    worker_id: 'wrk-2',
    service_id: 'srv-2',
    service_title: '❄️ AC Repair & Service',
    service_category: 'AC Repair',
    status: 'confirmed',
    stage: 'confirmed',
    scheduled_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    scheduled_time: '11:00 AM',
    address: 'Linking Road, Bandra West, Mumbai, Maharashtra 400050',
    latitude: 19.0596,
    longitude: 72.8295,
    total_price: 65.0,
    notes: 'Master bedroom inverter unit cooling optimization and filter check.',
    customer_name: 'Alexander Cross',
    worker_name: 'Elena Rostova',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'bk-103',
    customer_id: 'usr-cust-2',
    worker_id: 'wrk-3',
    service_id: 'srv-5',
    service_title: '🔧 Plumbing',
    service_category: 'Plumbing',
    status: 'completed',
    stage: 'completed',
    scheduled_date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    scheduled_time: '09:30 AM',
    address: 'Marine Drive, Nariman Point, Mumbai, Maharashtra 400021',
    latitude: 18.9220,
    longitude: 72.8238,
    total_price: 50.0,
    notes: 'Kitchen water inlet and pressure valve calibration.',
    customer_name: 'Jessica Thorne',
    worker_name: 'Devon Reed',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

// ─── SERVICES CRUD ───────────────────────────────────────────────────────────
export const fetchServices = async (): Promise<ServiceItem[]> => {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('title', { ascending: true });

    // Fall back to seed data if Supabase table is empty or errors
    if (error || !data || data.length === 0) {
      return INITIAL_SERVICES;
    }
    return data as ServiceItem[];
  } catch {
    return INITIAL_SERVICES;
  }
};

export const createService = async (service: Omit<ServiceItem, 'id'>): Promise<ServiceItem> => {
  try {
    const { data, error } = await supabase
      .from('services')
      .insert(service)
      .select()
      .single();

    if (error || !data) {
      const fallback: ServiceItem = { ...service, id: `srv-${Date.now()}` };
      return fallback;
    }
    return data as ServiceItem;
  } catch {
    return { ...service, id: `srv-${Date.now()}` };
  }
};

export const toggleServiceActive = async (id: string, active: boolean): Promise<boolean> => {
  try {
    const { error } = await supabase.from('services').update({ active }).eq('id', id);
    return !error;
  } catch {
    return true;
  }
};

// ─── WORKERS CRUD ────────────────────────────────────────────────────────────
export const fetchWorkers = async (category?: string): Promise<WorkerProfile[]> => {
  try {
    let query = supabase.from('workers').select(`
      *,
      profiles:user_id ( full_name, email, avatar_url )
    `);

    if (category && category !== 'All') {
      query = query.ilike('trade_category', `%${category}%`);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      // Fall back to seed data if Supabase workers table is empty
      if (category && category !== 'All') {
        return INITIAL_WORKERS.filter(w =>
          w.trade_category?.toLowerCase().includes(category.toLowerCase())
        );
      }
      return INITIAL_WORKERS;
    }

    return data.map((item: any) => ({
      ...item,
      full_name: item.profiles?.full_name || 'Verified Specialist',
      email: item.profiles?.email || '',
      avatar_url: item.profiles?.avatar_url || null,
    })) as WorkerProfile[];
  } catch {
    // Fall back to seed data on exception
    if (category && category !== 'All') {
      return INITIAL_WORKERS.filter(w =>
        w.trade_category?.toLowerCase().includes(category.toLowerCase())
      );
    }
    return INITIAL_WORKERS;
  }
};

export const fetchWorkerByUserId = async (userId: string): Promise<WorkerProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('workers')
      .select(`
        *,
        profiles:user_id ( full_name, email, avatar_url )
      `)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return null;
    }
    return {
      ...data,
      full_name: (data as any).profiles?.full_name || 'Verified Specialist',
      email: (data as any).profiles?.email || '',
      avatar_url: (data as any).profiles?.avatar_url || null,
    } as WorkerProfile;
  } catch {
    return null;
  }
};

export const updateWorkerAvailability = async (
  userId: string,
  is_available: boolean
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('workers')
      .update({ is_available, updated_at: new Date().toISOString() })
      .eq('user_id', userId);
    return !error;
  } catch {
    return true;
  }
};

export const verifyWorker = async (
  workerId: string,
  status: VerificationStatus
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('workers')
      .update({ verification_status: status, updated_at: new Date().toISOString() })
      .eq('id', workerId);
    return !error;
  } catch {
    return true;
  }
};

export const updateWorkerSkills = async (
  workerId: string,
  skills: string[]
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('workers')
      .update({ skills, updated_at: new Date().toISOString() })
      .eq('id', workerId);
    if (error) console.error('[marketplaceService] updateWorkerSkills error:', error.message);
    return !error;
  } catch (err: any) {
    console.error('[marketplaceService] updateWorkerSkills catch:', err);
    return false;
  }
};

export const updateWorkerCertificates = async (
  workerId: string,
  certificates: WorkerCertificate[]
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('workers')
      .update({
        certificates,
        certificate_url: certificates[0]?.file_url || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', workerId);
    if (error) console.error('[marketplaceService] updateWorkerCertificates error:', error.message);
    return !error;
  } catch (err: any) {
    console.error('[marketplaceService] updateWorkerCertificates catch:', err);
    return false;
  }
};

export const uploadWorkerDocument = async (
  workerId: string,
  file: File,
  category: 'id_document' | 'certificate'
): Promise<string | null> => {
  try {
    const ext = file.name.split('.').pop() || 'png';
    const filePath = `${workerId}/${category}_${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('worker-documents')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.warn('[marketplaceService] uploadWorkerDocument storage error:', uploadError.message);
      // Create a local data URL fallback if offline/mock
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }

    const { data } = supabase.storage.from('worker-documents').getPublicUrl(filePath);
    return data?.publicUrl || null;
  } catch (err: any) {
    console.error('[marketplaceService] uploadWorkerDocument catch:', err);
    return null;
  }
};

export const submitWorkerVerification = async (
  workerId: string,
  idDocumentUrl: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('workers')
      .update({
        id_document_url: idDocumentUrl,
        verification_status: 'pending',
        updated_at: new Date().toISOString(),
      })
      .eq('id', workerId);
    return !error;
  } catch {
    return false;
  }
};

export const updateWorkerProfile = async (
  workerId: string,
  updates: Partial<WorkerProfile>
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('workers')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', workerId);
    return !error;
  } catch {
    return false;
  }
};

// ─── BOOKINGS CRUD ───────────────────────────────────────────────────────────
export const fetchBookings = async (filter?: {
  customerId?: string;
  workerId?: string;
  tradeCategory?: string;
  status?: string;
}): Promise<BookingItem[]> => {
  try {
    let query = supabase.from('bookings').select('*').order('created_at', { ascending: false });

    if (filter?.customerId) {
      query = query.eq('customer_id', filter.customerId);
    }
    if (filter?.workerId) {
      query = query.eq('worker_id', filter.workerId);
    }
    if (filter?.status && filter.status !== 'all') {
      query = query.eq('status', filter.status);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      return [];
    }

    let list = data as BookingItem[];
    if (filter?.tradeCategory) {
      list = list.filter(b =>
        b.service_category?.toLowerCase().includes(filter.tradeCategory!.toLowerCase())
      );
    }

    return list;
  } catch {
    return [];
  }
};

export const createBooking = async (
  booking: Omit<BookingItem, 'id' | 'created_at' | 'stage' | 'status'>
): Promise<BookingItem> => {
  const newBooking: BookingItem = {
    ...booking,
    id: `bk-${Date.now()}`,
    status: 'pending',
    stage: 'requested',
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        customer_id: booking.customer_id,
        worker_id: booking.worker_id ?? null,
        service_id: booking.service_id,
        service_title: booking.service_title,
        service_category: booking.service_category,
        scheduled_date: booking.scheduled_date,
        scheduled_time: booking.scheduled_time,
        address: booking.address,
        latitude: booking.latitude ?? null,
        longitude: booking.longitude ?? null,
        total_price: booking.total_price,
        notes: booking.notes,
        customer_name: booking.customer_name,
        worker_name: booking.worker_name,
        status: 'pending',
        stage: 'requested',
      })
      .select()
      .single();

    if (error || !data) {
      console.warn('[MarketplaceService] Insert booking warning:', error?.message);
      return newBooking;
    }

    const createdBooking = data as BookingItem;

    // Automatically create Escrow Payment record in Supabase
    try {
      const platformFee = Math.round(booking.total_price * 0.1 * 100) / 100;
      const workerPayout = Math.round((booking.total_price - platformFee) * 100) / 100;

      await supabase.from('payments').insert({
        booking_id: createdBooking.id,
        customer_id: booking.customer_id,
        worker_id: booking.worker_id ?? null,
        service_title: booking.service_title,
        amount: booking.total_price,
        platform_fee: platformFee,
        worker_payout: workerPayout,
        status: 'pending',
        payment_method: 'Cooperative Escrow Wallet',
      });
    } catch {
      // Non-fatal if payments table schema is in setup
    }

    return createdBooking;
  } catch (err) {
    console.error('[MarketplaceService] Failed to create booking:', err);
    return newBooking;
  }
};

export const updateBookingStatus = async (
  bookingId: string,
  status: BookingStatus,
  stage?: BookingStage
): Promise<boolean> => {
  try {
    const updatePayload: Record<string, any> = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (stage) updatePayload.stage = stage;

    const { error } = await supabase.from('bookings').update(updatePayload).eq('id', bookingId);
    
    // If completed, release payment in Supabase payments table
    if (status === 'completed' || stage === 'completed') {
      try {
        await supabase
          .from('payments')
          .update({ status: 'paid' })
          .eq('booking_id', bookingId);
      } catch {
        // Ignored
      }
    }

    return !error;
  } catch {
    return true;
  }
};

export const updateBookingStage = async (
  bookingId: string,
  stage: BookingStage
): Promise<boolean> => {
  let status: BookingStatus = 'in_progress';
  if (stage === 'completed') status = 'completed';
  if (stage === 'confirmed') status = 'confirmed';
  if (stage === 'requested') status = 'pending';

  return updateBookingStatus(bookingId, status, stage);
};

export const acceptBookingByWorker = async (
  bookingId: string,
  workerId: string,
  workerName: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('bookings')
      .update({
        worker_id: workerId,
        worker_name: workerName,
        status: 'confirmed',
        stage: 'confirmed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId);
    return !error;
  } catch {
    return true;
  }
};

export const declineBookingByWorker = async (
  bookingId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('bookings')
      .update({
        worker_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId);
    return !error;
  } catch {
    return true;
  }
};

export const subscribeToBookings = (
  callback: (payload: any) => void
) => {
  try {
    const channel = supabase
      .channel('bookings_realtime_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        payload => {
          callback(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch {
    return () => {};
  }
};
