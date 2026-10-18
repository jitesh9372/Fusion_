import { supabase } from '@/lib/supabase';
import type { ReviewItem, DisputeItem, DisputeStatus } from '@/types/marketplace';

export const INITIAL_REVIEWS: ReviewItem[] = [
  {
    id: 'rev-1',
    booking_id: 'bk-103',
    customer_id: 'usr-cust-2',
    worker_id: 'wrk-3',
    customer_name: 'Jessica Thorne',
    rating: 5,
    comment: 'Devon was punctual, extremely knowledgeable, and replaced our kitchen drain assembly cleanly. Highly recommended!',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'rev-2',
    booking_id: 'bk-100',
    customer_id: 'usr-cust-3',
    worker_id: 'wrk-1',
    customer_name: 'David Keller',
    rating: 5,
    comment: 'Marcus identified an overloaded breaker circuit within 15 minutes. Upgraded our panel safely and clearly explained the issue.',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'rev-3',
    booking_id: 'bk-99',
    customer_id: 'usr-cust-4',
    worker_id: 'wrk-2',
    customer_name: 'Mira Sorvino',
    rating: 4,
    comment: 'Great AC cleaning service. Thorough work on both the condenser and air handler. Room cooled down immediately.',
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
];

export const INITIAL_DISPUTES: DisputeItem[] = [
  {
    id: 'dsp-1',
    booking_id: 'bk-101',
    raised_by: 'usr-cust-1',
    raised_by_name: 'Alexander Cross',
    reason: 'Clarification requested on extra copper conduit material fee billed on receipt.',
    status: 'under_review',
    resolution_notes: 'Admin reviewing worker material purchase receipt against platform guidelines.',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
];

// ─── EVIDENCE UPLOAD (SUPABASE STORAGE) ──────────────────────────────────────
export const uploadDisputeEvidence = async (files: File[]): Promise<string[]> => {
  const uploadedUrls: string[] = [];

  for (const file of files) {
    try {
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `evidence_${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${cleanFileName}`;

      const { error: uploadError } = await supabase.storage
        .from('dispute-evidence')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Failed to upload file to dispute-evidence:', uploadError);
        continue;
      }

      const { data } = supabase.storage
        .from('dispute-evidence')
        .getPublicUrl(filePath);

      if (data?.publicUrl) {
        uploadedUrls.push(data.publicUrl);
      }
    } catch (err) {
      console.error('Unexpected error during file upload:', err);
    }
  }

  return uploadedUrls;
};

// ─── REVIEWS ─────────────────────────────────────────────────────────────────
export interface ReviewFilterOptions {
  workerId?: string;
  customerId?: string;
  bookingId?: string;
}

export const fetchReviews = async (
  filter?: string | ReviewFilterOptions
): Promise<ReviewItem[]> => {
  try {
    let query = supabase.from('reviews').select('*').order('created_at', { ascending: false });

    if (typeof filter === 'string') {
      // Legacy support: if filter is string, could be workerId or customerId
      query = query.or(`worker_id.eq.${filter},customer_id.eq.${filter}`);
    } else if (filter && typeof filter === 'object') {
      if (filter.workerId) query = query.eq('worker_id', filter.workerId);
      if (filter.customerId) query = query.eq('customer_id', filter.customerId);
      if (filter.bookingId) query = query.eq('booking_id', filter.bookingId);
    }

    const { data, error } = await query;
    if (error) {
      console.warn('Error fetching reviews from Supabase:', error.message);
      return [];
    }
    if (!data || data.length === 0) {
      return [];
    }
    return data as ReviewItem[];
  } catch {
    return [];
  }
};

export const submitReview = async (
  review: Omit<ReviewItem, 'id' | 'created_at'>
): Promise<ReviewItem> => {
  const newRev: ReviewItem = {
    ...review,
    id: `rev-${Date.now()}`,
    created_at: new Date().toISOString(),
  };

  try {
    const payload = {
      booking_id: review.booking_id,
      customer_id: review.customer_id,
      worker_id: review.worker_id,
      customer_name: review.customer_name,
      rating: review.rating,
      comment: review.comment,
    };

    const { data, error } = await supabase.from('reviews').insert(payload).select().single();
    if (error || !data) {
      console.error('Supabase review insert error:', error);
      return newRev;
    }
    return data as ReviewItem;
  } catch (err) {
    console.error('Review submit exception:', err);
    return newRev;
  }
};

export const subscribeToReviews = (callback: (payload: any) => void) => {
  return supabase
    .channel('reviews-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'reviews' },
      payload => callback(payload)
    )
    .subscribe();
};

// ─── DISPUTES ────────────────────────────────────────────────────────────────
export interface DisputeFilterOptions {
  raisedBy?: string;
  bookingId?: string;
}

export const fetchDisputes = async (
  filter?: string | DisputeFilterOptions
): Promise<DisputeItem[]> => {
  try {
    let query = supabase.from('disputes').select('*').order('created_at', { ascending: false });

    if (typeof filter === 'string') {
      query = query.eq('raised_by', filter);
    } else if (filter && typeof filter === 'object') {
      if (filter.raisedBy) query = query.eq('raised_by', filter.raisedBy);
      if (filter.bookingId) query = query.eq('booking_id', filter.bookingId);
    }

    const { data, error } = await query;
    if (error) {
      console.warn('Error fetching disputes from Supabase:', error.message);
      return [];
    }
    if (!data || data.length === 0) {
      return [];
    }
    return data as DisputeItem[];
  } catch {
    return [];
  }
};

export const createDispute = async (
  dispute: Omit<DisputeItem, 'id' | 'created_at' | 'status' | 'resolution_notes' | 'updated_at'>
): Promise<DisputeItem> => {
  const newDsp: DisputeItem = {
    ...dispute,
    id: `dsp-${Date.now()}`,
    evidence_urls: dispute.evidence_urls || [],
    status: 'open',
    resolution_notes: 'Under initial arbitration by FUSION Cooperative governance.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    const payload = {
      booking_id: dispute.booking_id,
      raised_by: dispute.raised_by,
      raised_by_name: dispute.raised_by_name,
      reason: dispute.reason,
      description: dispute.description || '',
      evidence_urls: dispute.evidence_urls || [],
      status: 'open',
      resolution_notes: 'Under initial arbitration by FUSION Cooperative governance.',
    };

    const { data, error } = await supabase.from('disputes').insert(payload).select().single();
    if (error || !data) {
      console.error('Supabase dispute insert error:', error);
      return newDsp;
    }
    return data as DisputeItem;
  } catch (err) {
    console.error('Dispute create exception:', err);
    return newDsp;
  }
};

export const subscribeToDisputes = (callback: (payload: any) => void) => {
  return supabase
    .channel('disputes-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'disputes' },
      payload => callback(payload)
    )
    .subscribe();
};

export const resolveDispute = async (
  disputeId: string,
  resolutionNotes: string,
  status: DisputeStatus = 'resolved'
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('disputes')
      .update({
        status,
        resolution_notes: resolutionNotes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', disputeId);
    return !error;
  } catch {
    return true;
  }
};
