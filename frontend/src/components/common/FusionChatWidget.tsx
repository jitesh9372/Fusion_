import React, { useState, useRef, useEffect, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Send, 
  X, 
  Minimize2, 
  Maximize2, 
  Sparkles, 
  RotateCcw, 
  User,
  ShieldCheck,
  Zap,
  HelpCircle
} from 'lucide-react';

// Lazy load the Spline component for optimal bundle performance
const Spline = lazy(() => import('@splinetool/react-spline'));

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface FusionChatWidgetProps {
  role: 'customer' | 'worker';
  sceneUrl?: string;
}

// Error boundary specifically for Spline 3D canvas
class SplineErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { fallback: React.ReactNode; children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any) {
    console.warn('Spline 3D scene failed to load or encountered error:', error);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

const CUSTOMER_SUGGESTIONS = [
  'How do I book a verified plumber?',
  'What makes FUSION cooperative pricing better?',
  'How does the escrow payment protection work?',
  'How do I track my active service request?'
];

const WORKER_SUGGESTIONS = [
  'How do I claim direct payouts to my wallet?',
  'How do I submit verification documents?',
  'What are the zero-commission cooperative benefits?',
  'How can I get 5-star ratings on FUSION?'
];

export const FusionChatWidget: React.FC<FusionChatWidgetProps> = ({
  role,
  sceneUrl = 'https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSplineLoaded, setIsSplineLoaded] = useState(false);
  const [splineFailed, setSplineFailed] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const initialGreeting: Message = {
    id: 'welcome',
    role: 'assistant',
    content: role === 'customer'
      ? "👋 Hello! I'm your **FUSION AI Assistant** powered by Pollinations AI. How can I help you discover services, understand fair pricing, or manage bookings today?"
      : "⚡ Welcome! I'm your **FUSION Worker Copilot** powered by Pollinations AI. Need help managing your jobs, verifying credentials, or understanding your zero-commission earnings?",
    timestamp: new Date()
  };

  const [messages, setMessages] = useState<Message[]>([initialGreeting]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const systemPrompt = `You are FUSION AI, the official intelligent assistant for FUSION — a revolutionary worker-owned cooperative service marketplace.
Current User Role: ${role.toUpperCase()}
FUSION Platform Highlights:
- Customers get transparent, fair-rate home and professional services (Plumbing, Electrical, Carpentry, Cleaning, Painting, HVAC, etc.) with escrow protection.
- Workers keep 100% of their earnings with 0% platform commission, direct wallet payouts, cooperative governance, and verified badge credentials.
- Tone: Extremely helpful, concise, warm, professional, modern.
- Formatting: Use markdown bullet points and bold highlights where appropriate. Keep answers practical and directly actionable.`;

      const conversationHistory = [
        { role: 'system', content: systemPrompt },
        ...messages.filter(m => m.id !== 'welcome').slice(-6).map(m => ({
          role: m.role,
          content: m.content
        })),
        { role: 'user', content: query }
      ];

      // Pollinations AI endpoint
      const response = await fetch('https://text.pollinations.ai/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: conversationHistory,
          model: 'openai',
          seed: Math.floor(Math.random() * 100000)
        })
      });

      let aiReply = '';
      if (response.ok) {
        const text = await response.text();
        try {
          // Handle both JSON OpenAI structure or raw text fallback
          const parsed = JSON.parse(text);
          aiReply = parsed.choices?.[0]?.message?.content || parsed.text || text;
        } catch {
          aiReply = text;
        }
      } else {
        // Fallback to GET endpoint
        const fallbackRes = await fetch(`https://text.pollinations.ai/${encodeURIComponent(query)}?system=${encodeURIComponent(systemPrompt)}`);
        if (fallbackRes.ok) {
          aiReply = await fallbackRes.text();
        } else {
          throw new Error('Could not reach Pollinations AI');
        }
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiReply.trim() || "I'm here to help with all FUSION services. Could you please rephrase that?",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('AI chat error:', err);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having a brief connection issue with the AI engine. Please ask again in a moment!",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([initialGreeting]);
  };

  const suggestions = role === 'customer' ? CUSTOMER_SUGGESTIONS : WORKER_SUGGESTIONS;

