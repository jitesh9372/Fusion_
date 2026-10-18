import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Send,
  User,
  MessageSquare,
  Check,
  CheckCheck,
  Clock,
  Briefcase,
  Search,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import type { MessageItem, BookingItem } from '@/types/marketplace';

export interface ConnectedCustomerContact {
  booking: BookingItem;
  customerId: string;
  customerName: string;
  serviceTitle: string;
  bookingStage: string;
  unreadCount: number;
  lastMessage?: MessageItem;
}

interface WorkerMessagesTabProps {
  contacts: ConnectedCustomerContact[];
  activeContact: ConnectedCustomerContact | null;
  setActiveContact: (contact: ConnectedCustomerContact | null) => void;
  messages: MessageItem[];
  chatInput: string;
  setChatInput: (input: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
  currentUserId: string;
  onNavigateTab?: (tab: string) => void;
}

const WORKER_QUICK_RESPONSES = [
  'ETA is approximately 15 minutes.',
  'Arrived at the premises. Beginning now.',
  'Diagnostic inspection in progress.',
  'Job completed. Please verify the work.',
];

export const WorkerMessagesTab: React.FC<WorkerMessagesTabProps> = ({
  contacts,
  activeContact,
  setActiveContact,
  messages,
  chatInput,
  setChatInput,
  onSendMessage,
  currentUserId,
  onNavigateTab,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter contacts by search query
  const filteredContacts = useMemo(() => {
    if (!searchTerm.trim()) return contacts;
    const term = searchTerm.toLowerCase();
    return contacts.filter(
      c =>
        c.customerName.toLowerCase().includes(term) ||
        c.serviceTitle.toLowerCase().includes(term) ||
        c.bookingStage.toLowerCase().includes(term)
    );
  }, [contacts, searchTerm]);

  // Messages in the active conversation
  const activeMessages = useMemo(() => {
    if (!activeContact) return [];
    const custId = activeContact.customerId;

    return messages.filter(
      m =>
        (m.sender_id === currentUserId && m.receiver_id === custId) ||
        (m.sender_id === custId && m.receiver_id === currentUserId) ||
        (m.booking_id && m.booking_id === activeContact.booking.id)
    );
  }, [messages, activeContact, currentUserId]);

  // Auto-scroll on new message or conversation switch
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages.length, activeContact?.booking.id]);

  const handleQuickResponse = (text: string) => {
    setChatInput(text);
    inputRef.current?.focus();
  };

