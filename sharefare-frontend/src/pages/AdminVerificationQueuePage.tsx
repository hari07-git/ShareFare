import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { PageHeader } from "../components/PageHeader";
import { ShieldCheck, Maximize2, X, AlertTriangle, Calendar, Phone, Mail } from "lucide-react";

type PendingVerification = {
  userId: number;
  email: string;
  fullName: string;
  verificationStatus: string;
  idCardUrl: string;
  idCardUploadedAt: string;
  uploadAttempts: number;
  emailVerified: boolean;
  phoneVerified: boolean;
  joinedDate: string;
};

export function AdminVerificationQueuePage() {
  const [items, setItems] = useState<PendingVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Action Modal State
  const [modalUserId, setModalUserId] = useState<number | null>(null);
  const [modalAction, setModalAction] = useState<"REJECT" | "REQUEST_REUPLOAD">("REJECT");
  const [rejectReason, setRejectReason] = useState("");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<PendingVerification[]>("/api/admin/verification/pending");
      setItems(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to load verification queue");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function processAction(userId: number, action: "APPROVE" | "REJECT" | "REQUEST_REUPLOAD", note: string, rejectionReason?: string) {
    setBusyId(userId);
    try {
      await api.post(`/api/admin/verification/${userId}/action`, { action, note, rejectionReason });
      await load();
      if (action === "REJECT" || action === "REQUEST_REUPLOAD") {
        setModalUserId(null);
        setRejectReason("");
      }
    } catch (err: any) {
      alert(err?.response?.data?.message ?? "Action failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Verification queue"
        subtitle="Review and manually approve uploaded student IDs."
        imageUrl="/images/campus-commute.jpg"
      />
      
      {error ? <div className="text-sm text-rose-600 bg-rose-50 p-4 rounded-xl border border-rose-200">{error}</div> : null}
      
      {loading ? (
        <div className="text-sm text-slate-600">Loading queue...</div>
      ) : items.length === 0 ? (
        <Card title="Queue empty" subtitle="You're all caught up!">
          <div className="flex flex-col items-center justify-center py-10 text-slate-400">
            <ShieldCheck className="h-12 w-12 mb-3 text-emerald-400" />
            <p>No pending manual reviews.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.userId} title={`Review: ${item.fullName}`}>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-6">
                  
                  {/* Basic Details */}
                  <div className="grid gap-3 text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2 mb-2 font-semibold text-slate-900 border-b border-slate-200 pb-2">
                      Basic Details
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">User Email</span>
                      <span>{item.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Uploaded At</span>
                      <span>{new Date(item.idCardUploadedAt).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Status</span>
                      <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-xs font-bold">
                        {item.verificationStatus}
                      </span>
                    </div>
                  </div>

                  {/* Verification Notes */}
                  <div className="grid gap-3 text-sm text-slate-700 bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-2 mb-2 font-semibold text-blue-900 border-b border-blue-200 pb-2">
                      Verification Notes
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-slate-500" /> <span className="font-medium">Email Verified</span></div>
                      <span className={item.emailVerified ? "text-emerald-600 font-bold" : "text-rose-500 font-bold"}>
                        {item.emailVerified ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-slate-500" /> <span className="font-medium">Phone Verified</span></div>
                      <span className={item.phoneVerified ? "text-emerald-600 font-bold" : "text-rose-500 font-bold"}>
                        {item.phoneVerified ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-slate-500" /> <span className="font-medium">Joined Date</span></div>
                      <span>{item.joinedDate ? new Date(item.joinedDate).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Image and Actions */}
                <div className="space-y-4 flex flex-col">
                  {/* Image Preview Container */}
                  <div 
                    className="flex-1 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center relative cursor-pointer group min-h-[250px]"
                    onClick={() => {
                      if (item.idCardUrl) {
                        setSelectedImage(`http://localhost:8080/uploads/student-ids/${item.idCardUrl}`);
                      }
                    }}
                  >
                    {item.idCardUrl ? (
                      <>
                        <img 
                          src={`http://localhost:8080/uploads/student-ids/${item.idCardUrl}`} 
                          alt="Student ID" 
                          className="w-full h-full object-contain absolute inset-0 p-2"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <div className="hidden flex flex-col items-center gap-2 text-slate-500 p-4 text-center">
                          <AlertTriangle className="w-8 h-8 text-amber-500" />
                          <p className="text-sm font-medium">Image not found on server</p>
                          <p className="text-xs text-slate-400 truncate max-w-full">uploads/student-ids/{item.idCardUrl}</p>
                        </div>
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                          <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full text-white">
                            <Maximize2 className="w-6 h-6" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <span className="text-slate-400 text-sm">No ID image uploaded</span>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="grid grid-cols-3 gap-2">
                    <Button 
                      variant="primary" 
                      disabled={busyId === item.userId}
                      onClick={() => processAction(item.userId, "APPROVE", "Manually approved by admin")}
                      className="py-3 shadow-md px-2"
                    >
                      <ShieldCheck className="w-4 h-4 mr-1 inline-block" />
                      Approve
                    </Button>
                    <Button 
                      variant="secondary" 
                      disabled={busyId === item.userId}
                      onClick={() => { setModalAction("REQUEST_REUPLOAD"); setModalUserId(item.userId); }}
                      className="py-3 shadow-md px-2"
                    >
                      <AlertTriangle className="w-4 h-4 mr-1 inline-block" />
                      Re-upload
                    </Button>
                    <Button 
                      variant="danger" 
                      disabled={busyId === item.userId}
                      onClick={() => { setModalAction("REJECT"); setModalUserId(item.userId); }}
                      className="py-3 shadow-md px-2"
                    >
                      <X className="w-4 h-4 mr-1 inline-block" />
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center">
            <button 
              className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-6 h-6" />
            </button>
            <img 
              src={selectedImage} 
              alt="Fullscreen ID preview" 
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl bg-slate-900"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Action Reason Modal */}
      {modalUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-rose-50/50">
              <h3 className="text-lg font-semibold text-rose-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                {modalAction === "REJECT" ? "Reject Verification" : "Request Re-upload"}
              </h3>
              <button 
                onClick={() => { setModalUserId(null); setRejectReason(""); }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600">
                Please provide a reason. This will be sent to the student via email.
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full min-h-[120px] p-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none resize-none"
                placeholder="e.g. The uploaded image is blurry, please upload a clear picture of your ID."
              />
            </div>
            <div className="p-6 pt-0 flex gap-3">
              <Button 
                variant="secondary" 
                className="flex-1"
                onClick={() => { setModalUserId(null); setRejectReason(""); }}
              >
                Cancel
              </Button>
              <Button 
                variant="danger" 
                className="flex-1"
                disabled={busyId === modalUserId || rejectReason.trim().length === 0}
                onClick={() => processAction(modalUserId, modalAction, modalAction === "REJECT" ? "Admin rejected" : "Admin requested re-upload", rejectReason)}
              >
                {busyId === modalUserId ? "Processing..." : "Confirm"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
