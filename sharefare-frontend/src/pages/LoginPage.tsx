import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../state/auth";
import { Card } from "../components/Card";
import { FormField } from "../components/FormField";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { PageHeader } from "../components/PageHeader";

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
    <div className="mx-auto max-w-md space-y-6">
      <PageHeader
        title="Login"
        subtitle="Sign in to book rides, manage your profile, and get updates."
        imageUrl="https://images.unsplash.com/photo-1520975661595-6453be3f7070?auto=format&fit=crop&w=1600&q=80"
      />
      <Card title="Login" subtitle="Sign in to book rides, manage profile, and get notifications">
        <form className="space-y-4" onSubmit={onSubmit}>
          <FormField label="Email">
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </FormField>
          <FormField label="Password">
            <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
          </FormField>
          {error ? <div className="text-sm text-red-600">{error}</div> : null}
          <Button disabled={busy} type="submit">
            {busy ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        <div className="mt-4 text-sm text-slate-700">
          No account? <Link className="underline" to="/auth/register">Register</Link>
        </div>
      </Card>
    </div>
  );
}
