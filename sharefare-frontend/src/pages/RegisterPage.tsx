import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { FormField } from "../components/FormField";
import { Input } from "../components/Input";
import { GradientButton } from "../components/GradientButton";
import { AuthShell } from "../components/AuthShell";
import { Lock, Mail, Phone, User } from "lucide-react";

type Role = "STUDENT" | "DRIVER";

export function RegisterPage() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("STUDENT");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await api.post("/api/auth/register", { email, password, fullName, role });
      navigate("/auth/login");
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join ShareFare in seconds. Choose Student or Driver (drivers can offer rides)."
      sideTitle="Join the movement"
      sideBody="Save money, meet verified commuters, and travel sustainably across Hyderabad."
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
            <div className="mt-2 text-xs text-slate-300/80">
              You can update phone anytime from Profile. Phone is shown to riders only after booking.
            </div>
          </FormField>
          <FormField label="Password (min 8 chars)">
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock className="h-4 w-4" />
              </span>
              <Input value={password} onChange={(e) => setPassword(e.target.value)} className="pl-11" type="password" required />
            </div>
          </FormField>
          <FormField label="Role">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-300/25"
            >
              <option value="STUDENT">Student</option>
              <option value="DRIVER">Driver</option>
            </select>
          </FormField>
          {error ? <div className="text-sm text-rose-300">{error}</div> : null}
          <GradientButton disabled={busy} type="submit" className="w-full">
            {busy ? "Creating..." : "Create account"}
          </GradientButton>
        </form>
        <div className="mt-5 text-sm text-slate-300/90">
          Already have an account? <Link className="font-semibold text-white hover:underline" to="/auth/login">Login</Link>
        </div>
    </AuthShell>
  );
}
