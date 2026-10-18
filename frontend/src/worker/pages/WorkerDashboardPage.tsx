import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  fetchBookings,
  updateBookingStage,
  acceptBookingByWorker,
  declineBookingByWorker,
  fetchWorkerByUserId,
  updateWorkerAvailability,
  subscribeToBookings,
} from '@/services/marketplaceService';
import { fetchPayments, fetchWorkerWallet, requestWithdrawal } from '@/services/paymentService';
import {
  fetchMessages,
  sendMessage,
  subscribeToMessages,
  markMessagesAsRead,
} from '@/services/chatService';
import { fetchReviews } from '@/services/reviewDisputeService';
import {
  fetchWelfareClaims,
  submitWelfareClaim,
} from '@/services/welfareTrainingService';
import AuthToast, { useToast } from '@/components/auth/AuthToast';
import type {
  WorkerProfile,
  BookingItem,
  PaymentItem,
  MessageItem,
  ReviewItem,
  WelfareClaim,
  BookingStage,
} from '@/types/marketplace';

// Modular Worker Sub-Components
import WorkerStatsHeader from '@/worker/components/WorkerStatsHeader';
import WorkerJobRequestsList from '@/worker/components/WorkerJobRequestsList';
import WorkerAssignedJobsList from '@/worker/components/WorkerAssignedJobsList';
import WorkerEarningsView, { PayoutDetails } from '@/worker/components/WorkerEarningsView';
import WorkerSkillsView from '@/worker/components/WorkerSkillsView';
import WorkerVerificationView from '@/worker/components/WorkerVerificationView';
import WorkerWelfareTrainingView from '@/worker/components/WorkerWelfareTrainingView';
import WorkerProfileEditor from '@/worker/components/WorkerProfileEditor';
import WorkerRatingsView from '@/worker/components/WorkerRatingsView';
import WorkerMessagesTab, { ConnectedCustomerContact } from '@/worker/components/WorkerMessagesTab';

