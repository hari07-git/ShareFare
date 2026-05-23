import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Sparkles, AlertCircle, Bot, Minus } from "lucide-react";
import { useAuth } from "../state/auth";
import { cn } from "../lib/cn";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
  id: number;
  sender: "bot" | "user";
  text: string;
  timestamp: Date;
};

const FAQ_RESPONSES: Record<string, string> = {
  "How do I sign up?": "To sign up, click **Sign up** in the top right. Enter your name, student email (preferably university domain), and set a password. Verify your email with the OTP sent to you.",
  "How do I book a ride?": "Go to the **Find Ride** page, search your route, choose a ride card to view details, select seats, and click **Book Now**. The driver will receive your request.",
  "How do I offer a ride?": "Open the **Offer Ride** page, select your vehicle, time of departure, seats, price per seat, and publish. Make sure your profile has your phone and vehicle details first!",
  "What is student verification?": "We verify active enrollment by reviewing student IDs. Go to your **Profile** page, upload your college ID, and wait for admin approval (usually in a few hours).",
  "How do I contact a driver?": "Once a driver accepts your booking, their phone contact appears on the ride details page. You can also chat directly via the Message button.",
  "Is ShareFare free?": "Yes! ShareFare is free for students with **zero platform commission**. You split the exact fuel and toll costs directly with other riders.",
  "How do ride approvals work?": "When you request a booking, the driver receives a pending notification. They can check your safety score and accept/reject. You'll get notified upon approval."
};

const QUICK_ACTIONS = Object.keys(FAQ_RESPONSES);

