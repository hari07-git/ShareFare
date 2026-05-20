import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { AuthShell } from "../components/AuthShell";
import { FormField } from "../components/FormField";
import { Input } from "../components/Input";
import { GradientButton } from "../components/GradientButton";
import { Mail } from "lucide-react";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSent(false);
    setBusy(true);
    try {
      await api.post<{ message: string }>("/api/auth/forgot-password", { email });
      setSent(true);
    } catch (err: any) {
      if (!err.response) {
        setError("Backend server is not running");
      } else {
        const message = err.response.data?.message;
        setError(message && message !== "Internal server error" ? message : "Could not send reset email. Please check the email and try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your account email and we’ll send a secure reset link."
      sideTitle="Account recovery"
      sideBody="A safe recovery flow keeps riders and drivers in control without losing access to bookings."
    >
      <form className="space-y-4" onSubmit={submit}>
        <FormField label="Email">
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Mail className="h-4 w-4" />
            </span>
            <Input value={email} onChange={(event) => setEmail(event.target.value)} className="pl-11" type="email" required />
          </div>
        </FormField>
        {sent ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            Password reset email sent. Please check Gmail and spam.
          </div>
        ) : null}
        {error ? <div className="text-sm text-rose-600">{error}</div> : null}
        <GradientButton disabled={busy} type="submit" className="w-full">{busy ? "Sending..." : "Send reset link"}</GradientButton>
      </form>
      <div className="mt-5 text-sm text-slate-600">
        Remembered it? <Link className="font-semibold text-blue-600 hover:underline" to="/auth/login">Back to login</Link>
      </div>
    </AuthShell>
  );
}
