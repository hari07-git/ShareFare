import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, ArrowLeft, Eye, EyeOff, ShieldAlert, Check, ShieldCheck } from "lucide-react";
import { GradientButton } from "../components/GradientButton";
import { toast } from "../components/Toast";

export function PasswordPage() {
  const [current, setCurrent] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  // Visibility toggles
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Strength Check Criteria
  const hasMinLength = newPassword.length >= 8;
  const hasNumber = /\d/.test(newPassword);
  const hasCapital = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);

  const criteriaList = [
    { label: "At least 8 characters", met: hasMinLength },
    { label: "Contains at least 1 number", met: hasNumber },
    { label: "Contains 1 uppercase letter", met: hasCapital },
    { label: "Contains 1 lowercase letter", met: hasLower }
  ];

  const metCount = criteriaList.filter(c => c.met).length;
  const matches = newPassword === confirm && confirm.length > 0;
  const allCriteriaMet = hasMinLength && hasNumber && hasCapital && hasLower;

  const strengthCls =
    metCount === 4 ? "bg-emerald-500" :
    metCount === 3 ? "bg-blue-500" :
    metCount === 2 ? "bg-amber-500" : "bg-rose-500";

  const strengthText =
    metCount === 4 ? "Strong (Passed)" :
    metCount === 3 ? "Good" :
    metCount === 2 ? "Fair" : "Weak";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allCriteriaMet) {
      toast("Please fulfill all password security rules.", "error");
      return;
    }
    if (!matches) {
      toast("New passwords do not match.", "error");
      return;
    }
    setBusy(true);
    setTimeout(() => {
      toast("Password updated successfully! 🔐", "success");
      setCurrent("");
      setNewPassword("");
      setConfirm("");
      setBusy(false);
    }, 1200);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Navigation Header */}
      <div className="mb-6">
        <Link to="/me/profile" className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition">
          <ArrowLeft className="h-4 w-4" /> Back to Profile
        </Link>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
            <Lock className="h-3.5 w-3.5" /> Security Credentials
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Change Password</h1>
          <p className="text-sm leading-relaxed text-slate-600">
            Update your login credentials. We recommend utilizing strong uppercase characters and digits to protect your university account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Current Password */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">Current Password</label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                required
                value={current}
                onChange={e => setCurrent(e.target.value)}
                className="w-full rounded-xl border border-slate-200 pl-4 pr-10 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showCurrent ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">New Password</label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 pl-4 pr-10 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowNew(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showNew ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>

          {/* Password Strength Meter */}
          {newPassword.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Password Strength</span>
                <span className="flex items-center gap-1">
                  {metCount === 4 ? <ShieldCheck className="h-4 w-4 text-emerald-500" /> : <ShieldAlert className="h-4 w-4" />}
                  {strengthText}
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${strengthCls}`}
                  style={{ width: `${(metCount / 4) * 100}%` }}
                />
              </div>
              <div className="grid gap-2 sm:grid-cols-2 pt-1 text-[11px] font-semibold">
                {criteriaList.map((c) => (
                  <div
                    key={c.label}
                    className={`flex items-center gap-1.5 ${
                      c.met ? "text-emerald-600" : "text-slate-400"
                    }`}
                  >
                    <Check className={`h-3 w-3 shrink-0 ${c.met ? "text-emerald-500" : "text-slate-300"}`} />
                    {c.met ? <del className="no-underline">{c.label}</del> : c.label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Confirm Password */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                required
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 pl-4 pr-10 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showConfirm ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
            {confirm.length > 0 && (
              <span className={`block text-[11px] font-bold mt-1 ${matches ? "text-emerald-600" : "text-rose-500"}`}>
                {matches ? "✓ Passwords match" : "✗ Passwords do not match"}
              </span>
            )}
          </div>

          <GradientButton type="submit" disabled={busy || !matches || !allCriteriaMet} className="w-full">
            {busy ? "Saving new credentials..." : "Update Password"}
          </GradientButton>
        </form>
      </div>
    </div>
  );
}
