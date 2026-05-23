import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sun, Moon, Laptop, ArrowLeft, Paintbrush, Monitor, Eye } from "lucide-react";
import { GradientButton } from "../components/GradientButton";
import { useAuth } from "../state/auth";
import { toast } from "../components/Toast";

export function DarkModePage() {
  const { me } = useAuth();
  const userId = me?.id ?? 0;
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");

  useEffect(() => {
    if (userId) {
      const stored = localStorage.getItem(`app_theme_${userId}`);
      if (stored === "dark" || stored === "light" || stored === "system") {
        setTheme(stored);
      }
    }
  }, [userId]);

  const handleSave = () => {
    if (userId) {
      localStorage.setItem(`app_theme_${userId}`, theme);
      toast(`App theme set to ${theme.toUpperCase()} successfully! 🌗`, "success");
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Navigation Header */}
      <div className="mb-6">
        <Link to="/me/profile" className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition">
          <ArrowLeft className="h-4 w-4" /> Back to Profile
        </Link>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
            <Paintbrush className="h-3.5 w-3.5" /> Appearance Settings
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dark Mode & Themes</h1>
          <p className="text-sm leading-relaxed text-slate-600">
            Customize the look and feel of your campus mobility dashboard. Select your preferred color theme or default to your system preferences automatically.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Theme Selectors */}
          <div className="space-y-4 flex flex-col justify-between">
            <div className="space-y-2.5">
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Select Mode</span>

              {/* Light Mode */}
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border text-sm font-semibold transition text-left ${
                  theme === "light"
                    ? "border-indigo-200 bg-indigo-50/50 text-indigo-700 shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Sun className="h-5 w-5 text-amber-500" /> Light Mode
                </span>
                {theme === "light" && <span className="h-2 w-2 rounded-full bg-indigo-600" />}
              </button>

              {/* Dark Mode */}
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border text-sm font-semibold transition text-left ${
                  theme === "dark"
                    ? "border-indigo-200 bg-indigo-50/50 text-indigo-700 shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Moon className="h-5 w-5 text-indigo-500" /> Dark Mode
                </span>
                {theme === "dark" && <span className="h-2 w-2 rounded-full bg-indigo-600" />}
              </button>

              {/* System Mode */}
              <button
                type="button"
                onClick={() => setTheme("system")}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border text-sm font-semibold transition text-left ${
                  theme === "system"
                    ? "border-indigo-200 bg-indigo-50/50 text-indigo-700 shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Laptop className="h-5 w-5 text-slate-500" /> Follow System
                </span>
                {theme === "system" && <span className="h-2 w-2 rounded-full bg-indigo-600" />}
              </button>
            </div>

            <GradientButton onClick={handleSave} className="w-full mt-4">
              Apply Theme
            </GradientButton>
          </div>

          {/* Interactive Live Preview Mockup */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3 flex flex-col justify-center">
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-slate-400" /> Live App Preview Mockup
            </span>

            <div
              className={`rounded-2xl p-5 shadow-lg border transition-all duration-500 ease-in-out ${
                theme === "dark"
                  ? "bg-slate-900 border-slate-800 text-white shadow-slate-950/40"
                  : "bg-white border-slate-200 text-slate-950"
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-dashed border-slate-200/10 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider">ShareFare App</span>
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </div>

              {/* Mockup Card Content */}
              <div
                className={`p-3.5 rounded-xl border text-xs leading-relaxed space-y-2.5 transition duration-500 ${
                  theme === "dark"
                    ? "bg-slate-850 border-slate-800 text-slate-300"
                    : "bg-slate-50 border-slate-100 text-slate-600"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-[10px] font-black text-white shrink-0">
                    SF
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 leading-none dark:text-white">Active Hyderabad Ride</div>
                    <span className="text-[10px] text-slate-400">ETA: 12 mins</span>
                  </div>
                </div>

                <div className="space-y-1 bg-white/5 p-2 rounded-lg text-[10px]">
                  <div className="flex justify-between font-medium">
                    <span>Route:</span>
                    <span className="text-indigo-400 font-semibold">IIIT → Gachibowli</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Fare Split:</span>
                    <span className="text-emerald-400 font-semibold">₹45.00</span>
                  </div>
                </div>
              </div>

              <div className="mt-3.5 flex justify-center">
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wide ${
                    theme === "dark"
                      ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                      : "bg-indigo-50 text-indigo-700 border border-indigo-100"
                  }`}
                >
                  ⚡ Previewing {theme.toUpperCase()} Interface
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
