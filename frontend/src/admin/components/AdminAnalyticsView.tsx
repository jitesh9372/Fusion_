import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  BarChart3, TrendingUp, IndianRupee, Users, Calendar,
  ShieldCheck, AlertCircle, RefreshCw, ArrowUp, ArrowDown,
  Star, Package, Clock, CheckCircle2, Wrench,
} from 'lucide-react';

interface DailyRevenue {
  date: string;
  revenue: number;
  bookings: number;
}

interface CategoryStat {
  category: string;
  bookings: number;
  revenue: number;
  workers: number;
}

interface AnalyticsState {
  totalCustomers: number;
  totalWorkers: number;
  verifiedWorkers: number;
  pendingVerifications: number;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  activeBookings: number;
  platformRevenue: number;
  escrowBalance: number;
  openDisputes: number;
  avgRating: number;
  topCategories: CategoryStat[];
  dailyRevenue: DailyRevenue[];
  recentGrowth: number;
}

const emptyState: AnalyticsState = {
  totalCustomers: 0,
  totalWorkers: 0,
  verifiedWorkers: 0,
  pendingVerifications: 0,
  totalBookings: 0,
  completedBookings: 0,
  cancelledBookings: 0,
  activeBookings: 0,
  platformRevenue: 0,
  escrowBalance: 0,
  openDisputes: 0,
  avgRating: 0,
  topCategories: [],
  dailyRevenue: [],
  recentGrowth: 0,
};

