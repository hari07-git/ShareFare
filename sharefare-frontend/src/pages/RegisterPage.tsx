import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { FormField } from "../components/FormField";
import { Input } from "../components/Input";
import { GradientButton } from "../components/GradientButton";
import { AuthShell } from "../components/AuthShell";
import { Lock, Mail, Phone, User } from "lucide-react";

export function RegisterPage() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setBusy(true);
    try {
      if (!gender) {
        setError("Please select your gender");
        setBusy(false);
        return;
      }
      const res = await api.post<{ message: string }>("/api/auth/register", {
        email,
        password,
        fullName,
        phone: phone.trim() || null,
        gender,
      });
      setMessage(res.data.message);
      navigate(`/auth/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      if (!err.response) {
        setError("Backend server is not running");
      } else {
        setError(err.response.data?.message ?? "Registration failed");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join the verified campus mobility network. Verify your student ID to offer or book rides."
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
          <div className="mt-2 text-xs text-slate-500">
            You can update phone anytime from Profile. Phone is shown to riders only after booking.
          </div>
        </FormField>
        <FormField label="Gender">
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-950 outline-none shadow-sm transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            required
          >
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
        {message ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{message}</div> : null}
        {error ? <div className="text-sm text-rose-600">{error}</div> : null}
        <GradientButton disabled={busy} type="submit" className="w-full">
          {busy ? "Creating..." : "Create account"}
        </GradientButton>
      </form>
      <div className="mt-5 text-sm text-slate-600">
        Already have an account? <Link className="font-semibold text-blue-600 hover:underline" to="/auth/login">Login</Link>
      </div>
    </AuthShell>
  );
}
