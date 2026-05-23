import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ShieldCheck, Lock, EyeOff, RefreshCw, Key, FileText,
  ArrowLeft, CheckCircle, Database
} from "lucide-react";

export function DataProtectionPage() {
  const securityMeasures = [
    {
      title: "1. Encrypted Transit (SSL/TLS)",
      description: "All client-to-server coordinates, phone data, and profile uploads travel over highly secure HTTPS protocol utilizing active TLS 1.3 encryption tunnels, completely defending student sessions against packet sniffing on shared campus Wi-Fi networks.",
      icon: Lock
    },
    {
      title: "2. Automatic Student ID Purges",
      description: "To minimize secondary data exposure risk, student ID card upload images are automatically deleted from primary disk storage within 7 days after the admin team manually reviews, cross-checks, and sets the 'Verified Student' state. Only verification logs are retained.",
      icon: EyeOff
    },
    {
      title: "3. Hashed Credentials (Bcrypt)",
      description: "ShareFare never stores raw student passwords in the database. All user passwords are dynamically salted and securely hashed using Bcrypt password-hashing functions before saving, ensuring maximum security even in hypothetical database dumps.",
      icon: Key
    },
    {
      title: "4. Live Route Coordinates Tracking Limits",
      description: "Geographical transit coordinate tracking is limited strictly to active trips. ShareFare never logs background telemetry outside of active rides. Coordinate logs are automatically archived and locked 30 days after trip completion.",
      icon: Database
    }
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
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
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" /> DPDP & GDPR Compliant
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Data Protection Policy</h1>
            <p className="max-w-xl text-sm leading-relaxed text-white/80">
              Your academic files, phone metadata, and routes coordinates are fully secure. Review our data protection measures and privacy standards.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 backdrop-blur ring-1 ring-white/20">
              <ShieldCheck className="h-10 w-10 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Security Measures Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {securityMeasures.map((measure, idx) => {
          const Icon = measure.icon;
          return (
            <motion.div
              key={measure.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition duration-300 space-y-3"
            >
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">{measure.title}</h3>
              <p className="text-sm leading-relaxed text-slate-600">
                {measure.description}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* DPDP Rights & Consent Center */}
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-950 flex items-center gap-2">
          <FileText className="h-5 w-5 text-indigo-500" /> Digital Personal Data Protection (DPDP) Rights
        </h3>
        <p className="text-sm leading-relaxed text-slate-600">
          In alignment with modern digital data protection standards, Hyderabad campus commuters maintain full ownership of their credentials. ShareFare provides active, streamlined features to exercise your legal data rights:
        </p>

        <div className="grid gap-4 sm:grid-cols-3 pt-2 text-sm text-slate-700">
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 flex flex-col gap-2">
            <span className="font-bold text-slate-900 flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" /> Right to Access</span>
            <span className="text-xs text-slate-500">You can download your entire personal profile and ride history logs directly at any time.</span>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 flex flex-col gap-2">
            <span className="font-bold text-slate-900 flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" /> Right to Correction</span>
            <span className="text-xs text-slate-500">Change incorrect student profiles, phone numbers, or vehicle designations instantly via settings.</span>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 flex flex-col gap-2">
            <span className="font-bold text-slate-900 flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" /> Right to Erasure</span>
            <span className="text-xs text-slate-500">Request total account closure. We completely wipe your database footprint within 72 hours.</span>
          </div>
        </div>
      </div>

      {/* Footer / Questions */}
      <div className="mt-10 rounded-2xl border border-dashed border-slate-200 p-5 text-center text-xs text-slate-500">
        Last updated: May 23, 2026. For specific data removal requests or logs requests, please contact our Data Protection Officer at{" "}
        <span className="font-semibold text-slate-700">sharefaree@gmail.com</span>.
      </div>
    </div>
  );
}