  // Fallback 3D orb when Spline is loading, fails, or placeholder URL is provided
  const fallbackAvatar = (
    <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#14524C] via-[#2A756C] to-[#C97A56] p-[3px] shadow-2xl flex items-center justify-center relative overflow-hidden group">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.45),transparent_60%)] animate-pulse" />
      <div className="w-full h-full rounded-full bg-gradient-to-b from-[#14524C] to-[#0D3833] flex flex-col items-center justify-center relative z-10 transition-transform duration-300 group-hover:scale-105 shadow-inner">
        <Bot className="w-9 h-9 sm:w-10 sm:h-10 text-[#E8DCC4] drop-shadow-md animate-bounce" style={{ animationDuration: '3s' }} />
        <span className="text-[9px] font-bold tracking-wider text-[#E8DCC4] uppercase mt-0.5 opacity-90 hidden sm:block">AI Help</span>
        <span className="absolute top-2 right-2 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-[#14524C] animate-ping" />
        <span className="absolute top-2 right-2 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-[#14524C]" />
      </div>
    </div>
  );

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* CHAT POPUP WINDOW */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className={`mb-4 bg-white/95 backdrop-blur-xl border border-[#D8D3C7] shadow-2xl rounded-2xl flex flex-col overflow-hidden transition-all duration-300 ${
              isExpanded 
                ? 'w-[92vw] sm:w-[540px] h-[80vh] max-h-[720px]' 
                : 'w-[90vw] sm:w-[400px] h-[520px]'
            }`}
            style={{
              boxShadow: '0 20px 45px -10px rgba(20, 82, 76, 0.25), 0 0 0 1px rgba(20, 82, 76, 0.08)'
            }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#14524C] via-[#1B615A] to-[#25463E] text-[#EEF1EE] p-4 flex items-center justify-between border-b border-[#2D7A72]/40 relative overflow-hidden">
              {/* Background ambient light */}
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#C97A56]/30 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center space-x-3 relative z-10">
                <div className="relative">
                  <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
                    <Sparkles className="w-5 h-5 text-[#E8DCC4]" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-[#14524C]" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold tracking-tight text-white">FUSION Copilot</h3>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-white/15 text-[#E8DCC4]">
                      AI 3D
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-200/90 font-medium flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-300" /> Powered by Pollinations AI
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center space-x-1 relative z-10">
                <button
                  onClick={resetChat}
                  title="Reset conversation"
                  className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  title={isExpanded ? "Standard view" : "Expand view"}
                  className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition-colors"
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Close chat"
                  className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Role indicator bar */}
            <div className="px-4 py-1.5 bg-[#F4F6F4] border-b border-[#E5E0D8] text-[11px] text-[#4F5E58] flex items-center justify-between">
              <span className="flex items-center gap-1 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-[#14524C]" />
                {role === 'customer' ? 'Customer Support Mode' : 'Worker Partner Mode'}
              </span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online
              </span>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gradient-to-b from-[#FAFBF9] to-[#F1F4F1]/60">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-lg bg-[#14524C] text-[#E8DCC4] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-[#14524C] text-white rounded-br-none'
                        : 'bg-white text-[#1B2420] border border-[#E1DDD5] rounded-bl-none prose prose-sm prose-slate'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">
                      {msg.content}
                    </div>
                    <div
                      className={`text-[9px] mt-1.5 text-right ${
                        msg.role === 'user' ? 'text-emerald-200/80' : 'text-[#8A9791]'
                      }`}
                    >
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-lg bg-[#C97A56] text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2.5 items-center text-xs text-[#52605A]"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#14524C] text-[#E8DCC4] flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 animate-spin" style={{ animationDuration: '3s' }} />
                  </div>
                  <div className="bg-white border border-[#E1DDD5] rounded-2xl rounded-bl-none px-4 py-2.5 flex items-center space-x-1.5 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-[#14524C] animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-[#2A756C] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-[#C97A56] animate-bounce" style={{ animationDelay: '300ms' }} />
                    <span className="text-[11px] text-[#71807A] ml-2 font-medium">FUSION AI thinking...</span>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions Chips */}
            {messages.length <= 3 && !isLoading && (
              <div className="px-3 py-2 bg-white/70 border-t border-[#EAE6DF]">
                <div className="flex items-center gap-1 text-[10px] font-semibold text-[#6C7B75] mb-1.5">
                  <HelpCircle className="w-3 h-3 text-[#C97A56]" /> Suggested Questions
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {suggestions.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(item)}
                      className="text-[11px] bg-[#EEF1EE] hover:bg-[#E2E8E2] text-[#1B2420] border border-[#D5DCD5] rounded-lg px-2.5 py-1 text-left transition-all duration-150 hover:scale-[1.02] active:scale-95"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Box */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-white border-t border-[#E2DDD5] flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={role === 'customer' ? "Ask about bookings, prices, workers..." : "Ask about payouts, gigs, verification..."}
                disabled={isLoading}
                className="flex-1 text-xs bg-[#F5F7F5] border border-[#D8D3C7] rounded-xl px-3.5 py-2.5 text-[#1B2420] placeholder-[#8C9893] focus:outline-none focus:ring-2 focus:ring-[#14524C] focus:bg-white transition-all"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                  inputMessage.trim() && !isLoading
                    ? 'bg-[#14524C] text-white hover:bg-[#1B615A] shadow-md hover:scale-105 active:scale-95'
                    : 'bg-[#E5E0D8] text-[#9A958C] cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING 3D SPLINE TRIGGER BUTTON */}
      <motion.div
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className="relative group cursor-pointer flex items-center gap-3"
        onClick={() => setIsOpen(prev => !prev)}
      >
        {/* Animated Badge Pill */}
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden sm:flex items-center gap-2 bg-[#14524C]/95 backdrop-blur-md text-[#EEF1EE] text-xs font-bold px-3.5 py-2 rounded-2xl shadow-xl border border-white/20 hover:bg-[#1B615A] transition-all"
            style={{
              boxShadow: '0 8px 24px -4px rgba(20, 82, 76, 0.4)'
            }}
          >
            <Sparkles className="w-4 h-4 text-[#E8DCC4] animate-spin" style={{ animationDuration: '6s' }} />
            <span>Ask FUSION AI</span>
          </motion.div>
        )}

        {/* Outer 3D Container with Glow */}
        <div className="relative">
          {/* Multi-layer pulsating glow aura */}
          <div className="absolute -inset-2 bg-gradient-to-r from-[#14524C] via-[#2A756C] to-[#C97A56] rounded-full blur-lg opacity-75 group-hover:opacity-100 transition duration-300 animate-pulse" />
          <div className="absolute -inset-1 bg-gradient-to-tr from-[#C97A56] via-[#14524C] to-[#2A756C] rounded-full blur opacity-50" />

          {/* 3D Orb Button - 80px mobile / 96px desktop */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#14524C] border-[3px] border-white/90 shadow-2xl overflow-hidden flex items-center justify-center">
            {/* Spline Canvas */}
            {sceneUrl && !splineFailed ? (
              <SplineErrorBoundary fallback={fallbackAvatar}>
                <Suspense fallback={fallbackAvatar}>
                  <div className="w-full h-full relative pointer-events-none scale-125 flex items-center justify-center">
                    <Spline
                      scene={sceneUrl}
                      onLoad={() => setIsSplineLoaded(true)}
                      onError={() => {
                        setSplineFailed(true);
                      }}
                      style={{
                        width: '100%',
                        height: '100%',
                        opacity: isSplineLoaded ? 1 : 0.2,
                        transition: 'opacity 0.4s ease'
                      }}
                    />
                    {!isSplineLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Bot className="w-9 h-9 sm:w-10 sm:h-10 text-[#E8DCC4] animate-pulse" />
                      </div>
                    )}
                  </div>
                </Suspense>
              </SplineErrorBoundary>
            ) : (
              fallbackAvatar
            )}

            {/* Online Status Dot */}
            <div className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 w-4 h-4 bg-emerald-400 rounded-full border-2 border-[#14524C] shadow-lg" />
          </div>
        </div>

        {/* Hover Tooltip on Mobile */}
        {!isOpen && (
          <div className="sm:hidden absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-[#14524C] text-[#EEF1EE] text-xs font-semibold px-3 py-1.5 rounded-xl shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none border border-white/20 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#E8DCC4]" />
            <span>FUSION AI</span>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default FusionChatWidget;
