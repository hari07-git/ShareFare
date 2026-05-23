import { Link } from "react-router-dom";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2 group select-none ${className}`}>
      {/* Premium Venn-Gradient Intersecting Rings Logo */}
      <svg viewBox="0 0 32 32" width="32" height="32" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 transition-transform duration-300 group-hover:scale-105">
        <circle cx="12" cy="16" r="8" fill="url(#orange-grad)" opacity="0.9" />
        <circle cx="20" cy="16" r="8" fill="url(#blue-grad)" opacity="0.9" style={{ mixBlendMode: "multiply" }} />
        <defs>
          <linearGradient id="orange-grad" x1="4" y1="8" x2="20" y2="24" gradientUnits="userSpaceOnUse">
            <stop stopColor="#f04e12" />
            <stop stopColor="#ff7a00" />
          </linearGradient>
          <linearGradient id="blue-grad" x1="12" y1="8" x2="28" y2="24" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2563eb" />
            <stop stopColor="#4f46e5" />
          </linearGradient>
        </defs>
      </svg>
      {/* Modern Typography */}
      <span className="text-xl font-black tracking-tight leading-none" style={{ fontFamily: "'Inter', sans-serif" }}>
        <span className="text-[#f04e12]">Share</span>
        <span className="text-[#2563eb]">Fare</span>
      </span>
    </Link>
  );
}
