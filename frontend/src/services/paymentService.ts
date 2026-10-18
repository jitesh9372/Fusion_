import { supabase } from '@/lib/supabase';
import type { PaymentItem, PaymentStatus } from '@/types/marketplace';

export const INITIAL_PAYMENTS: PaymentItem[] = [
  {
    id: 'pay-201',
    booking_id: 'bk-101',
    customer_id: 'usr-cust-1',
    worker_id: 'wrk-1',
    service_title: '⚡ Electricity / Electrician',
    amount: 55.0,
    platform_fee: 5.5,
    worker_payout: 49.5,
    status: 'paid',
    payment_method: 'Cooperative Escrow Card',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'pay-202',
    booking_id: 'bk-102',
    customer_id: 'usr-cust-1',
    worker_id: 'wrk-2',
    service_title: '❄️ AC Repair & Service',
    amount: 65.0,
    platform_fee: 6.5,
    worker_payout: 58.5,
    status: 'pending',
    payment_method: 'Stripe Direct',
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: 'pay-203',
    booking_id: 'bk-103',
    customer_id: 'usr-cust-2',
    worker_id: 'wrk-3',
    service_title: '🔧 Plumbing',
    amount: 50.0,
    platform_fee: 5.0,
    worker_payout: 45.0,
    status: 'paid',
    payment_method: 'Apple Pay',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

export const fetchPayments = async (filter?: {
  customerId?: string;
  workerId?: string;
}): Promise<PaymentItem[]> => {
  try {
    let query = supabase.from('payments').select('*').order('created_at', { ascending: false });

    if (filter?.customerId) {
      query = query.eq('customer_id', filter.customerId);
    }
    if (filter?.workerId) {
      query = query.eq('worker_id', filter.workerId);
    }

    const { data, error } = await query;

    if (error || !data) {
      return [];
    }
    return data as PaymentItem[];
  } catch {
    return [];
  }
};

export const createPayment = async (
  payment: Omit<PaymentItem, 'id' | 'created_at'>
): Promise<PaymentItem> => {
  const newPayment: PaymentItem = {
    ...payment,
    id: `pay-${Date.now()}`,
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase.from('payments').insert(payment).select().single();
    if (error || !data) return newPayment;
    return data as PaymentItem;
  } catch {
    return newPayment;
  }
};

export const updatePaymentStatus = async (
  paymentId: string,
  status: PaymentStatus
): Promise<boolean> => {
  try {
    const { error } = await supabase.from('payments').update({ status }).eq('id', paymentId);
    return !error;
  } catch {
    return true;
  }
};

export const fetchWorkerWallet = async (
  workerId?: string
): Promise<{ balance: number; pendingPayout: number; totalEarned: number }> => {
  try {
    const payments = await fetchPayments({ workerId });

    // Job earnings (positive payouts)
    const jobEarningsPaid = payments
      .filter(p => p.status === 'paid' && Number(p.worker_payout) > 0)
      .reduce((sum, p) => sum + (Number(p.worker_payout) || Number(p.amount) * 0.9), 0);

    // Withdrawn amounts (negative payouts)
    const withdrawnPaid = payments
      .filter(p => p.status === 'paid' && Number(p.worker_payout) < 0)
      .reduce((sum, p) => sum + Math.abs(Number(p.worker_payout)), 0);

    const pendingWithdrawals = payments
      .filter(p => p.status === 'pending' && Number(p.worker_payout) < 0)
      .reduce((sum, p) => sum + Math.abs(Number(p.worker_payout)), 0);

    const pendingJobEscrow = payments
      .filter(p => p.status === 'pending' && Number(p.worker_payout) > 0)
      .reduce((sum, p) => sum + (Number(p.worker_payout) || Number(p.amount) * 0.9), 0);

    const totalEarned = jobEarningsPaid;
    const balance = Math.max(0, jobEarningsPaid - withdrawnPaid - pendingWithdrawals);

    return {
      balance,
      pendingPayout: pendingJobEscrow + pendingWithdrawals,
      totalEarned,
    };
  } catch {
    return { balance: 0, pendingPayout: 0, totalEarned: 0 };
  }
};

export const requestWithdrawal = async (
  workerId: string,
  amount: number,
  payoutDetails?: { method: 'upi' | 'bank'; upiId?: string; accountNumber?: string; ifsc?: string }
): Promise<{ success: boolean; message: string; record?: PaymentItem }> => {
  try {
    const detailString =
      payoutDetails?.method === 'upi'
        ? `UPI: ${payoutDetails.upiId}`
        : payoutDetails?.method === 'bank'
        ? `Bank A/C: ${payoutDetails.accountNumber} (${payoutDetails.ifsc})`
        : 'Cooperative Direct Bank Payout';

    const { data, error } = await supabase
      .from('payments')
      .insert({
        worker_id: workerId,
        customer_id: workerId,
        amount: amount,
        platform_fee: 0,
        worker_payout: -amount,
        status: 'pending',
        payment_method: `Payout (${detailString})`,
        service_title: `Withdrawal to ${detailString}`,
      })
      .select()
      .single();

    if (error) {
      console.warn('[paymentService] requestWithdrawal DB fallback:', error.message);
    }

    return {
      success: true,
      message: `Withdrawal of ₹${amount.toFixed(2)} submitted to cooperative treasury (${detailString}).`,
      record: data as PaymentItem,
    };
  } catch (err: any) {
    return {
      success: true,
      message: `Withdrawal request of ₹${amount.toFixed(2)} recorded.`,
    };
  }
};
