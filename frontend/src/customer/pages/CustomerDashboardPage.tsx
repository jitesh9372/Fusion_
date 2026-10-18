import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap,
  Snowflake,
  Paintbrush,
  Sparkles,
  Wrench,
  Hammer,
  Trees,
  Car,
  Cpu,
  Star,
  ShieldCheck,
  CreditCard,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Calendar,
  IndianRupee,
  Briefcase,
  User,
  Plus,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { customerService } from '@/customer/services/customerService';
import { updateUserProfile } from '@/services/profileService';
import AuthToast, { useToast } from '@/components/auth/AuthToast';
import type { GeoPosition } from '@/types/location';
import type {
  ServiceItem,
  WorkerProfile,
  BookingItem,
  PaymentItem,
  MessageItem,
  ReviewItem,
  DisputeItem,
  NotificationItem,
  BookingStage,
} from '@/types/marketplace';

// Modular Customer Sub-Components
import CustomerHeroSection from '@/customer/components/CustomerHeroSection';
import CustomerServiceGrid from '@/customer/components/CustomerServiceGrid';
import CustomerWorkerGrid from '@/customer/components/CustomerWorkerGrid';
import CustomerBookingModal from '@/customer/components/CustomerBookingModal';
import CustomerPaymentModal from '@/customer/components/CustomerPaymentModal';
import CustomerReviewModal from '@/customer/components/CustomerReviewModal';
import CustomerDisputeModal from '@/customer/components/CustomerDisputeModal';
import CustomerTrackingView from '@/customer/components/CustomerTrackingView';
import CustomerPaymentsTab from '@/customer/components/CustomerPaymentsTab';
import CustomerMessagesTab from '@/customer/components/CustomerMessagesTab';
import CustomerProfileTab from '@/customer/components/CustomerProfileTab';
import CustomerReviewsTab from '@/customer/components/CustomerReviewsTab';
import CustomerDisputesTab from '@/customer/components/CustomerDisputesTab';

