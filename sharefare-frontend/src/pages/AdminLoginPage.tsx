import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../state/auth";
import { Card } from "../components/Card";
import { FormField } from "../components/FormField";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { PageHeader } from "../components/PageHeader";

export function AdminLoginPage() {
  const [email, setEmail] = useState("admin@sharefare.com");
  const [password, setPassword] = useState("Admin@12345");
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
      const me = await api.get("/api/me");
      if (me.data.role !== "ADMIN") {
        auth.logout();
        setError("This account is not an admin.");
        return;
      }
      await auth.refreshMe();
      navigate("/admin");
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <PageHeader
        title="Admin access"
        subtitle="Sign in to view platform metrics and revenue."
        imageUrl="https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1600&q=80"
      />
      <Card title="Admin login">
        <form className="space-y-4" onSubmit={onSubmit}>
          <FormField label="Admin email">
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
      </Card>
    </div>
  );
}
