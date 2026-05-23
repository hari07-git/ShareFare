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
  User, CheckCircle2, AlertCircle, Camera, Upload, BadgeIndianRupee,
  Search, ChevronDown
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
  collegeName: string | null;
  bio: string | null;
  genderPreference: string | null;
  emergencyContact: string | null;
  dailyCommuteRoutes: string | null;
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

const COLLEGES = [
  "JNTU Hyderabad",
  "University of Hyderabad",
  "CBIT",
  "VNR VJIET",
  "MGIT",
  "Vasavi College",
  "GRIET",
  "Malla Reddy",
  "OU",
  "BITS Hyderabad"
];

function CollegeSelector({
  value,
  onChange,
  error
}: {
  value: string;
  onChange: (val: string) => void;
  error?: string | null;
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [customMode, setCustomMode] = useState(Boolean(value && !COLLEGES.includes(value)));

  const filtered = COLLEGES.filter(c => c.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-1 relative">
      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">
        College / University
      </label>
      
      {!customMode ? (
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="w-full rounded-xl border border-slate-205 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-950 outline-none shadow-xs hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 flex justify-between items-center transition"
          >
            <span className={value ? "text-slate-950" : "text-slate-400 font-medium"}>
              {value || "Select your college"}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </button>

          {open && (
            <div className="absolute z-50 w-full mt-1.5 rounded-xl border border-slate-200 bg-white shadow-xl max-h-56 overflow-y-auto p-2 space-y-1">
              <div className="relative flex items-center mb-1">
                <Search className="absolute left-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search college..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full rounded-lg bg-slate-50 border border-slate-200 pl-9 pr-3 py-1.5 text-xs font-semibold outline-none focus:border-indigo-500"
                />
              </div>

              {filtered.length === 0 ? (
                <div className="text-slate-400 text-xs text-center py-2 font-medium">No results found</div>
              ) : (
                filtered.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      onChange(c);
                      setOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition ${value === c ? "bg-indigo-50 text-indigo-700" : "text-slate-700 hover:bg-slate-50"}`}
                  >
                    {c}
                  </button>
                ))
              )}

              <button
                type="button"
                onClick={() => {
                  setCustomMode(true);
                  onChange("");
                  setOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-indigo-650 hover:bg-indigo-50 transition border-t border-slate-100 mt-1"
              >
                ✍️ Type custom college name...
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="relative">
          <input
            type="text"
            required
            placeholder="Type your college name..."
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-950 outline-none shadow-xs hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition"
          />
          <button
            type="button"
            onClick={() => {
              setCustomMode(false);
              onChange("");
              setSearch("");
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-indigo-600 hover:text-indigo-700"
          >
            Choose from list
          </button>
        </div>
      )}
      {error && <span className="text-[10px] font-bold text-rose-600 px-1">{error}</span>}
    </div>
  );
}

export function ProfilePage() {
  const [me, setMe] = useState<Me | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [bio, setBio] = useState("");
  const [genderPreference, setGenderPreference] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [dailyCommuteRoutes, setDailyCommuteRoutes] = useState("");
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
        // Notify Navbar to update avatar immediately
        window.dispatchEvent(new Event(`avatar-updated-${me.id}`));
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
      setCollegeName(res.data.collegeName ?? "");
      setBio(res.data.bio ?? "");
      setGenderPreference(res.data.genderPreference ?? "");
      setEmergencyContact(res.data.emergencyContact ?? "");
      setDailyCommuteRoutes(res.data.dailyCommuteRoutes ?? "");
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
        collegeName: collegeName.trim() || null,
        bio: bio.trim() || null,
        genderPreference: genderPreference.trim() || null,
        emergencyContact: emergencyContact.trim() || null,
        dailyCommuteRoutes: dailyCommuteRoutes.trim() || null,
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
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 text-center sm:text-left">
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
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <h1 className="text-2xl font-bold tracking-tight">{me?.fullName ?? "Loading..."}</h1>
              {me?.collegeName && (
                <div className="mt-0.5 text-sm font-semibold text-white/90 flex items-center gap-1.5 justify-center sm:justify-start">
                  <span>🎓</span> {me.collegeName}
                </div>
              )}
              <div className="mt-1 text-sm font-medium text-white/70 truncate">{me?.email}</div>
              <div className="mt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                {(isVerified || me?.verifiedStudent || me?.collegeVerified) && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold backdrop-blur text-emerald-200 ring-1 ring-emerald-400/30">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" /> Verified Campus Student
                  </span>
                )}
                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-medium backdrop-blur">
                  <Clock className="h-3 w-3 text-white/70" /> Member since {memberSince}
                </span>
              </div>
            </div>
          </div>
          {/* Trust score */}
          <div className="flex flex-col items-center justify-center rounded-2xl bg-white/10 px-4 py-3 backdrop-blur w-full sm:w-auto text-center">
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
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon={Activity} label="Completed rides" value={me?.totalCompletedRides ?? 0} color="bg-indigo-50 text-indigo-600" />
              <StatCard icon={Star} label="Avg rating" value="4.9" color="bg-amber-50 text-amber-600" />
              <StatCard icon={Leaf} label="CO₂ saved" value="85kg" color="bg-emerald-50 text-emerald-600" />
              <StatCard icon={Users} label="Trusted by" value="12 riders" color="bg-violet-50 text-violet-600" />
            </div>

            {/* Bio Card */}
            {me?.bio && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Student Bio</div>
                <p className="text-sm font-medium text-slate-700 italic">"{me.bio}"</p>
              </div>
            )}

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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

            {/* Safety Preferences & Emergency Contact */}
            {(me?.emergencyContact || me?.genderPreference) && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">Safety & Travel Rules</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {me?.genderPreference && (
                    <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Co-Rider Preference</div>
                      <div className="mt-1 text-sm font-bold text-slate-900">
                        {me.genderPreference === "FEMALE_ONLY" ? "Female Passengers Only" : me.genderPreference === "MALE_ONLY" ? "Male Passengers Only" : "No Preference"}
                      </div>
                    </div>
                  )}
                  {me?.emergencyContact && (
                    <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Emergency Contact (SOS)</div>
                      <div className="mt-1 text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-rose-500 animate-pulse" />
                        {me.emergencyContact}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Travel Preferences */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">Travel Preferences</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                {me?.dailyCommuteRoutes && (
                  <div className="flex items-center gap-3 rounded-xl bg-indigo-50/40 border border-indigo-100 p-3">
                    <MapPin className="h-4 w-4 shrink-0 text-indigo-650 animate-bounce" />
                    <div className="flex-1 text-sm font-semibold text-slate-800">
                      <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-wide block">Daily Commute Route</span>
                      {me.dailyCommuteRoutes}
                    </div>
                  </div>
                )}
                {[
                  { from: "IIIT Hyderabad", to: "Gachibowli", count: "12 trips" },
                  { from: "JNTU", to: "Kukatpally Metro", count: "8 trips" },
                ].map((route) => (
                  <div key={route.from} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                    <MapPin className="h-4 w-4 shrink-0 text-indigo-505" />
                    <div className="flex-1 text-sm font-medium text-slate-800">{route.from} → {route.to}</div>
                    <span className="text-xs text-slate-500">{route.count}</span>
                  </div>
                ))}
                {!me?.dailyCommuteRoutes && (
                  <div className="rounded-xl border border-dashed border-slate-200 p-3 text-center text-xs text-slate-400">
                    Routes appear after completing trips
                  </div>
                )}
              </div>
            </div>

            {/* Edit Profile Form */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-500">
                <Edit3 className="h-4 w-4" /> Edit Profile
              </div>
              <form className="space-y-4" onSubmit={save}>
                <FormField label="Full name">
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </FormField>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Phone (optional)">
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 9XXXXXXXXX" />
                  </FormField>
                  <FormField label="College ID (optional)">
                    <Input value={collegeId} onChange={(e) => setCollegeId(e.target.value)} placeholder="Enter College ID Number" />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <CollegeSelector value={collegeName} onChange={setCollegeName} />
                  <FormField label="Preferred Commute Route (optional)">
                    <Input value={dailyCommuteRoutes} onChange={(e) => setDailyCommuteRoutes(e.target.value)} placeholder="e.g. CBIT to JNTU" />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Co-Rider Preference">
                    <select
                      value={genderPreference}
                      onChange={(e) => setGenderPreference(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-950 outline-none shadow-xs hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition"
                    >
                      <option value="">No Preference</option>
                      <option value="FEMALE_ONLY">Female Only</option>
                      <option value="MALE_ONLY">Male Only</option>
                    </select>
                  </FormField>
                  <FormField label="Emergency Contact (SOS)">
                    <Input value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} placeholder="+91 9XXXXXXXXX" />
                  </FormField>
                </div>

                <FormField label="Bio (optional)">
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell other students about yourself, your commute schedule, or co-rider expectations..."
                    rows={3}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-950 outline-none shadow-xs hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition resize-none"
                  />
                </FormField>

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
                            // Notify Navbar to clear avatar immediately
                            window.dispatchEvent(new Event(`avatar-updated-${me.id}`));
                          }
                        }}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </FormField>
                {error && <div className="rounded-xl bg-rose-50 px-4 py-2 text-sm text-rose-700 font-bold">{error}</div>}
                {saveMsg && <div className="rounded-xl bg-emerald-50 px-4 py-2 text-sm text-emerald-700 font-bold">{saveMsg}</div>}
                <Button disabled={busy} type="submit" className="w-full sm:w-auto px-6 py-3 font-bold bg-gradient-to-r from-blue-600 to-indigo-650 text-white shadow-md">
                  {busy ? "Saving..." : "Save Profile"}
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
                <SettingsCard icon={MapPin} title="Saved Locations" subtitle="Home, college, metro stations" onClick={() => navigate("/me/settings/address")} />
                <SettingsCard icon={Zap} title="Dark Mode" subtitle="Switch themes or preview app layouts" onClick={() => navigate("/me/settings/dark-mode")} />
                <SettingsCard icon={Users} title="Saved Riders" subtitle="People you've travelled with" onClick={() => navigate("/me/settings/saved-passengers")} />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">Safety Settings</div>
              <div className="space-y-2">
                <SettingsCard icon={HeartHandshake} title="Emergency Contacts" subtitle="Contacts notified during SOS" onClick={() => {
                  const el = document.getElementById("emergency-contacts-section");
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                }} />
                <SettingsCard icon={Star} title="Ratings & Reviews" subtitle="Review your community standing and stars" onClick={() => navigate("/me/settings/ratings")} />
                <SettingsCard icon={ShieldCheck} title="Data Protection" subtitle="How we handle your campus files securely" onClick={() => navigate("/data-protection")} />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">Account Security</div>
              <div className="space-y-2">
                <SettingsCard icon={Lock} title="Change Password" subtitle="Update your login credentials" onClick={() => navigate("/me/settings/password")} />
                <SettingsCard icon={Bell} title="Notification Controls" subtitle="Booking alerts, ride reminders" onClick={() => navigate("/me/settings/communication")} />
                <SettingsCard icon={BadgeIndianRupee} title="Payments & Refunds" subtitle="Transactions, refunds, and bank payouts" onClick={() => navigate("/me/settings/payments")} />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">Support</div>
              <div className="space-y-2">
                <SettingsCard icon={User} title="Support Center" subtitle="Get help with rides and accounts" onClick={() => navigate("/support")} />
                <SettingsCard icon={Activity} title="Report an Issue" subtitle="Report safety or technical problems" onClick={() => navigate("/support")} />
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
