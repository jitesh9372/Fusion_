import { supabase } from '@/lib/supabase';
import type { WelfareClaim, TrainingCourse, NotificationItem } from '@/types/marketplace';

export const INITIAL_WELFARE_CLAIMS: WelfareClaim[] = [
  {
    id: 'wlf-1',
    worker_id: 'wrk-1',
    worker_name: 'Marcus Vance',
    claim_type: 'Equipment Upgrade Subsidy',
    amount_requested: 350.0,
    status: 'approved',
    description: 'Thermal imaging multimeter grant for electrical diagnostics safety.',
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'wlf-2',
    worker_id: 'wrk-1',
    worker_name: 'Marcus Vance',
    claim_type: 'Healthcare & Eye Protection Mutual Aid',
    amount_requested: 200.0,
    status: 'pending',
    description: 'Prescription ballistic safety goggles and annual occupational health checkup.',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

export const INITIAL_TRAINING_COURSES: TrainingCourse[] = [
  {
    id: 'trn-1',
    title: 'High-Voltage Safety & Modern Circuitry',
    category: 'Electricity',
    duration_hours: 6,
    modules_count: 8,
    description: 'Advanced safety protocols, AFCI/GFCI troubleshooting, and residential smart micro-grid interfacing.',
    instructor: 'Master Electrician Guild',
    badge_reward: 'Master Electrician Safety Badge',
    progress_percent: 75,
    completed: false,
  },
  {
    id: 'trn-2',
    title: 'Eco-Friendly Refrigerants & HVAC Optimization',
    category: 'AC Repair',
    duration_hours: 5,
    modules_count: 7,
    description: 'R-32 & R-454B low-GWP refrigerant handling, digital manifold diagnostics, and inverted heat pump repair.',
    instructor: 'Clean Energy HVAC Institute',
    badge_reward: 'Certified HVAC Specialist',
    progress_percent: 100,
    completed: true,
  },
  {
    id: 'trn-3',
    title: 'Precision Hydro-Piping & Acoustic Leak Detection',
    category: 'Plumbing',
    duration_hours: 4,
    modules_count: 6,
    description: 'Non-invasive acoustic pipe inspection, electrofusion welding, and commercial backflow prevention.',
    instructor: 'Alliance of Skilled Plumbers',
    badge_reward: 'Certified Master Plumber',
    progress_percent: 30,
    completed: false,
  },
  {
    id: 'trn-4',
    title: 'Architectural Finish Carpentry & Hardware Fitment',
    category: 'Carpentry',
    duration_hours: 8,
    modules_count: 10,
    description: 'Concealed hinge geometry, custom crown molding joints, and high-security multi-point lock installation.',
    instructor: 'Woodcraft Cooperative Masters',
    badge_reward: 'Craftsman Finish Master',
    progress_percent: 0,
    completed: false,
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    user_id: 'current-user',
    title: 'Service En Route',
    message: 'Worker Marcus Vance is on the way to 742 Evergreen Terrace (ETA: 15 mins).',
    type: 'booking',
    is_read: false,
    created_at: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'notif-2',
    user_id: 'current-user',
    title: 'Payment Received',
    message: 'Invoice #pay-201 of ₹55.00 has been verified in cooperative escrow.',
    type: 'payment',
    is_read: true,
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'notif-3',
    user_id: 'current-user',
    title: 'Cooperative Benefit Active',
    message: 'Your worker mutual aid coverage is currently in good standing.',
    type: 'success',
    is_read: true,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

// ─── WELFARE ─────────────────────────────────────────────────────────────────
export const fetchWelfareClaims = async (workerId?: string): Promise<WelfareClaim[]> => {
  try {
    let query = supabase.from('worker_welfare').select('*').order('created_at', { ascending: false });
    if (workerId) query = query.eq('worker_id', workerId);

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      return [];
    }
    return data as WelfareClaim[];
  } catch {
    return [];
  }
};

export const submitWelfareClaim = async (
  claim: Omit<WelfareClaim, 'id' | 'created_at' | 'status'>
): Promise<WelfareClaim> => {
  const newClaim: WelfareClaim = {
    ...claim,
    id: `wlf-${Date.now()}`,
    status: 'pending',
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase.from('worker_welfare').insert(newClaim).select().single();
    if (error || !data) return newClaim;
    return data as WelfareClaim;
  } catch {
    return newClaim;
  }
};

export const updateWelfareClaimStatus = async (
  claimId: string,
  status: 'approved' | 'rejected' | 'disbursed'
): Promise<boolean> => {
  try {
    const { error } = await supabase.from('worker_welfare').update({ status }).eq('id', claimId);
    return !error;
  } catch {
    return true;
  }
};

// ─── TRAINING ────────────────────────────────────────────────────────────────
export const fetchTrainingCourses = async (): Promise<TrainingCourse[]> => {
  try {
    const { data, error } = await supabase.from('training_courses').select('*');
    if (error || !data || data.length === 0) {
      return [];
    }
    return data.map((c: any) => ({
      ...c,
      progress_percent: c.progress_percent ?? 0,
      completed: c.completed ?? false,
    }));
  } catch {
    return [];
  }
};

// ─── NOTIFICATIONS ───────────────────────────────────────────────────────────
export const fetchNotifications = async (userId?: string): Promise<NotificationItem[]> => {
  try {
    if (!userId) return [];
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return [];
    }
    return data as NotificationItem[];
  } catch {
    return [];
  }
};

export const markNotificationAsRead = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    return !error;
  } catch {
    return true;
  }
};
