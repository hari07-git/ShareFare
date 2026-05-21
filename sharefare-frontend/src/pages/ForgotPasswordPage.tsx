import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { FormField } from "../components/FormField";
import { Input } from "../components/Input";
import { GradientButton } from "../components/GradientButton";
import { AuthShell } from "../components/AuthShell";
import { Mail, Lock, Copy, CheckCircle2, ArrowRight, KeyRound } from "lucide-react";

type ForgotPasswordResponse = {
  message: string;
  otp: string | null;
};

type Step = "email" | "otp";

export function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpResult, setOtpResult] = useState<ForgotPasswordResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  async function onRequestReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await api.post<ForgotPasswordResponse>("/api/auth/forgot-password", { email });
      setOtpResult(res.data);
      // Pre-fill OTP only if shown on screen (MAIL_ENABLED=false fallback)
      if (res.data.otp) setOtp(res.data.otp);
      setStep("otp");
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Request failed");
    } finally {
      setBusy(false);
    }
  }

  async function onResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    setBusy(true);
    try {
      await api.post("/api/auth/reset-password-otp", { email, otp, password: newPassword });
      setSuccess(true);
      setTimeout(() => navigate(`/auth/login?email=${encodeURIComponent(email)}`), 2500);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Reset failed");
    } finally {
      setBusy(false);
    }
  }

  function copyOtp() {
    if (otpResult?.otp) {
      navigator.clipboard.writeText(otpResult.otp).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }

  // ── Success screen ───────────────────────────────────────────────────────
  if (success) {
    return (
      <AuthShell title="Password updated!" subtitle="Redirecting you to login…"
        sideTitle="All set" sideBody="Your new password is saved. Sign in to continue booking campus rides.">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
          <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-emerald-500" />
          <p className="font-semibold text-emerald-900">Password updated successfully!</p>
          <p className="mt-1 text-sm text-emerald-700">Taking you to login…</p>
        </div>
      </AuthShell>
    );
  }

  // ── Step 2: Enter OTP + New Password ────────────────────────────────────
  if (step === "otp") {
    return (
      <AuthShell title="Reset your password" subtitle={otpResult?.message ?? ""}
        sideTitle="Almost done" sideBody="Enter the OTP and choose a new secure password for your ShareFare account.">
        <div className="space-y-5">
          {/* Email sent confirmation (normal Brevo flow) */}
          {!otpResult?.otp && (
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5 text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
                <Mail className="h-6 w-6 text-indigo-600" />
              </div>
              <p className="font-semibold text-indigo-900">Check your email!</p>
              <p className="mt-1 text-sm text-indigo-700">
                We sent a 6-digit reset OTP to <strong>{email}</strong>
              </p>
              <p className="mt-1 text-xs text-indigo-500">Also check your spam folder.</p>
            </div>
          )}

          {/* Fallback: OTP on screen (only when MAIL_ENABLED=false) */}
          {otpResult?.otp && (
            <div className="rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 p-5 text-center">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-indigo-500">
                Your Reset OTP
              </p>
              <div className="my-2 flex items-center justify-center gap-2">
                {otpResult.otp.split("").map((digit, i) => (
                  <span key={i}
                    className="flex h-11 w-9 items-center justify-center rounded-xl bg-white text-xl font-bold text-indigo-700 shadow ring-1 ring-indigo-200">
                    {digit}
                  </span>
                ))}
              </div>
              <button onClick={copyOtp}
                className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700">
                {copied ? <><CheckCircle2 className="h-3.5 w-3.5" /> Copied!</> : <><Copy className="h-3.5 w-3.5" /> Copy OTP</>}
              </button>
              <p className="mt-2 text-xs text-slate-500">Valid for 30 minutes</p>
            </div>
          )}

          <form className="space-y-4" onSubmit={onResetPassword}>
            <FormField label="OTP Code">
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <KeyRound className="h-4 w-4" />
                </span>
                <Input value={otp} onChange={(e) => setOtp(e.target.value)}
                  className="pl-11 text-center tracking-[0.4em] font-mono text-lg"
                  maxLength={6} placeholder="000000" required />
              </div>
            </FormField>
            <FormField label="New password (min 8 chars)">
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock className="h-4 w-4" />
                </span>
                <Input value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-11" type="password" required />
              </div>
            </FormField>
            <FormField label="Confirm new password">
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock className="h-4 w-4" />
                </span>
                <Input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-11" type="password" required />
              </div>
            </FormField>
            {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
            <GradientButton disabled={busy} type="submit" className="w-full">
              {busy ? "Updating..." : <>Update Password <ArrowRight className="ml-1.5 inline h-4 w-4" /></>}
            </GradientButton>
            <button type="button" onClick={() => setStep("email")}
              className="block w-full text-center text-sm text-slate-500 hover:text-slate-700">
              ← Use a different email
            </button>
          </form>
        </div>
      </AuthShell>
    );
  }

  // ── Step 1: Enter Email ──────────────────────────────────────────────────
  return (
    <AuthShell title="Forgot password?" subtitle="Enter your registered email and we'll give you a reset code."
      sideTitle="Secure reset" sideBody="Your account stays protected. Enter your registered email to receive a verification code to reset your password.">
      <form className="space-y-4" onSubmit={onRequestReset}>
        <FormField label="Email">
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Mail className="h-4 w-4" />
            </span>
            <Input value={email} onChange={(e) => setEmail(e.target.value)}
              className="pl-11" type="email" required />
          </div>
        </FormField>
        {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
        <GradientButton disabled={busy} type="submit" className="w-full">
          {busy ? "Checking..." : <>Get Reset Code <ArrowRight className="ml-1.5 inline h-4 w-4" /></>}
        </GradientButton>
      </form>
      <div className="mt-5 text-sm text-slate-600">
        Remember it?{" "}
        <Link className="font-semibold text-blue-600 hover:underline" to="/auth/login">Back to Login</Link>
      </div>
    </AuthShell>
  );
}
