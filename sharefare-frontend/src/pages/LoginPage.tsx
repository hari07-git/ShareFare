import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../state/auth";
import { AuthShell } from "../components/AuthShell";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";

function FloatingInput({
  label,
  icon: Icon,
  type = "text",
  value,
  onChange,
  required = false,
  rightElement
}: {
  label: string;
  icon: any;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  rightElement?: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <div className="relative rounded-xl border border-slate-200 bg-white shadow-xs focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all duration-200">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          <Icon className="h-4.5 w-4.5" />
        </span>
        <input
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          placeholder=" "
          className="peer w-full rounded-xl bg-transparent pl-11 pr-10 pt-5 pb-2 text-sm font-semibold text-slate-950 outline-none"
        />
        <label className="pointer-events-none absolute left-11 top-3.5 -translate-y-1/2 text-[10px] font-bold text-indigo-550 uppercase tracking-wider transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:font-medium peer-placeholder-shown:text-slate-400 peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:top-3.5 peer-focus:text-[10px] peer-focus:font-bold peer-focus:text-indigo-650 peer-focus:uppercase peer-focus:tracking-wider">
          {label}
        </label>
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
            {rightElement}
          </div>
        )}
      </div>
    </div>
  );
}

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resendBusy, setResendBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

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
        <FloatingInput
          label="Email"
          icon={Mail}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <FloatingInput
          label="Password"
          icon={Lock}
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-slate-400 hover:text-slate-600 transition p-1"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        />

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

        <button
          disabled={busy}
          type="submit"
          className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm py-3.5 transition shadow-lg hover:shadow-indigo-500/10 active:scale-[0.98]"
        >
          {busy ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <div className="mt-5 text-sm text-slate-600 text-center sm:text-left">
        No account? <Link className="font-semibold text-blue-600 hover:underline" to="/auth/register">Register</Link>
      </div>
    </AuthShell>
  );
}
