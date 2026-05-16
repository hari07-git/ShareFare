import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  const auth = useAuth();
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await api.post<{ token: string }>("/api/auth/login", { email, password });
      auth.login(res.data.token);
      await auth.refreshMe();
      navigate("/rides/find");
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to book rides, manage your profile, and get updates."
      sideTitle="ShareFare"
      sideBody="Premium student mobility for Hyderabad — fast booking, map pins, and trusted community."
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
        {error ? <div className="text-sm text-rose-300">{error}</div> : null}
        <GradientButton disabled={busy} type="submit" className="w-full">
          {busy ? "Signing in..." : "Sign in"}
        </GradientButton>
      </form>
      <div className="mt-5 text-sm text-slate-300/90">
        No account? <Link className="font-semibold text-white hover:underline" to="/auth/register">Register</Link>
      </div>
    </AuthShell>
  );
}