export const AdminAnalyticsView: React.FC = () => {
  const [data, setData] = useState<AnalyticsState>(emptyState);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const periodDays = period === '7d' ? 7 : period === '30d' ? 30 : 90;
      const since = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000).toISOString();

      const [
        { count: custCount },
        { count: workerCount },
        { count: verifiedCount },
        { count: pendingCount },
        { count: totalBkg },
        { count: completedBkg },
        { count: cancelledBkg },
        { count: activeBkg },
        { count: openDisp },
        { data: payments },
        { data: bookings },
        { data: reviews },
        { data: workers },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
        supabase.from('workers').select('*', { count: 'exact', head: true }),
        supabase.from('workers').select('*', { count: 'exact', head: true }).eq('verification_status', 'verified'),
        supabase.from('workers').select('*', { count: 'exact', head: true }).eq('verification_status', 'pending'),
        supabase.from('bookings').select('*', { count: 'exact', head: true }),
        supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'cancelled'),
        supabase.from('bookings').select('*', { count: 'exact', head: true }).in('status', ['confirmed', 'in_progress', 'pending']),
        supabase.from('disputes').select('*', { count: 'exact', head: true }).in('status', ['open', 'under_review']),
        supabase.from('payments').select('amount, status, created_at').gte('created_at', since),
        supabase.from('bookings').select('service_category, total_price, status, created_at, worker_id').gte('created_at', since),
        supabase.from('reviews').select('rating'),
        supabase.from('workers').select('trade_category'),
      ]);

      const paidPayments = (payments || []).filter(p => p.status === 'paid');
      const platformRevenue = paidPayments.reduce((s, p) => s + Number(p.amount), 0);

      // Category breakdown
      const catMap: Record<string, CategoryStat> = {};
      (bookings || []).forEach(b => {
        const cat = b.service_category || 'Other';
        if (!catMap[cat]) catMap[cat] = { category: cat, bookings: 0, revenue: 0, workers: 0 };
        catMap[cat].bookings += 1;
        catMap[cat].revenue += Number(b.total_price) || 0;
      });
      (workers || []).forEach(w => {
        const cat = w.trade_category || 'Other';
        if (catMap[cat]) catMap[cat].workers += 1;
      });
      const topCategories = Object.values(catMap)
        .sort((a, b) => b.bookings - a.bookings)
        .slice(0, 6);

      // Daily revenue (last periodDays days)
      const dailyMap: Record<string, { revenue: number; bookings: number }> = {};
      for (let i = 0; i < Math.min(periodDays, 14); i++) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const key = d.toISOString().split('T')[0];
        dailyMap[key] = { revenue: 0, bookings: 0 };
      }
      (bookings || []).forEach(b => {
        const key = b.created_at?.split('T')[0];
        if (key && dailyMap[key]) {
          dailyMap[key].revenue += Number(b.total_price) || 0;
          dailyMap[key].bookings += 1;
        }
      });
      const dailyRevenue = Object.entries(dailyMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, v]) => ({ date, ...v }));

      // Review avg rating
      const ratingArr = (reviews || []).map(r => r.rating).filter(Boolean);
      const avgRating = ratingArr.length > 0 ? ratingArr.reduce((s, r) => s + r, 0) / ratingArr.length : 0;

      // Escrow (pending payments)
      const escrowBalance = (payments || [])
        .filter(p => p.status === 'pending')
        .reduce((s, p) => s + Number(p.amount), 0);

      setData({
        totalCustomers: custCount ?? 0,
        totalWorkers: workerCount ?? 0,
        verifiedWorkers: verifiedCount ?? 0,
        pendingVerifications: pendingCount ?? 0,
        totalBookings: totalBkg ?? 0,
        completedBookings: completedBkg ?? 0,
        cancelledBookings: cancelledBkg ?? 0,
        activeBookings: activeBkg ?? 0,
        platformRevenue,
        escrowBalance,
        openDisputes: openDisp ?? 0,
        avgRating,
        topCategories,
        dailyRevenue,
        recentGrowth: 0,
      });
    } catch (err) {
      console.error('[AdminAnalyticsView] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const maxRevenue = Math.max(...data.dailyRevenue.map(d => d.revenue), 1);
  const maxCatBookings = Math.max(...data.topCategories.map(c => c.bookings), 1);

  const kpis = [
    { label: 'Platform Revenue', value: `₹${data.platformRevenue.toLocaleString('en-IN')}`, icon: IndianRupee, color: '#D68C31', trend: 'up' },
    { label: 'Escrow Balance', value: `₹${data.escrowBalance.toLocaleString('en-IN')}`, icon: IndianRupee, color: '#14524C', trend: null },
    { label: 'Total Customers', value: data.totalCustomers, icon: Users, color: '#9C4A34', trend: 'up' },
    { label: 'Verified Workers', value: `${data.verifiedWorkers}/${data.totalWorkers}`, icon: ShieldCheck, color: '#4A6741', trend: null },
    { label: 'Total Bookings', value: data.totalBookings, icon: Calendar, color: '#14524C', trend: 'up' },
    { label: 'Completed Jobs', value: data.completedBookings, icon: CheckCircle2, color: '#4A6741', trend: null },
    { label: 'Open Disputes', value: data.openDisputes, icon: AlertCircle, color: '#9C4A34', trend: data.openDisputes > 0 ? 'down' : null },
    { label: 'Avg Rating', value: data.avgRating > 0 ? data.avgRating.toFixed(1) + ' ★' : '—', icon: Star, color: '#D68C31', trend: null },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#1B2420]">Deep Analytics</h2>
          <p className="text-xs text-[#3A423E]/80 mt-0.5">
            Real-time platform metrics, revenue trends, and service category performance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(['7d', '30d', '90d'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors ${
                period === p
                  ? 'bg-[#9C4A34] text-white border-[#9C4A34]'
                  : 'bg-[#FFFFFF] text-[#3A423E] border-[#D8D3C7] hover:border-[#9C4A34]/40'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={fetchAnalytics}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#EEF1EE] border border-[#D8D3C7] text-[#3A423E] hover:text-[#9C4A34] hover:border-[#9C4A34]/40 text-xs font-bold transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center gap-3 text-[#3A423E]/60">
          <div className="w-10 h-10 border-2 border-[#9C4A34] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Crunching real-time data...</p>
        </div>
      ) : (
        <>
          {/* KPI Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {kpis.map(kpi => (
              <div key={kpi.label} className="rounded-3xl border border-[#D8D3C7] bg-[#FFFFFF] p-4 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: kpi.color + '18' }}>
                    <kpi.icon className="w-5 h-5" style={{ color: kpi.color }} />
                  </div>
                  {kpi.trend && (
                    <span className={`flex items-center gap-0.5 text-[10px] font-bold ${kpi.trend === 'up' ? 'text-[#4A6741]' : 'text-red-500'}`}>
                      {kpi.trend === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    </span>
                  )}
                </div>
                <p className="text-[10px] uppercase font-bold text-[#3A423E]/60 tracking-wider">{kpi.label}</p>
                <p className="text-lg font-black text-[#1B2420]">{kpi.value}</p>
              </div>
            ))}
          </div>

          {/* Daily Revenue Chart */}
          <div className="rounded-3xl border border-[#D8D3C7] bg-[#FFFFFF] shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-black text-[#1B2420] text-base">Revenue Trend</h3>
                <p className="text-xs text-[#3A423E]/60 mt-0.5">Booking revenue over the last {period}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#14524C]" />
                <span className="text-xs text-[#3A423E]/70 font-medium">Revenue (₹)</span>
              </div>
            </div>
            {data.dailyRevenue.length === 0 || data.dailyRevenue.every(d => d.revenue === 0) ? (
              <div className="h-40 flex items-center justify-center text-[#3A423E]/40">
                <div className="text-center">
                  <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-medium">No revenue data for this period</p>
                </div>
              </div>
            ) : (
              <div className="flex items-end gap-1.5 h-40 overflow-x-auto pb-2">
                {data.dailyRevenue.map(d => {
                  const height = maxRevenue > 0 ? Math.max((d.revenue / maxRevenue) * 100, d.revenue > 0 ? 4 : 0) : 0;
                  return (
                    <div key={d.date} className="flex flex-col items-center gap-1 flex-1 min-w-[28px] group">
                      <div className="relative w-full">
                        <div
                          className="w-full rounded-t-xl bg-[#14524C] hover:bg-[#9C4A34] transition-colors cursor-pointer"
                          style={{ height: `${height}%`, minHeight: d.revenue > 0 ? '4px' : '2px', maxHeight: '128px' }}
                          title={`₹${d.revenue.toLocaleString('en-IN')} — ${d.bookings} bookings`}
                        />
                      </div>
                      <span className="text-[8px] text-[#3A423E]/50 font-mono rotate-45 origin-left whitespace-nowrap">
                        {new Date(d.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Two columns: Category breakdown + Booking stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Category Performance */}
            <div className="rounded-3xl border border-[#D8D3C7] bg-[#FFFFFF] shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-black text-[#1B2420] text-base">Service Category Performance</h3>
                  <p className="text-xs text-[#3A423E]/60 mt-0.5">Bookings by service category</p>
                </div>
                <Wrench className="w-5 h-5 text-[#3A423E]/30" />
              </div>
              {data.topCategories.length === 0 ? (
                <div className="h-40 flex items-center justify-center text-[#3A423E]/40 text-sm">
                  No booking data available yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {data.topCategories.map(cat => (
                    <div key={cat.category}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-bold text-[#1B2420]">{cat.category}</span>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-[#3A423E]/60">{cat.bookings} bookings</span>
                          <span className="font-black text-[#14524C]">₹{cat.revenue.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-[#EEF1EE] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#14524C] to-[#4A6741] transition-all duration-500"
                          style={{ width: `${Math.max((cat.bookings / maxCatBookings) * 100, cat.bookings > 0 ? 4 : 0)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Booking Health */}
            <div className="rounded-3xl border border-[#D8D3C7] bg-[#FFFFFF] shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-black text-[#1B2420] text-base">Booking Health</h3>
                  <p className="text-xs text-[#3A423E]/60 mt-0.5">Platform-wide booking status breakdown</p>
                </div>
                <Calendar className="w-5 h-5 text-[#3A423E]/30" />
              </div>

              {/* Donut-like breakdown */}
              <div className="space-y-3">
                {[
                  { label: 'Completed', value: data.completedBookings, total: data.totalBookings, color: 'bg-[#4A6741]', textColor: 'text-[#4A6741]' },
                  { label: 'Active / In Progress', value: data.activeBookings, total: data.totalBookings, color: 'bg-[#14524C]', textColor: 'text-[#14524C]' },
                  { label: 'Cancelled', value: data.cancelledBookings, total: data.totalBookings, color: 'bg-red-400', textColor: 'text-red-500' },
                ].map(item => {
                  const pct = data.totalBookings > 0 ? Math.round((item.value / data.totalBookings) * 100) : 0;
                  return (
                    <div key={item.label} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-[#3A423E]">{item.label}</span>
                        <span className={`font-black ${item.textColor}`}>{item.value} ({pct}%)</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-[#EEF1EE] overflow-hidden">
                        <div
                          className={`h-full rounded-full ${item.color} transition-all duration-700`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 pt-4 border-t border-[#D8D3C7] grid grid-cols-3 gap-3 text-center">
                {[
                  { label: 'Total', value: data.totalBookings, color: 'text-[#1B2420]' },
                  { label: 'Completion Rate', value: data.totalBookings > 0 ? Math.round((data.completedBookings / data.totalBookings) * 100) + '%' : '—', color: 'text-[#4A6741]' },
                  { label: 'Disputes', value: data.openDisputes, color: data.openDisputes > 0 ? 'text-red-500' : 'text-[#4A6741]' },
                ].map(s => (
                  <div key={s.label}>
                    <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                    <p className="text-[10px] uppercase text-[#3A423E]/50 font-bold tracking-wide mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Worker Verification Progress */}
          <div className="rounded-3xl border border-[#D8D3C7] bg-[#FFFFFF] shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-black text-[#1B2420] text-base">Workforce Verification Status</h3>
                <p className="text-xs text-[#3A423E]/60 mt-0.5">
                  {data.verifiedWorkers} of {data.totalWorkers} artisans are fully verified
                </p>
              </div>
              <ShieldCheck className="w-5 h-5 text-[#4A6741]" />
            </div>
            <div className="h-3 rounded-full bg-[#EEF1EE] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#4A6741] to-[#14524C] transition-all duration-700"
                style={{ width: data.totalWorkers > 0 ? `${(data.verifiedWorkers / data.totalWorkers) * 100}%` : '0%' }}
              />
            </div>
            <div className="mt-3 flex justify-between text-xs text-[#3A423E]/60">
              <span>0</span>
              <span className="font-black text-[#4A6741]">
                {data.totalWorkers > 0 ? Math.round((data.verifiedWorkers / data.totalWorkers) * 100) : 0}% verified
              </span>
              <span>{data.totalWorkers}</span>
            </div>
            {data.pendingVerifications > 0 && (
              <div className="mt-3 flex items-center gap-2 text-xs text-[#9A621C] bg-[#D68C31]/10 border border-[#D68C31]/30 rounded-xl px-3 py-2">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span className="font-semibold">{data.pendingVerifications} artisan{data.pendingVerifications > 1 ? 's' : ''} pending verification review.</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminAnalyticsView;
