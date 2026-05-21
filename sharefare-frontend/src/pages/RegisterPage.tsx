import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { FormField } from "../components/FormField";
import { Input } from "../components/Input";
import { GradientButton } from "../components/GradientButton";
import { AuthShell } from "../components/AuthShell";
import { Lock, Mail, Phone, User, Copy, CheckCircle2, ArrowRight } from "lucide-react";

type RegisterResponse = {
  message: string;
  otp: string | null;        // non-null only when MAIL_ENABLED=false (dev/fallback)
  emailVerified: boolean;
};

export function RegisterPage() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<RegisterResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (!gender) { setError("Please select your gender"); setBusy(false); return; }
      const res = await api.post<RegisterResponse>("/api/auth/register", {
        email, password, fullName,
        phone: phone.trim() || null,
        gender,
      });
      setResult(res.data);
      // If email was sent (otp is null) → go straight to OTP entry page
      if (!res.data.otp && !res.data.emailVerified) {
        setTimeout(() => navigate(`/auth/verify-otp?email=${encodeURIComponent(email)}`), 1800);
      }
      // If auto-verified → go to login
      if (res.data.emailVerified && !res.data.otp) {
        setTimeout(() => navigate(`/auth/login?email=${encodeURIComponent(email)}`), 1800);
      }
    } catch (err: any) {
      setError(!err.response ? "Backend server is not running" : (err.response.data?.message ?? "Registration failed"));
    } finally {
      setBusy(false);
    }
  }

  function copyOtp() {
    if (result?.otp) {
      navigator.clipboard.writeText(result.otp).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }

  // ── Success screen ───────────────────────────────────────────────────────
  if (result) {
    return (
      <AuthShell
        title="Account created! 🎉"
        subtitle={result.message}
        sideTitle="One step away"
        sideBody="Verify your account to start booking and offering rides across Hyderabad campus routes."
      >
        <div className="space-y-5">
          {/* Normal flow: email OTP sent */}
          {!result.otp && !result.emailVerified && (
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-6 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100">
                <Mail className="h-7 w-7 text-indigo-600" />
              </div>
              <p className="font-semibold text-indigo-900">Check your email!</p>
              <p className="mt-1 text-sm text-indigo-700">
                We sent a 6-digit OTP to <strong>{email}</strong>
              </p>
              <p className="mt-1 text-xs text-indigo-500">Redirecting to OTP entry…</p>
            </div>
          )}

          {/* Auto-verified flow */}
          {result.emailVerified && !result.otp && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
              <CheckCircle2 className="mx-auto mb-2 h-10 w-10 text-emerald-500" />
              <p className="font-semibold text-emerald-900">Account verified!</p>
              <p className="mt-1 text-xs text-emerald-700">Redirecting to login…</p>
            </div>
          )}

          {/* Fallback: OTP shown on screen (only when MAIL_ENABLED=false) */}
          {result.otp && (
            <div className="rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 p-6 text-center shadow-sm">
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-indigo-500">
                Your verification OTP
              </p>
              <div className="my-3 flex items-center justify-center gap-2">
                {result.otp.split("").map((digit, i) => (
                  <span key={i}
                    className="flex h-12 w-10 items-center justify-center rounded-xl bg-white text-2xl font-bold text-indigo-700 shadow ring-1 ring-indigo-200">
                    {digit}
                  </span>
                ))}
              </div>
              <button onClick={copyOtp}
                className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700">
                {copied ? <><CheckCircle2 className="h-3.5 w-3.5" /> Copied!</> : <><Copy className="h-3.5 w-3.5" /> Copy OTP</>}
              </button>
              <p className="mt-2 text-xs text-slate-500">Valid for 30 minutes</p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <GradientButton type="button" className="w-full"
              onClick={() => navigate(`/auth/verify-otp?email=${encodeURIComponent(email)}`)}>
              Enter OTP <ArrowRight className="ml-1.5 inline h-4 w-4" />
            </GradientButton>
            <Link to={`/auth/login?email=${encodeURIComponent(email)}`}
              className="block text-center text-sm font-semibold text-blue-600 hover:underline">
              Already verified? Go to Login
            </Link>
          </div>
        </div>
      </AuthShell>
    );
  }

  // ── Signup form ───────────────────────────────────────────────────────────
  return (
    <AuthShell
      title="Create your account"
      subtitle="Join the verified campus mobility network."
      sideTitle="Join the movement"
      sideBody="Save money, meet verified campus commuters, and travel sustainably across Hyderabad. Any verified student can offer or book rides — no separate driver account needed."
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <FormField label="Full name">
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <User className="h-4 w-4" />
            </span>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-11" required />
          </div>
        </FormField>
        <FormField label="Email">
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Mail className="h-4 w-4" />
            </span>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} className="pl-11" type="email" required />
          </div>
        </FormField>
        <FormField label="Phone (recommended)">
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Phone className="h-4 w-4" />
            </span>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-11" placeholder="+91 9XXXXXXXXX" />
          </div>
          <div className="mt-2 text-xs text-slate-500">Shown to riders only after booking.</div>
        </FormField>
        <FormField label="Gender">
          <select value={gender} onChange={(e) => setGender(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-950 outline-none shadow-sm transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            required>
            <option value="" disabled>Select Gender</option>
            <option value="FEMALE">Female</option>
            <option value="MALE">Male</option>
            <option value="OTHER">Other</option>
          </select>
        </FormField>
        <FormField label="Password (min 8 chars)">
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Lock className="h-4 w-4" />
            </span>
            <Input value={password} onChange={(e) => setPassword(e.target.value)} className="pl-11" type="password" required />
          </div>
        </FormField>
        {error && <div className="text-sm text-rose-600">{error}</div>}
        <GradientButton disabled={busy} type="submit" className="w-full">
          {busy ? "Creating..." : "Create account"}
        </GradientButton>
      </form>
      <div className="mt-5 text-sm text-slate-600">
        Already have an account?{" "}
        <Link className="font-semibold text-blue-600 hover:underline" to="/auth/login">Login</Link>
      </div>
    </AuthShell>
  );
}
