import { Link } from "react-router-dom";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-0 group select-none ${className}`}>
      {/* Orange S with Car Cutout SVG */}
      <span className="relative inline-flex items-center justify-center shrink-0 scale-90 sm:scale-100 origin-left" style={{ width: 44, height: 52 }}>
        <svg viewBox="0 0 44 52" width="44" height="52" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform duration-300 group-hover:scale-105">
          {/* Orange S letter */}
          <text
            x="2" y="46"
            fontFamily="'Georgia', 'Times New Roman', serif"
            fontWeight="900"
            fontSize="54"
            fill="#f04e12"
            letterSpacing="-4"
          >S</text>
          {/* Car silhouette cutout — white car body */}
          <rect x="4" y="22" width="36" height="10" rx="3" fill="white" opacity="0.95"/>
          {/* Car roof */}
          <rect x="10" y="16" width="20" height="9" rx="3" fill="white" opacity="0.95"/>
          {/* Windshield (slight tint) */}
          <rect x="11" y="17" width="8" height="7" rx="1.5" fill="#f0e8e0" opacity="0.8"/>
          <rect x="21" y="17" width="8" height="7" rx="1.5" fill="#f0e8e0" opacity="0.8"/>
          {/* Left wheel */}
          <circle cx="12" cy="32" r="4.5" fill="#1a1a1a"/>
          <circle cx="12" cy="32" r="2" fill="#888"/>
          {/* Right wheel */}
          <circle cx="32" cy="32" r="4.5" fill="#1a1a1a"/>
          <circle cx="32" cy="32" r="2" fill="#888"/>
          {/* Horizontal speed stripe */}
          <rect x="0" y="27" width="44" height="2" fill="#f04e12" opacity="0.25"/>
        </svg>
      </span>

      {/* Typography: "hare" in black, "FARE" in orange, "HYDERABAD CAMPUS RIDES" in grey */}
      <div className="ml-0.5 leading-none">
        <div className="flex items-baseline gap-0">
          <span className="text-[22px] font-black tracking-tight text-slate-900" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.03em" }}>
            hare
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-black tracking-[0.06em] text-[#f04e12]" style={{ fontFamily: "'Inter', sans-serif" }}>
            FARE
          </span>
          <span className="hidden text-[9px] font-bold tracking-[0.12em] text-slate-400 sm:block" style={{ fontFamily: "'Inter', sans-serif" }}>
            HYDERABAD CAMPUS RIDES
          </span>
        </div>
      </div>
    </Link>
  );
}
