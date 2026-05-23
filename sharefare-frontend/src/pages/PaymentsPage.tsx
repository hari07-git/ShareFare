import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BadgeIndianRupee, ArrowLeft, ShieldCheck, RefreshCw, Landmark, CreditCard, Clock, FileText } from "lucide-react";
import { GradientButton } from "../components/GradientButton";
import { useAuth } from "../state/auth";
import { toast } from "../components/Toast";

type Transaction = {
  id: number;
  rideId: number;
  amount: number;
  status: "COMPLETED" | "REFUNDED" | "PROCESSING";
  date: string;
  label: string;
};

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 10293,
    rideId: 44,
    amount: 50,
    status: "COMPLETED",
    date: "May 19, 2026",
    label: "Gachibowli to IIIT (Passenger fare)"
  },
  {
    id: 93820,
    rideId: 23,
    amount: 45,
    status: "REFUNDED",
    date: "May 14, 2026",
    label: "Kukatpally to JNTU (Cancellation refund)"
  },
  {
    id: 82039,
    rideId: 19,
    amount: 60,
    status: "PROCESSING",
    date: "May 10, 2026",
    label: "CBIT to Madhapur (Refund processing)"
  }
];

export function PaymentsPage() {
  const { me } = useAuth();
  const userId = me?.id ?? 0;

  // Payout Bank Form State
  const [bankName, setBankName] = useState("");
  const [holderName, setHolderName] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (userId) {
      const stored = localStorage.getItem(`saved_payout_${userId}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setBankName(parsed.bankName ?? "");
          setHolderName(parsed.holderName ?? "");
          setIfsc(parsed.ifsc ?? "");
          setAccountNo(parsed.accountNo ?? "");
        } catch (e) {
          console.error("Failed to parse saved bank details", e);
        }
      }
    }
  }, [userId]);

  const handleBankSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setTimeout(() => {
      const payoutData = { bankName, holderName, ifsc, accountNo };
      localStorage.setItem(`saved_payout_${userId}`, JSON.stringify(payoutData));
      toast("Bank payout details updated successfully! 🏦", "success");
      setBusy(false);
    }, 1000);
  };

  const getStatusStyle = (status: Transaction["status"]) => {
    switch (status) {
      case "COMPLETED": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "REFUNDED": return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "PROCESSING": return "bg-amber-50 text-amber-700 border-amber-200";
      default: return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Navigation Header */}
      <div className="mb-6">
        <Link to="/me/profile" className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition">
          <ArrowLeft className="h-4 w-4" /> Back to Profile
        </Link>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
            <BadgeIndianRupee className="h-3.5 w-3.5" /> Payments & Splits
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Payments & Refunds</h1>
          <p className="text-sm leading-relaxed text-slate-600">
            Monitor your ride fuel-cost share transactions, refunds history, and manage your student bank account payout credentials.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Column: Metrics & Payout Methods Form */}
          <div className="lg:col-span-7 space-y-6">
            {/* Split metrics dashboard */}
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Total Spent</span>
                <span className="text-xl font-bold text-slate-900 mt-1 block">₹235.00</span>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Received Splits</span>
                <span className="text-xl font-bold text-slate-900 mt-1 block">₹480.00</span>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Refunds Issued</span>
                <span className="text-xl font-bold text-indigo-600 mt-1 block">₹45.00</span>
              </div>
            </div>

            {/* Bank details form */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-950 flex items-center gap-2">
                  <Landmark className="h-4.5 w-4.5 text-indigo-500" /> Bank Payout Account
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Add details to receive cost-sharing split transfers from passengers booked on your rides.
                </p>
              </div>

              <form onSubmit={handleBankSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Bank Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. State Bank of India, HDFC"
                    value={bankName}
                    onChange={e => setBankName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Account Holder Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Full name as in bank passbook"
                    value={holderName}
                    onChange={e => setHolderName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">IFSC Code</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SBIN0001234"
                      value={ifsc}
                      onChange={e => setIfsc(e.target.value.toUpperCase())}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Account Number</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 10002938481"
                      value={accountNo}
                      onChange={e => setAccountNo(e.target.value.replace(/\D/g, ""))}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <GradientButton type="submit" disabled={busy} className="w-full">
                  {busy ? "Saving bank details..." : "Save Payout Method"}
                </GradientButton>
              </form>
            </div>
          </div>

          {/* Right Column: Transaction & Refunds Ledger */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-950 flex items-center gap-2">
                  <FileText className="h-4.5 w-4.5 text-indigo-500" /> Transaction Logs
                </h3>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Latest Transactions</span>
              </div>

              <div className="space-y-3">
                {INITIAL_TRANSACTIONS.map((tx) => (
                  <div
                    key={tx.id}
                    className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between gap-4 font-bold text-slate-900">
                      <span className="truncate">{tx.label}</span>
                      <span className="shrink-0 text-sm">₹{tx.amount}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 text-slate-400 font-semibold">
                      <span>Trip #{tx.rideId} • ID: #{tx.id}</span>
                      <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold ${getStatusStyle(tx.status)}`}>
                        {tx.status}
                      </span>
                    </div>
                    <div className="text-[9px] text-slate-400 text-right font-medium">{tx.date}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
