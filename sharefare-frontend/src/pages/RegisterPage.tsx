import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { AuthShell } from "../components/AuthShell";
import { Lock, Mail, Phone, User, Copy, CheckCircle2, ArrowRight, Eye, EyeOff, Search, ChevronDown } from "lucide-react";

type RegisterResponse = {
  message: string;
  otp: string | null;        // non-null only when MAIL_ENABLED=false (dev/fallback)
  emailVerified: boolean;
};

const COLLEGES = [
  "JNTU Hyderabad",
  "University of Hyderabad",
  "CBIT",
  "VNR VJIET",
  "MGIT",
  "Vasavi College",
  "GRIET",
  "Malla Reddy",
  "OU",
  "BITS Hyderabad"
];

function FloatingInput({
  label,
  icon: Icon,
  type = "text",
  value,
  onChange,
  onBlur,
  error,
  required = false,
  rightElement
}: {
  label: string;
  icon: any;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string | null;
  required?: boolean;
  rightElement?: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <div className="relative rounded-xl border border-slate-200 bg-white shadow-xs focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all duration-200">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          <Icon className="h-4.5 w-4.5" />
        </span>
        <input
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          required={required}
          placeholder=" "
          className="peer w-full rounded-xl bg-transparent pl-11 pr-10 pt-5 pb-2 text-sm font-semibold text-slate-950 outline-none"
        />
        <label className="pointer-events-none absolute left-11 top-3.5 -translate-y-1/2 text-[10px] font-bold text-indigo-550 uppercase tracking-wider transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:font-medium peer-placeholder-shown:text-slate-400 peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:top-3.5 peer-focus:text-[10px] peer-focus:font-bold peer-focus:text-indigo-650 peer-focus:uppercase peer-focus:tracking-wider">
          {label}
        </label>
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
            {rightElement}
          </div>
        )}
      </div>
      {error && <span className="text-[10px] font-bold text-rose-600 px-1">{error}</span>}
    </div>
  );
}

