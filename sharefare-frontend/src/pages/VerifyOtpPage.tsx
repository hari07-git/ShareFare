import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import { AuthShell } from "../components/AuthShell";
import { FormField } from "../components/FormField";
import { Input } from "../components/Input";
import { GradientButton } from "../components/GradientButton";
import { Mail, ShieldCheck } from "lucide-react";

export function VerifyOtpPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const initialEmail = useMemo(() => params.get("email") ?? "", [params]);
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [resendBusy, setResendBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(initialEmail ? `If you just registered, check Gmail or spam for the OTP sent to ${initialEmail}.` : null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setEmail(initialEmail);
    if (initialEmail) setMessage(`If you just registered, check Gmail or spam for the OTP sent to ${initialEmail}.`);
  }, [initialEmail]);

  async function verify(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    if (otp.replace(/\D/g, "").length !== 6) {
      setError("Enter the 6-digit OTP from your email.");
      return;
    }
    setBusy(true);
    try {
      const res = await api.post<{ message: string }>("/api/auth/verify-otp", { email, otp });
      setMessage(res.data.message);
      window.setTimeout(() => navigate(`/auth/login?email=${encodeURIComponent(email)}`), 1200);
    } catch (err: any) {
      const message = err?.response?.data?.message;
      setError(message && message !== "Internal server error" ? message : "Invalid or expired OTP. Please resend and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function resendOtp() {
    if (!email.trim()) {
      setError("Enter your email first.");
      return;
    }
    setError(null);
    setMessage(null);
    setResendBusy(true);
    try {
      const res = await api.post<{ message: string }>("/api/auth/resend-verification", { email });
      setMessage(res.data.message);
    } catch (err: any) {
      const message = err?.response?.data?.message;
      setError(message && message !== "Internal server error" ? message : "Could not resend OTP. Please try again.");
    } finally {
      setResendBusy(false);
    }
  }

  return (
    <AuthShell
      title="Verify your email"
      subtitle="Enter the 6-digit OTP sent to your Gmail to activate secure login."
      sideTitle="One-time email verification"
      sideBody="This protects booking updates, ride contact details, and future password recovery."
    >
      <form className="space-y-4" onSubmit={verify}>
        <FormField label="Email">
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Mail className="h-4 w-4" />
            </span>
            <Input value={email} onChange={(event) => setEmail(event.target.value)} className="pl-11" type="email" required />
          </div>
        </FormField>
        <FormField label="6-digit OTP">
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <Input
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
              className="pl-11 text-center text-lg tracking-[0.45em]"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="000000"
              required
            />
          </div>
          <p className="mt-2 text-xs text-slate-500">OTP expires in 10 minutes. Check inbox/spam if it is not visible.</p>
        </FormField>
        {message ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{message}</div> : null}
        {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div> : null}
        <GradientButton disabled={busy} type="submit" className="w-full">
          {busy ? "Verifying..." : "Verify and continue"}
        </GradientButton>
      </form>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
        <button type="button" onClick={resendOtp} disabled={resendBusy} className="font-semibold text-blue-600 hover:underline">
          {resendBusy ? "Sending..." : "Resend OTP"}
        </button>
        <Link className="font-semibold text-blue-600 hover:underline" to="/auth/login">Back to login</Link>
      </div>
    </AuthShell>
  );
}
