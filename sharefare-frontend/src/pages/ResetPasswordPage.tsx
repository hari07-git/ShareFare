import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import { AuthShell } from "../components/AuthShell";
import { FormField } from "../components/FormField";
import { Input } from "../components/Input";
import { GradientButton } from "../components/GradientButton";
import { Lock } from "lucide-react";

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const token = params.get("token");
    if (!token) {
      setError("Reset link is missing a token.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      await api.post("/api/auth/reset-password", { token, password });
      navigate("/auth/login");
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Could not reset password");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title="Create new password"
      subtitle="Use a strong password to protect ride bookings and driver contact details."
      sideTitle="Secure account recovery"
      sideBody="Reset links expire quickly and are usable only once."
    >
      <form className="space-y-4" onSubmit={submit}>
        <FormField label="New password">
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Lock className="h-4 w-4" />
            </span>
            <Input value={password} onChange={(e) => setPassword(e.target.value)} className="pl-11" type="password" minLength={8} required />
          </div>
        </FormField>
        <FormField label="Confirm password">
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Lock className="h-4 w-4" />
            </span>
            <Input value={confirm} onChange={(e) => setConfirm(e.target.value)} className="pl-11" type="password" minLength={8} required />
          </div>
        </FormField>
        {error ? <div className="text-sm text-rose-600">{error}</div> : null}
        <GradientButton disabled={busy} type="submit" className="w-full">{busy ? "Updating..." : "Update password"}</GradientButton>
      </form>
      <div className="mt-5 text-sm text-slate-600">
        <Link className="font-semibold text-blue-600 hover:underline" to="/auth/login">Back to login</Link>
      </div>
    </AuthShell>
  );
}