function CollegeSelector({
  value,
  onChange,
  error
}: {
  value: string;
  onChange: (val: string) => void;
  error?: string | null;
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [customMode, setCustomMode] = useState(false);

  const filtered = COLLEGES.filter(c => c.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-1 relative">
      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">
        College / University
      </label>
      
      {!customMode ? (
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-left text-sm font-semibold text-slate-950 outline-none shadow-xs hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 flex justify-between items-center transition"
          >
            <span className={value ? "text-slate-950" : "text-slate-400 font-medium"}>
              {value || "Select your college"}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </button>

          {open && (
            <div className="absolute z-50 w-full mt-1.5 rounded-xl border border-slate-200 bg-white shadow-xl max-h-56 overflow-y-auto p-2 space-y-1">
              <div className="relative flex items-center mb-1">
                <Search className="absolute left-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search college..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full rounded-lg bg-slate-50 border border-slate-200 pl-9 pr-3 py-1.5 text-xs font-semibold outline-none focus:border-indigo-500"
                />
              </div>

              {filtered.length === 0 ? (
                <div className="text-slate-400 text-xs text-center py-2 font-medium">No results found</div>
              ) : (
                filtered.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      onChange(c);
                      setOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition ${value === c ? "bg-indigo-50 text-indigo-700" : "text-slate-700 hover:bg-slate-50"}`}
                  >
                    {c}
                  </button>
                ))
              )}

              <button
                type="button"
                onClick={() => {
                  setCustomMode(true);
                  onChange("");
                  setOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-indigo-650 hover:bg-indigo-50 transition border-t border-slate-100 mt-1"
              >
                ✍️ Type custom college name...
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="relative">
          <input
            type="text"
            required
            placeholder="Type your college name..."
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-950 outline-none shadow-xs hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition"
          />
          <button
            type="button"
            onClick={() => {
              setCustomMode(false);
              onChange("");
              setSearch("");
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-indigo-600 hover:text-indigo-700"
          >
            Choose from list
          </button>
        </div>
      )}
      {error && <span className="text-[10px] font-bold text-rose-600 px-1">{error}</span>}
    </div>
  );
}

export function RegisterPage() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<RegisterResponse | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Custom auth states
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const navigate = useNavigate();

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: "None", color: "bg-slate-200 w-0" };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[a-z]/.test(pwd)) score += 1;
    if (/\d/.test(pwd)) score += 1;
    
    if (score <= 1) return { score, label: "Weak", color: "bg-rose-500 w-1/4" };
    if (score === 2) return { score, label: "Fair", color: "bg-amber-500 w-2/4" };
    if (score === 3) return { score, label: "Good", color: "bg-blue-500 w-3/4" };
    return { score, label: "Strong", color: "bg-emerald-500 w-full" };
  };

  const strength = getPasswordStrength(password);

  const checkEmailDuplicate = async () => {
    if (!email || !email.includes("@")) return;
    try {
      const res = await api.get<boolean>(`/api/auth/check-email?email=${encodeURIComponent(email)}`);
      if (res.data) {
        setEmailError("An account already exists with this email.");
      } else {
        setEmailError(null);
      }
    } catch {
      // Fail silently in case of network issues
    }
  };

  const checkPhoneDuplicate = async () => {
    const cleanPhone = phone.trim();
    if (!cleanPhone || cleanPhone.length < 10) return;
    try {
      const res = await api.get<boolean>(`/api/auth/check-phone?phone=${encodeURIComponent(cleanPhone)}`);
      if (res.data) {
        setPhoneError("Mobile number already linked to another account.");
      } else {
        setPhoneError(null);
      }
    } catch {
      // Fail silently
    }
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (emailError || phoneError) {
      setError("Please fix the validation errors before submitting.");
      return;
    }
    if (!gender) { setError("Please select your gender"); return; }
    if (!collegeName) { setError("Please select your college"); return; }
    if (strength.score < 4) {
      setError("Password must satisfy all security rules.");
      return;
    }
    
    setBusy(true);
    try {
      const res = await api.post<RegisterResponse>("/api/auth/register", {
        email, password, fullName,
        phone: phone.trim() || null,
        gender,
        collegeName,
      });
      setResult(res.data);
      // If email was sent (otp is null) → go straight to OTP entry page
      if (!res.data.otp && !res.data.emailVerified) {
        setTimeout(() => navigate(`/auth/verify-otp?email=${encodeURIComponent(email)}`), 1800);
      }
      // If auto-verified → go to login
      if (res.data.emailVerified && !res.data.otp) {
        setTimeout(() => navigate(`/auth/login?email=${encodeURIComponent(email)}`), 1800);
      }
    } catch (err: any) {
      setError(!err.response ? "Backend server is not running" : (err.response.data?.message ?? "Registration failed"));
    } finally {
      setBusy(false);
    }
  }

  function copyOtp() {
    if (result?.otp) {
      navigator.clipboard.writeText(result.otp).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }

  // ── Success screen ───────────────────────────────────────────────────────
  if (result) {
    return (
      <AuthShell
        title="Account created! 🎉"
        subtitle={result.message}
        sideTitle="One step away"
        sideBody="Verify your account to start booking and offering rides across Hyderabad campus routes."
      >
        <div className="space-y-5">
          {/* Normal flow: email OTP sent */}
          {!result.otp && !result.emailVerified && (
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-6 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100">
                <Mail className="h-7 w-7 text-indigo-600" />
              </div>
              <p className="font-semibold text-indigo-900">Check your email!</p>
              <p className="mt-1 text-sm text-indigo-700">
                We sent a 6-digit OTP to <strong>{email}</strong>
              </p>
              <p className="mt-1 text-xs text-indigo-500">Redirecting to OTP entry…</p>
            </div>
          )}

          {/* Auto-verified flow */}
          {result.emailVerified && !result.otp && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
              <CheckCircle2 className="mx-auto mb-2 h-10 w-10 text-emerald-500" />
              <p className="font-semibold text-emerald-900">Account verified!</p>
              <p className="mt-1 text-xs text-emerald-700">Redirecting to login…</p>
            </div>
          )}

          {/* Fallback: OTP shown on screen (only when MAIL_ENABLED=false) */}
          {result.otp && (
            <div className="rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 p-6 text-center shadow-sm">
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-indigo-500">
                Your verification OTP
              </p>
              <div className="my-3 flex items-center justify-center gap-2">
                {result.otp.split("").map((digit, i) => (
                  <span key={i}
                    className="flex h-12 w-10 items-center justify-center rounded-xl bg-white text-2xl font-bold text-indigo-700 shadow ring-1 ring-indigo-200">
                    {digit}
                  </span>
                ))}
              </div>
              <button onClick={copyOtp}
                className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700">
                {copied ? <><CheckCircle2 className="h-3.5 w-3.5" /> Copied!</> : <><Copy className="h-3.5 w-3.5" /> Copy OTP</>}
              </button>
              <p className="mt-2 text-xs text-slate-500">Valid for 30 minutes</p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button type="button" className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-3 transition shadow-md flex items-center justify-center gap-1.5"
              onClick={() => navigate(`/auth/verify-otp?email=${encodeURIComponent(email)}`)}>
              Enter OTP <ArrowRight className="h-4 w-4" />
            </button>
            <Link to={`/auth/login?email=${encodeURIComponent(email)}`}
              className="block text-center text-sm font-semibold text-blue-600 hover:underline">
              Already verified? Go to Login
            </Link>
          </div>
        </div>
      </AuthShell>
    );
  }

  // ── Signup form ───────────────────────────────────────────────────────────
  return (
    <AuthShell
      title="Create your account"
      subtitle="Join the verified campus mobility network."
      sideTitle="Join the movement"
      sideBody="Save money, meet verified campus commuters, and travel sustainably across Hyderabad. Any verified student can offer or book rides — no separate driver account needed."
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <FloatingInput
          label="Full name"
          icon={User}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />

        <FloatingInput
          label="Email"
          icon={Mail}
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (emailError) setEmailError(null);
          }}
          onBlur={checkEmailDuplicate}
          error={emailError}
          required
        />

        <FloatingInput
          label="Phone (mobile)"
          icon={Phone}
          type="tel"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            if (phoneError) setPhoneError(null);
          }}
          onBlur={checkPhoneDuplicate}
          error={phoneError}
          required
        />

        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">
            Gender
          </label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-950 outline-none shadow-xs hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition"
            required
          >
            <option value="" disabled>Select Gender</option>
            <option value="FEMALE">Female</option>
            <option value="MALE">Male</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <CollegeSelector
          value={collegeName}
          onChange={setCollegeName}
        />

        <FloatingInput
          label="Password (min 8 chars)"
          icon={Lock}
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-slate-400 hover:text-slate-600 transition p-1"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        />

        {password && (
          <div className="space-y-1.5 px-1">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
              <span>PASSWORD STRENGTH</span>
              <span className="uppercase tracking-wider font-extrabold">{strength.label}</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-300 ${strength.color}`} />
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[9px] font-bold text-slate-400">
              <span className={password.length >= 8 ? "text-emerald-600" : ""}>✓ Min 8 characters</span>
              <span className={/[A-Z]/.test(password) ? "text-emerald-600" : ""}>✓ 1 uppercase letter</span>
              <span className={/[a-z]/.test(password) ? "text-emerald-600" : ""}>✓ 1 lowercase letter</span>
              <span className={/\d/.test(password) ? "text-emerald-600" : ""}>✓ 1 number</span>
            </div>
          </div>
        )}

        {error && <div className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 p-3 rounded-xl">{error}</div>}

        <button
          disabled={busy}
          type="submit"
          className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm py-3.5 transition shadow-lg hover:shadow-indigo-500/10 active:scale-[0.98]"
        >
          {busy ? "Creating..." : "Create account"}
        </button>
      </form>
      <div className="mt-5 text-sm text-slate-600 text-center sm:text-left">
        Already have an account?{" "}
        <Link className="font-semibold text-blue-600 hover:underline" to="/auth/login">Login</Link>
      </div>
    </AuthShell>
  );
}
