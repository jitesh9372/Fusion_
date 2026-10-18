import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  User,
  MessageSquare,
  Check,
  CheckCheck,
  Clock,
  ShieldCheck,
  Search,
  Calendar,
  Wrench,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import type { MessageItem, WorkerProfile, BookingItem } from '@/types/marketplace';

interface CustomerMessagesTabProps {
  workers: WorkerProfile[];
  bookings?: BookingItem[];
  messages: MessageItem[];
  activeChatRecipient: WorkerProfile | null;
  setActiveChatRecipient: (worker: WorkerProfile | null) => void;
  chatInput: string;
  setChatInput: (input: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
  currentUserId: string;
  onNavigateTab?: (tab: string) => void;
}

const QUICK_PROMPTS = [
  'What is your estimated arrival time?',
  'I am currently at the premises.',
  'Gate access code is provided.',
  'Please call upon arrival.',
];

export const CustomerMessagesTab: React.FC<CustomerMessagesTabProps> = ({
  workers,
  bookings = [],
  messages,
  activeChatRecipient,
  setActiveChatRecipient,
  chatInput,
  setChatInput,
  onSendMessage,
  currentUserId,
  onNavigateTab,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Map each assigned worker to their corresponding booking(s)
  const connectedContacts = useMemo(() => {
    // Workers that are assigned to at least one booking
    return workers.map(worker => {
      const targetUserId = worker.user_id || worker.id;
      const matchingBookings = bookings.filter(
        b => b.worker_id === worker.id || (worker.user_id && b.worker_id === worker.user_id)
      );
      
      const unreadCount = messages.filter(
        m => (m.sender_id === targetUserId || m.sender_id === worker.id) &&
             m.receiver_id === currentUserId &&
             !m.is_read
      ).length;

      // Find most recent message for preview
      const threadMessages = messages.filter(
        m =>
          (m.sender_id === targetUserId || m.sender_id === worker.id ||
           m.receiver_id === targetUserId || m.receiver_id === worker.id)
      );
      const lastMessage = threadMessages[threadMessages.length - 1];

      return {
        worker,
        bookings: matchingBookings,
        unreadCount,
        lastMessage,
      };
    });
  }, [workers, bookings, messages, currentUserId]);

  // Filter contacts by search query
  const filteredContacts = useMemo(() => {
    if (!searchTerm.trim()) return connectedContacts;
    const term = searchTerm.toLowerCase();
    return connectedContacts.filter(
      c =>
        c.worker.full_name?.toLowerCase().includes(term) ||
        c.worker.trade_category?.toLowerCase().includes(term) ||
        c.bookings.some(b => b.service_title.toLowerCase().includes(term))
    );
  }, [connectedContacts, searchTerm]);

  // Messages in the active conversation
  const activeMessages = useMemo(() => {
    if (!activeChatRecipient) return [];
    const targetUserId = activeChatRecipient.user_id || activeChatRecipient.id;
    const targetWorkerId = activeChatRecipient.id;

    return messages.filter(
      m =>
        (m.sender_id === currentUserId && (m.receiver_id === targetUserId || m.receiver_id === targetWorkerId)) ||
        ((m.sender_id === targetUserId || m.sender_id === targetWorkerId) && m.receiver_id === currentUserId)
    );
  }, [messages, activeChatRecipient, currentUserId]);

  // Active booking for this chat recipient
  const activeBooking = useMemo(() => {
    if (!activeChatRecipient) return null;
    return (
      bookings.find(
        b =>
          b.worker_id === activeChatRecipient.id ||
          (activeChatRecipient.user_id && b.worker_id === activeChatRecipient.user_id)
      ) || bookings[0] || null
    );
  }, [bookings, activeChatRecipient]);

  // Auto-scroll to latest message on thread change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeMessages.length, activeChatRecipient?.id]);

  const handleQuickPromptClick = (prompt: string) => {
    setChatInput(prompt);
    inputRef.current?.focus();
  };

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups: { dateLabel: string; items: MessageItem[] }[] = [];
    activeMessages.forEach(msg => {
      const date = new Date(msg.created_at);
      const isToday = new Date().toDateString() === date.toDateString();
      const isYesterday =
        new Date(Date.now() - 86400000).toDateString() === date.toDateString();
      const dateLabel = isToday
        ? 'Today'
        : isYesterday
        ? 'Yesterday'
        : date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

      let group = groups.find(g => g.dateLabel === dateLabel);
      if (!group) {
        group = { dateLabel, items: [] };
        groups.push(group);
      }
      group.items.push(msg);
    });
    return groups;
  }, [activeMessages]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold text-[#1B2420] tracking-tight">
              Specialist Communications
            </h1>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#14524C]/10 text-[#14524C]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#14524C] animate-pulse" />
              Realtime Sync
            </span>
          </div>
          <p className="text-xs text-[#3A423E] mt-0.5">
            Direct, end-to-end messaging with technicians assigned to your active service bookings.
          </p>
        </div>
      </div>

      {/* Main Split Chat Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 rounded-3xl border border-[#D8D3C7] bg-[#FFFFFF] shadow-sm overflow-hidden min-h-[600px] h-[640px]">
        {/* Contact List Sidebar */}
        <div className="md:col-span-4 border-r border-[#D8D3C7] flex flex-col bg-[#F9FAF9]">
          {/* Sidebar Search Bar */}
          <div className="p-3.5 border-b border-[#D8D3C7] bg-[#FFFFFF]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#3A423E]/50 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search technicians or trades..."
                className="w-full pl-8 pr-3 py-2 bg-[#EEF1EE] border border-[#D8D3C7] rounded-xl text-xs text-[#1B2420] placeholder-[#3A423E]/50 focus:outline-none focus:border-[#14524C]"
              />
            </div>
          </div>

          {/* Contact Items Feed */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
            <div className="flex items-center justify-between px-2 pt-1 pb-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#3A423E]/70">
                Assigned Specialists ({connectedContacts.length})
              </span>
            </div>

            {connectedContacts.length === 0 ? (
              <div className="p-6 text-center space-y-3 my-auto">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-[#EEF1EE] flex items-center justify-center text-[#14524C]">
                  <Wrench className="w-6 h-6 opacity-60" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1B2420]">No Assigned Specialists</h4>
                  <p className="text-[11px] text-[#3A423E] mt-1 leading-relaxed">
                    Once a technician is assigned to your service booking, real-time messaging activates automatically.
                  </p>
                </div>
                {onNavigateTab && (
                  <button
                    type="button"
                    onClick={() => onNavigateTab('services')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-[#14524C] text-[#FFFFFF] hover:bg-[#0E3D38] transition-colors shadow-sm"
                  >
                    <span>Browse Services</span>
                  </button>
                )}
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="text-center py-8 text-xs text-[#3A423E]">
                No specialist matching &quot;{searchTerm}&quot;
              </div>
            ) : (
              filteredContacts.map(({ worker, bookings: workerBookings, unreadCount, lastMessage }) => {
                const isSelected =
                  activeChatRecipient?.id === worker.id ||
                  (worker.user_id && activeChatRecipient?.user_id === worker.user_id);

                return (
                  <motion.button
                    key={worker.id}
                    type="button"
                    onClick={() => setActiveChatRecipient(worker)}
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.99 }}
                    className={`w-full p-3 rounded-2xl flex items-start gap-3 text-left transition-all relative ${
                      isSelected
                        ? 'bg-[#FFFFFF] border border-[#14524C] shadow-sm'
                        : 'hover:bg-[#EEF1EE]/80 border border-transparent'
                    }`}
                  >
                    {/* Worker Initial Avatar */}
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-xl bg-[#14524C] flex items-center justify-center font-bold text-[#FFFFFF] text-sm shadow-sm">
                        {worker.full_name?.charAt(0) || 'W'}
                      </div>
                      <span className="w-2.5 h-2.5 rounded-full bg-[#4A6741] border-2 border-[#FFFFFF] absolute -bottom-0.5 -right-0.5" />
                    </div>

                    {/* Worker Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-[#1B2420] truncate">
                          {worker.full_name}
                        </h4>
                        {lastMessage && (
                          <span className="text-[9px] text-[#3A423E]/60 whitespace-nowrap">
                            {new Date(lastMessage.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-semibold text-[#14524C] truncate">
                          {worker.trade_category}
                        </span>
                        {workerBookings.length > 0 && (
                          <span className="text-[9px] text-[#3A423E]/60 truncate">
                            • {workerBookings[0].service_title.split('/')[0]}
                          </span>
                        )}
                      </div>

                      {lastMessage ? (
                        <p className="text-[10px] text-[#3A423E]/70 truncate mt-1">
                          {lastMessage.sender_id === currentUserId ? 'You: ' : ''}
                          {lastMessage.content}
                        </p>
                      ) : (
                        <p className="text-[10px] text-[#3A423E]/50 italic mt-1">
                          Ready to message
                        </p>
                      )}
                    </div>

                    {/* Unread Counter Badge */}
                    {unreadCount > 0 && (
                      <span className="shrink-0 bg-[#D68C31] text-[#FFFFFF] text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
                        {unreadCount}
                      </span>
                    )}
                  </motion.button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Conversation Thread */}
        <div className="md:col-span-8 flex flex-col justify-between bg-[#FFFFFF]">
          {activeChatRecipient ? (
            <>
              {/* Active Header */}
              <div className="p-4 px-6 border-b border-[#D8D3C7] flex items-center justify-between bg-[#FFFFFF] shadow-sm z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EEF1EE] border border-[#D8D3C7] text-[#14524C] flex items-center justify-center font-bold text-sm">
                    {activeChatRecipient.full_name?.charAt(0) || 'W'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[#1B2420]">
                        {activeChatRecipient.full_name}
                      </h3>
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#4A6741]/10 text-[#4A6741]">
                        <ShieldCheck className="w-2.5 h-2.5" />
                        Verified
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-[#3A423E] mt-0.5">
                      <span className="text-[#4A6741] font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#4A6741]" />
                        Online & Ready
                      </span>
                      {activeBooking && (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-[200px] text-[#14524C] font-medium">
                            {activeBooking.service_title}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {activeBooking && (
                  <div className="hidden sm:flex items-center gap-2 bg-[#EEF1EE] border border-[#D8D3C7] px-3 py-1.5 rounded-xl">
                    <Calendar className="w-3.5 h-3.5 text-[#14524C]" />
                    <span className="text-[10px] font-semibold text-[#1B2420]">
                      {activeBooking.scheduled_time} ({activeBooking.stage.toUpperCase()})
                    </span>
                  </div>
                )}
              </div>

              {/* Message Feed Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#FBFBFB]">
                {activeMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#EEF1EE] flex items-center justify-center text-[#14524C]">
                      <MessageSquare className="w-6 h-6 opacity-60" />
                    </div>
                    <div className="max-w-sm">
                      <h4 className="text-xs font-bold text-[#1B2420]">
                        Start Conversation with {activeChatRecipient.full_name}
                      </h4>
                      <p className="text-[11px] text-[#3A423E] mt-1">
                        Coordinate arrival instructions, access codes, or questions regarding your booking.
                      </p>
                    </div>
                  </div>
                ) : (
                  groupedMessages.map((group, gIdx) => (
                    <div key={gIdx} className="space-y-3">
                      {/* Date Divider */}
                      <div className="flex items-center justify-center my-2">
                        <span className="text-[10px] font-bold text-[#3A423E]/60 bg-[#EEF1EE] px-3 py-0.5 rounded-full border border-[#D8D3C7]/60">
                          {group.dateLabel}
                        </span>
                      </div>

                      {/* Messages within group */}
                      {group.items.map(m => {
                        const isMe = m.sender_id === currentUserId;
                        return (
                          <div
                            key={m.id}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs sm:max-w-md p-3.5 rounded-2xl text-xs shadow-sm transition-all ${
                                isMe
                                  ? 'bg-[#14524C] text-[#FFFFFF] font-medium rounded-br-sm'
                                  : 'bg-[#FFFFFF] text-[#1B2420] border border-[#D8D3C7] rounded-bl-sm'
                              }`}
                            >
                              {!isMe && (
                                <span className="block text-[10px] font-bold text-[#14524C] mb-1">
                                  {m.sender_name}
                                </span>
                              )}
                              <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>
                              <div
                                className={`flex items-center justify-end gap-1 mt-1.5 text-[9px] ${
                                  isMe ? 'text-[#FFFFFF]/70' : 'text-[#3A423E]/70'
                                }`}
                              >
                                <span>
                                  {new Date(m.created_at).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                                {isMe && (
                                  <span>
                                    {m.is_read ? (
                                      <CheckCheck className="w-3 h-3 text-[#A7F3D0]" />
                                    ) : (
                                      <Check className="w-3 h-3 opacity-70" />
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Bottom Quick Prompts & Input Bar */}
              <div className="p-4 border-t border-[#D8D3C7] bg-[#FFFFFF] space-y-3">
                {/* Quick Prompts */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  <span className="text-[10px] text-[#3A423E]/70 font-bold whitespace-nowrap pl-1">
                    Quick:
                  </span>
                  {QUICK_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleQuickPromptClick(prompt)}
                      className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-[#EEF1EE] hover:bg-[#D8D3C7]/40 text-[#1B2420] border border-[#D8D3C7] transition-all whitespace-nowrap"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                {/* Input Form */}
                <form onSubmit={onSendMessage} className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    placeholder={`Message ${activeChatRecipient.full_name}...`}
                    className="flex-1 px-4 py-3 bg-[#EEF1EE] border border-[#D8D3C7] rounded-2xl text-[#1B2420] text-xs placeholder-[#3A423E]/60 focus:outline-none focus:border-[#14524C] transition-colors"
                  />
                  <motion.button
                    type="submit"
                    disabled={!chatInput.trim()}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-5 py-3 rounded-2xl bg-[#14524C] hover:bg-[#0E3D38] disabled:opacity-40 disabled:pointer-events-none text-[#FFFFFF] font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </motion.button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-[#3A423E] p-8 space-y-3 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#EEF1EE] flex items-center justify-center text-[#14524C]">
                <User className="w-7 h-7 opacity-60" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1B2420]">Select an Assigned Specialist</h3>
                <p className="text-xs text-[#3A423E] mt-1 max-w-xs">
                  Choose a technician from your bookings on the left to start real-time messaging.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerMessagesTab;
