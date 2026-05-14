import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Card } from "../components/Card";
import { FormField } from "../components/FormField";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { PageHeader } from "../components/PageHeader";

type Me = {
  id: number;
  email: string;
  fullName: string;
  phone: string | null;
  collegeId: string | null;
  collegeVerified: boolean;
  role: string;
  createdAt: string;
};

export function ProfilePage() {
  const [me, setMe] = useState<Me | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    setError(null);
    try {
      const res = await api.get<Me>("/api/me");
      setMe(res.data);
      setFullName(res.data.fullName ?? "");
      setPhone(res.data.phone ?? "");
      setCollegeId(res.data.collegeId ?? "");
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to load profile");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await api.put<Me>("/api/me", {
        fullName,
        phone: phone.trim() ? phone.trim() : null,
        collegeId: collegeId.trim() ? collegeId.trim() : null
      });
      setMe(res.data);
      setError("Saved.");
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Save failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <PageHeader
        title="Profile"
        subtitle="Manage your personal details and college ID."
        imageUrl="https://images.unsplash.com/photo-1551836022-deb4988cc6c0?auto=format&fit=crop&w=1600&q=80"
      />
      <Card title="My profile">
        {me ? (
          <div className="grid gap-2 text-sm text-slate-700">
            <div>
              <span className="font-medium">Email:</span> {me.email}
            </div>
            <div>
              <span className="font-medium">Role:</span> {me.role}
            </div>
            <div>
              <span className="font-medium">College verified:</span> {me.collegeVerified ? "Yes" : "No"}
            </div>
            <div>
              <span className="font-medium">Joined:</span> {new Date(me.createdAt).toLocaleString()}
            </div>
          </div>
        ) : (
          <div className="text-sm text-slate-600">Loading...</div>
        )}
      </Card>

      <Card title="Update details">
        <form className="space-y-4" onSubmit={save}>
          <FormField label="Full name">
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </FormField>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Phone (optional)">
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </FormField>
            <FormField label="College ID (optional)">
              <Input value={collegeId} onChange={(e) => setCollegeId(e.target.value)} />
            </FormField>
          </div>
          {error ? <div className="text-sm text-slate-700">{error}</div> : null}
          <Button disabled={busy} type="submit">
            {busy ? "Saving..." : "Save"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
