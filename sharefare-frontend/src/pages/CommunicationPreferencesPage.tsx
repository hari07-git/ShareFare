import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Bell, ArrowLeft, Mail, MessageSquare, PhoneCall, ShieldAlert, Award } from "lucide-react";
import { GradientButton } from "../components/GradientButton";
import { useAuth } from "../state/auth";
import { toast } from "../components/Toast";

type PreferenceKey = "bookings" | "messages" | "sms" | "emails" | "sos" | "digests";

export function CommunicationPreferencesPage() {
  const { me } = useAuth();
  const userId = me?.id ?? 0;

  const [prefs, setPrefs] = useState<Record<PreferenceKey, boolean>>({
    bookings: true,
    messages: true,
    sms: true,
    emails: false,
    sos: true,
    digests: true
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (userId) {
      const stored = localStorage.getItem(`comm_prefs_${userId}`);
      if (stored) {
        try {
          setPrefs(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse saved communication preferences", e);
        }
      }
    }
  }, [userId]);

  const toggle = (key: PreferenceKey) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    setBusy(true);
    setTimeout(() => {
      if (userId) {
        localStorage.setItem(`comm_prefs_${userId}`, JSON.stringify(prefs));
        toast("Communication preferences saved! 🔔", "success");
      }
      setBusy(false);
    }, 1000);
  };

  const preferenceItems = [
    {
      key: "bookings" as const,
      title: "Booking & Ride Alerts",
      description: "Receive immediate notifications when a student requests a seat on your ride or approves your booking.",
      icon: Bell,
      color: "text-indigo-600 bg-indigo-50"
    },
    {
      key: "messages" as const,
      title: "In-App Chat Updates",
      description: "Receive instant notifications when a verified ride partner sends a new message inside a booked trip channel.",
      icon: MessageSquare,
      color: "text-blue-600 bg-blue-50"
    },
    {
      key: "sms" as const,
      title: "Emergency SMS Alerts",
      description: "Enable urgent SMS text message notifications for ride cancellations or last-minute coordination.",
      icon: PhoneCall,
      color: "text-emerald-600 bg-emerald-50"
    },
    {
      key: "sos" as const,
      title: "Panic Button SOS Broadcasts",
      description: "Allow automated triggers to broadcast your ride coordinates to your emergency contacts during distress alerts.",
      icon: ShieldAlert,
      color: "text-rose-600 bg-rose-50"
    },
    {
      key: "emails" as const,
      title: "Marketing & Promos",
      description: "Receive monthly digests regarding carbon emissions offsets and platform statistics.",
      icon: Mail,
      color: "text-violet-600 bg-violet-50"
    },
    {
      key: "digests" as const,
      title: "Weekly Trust Summary",
      description: "Stay updated on your average Ratings and newly unlocked Trust Badges.",
      icon: Award,
      color: "text-amber-600 bg-amber-50"
    }
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Navigation Header */}
      <div className="mb-6">
        <Link to="/me/profile" className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition">
          <ArrowLeft className="h-4 w-4" /> Back to Profile
        </Link>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
            <Bell className="h-3.5 w-3.5" /> Account Alerts
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Communication Preferences</h1>
          <p className="text-sm leading-relaxed text-slate-600">
            Configure how you wish to receive ride notifications, message reminders, and student updates. We recommend keeping SMS and SOS alerts active.
          </p>
        </div>

        <div className="space-y-4">
          {preferenceItems.map((item) => {
            const Icon = item.icon;
            const isEnabled = prefs[item.key];
            return (
              <div
                key={item.key}
                className="flex items-start justify-between gap-5 p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition duration-150"
              >
                <div className="flex gap-4">
                  <div className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center ${item.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-950">{item.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-md">{item.description}</p>
                  </div>
                </div>

                {/* Switch Toggle */}
                <button
                  type="button"
                  onClick={() => toggle(item.key)}
                  className={`relative inline-flex h-6.5 w-12 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
                    isEnabled ? "bg-indigo-600" : "bg-slate-200"
                  }`}
                  aria-label={`Toggle ${item.title}`}
                >
                  <span
                    className={`inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow transition-transform ${
                      isEnabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>

        <div className="pt-2">
          <GradientButton onClick={handleSave} disabled={busy} className="w-full">
            {busy ? "Saving notification states..." : "Save Preferences"}
          </GradientButton>
        </div>
      </div>
    </div>
  );
}
