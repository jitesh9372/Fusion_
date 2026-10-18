import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Search, Users, Calendar, IndianRupee, Mail, Phone,
  TrendingUp, Eye, RefreshCw, ArrowUpDown,
} from 'lucide-react';
import type { CustomerProfile } from '@/types/marketplace';

interface CustomerWithStats extends CustomerProfile {
  total_bookings: number;
  total_spent: number;
  last_booking_date?: string;
  active_bookings?: number;
}

export const AdminCustomersView: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<'full_name' | 'total_bookings' | 'total_spent' | 'created_at'>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [customerBookings, setCustomerBookings] = useState<Record<string, any[]>>({});

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'customer')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const { data: bookings } = await supabase
        .from('bookings')
        .select('customer_id, status, total_price, created_at');

      const { data: payments } = await supabase
        .from('payments')
        .select('customer_id, amount, status');

      const bookingMap: Record<string, any[]> = {};
      (bookings || []).forEach(b => {
        if (!bookingMap[b.customer_id]) bookingMap[b.customer_id] = [];
        bookingMap[b.customer_id].push(b);
      });

      const spentMap: Record<string, number> = {};
      (payments || [])
        .filter(p => p.status === 'paid')
        .forEach(p => {
          spentMap[p.customer_id] = (spentMap[p.customer_id] || 0) + Number(p.amount);
        });

      const enriched: CustomerWithStats[] = (profiles || []).map(p => {
        const cBookings = bookingMap[p.id] || [];
        const sortedBookings = [...cBookings].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        return {
          ...p,
          total_bookings: cBookings.length,
          total_spent: spentMap[p.id] || 0,
          last_booking_date: sortedBookings[0]?.created_at,
          active_bookings: cBookings.filter(b =>
            ['confirmed', 'in_progress', 'pending'].includes(b.status)
          ).length,
        };
      });

      setCustomers(enriched);
    } catch (err) {
      console.error('[AdminCustomersView] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerBookings = async (customerId: string) => {
    if (customerBookings[customerId]) return;
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })
      .limit(5);
    setCustomerBookings(prev => ({ ...prev, [customerId]: data || [] }));
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filtered = customers
    .filter(c => {
      const q = search.toLowerCase();
      return (
        (c.full_name || '').toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.phone || '').toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortField === 'full_name') return dir * ((a.full_name || '').localeCompare(b.full_name || ''));
      if (sortField === 'total_bookings') return dir * (a.total_bookings - b.total_bookings);
      if (sortField === 'total_spent') return dir * (a.total_spent - b.total_spent);
      return dir * (new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    });

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('desc'); }
  };

  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      fetchCustomerBookings(id);
    }
  };

  const totalRevenue = customers.reduce((s, c) => s + c.total_spent, 0);
  const totalBookings = customers.reduce((s, c) => s + c.total_bookings, 0);
  const activeCustomers = customers.filter(c => c.total_bookings > 0).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#1B2420]">Customer Directory</h2>
          <p className="text-xs text-[#3A423E]/80 mt-0.5">
            All registered customers with booking history and spend analytics.
          </p>
        </div>
        <button
          onClick={fetchCustomers}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#9C4A34] text-white font-bold text-xs hover:bg-[#843D2C] transition-colors shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Customers', value: customers.length, Icon: Users, color: 'text-[#9C4A34]', bg: 'bg-[#9C4A34]/10' },
          { label: 'Active Customers', value: activeCustomers, Icon: TrendingUp, color: 'text-[#4A6741]', bg: 'bg-[#4A6741]/10' },
          { label: 'Total Bookings', value: totalBookings, Icon: Calendar, color: 'text-[#14524C]', bg: 'bg-[#14524C]/10' },
          { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, Icon: IndianRupee, color: 'text-[#D68C31]', bg: 'bg-[#D68C31]/10' },
        ].map(card => (
          <div key={card.label} className="rounded-3xl border border-[#D8D3C7] bg-[#FFFFFF] p-4 space-y-2 shadow-sm">
            <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center`}>
              <card.Icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <p className="text-[10px] uppercase font-bold text-[#3A423E]/60 tracking-wider">{card.label}</p>
            <p className={`text-xl font-black ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3A423E]/40" />
        <input
          type="text"
          placeholder="Search by name, email or phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[#FFFFFF] border border-[#D8D3C7] rounded-2xl text-[#1B2420] text-xs placeholder-[#3A423E]/50 focus:outline-none focus:ring-1 focus:ring-[#9C4A34] shadow-sm"
        />
      </div>

      <div className="rounded-3xl border border-[#D8D3C7] bg-[#FFFFFF] shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center gap-3 text-[#3A423E]/60">
            <div className="w-8 h-8 border-2 border-[#9C4A34] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium">Loading customer data...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="w-12 h-12 text-[#3A423E]/20 mx-auto mb-3" />
            <p className="text-sm font-bold text-[#3A423E]/60">
              {search ? 'No customers match your search.' : 'No customers registered yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#EEF1EE] text-[#3A423E]/80 uppercase font-bold text-[10px] tracking-wider border-b border-[#D8D3C7]">
                <tr>
                  <th className="py-4 px-5">
                    <button onClick={() => toggleSort('full_name')} className="flex items-center gap-1 hover:text-[#9C4A34] transition-colors">
                      Customer <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-4 px-5">Contact</th>
                  <th className="py-4 px-5">
                    <button onClick={() => toggleSort('total_bookings')} className="flex items-center gap-1 hover:text-[#9C4A34] transition-colors">
                      Bookings <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-4 px-5">
                    <button onClick={() => toggleSort('total_spent')} className="flex items-center gap-1 hover:text-[#9C4A34] transition-colors">
                      Total Spent <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-4 px-5">
                    <button onClick={() => toggleSort('created_at')} className="flex items-center gap-1 hover:text-[#9C4A34] transition-colors">
                      Joined <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-4 px-5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8D3C7] text-[#1B2420]">
                {filtered.map(c => (
                  <React.Fragment key={c.id}>
                    <tr className="hover:bg-[#F4F6F4] transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#9C4A34] flex items-center justify-center font-bold text-white text-sm shadow-sm shrink-0">
                            {(c.full_name || c.email).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-[#1B2420] text-sm">
                              {c.full_name || <span className="text-[#3A423E]/40 italic">No name</span>}
                            </p>
                            <span className="text-[10px] text-[#3A423E]/50 font-mono">#{c.id.slice(-6)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-[#3A423E]">
                            <Mail className="w-3 h-3 shrink-0" />
                            <span className="truncate max-w-[160px]">{c.email}</span>
                          </div>
                          {c.phone && (
                            <div className="flex items-center gap-1.5 text-[#3A423E]/70">
                              <Phone className="w-3 h-3 shrink-0" />
                              <span>{c.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-[#1B2420] text-sm">{c.total_bookings}</span>
                          {(c.active_bookings || 0) > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full bg-[#4A6741]/10 text-[#4A6741] text-[9px] font-bold border border-[#4A6741]/20">
                              {c.active_bookings} active
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-5 font-black text-[#1B2420]">
                        ₹{c.total_spent.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                      </td>
                      <td className="py-3.5 px-5 text-[#3A423E]/70">
                        {new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={() => toggleExpand(c.id)}
                          className="flex items-center gap-1.5 ml-auto px-3 py-1.5 rounded-xl bg-[#EEF1EE] hover:bg-[#9C4A34]/10 text-[#3A423E] hover:text-[#9C4A34] border border-[#D8D3C7] text-xs font-semibold transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          {expandedId === c.id ? 'Close' : 'View'}
                        </button>
                      </td>
                    </tr>

                    {expandedId === c.id && (
                      <tr className="bg-[#F9FAF9]">
                        <td colSpan={6} className="px-5 py-4">
                          <div className="rounded-2xl border border-[#D8D3C7] overflow-hidden">
                            <div className="px-4 py-3 bg-[#EEF1EE] border-b border-[#D8D3C7]">
                              <h4 className="text-xs font-black text-[#1B2420] uppercase tracking-wide">
                                Recent Booking History — {c.full_name || c.email}
                              </h4>
                            </div>
                            {!customerBookings[c.id] ? (
                              <div className="py-6 text-center text-xs text-[#3A423E]/60">Loading bookings...</div>
                            ) : customerBookings[c.id].length === 0 ? (
                              <div className="py-6 text-center text-xs text-[#3A423E]/60">No bookings found for this customer.</div>
                            ) : (
                              <table className="w-full text-xs">
                                <thead className="text-[#3A423E]/60 uppercase font-bold text-[9px] tracking-wider">
                                  <tr>
                                    <th className="py-2 px-4 text-left">Service</th>
                                    <th className="py-2 px-4 text-left">Date</th>
                                    <th className="py-2 px-4 text-left">Status</th>
                                    <th className="py-2 px-4 text-right">Amount</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-[#D8D3C7]">
                                  {customerBookings[c.id].map(b => (
                                    <tr key={b.id} className="text-[#1B2420]">
                                      <td className="py-2 px-4 font-semibold">{b.service_title || b.service_category}</td>
                                      <td className="py-2 px-4 text-[#3A423E]/70">
                                        {new Date(b.scheduled_date || b.created_at).toLocaleDateString('en-IN')}
                                      </td>
                                      <td className="py-2 px-4">
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                          b.status === 'completed' ? 'bg-[#4A6741]/10 text-[#4A6741] border border-[#4A6741]/20' :
                                          b.status === 'cancelled' ? 'bg-red-50 text-red-500 border border-red-200' :
                                          'bg-[#D68C31]/10 text-[#9A621C] border border-[#D68C31]/20'
                                        }`}>{b.status}</span>
                                      </td>
                                      <td className="py-2 px-4 text-right font-bold">
                                        ₹{Number(b.total_price).toLocaleString('en-IN')}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && (
        <p className="text-xs text-center text-[#3A423E]/50">
          Showing {filtered.length} of {customers.length} customers
        </p>
      )}
    </div>
  );
};

export default AdminCustomersView;
