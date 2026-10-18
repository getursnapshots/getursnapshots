import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, CheckCheck } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  name?: string;
  text: string;
  time: string;
  customUrl?: string;
}

interface FloatingWhatsAppProps {
  onOpenBooking?: () => void;
}

// Authentic WhatsApp Phone-in-Bubble SVG Icon
export const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

const getFormattedTime = () => {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
};

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [unreadBadge, setUnreadBadge] = useState(1);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatInputRef = useRef<HTMLInputElement | null>(null);
  const autoReplyTimerRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const firstUserMessageSentRef = useRef<boolean>(false);
  const hasReceivedReplyRef = useRef<boolean>(false);
  const latestWhatsappUrlRef = useRef<string>('');
  const isOpenRef = useRef<boolean>(isOpen);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (autoReplyTimerRef.current) clearTimeout(autoReplyTimerRef.current);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, []);

  // Exact theme, sender name "Snap Shots", message and time matching reference template
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'bot',
      name: 'Snap Shots',
      text: 'Hello there! 👋\nHow can we help you?',
      time: '13:23',
    },
  ]);

  // Mobile: Automatically pop up after 1.5s as requested
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile && !hasAutoOpened) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        setHasAutoOpened(true);
        setUnreadBadge(0);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [hasAutoOpened]);

  // Scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  // Focus input when opened on desktop
  useEffect(() => {
    if (isOpen) {
      setUnreadBadge(0);
      if (window.innerWidth >= 768) {
        setTimeout(() => chatInputRef.current?.focus(), 250);
      }
    }
  }, [isOpen]);

  const toggleChat = useCallback((e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setIsOpen((prev) => !prev);
    setUnreadBadge(0);
  }, []);

  // Universal helper to redirect to WhatsApp with user text
  const redirectToWhatsApp = useCallback((text: string) => {
    const cleanPhone = siteConfig.business.whatsapp.replace(/[^0-9]/g, '') || '919014319818';
    const whatsappUrl = `https://api.whatsapp.com/send/?phone=${cleanPhone}&text=${encodeURIComponent(text)}&type=phone_number&app_absent=0`;

    try {
      const link = document.createElement('a');
      link.href = whatsappUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }

    return whatsappUrl;
  }, []);

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      time: getFormattedTime(),
    };

    setInputValue('');

    // Trigger redirect to WhatsApp with user's message
    const targetUrl = redirectToWhatsApp(text);
    latestWhatsappUrlRef.current = targetUrl;

    // Append user message to in-site chat stream
    setMessages((prev) => [...prev, userMsg]);

    // Send automated "We'll be with you shortly!" if no reply within 10s of first message
    if (!firstUserMessageSentRef.current) {
      firstUserMessageSentRef.current = true;

      // Subtle WhatsApp typing indicator at 8.5s before response
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        if (!hasReceivedReplyRef.current) {
          setIsTyping(true);
        }
      }, 8500);

      if (autoReplyTimerRef.current) clearTimeout(autoReplyTimerRef.current);
      autoReplyTimerRef.current = setTimeout(() => {
        setIsTyping(false);
        if (!hasReceivedReplyRef.current) {
          hasReceivedReplyRef.current = true;
          setMessages((prev) => [
            ...prev,
            {
              id: `bot-shortly-${Date.now()}`,
              sender: 'bot',
              name: 'Snap Shots',
              text: "We'll be with you shortly!",
              time: getFormattedTime(),
              customUrl: latestWhatsappUrlRef.current || undefined,
            },
          ]);

          // Notify user if chat is currently closed
          if (!isOpenRef.current) {
            setUnreadBadge((prev) => (prev > 0 ? prev + 1 : 1));
          }
        }
      }, 10000);
    }
  };

  return (
    <div
      className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-50 flex flex-col items-end gap-2 pb-[env(safe-area-inset-bottom,0px)]"
      id="floating-whatsapp-container"
    >
      {/* WhatsApp In-Site Chat Popup Box - Decreased Height */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="WhatsApp live chat widget"
          className="w-[calc(100vw-32px)] max-w-[240px] sm:max-w-[255px] h-[210px] sm:h-[225px] rounded-xl overflow-hidden shadow-[0_12px_36px_rgba(0,0,0,0.5)] border border-black/10 bg-[#e5ddd5] flex flex-col animate-in fade-in zoom-in-95 duration-200"
          style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          }}
        >
          {/* Header - Compact Dark Teal Green (#075E54) with "Snap Shots" */}
          <div className="bg-[#075E54] px-2.5 py-1.5 text-white flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-1.5">
              {/* Profile Avatar with Online Green Dot */}
              <div className="relative">
                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center p-0.5 shadow-xs">
                  {/* Brand Icon for Snap Shots */}
                  <div className="w-5 h-5 rounded-full bg-[#bd1616] flex items-center justify-center text-white font-black text-[9px] tracking-tight">
                    SS
                  </div>
                </div>
                {/* Active Online Green Dot */}
                <span className="absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full bg-[#25D366] border border-[#075E54]" />
              </div>

              {/* Title & Subtitle */}
              <div>
                <h3 className="font-bold text-[12px] leading-tight text-white tracking-tight">
                  Snap Shots
                </h3>
                <p className="text-[9.5px] text-emerald-100 font-normal leading-tight opacity-90">
                  Instant Content Creation
                </p>
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={toggleChat}
              aria-label="Close Chat"
              className="text-emerald-100 hover:text-white hover:bg-white/10 rounded-full p-0.5 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Chat Messages Body - Compact WhatsApp Wallpaper */}
          <div
            className="flex-1 overflow-y-auto p-2 space-y-1 relative"
            style={{
              backgroundColor: '#e5ddd5',
              backgroundImage: `radial-gradient(circle, #000000 0.75px, transparent 0.75px)`,
              backgroundSize: '14px 14px',
              backgroundPosition: '0 0',
              opacity: 0.98,
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                {/* WhatsApp Speech Bubble */}
                <div
                  className={`max-w-[90%] rounded-lg p-1.5 shadow-xs relative text-left ${
                    msg.sender === 'user'
                      ? 'bg-[#d9fdd3] text-[#111b21] rounded-tr-none'
                      : 'bg-white text-[#111b21] rounded-tl-none'
                  }`}
                >
                  {/* Subtle WhatsApp Tail on top-left of bot bubble */}
                  {msg.sender === 'bot' && (
                    <span
                      className="absolute -left-1 top-0 w-0 h-0 border-t-4 border-t-white border-l-4 border-l-transparent"
                      aria-hidden="true"
                    />
                  )}

                  {/* Sender Name in Bubble: Snap Shots */}
                  {msg.name && (
                    <div className="text-[10px] font-bold text-[#111b21] mb-0.5">
                      {msg.name}
                    </div>
                  )}

                  {/* Message Body */}
                  <div className="text-[11.5px] leading-snug whitespace-pre-line text-[#111b21] font-normal">
                    {msg.text}
                  </div>

                  {/* Optional click fallback if redirect was blocked */}
                  {msg.customUrl && (
                    <a
                      href={msg.customUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-0.5 text-[9.5px] text-[#075E54] font-bold underline"
                    >
                      Click here to open WhatsApp ↗
                    </a>
                  )}

                  {/* Time and Status Checkmarks */}
                  <div className="flex items-center justify-end gap-1 mt-0.5 text-[8.5px] text-[#8696a0]">
                    <span>{msg.time}</span>
                    {msg.sender === 'user' && (
                      <CheckCheck className="w-3 h-3 text-[#53bdeb]" />
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* WhatsApp Typing Bubble Indicator */}
            {isTyping && (
              <div className="flex flex-col items-start animate-in fade-in duration-150">
                <div className="bg-white text-[#111b21] rounded-lg rounded-tl-none p-1.5 shadow-xs relative text-left">
                  <span
                    className="absolute -left-1 top-0 w-0 h-0 border-t-4 border-t-white border-l-4 border-l-transparent"
                    aria-hidden="true"
                  />
                  <div className="flex items-center gap-1.5 text-[10px] text-[#8696a0]">
                    <span className="font-bold text-[#111b21]">Snap Shots</span>
                    <span className="text-[#075E54] italic">typing</span>
                    <span className="inline-flex gap-0.5 ml-0.5">
                      <span className="w-1 h-1 bg-[#8696a0] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1 h-1 bg-[#8696a0] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1 h-1 bg-[#8696a0] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Area - Compact White Background */}
          <div className="p-1.5 bg-white flex items-center gap-1 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex-1 flex items-center"
            >
              <input
                ref={chatInputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type a message.."
                className="w-full bg-transparent text-[11.5px] text-[#111b21] placeholder:text-[#8696a0] focus:outline-none px-1"
              />
            </form>

            {/* Vibrant Green Circular Send Button */}
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim()}
              aria-label="Send Message to WhatsApp"
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                inputValue.trim()
                  ? 'bg-[#25D366] text-white hover:bg-[#20ba5a] shadow-sm hover:scale-105 active:scale-95'
                  : 'bg-[#25D366]/60 text-white cursor-pointer hover:bg-[#25D366]'
              }`}
            >
              <Send className="w-2.5 h-2.5 ml-0.5 fill-white text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Button - Decreased Compact Dimensions */}
      <a
        href="#whatsapp-chat"
        role="button"
        onClick={toggleChat}
        aria-label="Open WhatsApp Chat"
        className="relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-[#25D366] hover:bg-[#20ba5a] active:bg-[#1caa52] text-white shadow-[0_4px_18px_rgba(37,211,102,0.4)] hover:shadow-[0_6px_22px_rgba(37,211,102,0.55)] hover:scale-110 active:scale-95 transition-all duration-300 ring-2 ring-white/20 cursor-pointer"
        id="floating-whatsapp-btn"
      >
        {/* Unread Message Notification Badge */}
        {!isOpen && unreadBadge > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#bd1616] text-[9px] font-bold text-white shadow-md animate-pulse">
            {unreadBadge}
          </span>
        )}

        {/* Floating WhatsApp Icon */}
        <WhatsAppIcon className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-white relative z-10 drop-shadow-sm" />
      </a>
    </div>
  );
};
