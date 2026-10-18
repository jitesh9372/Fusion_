import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  ShieldCheck, Search, CheckCircle2, XCircle, Clock,
  Eye, FileText, Star, Briefcase, RefreshCw, User,
  Phone, MapPin, Award, AlertTriangle, ExternalLink,
} from 'lucide-react';
import type { WorkerProfile, VerificationStatus } from '@/types/marketplace';

type FilterStatus = 'all' | 'pending' | 'verified' | 'rejected' | 'unverified';

export const AdminVerificationView: React.FC = () => {
  const [workers, setWorkers] = useState<WorkerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterStatus>('pending');
  const [selectedWorker, setSelectedWorker] = useState<WorkerProfile | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [note, setNote] = useState('');

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('workers')
        .select(`
          *,
          profiles:user_id (full_name, email, phone, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const enriched = (data || []).map(w => ({
        ...w,
        full_name: w.profiles?.full_name || w.full_name,
        email: w.profiles?.email || w.email,
        phone: w.profiles?.phone,
        avatar_url: w.profiles?.avatar_url || w.avatar_url,
      }));

      setWorkers(enriched);
    } catch (err) {
      console.error('[AdminVerificationView] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (workerId: string, status: VerificationStatus) => {
    setActionLoading(workerId + status);
    try {
      const { error } = await supabase
        .from('workers')
        .update({
          verification_status: status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', workerId);

      if (!error) {
        setWorkers(prev =>
          prev.map(w => w.id === workerId ? { ...w, verification_status: status } : w)
        );
        if (selectedWorker?.id === workerId) {
          setSelectedWorker(prev => prev ? { ...prev, verification_status: status } : null);
        }
      }
    } catch (err) {
      console.error('[AdminVerificationView] Verify error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const filtered = workers.filter(w => {
    const matchSearch =
      (w.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      w.trade_category.toLowerCase().includes(search.toLowerCase()) ||
      (w.email || '').toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || w.verification_status === filter;
    return matchSearch && matchFilter;
  });

  const counts = {
    all: workers.length,
    pending: workers.filter(w => w.verification_status === 'pending').length,
    verified: workers.filter(w => w.verification_status === 'verified').length,
    rejected: workers.filter(w => w.verification_status === 'rejected').length,
    unverified: workers.filter(w => w.verification_status === 'unverified').length,
  };

  const statusStyle = (status: VerificationStatus) => {
    switch (status) {
      case 'verified': return 'bg-[#4A6741]/10 text-[#4A6741] border-[#4A6741]/30';
      case 'pending': return 'bg-[#D68C31]/10 text-[#9A621C] border-[#D68C31]/30';
      case 'rejected': return 'bg-red-50 text-red-600 border-red-200';
      default: return 'bg-[#EEF1EE] text-[#3A423E] border-[#D8D3C7]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#1B2420]">Verification Queue</h2>
          <p className="text-xs text-[#3A423E]/80 mt-0.5">
            Review artisan credentials, identity documents, and activate verified status.
          </p>
        </div>
        <button
          onClick={fetchWorkers}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#9C4A34] text-white font-bold text-xs hover:bg-[#843D2C] transition-colors shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Pending Review', value: counts.pending, icon: Clock, color: 'text-[#9A621C]', bg: 'bg-[#D68C31]/10', urgent: counts.pending > 0 },
          { label: 'Verified', value: counts.verified, icon: CheckCircle2, color: 'text-[#4A6741]', bg: 'bg-[#4A6741]/10' },
          { label: 'Rejected', value: counts.rejected, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Total Workers', value: counts.all, icon: User, color: 'text-[#14524C]', bg: 'bg-[#14524C]/10' },
        ].map(card => (
          <div
            key={card.label}
            className={`rounded-3xl border bg-[#FFFFFF] p-4 space-y-2 shadow-sm ${
              (card as any).urgent ? 'border-[#D68C31]/50 ring-1 ring-[#D68C31]/20' : 'border-[#D8D3C7]'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <p className="text-[10px] uppercase font-bold text-[#3A423E]/60 tracking-wider">{card.label}</p>
            <p className={`text-xl font-black ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 sm:max-w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3A423E]/40" />
          <input
            type="text"
            placeholder="Search worker, trade, email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#FFFFFF] border border-[#D8D3C7] rounded-2xl text-[#1B2420] text-xs placeholder-[#3A423E]/50 focus:outline-none focus:ring-1 focus:ring-[#9C4A34] shadow-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'pending', 'verified', 'rejected', 'unverified'] as FilterStatus[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold capitalize border transition-colors ${
                filter === f
                  ? 'bg-[#9C4A34] text-white border-[#9C4A34]'
                  : 'bg-[#FFFFFF] text-[#3A423E] border-[#D8D3C7] hover:border-[#9C4A34]/40'
              }`}
            >
              {f} {f !== 'all' && <span className="ml-1 opacity-70">({counts[f]})</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Main Layout: List + Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Workers List */}
        <div className="lg:col-span-3 rounded-3xl border border-[#D8D3C7] bg-[#FFFFFF] shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-16 flex flex-col items-center gap-3 text-[#3A423E]/60">
              <div className="w-8 h-8 border-2 border-[#9C4A34] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium">Loading verification queue...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <ShieldCheck className="w-12 h-12 text-[#3A423E]/20 mx-auto mb-3" />
              <p className="text-sm font-bold text-[#3A423E]/60">
                {filter === 'pending' ? 'No pending verifications 🎉' : 'No workers match the current filter.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#D8D3C7]">
              {filtered.map(w => (
                <div
                  key={w.id}
                  onClick={() => setSelectedWorker(w)}
                  className={`flex items-center justify-between px-5 py-4 cursor-pointer transition-colors ${
                    selectedWorker?.id === w.id
                      ? 'bg-[#9C4A34]/5 border-l-2 border-[#9C4A34]'
                      : 'hover:bg-[#F4F6F4]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#14524C] flex items-center justify-center font-bold text-white text-sm shadow-sm shrink-0">
                      {(w.full_name || 'W').charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-[#1B2420] text-sm truncate">{w.full_name || 'Unknown Worker'}</p>
                      <p className="text-[10px] text-[#3A423E]/60">{w.trade_category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase ${statusStyle(w.verification_status)}`}>
                      {w.verification_status}
                    </span>
                    <Eye className="w-3.5 h-3.5 text-[#3A423E]/40" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Worker Detail Panel */}
        <div className="lg:col-span-2">
          {!selectedWorker ? (
            <div className="h-full rounded-3xl border border-dashed border-[#D8D3C7] flex flex-col items-center justify-center text-center p-8 gap-3">
              <ShieldCheck className="w-10 h-10 text-[#3A423E]/20" />
              <p className="text-sm font-bold text-[#3A423E]/50">Select a worker to review their verification details</p>
            </div>
          ) : (
            <div className="rounded-3xl border border-[#D8D3C7] bg-[#FFFFFF] shadow-sm overflow-hidden">
              {/* Worker Header */}
              <div className="p-5 bg-gradient-to-br from-[#1B2420] to-[#14524C] text-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center font-black text-xl">
                    {(selectedWorker.full_name || 'W').charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black text-base">{selectedWorker.full_name || 'Unknown Worker'}</h3>
                    <p className="text-xs text-white/70">{selectedWorker.email || '—'}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-full bg-white/20 font-semibold">{selectedWorker.trade_category}</span>
                  <span className="px-2.5 py-1 rounded-full bg-white/20 font-semibold">₹{selectedWorker.hourly_rate}/hr</span>
                  <span className="px-2.5 py-1 rounded-full bg-white/20 font-semibold flex items-center gap-1">
                    <Star className="w-3 h-3 fill-[#D68C31] text-[#D68C31]" />
                    {selectedWorker.rating.toFixed(1)}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-4">
                {/* Current Status */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#3A423E]/60 uppercase tracking-wide">Current Status</span>
                  <span className={`px-3 py-1 rounded-full border text-xs font-bold uppercase ${statusStyle(selectedWorker.verification_status)}`}>
                    {selectedWorker.verification_status === 'verified' && <CheckCircle2 className="inline w-3 h-3 mr-1" />}
                    {selectedWorker.verification_status === 'pending' && <Clock className="inline w-3 h-3 mr-1" />}
                    {selectedWorker.verification_status === 'rejected' && <XCircle className="inline w-3 h-3 mr-1" />}
                    {selectedWorker.verification_status}
                  </span>
                </div>

                {/* Worker Info Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {[
                    { label: 'Experience', value: `${selectedWorker.experience_years}yr`, icon: Briefcase },
                    { label: 'Jobs Done', value: selectedWorker.total_jobs, icon: CheckCircle2 },
                    { label: 'Trade', value: selectedWorker.trade_category, icon: Award },
                    { label: 'Status', value: selectedWorker.is_available ? 'Available' : 'Busy', icon: Clock },
                  ].map(item => (
                    <div key={item.label} className="rounded-2xl border border-[#D8D3C7] p-3 space-y-1">
                      <div className="flex items-center gap-1.5 text-[#3A423E]/50">
                        <item.icon className="w-3 h-3" />
                        <span className="uppercase text-[9px] font-bold tracking-wide">{item.label}</span>
                      </div>
                      <p className="font-black text-[#1B2420]">{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Service Areas */}
                {selectedWorker.service_areas?.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase font-bold text-[#3A423E]/60 tracking-wide mb-2 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Service Areas
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedWorker.service_areas.map(area => (
                        <span key={area} className="px-2 py-0.5 rounded-full bg-[#14524C]/10 text-[#14524C] text-[10px] font-semibold border border-[#14524C]/20">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Documents */}
                <div>
                  <p className="text-[10px] uppercase font-bold text-[#3A423E]/60 tracking-wide mb-2 flex items-center gap-1">
                    <FileText className="w-3 h-3" /> Documents
                  </p>
                  <div className="space-y-2">
                    {selectedWorker.id_document_url ? (
                      <a
                        href={selectedWorker.id_document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 rounded-xl border border-[#D8D3C7] hover:border-[#9C4A34]/40 hover:bg-[#9C4A34]/5 transition-colors group"
                      >
                        <div className="flex items-center gap-2 text-xs font-semibold text-[#1B2420]">
                          <FileText className="w-4 h-4 text-[#9C4A34]" />
                          Identity Document
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-[#3A423E]/40 group-hover:text-[#9C4A34] transition-colors" />
                      </a>
                    ) : (
                      <div className="flex items-center gap-2 p-3 rounded-xl border border-dashed border-[#D8D3C7] text-xs text-[#3A423E]/50">
                        <AlertTriangle className="w-4 h-4" />
                        No identity document uploaded
                      </div>
                    )}
                    {selectedWorker.certificate_url ? (
                      <a
                        href={selectedWorker.certificate_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 rounded-xl border border-[#D8D3C7] hover:border-[#9C4A34]/40 hover:bg-[#9C4A34]/5 transition-colors group"
                      >
                        <div className="flex items-center gap-2 text-xs font-semibold text-[#1B2420]">
                          <Award className="w-4 h-4 text-[#4A6741]" />
                          Trade Certificate
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-[#3A423E]/40 group-hover:text-[#4A6741] transition-colors" />
                      </a>
                    ) : (
                      <div className="flex items-center gap-2 p-3 rounded-xl border border-dashed border-[#D8D3C7] text-xs text-[#3A423E]/50">
                        <AlertTriangle className="w-4 h-4" />
                        No trade certificate uploaded
                      </div>
                    )}
                  </div>
                </div>

                {/* Bio */}
                {selectedWorker.bio && (
                  <div>
                    <p className="text-[10px] uppercase font-bold text-[#3A423E]/60 tracking-wide mb-1.5">Bio</p>
                    <p className="text-xs text-[#3A423E] leading-relaxed line-clamp-3">{selectedWorker.bio}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <button
                    disabled={selectedWorker.verification_status === 'verified' || actionLoading !== null}
                    onClick={() => handleVerify(selectedWorker.id, 'verified')}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl bg-[#4A6741] hover:bg-[#3d5635] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs transition-colors shadow-sm"
                  >
                    {actionLoading === selectedWorker.id + 'verified' ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                    Approve
                  </button>
                  <button
                    disabled={selectedWorker.verification_status === 'rejected' || actionLoading !== null}
                    onClick={() => handleVerify(selectedWorker.id, 'rejected')}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl bg-red-50 hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed text-red-600 font-bold text-xs border border-red-200 transition-colors"
                  >
                    {actionLoading === selectedWorker.id + 'rejected' ? (
                      <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5" />
                    )}
                    Reject
                  </button>
                </div>

                {selectedWorker.verification_status === 'pending' && (
                  <p className="text-[10px] text-center text-[#3A423E]/50">
                    Review documents above before approving or rejecting this artisan.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminVerificationView;
