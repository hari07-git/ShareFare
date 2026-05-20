import { useEffect, useState, useRef } from "react";
import { api } from "../lib/api";
import { useAuth } from "../state/auth";
import { X, Send } from "lucide-react";
import { Button } from "./Button";
import { Input } from "./Input";

export type ChatMessage = {
  id: number;
  senderId: number;
  senderName: string;
  content: string;
  createdAt: string;
};

type ChatModalProps = {
  bookingId: number;
  onClose: () => void;
};

export function ChatModal({ bookingId, onClose }: ChatModalProps) {
  const { me } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function loadMessages() {
    try {
      const res = await api.get<ChatMessage[]>(`/api/bookings/${bookingId}/messages`);
      setMessages(res.data);
    } catch (e) {
      console.error("Failed to load messages", e);
    }
  }

  useEffect(() => {
    void loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || sending) return;

    setSending(true);
    try {
      const res = await api.post<ChatMessage>(`/api/bookings/${bookingId}/messages`, { content: text });
      setMessages((prev) => [...prev, res.data]);
      setText("");
    } catch (e) {
      console.error("Failed to send message", e);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md h-[600px] max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-indigo-50/50">
          <h3 className="text-lg font-semibold text-indigo-900">Ride Chat</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="text-center text-slate-500 mt-10 text-sm">
              No messages yet. Send a message to start the conversation!
            </div>
          ) : (
            messages.map((m) => {
              const isMe = m.senderId === me?.id;
              return (
                <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] text-slate-400 mb-1 ml-1 font-medium">{isMe ? "You" : m.senderName}</span>
                  <div className={`px-4 py-2.5 rounded-2xl max-w-[80%] text-sm ${
                    isMe 
                      ? 'bg-indigo-600 text-white rounded-tr-sm' 
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'
                  }`}>
                    {m.content}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="p-4 border-t border-slate-100 bg-white flex gap-2 items-center">
          <Input 
            value={text} 
            onChange={(e) => setText(e.target.value)} 
            placeholder="Type a message..." 
            className="flex-1 rounded-full px-4"
            autoFocus
          />
          <Button type="submit" disabled={!text.trim() || sending} className="rounded-full w-10 h-10 p-0 flex items-center justify-center shrink-0">
            <Send className="w-4 h-4 ml-0.5 mt-0.5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
