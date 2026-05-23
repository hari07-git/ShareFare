import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Sparkles, AlertCircle, Bot } from "lucide-react";
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
  "How do I sign up?": "Click the **Sign Up** button on the homepage and create your account using your student email.",
  "How do I verify my account?": "Upload your college ID from your **Profile** page. Admin approval usually takes a short time.",
  "How do I book a ride?": "Go to the **Find Ride** page, choose your route, click on a ride card to view details, select your seats, and click **Book Now** to send a request.",
  "How do I offer a ride?": "Open the **Offer Ride** page, enter pickup and destination details, seats available, price, and vehicle number, then publish your ride.",
  "How do ride requests work?": "When a passenger books a seat, you'll receive a request on your **Booking Requests** page. You can review their profile, safety score, and click Accept or Reject.",
  "Is ShareFare free?": "Yes! ShareFare is 100% free with **zero commission**. All fare splits happen directly between students.",
  "How does student verification work?": "We manually review student college IDs to verify active enrollment. Only verified students can search, book, or offer rides.",
  "How can I contact support?": "You can reach out to our team at **support@sharefare.edu** or visit the support page from the side menu."
};

const QUICK_ACTIONS = Object.keys(FAQ_RESPONSES);

export function SupportChatbot() {
  const { token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "bot",
      text: "Hi 👋 I can help you understand how ShareFare works.",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
        } else if (query.includes("verify") || query.includes("id") || query.includes("approval")) {
          botResponse = FAQ_RESPONSES["How do I verify my account?"];
        } else if (query.includes("book") || query.includes("passenger") || query.includes("join")) {
          botResponse = FAQ_RESPONSES["How do I book a ride?"];
        } else if (query.includes("offer") || query.includes("publish") || query.includes("driver")) {
          botResponse = FAQ_RESPONSES["How do I offer a ride?"];
        } else if (query.includes("free") || query.includes("commission") || query.includes("cost") || query.includes("money")) {
          botResponse = FAQ_RESPONSES["Is ShareFare free?"];
        } else if (query.includes("verification") || query.includes("safe") || query.includes("safety")) {
          botResponse = FAQ_RESPONSES["How does student verification work?"];
        } else if (query.includes("contact") || query.includes("support") || query.includes("help")) {
          botResponse = FAQ_RESPONSES["How can I contact support?"];
        }
      }

      const botMsg: Message = {
        id: Date.now() + 1,
        sender: "bot",
        text: botResponse,
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 900);
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    const text = inputValue;
    setInputValue("");
    handleSendMessage(text);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed z-40 h-12 w-12 rounded-full bg-gradient-to-r from-blue-600 to-indigo-650 text-white flex items-center justify-center shadow-xl hover:shadow-indigo-500/20 active:scale-95 transition-all duration-300",
          token ? "bottom-20 sm:bottom-6 md:bottom-8" : "bottom-6 md:bottom-8",
          isOpen ? "right-6 md:right-8 rotate-90 bg-slate-900" : "right-6 md:right-8"
        )}
      >
        {isOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <div className="relative">
            <MessageSquare className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
          </div>
        )}
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.4 }}
            className={cn(
              "fixed z-40 w-[calc(100vw-2.5rem)] sm:w-96 h-[440px] max-h-[70vh] rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden",
              token ? "bottom-36 sm:bottom-20 md:bottom-24" : "bottom-20 md:bottom-24",
              "right-5 sm:right-6 md:right-8"
            )}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-650 p-3.5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                  <Bot className="h-4.5 w-4.5 text-white" />
                </div>
                <div>
                  <h3 className="text-xs font-black tracking-wide uppercase">ShareFare Assistant</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[9px] font-bold text-indigo-100">Usually replies instantly</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white rounded-lg p-1 hover:bg-white/10 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/40">
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
                      "px-3 py-2.5 rounded-2xl font-semibold leading-relaxed shadow-3xs",
                      m.sender === "user"
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none"
                        : "bg-white text-slate-800 border border-slate-200/60 rounded-tl-none"
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
                  <div className="px-4 py-3 rounded-2xl bg-white border border-slate-200/60 rounded-tl-none flex items-center gap-1">
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
                  className="rounded-full bg-slate-50 hover:bg-indigo-50 border border-slate-200/80 hover:border-indigo-200 px-3 py-1 text-[10px] font-bold text-slate-650 hover:text-indigo-700 transition active:scale-95 shrink-0"
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
                className="p-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-650 text-white font-bold disabled:opacity-50 disabled:from-slate-400 disabled:to-slate-400 shadow-sm"
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
