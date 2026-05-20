import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../state/auth";
import { FormField } from "../components/FormField";
import { Input } from "../components/Input";
import { GradientButton } from "../components/GradientButton";
import { AuthShell } from "../components/AuthShell";
import { Lock, Mail } from "lucide-react";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resendBusy, setResendBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const auth = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    const initialEmail = params.get("email");
    if (initialEmail) setEmail(initialEmail);
  }, [params]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setBusy(true);
    try {
      const res = await api.post<{ token: string }>("/api/auth/login", { email, password });
      auth.login(res.data.token);
      await auth.refreshMe();
      navigate("/rides/find");
    } catch (err: any) {
      if (!err.response) {
        setError("Backend server is not running");
      } else {
        setError(err.response.data?.message ?? "Login failed");
      }
    } finally {
      setBusy(false);
    }
  }

  async function resendVerification() {
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
      if (!err.response) {
        setError("Backend server is not running");
      } else {
        setError(err.response.data?.message ?? "Could not resend verification email");
      }
    } finally {
      setResendBusy(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Only verified students can book and publish rides."
      sideTitle="ShareFare"
      sideBody="Verified campus mobility platform. Connecting verified students to coordinate rides, save money, and build a trusted commuter network."
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <FormField label="Email">
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Mail className="h-4 w-4" />
            </span>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} className="pl-11" type="email" required />
          </div>
        </FormField>
        <FormField label="Password">
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Lock className="h-4 w-4" />
            </span>
            <Input value={password} onChange={(e) => setPassword(e.target.value)} className="pl-11" type="password" required />
          </div>
        </FormField>
        <div className="text-right text-sm">
          <Link className="font-semibold text-blue-600 hover:underline" to="/auth/forgot-password">Forgot password?</Link>
        </div>
        {message ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{message}</div> : null}
        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            <div>{error}</div>
            {error.toLowerCase().includes("verify") ? (
              <div className="mt-2 flex flex-wrap gap-3">
                <button type="button" onClick={resendVerification} disabled={resendBusy} className="font-semibold text-blue-600 hover:underline">
                  {resendBusy ? "Sending..." : "Resend OTP"}
                </button>
                <Link className="font-semibold text-blue-600 hover:underline" to={`/auth/verify-otp?email=${encodeURIComponent(email)}`}>
                  Enter OTP
                </Link>
              </div>
            ) : null}
          </div>
        ) : null}
        <GradientButton disabled={busy} type="submit" className="w-full">
          {busy ? "Signing in..." : "Sign in"}
        </GradientButton>
      </form>
      <div className="mt-5 text-sm text-slate-600">
        No account? <Link className="font-semibold text-blue-600 hover:underline" to="/auth/register">Register</Link>
      </div>
    </AuthShell>
  );
}
