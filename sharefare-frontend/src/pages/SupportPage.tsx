import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle, AlertOctagon, Mail, MessageSquare, Phone, Shield,
  Search, ArrowLeft, ChevronDown, CheckCircle, LifeBuoy
} from "lucide-react";
import { GradientButton } from "../components/GradientButton";
import { toast } from "../components/Toast";

type FAQ = {
  q: string;
  a: string;
  category: "booking" | "safety" | "payments" | "account";
};

const FAQS: FAQ[] = [
  {
    q: "How does student identity verification work?",
    a: "ShareFare is limited strictly to college students. During registration or on your Profile page, you must upload your university ID card. The admin team manually reviews and approves all uploads, validating that the details match. Once approved, you get a 'Verified Student' badge to start booking or offering rides.",
    category: "account"
  },
  {
    q: "What should I do in case of an emergency or route safety issue?",
    a: "Safety is our priority. Every active ride features a live SOS tracking system. You can trigger an instant alert from the Ride Details dashboard. It's also highly recommended to configure your emergency trust contacts under Profile Settings so they receive immediate notifications with your live location coordinates during an active trip.",
    category: "safety"
  },
  {
    q: "How are the ride-sharing costs calculated?",
    a: "ShareFare is a peer-to-peer split-cost network, not a taxi service. The price per seat is calculated based on actual trip overheads (such as estimated fuel consumption, Hyderabad toll rates, and parking split across seats). Commercial profits are strictly prohibited.",
    category: "payments"
  },
  {
    q: "Can I cancel a booked ride?",
    a: "Yes, you can cancel your booked ride at any time from your Trips/Bookings dashboard. However, to maintain high community trust, we ask that you cancel at least 1 hour before departure so that your fellow campus commuters have time to adapt. High cancellation rates may impact your Trust Score.",
    category: "booking"
  },
  {
    q: "What universities in Hyderabad are supported?",
    a: "We currently support major Hyderabad institutions including IIIT Hyderabad, JNTU, HCU, CBIT, VNR VJIET, and neighboring college campuses. Simply enter your college name when registering your home addresses or routes.",
    category: "account"
  }
];

export function SupportPage() {
  const [activeCategory, setActiveCategory] = useState<"all" | "booking" | "safety" | "payments" | "account">("all");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  // Contact Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [tickets, setTickets] = useState<Array<{ id: number; subject: string; date: string }>>([]);

  const filteredFaqs = FAQS.filter(faq => {
    const matchesCat = activeCategory === "all" || faq.category === activeCategory;
    const matchesSearch = faq.q.toLowerCase().includes(search.toLowerCase()) ||
                          faq.a.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      const newTicket = {
        id: Math.round(Math.random() * 100000),
        subject,
        date: new Date().toLocaleDateString()
      };
      setTickets(prev => [newTicket, ...prev]);
      toast("Support ticket submitted! We will respond shortly.", "success");
      setSubject("");
      setMessage("");
      setSubmitting(false);
    }, 1200);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Navigation Header */}
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-600 via-violet-600 to-cyan-500 p-6 text-white shadow-xl md:p-10 mb-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
              <LifeBuoy className="h-3.5 w-3.5 text-emerald-300" /> ShareFare Support Center
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Help & Support</h1>
            <p className="max-w-xl text-sm leading-relaxed text-white/80">
              Need assistance with student verification, ride routes, or split fares? Search our FAQs or open an instant support ticket.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 backdrop-blur ring-1 ring-white/20">
              <HelpCircle className="h-10 w-10 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Side: FAQs and Categories */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2.5">
              <HelpCircle className="h-5 w-5 text-indigo-500" /> Frequently Asked Questions
            </h2>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search FAQs..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>

            {/* Category Filter Chips */}
            <div className="flex flex-wrap gap-2 pt-1">
              {(["all", "booking", "safety", "payments", "account"] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => { setActiveCategory(cat); setExpandedFaq(null); }}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                    activeCategory === cat
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* FAQs Accordion */}
          <div className="space-y-3">
            {filteredFaqs.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 text-sm">
                No FAQs matched your search. Try other keywords or submit a custom help desk ticket on the right.
              </div>
            ) : (
              filteredFaqs.map((faq, index) => {
                const isExpanded = expandedFaq === index;
                return (
                  <div
                    key={faq.q}
                    className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm transition hover:shadow"
                  >
                    <button
                      onClick={() => setExpandedFaq(isExpanded ? null : index)}
                      className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-semibold text-slate-800 hover:text-slate-950"
                    >
                      <span className="text-sm">{faq.q}</span>
                      <ChevronDown className={`h-4 w-4 text-slate-400 shrink-0 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                        >
                          <div className="px-5 pb-5 pt-1 text-sm leading-relaxed text-slate-600 border-t border-slate-50 bg-slate-50/50">
                            {faq.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>

          {/* Campus Safety Center */}
          <div className="rounded-3xl border border-rose-100 bg-rose-50/50 p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-rose-100 text-rose-600 shadow-sm">
                <AlertOctagon className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-rose-950">24/7 Campus Emergency SOS</h3>
                <p className="text-sm leading-relaxed text-rose-800">
                  Are you in active transit and feeling unsafe? Every active ride features an integrated emergency SOS system. Use the SOS button on the map tracking screen to trigger immediate automated safety notifications to your trusted emergency contacts and campus administrative support.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700">
                    <Shield className="h-3.5 w-3.5" /> Direct Campus Security Assistance
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Help Ticket Form */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-950 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-indigo-500" /> Open a Ticket
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Submit your query. Our Hyderabad help desk team responds within 2 hours.
              </p>
            </div>

            <form onSubmit={handleTicketSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="Student name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">University Email</label>
                <input
                  type="email"
                  required
                  placeholder="name@college.edu.in"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ID verification issue"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Details</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Explain your problem clearly..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 resize-none"
                />
              </div>

              <GradientButton type="submit" disabled={submitting} className="w-full">
                {submitting ? "Submitting..." : "Submit ticket"}
              </GradientButton>
            </form>
          </div>

          {/* Quick Contact Cards */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Quick Contacts</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <Mail className="w-4 h-4 text-indigo-500 shrink-0" />
                <div className="min-w-0">
                  <div className="font-semibold text-slate-950">Email Help desk</div>
                  <div className="text-xs text-slate-500 truncate">sharefaree@gmail.com</div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <Phone className="w-4 h-4 text-indigo-500 shrink-0" />
                <div>
                  <div className="font-semibold text-slate-950">Campus SOS Support</div>
                  <div className="text-xs text-slate-500">+91 40-23000000</div>
                </div>
              </div>
            </div>
          </div>

          {/* Active Tickets List */}
          {tickets.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Your Open Tickets</h3>
              <div className="space-y-2">
                {tickets.map(ticket => (
                  <div key={ticket.id} className="rounded-xl border border-slate-100 bg-emerald-50/30 p-3 flex items-start gap-2.5">
                    <CheckCircle className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-slate-900 truncate max-w-[180px]">{ticket.subject}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">ID: #{ticket.id} • {ticket.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
