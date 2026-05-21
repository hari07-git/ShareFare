import { useEffect, useRef, useState } from "react";
import { api } from "../lib/api";
import { FormField } from "../components/FormField";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { CollegeVerificationComponent } from "../components/CollegeVerificationComponent";
import { EmergencyContactForm } from "../components/SafetyActions";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Shield, ShieldCheck, Star, Clock, Users, Leaf, BadgeCheck,
  Edit3, Bell, Lock, Eye, Phone, ChevronRight, HeartHandshake,
  Music, Wind, Dog, Cigarette, MapPin, Zap, Award, Activity,
  User, CheckCircle2, AlertCircle, Camera, Upload
} from "lucide-react";

type Me = {
  id: number;
  email: string;
  fullName: string;
  phone: string | null;
  collegeId: string | null;
  collegeVerified: boolean;
  emailVerified: boolean;
  role: string;
  createdAt: string;
  verificationStatus: string;
  trustScore: number;
  accountStatus: string;
  gender: string;
  safetyScore: number;
  totalCompletedRides: number;
  cancellationRate: number;
};

type Tab = "about" | "settings";

function TrustRing({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, score));
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = pct >= 80 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <svg width="88" height="88" viewBox="0 0 88 88" className="rotate-[-90deg]">
      <circle cx="44" cy="44" r={r} fill="none" stroke="#e2e8f0" strokeWidth="6" />
      <circle
        cx="44" cy="44" r={r} fill="none"
        stroke={color} strokeWidth="6"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        className="transition-all duration-700"
      />
    </svg>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="mt-3 text-2xl font-bold text-slate-950">{value}</div>
      <div className="mt-0.5 text-xs font-medium text-slate-500">{label}</div>
    </motion.div>
  );
}

function TrustBadge({ icon: Icon, label, active, color }: { icon: any; label: string; active: boolean; color: string }) {
  if (!active) return null;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${color}`}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

function SettingsCard({ icon: Icon, title, subtitle, onClick }: { icon: any; title: string; subtitle: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-4 rounded-2xl border border-slate-100 bg-white px-4 py-3.5 text-left shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50/40 hover:shadow-md"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        <div className="mt-0.5 truncate text-xs text-slate-500">{subtitle}</div>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
    </button>
  );
}

function PrefToggle({ label, icon: Icon, defaultOn = false }: { label: string; icon: any; defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3">
      <span className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
        <Icon className="h-4 w-4 text-slate-500" />
        {label}
      </span>
      <button
        type="button"
        onClick={() => setOn((v) => !v)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${on ? "bg-indigo-600" : "bg-slate-200"}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${on ? "translate-x-6" : "translate-x-1"}`} />
      </button>
    </label>
  );
}

