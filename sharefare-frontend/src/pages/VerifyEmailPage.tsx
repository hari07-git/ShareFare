import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import { AuthShell } from "../components/AuthShell";
import { GradientButton } from "../components/GradientButton";

export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    async function verify() {
      const token = params.get("token");
      if (!token) {
        setStatus("error");
        setMessage("Verification link is missing a token.");
        return;
      }
      try {
        const res = await api.post<{ message: string }>("/api/auth/verify-email", { token });
        setStatus("success");
        setMessage(res.data.message);
      } catch (err: any) {
        setStatus("error");
        setMessage(err?.response?.data?.message ?? "Verification link is invalid or expired.");
      }
    }
    void verify();
  }, [params]);

  return (
    <AuthShell
      title="Email verification"
      subtitle="Secure login starts with a verified email."
      sideTitle="Protected ShareFare account"
      sideBody="Verified email helps protect bookings, password reset, ride updates, and driver communication."
    >
      <div className={`rounded-2xl border p-4 text-sm ${
        status === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : status === "error"
            ? "border-rose-200 bg-rose-50 text-rose-700"
            : "border-slate-200 bg-slate-50 text-slate-700"
      }`}>
        {message}
      </div>
      <Link to="/auth/login" className="mt-5 block">
        <GradientButton className="w-full">{status === "success" ? "Go to login" : "Back to login"}</GradientButton>
      </Link>
    </AuthShell>
  );
}