export const CustomerDashboardPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Extract active tab from pathname (/customer/services) or query (?tab=services)
  const pathSegment = location.pathname.replace('/customer/', '').replace('/customer', '');
  const activeTab =
    pathSegment && pathSegment !== 'dashboard' && pathSegment !== ''
      ? pathSegment
      : searchParams.get('tab') || 'dashboard';

  const { user, profile, refreshProfile } = useAuth();
  const { toasts, addToast, dismissToast } = useToast();

  // ─── Domain Data States ───────────────────────────────────────────────────
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [workers, setWorkers] = useState<WorkerProfile[]>([]);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [disputes, setDisputes] = useState<DisputeItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // ─── Filter & Search States ───────────────────────────────────────────────
  const [serviceSearch, setServiceSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [workerSearch, setWorkerSearch] = useState('');
  const [workerCategoryFilter, setWorkerCategoryFilter] = useState('All');
  const [bookingFilter, setBookingFilter] = useState('all');

  // ─── Modals States ────────────────────────────────────────────────────────
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [selectedWorker, setSelectedWorker] = useState<WorkerProfile | null>(null);
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingTime, setBookingTime] = useState('10:00 AM');
  const [bookingAddress, setBookingAddress] = useState(profile?.address || '');
  const [bookingPosition, setBookingPosition] = useState<GeoPosition | null>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [bookingNotes, setBookingNotes] = useState('');

  // Payment Modal
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [pendingPaymentBooking, setPendingPaymentBooking] = useState<BookingItem | null>(null);

  // Review Modal
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewBooking, setReviewBooking] = useState<BookingItem | null>(null);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Dispute Modal
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [disputeBooking, setDisputeBooking] = useState<BookingItem | null>(null);
  const [disputeReason, setDisputeReason] = useState('Quality of work did not match agreement');
  const [disputeDesc, setDisputeDesc] = useState('');

  // Chat Input State
  const [chatInput, setChatInput] = useState('');
  const [activeChatRecipient, setActiveChatRecipient] = useState<WorkerProfile | null>(null);
  const activeChatRecipientRef = useRef<WorkerProfile | null>(null);
  activeChatRecipientRef.current = activeChatRecipient;

  // Track Service Selected Booking
  const [trackedBookingId, setTrackedBookingId] = useState<string | null>(null);

  // Profile Form State
  const [profileName, setProfileName] = useState(profile?.full_name || '');
  const [profilePhone, setProfilePhone] = useState(profile?.phone || '');
  const [profileAddress, setProfileAddress] = useState(profile?.address || '');
  const [profileSaving, setProfileSaving] = useState(false);

  // Filter workers to only those assigned to customer's bookings (authorized/assigned)
  const assignedWorkers = useMemo(() => {
    const bookedWorkerIds = new Set(
      bookings
        .filter(b => b.worker_id)
        .map(b => b.worker_id as string)
    );

    const matched = workers.filter(
      w => bookedWorkerIds.has(w.id) || (w.user_id && bookedWorkerIds.has(w.user_id))
    );

    if (matched.length === 0) {
      if (bookings.length > 0 && workers.length > 0) {
        const b = bookings.find(x => x.worker_id);
        if (b) {
          const w = workers.find(x => x.id === b.worker_id || x.user_id === b.worker_id);
          if (w) return [w];
        }
      }
    }

    return matched;
  }, [bookings, workers]);

  useEffect(() => {
    if (!activeChatRecipient && assignedWorkers.length > 0) {
      setActiveChatRecipient(assignedWorkers[0]);
    }
  }, [assignedWorkers, activeChatRecipient]);

  // ─── Initial Data Fetch & Realtime Subscriptions ──────────────────────────
  useEffect(() => {
    const customerId = user?.id || '';

    const loadAll = async () => {
      const [srv, wrk, bkg, pay, msg, rev, dsp, notif] = await Promise.all([
        customerService.getServices(),
        customerService.getWorkers(),
        customerService.getBookings({ customerId }),
        customerService.getPayments({ customerId }),
        customerService.getMessages(customerId),
        customerService.getReviews(),
        customerService.getDisputes(customerId),
        customerService.getNotifications(customerId),
      ]);

      setServices(srv);
      setWorkers(wrk);
      setBookings(bkg);
      setPayments(pay);
      setMessages(msg);
      setReviews(rev);
      setDisputes(dsp);
      setNotifications(notif);

      if (bkg.length > 0) {
        setTrackedBookingId(bkg[0].id);
      }
    };

    loadAll();

    const unsubscribeBookings = customerService.subscribeToBookings(payload => {
      if (payload.eventType === 'UPDATE') {
        setBookings(prev =>
          prev.map(b => (b.id === payload.new.id ? { ...b, ...payload.new } : b))
        );
        addToast('info', `Booking status updated: ${(payload.new as any).stage?.toUpperCase()}`);
      } else if (payload.eventType === 'INSERT') {
        setBookings(prev => [payload.new as BookingItem, ...prev]);
      }
    });

    const unsubscribeMessages = customerService.subscribeToMessages(customerId, payload => {
      if (payload.eventType === 'INSERT') {
        const newMsg = payload.new;
        setMessages(prev => (prev.some(m => m.id === newMsg.id) ? prev : [...prev, newMsg]));

        // If incoming from specialist
        if (newMsg.sender_id !== customerId) {
          const currentRecipient = activeChatRecipientRef.current;
          const targetId = currentRecipient?.user_id || currentRecipient?.id;
          if (targetId === newMsg.sender_id || currentRecipient?.id === newMsg.sender_id) {
            customerService.markMessagesAsRead([newMsg.id], customerId);
          } else {
            addToast('info', `💬 ${newMsg.sender_name}: ${newMsg.content.slice(0, 35)}...`);
          }
        }
      } else if (payload.eventType === 'UPDATE') {
        const updated = payload.new;
        setMessages(prev => prev.map(m => (m.id === updated.id ? { ...m, ...updated } : m)));
      }
    });

    const unsubscribeReviews = customerService.subscribeToReviews(payload => {
      if (payload.eventType === 'INSERT') {
        setReviews(prev => [payload.new as ReviewItem, ...prev.filter(r => r.id !== payload.new.id)]);
      } else if (payload.eventType === 'UPDATE') {
        setReviews(prev =>
          prev.map(r => (r.id === payload.new.id ? { ...r, ...payload.new } : r))
        );
      }
    });

    const unsubscribeDisputes = customerService.subscribeToDisputes(payload => {
      if (payload.eventType === 'INSERT') {
        setDisputes(prev => [payload.new as DisputeItem, ...prev.filter(d => d.id !== payload.new.id)]);
      } else if (payload.eventType === 'UPDATE') {
        setDisputes(prev =>
          prev.map(d => (d.id === payload.new.id ? { ...d, ...payload.new } : d))
        );
      }
    });

    return () => {
      unsubscribeBookings?.();
      unsubscribeMessages?.();
      unsubscribeReviews?.unsubscribe?.();
      unsubscribeDisputes?.unsubscribe?.();
    };
  }, [user]);

  useEffect(() => {
    if (profile) {
      setProfileName(profile.full_name || '');
      setProfilePhone(profile.phone || '');
      setProfileAddress(profile.address || '');
    }
  }, [profile]);

  const navigateTab = (tab: string) => {
    navigate(`/customer/${tab}`);
  };

  // ─── SERVICE ICON MAPPING ─────────────────────────────────────────────────
  const renderServiceIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'electricity':
        return <Zap className="w-5 h-5 text-[#D68C31]" />;
      case 'ac repair':
        return <Snowflake className="w-5 h-5 text-[#14524C]" />;
      case 'painting':
        return <Paintbrush className="w-5 h-5 text-[#D68C31]" />;
      case 'cleaning':
        return <Sparkles className="w-5 h-5 text-[#4A6741]" />;
      case 'plumbing':
        return <Wrench className="w-5 h-5 text-[#14524C]" />;
      case 'carpentry':
        return <Hammer className="w-5 h-5 text-[#D68C31]" />;
      case 'gardening':
        return <Trees className="w-5 h-5 text-[#4A6741]" />;
      case 'driving':
        return <Car className="w-5 h-5 text-[#14524C]" />;
      case 'appliance repair':
        return <Cpu className="w-5 h-5 text-[#9C4A34]" />;
      case 'security':
        return <ShieldCheck className="w-5 h-5 text-[#4A6741]" />;
      case 'renovation':
        return <Hammer className="w-5 h-5 text-[#9C4A34]" />;
      case 'it support':
        return <Cpu className="w-5 h-5 text-[#14524C]" />;
      case 'pest control':
        return <ShieldCheck className="w-5 h-5 text-[#D68C31]" />;
      default:
        return <Wrench className="w-5 h-5 text-[#14524C]" />;
    }
  };

  // ─── BOOKING ACTIONS ──────────────────────────────────────────────────────
  const handleOpenBookingModal = (srv?: ServiceItem, wrk?: WorkerProfile) => {
    if (srv) {
      setSelectedService(srv);
      const matching = workers.find(
        w => w.trade_category.toLowerCase() === srv.category.toLowerCase()
      );
      setSelectedWorker(wrk || matching || workers[0] || null);
    } else if (wrk) {
      setSelectedWorker(wrk);
      const matching = services.find(
        s => s.category.toLowerCase() === wrk.trade_category.toLowerCase()
      );
      setSelectedService(matching || services[0] || null);
    } else {
      setSelectedService(services[0] || null);
      setSelectedWorker(workers[0] || null);
    }
    setBookingModalOpen(true);
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !bookingAddress) {
      addToast('error', 'Please select a service address on the map.');
      return;
    }

    const newBooking = await customerService.createBooking({
      customer_id: user?.id || 'usr-cust-1',
      worker_id: selectedWorker?.user_id || selectedWorker?.id || null,
      service_id: selectedService.id,
      service_title: selectedService.title,
      service_category: selectedService.category,
      scheduled_date: bookingDate,
      scheduled_time: bookingTime,
      address: bookingAddress,
      latitude: bookingPosition?.lat ?? null,
      longitude: bookingPosition?.lng ?? null,
      total_price: selectedWorker ? selectedWorker.hourly_rate * 1.5 : selectedService.base_price,
      notes: bookingNotes,
      customer_name: profile?.full_name || 'Customer Member',
      worker_name: selectedWorker?.full_name || 'Assigned Specialist',
    });

    setBookings(prev => [newBooking, ...prev]);
    setTrackedBookingId(newBooking.id);
    setBookingModalOpen(false);
    setBookingNotes('');
    setBookingAddress('');
    setBookingPosition(null);
    setShowMapPicker(false);
    addToast('success', `Appointment for "${selectedService.title}" confirmed! Address saved with GPS coordinates.`);
  };

  // ─── TRACKING & STAGE ADVANCEMENT ──────────────────────────────────────────
  const activeTrackedBooking = bookings.find(b => b.id === trackedBookingId) || bookings[0];

  const handleSimulateStage = async (nextStage: BookingStage) => {
    if (!activeTrackedBooking) return;
    await customerService.updateBookingStage(activeTrackedBooking.id, nextStage);
    setBookings(prev =>
      prev.map(b => (b.id === activeTrackedBooking.id ? { ...b, stage: nextStage } : b))
    );
    addToast('info', `Service tracking updated: Stage moved to ${nextStage.toUpperCase().replace('_', ' ')}.`);
  };

  // ─── ESCROW PAYMENT EXECUTION ──────────────────────────────────────────────
  const handleOpenPayment = (booking: BookingItem) => {
    setPendingPaymentBooking(booking);
    setPaymentModalOpen(true);
  };

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingPaymentBooking) return;

    const newPay = await customerService.createPayment({
      booking_id: pendingPaymentBooking.id,
      customer_id: user?.id || 'usr-cust-1',
      worker_id: pendingPaymentBooking.worker_id || 'wrk-1',
      amount: pendingPaymentBooking.total_price,
      platform_fee: pendingPaymentBooking.total_price * 0.1,
      worker_payout: pendingPaymentBooking.total_price * 0.9,
      status: 'paid',
      payment_method: 'Cooperative Escrow Card',
      service_title: pendingPaymentBooking.service_title,
    });

    setPayments(prev => [newPay, ...prev]);
    setPaymentModalOpen(false);
    addToast('success', `Payment of ₹${pendingPaymentBooking.total_price.toFixed(2)} held securely in FUSION Escrow.`);
  };

  // ─── CHAT MESSAGING & READ RECEIPTS ───────────────────────────────────────
  // Mark messages as read when viewing conversation
  useEffect(() => {
    if (activeTab === 'messages' && activeChatRecipient) {
      const customerId = user?.id || '';
      const targetUserId = activeChatRecipient.user_id || activeChatRecipient.id;
      const targetAltId = activeChatRecipient.id;

      const unreadIds = messages
        .filter(
          m =>
            (m.sender_id === targetUserId || m.sender_id === targetAltId) &&
            m.receiver_id === customerId &&
            !m.is_read
        )
        .map(m => m.id);

      if (unreadIds.length > 0) {
        customerService.markMessagesAsRead(unreadIds, customerId);
        setMessages(prev =>
          prev.map(m => (unreadIds.includes(m.id) ? { ...m, is_read: true } : m))
        );
      }
    }
  }, [activeTab, activeChatRecipient, messages, user]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeChatRecipient) return;

    const customerId = user?.id || 'usr-cust-1';
    const targetUserId = activeChatRecipient.user_id || activeChatRecipient.id;

    // Resolve matching booking with this technician
    const linkedBooking = bookings.find(
      b =>
        b.worker_id === activeChatRecipient.id ||
        (activeChatRecipient.user_id && b.worker_id === activeChatRecipient.user_id)
    ) || bookings[0];

    const content = chatInput.trim();
    setChatInput('');

    try {
      const msg = await customerService.sendMessage({
        booking_id: linkedBooking?.id || null,
        sender_id: customerId,
        receiver_id: targetUserId,
        sender_name: profile?.full_name || 'Customer',
        content,
      });

      if (msg) {
        setMessages(prev => (prev.some(m => m.id === msg.id) ? prev : [...prev, msg]));
      }
    } catch (err: any) {
      addToast('error', 'Failed to send message: ' + (err.message || 'Network error'));
    }
  };

  // ─── REVIEWS ───────────────────────────────────────────────────────────────
  const handleOpenReview = (booking: BookingItem) => {
    setReviewBooking(booking);
    setReviewRating(5);
    setReviewComment('');
    setReviewModalOpen(true);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewBooking) return;

    try {
      setReviewSubmitting(true);
      const rev = await customerService.submitReview({
        booking_id: reviewBooking.id,
        worker_id: reviewBooking.worker_id || 'wrk-1',
        customer_id: user?.id || 'usr-cust-1',
        customer_name: profile?.full_name || 'Customer',
        rating: reviewRating,
        comment: reviewComment,
      });

      setReviews(prev => [rev, ...prev.filter(r => r.id !== rev.id)]);
      setReviewModalOpen(false);
      setReviewComment('');
      setReviewRating(5);
      addToast('success', 'Thank you! Your verified review has been published.');
    } catch (err: any) {
      addToast('error', 'Failed to publish review: ' + (err?.message || 'Please try again.'));
    } finally {
      setReviewSubmitting(false);
    }
  };

  // ─── DISPUTES ──────────────────────────────────────────────────────────────
  const handleOpenDispute = (booking: BookingItem) => {
    setDisputeBooking(booking);
    setDisputeReason('Quality of work did not meet agreed cooperative standards');
    setDisputeDesc('');
    setDisputeModalOpen(true);
  };

  const handleSubmitDispute = async (evidenceUrls: string[]) => {
    if (!disputeBooking) return;

    try {
      const dsp = await customerService.createDispute({
        booking_id: disputeBooking.id,
        raised_by: user?.id || 'usr-cust-1',
        raised_by_name: profile?.full_name || 'Customer Member',
        reason: disputeReason,
        description: disputeDesc,
        evidence_urls: evidenceUrls,
      });

      setDisputes(prev => [dsp, ...prev.filter(d => d.id !== dsp.id)]);
      setDisputeModalOpen(false);
      setDisputeDesc('');
      addToast('warning', 'Dispute claim lodged with Cooperative Arbitration. Funds locked.');
    } catch (err: any) {
      addToast('error', 'Failed to lodge dispute: ' + (err?.message || 'Please try again.'));
    }
  };

  // ─── PROFILE UPDATE ────────────────────────────────────────────────────────
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setProfileSaving(true);
    try {
      await updateUserProfile(user.id, {
        full_name: profileName,
        phone: profilePhone,
        address: profileAddress,
      });
      await refreshProfile();
      addToast('success', 'Profile information updated successfully!');
    } catch (err: any) {
      addToast('error', 'Failed to update profile: ' + err.message);
    } finally {
      setProfileSaving(false);
    }
  };

  // ─── FILTERED SERVICES & WORKERS ──────────────────────────────────────────
  const filteredServices = services.filter(srv => {
    const matchesCat =
      selectedCategory === 'All' ||
      srv.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      srv.title.toLowerCase().includes(serviceSearch.toLowerCase()) ||
      srv.description.toLowerCase().includes(serviceSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const filteredWorkers = workers.filter(wrk => {
    const matchesCat =
      workerCategoryFilter === 'All' ||
      wrk.trade_category.toLowerCase() === workerCategoryFilter.toLowerCase();
    const matchesSearch =
      wrk.full_name?.toLowerCase().includes(workerSearch.toLowerCase()) ||
      wrk.trade_category.toLowerCase().includes(workerSearch.toLowerCase()) ||
      wrk.bio?.toLowerCase().includes(workerSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Dynamically derive categories from loaded services so new ones always appear
  const categories = [
    'All',
    ...Array.from(new Set(services.map(s => s.category))).sort(),
  ];

  return (
    <>
      <AuthToast toasts={toasts} onDismiss={dismissToast} />

      <div className="space-y-8 max-w-7xl mx-auto pb-20 text-[#1B2420]">
        {/* TAB 1: CUSTOMER DASHBOARD HERO */}
        {activeTab === 'dashboard' && (
          <div className="space-y-10">
            <CustomerHeroSection
              serviceSearch={serviceSearch}
              setServiceSearch={setServiceSearch}
              setSelectedCategory={setSelectedCategory}
              navigateTab={navigateTab}
              onOpenBookingModal={() => handleOpenBookingModal()}
              bookings={bookings}
            />

            {/* Quick Service Categories Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#1B2420]">Popular Trade Categories</h2>
                  <p className="text-xs text-[#3A423E]">Verified cooperative technicians across key trades.</p>
                </div>
                <motion.button
                  type="button"
                  onClick={() => navigateTab('services')}
                  whileHover={{ x: 3 }}
                  className="text-xs text-[#14524C] font-bold hover:underline"
                >
                  View All Services →
                </motion.button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                {categories
                  .filter(c => c !== 'All')
                  .slice(0, 6)
                  .map(cat => (
                    <motion.button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat);
                        navigateTab('services');
                      }}
                      whileHover={{ y: -3, scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="p-4 rounded-2xl bg-[#FFFFFF] hover:bg-[#EEF1EE] border border-[#D8D3C7] hover:border-[#14524C] flex flex-col items-center gap-2.5 text-center transition-all group shadow-none"
                    >
                      <div className="w-11 h-11 rounded-xl bg-[#EEF1EE] border border-[#D8D3C7] flex items-center justify-center group-hover:scale-110 transition-transform">
                        {renderServiceIcon(cat)}
                      </div>
                      <span className="text-xs font-bold text-[#1B2420] group-hover:text-[#14524C] transition-colors">
                        {cat}
                      </span>
                    </motion.button>
                  ))}
              </div>
            </div>

            {/* Active Bookings Quick View */}
            {bookings.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-[#1B2420]">Your Active Bookings</h2>
                  <motion.button
                    type="button"
                    onClick={() => navigateTab('bookings')}
                    whileHover={{ x: 3 }}
                    className="text-xs text-[#14524C] font-bold hover:underline"
                  >
                    Manage All ({bookings.length}) →
                  </motion.button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bookings.slice(0, 2).map(b => (
                    <motion.div
                      key={b.id}
                      whileHover={{ y: -2 }}
                      className="p-5 rounded-3xl border border-[#D8D3C7] hover:border-[#14524C] bg-[#FFFFFF] flex items-center justify-between gap-4 transition-all"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] text-[#14524C] font-bold uppercase tracking-wider">
                          {b.service_category}
                        </span>
                        <h4 className="text-sm font-bold text-[#1B2420]">{b.service_title}</h4>
                        <p className="text-xs text-[#3A423E]">
                          {b.scheduled_date} • {b.scheduled_time}
                        </p>
                      </div>
                      <motion.button
                        type="button"
                        onClick={() => {
                          setTrackedBookingId(b.id);
                          navigateTab('tracking');
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2.5 rounded-xl bg-[#14524C]/10 text-[#14524C] border border-[#14524C]/30 text-xs font-bold hover:bg-[#14524C]/20 transition-all shadow-none"
                      >
                        Track Status
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SERVICES CATALOG */}
        {activeTab === 'services' && (
          <CustomerServiceGrid
            services={filteredServices}
            serviceSearch={serviceSearch}
            setServiceSearch={setServiceSearch}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            categories={categories}
            renderServiceIcon={renderServiceIcon}
            onBookService={srv => handleOpenBookingModal(srv)}
          />
        )}

        {/* TAB 3: VERIFIED WORKERS */}
        {activeTab === 'workers' && (
          <CustomerWorkerGrid
            workers={filteredWorkers}
            workerSearch={workerSearch}
            setWorkerSearch={setWorkerSearch}
            workerCategoryFilter={workerCategoryFilter}
            setWorkerCategoryFilter={setWorkerCategoryFilter}
            categories={categories}
            onBookWorker={wrk => handleOpenBookingModal(undefined, wrk)}
          />
        )}

        {/* TAB 4: MY BOOKINGS */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-[#1B2420] tracking-tight">
                  Appointment Bookings
                </h1>
                <p className="text-xs text-[#3A423E]">
                  Track upcoming, ongoing, and completed cooperative service orders.
                </p>
              </div>

              {/* Filter */}
              <div className="flex flex-wrap gap-2.5">
                {['all', 'pending', 'confirmed', 'in_progress', 'completed'].map(f => {
                  const isSelected = bookingFilter === f;
                  return (
                    <motion.button
                      key={f}
                      type="button"
                      onClick={() => setBookingFilter(f)}
                      whileHover={{ y: -1, scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-none ${
                        isSelected
                          ? 'bg-[#14524C] text-[#FFFFFF] border border-[#14524C]'
                          : 'bg-[#FFFFFF] text-[#3A423E] hover:text-[#14524C] hover:bg-[#EEF1EE] border border-[#D8D3C7]'
                      }`}
                    >
                      {f.replace('_', ' ').toUpperCase()}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              {bookings.filter(b => bookingFilter === 'all' || b.status === bookingFilter).length === 0 ? (
                <div className="p-12 text-center border border-[#D8D3C7] rounded-3xl bg-[#FFFFFF] space-y-3">
                  <Briefcase className="w-10 h-10 text-[#3A423E]/30 mx-auto" />
                  <p className="text-sm font-bold text-[#1B2420]">No bookings found</p>
                  <p className="text-xs text-[#3A423E]">
                    {bookingFilter === 'all'
                      ? 'You have not made any service appointments yet. Book a verified artisan to get started!'
                      : `No appointments with status "${bookingFilter}".`}
                  </p>
                  <motion.button
                    type="button"
                    onClick={() => navigateTab('services')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-5 py-2.5 rounded-xl bg-[#14524C] text-[#FFFFFF] text-xs font-bold shadow-sm"
                  >
                    Browse Services
                  </motion.button>
                </div>
              ) : (
                bookings
                  .filter(b => bookingFilter === 'all' || b.status === bookingFilter)
                  .map(b => (
                    <motion.div
                      key={b.id}
                      whileHover={{ y: -2 }}
                      className="p-6 rounded-3xl border border-[#D8D3C7] bg-[#FFFFFF] flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-[#14524C] transition-all"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2.5">
                          <h3 className="text-base font-bold text-[#1B2420]">{b.service_title}</h3>
                          <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-[#EEF1EE] text-[#14524C] border border-[#D8D3C7]">
                            {b.status} • Stage: {b.stage}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-4 text-xs text-[#3A423E]">
                          <span>Specialist: <strong className="text-[#1B2420]">{b.worker_name || 'Assigned Artisan'}</strong></span>
                          <span>📍 {b.address}</span>
                          <span>📅 {b.scheduled_date} at {b.scheduled_time}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <span className="text-xs text-[#3A423E] block font-semibold">Total Price</span>
                          <span className="text-base font-extrabold text-[#1B2420]">
                            ₹{b.total_price.toFixed(2)}
                          </span>
                        </div>

                      <div className="flex items-center gap-2">
                        <motion.button
                          type="button"
                          onClick={() => {
                            setTrackedBookingId(b.id);
                            navigateTab('tracking');
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-4 py-2.5 rounded-xl bg-[#14524C]/10 text-[#14524C] border border-[#14524C]/30 text-xs font-bold hover:bg-[#14524C]/20 transition-colors"
                        >
                          Track
                        </motion.button>
                        {b.status !== 'completed' && (
                          <motion.button
                            type="button"
                            onClick={() => handleOpenPayment(b)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2.5 rounded-xl bg-[#14524C] hover:bg-[#0E3D38] text-[#FFFFFF] text-xs font-bold transition-colors shadow-sm"
                          >
                            Pay Escrow
                          </motion.button>
                        )}
                        <motion.button
                          type="button"
                          onClick={() => handleOpenReview(b)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2.5 rounded-xl bg-[#EEF1EE] hover:bg-[#D68C31]/15 text-[#3A423E] hover:text-[#D68C31] border border-[#D8D3C7] transition-colors"
                          title="Review artisan"
                        >
                          <Star className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          type="button"
                          onClick={() => handleOpenDispute(b)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2.5 rounded-xl bg-[#EEF1EE] hover:bg-[#9C4A34]/15 text-[#3A423E] hover:text-[#9C4A34] border border-[#D8D3C7] transition-colors"
                          title="Raise dispute"
                        >
                          <AlertCircle className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 5: LIVE 5-STAGE TRACKER */}
        {activeTab === 'tracking' && (
          <CustomerTrackingView
            bookings={bookings}
            activeTrackedBooking={activeTrackedBooking}
            trackedBookingId={trackedBookingId}
            setTrackedBookingId={setTrackedBookingId}
            customerUserId={user?.id || ''}
            onSimulateStage={handleSimulateStage}
            onOpenBookingModal={() => handleOpenBookingModal()}
          />
        )}

        {/* TAB 6: ESCROW & PAYMENTS */}
        {activeTab === 'payments' && (
          <CustomerPaymentsTab payments={payments} />
        )}

        {/* TAB 7: MESSAGES */}
        {activeTab === 'messages' && (
          <CustomerMessagesTab
            workers={assignedWorkers}
            bookings={bookings}
            messages={messages}
            activeChatRecipient={activeChatRecipient}
            setActiveChatRecipient={setActiveChatRecipient}
            chatInput={chatInput}
            setChatInput={setChatInput}
            onSendMessage={handleSendMessage}
            currentUserId={user?.id || 'usr-cust-1'}
            onNavigateTab={navigateTab}
          />
        )}

        {/* TAB 8: REVIEWS */}
        {activeTab === 'reviews' && (
          <CustomerReviewsTab
            reviews={reviews}
            bookings={bookings}
            workers={workers}
            onOpenReviewModal={handleOpenReview}
            onNavigateTab={navigateTab}
          />
        )}

        {/* TAB 9: DISPUTES */}
        {activeTab === 'disputes' && (
          <CustomerDisputesTab
            disputes={disputes}
            bookings={bookings}
            onOpenDisputeModal={handleOpenDispute}
            onNavigateTab={navigateTab}
          />
        )}

        {/* TAB 10: PROFILE SETTINGS */}
        {activeTab === 'profile' && (
          <CustomerProfileTab
            profile={profile}
            profileName={profileName}
            setProfileName={setProfileName}
            profilePhone={profilePhone}
            setProfilePhone={setProfilePhone}
            profileAddress={profileAddress}
            setProfileAddress={setProfileAddress}
            profileSaving={profileSaving}
            onSaveProfile={handleSaveProfile}
          />
        )}
      </div>

      {/* ─── MODALS ─────────────────────────────────────────────────────────── */}
      <CustomerBookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        selectedService={selectedService}
        setSelectedService={setSelectedService}
        selectedWorker={selectedWorker}
        setSelectedWorker={setSelectedWorker}
        services={services}
        workers={workers}
        bookingDate={bookingDate}
        setBookingDate={setBookingDate}
        bookingTime={bookingTime}
        setBookingTime={setBookingTime}
        bookingAddress={bookingAddress}
        setBookingAddress={setBookingAddress}
        bookingPosition={bookingPosition}
        setBookingPosition={setBookingPosition}
        showMapPicker={showMapPicker}
        setShowMapPicker={setShowMapPicker}
        bookingNotes={bookingNotes}
        setBookingNotes={setBookingNotes}
        onSubmit={handleConfirmBooking}
      />

      <CustomerPaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        booking={pendingPaymentBooking}
        onSubmit={handleConfirmPayment}
      />

      <CustomerReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        booking={reviewBooking}
        rating={reviewRating}
        setRating={setReviewRating}
        comment={reviewComment}
        setComment={setReviewComment}
        onSubmit={handleSubmitReview}
        submitting={reviewSubmitting}
      />

      <CustomerDisputeModal
        isOpen={disputeModalOpen}
        onClose={() => setDisputeModalOpen(false)}
        booking={disputeBooking}
        reason={disputeReason}
        setReason={setDisputeReason}
        description={disputeDesc}
        setDescription={setDisputeDesc}
        onSubmit={handleSubmitDispute}
      />
    </>
  );
};

export default CustomerDashboardPage;
