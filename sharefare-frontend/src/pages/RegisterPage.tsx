import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Card } from "../components/Card";
import { FormField } from "../components/FormField";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { PageHeader } from "../components/PageHeader";

type Role = "STUDENT" | "DRIVER";

export function RegisterPage() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("STUDENT");
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
    <div className="mx-auto max-w-md space-y-6">
      <PageHeader
        title="Register"
        subtitle="Create your ShareFare account in seconds."
        imageUrl="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80"
      />
      <Card title="Create account" subtitle="Choose Student or Driver (Driver can offer rides and see inbox)">
        <form className="space-y-4" onSubmit={onSubmit}>
          <FormField label="Full name">
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </FormField>
          <FormField label="Email">
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </FormField>
          <FormField label="Password (min 8 chars)">
            <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
          </FormField>
          <FormField label="Role">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            >
              <option value="STUDENT">Student</option>
              <option value="DRIVER">Driver</option>
            </select>
          </FormField>
          {error ? <div className="text-sm text-red-600">{error}</div> : null}
          <Button disabled={busy} type="submit">
            {busy ? "Creating..." : "Create account"}
          </Button>
        </form>
        <div className="mt-4 text-sm text-slate-700">
          Already have an account? <Link className="underline" to="/auth/login">Login</Link>
        </div>
      </Card>
    </div>
  );
}
