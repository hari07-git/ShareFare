import { motion } from "framer-motion";
import { ShieldCheck, FileText, ArrowLeft, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

export function TermsPage() {
  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: "By creating an account or using the ShareFare platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not access or use the application. These terms constitute a legally binding agreement between you and ShareFare."
    },
    {
      title: "2. Student Eligibility & Verification",
      content: "ShareFare is strictly limited to active college students in Hyderabad, India. To offer or book rides, you must successfully verify your identity using a valid university email address or student ID card. You agree to provide accurate, current, and complete registration information."
    },
    {
      title: "3. Campus Ride-Sharing & Fare Splitting",
      content: "ShareFare is a cost-sharing platform designed to facilitate carpooling and bike-sharing for students. Drivers may only charge co-travelers a reasonable split of actual trip expenses (fuel, toll, parking). Charging fares for commercial profit or operating as a public transport taxi service is strictly prohibited."
    },
    {
      title: "4. Code of Conduct & Safety",
      content: "Every student must maintain respectful, clean, and safe conduct during rides. Zero tolerance is enforced for harassment, reckless driving, substance use, or discrimination. Any safety concerns should be reported immediately using the emergency SOS or safety reporting features."
    },
    {
      title: "5. Limitation of Liability",
      content: "ShareFare provides a peer-to-peer connection platform and is not a transport provider. We do not employ drivers or own vehicles. While we verify student identities, co-travelers assume all inherent risks associated with shared road transit. ShareFare is not liable for accidents, delays, property damage, or disputes."
    },
    {
      title: "6. Account Termination",
      content: "We reserve the right to suspend or terminate accounts that violate our community policies, misrepresent student status, or gather multiple negative safety ratings from peer students."
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
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" /> Current Version
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Terms of Service</h1>
            <p className="max-w-xl text-sm leading-relaxed text-white/80">
              Welcome to ShareFare. Please review the rules, guidelines, and terms governing our student mobility community.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 backdrop-blur ring-1 ring-white/20">
              <FileText className="h-10 w-10 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Terms Content Sections */}
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
              <CheckCircle className="h-5 w-5 text-indigo-500 shrink-0" />
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
        Last updated: May 21, 2026. For questions regarding our Terms, please contact support at{" "}
        <span className="font-semibold text-slate-700">sharefaree@gmail.com</span>.
      </div>
    </div>
  );
}