  // Group active messages by date
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
      <div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-2xl sm:text-3xl font-black text-[#1B2420]">Customer Communications</h1>
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#4A6741]/10 text-[#4A6741] border border-[#4A6741]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4A6741] animate-pulse" />
            Live Dispatch Sync
          </span>
        </div>
        <p className="text-xs text-[#3A423E]/80 mt-0.5">
          Coordinate arrival times, premises access, and job specifics with clients from your assigned jobs.
        </p>
      </div>

      {/* Main Split Chat Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 rounded-3xl border border-[#D8D3C7] bg-[#FFFFFF] shadow-sm overflow-hidden min-h-[600px] h-[640px]">
        {/* Left Sidebar: Customer Conversations */}
        <div className="md:col-span-4 border-r border-[#D8D3C7] flex flex-col bg-[#F4F6F4]">
          {/* Search Box */}
          <div className="p-3.5 border-b border-[#D8D3C7] bg-[#FFFFFF]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#3A423E]/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search clients or jobs..."
                className="w-full pl-8 pr-3 py-2 bg-[#EEF1EE] border border-[#D8D3C7] rounded-xl text-xs text-[#1B2420] placeholder-[#3A423E]/50 focus:outline-none focus:ring-1 focus:ring-[#4A6741] transition-colors"
              />
            </div>
          </div>

          {/* Client Contacts List */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
            <div className="flex items-center justify-between px-2 pt-1 pb-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#3A423E]/70">
                Assigned Clients ({contacts.length})
              </span>
            </div>

            {contacts.length === 0 ? (
              <div className="p-6 text-center space-y-3 my-auto">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-[#EEF1EE] border border-[#D8D3C7] flex items-center justify-center text-[#4A6741]">
                  <Briefcase className="w-6 h-6 opacity-70" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1B2420]">No Assigned Clients</h4>
                  <p className="text-[11px] text-[#3A423E]/70 mt-1 leading-relaxed">
                    Accept job requests from the Requests tab to start direct client messaging.
                  </p>
                </div>
                {onNavigateTab && (
                  <button
                    type="button"
                    onClick={() => onNavigateTab('requests')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-[#4A6741] text-white hover:bg-[#3d5635] transition-colors shadow-sm"
                  >
                    <span>View Requests</span>
                  </button>
                )}
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="text-center py-8 text-xs text-[#3A423E]/60">
                No clients match &quot;{searchTerm}&quot;
              </div>
            ) : (
              filteredContacts.map(contact => {
                const isSelected = activeContact?.booking.id === contact.booking.id;

                return (
                  <motion.button
                    key={contact.booking.id}
                    type="button"
                    onClick={() => setActiveContact(contact)}
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.99 }}
                    className={`w-full p-3 rounded-2xl flex items-start gap-3 text-left transition-all relative ${
                      isSelected
                        ? 'bg-[#4A6741]/15 border border-[#4A6741]/30 shadow-sm'
                        : 'hover:bg-[#EEF1EE] border border-transparent'
                    }`}
                  >
                    {/* Customer Avatar */}
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-xl bg-[#4A6741] flex items-center justify-center font-bold text-white text-sm shadow-sm">
                        {contact.customerName.charAt(0).toUpperCase()}
                      </div>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white absolute -bottom-0.5 -right-0.5" />
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-[#1B2420] truncate">
                          {contact.customerName}
                        </h4>
                        {contact.lastMessage && (
                          <span className="text-[9px] text-[#3A423E]/60 whitespace-nowrap">
                            {new Date(contact.lastMessage.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-[#4A6741] font-medium truncate">
                          {contact.serviceTitle.split('/')[0]}
                        </span>
                        <span className="text-[8px] uppercase tracking-wider px-1.5 py-0.2 rounded bg-[#EEF1EE] text-[#3A423E]/80 font-semibold border border-[#D8D3C7]/60">
                          {contact.bookingStage}
                        </span>
                      </div>

                      {contact.lastMessage ? (
                        <p className="text-[10px] text-[#3A423E]/80 truncate mt-1">
                          {contact.lastMessage.sender_id === currentUserId ? 'You: ' : ''}
                          {contact.lastMessage.content}
                        </p>
                      ) : (
                        <p className="text-[10px] text-[#3A423E]/60 italic mt-1">
                          Ready to message
                        </p>
                      )}
                    </div>

                    {/* Unread Counter Badge */}
                    {contact.unreadCount > 0 && (
                      <span className="shrink-0 bg-[#4A6741] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
                        {contact.unreadCount}
                      </span>
                    )}
                  </motion.button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Chat Conversation Area */}
        <div className="md:col-span-8 flex flex-col justify-between bg-[#FFFFFF]">
          {activeContact ? (
            <>
              {/* Active Conversation Header */}
              <div className="p-4 px-6 border-b border-[#D8D3C7] flex items-center justify-between bg-[#FFFFFF] shadow-sm z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#4A6741] flex items-center justify-center font-bold text-white text-sm shadow-sm">
                    {activeContact.customerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1B2420] flex items-center gap-2">
                      <span>{activeContact.customerName}</span>
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#4A6741]/10 text-[#4A6741] font-bold border border-[#4A6741]/20">
                        Client
                      </span>
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] text-[#3A423E]/70 mt-0.5">
                      <span className="text-[#4A6741] font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#4A6741]" />
                        Connected
                      </span>
                      <span>•</span>
                      <span className="text-[#1B2420] font-medium truncate max-w-[220px]">
                        {activeContact.serviceTitle}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-2 bg-[#EEF1EE] border border-[#D8D3C7] px-3 py-1.5 rounded-xl">
                  <Clock className="w-3.5 h-3.5 text-[#4A6741]" />
                  <span className="text-[10px] font-bold text-[#1B2420] uppercase">
                    Stage: {activeContact.bookingStage.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#FFFFFF]">
                {activeMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#EEF1EE] border border-[#D8D3C7] flex items-center justify-center text-[#4A6741]">
                      <MessageSquare className="w-6 h-6 opacity-70" />
                    </div>
                    <div className="max-w-sm">
                      <h4 className="text-xs font-bold text-[#1B2420]">
                        Coordinate with {activeContact.customerName}
                      </h4>
                      <p className="text-[11px] text-[#3A423E]/70 mt-1">
                        Send arrival estimates, confirm site readiness, or share real-time service updates.
                      </p>
                    </div>
                  </div>
                ) : (
                  groupedMessages.map((group, gIdx) => (
                    <div key={gIdx} className="space-y-3">
                      {/* Date Divider */}
                      <div className="flex items-center justify-center my-2">
                        <span className="text-[10px] font-bold text-[#3A423E]/70 bg-[#EEF1EE] px-3 py-0.5 rounded-full border border-[#D8D3C7]">
                          {group.dateLabel}
                        </span>
                      </div>

                      {/* Messages */}
                      {group.items.map(m => {
                        const isMe = m.sender_id === currentUserId;
                        return (
                          <div
                            key={m.id}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs sm:max-w-md p-3.5 rounded-2xl text-xs transition-all ${
                                isMe
                                  ? 'bg-[#4A6741] text-white font-medium rounded-br-sm shadow-sm'
                                  : 'bg-[#EEF1EE] text-[#1B2420] border border-[#D8D3C7]/70 rounded-bl-sm'
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
                                  isMe ? 'text-white/80' : 'text-[#3A423E]/60'
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
                                      <CheckCheck className="w-3 h-3 text-white" />
                                    ) : (
                                      <Check className="w-3 h-3 opacity-70 text-white" />
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

              {/* Quick Responses & Input */}
              <div className="p-4 border-t border-[#D8D3C7] bg-[#FFFFFF] space-y-3">
                {/* Quick Prompts */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  <span className="text-[10px] text-[#3A423E]/70 font-bold whitespace-nowrap pl-1">
                    Quick:
                  </span>
                  {WORKER_QUICK_RESPONSES.map((prompt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleQuickResponse(prompt)}
                      className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-[#EEF1EE] hover:bg-[#E2E6E2] text-[#1B2420] border border-[#D8D3C7] transition-all whitespace-nowrap"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                {/* Input Bar */}
                <form onSubmit={onSendMessage} className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    placeholder={`Reply to ${activeContact.customerName}...`}
                    className="flex-1 px-4 py-3 bg-[#EEF1EE] border border-[#D8D3C7] rounded-2xl text-[#1B2420] text-xs placeholder-[#3A423E]/50 focus:outline-none focus:ring-1 focus:ring-[#4A6741] transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim()}
                    className="px-5 py-3 rounded-2xl bg-[#4A6741] hover:bg-[#3d5635] disabled:opacity-40 disabled:pointer-events-none text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-[#3A423E]/60 p-8 space-y-3 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#EEF1EE] border border-[#D8D3C7] flex items-center justify-center text-[#4A6741]">
                <User className="w-7 h-7 opacity-70" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1B2420]">Select a Client Conversation</h3>
                <p className="text-xs text-[#3A423E]/70 mt-1 max-w-xs">
                  Select an assigned client from the left to coordinate on job specifics and arrival updates.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkerMessagesTab;