export function SupportChatbot() {
  const { token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const welcomeMessage = `Hi 👋 I’m ShareFare Assistant.
I can help you with:
• Creating an account
• Booking rides
• Offering rides
• Verification issues
• Profile setup
• Safety & support`;

  // Initialize messages on mount or reset
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 1,
          sender: "bot",
          text: welcomeMessage,
          timestamp: new Date()
        }
      ]);
    }
  }, [messages.length]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg: Message = {
      id: Date.now(),
      sender: "user",
      text: text.trim(),
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    // Simulate bot typing and reply
    setTimeout(() => {
      setIsTyping(false);
      let botResponse = "I'm still learning! Please choose one of the predefined questions below, or email support@sharefare.edu.";
      
      // Match query
      const query = text.toLowerCase();
      for (const question of Object.keys(FAQ_RESPONSES)) {
        if (question.toLowerCase().includes(query) || query.includes(question.toLowerCase())) {
          botResponse = FAQ_RESPONSES[question];
          break;
        }
      }

      // Check key terms if no direct match
      if (botResponse.includes("still learning")) {
        if (query.includes("sign up") || query.includes("register") || query.includes("create")) {
          botResponse = FAQ_RESPONSES["How do I sign up?"];
        } else if (query.includes("verify") || query.includes("id") || query.includes("approval") || query.includes("verification")) {
          botResponse = FAQ_RESPONSES["What is student verification?"];
        } else if (query.includes("book") || query.includes("passenger") || query.includes("join")) {
          botResponse = FAQ_RESPONSES["How do I book a ride?"];
        } else if (query.includes("offer") || query.includes("publish") || query.includes("driver")) {
          botResponse = FAQ_RESPONSES["How do I offer a ride?"];
        } else if (query.includes("free") || query.includes("commission") || query.includes("cost") || query.includes("money")) {
          botResponse = FAQ_RESPONSES["Is ShareFare free?"];
        } else if (query.includes("contact") || query.includes("driver") || query.includes("phone")) {
          botResponse = FAQ_RESPONSES["How do I contact a driver?"];
        } else if (query.includes("approve") || query.includes("accept") || query.includes("requests")) {
          botResponse = FAQ_RESPONSES["How do ride approvals work?"];
        }
      }

      const botMsg: Message = {
        id: Date.now() + 1,
        sender: "bot",
        text: botResponse,
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 850);
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    const text = inputValue;
    setInputValue("");
    handleSendMessage(text);
  };

  const handleResetChat = () => {
    setMessages([]);
    setIsOpen(false);
  };

  return (
    <>
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>

      {/* Floating Pill Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed z-40 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2 px-4 py-2.5 shadow-lg shadow-indigo-650/10 active:scale-95 transition-all duration-300 font-extrabold text-xs border border-white/10 select-none cursor-pointer animate-float",
          token ? "bottom-20 sm:bottom-6 md:bottom-8" : "bottom-6 md:bottom-8",
          "right-5 sm:right-6 md:right-8"
        )}
      >
        <div className="relative flex items-center justify-center">
          <MessageSquare className="h-4.5 w-4.5 text-white" />
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>
        <span className="hidden sm:inline tracking-tight">Chat with ShareFare</span>
        <span className="inline sm:hidden tracking-tight">Help</span>
      </button>

      {/* Chat Window Dialog */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.4 }}
            className={cn(
              "fixed z-40 w-[calc(100vw-2.5rem)] sm:w-96 h-[460px] max-h-[70vh] rounded-2xl border border-slate-200 bg-white shadow-xl flex flex-col overflow-hidden",
              token ? "bottom-36 sm:bottom-20 md:bottom-24" : "bottom-20 md:bottom-24",
              "right-5 sm:right-6 md:right-8"
            )}
          >
            {/* Header */}
            <div className="bg-indigo-900 p-3.5 text-white flex items-center justify-between shadow-sm border-b border-indigo-950">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
                  <Bot className="h-4.5 w-4.5 text-white" />
                </div>
                <div>
                  <h3 className="text-xs font-black tracking-wide uppercase">ShareFare Assistant</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[9px] font-bold text-indigo-200">Usually replies instantly</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                {/* Minimize Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  title="Minimize"
                  className="text-white/80 hover:text-white rounded-lg p-1.5 hover:bg-white/10 transition"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                {/* Reset / Close Button */}
                <button
                  onClick={handleResetChat}
                  title="Reset conversation"
                  className="text-white/80 hover:text-white rounded-lg p-1.5 hover:bg-white/10 transition"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-white">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "flex flex-col max-w-[85%] text-xs",
                    m.sender === "user" ? "ml-auto items-end" : "items-start"
                  )}
                >
                  <div
                    className={cn(
                      "px-3 py-2.5 rounded-2xl font-semibold leading-relaxed shadow-3xs whitespace-pre-line",
                      m.sender === "user"
                        ? "bg-indigo-600 text-white rounded-tr-none"
                        : "bg-slate-50 text-slate-800 border border-slate-200/50 rounded-tl-none"
                    )}
                  >
                    {/* Basic Markdown Parser for bold text */}
                    {m.text.split("**").map((part, i) =>
                      i % 2 === 1 ? <strong key={i} className="font-extrabold text-slate-950">{part}</strong> : part
                    )}
                  </div>
                  <span className="text-[8px] text-slate-400 font-bold mt-1 px-1">
                    {m.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}

              {isTyping && (
                <div className="flex flex-col items-start max-w-[85%] text-xs">
                  <div className="px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200/50 rounded-tl-none flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions Scroll Bar */}
            <div className="border-t border-slate-100 bg-white p-2 flex gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none select-none">
              {QUICK_ACTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSendMessage(q)}
                  className="rounded-full bg-slate-50 hover:bg-indigo-50 border border-slate-200/85 hover:border-indigo-250 px-3 py-1 text-[10px] font-bold text-slate-600 hover:text-indigo-700 transition active:scale-95 shrink-0"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form
              onSubmit={handleInputSubmit}
              className="border-t border-slate-150 p-2.5 bg-white flex items-center gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask assistant something..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none transition focus:border-indigo-500 focus:bg-white"
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold disabled:opacity-50 disabled:bg-slate-200 disabled:text-slate-400 shadow-sm transition"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
