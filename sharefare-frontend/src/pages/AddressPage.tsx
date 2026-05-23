import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, ArrowLeft, Home, BookOpen, Compass, CheckCircle } from "lucide-react";
import { GradientButton } from "../components/GradientButton";
import { useAuth } from "../state/auth";
import { toast } from "../components/Toast";

export function AddressPage() {
  const { me } = useAuth();
  const userId = me?.id ?? 0;

  const [college, setCollege] = useState("IIIT Hyderabad");
  const [area, setArea] = useState("");
  const [landmark, setLandmark] = useState("");
  const [pincode, setPincode] = useState("");
  const [city, setCity] = useState("Hyderabad");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (userId) {
      const stored = localStorage.getItem(`saved_address_${userId}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setCollege(parsed.college ?? "IIIT Hyderabad");
          setArea(parsed.area ?? "");
          setLandmark(parsed.landmark ?? "");
          setPincode(parsed.pincode ?? "");
          setCity(parsed.city ?? "Hyderabad");
        } catch (e) {
          console.error("Failed to parse saved address", e);
        }
      }
    }
  }, [userId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setTimeout(() => {
      const addressData = { college, area, landmark, pincode, city };
      localStorage.setItem(`saved_address_${userId}`, JSON.stringify(addressData));
      toast("Locations updated successfully! 📍", "success");
      setBusy(false);
    }, 1000);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Navigation Header */}
      <div className="mb-6">
        <Link to="/me/profile" className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition">
          <ArrowLeft className="h-4 w-4" /> Back to Profile
        </Link>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
            <MapPin className="h-3.5 w-3.5" /> Campus Preferences
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Saved Locations</h1>
          <p className="text-sm leading-relaxed text-slate-600">
            Configure your standard university campus and home coordinates. This allows ShareFare to auto-populate quick routes recommendations for your matching commutes.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* College Section */}
          <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100/50 space-y-3">
            <h3 className="text-sm font-bold text-indigo-950 flex items-center gap-2">
              <BookOpen className="h-4.5 w-4.5 text-indigo-600" /> University Campus
            </h3>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Primary Campus Location</label>
              <select
                value={college}
                onChange={e => setCollege(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              >
                <option value="IIIT Hyderabad">IIIT Hyderabad (Gachibowli)</option>
                <option value="JNTU Hyderabad">JNTU Hyderabad (Kukatpally)</option>
                <option value="HCU">University of Hyderabad (HCU)</option>
                <option value="CBIT">CBIT (Gandipet)</option>
                <option value="VNR VJIET">VNR VJIET (Bachupally)</option>
                <option value="Osmania University">Osmania University (Tarnaka)</option>
              </select>
            </div>
          </div>

          {/* Home Section */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
            <h3 className="text-sm font-bold text-slate-950 flex items-center gap-2">
              <Home className="h-4.5 w-4.5 text-indigo-500" /> Saved Home Address
            </h3>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Area / Sub-locality</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Madhapur, Pragathi Nagar, Gachibowli"
                  value={area}
                  onChange={e => setArea(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Landmark (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. near Metro Station, Cyber Towers"
                    value={landmark}
                    onChange={e => setLandmark(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Pincode</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="e.g. 500081"
                    value={pincode}
                    onChange={e => setPincode(e.target.value.replace(/\D/g, ""))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">City</label>
                <input
                  type="text"
                  required
                  disabled
                  value={city}
                  className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm text-slate-500 outline-none cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <GradientButton type="submit" disabled={busy} className="w-full">
            {busy ? "Saving coordinates..." : "Save Locations"}
          </GradientButton>
        </form>
      </div>
    </div>
  );
}
