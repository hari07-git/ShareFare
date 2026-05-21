import { motion } from "framer-motion";
import { ShieldCheck, Eye, ArrowLeft, Lock } from "lucide-react";
import { Link } from "react-router-dom";

export function PrivacyPage() {
  const sections = [
    {
      title: "1. Information We Collect",
      content: "To support a trusted network, we collect registration info (full name, phone, password), academic info (college email or ID photo for verification), and ride parameters (pickup, drop-off, timing, ride costs). We also read optional profile data like gender and travel preferences."
    },
    {
      title: "2. Real-Time Location Sharing",
      content: "For live tracking and safety coordination, we access your device's geographical coordinates during active rides. This information is shared with verified co-travelers booked on the same trip and stored securely in our database for audit logs. We do not track your background location when the app is inactive."
    },
    {
      title: "3. How We Use Student Data",
      content: "Your data is used solely to run the platform: matching ride partners, verifying student status, building trust scores, calculating routes and ETAs, and executing SOS safety notifications in emergency cases."
    },
    {
      title: "4. Peer Data Visibility",
      content: "To safeguard student privacy, phone numbers are kept confidential until a ride booking is officially confirmed by both parties. Other students can only see your public profile parameters (full name, university, trust badges, travel preferences, and rating averages)."
    },
    {
      title: "5. Data Protection & Security",
      content: "We implement modern encryption (SSL/TLS) for data in transit and safe database hashing protocols. ID card upload documents are purged from primary servers once manually verified and approved by the ShareFare admin team."
    },
    {
      title: "6. Your Privacy Rights",
      content: "You maintain full control of your account. You can view, modify, or completely delete your personal information directly within your profile preferences, or request full account erasure by emailing our support desk."
    }
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Back to Home Navigation */}
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
      </div>

      {/* Premium Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-600 via-violet-600 to-cyan-500 p-6 text-white shadow-xl md:p-10 mb-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" /> Fully Encrypted
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Privacy Policy</h1>
            <p className="max-w-xl text-sm leading-relaxed text-white/80">
              Your trust is our highest priority. Learn how we handle, protect, and respect your personal student details and safety coordinates.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 backdrop-blur ring-1 ring-white/20">
              <Eye className="h-10 w-10 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Content Sections */}
      <div className="space-y-6">
        {sections.map((sec, idx) => (
          <motion.div
            key={sec.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition duration-300"
          >
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2.5 mb-3">
              <Lock className="h-5 w-5 text-indigo-500 shrink-0" />
              {sec.title}
            </h2>
            <p className="text-sm leading-relaxed text-slate-600">
              {sec.content}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="mt-10 rounded-2xl border border-dashed border-slate-200 p-5 text-center text-xs text-slate-500">
        Last updated: May 21, 2026. For questions regarding our Privacy Policy, please contact support at{" "}
        <span className="font-semibold text-slate-700">sharefaree@gmail.com</span>.
      </div>
    </div>
  );
}
