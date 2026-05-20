import { useEffect, useRef, useState } from "react";
import { api } from "../lib/api";
import { Button } from "./Button";
import { Card } from "./Card";
import { ShieldAlert, ShieldCheck, UploadCloud, Clock, AlertTriangle } from "lucide-react";
import { toast } from "./Toast";

type VerificationStatus = {
  verificationStatus: "UNVERIFIED" | "PENDING_REVIEW" | "MANUAL_REVIEW" | "ADMIN_VERIFIED" | "REJECTED";
  verificationLevel: number;
  idCardUploadedAt: string | null;
  rejectionReason: string | null;
  collegeName: string | null;
  verifiedAt: string | null;
  collegeVerified: boolean;
};

export function CollegeVerificationComponent() {
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function loadStatus() {
    try {
      const res = await api.get<VerificationStatus>("/api/verification/status");
      setStatus(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadStatus();
  }, []);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast("File size must be less than 10MB", "error");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("idCard", file);

    try {
      await api.post("/api/verification/upload-id", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast("Verification submitted successfully. Awaiting admin approval.", "success");
      await loadStatus();
    } catch (err: any) {
      toast(err?.response?.data?.message ?? "Upload failed", "error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  if (loading) return <div className="text-sm text-slate-500">Loading verification status...</div>;
  if (!status) return null;

  const { verificationStatus, collegeVerified, collegeName, rejectionReason } = status;

  return (
    <Card title="Verify Student Identity" subtitle="Upload your college ID for manual verification by the ShareFare admin team.">
      <div className="space-y-4">
        {verificationStatus === "UNVERIFIED" || verificationStatus === "REJECTED" ? (
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-6 text-center">
            <UploadCloud className="mx-auto mb-3 h-10 w-10 text-indigo-400" />
            <h3 className="text-sm font-semibold text-indigo-950">Upload your physical College ID</h3>
            <p className="mt-1 text-xs text-indigo-700 max-w-sm mx-auto mb-4">
              Please ensure the text is clearly visible and there is no glare.
            </p>
            {(verificationStatus === "REJECTED" || verificationStatus === "UNVERIFIED") && rejectionReason && (
              <div className="mb-4 bg-rose-100 text-rose-800 text-xs p-3 rounded-xl border border-rose-200">
                <AlertTriangle className="inline h-4 w-4 mr-1 mb-0.5" />
                <strong>Previous attempt rejected:</strong> {rejectionReason}
              </div>
            )}
            <input 
              type="file" 
              accept="image/jpeg,image/png,image/webp" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileUpload} 
            />
            <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              {uploading ? "Uploading..." : "Select File"}
            </Button>
          </div>
        ) : verificationStatus === "PENDING_REVIEW" || verificationStatus === "MANUAL_REVIEW" ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 flex items-start gap-4">
            <div className="bg-amber-100 p-2 rounded-full"><Clock className="h-6 w-6 text-amber-600" /></div>
            <div>
              <h3 className="text-sm font-semibold text-amber-900">Pending Verification</h3>
              <p className="text-xs text-amber-800 mt-1">Verification submitted successfully. Awaiting admin approval.</p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 flex items-start gap-4">
            <div className="bg-emerald-100 p-2 rounded-full"><ShieldCheck className="h-6 w-6 text-emerald-600" /></div>
            <div>
              <h3 className="text-sm font-semibold text-emerald-900">Verified Student</h3>
              <p className="text-xs text-emerald-800 mt-1">
                Your college ID is verified{collegeName ? ` for ${collegeName}` : ""}. 
                Your college ID has been verified by an admin.
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