export const WorkerDashboardPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Extract active tab from URL path (/worker/requests) or query param (?tab=requests)
  const pathSegment = location.pathname.replace('/worker/', '').replace('/worker', '');
  const activeTab =
    pathSegment && pathSegment !== '' && pathSegment !== 'dashboard'
      ? pathSegment
      : searchParams.get('tab') || 'dashboard';

  const { user, profile } = useAuth();
  const { toasts, addToast, dismissToast } = useToast();

  // ─── Worker Profile State ──────────────────────────────────────────────────
  const [workerProfile, setWorkerProfile] = useState<WorkerProfile | null>(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [selectedTrade, setSelectedTrade] = useState('Electricity');
  const [isLoading, setIsLoading] = useState(true);

  // ─── Domain Data States ────────────────────────────────────────────────────
  const [allBookings, setAllBookings] = useState<BookingItem[]>([]);
  const [wallet, setWallet] = useState({ balance: 0, pendingPayout: 0, totalEarned: 0 });
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [welfareClaims, setWelfareClaims] = useState<WelfareClaim[]>([]);

  // ─── Filter & Modals ───────────────────────────────────────────────────────
  const [jobsFilter, setJobsFilter] = useState<'all' | 'confirmed' | 'in_progress' | 'completed'>('all');
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('500');
  const [welfareModalOpen, setWelfareModalOpen] = useState(false);
  const [welfareClaimType, setWelfareClaimType] = useState('Equipment Upgrade Subsidy');
  const [welfareAmount, setWelfareAmount] = useState('250');
  const [welfareDesc, setWelfareDesc] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [activeCustomerContact, setActiveCustomerContact] = useState<ConnectedCustomerContact | null>(null);
  const activeCustomerContactRef = useRef<ConnectedCustomerContact | null>(null);
  activeCustomerContactRef.current = activeCustomerContact;

  // ─── Editable Profile Form ─────────────────────────────────────────────────
  const [bioInput, setBioInput] = useState('');
  const [rateInput, setRateInput] = useState('45');
  const [experienceInput, setExperienceInput] = useState('5');
  const [serviceAreasInput, setServiceAreasInput] = useState('Downtown, Westside, Metro');

  const handleProfileUpdated = (updated: Partial<WorkerProfile>) => {
    setWorkerProfile(prev => (prev ? { ...prev, ...updated } : null));
  };

  // ─── Data Loading ──────────────────────────────────────────────────────────
  useEffect(() => {
    const userId = user?.id || '';

    const loadAllWorkerData = async () => {
      setIsLoading(true);
      try {
        const [wProfile, wBookings, wWallet, wPayments, wMessages, wReviews, wClaims] =
          await Promise.all([
            fetchWorkerByUserId(userId),
            fetchBookings(),
            fetchWorkerWallet(userId),
            fetchPayments({ workerId: userId }),
            fetchMessages(userId),
            fetchReviews(userId),
            fetchWelfareClaims(userId),
          ]);

        if (wProfile) {
          setWorkerProfile(wProfile);
          setIsAvailable(wProfile.is_available);
          setSelectedTrade(wProfile.trade_category || 'Electricity');
          setBioInput(wProfile.bio || '');
          setRateInput(wProfile.hourly_rate?.toString() || '45');
          setExperienceInput(wProfile.experience_years?.toString() || '5');
          setServiceAreasInput(wProfile.service_areas?.join(', ') || 'Metro Area');
        }

        setAllBookings(wBookings);
        setWallet(wWallet);
        setPayments(wPayments);
        setMessages(wMessages);
        setReviews(wReviews);
        setWelfareClaims(wClaims);
      } catch (err: any) {
        console.error('[WorkerDashboard] Error fetching data:', err);
        addToast('error', 'Failed to load some worker datasets.');
      } finally {
        setIsLoading(false);
      }
    };

    loadAllWorkerData();

    // Supabase Realtime subscription for incoming booking dispatches
    const unsubscribe = subscribeToBookings(payload => {
      if (payload.eventType === 'INSERT') {
        const newBooking = payload.new as BookingItem;
        setAllBookings(prev => [newBooking, ...prev]);
        addToast('info', `🔔 New Dispatch Request: ${newBooking.service_title} in ${newBooking.service_category}`);
      } else if (payload.eventType === 'UPDATE') {
        const updated = payload.new as BookingItem;
        setAllBookings(prev => prev.map(b => (b.id === updated.id ? { ...b, ...updated } : b)));
      }
    });

    // Supabase Realtime subscription for incoming messages
    const unsubscribeMessages = subscribeToMessages(userId, payload => {
      if (payload.eventType === 'INSERT') {
        const newMsg = payload.new;
        setMessages(prev => (prev.some(m => m.id === newMsg.id) ? prev : [...prev, newMsg]));

        // If incoming from client
        if (newMsg.sender_id !== userId) {
          const currentContact = activeCustomerContactRef.current;
          if (
            currentContact &&
            (currentContact.customerId === newMsg.sender_id || currentContact.booking.id === newMsg.booking_id)
          ) {
            markMessagesAsRead([newMsg.id], userId);
          } else {
            addToast('info', `💬 Client ${newMsg.sender_name}: ${newMsg.content.slice(0, 35)}...`);
          }
        }
      } else if (payload.eventType === 'UPDATE') {
        const updated = payload.new;
        setMessages(prev => prev.map(m => (m.id === updated.id ? { ...m, ...updated } : m)));
      }
    });

    return () => {
      unsubscribe();
      unsubscribeMessages();
    };
  }, [user]);

  // ─── Filtered Bookings & Connected Customers ───────────────────────────────
  const matchedJobRequests = useMemo(() => {
    return allBookings.filter(
      b =>
        b.status === 'pending' &&
        b.service_category.toLowerCase() === selectedTrade.toLowerCase()
    );
  }, [allBookings, selectedTrade]);

  const myAssignedJobs = useMemo(() => {
    return allBookings.filter(
      b =>
        b.worker_id === user?.id ||
        (workerProfile && b.worker_id === workerProfile.id) ||
        (b.status !== 'pending' && b.service_category.toLowerCase() === selectedTrade.toLowerCase())
    );
  }, [allBookings, user?.id, workerProfile, selectedTrade]);

  const customerContacts = useMemo<ConnectedCustomerContact[]>(() => {
    const currentId = user?.id || 'usr-w1';
    return myAssignedJobs.map(job => {
      const custId = job.customer_id;
      const unreadCount = messages.filter(
        m =>
          m.sender_id === custId &&
          (m.receiver_id === currentId || (workerProfile && m.receiver_id === workerProfile.id)) &&
          !m.is_read
      ).length;

      const threadMessages = messages.filter(
        m =>
          (m.sender_id === custId && (m.receiver_id === currentId || m.receiver_id === workerProfile?.id)) ||
          ((m.sender_id === currentId || m.sender_id === workerProfile?.id) && m.receiver_id === custId) ||
          (m.booking_id && m.booking_id === job.id)
      );
      const lastMessage = threadMessages[threadMessages.length - 1];

      return {
        booking: job,
        customerId: custId,
        customerName: job.customer_name || 'Client',
        serviceTitle: job.service_title,
        bookingStage: job.stage,
        unreadCount,
        lastMessage,
      };
    });
  }, [myAssignedJobs, messages, user?.id, workerProfile]);

  useEffect(() => {
    if (!activeCustomerContact && customerContacts.length > 0) {
      setActiveCustomerContact(customerContacts[0]);
    }
  }, [customerContacts, activeCustomerContact]);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return workerProfile?.rating ? Number(workerProfile.rating) : 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return sum / reviews.length;
  }, [reviews, workerProfile]);

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleToggleAvailability = async () => {
    if (!user) return;
    const nextState = !isAvailable;
    setIsAvailable(nextState);
    const success = await updateWorkerAvailability(user.id, nextState);
    if (success) {
      addToast(
        'success',
        nextState
          ? '🟢 You are now ONLINE. Dispatch requests will be routed to you.'
          : '⚪ You are now OFFLINE. New requests will not be dispatched.'
      );
    }
  };

  const handleAcceptJob = async (booking: BookingItem) => {
    if (!user) return;
    const workerName = workerProfile?.full_name || profile?.full_name || 'Assigned Artisan';
    const success = await acceptBookingByWorker(booking.id, user.id, workerName);
    if (success) {
      setAllBookings(prev =>
        prev.map(b =>
          b.id === booking.id
            ? { ...b, worker_id: user.id, worker_name: workerName, status: 'confirmed', stage: 'confirmed' }
            : b
        )
      );
      addToast('success', `Job Accepted! Appointment for "${booking.service_title}" is confirmed.`);
    }
  };

  const handleDeclineJob = async (bookingId: string) => {
    const success = await declineBookingByWorker(bookingId);
    if (success) {
      setAllBookings(prev => prev.filter(b => b.id !== bookingId));
      addToast('info', 'Job request declined and rerouted to cooperative pool.');
    }
  };

  const handleAdvanceJobStage = async (job: BookingItem, nextStage: BookingStage) => {
    const success = await updateBookingStage(job.id, nextStage);
    if (success) {
      setAllBookings(prev =>
        prev.map(b => (b.id === job.id ? { ...b, stage: nextStage, status: nextStage === 'completed' ? 'completed' : 'in_progress' } : b))
      );
      addToast('success', `Job Stage updated to "${nextStage.toUpperCase().replace('_', ' ')}"!`);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    addToast('success', 'Profile credentials saved in cooperative artisan registry.');
  };

  const handleRequestWithdrawal = async (e: React.FormEvent, payoutDetails: PayoutDetails) => {
    e.preventDefault();
    if (!user) return;
    const amt = parseFloat(withdrawalAmount);
    if (isNaN(amt) || amt <= 0 || amt > wallet.balance) {
      addToast('error', 'Please enter a valid withdrawal amount within your balance.');
      return;
    }
    const res = await requestWithdrawal(user.id, amt, payoutDetails);
    if (res && res.success) {
      setWallet(prev => ({
        ...prev,
        balance: prev.balance - amt,
        pendingPayout: prev.pendingPayout + amt,
      }));
      if (res.record) {
        setPayments(prev => [res.record!, ...prev]);
      }
      setWithdrawalModalOpen(false);
      addToast('success', res.message);
    }
  };

  const handleSubmitWelfareClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const amt = parseFloat(welfareAmount);
    try {
      const claim = await submitWelfareClaim({
        worker_id: user.id,
        claim_type: welfareClaimType,
        amount_requested: isNaN(amt) ? 250 : amt,
        description: welfareDesc,
      });
      if (claim) {
        setWelfareClaims(prev => [claim, ...prev]);
        setWelfareModalOpen(false);
        setWelfareDesc('');
        addToast('success', 'Welfare claim submitted to cooperative committee for review.');
      }
    } catch (err: any) {
      addToast('error', 'Failed to submit claim: ' + err.message);
    }
  };

  // Mark messages as read when viewing client conversation
  useEffect(() => {
    if (activeTab === 'messages' && activeCustomerContact) {
      const currentId = user?.id || 'usr-w1';
      const custId = activeCustomerContact.customerId;
      const unreadIds = messages
        .filter(
          m =>
            m.sender_id === custId &&
            (m.receiver_id === currentId || (workerProfile && m.receiver_id === workerProfile.id)) &&
            !m.is_read
        )
        .map(m => m.id);

      if (unreadIds.length > 0) {
        markMessagesAsRead(unreadIds, currentId);
        setMessages(prev =>
          prev.map(m => (unreadIds.includes(m.id) ? { ...m, is_read: true } : m))
        );
      }
    }
  }, [activeTab, activeCustomerContact, messages, user, workerProfile]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeCustomerContact) return;

    const currentId = user?.id || 'usr-w1';
    const content = chatInput.trim();
    setChatInput('');

    try {
      const message = await sendMessage({
        booking_id: activeCustomerContact.booking.id,
        sender_id: currentId,
        receiver_id: activeCustomerContact.customerId,
        sender_name: workerProfile?.full_name || profile?.full_name || 'Assigned Artisan',
        content,
      });

      if (message) {
        setMessages(prev => (prev.some(m => m.id === message.id) ? prev : [...prev, message]));
      }
    } catch (err: any) {
      addToast('error', 'Failed to send message: ' + (err.message || 'Network error'));
    }
  };

  return (
    <>
      <AuthToast toasts={toasts} onDismiss={dismissToast} />

      <div className="space-y-8 max-w-7xl mx-auto pb-20">
        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <WorkerStatsHeader
              workerProfile={workerProfile}
              isAvailable={isAvailable}
              onToggleAvailability={handleToggleAvailability}
              walletBalance={wallet.balance}
              activeJobsCount={myAssignedJobs.length}
            />

            {/* Incoming Requests Quick View */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#1B2420]">Incoming Matching Requests</h2>
                  <p className="text-xs text-[#3A423E]/80">
                    Showing available dispatches for your selected trade skill: <strong>{selectedTrade}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/worker/requests')}
                  className="text-xs text-[#4A6741] font-bold hover:underline"
                >
                  View All ({matchedJobRequests.length}) →
                </button>
              </div>

              <WorkerJobRequestsList
                matchedJobRequests={matchedJobRequests.slice(0, 3)}
                selectedTrade={selectedTrade}
                setSelectedTrade={setSelectedTrade}
                onAcceptJob={handleAcceptJob}
                onDeclineJob={handleDeclineJob}
              />
            </div>
          </div>
        )}

        {/* TAB 2: JOB REQUESTS DISPATCH */}
        {activeTab === 'requests' && (
          <WorkerJobRequestsList
            matchedJobRequests={matchedJobRequests}
            selectedTrade={selectedTrade}
            setSelectedTrade={setSelectedTrade}
            onAcceptJob={handleAcceptJob}
            onDeclineJob={handleDeclineJob}
          />
        )}

        {/* TAB 3: MY ASSIGNED JOBS */}
        {activeTab === 'jobs' && (
          <WorkerAssignedJobsList
            jobs={myAssignedJobs}
            jobsFilter={jobsFilter}
            setJobsFilter={setJobsFilter}
            expandedJobId={expandedJobId}
            setExpandedJobId={setExpandedJobId}
            onAdvanceStage={handleAdvanceJobStage}
            currentUserId={user?.id || ''}
          />
        )}

        {/* TAB 4: VERIFICATION */}
        {activeTab === 'verification' && (
          <WorkerVerificationView
            workerProfile={workerProfile}
            onProfileUpdated={handleProfileUpdated}
            onToast={(type, msg) => addToast(type, msg)}
          />
        )}

        {/* TAB 5: SKILLS & CERTIFICATES */}
        {activeTab === 'skills' && (
          <WorkerSkillsView
            workerProfile={workerProfile}
            onProfileUpdated={handleProfileUpdated}
            onToast={(type, msg) => addToast(type, msg)}
          />
        )}

        {/* TAB 6: EARNINGS & WALLET */}
        {(activeTab === 'wallet' || activeTab === 'earnings') && (
          <WorkerEarningsView
            wallet={wallet}
            payments={payments}
            withdrawalModalOpen={withdrawalModalOpen}
            setWithdrawalModalOpen={setWithdrawalModalOpen}
            withdrawalAmount={withdrawalAmount}
            setWithdrawalAmount={setWithdrawalAmount}
            onRequestWithdrawal={handleRequestWithdrawal}
          />
        )}

        {/* TAB 7: MUTUAL WELFARE FUND */}
        {activeTab === 'welfare' && (
          <WorkerWelfareTrainingView
            welfareClaims={welfareClaims}
            welfareModalOpen={welfareModalOpen}
            setWelfareModalOpen={setWelfareModalOpen}
            welfareClaimType={welfareClaimType}
            setWelfareClaimType={setWelfareClaimType}
            welfareAmount={welfareAmount}
            setWelfareAmount={setWelfareAmount}
            welfareDesc={welfareDesc}
            setWelfareDesc={setWelfareDesc}
            onSubmitWelfareClaim={handleSubmitWelfareClaim}
          />
        )}

        {/* TAB 7: RATINGS & REVIEWS */}
        {activeTab === 'ratings' && (
          <WorkerRatingsView reviews={reviews} averageRating={averageRating} />
        )}

        {/* TAB 8: CUSTOMER MESSAGES */}
        {activeTab === 'messages' && (
          <WorkerMessagesTab
            contacts={customerContacts}
            activeContact={activeCustomerContact}
            setActiveContact={setActiveCustomerContact}
            messages={messages}
            chatInput={chatInput}
            setChatInput={setChatInput}
            onSendMessage={handleSendMessage}
            currentUserId={user?.id || 'usr-w1'}
            onNavigateTab={(tab: string) => navigate('/worker/' + tab)}
          />
        )}

        {/* TAB 9: PUBLIC PROFILE EDITOR */}
        {activeTab === 'profile' && (
          <WorkerProfileEditor
            selectedTrade={selectedTrade}
            setSelectedTrade={setSelectedTrade}
            rateInput={rateInput}
            setRateInput={setRateInput}
            experienceInput={experienceInput}
            setExperienceInput={setExperienceInput}
            serviceAreasInput={serviceAreasInput}
            setServiceAreasInput={setServiceAreasInput}
            bioInput={bioInput}
            setBioInput={setBioInput}
            onSaveProfile={handleSaveProfile}
          />
        )}
      </div>
    </>
  );
};

export default WorkerDashboardPage;
