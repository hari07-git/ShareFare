import { motion } from "framer-motion";
import { ShieldCheck, Info, ArrowLeft, Cookie } from "lucide-react";
import { Link } from "react-router-dom";

export function CookiePolicyPage() {
  const sections = [
    {
      title: "1. What are Cookies?",
      content: "Cookies are small text files stored on your computer or mobile device when you visit websites. They help us remember your device parameters, security tokens, login sessions, and page settings so you do not have to re-enter them every time."
    },
    {
      title: "2. Strictly Necessary Cookies",
      content: "These cookies are vital to let you log in, access authorized features, and use campus routing options. Without these essential cookies, we cannot guarantee security or execute bookings correctly."
    },
    {
      title: "3. Preferences & Personalization",
      content: "These cookies allow our frontend to remember your settings (such as theme choice, active tabs, saved coordinates, and safety alert states) to deliver a personalized, tailored experience."
    },
    {
      title: "4. Map and Geocoding Performance",
      content: "We use performance indicators and local cache blocks to optimize Leaflet map tile rendering and location autocompletes, lowering device battery consumption and ensuring rapid load times."
    },
    {
      title: "5. Managing Your Choices",
      content: "Most web browsers allow you to control, disable, or delete cookies via their browser preferences. Note that disabling necessary cookies may break essential features (such as login authentication or ride bookings)."
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
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" /> Fully Compliant
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Cookie Policy</h1>
            <p className="max-w-xl text-sm leading-relaxed text-white/80">
              Find out how we use cookies and browser cache to improve your interface transitions and maintain secure student login states.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 backdrop-blur ring-1 ring-white/20">
              <Cookie className="h-10 w-10 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Cookie Policy Content Sections */}
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
              <Info className="h-5 w-5 text-indigo-500 shrink-0" />
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
        Last updated: May 21, 2026. For questions regarding our Cookie Policy, please contact support at{" "}
        <span className="font-semibold text-slate-700">sharefaree@gmail.com</span>.
      </div>
    </div>
  );
}
