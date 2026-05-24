import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { FormField } from "../components/FormField";
import { Input } from "../components/Input";
import { GradientButton } from "../components/GradientButton";
import { AuthShell } from "../components/AuthShell";
import { Mail, CheckCircle2, ArrowRight } from "lucide-react";

type ForgotPasswordResponse = {
  message: string;
};

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onRequestReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setBusy(true);
    try {
      const res = await api.post<ForgotPasswordResponse>("/api/auth/forgot-password", { email });
      setMessage(res.data.message);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Request failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell title="Forgot password?" subtitle="Enter your registered email and we'll send a secure reset link."
      sideTitle="Secure reset" sideBody="Reset links expire quickly and are usable only once, keeping your bookings and contact details protected.">
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
        {message && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            <CheckCircle2 className="mr-2 inline h-4 w-4" />
            {message} Check your inbox, spam, and promotions folders.
          </div>
        )}
        {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
        <GradientButton disabled={busy} type="submit" className="w-full">
          {busy ? "Sending..." : <>Send reset link <ArrowRight className="ml-1.5 inline h-4 w-4" /></>}
        </GradientButton>
      </form>
      <div className="mt-5 text-sm text-slate-600">
        Remember it?{" "}
        <Link className="font-semibold text-blue-600 hover:underline" to="/auth/login">Back to Login</Link>
      </div>
    </AuthShell>
  );
}