export function ProfilePage() {
  const [me, setMe] = useState<Me | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<Tab>("about");

  const [avatar, setAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (me?.id) {
      const stored = localStorage.getItem(`profile_avatar_${me.id}`);
      if (stored) {
        setAvatar(stored);
      }
    }
  }, [me?.id]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && me?.id) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        localStorage.setItem(`profile_avatar_${me.id}`, base64);
        setAvatar(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerPhotoUpload = () => {
    fileInputRef.current?.click();
  };

  async function load() {
    setError(null);
    try {
      const res = await api.get<Me>("/api/me");
      setMe(res.data);
      setFullName(res.data.fullName ?? "");
      setPhone(res.data.phone ?? "");
      setCollegeId(res.data.collegeId ?? "");
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to load profile");
    }
  }

  useEffect(() => { void load(); }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSaveMsg(null);
    try {
      const res = await api.put<Me>("/api/me", {
        fullName,
        phone: phone.trim() || null,
        collegeId: collegeId.trim() || null,
      });
      setMe((prev) => prev ? { ...prev, ...res.data } : res.data);
      setSaveMsg("Profile saved!");
      setTimeout(() => setSaveMsg(null), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Save failed");
    } finally {
      setBusy(false);
    }
  }

  const isVerified = me?.accountStatus === "VERIFIED_STUDENT";
  const trustScore = Math.round((me?.trustScore ?? 5) * 10);
  const memberSince = me?.createdAt ? new Date(me.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : "";

  const completionItems = [
    { label: "Email verified", done: me?.emailVerified },
    { label: "Phone added", done: Boolean(me?.phone) },
    { label: "College verified", done: me?.collegeVerified },
    { label: "Profile name set", done: Boolean(me?.fullName) },
  ];
  const completionPct = Math.round((completionItems.filter((i) => i.done).length / completionItems.length) * 100);

  const initials = (me?.fullName ?? "SF")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="mx-auto max-w-5xl space-y-0">
      {/* Hero Profile Header */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-600 via-violet-600 to-cyan-500 p-6 text-white shadow-xl md:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-5">
            {/* Avatar + trust ring */}
            <div className="relative group cursor-pointer" onClick={triggerPhotoUpload} title="Click to upload profile photo">
              <TrustRing score={trustScore} />
              <div className="absolute inset-0 flex items-center justify-center">
                {avatar ? (
                  <img
                    src={avatar}
                    alt="Profile Avatar"
                    className="h-14 w-14 rounded-full object-cover ring-2 ring-white/40 transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-xl font-black backdrop-blur ring-2 ring-white/40 transition duration-300 group-hover:scale-105">
                    {initials}
                  </div>
                )}
                {/* Premium hover camera overlay */}
                <div className="absolute inset-[15px] flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition duration-200">
                  <Camera className="h-4 w-4 text-white" />
                </div>
              </div>
              {isVerified && (
                <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white shadow-sm z-10">
                  <ShieldCheck className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{me?.fullName ?? "Loading..."}</h1>
              <div className="mt-1 text-sm font-medium text-white/70">{me?.email}</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {isVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold backdrop-blur">
                    <BadgeCheck className="h-3.5 w-3.5 text-emerald-300" /> Verified Student
                  </span>
                )}
                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-medium backdrop-blur">
                  <Clock className="h-3 w-3 text-white/70" /> Member since {memberSince}
                </span>
              </div>
            </div>
          </div>
          {/* Trust score */}
          <div className="flex flex-col items-start rounded-2xl bg-white/10 px-4 py-3 backdrop-blur sm:items-center">
            <div className="text-xs font-semibold uppercase tracking-wider text-white/60">Trust Score</div>
            <div className="mt-1 text-3xl font-black">{trustScore}<span className="text-base font-medium text-white/70">/100</span></div>
            <div className="mt-1 text-xs text-white/60">{trustScore >= 80 ? "Excellent" : trustScore >= 50 ? "Good" : "Building"}</div>
          </div>
        </div>

        {/* Profile completion bar */}
        <div className="relative mt-6 rounded-2xl bg-white/10 p-4 backdrop-blur">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">Profile completeness</span>
            <span className="text-sm font-bold">{completionPct}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-700"
              style={{ width: `${completionPct}%` }}
            />
          </div>
          <div className="mt-2 flex flex-wrap gap-3">
            {completionItems.map((item) => (
              <span key={item.label} className={`flex items-center gap-1 text-xs ${item.done ? "text-emerald-300" : "text-white/50"}`}>
                {item.done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                {item.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-1">
        {([["about", "About You"], ["settings", "Account & Safety"]] as [Tab, string][]).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all ${
              tab === id
                ? "bg-white text-slate-950 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === "about" ? (
          <motion.div
            key="about"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="mt-6 space-y-6"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard icon={Activity} label="Completed rides" value={me?.totalCompletedRides ?? 0} color="bg-indigo-50 text-indigo-600" />
              <StatCard icon={Star} label="Avg rating" value="4.9" color="bg-amber-50 text-amber-600" />
              <StatCard icon={Leaf} label="CO₂ saved" value="85kg" color="bg-emerald-50 text-emerald-600" />
              <StatCard icon={Users} label="Trusted by" value="12 riders" color="bg-violet-50 text-violet-600" />
            </div>

            {/* Trust Badges */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">Trust Badges</div>
              <div className="flex flex-wrap gap-2">
                <TrustBadge icon={ShieldCheck} label="Verified Student" active={isVerified} color="bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" />
                <TrustBadge icon={BadgeCheck} label="Campus Verified" active={me?.collegeVerified ?? false} color="bg-blue-50 text-blue-700 ring-1 ring-blue-200" />
                <TrustBadge icon={Shield} label="Email Verified" active={me?.emailVerified ?? false} color="bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200" />
                <TrustBadge icon={Star} label="Trusted Rider" active={(me?.trustScore ?? 0) >= 9} color="bg-amber-50 text-amber-700 ring-1 ring-amber-200" />
                <TrustBadge icon={Award} label="Gold Commuter" active={(me?.trustScore ?? 0) >= 7 && (me?.trustScore ?? 0) < 9} color="bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200" />
                <TrustBadge icon={HeartHandshake} label="Female Friendly" active={me?.gender === "FEMALE"} color="bg-purple-50 text-purple-700 ring-1 ring-purple-200" />
                {!isVerified && !me?.collegeVerified && (
                  <button
                    onClick={() => setTab("settings")}
                    className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-indigo-700 transition-colors"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Get Verified → Upload ID
                  </button>
                )}
              </div>
            </div>

            {/* Reliability */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">Reliability</div>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Cancellation rate", value: `${((me?.cancellationRate ?? 0) * 100).toFixed(0)}%`, color: "text-emerald-600" },
                  { label: "Completion rate", value: `${100 - Math.round((me?.cancellationRate ?? 0) * 100)}%`, color: "text-indigo-600" },
                  { label: "Safety score", value: `${(me?.safetyScore ?? 10).toFixed(1)}/10`, color: "text-amber-600" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl bg-slate-50 p-4">
                    <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                    <div className="mt-1 text-xs text-slate-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Travel Preferences */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">Travel Preferences</div>
              <div className="grid gap-2 sm:grid-cols-2">
                <PrefToggle label="Music during ride" icon={Music} defaultOn={true} />
                <PrefToggle label="Chat friendly" icon={HeartHandshake} defaultOn={true} />
                <PrefToggle label="AC preferred" icon={Wind} defaultOn={false} />
                <PrefToggle label="Pets OK" icon={Dog} defaultOn={false} />
                <PrefToggle label="No smoking" icon={Cigarette} defaultOn={true} />
                <PrefToggle label="Female only rides" icon={Users} defaultOn={me?.gender === "FEMALE"} />
              </div>
            </div>

            {/* Frequently Travelled */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">Frequent Routes</div>
              <div className="space-y-2">
                {[
                  { from: "IIIT Hyderabad", to: "Gachibowli", count: "12 trips" },
                  { from: "JNTU", to: "Kukatpally Metro", count: "8 trips" },
                ].map((route) => (
                  <div key={route.from} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                    <MapPin className="h-4 w-4 shrink-0 text-indigo-500" />
                    <div className="flex-1 text-sm font-medium text-slate-800">{route.from} → {route.to}</div>
                    <span className="text-xs text-slate-500">{route.count}</span>
                  </div>
                ))}
                <div className="rounded-xl border border-dashed border-slate-200 p-3 text-center text-xs text-slate-400">
                  Routes appear after completing trips
                </div>
              </div>
            </div>

            {/* Edit Profile Form */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-500">
                <Edit3 className="h-4 w-4" /> Edit Profile
              </div>
              <form className="space-y-4" onSubmit={save}>
                <FormField label="Full name">
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </FormField>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Phone (optional)">
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 9XXXXXXXXX" />
                  </FormField>
                  <FormField label="College ID (optional)">
                    <Input value={collegeId} onChange={(e) => setCollegeId(e.target.value)} />
                  </FormField>
                </div>
                <FormField label="Profile photo">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={triggerPhotoUpload}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
                    >
                      <Upload className="h-4 w-4" />
                      {avatar ? "Change photo" : "Upload photo"}
                    </button>
                    {avatar && (
                      <button
                        type="button"
                        onClick={() => {
                          if (me?.id) {
                            localStorage.removeItem(`profile_avatar_${me.id}`);
                            setAvatar(null);
                          }
                        }}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </FormField>
                {error && <div className="rounded-xl bg-rose-50 px-4 py-2 text-sm text-rose-700">{error}</div>}
                {saveMsg && <div className="rounded-xl bg-emerald-50 px-4 py-2 text-sm text-emerald-700">{saveMsg}</div>}
                <Button disabled={busy} type="submit">
                  {busy ? "Saving..." : "Save profile"}
                </Button>
              </form>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="mt-6 space-y-6"
          >
            {/* Verification Status */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">Verification Status</div>
              <div className="space-y-2">
                {[
                  { label: "Email", status: me?.emailVerified, detail: me?.email },
                  { label: "College ID", status: me?.collegeVerified, detail: me?.collegeVerified ? "Verified by admin" : "Upload your student ID" },
                  { label: "Account Status", status: isVerified, detail: isVerified ? "Verified Student — can offer & book rides" : "Pending verification" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{item.label}</div>
                      <div className="text-xs text-slate-500">{item.detail}</div>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${item.status ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {item.status ? "Verified" : "Pending"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <CollegeVerificationComponent />

            {/* Settings Cards */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">Campus Preferences</div>
              <div className="space-y-2">
                <SettingsCard icon={MapPin} title="Saved Locations" subtitle="Home, college, metro stations" />
                <SettingsCard icon={Zap} title="Ride Preferences" subtitle="Female only, verified students, AC" />
                <SettingsCard icon={Users} title="Saved Riders" subtitle="People you've travelled with" />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">Safety Settings</div>
              <div className="space-y-2">
                <SettingsCard icon={HeartHandshake} title="Emergency Contacts" subtitle="Contacts notified during SOS" />
                <SettingsCard icon={Eye} title="Privacy Controls" subtitle="Who can see your profile & phone" />
                <SettingsCard icon={Shield} title="Blocked Users" subtitle="Manage your block list" />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">Account Security</div>
              <div className="space-y-2">
                <SettingsCard icon={Lock} title="Change Password" subtitle="Update your login credentials" />
                <SettingsCard icon={Phone} title="Phone Number" subtitle={me?.phone ?? "Not added yet"} />
                <SettingsCard icon={Bell} title="Notification Controls" subtitle="Booking alerts, ride reminders" />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">Support</div>
              <div className="space-y-2">
                <SettingsCard icon={User} title="Support Center" subtitle="Get help with rides and accounts" />
                <SettingsCard icon={Activity} title="Report an Issue" subtitle="Report safety or technical problems" />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">Legal & Policies</div>
              <div className="space-y-2">
                <SettingsCard icon={ShieldCheck} title="Terms of Service" subtitle="Read our campus ride-sharing terms" onClick={() => navigate("/terms")} />
                <SettingsCard icon={Shield} title="Privacy Policy" subtitle="How we protect your student data" onClick={() => navigate("/privacy")} />
                <SettingsCard icon={Eye} title="Cookie Policy" subtitle="Manage your cookie preferences" onClick={() => navigate("/cookies")} />
              </div>
            </div>

            <EmergencyContactForm />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
